from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from core.security import CurrentUser, get_current_user, get_user_client
from models.dompet import Dompet, DompetCreate, DompetUpdate

router = APIRouter(prefix="/wallets", tags=["wallets"])


@router.get("", response_model=list[Dompet])
def list_wallets(
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_user_client),
):
    result = (
        db.table("dompet")
        .select("*")
        .eq("pengguna_id", current_user.id)
        .order("created_at")
        .execute()
    )
    return result.data


@router.post("", response_model=Dompet, status_code=status.HTTP_201_CREATED)
def create_wallet(
    payload: DompetCreate,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_user_client),
):
    insert_result = (
        db.table("dompet")
        .insert(
            {
                "nama_dompet": payload.nama_dompet,
                "icon": payload.icon,
                "warna": payload.warna,
                "saldo": payload.saldo,
                "pengguna_id": current_user.id,
            }
        )
        .execute()
    )
    if not insert_result.data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Gagal membuat dompet")
    return insert_result.data[0]


@router.put("/{dompet_id}", response_model=Dompet)
def update_wallet(
    dompet_id: str,
    payload: DompetUpdate,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_user_client),
):
    update_fields = payload.model_dump(exclude_none=True)
    if not update_fields:
        existing = db.table("dompet").select("*").eq("id", dompet_id).execute()
        if not existing.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dompet tidak ditemukan")
        return existing.data[0]

    result = db.table("dompet").update(update_fields).eq("id", dompet_id).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dompet tidak ditemukan")
    return result.data[0]


@router.delete("/{dompet_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_wallet(
    dompet_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_user_client),
):
    existing = db.table("dompet").select("id").eq("id", dompet_id).execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dompet tidak ditemukan")

    # dompet_id on transaksi is `on delete cascade` — block deletion instead
    # of silently wiping a user's transaction history out from under them.
    linked_txns = db.table("transaksi").select("id").eq("dompet_id", dompet_id).limit(1).execute()
    if linked_txns.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Dompet tidak bisa dihapus karena masih memiliki transaksi terkait.",
        )

    db.table("dompet").delete().eq("id", dompet_id).execute()
    return None
