from datetime import date, timedelta

from services.saw_engine import (
    GoalSAWInput,
    _normalize_benefit,
    _normalize_cost,
    rank_goals,
)


def _goal(
    goal_id="g1",
    nama_goal="Goal",
    nominal_target=1_000_000.0,
    current_saved=0.0,
    deadline=None,
    skor_keinginan=5,
    skor_kepentingan=5,
    monthly_saving_capacity=100_000.0,
):
    return GoalSAWInput(
        goal_id=goal_id,
        nama_goal=nama_goal,
        nominal_target=nominal_target,
        current_saved=current_saved,
        deadline=deadline or date(2027, 1, 1),
        skor_keinginan=skor_keinginan,
        skor_kepentingan=skor_kepentingan,
        monthly_saving_capacity=monthly_saving_capacity,
    )


class TestNormalizeBenefit:
    def test_scales_relative_to_max(self):
        assert _normalize_benefit([50.0, 100.0, 25.0]) == [0.5, 1.0, 0.25]

    def test_all_zero_does_not_divide_by_zero(self):
        assert _normalize_benefit([0.0, 0.0]) == [0.0, 0.0]

    def test_empty_list(self):
        assert _normalize_benefit([]) == []


class TestNormalizeCost:
    def test_smaller_value_scores_higher(self):
        result = _normalize_cost([10.0, 5.0, 20.0])
        assert result[1] > result[0] > result[2]

    def test_zero_or_negative_treated_as_maximally_urgent(self):
        result = _normalize_cost([0.0, 10.0])
        assert result[0] == 1.0

    def test_min_value_zero_among_positive_and_nonpositive_mix(self):
        # Documents the guard in the source: if the minimum *positive* value
        # is 0 this branch can't actually be hit (0 is filtered into the
        # `v <= 0` branch), but zeroes elsewhere must not raise or skew others.
        result = _normalize_cost([0.0, 0.0, 5.0])
        assert result == [1.0, 1.0, 1.0]


class TestRankGoalsGuardCases:
    def test_empty_list_returns_empty(self):
        assert rank_goals([]) == []

    def test_single_goal_gets_rank_one_and_full_score_on_every_criterion(self):
        [result] = rank_goals([_goal()])
        assert result.rank == 1
        assert all(v == 1.0 for v in result.criteria_scores.values())

    def test_two_goals_with_identical_deadline_does_not_crash(self):
        today = date.today()
        same_deadline = today + timedelta(days=30)
        goals = [
            _goal(goal_id="a", deadline=same_deadline),
            _goal(goal_id="b", deadline=same_deadline),
        ]
        results = rank_goals(goals, today=today)
        assert {r.rank for r in results} == {1, 2}

    def test_progress_gap_does_not_divide_by_zero_when_target_is_zero(self):
        goals = [
            _goal(goal_id="a", nominal_target=0.0, current_saved=0.0),
            _goal(goal_id="b", nominal_target=1_000_000.0, current_saved=0.0),
        ]
        # Should not raise ZeroDivisionError.
        rank_goals(goals)

    def test_saving_capacity_does_not_divide_by_zero_when_goal_already_funded(self):
        goals = [
            _goal(goal_id="a", nominal_target=100.0, current_saved=100.0),
            _goal(goal_id="b", nominal_target=100.0, current_saved=0.0),
        ]
        # remaining == 0 for goal "a" -- should not raise.
        rank_goals(goals)


class TestRankGoalsWeightBehavior:
    """Mirrors the manual verification recorded in STATUS.md: two goals
    engineered so the ranking flips depending on which criterion dominates."""

    def _competing_goals(self, today):
        near_deadline_low_importance = _goal(
            goal_id="urgent",
            deadline=today + timedelta(days=5),
            skor_keinginan=1,
            skor_kepentingan=1,
        )
        far_deadline_high_importance = _goal(
            goal_id="important",
            deadline=today + timedelta(days=300),
            skor_keinginan=10,
            skor_kepentingan=10,
        )
        return [near_deadline_low_importance, far_deadline_high_importance]

    def test_urgency_only_weight_ranks_near_deadline_goal_first(self):
        today = date.today()
        weights = {
            "personal_importance": 0.0,
            "progress_gap": 0.0,
            "saving_capacity": 0.0,
            "urgency": 1.0,
            "target_amount": 0.0,
        }
        results = rank_goals(self._competing_goals(today), today=today, weights=weights)
        winner = next(r for r in results if r.rank == 1)
        assert winner.goal_id == "urgent"

    def test_importance_only_weight_ranks_high_importance_goal_first(self):
        today = date.today()
        weights = {
            "personal_importance": 1.0,
            "progress_gap": 0.0,
            "saving_capacity": 0.0,
            "urgency": 0.0,
            "target_amount": 0.0,
        }
        results = rank_goals(self._competing_goals(today), today=today, weights=weights)
        winner = next(r for r in results if r.rank == 1)
        assert winner.goal_id == "important"

    def test_default_weights_are_used_when_none_passed(self):
        today = date.today()
        with_default = rank_goals(self._competing_goals(today), today=today)
        with_explicit_default = rank_goals(
            self._competing_goals(today), today=today, weights=None
        )
        assert [r.goal_id for r in with_default] == [r.goal_id for r in with_explicit_default]
