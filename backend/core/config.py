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
    frontend_origin: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")


settings = Settings()
