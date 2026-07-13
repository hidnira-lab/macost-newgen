from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from core.security import CurrentUser, get_current_user, get_user_client
from core.supabase_client import get_service_client, get_supabase
from models.pengguna import Pengguna, PenggunaCreate, PenggunaLogin, PenggunaUpdateRequest

router = APIRouter(prefix="/auth", tags=["auth"])

DEFAULT_WALLET_NAME = "Dompet Utama"


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: PenggunaCreate):
    client = get_supabase()
    try:
        result = client.auth.sign_up(
            {
                "email": payload.email,
                "password": payload.password,
                "options": {"data": {"nama": payload.nama}},
            }
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    if result.user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Registrasi gagal")

    # Trigger di DB sudah membuat baris `pengguna`; wallet default dibuat di sini
    # lewat service role karena user belum tentu punya session aktif (mis. kalau
    # konfirmasi email masih diwajibkan di pengaturan project).
    service = get_service_client()
    service.table("dompet").insert(
        {"nama_dompet": DEFAULT_WALLET_NAME, "saldo": 0, "pengguna_id": result.user.id}
    ).execute()

    session = result.session
    return {
        "user": {"id": result.user.id, "email": result.user.email, "nama": payload.nama},
        "access_token": session.access_token if session else None,
        "refresh_token": session.refresh_token if session else None,
        "email_confirmation_required": session is None,
    }


@router.post("/login")
def login(payload: PenggunaLogin):
    client = get_supabase()
    try:
        result = client.auth.sign_in_with_password(
            {"email": payload.email, "password": payload.password}
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Email atau password salah"
        ) from exc

    if result.user is None or result.session is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email atau password salah")

    profile = client.table("pengguna").select("nama, email").eq("id", result.user.id).execute()
    nama = profile.data[0]["nama"] if profile.data else None

    return {
        "user": {"id": result.user.id, "email": result.user.email, "nama": nama},
        "access_token": result.session.access_token,
        "refresh_token": result.session.refresh_token,
    }


@router.post("/logout")
def logout(current_user: CurrentUser = Depends(get_current_user)):
    service = get_service_client()
    try:
        service.auth.admin.sign_out(current_user.access_token)
    except Exception:
        pass
    return {"status": "logged out"}


@router.get("/me", response_model=Pengguna)
def me(
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_user_client),
):
    result = db.table("pengguna").select("id, nama, email, telepon, kota").eq("id", current_user.id).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profil tidak ditemukan")
    return result.data[0]


@router.patch("/me", response_model=Pengguna)
def update_me(
    payload: PenggunaUpdateRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_user_client),
):
    update_fields = payload.model_dump(exclude_none=True)
    if update_fields:
        db.table("pengguna").update(update_fields).eq("id", current_user.id).execute()
    result = db.table("pengguna").select("id, nama, email, telepon, kota").eq("id", current_user.id).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profil tidak ditemukan")
    return result.data[0]
