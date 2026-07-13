from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field

WalletIcon = Literal["Banknote", "Smartphone", "Building2", "Landmark", "CreditCard", "GraduationCap"]

HEX_COLOR_PATTERN = r"^#[0-9A-Fa-f]{6}$"


class DompetBase(BaseModel):
    nama_dompet: str = Field(min_length=1)
    icon: WalletIcon = "Banknote"
    warna: str = Field(default="#22C55E", pattern=HEX_COLOR_PATTERN)


class DompetCreate(DompetBase):
    saldo: float = Field(default=0, ge=0)


class DompetUpdate(BaseModel):
    nama_dompet: Optional[str] = Field(default=None, min_length=1)
    icon: Optional[WalletIcon] = None
    warna: Optional[str] = Field(default=None, pattern=HEX_COLOR_PATTERN)
    saldo: Optional[float] = Field(default=None, ge=0)


class Dompet(DompetBase):
    id: str
    pengguna_id: str
    saldo: float
    created_at: datetime
