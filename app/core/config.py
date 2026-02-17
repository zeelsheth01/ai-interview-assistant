from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    OPENAI_API_KEY: str
    SECRET_KEY: str = "supersecret"

settings = Settings()
