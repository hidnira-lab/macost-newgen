import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_anon_key: str = os.getenv("SUPABASE_ANON_KEY", "")
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    ai_vision_api_key: str = os.getenv("AI_VISION_API_KEY", "")
    ai_vision_model: str = os.getenv("AI_VISION_MODEL", "gemini-flash-latest")
    # Comma-separated so prod (Vercel) and local dev can both be allowed at
    # once, e.g. "https://macost.vercel.app,http://localhost:3000".
    frontend_origins: list[str] = [
        origin.strip()
        for origin in os.getenv("FRONTEND_ORIGIN", "http://localhost:3000").split(",")
        if origin.strip()
    ]
    # Optional: Vercel assigns a new URL per preview deployment (PRs,
    # branches), which can't be listed as exact strings ahead of time. Unset
    # by default; e.g. "https://macost-newgen-.*\.vercel\.app" opts in once
    # the Vercel project slug is known.
    frontend_origin_regex: str | None = os.getenv("FRONTEND_ORIGIN_REGEX") or None


settings = Settings()
