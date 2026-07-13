from fastapi import APIRouter, Depends
from supabase import Client

from core.security import CurrentUser, get_current_user, get_user_client
from models.saw_weights import SAWWeights
from services.saw_weights import get_user_saw_weights_percent

router = APIRouter(prefix="/saw-weights", tags=["saw-weights"])


@router.get("", response_model=SAWWeights)
def get_weights(
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_user_client),
):
    return SAWWeights(**get_user_saw_weights_percent(db, current_user.id))


@router.put("", response_model=SAWWeights)
def update_weights(
    payload: SAWWeights,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_user_client),
):
    db.table("pengaturan_saw").upsert({**payload.model_dump(), "pengguna_id": current_user.id}).execute()
    return payload
