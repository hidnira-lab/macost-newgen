from datetime import date
from typing import Optional

from pydantic import BaseModel


class ReceiptExtraction(BaseModel):
    success: bool
    nominal: Optional[float] = None
    tanggal: Optional[date] = None
    deskripsi: Optional[str] = None
    kategori_id_suggestion: Optional[str] = None
    nama_kategori_suggestion: Optional[str] = None
    missing_fields: list[str] = []
    error_reason: Optional[str] = None
    error_message: Optional[str] = None
