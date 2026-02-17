from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    DATABASE_URL: str

    # AI provider switch
    LLM_PROVIDER: str = "ollama"

    # OpenAI (optional now)
    OPENAI_API_KEY: str | None = None

    # Ollama settings
    OLLAMA_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"

    class Config:
        env_file = ".env"


settings = Settings()
