from datetime import date
from typing import Literal, Optional

from pydantic import BaseModel

TipeTransaksiStatement = Literal["Pemasukan", "Pengeluaran"]


class StatementTransactionCandidate(BaseModel):
    tanggal: Optional[date] = None
    deskripsi: str
    nominal: float
    tipe_transaksi: TipeTransaksiStatement
    kategori_id_suggestion: Optional[str] = None
    nama_kategori_suggestion: Optional[str] = None


class StatementExtractionResponse(BaseModel):
    success: bool
    transactions: list[StatementTransactionCandidate] = []
    error_reason: Optional[str] = None
    error_message: Optional[str] = None
