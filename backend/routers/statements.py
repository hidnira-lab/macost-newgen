from fastapi import APIRouter, Depends, File, UploadFile
from supabase import Client

from core.security import get_current_user, get_user_client
from models.statement import StatementExtractionResponse
from services.statement_scanner import scan_statement

router = APIRouter(prefix="/statements", tags=["statements"])

ALLOWED_MIME_TYPES = {"application/pdf"}
MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024


@router.post("/extract", response_model=StatementExtractionResponse)
def extract(
    file: UploadFile = File(...),
    _: dict = Depends(get_current_user),
    db: Client = Depends(get_user_client),
):
    """Ekstraksi e-statement (FR-003). Cuma mengembalikan daftar kandidat
    transaksi untuk preview -- import baris yang tercentang dilakukan lewat
    POST /transactions yang sudah ada, satu per baris, dipicu klik user
    (bukan auto-save)."""
    if file.content_type not in ALLOWED_MIME_TYPES:
        return StatementExtractionResponse(
            success=False,
            error_reason="unsupported_format",
            error_message="Format file tidak didukung. Gunakan PDF.",
        )

    file_bytes = file.file.read()
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        return StatementExtractionResponse(
            success=False,
            error_reason="file_too_large",
            error_message="Ukuran file terlalu besar (maks 15MB).",
        )
    if not file_bytes:
        return StatementExtractionResponse(success=False, error_reason="empty_file", error_message="File kosong.")

    kategori_result = db.table("kategori").select("id, nama_kategori, tipe").execute()
    kategori_list = kategori_result.data or []

    return scan_statement(file_bytes, file.content_type, kategori_list)
