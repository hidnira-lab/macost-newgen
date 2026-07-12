from datetime import date
from typing import Literal, Optional

from pydantic import BaseModel, Field

TipeTransaksi = Literal["Pemasukan", "Pengeluaran"]
MetodeInput = Literal["Manual", "Scan Struk", "Upload E-Statement"]


class TransaksiBase(BaseModel):
    tipe_transaksi: TipeTransaksi
    nominal: float = Field(gt=0)
    tanggal: date
    metode_input: MetodeInput = "Manual"
    dompet_id: str
    kategori_id: str


class TransaksiCreate(TransaksiBase):
    pass


class Transaksi(TransaksiBase):
    id: str
    pengguna_id: str


class TransaksiCreateRequest(BaseModel):
    """Request body dari client: tidak ada tipe_transaksi/dompet_id/source —
    tipe_transaksi & source diturunkan dari kategori yang dipilih, dompet
    diresolve otomatis ke wallet default milik user."""

    kategori_id: str
    nominal: float = Field(gt=0)
    tanggal: date
    metode_input: MetodeInput = "Manual"


class TransaksiUpdateRequest(BaseModel):
    kategori_id: Optional[str] = None
    nominal: Optional[float] = Field(default=None, gt=0)
    tanggal: Optional[date] = None
    metode_input: Optional[MetodeInput] = None


class TransaksiResponse(BaseModel):
    id: str
    tipe_transaksi: TipeTransaksi
    nominal: float
    tanggal: date
    metode_input: MetodeInput
    pengguna_id: str
    dompet_id: str
    kategori_id: str
    nama_kategori: str
    source: Optional[str] = None
