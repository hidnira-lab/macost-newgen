import base64
import logging

import httpx

logger = logging.getLogger(__name__)

GEMINI_VISION_API_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
# Same fallback used by services/gemini_client.py (AI Insight) -- receipts and
# insights share one Gemini API key/project, so both are exposed to the same
# "primary model overloaded" 503 spikes and quota 429s.
GEMINI_VISION_FALLBACK_MODEL = "gemini-flash-lite-latest"
VISION_TRANSIENT_STATUS_CODES = {429, 503}


class GeminiVisionError(Exception):
    pass


class GeminiVisionTimeout(GeminiVisionError):
    pass


def _post(model: str, payload: dict, api_key: str, timeout: float) -> httpx.Response:
    url = GEMINI_VISION_API_URL_TEMPLATE.format(model=model)
    return httpx.post(url, params={"key": api_key}, json=payload, timeout=timeout)


def call_gemini_vision(prompt: str, file_bytes: bytes, mime_type: str, api_key: str, model: str, timeout: float) -> str:
    """Panggil Gemini multimodal (gambar struk atau PDF e-statement inline
    sebagai base64). Thinking dimatikan untuk latency, tapi respons tetap bisa
    terpotong tanpa finishReason MAX_TOKENS (ditemukan langsung saat testing) —
    caller wajib pakai services.json_repair.repair_and_parse_json, bukan
    json.loads polos.

    Kalau `model` kena 503 (overload) / 429 (quota) / gagal koneksi, langsung
    coba sekali ke GEMINI_VISION_FALLBACK_MODEL tanpa jeda -- scan struk/
    e-statement punya budget waktu ketat (RECEIPT_TIMEOUT_SECONDS /
    STATEMENT_TIMEOUT_SECONDS), jadi tidak ada retry-dengan-delay di sini.
    Timeout request itu sendiri TIDAK di-retry sama sekali (by design, sudah
    didokumentasikan di receipt_scanner.py) -- kalau primary sudah menghabiskan
    seluruh timeout budget, mencoba model lain cuma akan menggandakan waktu
    tunggu user tanpa manfaat sepadan."""
    if not api_key:
        raise GeminiVisionError("AI_VISION_API_KEY belum diisi di backend/.env")

    encoded = base64.b64encode(file_bytes).decode("utf-8")
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {"inline_data": {"mime_type": mime_type, "data": encoded}},
                ]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.2,
            "thinkingConfig": {"thinkingBudget": 0},
            "maxOutputTokens": 4096,
        },
    }

    try:
        response = _post(model, payload, api_key, timeout)
    except httpx.TimeoutException as exc:
        raise GeminiVisionTimeout(f"Gemini Vision tidak merespons dalam {timeout} detik") from exc
    except httpx.RequestError:
        response = None

    if response is None or response.status_code in VISION_TRANSIENT_STATUS_CODES:
        try:
            response = _post(GEMINI_VISION_FALLBACK_MODEL, payload, api_key, timeout)
        except httpx.TimeoutException as exc:
            raise GeminiVisionTimeout(f"Gemini Vision tidak merespons dalam {timeout} detik") from exc
        except httpx.RequestError as exc:
            logger.warning("Gemini Vision request failed on both models: %s", exc)
            raise GeminiVisionError("Gagal menghubungi layanan AI. Periksa koneksi lalu coba lagi.") from exc

    if response.status_code in VISION_TRANSIENT_STATUS_CODES:
        logger.warning(
            "Gemini Vision still transient after fallback: %s %s", response.status_code, response.text[:300]
        )
        raise GeminiVisionError("Layanan AI sedang sibuk atau kuota habis. Coba lagi beberapa saat lagi.")
    if response.status_code != 200:
        logger.warning("Gemini Vision API error %s: %s", response.status_code, response.text[:300])
        raise GeminiVisionError("Gagal memproses dengan AI. Coba lagi atau isi manual.")

    data = response.json()
    try:
        parts = data["candidates"][0]["content"]["parts"]
        text_parts = [p["text"] for p in parts if "text" in p]
        return "".join(text_parts)
    except (KeyError, IndexError) as exc:
        logger.warning("Gemini Vision response format unexpected: %s", data)
        raise GeminiVisionError("Format respons AI tidak sesuai. Coba lagi atau isi manual.") from exc
