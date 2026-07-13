import json
from datetime import date

from core.config import settings
from models.statement import StatementExtractionResponse, StatementTransactionCandidate
from services.gemini_vision_client import GeminiVisionError, GeminiVisionTimeout, call_gemini_vision
from services.json_repair import repair_and_parse_json
from services.kategori_matcher import match_kategori

# E-statement bisa berisi banyak halaman/baris, dikasih jatah waktu lebih
# longgar daripada scan struk (25 detik untuk demo, lihat receipt_scanner.py).
STATEMENT_TIMEOUT_SECONDS = 45.0

PROMPT_TEMPLATE = """Kamu membantu mengekstrak daftar transaksi dari e-statement/mutasi rekening bank (PDF) untuk aplikasi keuangan mahasiswa Indonesia.

Baca semua baris transaksi di dokumen ini. Untuk setiap transaksi ekstrak:
- tanggal (format YYYY-MM-DD)
- deskripsi singkat dari keterangan transaksi
- nominal (angka positif, tanpa simbol mata uang atau tanda minus)
- tipe_transaksi ("Pemasukan" kalau uang masuk/kredit, "Pengeluaran" kalau uang keluar/debit)
- kategori_disarankan: pilih 1 nama paling cocok sesuai tipe_transaksi dari daftar berikut, atau null kalau tidak ada yang cocok
  Kategori Pemasukan: {kategori_pemasukan}
  Kategori Pengeluaran: {kategori_pengeluaran}

Abaikan baris yang bukan transaksi (header, footer, saldo awal/akhir, judul kolom).
Kalau dokumen tidak bisa dibaca sama sekali atau bukan e-statement, kembalikan array kosong.

Balas HANYA JSON array (tanpa markdown, tanpa teks lain). Setiap elemen:
{{"tanggal": "YYYY-MM-DD"|null, "deskripsi": string, "nominal": number, "tipe_transaksi": "Pemasukan"|"Pengeluaran", "kategori_disarankan": string|null}}
"""


def scan_statement(file_bytes: bytes, mime_type: str, kategori_list: list[dict]) -> StatementExtractionResponse:
    kategori_pemasukan = [k for k in kategori_list if k["tipe"] == "Pemasukan"]
    kategori_pengeluaran = [k for k in kategori_list if k["tipe"] == "Pengeluaran"]

    prompt = PROMPT_TEMPLATE.format(
        kategori_pemasukan=", ".join(k["nama_kategori"] for k in kategori_pemasukan),
        kategori_pengeluaran=", ".join(k["nama_kategori"] for k in kategori_pengeluaran),
    )

    try:
        raw = call_gemini_vision(
            prompt=prompt,
            file_bytes=file_bytes,
            mime_type=mime_type,
            api_key=settings.ai_vision_api_key,
            model=settings.ai_vision_model,
            timeout=STATEMENT_TIMEOUT_SECONDS,
        )
    except GeminiVisionTimeout:
        return StatementExtractionResponse(
            success=False,
            error_reason="timeout",
            error_message="Ekstraksi tidak selesai tepat waktu. Coba lagi atau input manual.",
        )
    except GeminiVisionError as exc:
        return StatementExtractionResponse(success=False, error_reason="api_error", error_message=str(exc))

    try:
        parsed = repair_and_parse_json(raw)
    except json.JSONDecodeError:
        return StatementExtractionResponse(
            success=False,
            error_reason="parse_error",
            error_message="Hasil ekstraksi tidak bisa dibaca. Input manual ya.",
        )

    if not isinstance(parsed, list):
        return StatementExtractionResponse(
            success=False,
            error_reason="parse_error",
            error_message="Format hasil ekstraksi tidak sesuai. Input manual ya.",
        )

    candidates: list[StatementTransactionCandidate] = []
    for item in parsed:
        if not isinstance(item, dict):
            continue
        nominal = item.get("nominal")
        tipe_transaksi = item.get("tipe_transaksi")
        if not nominal or tipe_transaksi not in ("Pemasukan", "Pengeluaran"):
            continue

        tanggal_str = item.get("tanggal")
        tanggal_parsed: date | None = None
        if tanggal_str:
            try:
                tanggal_parsed = date.fromisoformat(tanggal_str)
            except ValueError:
                tanggal_parsed = None

        pool = kategori_pemasukan if tipe_transaksi == "Pemasukan" else kategori_pengeluaran
        kategori_id, nama_kategori = match_kategori(item.get("kategori_disarankan"), pool)

        candidates.append(
            StatementTransactionCandidate(
                tanggal=tanggal_parsed,
                deskripsi=str(item.get("deskripsi") or "").strip() or "Transaksi",
                nominal=float(nominal),
                tipe_transaksi=tipe_transaksi,
                kategori_id_suggestion=kategori_id,
                nama_kategori_suggestion=nama_kategori,
            )
        )

    if not candidates:
        return StatementExtractionResponse(
            success=False,
            error_reason="no_transactions",
            error_message="Tidak ada transaksi yang terbaca dari dokumen ini. Input manual ya.",
        )

    return StatementExtractionResponse(success=True, transactions=candidates)
