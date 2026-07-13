import logging
import time

import httpx

logger = logging.getLogger(__name__)

GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"
GEMINI_MODEL = "gemini-flash-latest"
# gemini-flash-latest is the model most apps default to, so it's the one that
# gets hit hardest by Google-side "high demand" 503 spikes. gemini-flash-lite
# runs on separate capacity, so falling back to it when the primary model is
# down keeps insight generation working during those spikes instead of
# forcing the user to keep clicking generate until Google recovers.
GEMINI_FALLBACK_MODEL = "gemini-flash-lite-latest"
GEMINI_TIMEOUT_SECONDS = 45.0
# One retry after a short pause, since Google's own 503 message says demand
# spikes are "usually temporary".
GEMINI_RETRY_DELAY_SECONDS = 3.0


class GeminiError(Exception):
    pass


def _call_model(model: str, payload: dict, api_key: str) -> httpx.Response | None:
    """Returns the response, or None if the request itself failed (network
    error / timeout) -- the caller decides whether that's worth a retry."""
    try:
        return httpx.post(
            f"{GEMINI_API_BASE}/{model}:generateContent",
            params={"key": api_key},
            json=payload,
            timeout=GEMINI_TIMEOUT_SECONDS,
        )
    except httpx.RequestError:
        return None


TRANSIENT_STATUS_CODES = {429, 503}


def _is_transient(response: httpx.Response | None) -> bool:
    # 503 = model overloaded, 429 = rate/quota limited -- Google's own docs
    # list both as retryable rather than a hard stop.
    return response is None or response.status_code in TRANSIENT_STATUS_CODES


def generate_json_text(prompt: str, api_key: str) -> str:
    """Panggil Gemini Flash minta output JSON murni. Thinking dimatikan
    (thinkingBudget: 0) karena ini generasi teks pendek, bukan reasoning berat,
    dan tiap detik latency langsung dirasakan user yang sedang menunggu.

    Coba GEMINI_MODEL dulu (dengan satu retry kalau kena 503/timeout), lalu
    fallback ke GEMINI_FALLBACK_MODEL sekali kalau primary tetap gagal --
    dua model ini biasanya tidak overload bersamaan."""
    if not api_key:
        raise GeminiError("GEMINI_API_KEY belum diisi di backend/.env")

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.4,
            "thinkingConfig": {"thinkingBudget": 0},
            # Default token limit is too small for a 3-5 item JSON array and
            # silently truncates mid-string; set explicitly.
            "maxOutputTokens": 2048,
        },
    }

    response = _call_model(GEMINI_MODEL, payload, api_key)
    if _is_transient(response):
        time.sleep(GEMINI_RETRY_DELAY_SECONDS)
        response = _call_model(GEMINI_MODEL, payload, api_key)
    if _is_transient(response):
        response = _call_model(GEMINI_FALLBACK_MODEL, payload, api_key)

    if response is None:
        logger.warning("Gemini API request failed on both models: timeout or connection error")
        raise GeminiError("Gagal menghubungi layanan AI. Periksa koneksi lalu coba lagi.")
    if response.status_code == 503:
        raise GeminiError(
            "Gemini API sedang mengalami lonjakan trafik tinggi di sisi Google. Coba lagi beberapa saat lagi."
        )
    if response.status_code == 429:
        raise GeminiError(
            "Kuota Gemini API sudah habis untuk saat ini. Coba lagi beberapa saat lagi atau cek limit di Google AI Studio."
        )
    if response.status_code != 200:
        logger.warning("Gemini API error %s: %s", response.status_code, response.text[:300])
        raise GeminiError("Gagal memproses dengan AI. Coba lagi beberapa saat lagi.")

    data = response.json()
    try:
        candidate = data["candidates"][0]
        parts = candidate["content"]["parts"]
        text_parts = [p["text"] for p in parts if "text" in p]
        text = "".join(text_parts)
    except (KeyError, IndexError) as exc:
        logger.warning("Gemini API response format unexpected: %s", data)
        raise GeminiError("Format respons AI tidak sesuai. Coba lagi beberapa saat lagi.") from exc

    if candidate.get("finishReason") == "MAX_TOKENS":
        raise GeminiError("Respons Gemini terpotong (melebihi batas token) sebelum JSON selesai")

    return text
