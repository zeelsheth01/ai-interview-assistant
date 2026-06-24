from pydantic_settings import BaseSettings

class Settings(BaseSettings):

    # DATABASE_URL: str = "postgresql://..."
    DATABASE_URL: str = ""

    LLM_PROVIDER: str = "gemini"

    GEMINI_API_KEY: str | None = None
    OPENAI_API_KEY: str | None = None

    GOOGLE_CLIENT_ID: str | None = None

    OLLAMA_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"

    class Config:
        env_file = ".env"

settings = Settings()