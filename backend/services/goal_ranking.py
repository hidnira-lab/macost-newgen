from datetime import date

from supabase import Client

from services.goal_progress import compute_goal_progress
from services.saving_capacity import compute_monthly_saving_capacity
from services.saw_engine import GoalSAWInput, GoalSAWResult, rank_goals
from services.saw_weights import get_user_saw_weights_fraction


def rank_user_goals(db: Client, pengguna_id: str) -> list[GoalSAWResult]:
    """Fetch goal + progress lalu jalankan lewat services.saw_engine.rank_goals
    (bukan reimplementasi SAW di sini) supaya guard 0-goal/1-goal/same-deadline
    yang sudah di-unit-test tetap berlaku di jalur produksi."""
    goals_with_progress = compute_goal_progress(db, pengguna_id)
    if not goals_with_progress:
        return []

    capacity = compute_monthly_saving_capacity(db, pengguna_id)
    weights = get_user_saw_weights_fraction(db, pengguna_id)
    saw_inputs = [
        GoalSAWInput(
            goal_id=g["id"],
            nama_goal=g["nama_goal"],
            nominal_target=g["nominal_target"],
            current_saved=g["current_saved"],
            deadline=date.fromisoformat(g["deadline"]),
            skor_keinginan=g["skor_keinginan"],
            skor_kepentingan=g["skor_kepentingan"],
            monthly_saving_capacity=capacity,
        )
        for g in goals_with_progress
    ]
    return rank_goals(saw_inputs, weights=weights)
