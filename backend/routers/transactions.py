from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from core.security import CurrentUser, get_current_user, get_user_client
from models.transaksi import TransaksiCreateRequest, TransaksiResponse, TransaksiUpdateRequest

router = APIRouter(prefix="/transactions", tags=["transactions"])

DEFAULT_WALLET_NAME = "Dompet Utama"
SELECT_WITH_KATEGORI = "*, kategori(nama_kategori, tipe, flag_pemasukan, flag_pengeluaran)"


def _get_or_create_wallet(db: Client, pengguna_id: str) -> dict:
    result = db.table("dompet").select("id, saldo").eq("pengguna_id", pengguna_id).limit(1).execute()
    if result.data:
        return result.data[0]
    created = (
        db.table("dompet")
        .insert({"nama_dompet": DEFAULT_WALLET_NAME, "saldo": 0, "pengguna_id": pengguna_id})
        .execute()
    )
    return created.data[0]


def _adjust_wallet_saldo(db: Client, dompet_id: str, current_saldo: float, delta: float) -> None:
    db.table("dompet").update({"saldo": current_saldo + delta}).eq("id", dompet_id).execute()


def _to_response(row: dict) -> TransaksiResponse:
    kategori = row.get("kategori") or {}
    tipe_transaksi = row["tipe_transaksi"]
    source = kategori.get("flag_pemasukan") if tipe_transaksi == "Pemasukan" else None
    return TransaksiResponse(
        id=row["id"],
        tipe_transaksi=tipe_transaksi,
        nominal=row["nominal"],
        tanggal=row["tanggal"],
        metode_input=row["metode_input"],
        pengguna_id=row["pengguna_id"],
        dompet_id=row["dompet_id"],
        kategori_id=row["kategori_id"],
        nama_kategori=kategori.get("nama_kategori", ""),
        source=source,
    )


@router.get("", response_model=list[TransaksiResponse])
def list_transactions(
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_user_client),
):
    result = (
        db.table("transaksi")
        .select(SELECT_WITH_KATEGORI)
        .eq("pengguna_id", current_user.id)
        .order("tanggal", desc=True)
        .execute()
    )
    return [_to_response(row) for row in result.data]


@router.post("", response_model=TransaksiResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    payload: TransaksiCreateRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_user_client),
):
    kategori_result = (
        db.table("kategori")
        .select("id, tipe, flag_pemasukan, nama_kategori")
        .eq("id", payload.kategori_id)
        .execute()
    )
    if not kategori_result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kategori tidak ditemukan")
    kategori = kategori_result.data[0]

    wallet = _get_or_create_wallet(db, current_user.id)

    insert_result = (
        db.table("transaksi")
        .insert(
            {
                "tipe_transaksi": kategori["tipe"],
                "nominal": payload.nominal,
                "tanggal": payload.tanggal.isoformat(),
                "metode_input": payload.metode_input,
                "pengguna_id": current_user.id,
                "dompet_id": wallet["id"],
                "kategori_id": payload.kategori_id,
            }
        )
        .execute()
    )
    if not insert_result.data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Gagal membuat transaksi")
    created = insert_result.data[0]

    delta = payload.nominal if kategori["tipe"] == "Pemasukan" else -payload.nominal
    _adjust_wallet_saldo(db, wallet["id"], wallet["saldo"], delta)

    # Smart allocation suggestion is intentionally not triggered here — the
    # frontend calls POST /allocations/suggest as a separate step after a
    # Flexible Side Income transaction is created, and only /allocations/confirm
    # (an explicit user click) ever writes to the alokasi table.

    created["kategori"] = kategori
    return _to_response(created)


@router.put("/{transaksi_id}", response_model=TransaksiResponse)
def update_transaction(
    transaksi_id: str,
    payload: TransaksiUpdateRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_user_client),
):
    existing_result = db.table("transaksi").select(SELECT_WITH_KATEGORI).eq("id", transaksi_id).execute()
    if not existing_result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaksi tidak ditemukan")
    existing = existing_result.data[0]

    wallet_result = db.table("dompet").select("id, saldo").eq("id", existing["dompet_id"]).execute()
    if not wallet_result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dompet tidak ditemukan")
    wallet = wallet_result.data[0]

    old_delta = existing["nominal"] if existing["tipe_transaksi"] == "Pemasukan" else -existing["nominal"]

    update_fields: dict = {}
    if payload.kategori_id is not None:
        kategori_result = (
            db.table("kategori")
            .select("id, tipe, flag_pemasukan, nama_kategori")
            .eq("id", payload.kategori_id)
            .execute()
        )
        if not kategori_result.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kategori tidak ditemukan")
        kategori = kategori_result.data[0]
        update_fields["kategori_id"] = payload.kategori_id
        update_fields["tipe_transaksi"] = kategori["tipe"]
    if payload.nominal is not None:
        update_fields["nominal"] = payload.nominal
    if payload.tanggal is not None:
        update_fields["tanggal"] = payload.tanggal.isoformat()
    if payload.metode_input is not None:
        update_fields["metode_input"] = payload.metode_input

    if update_fields:
        db.table("transaksi").update(update_fields).eq("id", transaksi_id).execute()

    new_nominal = update_fields.get("nominal", existing["nominal"])
    new_tipe = update_fields.get("tipe_transaksi", existing["tipe_transaksi"])
    new_delta = new_nominal if new_tipe == "Pemasukan" else -new_nominal

    _adjust_wallet_saldo(db, wallet["id"], wallet["saldo"], new_delta - old_delta)

    refreshed = db.table("transaksi").select(SELECT_WITH_KATEGORI).eq("id", transaksi_id).execute()
    return _to_response(refreshed.data[0])


@router.delete("/{transaksi_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaksi_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_user_client),
):
    existing_result = db.table("transaksi").select("*").eq("id", transaksi_id).execute()
    if not existing_result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaksi tidak ditemukan")
    existing = existing_result.data[0]

    wallet_result = db.table("dompet").select("id, saldo").eq("id", existing["dompet_id"]).execute()
    if wallet_result.data:
        wallet = wallet_result.data[0]
        reverse_delta = -existing["nominal"] if existing["tipe_transaksi"] == "Pemasukan" else existing["nominal"]
        _adjust_wallet_saldo(db, wallet["id"], wallet["saldo"], reverse_delta)

    db.table("transaksi").delete().eq("id", transaksi_id).execute()
    return None
