import httpx

GEMINI_MODEL = "gemini-flash-latest"
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
GEMINI_TIMEOUT_SECONDS = 45.0


class GeminiError(Exception):
    pass


def generate_json_text(prompt: str, api_key: str) -> str:
    """Panggil Gemini Flash minta output JSON murni. Thinking dimatikan
    (thinkingBudget: 0) karena ini generasi teks pendek, bukan reasoning berat,
    dan tiap detik latency langsung dirasakan user yang sedang menunggu."""
    if not api_key:
        raise GeminiError("GEMINI_API_KEY belum diisi di backend/.env")

    try:
        response = httpx.post(
            GEMINI_API_URL,
            params={"key": api_key},
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "responseMimeType": "application/json",
                    "temperature": 0.4,
                    "thinkingConfig": {"thinkingBudget": 0},
                    # Default token limit is too small for a 3-5 item JSON
                    # array and silently truncates mid-string; set explicitly.
                    "maxOutputTokens": 2048,
                },
            },
            timeout=GEMINI_TIMEOUT_SECONDS,
        )
    except httpx.RequestError as exc:
        raise GeminiError(f"Gagal menghubungi Gemini API: {exc}") from exc

    if response.status_code != 200:
        raise GeminiError(f"Gemini API error {response.status_code}: {response.text[:300]}")

    data = response.json()
    try:
        candidate = data["candidates"][0]
        parts = candidate["content"]["parts"]
        text_parts = [p["text"] for p in parts if "text" in p]
        text = "".join(text_parts)
    except (KeyError, IndexError) as exc:
        raise GeminiError(f"Format respons Gemini tidak sesuai ekspektasi: {data}") from exc

    if candidate.get("finishReason") == "MAX_TOKENS":
        raise GeminiError("Respons Gemini terpotong (melebihi batas token) sebelum JSON selesai")

    return text
