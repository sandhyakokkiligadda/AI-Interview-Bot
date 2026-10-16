from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Interview Bot"
    API_V1_STR: str = "/api"
    
    # AI Provider Keys
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    
    # Port
    PORT: int = 8005
    
    # Database URL
    DATABASE_URL: str = "sqlite:///./interview_bot_v2.db"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    # Supported Languages
    SUPPORTED_LANGUAGES: List[str] = [
        "English",
        "Telugu",
        "Hindi",
        "Tamil",
        "Kannada",
        "Malayalam"
    ]
    
    # Language Code Mapping
    LANGUAGE_CODES: dict = {
        "English": "en-IN",
        "Telugu": "te-IN",
        "Hindi": "hi-IN",
        "Tamil": "ta-IN",
        "Kannada": "kn-IN",
        "Malayalam": "ml-IN"
    }

    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        extra="allow"
    )

settings = Settings()
