from collections import defaultdict

from supabase import Client


def compute_goal_progress(db: Client, pengguna_id: str) -> list[dict]:
    """Semua kolom goal + current_saved (sum alokasi) + progress_percent.
    Dipakai oleh routers/goals.py (list) dan routers/dashboard.py (KPI #2)
    supaya logika join goal<->alokasi tidak diduplikasi di dua tempat."""
    goal_result = (
        db.table("goal").select("*").eq("pengguna_id", pengguna_id).order("deadline").execute()
    )
    goals = goal_result.data or []
    if not goals:
        return []

    goal_ids = [g["id"] for g in goals]
    alokasi_result = db.table("alokasi").select("goal_id, nominal_alokasi").in_("goal_id", goal_ids).execute()
    saved_map: dict[str, float] = defaultdict(float)
    for row in alokasi_result.data or []:
        saved_map[row["goal_id"]] += row["nominal_alokasi"]

    progress = []
    for g in goals:
        saved = saved_map.get(g["id"], 0.0)
        target = g["nominal_target"]
        percent = min(saved / target, 1.0) * 100 if target > 0 else 0.0
        progress.append({**g, "current_saved": saved, "progress_percent": round(percent, 1)})
    return progress
