from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from core.security import CurrentUser, get_current_user, get_user_client
from models.alokasi import (
    Alokasi,
    AllocationConfirmRequest,
    AllocationSuggestion,
    AllocationSuggestRequest,
)
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
    """Hanya MENGHITUNG saran, tidak menulis apa pun ke tabel alokasi.
    Eksekusi alokasi hanya boleh terjadi lewat POST /confirm yang dipicu klik
    user secara eksplisit di frontend (suggest-and-confirm, tidak pernah
    auto-execute)."""
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

    return AllocationSuggestion(
        transaksi_id=txn["id"],
        has_goal=True,
        goal_id=top.goal_id,
        nama_goal=top.nama_goal,
        nominal_alokasi_disarankan=suggested_nominal,
        persentase=persentase,
        pesan=f"Side income masuk. Goal prioritas tertinggi saat ini: {top.nama_goal}.",
    )


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
    return insert_result.data[0]
