from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from core.security import CurrentUser, get_current_user, get_user_client
from models.insight import InsightCard, InsightResponse
from services.insight_engine import GeminiError, generate_insights

router = APIRouter(prefix="/insights", tags=["insights"])


@router.post("/generate", response_model=InsightResponse)
def generate(
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_user_client),
):
    """One-shot insight generation (bukan chat) — dipicu klik user di
    frontend, bukan otomatis di setiap page load, karena tiap panggilan
    memakan waktu ~15-20 detik dan kuota Gemini API."""
    try:
        cards = generate_insights(db, current_user.id)
    except GeminiError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    return InsightResponse(insights=[InsightCard(**c) for c in cards])
