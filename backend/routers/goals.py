from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from core.security import CurrentUser, get_current_user, get_user_client
from models.goal import Goal, GoalCreate, GoalRankingItem, GoalUpdate, GoalWithProgress
from services.goal_progress import compute_goal_progress
from services.goal_ranking import rank_user_goals

router = APIRouter(prefix="/goals", tags=["goals"])


@router.get("", response_model=list[GoalWithProgress])
def list_goals(
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_user_client),
):
    return compute_goal_progress(db, current_user.id)


@router.get("/ranking", response_model=list[GoalRankingItem])
def get_ranking(
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_user_client),
):
    results = rank_user_goals(db, current_user.id)
    return [
        GoalRankingItem(
            goal_id=r.goal_id,
            nama_goal=r.nama_goal,
            score=r.score,
            rank=r.rank,
            criteria_scores=r.criteria_scores,
        )
        for r in results
    ]


@router.post("", response_model=Goal, status_code=status.HTTP_201_CREATED)
def create_goal(
    payload: GoalCreate,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_user_client),
):
    insert_result = (
        db.table("goal")
        .insert(
            {
                "nama_goal": payload.nama_goal,
                "nominal_target": payload.nominal_target,
                "deadline": payload.deadline.isoformat(),
                "skor_keinginan": payload.skor_keinginan,
                "skor_kepentingan": payload.skor_kepentingan,
                "pengguna_id": current_user.id,
            }
        )
        .execute()
    )
    if not insert_result.data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Gagal membuat goal")
    return insert_result.data[0]


@router.put("/{goal_id}", response_model=Goal)
def update_goal(
    goal_id: str,
    payload: GoalUpdate,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_user_client),
):
    update_fields: dict = {}
    if payload.nama_goal is not None:
        update_fields["nama_goal"] = payload.nama_goal
    if payload.nominal_target is not None:
        update_fields["nominal_target"] = payload.nominal_target
    if payload.deadline is not None:
        update_fields["deadline"] = payload.deadline.isoformat()
    if payload.skor_keinginan is not None:
        update_fields["skor_keinginan"] = payload.skor_keinginan
    if payload.skor_kepentingan is not None:
        update_fields["skor_kepentingan"] = payload.skor_kepentingan

    if not update_fields:
        existing = db.table("goal").select("*").eq("id", goal_id).execute()
        if not existing.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal tidak ditemukan")
        return existing.data[0]

    result = db.table("goal").update(update_fields).eq("id", goal_id).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal tidak ditemukan")
    return result.data[0]


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_user_client),
):
    existing = db.table("goal").select("id").eq("id", goal_id).execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal tidak ditemukan")
    db.table("goal").delete().eq("id", goal_id).execute()
    return None
