import json
from typing import Any


def repair_and_parse_json(raw: str) -> Any:
    """Parse JSON dari respons Gemini, dengan reparasi untuk kegagalan yang
    ditemukan langsung saat testing manual: dibungkus markdown code fence, dan
    JSON yang terpotong (kurang closing bracket/quote di akhir) walau
    finishReason dari API bukan MAX_TOKENS. Raises json.JSONDecodeError kalau
    tetap tidak bisa diparse setelah reparasi."""
    text = raw.strip()

    if text.startswith("```"):
        text = text.strip("`")
        if text.lower().startswith("json"):
            text = text[4:]
        text = text.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    opens: list[str] = []
    in_string = False
    escape = False
    for ch in text:
        if in_string:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == '"':
                in_string = False
            continue
        if ch == '"':
            in_string = True
        elif ch in "{[":
            opens.append(ch)
        elif ch in "}]":
            if opens:
                opens.pop()

    repaired = text
    if in_string:
        repaired += '"'
    for ch in reversed(opens):
        repaired += "}" if ch == "{" else "]"

    return json.loads(repaired)
