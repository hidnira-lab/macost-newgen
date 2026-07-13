from datetime import datetime, timezone

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
    memakan waktu ~15-20 detik dan kuota Gemini API. Hasilnya di-upsert ke
    insight_terakhir supaya GET /latest bisa mengembalikannya lagi tanpa
    panggilan Gemini baru (lihat get_latest di bawah)."""
    try:
        cards = generate_insights(db, current_user.id)
    except GeminiError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    generated_at = datetime.now(timezone.utc)
    db.table("insight_terakhir").upsert(
        {
            "pengguna_id": current_user.id,
            "insights": cards,
            "generated_at": generated_at.isoformat(),
        },
        on_conflict="pengguna_id",
    ).execute()

    return InsightResponse(insights=[InsightCard(**c) for c in cards], generated_at=generated_at)


@router.get("/latest", response_model=InsightResponse)
def get_latest(
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_user_client),
):
    """Insight batch terakhir yang tersimpan, dipakai frontend untuk
    memulihkan tampilan saat user kembali ke layar AI Assistant tanpa
    memicu panggilan Gemini baru."""
    result = (
        db.table("insight_terakhir").select("insights, generated_at").eq("pengguna_id", current_user.id).execute()
    )
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Belum ada insight tersimpan")

    row = result.data[0]
    return InsightResponse(
        insights=[InsightCard(**c) for c in row["insights"]],
        generated_at=row["generated_at"],
    )
