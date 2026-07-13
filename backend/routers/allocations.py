from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from core.security import CurrentUser, get_current_user, get_user_client
from models.alokasi import (
    Alokasi,
    AllocationConfirmRequest,
    AllocationPending,
    AllocationSuggestion,
    AllocationSuggestRequest,
)
from services.goal_progress import compute_goal_progress
from services.goal_ranking import rank_user_goals

router = APIRouter(prefix="/allocations", tags=["allocations"])

# Spek: "saran alokasi (30-40% dari nominal)" — 35% dipakai sebagai titik
# tengah range tsb untuk satu angka saran yang deterministik. User tetap bisa
# mengubah nominal ini sebelum konfirmasi (lihat /confirm).
SUGGESTED_ALLOCATION_PERCENT = 0.35


@router.post("/suggest", response_model=AllocationSuggestion)
def suggest_allocation(
    payload: AllocationSuggestRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_user_client),
):
    """MENGHITUNG saran dan menyimpannya sebagai baris 'pending' di
    saran_alokasi (lihat GET/DELETE /pending) — tapi tetap tidak menulis apa
    pun ke tabel alokasi itu sendiri. Eksekusi alokasi hanya boleh terjadi
    lewat POST /confirm yang dipicu klik user secara eksplisit di frontend
    (suggest-and-confirm, tidak pernah auto-execute)."""
    txn_result = (
        db.table("transaksi")
        .select("id, tipe_transaksi, nominal, kategori(flag_pemasukan)")
        .eq("id", payload.transaksi_id)
        .execute()
    )
    if not txn_result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaksi tidak ditemukan")
    txn = txn_result.data[0]

    kategori = txn.get("kategori") or {}
    if txn["tipe_transaksi"] != "Pemasukan" or kategori.get("flag_pemasukan") != "Flexible Side Income":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Smart allocation hanya berlaku untuk pemasukan dengan source Flexible Side Income",
        )

    persentase = int(SUGGESTED_ALLOCATION_PERCENT * 100)
    ranked = rank_user_goals(db, current_user.id)

    if not ranked:
        return AllocationSuggestion(
            transaksi_id=txn["id"],
            has_goal=False,
            goal_id=None,
            nama_goal=None,
            nominal_alokasi_disarankan=0,
            persentase=persentase,
            pesan="Belum ada goal aktif. Buat goal dulu supaya Macost bisa menyarankan alokasi.",
        )

    top = ranked[0]
    suggested_nominal = round(txn["nominal"] * SUGGESTED_ALLOCATION_PERCENT, 2)
    pesan = f"Side income masuk. Goal prioritas tertinggi saat ini: {top.nama_goal}."

    # Upsert keyed by transaksi_id so re-calling /suggest for the same
    # transaction (e.g. a page refresh right after creating it) refreshes the
    # existing pending row instead of creating a duplicate.
    db.table("saran_alokasi").upsert(
        {
            "transaksi_id": txn["id"],
            "goal_id": top.goal_id,
            "pengguna_id": current_user.id,
            "nominal_alokasi_disarankan": suggested_nominal,
            "persentase": persentase,
            "pesan": pesan,
            "status": "pending",
        },
        on_conflict="transaksi_id",
    ).execute()

    return AllocationSuggestion(
        transaksi_id=txn["id"],
        has_goal=True,
        goal_id=top.goal_id,
        nama_goal=top.nama_goal,
        nominal_alokasi_disarankan=suggested_nominal,
        persentase=persentase,
        pesan=pesan,
    )


@router.get("/pending", response_model=list[AllocationPending])
def list_pending_allocations(
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_user_client),
):
    result = (
        db.table("saran_alokasi")
        .select("*, goal(nama_goal)")
        .eq("pengguna_id", current_user.id)
        .eq("status", "pending")
        .order("created_at", desc=True)
        .execute()
    )
    rows = result.data or []
    if not rows:
        return []

    progress_by_goal = {g["id"]: g for g in compute_goal_progress(db, current_user.id)}

    pending: list[AllocationPending] = []
    for row in rows:
        goal = row.get("goal") or {}
        progress = progress_by_goal.get(row["goal_id"])
        pending.append(
            AllocationPending(
                id=row["id"],
                transaksi_id=row["transaksi_id"],
                goal_id=row["goal_id"],
                nama_goal=goal.get("nama_goal", ""),
                nominal_alokasi_disarankan=row["nominal_alokasi_disarankan"],
                persentase=row["persentase"],
                pesan=row["pesan"],
                created_at=row["created_at"],
                current_saved=progress["current_saved"] if progress else 0.0,
                nominal_target=progress["nominal_target"] if progress else 0.0,
                progress_percent=progress["progress_percent"] if progress else 0.0,
            )
        )
    return pending


@router.delete("/pending", status_code=status.HTTP_204_NO_CONTENT)
def dismiss_all_pending_allocations(
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_user_client),
):
    """'Hapus Semua' — menandai semua saran pending milik user sebagai
    dismissed, bukan menghapus baris (jejak riwayat tetap ada di DB)."""
    db.table("saran_alokasi").update({"status": "dismissed"}).eq("pengguna_id", current_user.id).eq(
        "status", "pending"
    ).execute()
    return None


@router.post("/confirm", response_model=Alokasi, status_code=status.HTTP_201_CREATED)
def confirm_allocation(
    payload: AllocationConfirmRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_user_client),
):
    """Satu-satunya endpoint yang benar-benar menulis ke tabel alokasi —
    hanya dipanggil setelah user klik konfirmasi di modal saran."""
    txn_result = db.table("transaksi").select("id, nominal").eq("id", payload.transaksi_id).execute()
    if not txn_result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaksi tidak ditemukan")
    txn = txn_result.data[0]

    goal_result = db.table("goal").select("id").eq("id", payload.goal_id).execute()
    if not goal_result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal tidak ditemukan")

    existing_alloc = (
        db.table("alokasi").select("nominal_alokasi").eq("transaksi_id", payload.transaksi_id).execute()
    )
    already_allocated = sum(r["nominal_alokasi"] for r in (existing_alloc.data or []))
    if already_allocated + payload.nominal_alokasi > txn["nominal"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nominal alokasi melebihi nominal transaksi yang tersedia",
        )

    insert_result = (
        db.table("alokasi")
        .insert(
            {
                "nominal_alokasi": payload.nominal_alokasi,
                "tanggal_alokasi": date.today().isoformat(),
                "transaksi_id": payload.transaksi_id,
                "goal_id": payload.goal_id,
            }
        )
        .execute()
    )
    if not insert_result.data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Gagal menyimpan alokasi")

    # Best-effort: clear the pending suggestion this confirmation came from,
    # if any (a transaction never suggested — e.g. a future direct-allocation
    # flow — simply won't match any row here, which is fine).
    db.table("saran_alokasi").update({"status": "confirmed"}).eq(
        "transaksi_id", payload.transaksi_id
    ).eq("status", "pending").execute()

    return insert_result.data[0]
