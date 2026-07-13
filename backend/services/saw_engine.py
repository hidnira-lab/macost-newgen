from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date

CRITERIA_WEIGHTS = {
    "personal_importance": 0.225,
    "progress_gap": 0.219,
    "saving_capacity": 0.215,
    "urgency": 0.178,
    "target_amount": 0.162,
}


@dataclass
class GoalSAWInput:
    goal_id: str
    nama_goal: str
    nominal_target: float
    current_saved: float
    deadline: date
    skor_keinginan: int
    skor_kepentingan: int
    monthly_saving_capacity: float


@dataclass
class GoalSAWResult:
    goal_id: str
    nama_goal: str
    score: float
    rank: int
    criteria_scores: dict[str, float] = field(default_factory=dict)


def _normalize_benefit(values: list[float]) -> list[float]:
    """Larger raw value -> higher normalized score. Guards against all-zero input."""
    max_val = max(values) if values else 0
    if max_val == 0:
        return [0.0 for _ in values]
    return [v / max_val for v in values]


def _normalize_cost(values: list[float]) -> list[float]:
    """Smaller raw value -> higher normalized score. A value of 0 (e.g. deadline
    today/overdue) is treated as maximally urgent instead of dividing by zero."""
    positive = [v for v in values if v > 0]
    min_val = min(positive) if positive else 0
    result = []
    for v in values:
        if v <= 0:
            result.append(1.0)
        elif min_val == 0:
            result.append(0.0)
        else:
            result.append(min_val / v)
    return result


def rank_goals(
    goals: list[GoalSAWInput],
    today: date | None = None,
    weights: dict[str, float] | None = None,
) -> list[GoalSAWResult]:
    """Rank goals using Simple Additive Weighting (SAW) across 5 criteria.

    `weights` defaults to the fixed CRITERIA_WEIGHTS but callers (see
    services/saw_weights.py) may pass a per-user override fetched from the
    pengaturan_saw table, so this function's own default behavior — and
    every existing caller that doesn't pass weights — is unchanged."""
    weights = weights or CRITERIA_WEIGHTS
    if not goals:
        return []

    today = today or date.today()

    if len(goals) == 1:
        g = goals[0]
        criteria_scores = {key: 1.0 for key in weights}
        score = sum(weights[k] * v for k, v in criteria_scores.items())
        return [
            GoalSAWResult(
                goal_id=g.goal_id,
                nama_goal=g.nama_goal,
                score=round(score, 4),
                rank=1,
                criteria_scores=criteria_scores,
            )
        ]

    personal_importance_raw = [(g.skor_keinginan + g.skor_kepentingan) / 2 for g in goals]
    progress_gap_raw = [
        ((g.nominal_target - g.current_saved) / g.nominal_target) if g.nominal_target > 0 else 0.0
        for g in goals
    ]
    remaining_raw = [max(g.nominal_target - g.current_saved, 0.0) for g in goals]
    saving_capacity_raw = [
        (g.monthly_saving_capacity / remaining) if remaining > 0 else g.monthly_saving_capacity
        for g, remaining in zip(goals, remaining_raw)
    ]
    urgency_days_raw = [max((g.deadline - today).days, 0) for g in goals]
    target_amount_raw = [g.nominal_target for g in goals]

    norm_personal_importance = _normalize_benefit(personal_importance_raw)
    norm_progress_gap = _normalize_benefit(progress_gap_raw)
    norm_saving_capacity = _normalize_benefit(saving_capacity_raw)
    norm_urgency = _normalize_cost(urgency_days_raw)
    norm_target_amount = _normalize_benefit(target_amount_raw)

    results: list[GoalSAWResult] = []
    for i, g in enumerate(goals):
        criteria_scores = {
            "personal_importance": norm_personal_importance[i],
            "progress_gap": norm_progress_gap[i],
            "saving_capacity": norm_saving_capacity[i],
            "urgency": norm_urgency[i],
            "target_amount": norm_target_amount[i],
        }
        score = sum(weights[k] * v for k, v in criteria_scores.items())
        results.append(
            GoalSAWResult(
                goal_id=g.goal_id,
                nama_goal=g.nama_goal,
                score=round(score, 4),
                rank=0,
                criteria_scores=criteria_scores,
            )
        )

    results.sort(key=lambda r: r.score, reverse=True)
    for idx, r in enumerate(results, start=1):
        r.rank = idx

    return results
