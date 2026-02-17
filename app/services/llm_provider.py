import requests
from app.core.config import settings


class LLMProvider:

    @staticmethod
    def generate(prompt: str):

        # USING OLLAMA LOCAL LLM

        response = requests.post(
            f"{settings.ollama_url}/api/generate",
            json={
                "model": settings.ollama_model,
                "prompt": prompt,
                "stream": False
            }
        )

        result = response.json()

        return result.get("response", "")
