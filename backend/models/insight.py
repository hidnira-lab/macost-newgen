from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel

InsightTipe = Literal["positive", "warning", "info", "tip"]


class InsightCard(BaseModel):
    title: str
    body: str
    tipe: InsightTipe


class InsightResponse(BaseModel):
    insights: list[InsightCard]
    generated_at: Optional[datetime] = None
