from fastapi import APIRouter, Depends, File, UploadFile
from supabase import Client

from core.security import get_current_user, get_user_client
from models.receipt import ReceiptExtraction
from services.receipt_scanner import scan_receipt

router = APIRouter(prefix="/receipts", tags=["receipts"])

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024


@router.post("/scan", response_model=ReceiptExtraction)
def scan(
    file: UploadFile = File(...),
    _: dict = Depends(get_current_user),
    db: Client = Depends(get_user_client),
):
    """Ekstraksi struk (FR-002). Hasil di sini TIDAK pernah langsung disimpan
    -- endpoint ini cuma mengembalikan data yang bisa dipakai untuk pre-fill
    form transaksi manual yang sudah ada; user tetap harus review & klik
    submit sendiri (FR-004)."""
    if file.content_type not in ALLOWED_MIME_TYPES:
        return ReceiptExtraction(
            success=False,
            error_reason="unsupported_format",
            error_message="Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.",
        )

    file_bytes = file.file.read()
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        return ReceiptExtraction(
            success=False,
            error_reason="file_too_large",
            error_message="Ukuran file terlalu besar (maks 8MB).",
        )
    if not file_bytes:
        return ReceiptExtraction(success=False, error_reason="empty_file", error_message="File kosong.")

    kategori_result = db.table("kategori").select("id, nama_kategori").eq("tipe", "Pengeluaran").execute()
    kategori_list = kategori_result.data or []

    return scan_receipt(file_bytes, file.content_type, kategori_list)
