from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class GoalBase(BaseModel):
    nama_goal: str
    nominal_target: float = Field(gt=0)
    deadline: date
    skor_keinginan: int = Field(ge=1, le=5)
    skor_kepentingan: int = Field(ge=1, le=5)


class GoalCreate(GoalBase):
    pass


class Goal(GoalBase):
    id: str
    pengguna_id: str


class GoalUpdate(BaseModel):
    nama_goal: Optional[str] = None
    nominal_target: Optional[float] = Field(default=None, gt=0)
    deadline: Optional[date] = None
    skor_keinginan: Optional[int] = Field(default=None, ge=1, le=5)
    skor_kepentingan: Optional[int] = Field(default=None, ge=1, le=5)


class GoalWithProgress(Goal):
    current_saved: float
    progress_percent: float


class GoalRankingItem(BaseModel):
    goal_id: str
    nama_goal: str
    score: float
    rank: int
    criteria_scores: dict[str, float]
