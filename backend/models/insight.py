from typing import Literal

from pydantic import BaseModel

InsightTipe = Literal["positive", "warning", "info", "tip"]


class InsightCard(BaseModel):
    title: str
    body: str
    tipe: InsightTipe


class InsightResponse(BaseModel):
    insights: list[InsightCard]
