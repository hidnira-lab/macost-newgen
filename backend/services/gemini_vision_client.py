import base64

import httpx

GEMINI_VISION_API_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"


class GeminiVisionError(Exception):
    pass


class GeminiVisionTimeout(GeminiVisionError):
    pass


def call_gemini_vision(prompt: str, file_bytes: bytes, mime_type: str, api_key: str, model: str, timeout: float) -> str:
    """Panggil Gemini multimodal (gambar struk atau PDF e-statement inline
    sebagai base64). Thinking dimatikan untuk latency, tapi respons tetap bisa
    terpotong tanpa finishReason MAX_TOKENS (ditemukan langsung saat testing) —
    caller wajib pakai services.json_repair.repair_and_parse_json, bukan
    json.loads polos."""
    if not api_key:
        raise GeminiVisionError("AI_VISION_API_KEY belum diisi di backend/.env")

    encoded = base64.b64encode(file_bytes).decode("utf-8")
    url = GEMINI_VISION_API_URL_TEMPLATE.format(model=model)

    try:
        response = httpx.post(
            url,
            params={"key": api_key},
            json={
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
            },
            timeout=timeout,
        )
    except httpx.TimeoutException as exc:
        raise GeminiVisionTimeout(f"Gemini Vision tidak merespons dalam {timeout} detik") from exc
    except httpx.RequestError as exc:
        raise GeminiVisionError(f"Gagal menghubungi Gemini Vision API: {exc}") from exc

    if response.status_code != 200:
        raise GeminiVisionError(f"Gemini Vision API error {response.status_code}: {response.text[:300]}")

    data = response.json()
    try:
        parts = data["candidates"][0]["content"]["parts"]
        text_parts = [p["text"] for p in parts if "text" in p]
        return "".join(text_parts)
    except (KeyError, IndexError) as exc:
        raise GeminiVisionError(f"Format respons Gemini Vision tidak sesuai ekspektasi: {data}") from exc
