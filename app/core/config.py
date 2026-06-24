from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    DATABASE_URL: str = "postgresql://postgres:Diya971@localhost:5432/ai_interview_db"

    # AI provider switch
    LLM_PROVIDER: str = "gemini"

    # Gemini API settings
    GEMINI_API_KEY: str | None = None

    # OpenAI (optional now)
    OPENAI_API_KEY: str | None = None

    # Ollama settings
    OLLAMA_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"

    class Config:
        env_file = ".env"


settings = Settings()