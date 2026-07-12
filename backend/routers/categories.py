from fastapi import APIRouter, Depends
from supabase import Client

from core.security import get_current_user, get_user_client
from models.kategori import Kategori

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[Kategori])
def list_categories(
    _: dict = Depends(get_current_user),
    db: Client = Depends(get_user_client),
):
    result = db.table("kategori").select("*").order("nama_kategori").execute()
    return result.data
