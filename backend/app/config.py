import os
from pathlib import Path

try:
    from pydantic_settings import BaseSettings
except ImportError:
    BaseSettings = object

class Settings:
    # Project paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    REPORTS_DIR: Path = BASE_DIR / "generated_reports"
    DISCUSSIONS_DIR: Path = BASE_DIR / "saved_discussions"

    # App info
    APP_NAME: str = "SHU ORIC AI – Research, Innovation & Industry Intelligence Ecosystem"
    APP_VERSION: str = "2.0.0"
    INSTITUTION: str = "Salim Habib University (SHU), Karachi"
    DEPARTMENT: str = "Office of Research, Innovation & Commercialization (ORIC)"

    # AI API Keys (Configurable via environment variables)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")

    # Default Models
    DEFAULT_AI_PROVIDER: str = os.getenv("DEFAULT_AI_PROVIDER", "gemini") # 'gemini', 'openai', 'claude', 'local_expert'
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    CLAUDE_MODEL: str = os.getenv("CLAUDE_MODEL", "claude-3-5-sonnet-20241022")

    # Server configuration
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", 8000))
    CORS_ORIGINS: list[str] = ["*"]

    # Database
    SQLITE_DB_PATH: Path = DATA_DIR / "shu_oric.db"

settings = Settings()

# Ensure directories exist
settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
settings.REPORTS_DIR.mkdir(parents=True, exist_ok=True)
settings.DISCUSSIONS_DIR.mkdir(parents=True, exist_ok=True)
