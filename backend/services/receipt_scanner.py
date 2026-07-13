import json
from datetime import date

from core.config import settings
from models.receipt import ReceiptExtraction
from services.gemini_vision_client import GeminiVisionError, GeminiVisionTimeout, call_gemini_vision
from services.json_repair import repair_and_parse_json
from services.kategori_matcher import match_kategori

# FR-004 aslinya mewajibkan 10 detik. Dinaikkan sementara ke 25 detik khusus
# untuk demo (lihat STATUS.md) karena latency Gemini Vision di dev environment
# ini teramati ~17.5 detik -- 10 detik nyaris selalu jatuh ke fallback. Kalau
# API tetap tidak merespons dalam 25 detik, treat sebagai gagal dan langsung
# ke fallback manual (tidak retry).
RECEIPT_TIMEOUT_SECONDS = 25.0

PROMPT_TEMPLATE = """Kamu membantu mengekstrak data dari foto struk belanja untuk aplikasi keuangan mahasiswa Indonesia.

Ekstrak:
- nominal total yang dibayar (angka, tanpa simbol mata uang atau titik ribuan)
- tanggal transaksi (format YYYY-MM-DD; kalau tahun tidak tertulis di struk, asumsikan tahun berjalan)
- deskripsi singkat (nama toko/merchant)
- kategori_disarankan: 1 nama yang paling cocok dari daftar berikut: {kategori_list}

Kalau struk tidak terbaca sama sekali atau bukan foto struk belanja, kembalikan semua field null.

Balas HANYA JSON (tanpa markdown, tanpa teks lain):
{{"nominal": number|null, "tanggal": "YYYY-MM-DD"|null, "deskripsi": string|null, "kategori_disarankan": string|null}}
"""


def scan_receipt(file_bytes: bytes, mime_type: str, kategori_list: list[dict]) -> ReceiptExtraction:
    prompt = PROMPT_TEMPLATE.format(kategori_list=", ".join(k["nama_kategori"] for k in kategori_list))

    try:
        raw = call_gemini_vision(
            prompt=prompt,
            file_bytes=file_bytes,
            mime_type=mime_type,
            api_key=settings.ai_vision_api_key,
            model=settings.ai_vision_model,
            timeout=RECEIPT_TIMEOUT_SECONDS,
        )
    except GeminiVisionTimeout:
        return ReceiptExtraction(
            success=False,
            error_reason="timeout",
            error_message="Ekstraksi tidak selesai dalam 25 detik. Isi manual ya.",
        )
    except GeminiVisionError as exc:
        return ReceiptExtraction(success=False, error_reason="api_error", error_message=str(exc))

    try:
        parsed = repair_and_parse_json(raw)
    except json.JSONDecodeError:
        return ReceiptExtraction(
            success=False,
            error_reason="parse_error",
            error_message="Hasil ekstraksi tidak bisa dibaca. Isi manual ya.",
        )

    if not isinstance(parsed, dict):
        return ReceiptExtraction(
            success=False,
            error_reason="parse_error",
            error_message="Format hasil ekstraksi tidak sesuai. Isi manual ya.",
        )

    nominal = parsed.get("nominal")
    tanggal_str = parsed.get("tanggal")
    deskripsi = parsed.get("deskripsi")
    kategori_disarankan = parsed.get("kategori_disarankan")

    tanggal_parsed: date | None = None
    if tanggal_str:
        try:
            tanggal_parsed = date.fromisoformat(tanggal_str)
        except ValueError:
            tanggal_parsed = None

    kategori_id, nama_kategori = match_kategori(kategori_disarankan, kategori_list)

    missing_fields = []
    if not nominal:
        missing_fields.append("nominal")
    if not tanggal_parsed:
        missing_fields.append("tanggal")

    # Field penting (nominal/tanggal) kosong -> treat sebagai gagal, frontend
    # langsung tampilkan form manual (data parsial yang berhasil didapat tetap
    # disertakan sebagai bantuan, bukan untuk auto-save).
    if missing_fields:
        return ReceiptExtraction(
            success=False,
            error_reason="missing_fields",
            error_message="Struk tidak terbaca dengan jelas. Isi/lengkapi manual ya.",
            nominal=nominal,
            tanggal=tanggal_parsed,
            deskripsi=deskripsi,
            kategori_id_suggestion=kategori_id,
            nama_kategori_suggestion=nama_kategori,
            missing_fields=missing_fields,
        )

    return ReceiptExtraction(
        success=True,
        nominal=nominal,
        tanggal=tanggal_parsed,
        deskripsi=deskripsi,
        kategori_id_suggestion=kategori_id,
        nama_kategori_suggestion=nama_kategori,
        missing_fields=[],
    )
