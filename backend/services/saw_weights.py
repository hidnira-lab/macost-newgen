from supabase import Client

from services.saw_engine import CRITERIA_WEIGHTS

# The pengaturan_saw table stores weights as 0-100 percentages (matching the
# Goal Prioritization screen's sliders); saw_engine.rank_goals expects 0-1
# fractions, so this is the single place that converts between the two.
DEFAULT_WEIGHTS_PERCENT = {key: round(value * 100, 2) for key, value in CRITERIA_WEIGHTS.items()}


def get_user_saw_weights_percent(db: Client, pengguna_id: str) -> dict[str, float]:
    """Returns the user's saved weights as 0-100 percentages, or the system
    default if they've never customized them (no row created just by reading)."""
    result = db.table("pengaturan_saw").select("*").eq("pengguna_id", pengguna_id).execute()
    if not result.data:
        return dict(DEFAULT_WEIGHTS_PERCENT)
    row = result.data[0]
    return {key: row[key] for key in CRITERIA_WEIGHTS}


def get_user_saw_weights_fraction(db: Client, pengguna_id: str) -> dict[str, float]:
    """Same as get_user_saw_weights_percent but converted to 0-1 fractions,
    ready to pass straight into services.saw_engine.rank_goals."""
    percent = get_user_saw_weights_percent(db, pengguna_id)
    return {key: value / 100 for key, value in percent.items()}
