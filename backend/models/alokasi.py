from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


class AlokasiBase(BaseModel):
    nominal_alokasi: float = Field(gt=0)
    tanggal_alokasi: date
    transaksi_id: str
    goal_id: str


class AlokasiCreate(AlokasiBase):
    pass


class Alokasi(AlokasiBase):
    id: str


class AllocationSuggestRequest(BaseModel):
    transaksi_id: str


class AllocationSuggestion(BaseModel):
    transaksi_id: str
    has_goal: bool
    goal_id: Optional[str] = None
    nama_goal: Optional[str] = None
    nominal_alokasi_disarankan: float
    persentase: int
    pesan: str


class AllocationConfirmRequest(BaseModel):
    transaksi_id: str
    goal_id: str
    nominal_alokasi: float = Field(gt=0)


class AllocationPending(BaseModel):
    id: str
    transaksi_id: str
    goal_id: str
    nama_goal: str
    nominal_alokasi_disarankan: float
    persentase: int
    pesan: str
    created_at: datetime
    current_saved: float
    nominal_target: float
    progress_percent: float
