import requests
from app.core.config import settings

class LLMProvider:

    @staticmethod
    def generate(prompt: str) -> str:
        if settings.LLM_PROVIDER == "gemini":
            api_key = settings.GEMINI_API_KEY
            if not api_key:
                raise ValueError("GEMINI_API_KEY is not configured. Please add it to your .env file.")

            models_to_try = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.0-flash"]
            headers = {
                "Content-Type": "application/json",
                "x-goog-api-key": api_key
            }
            payload = {
                "contents": [{
                    "parts": [{"text": prompt}]
                }]
            }

            last_error = None
            for model_name in models_to_try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent"
                try:
                    response = requests.post(url, json=payload, headers=headers, timeout=30)
                    if response.status_code == 404:
                        continue
                    response.raise_for_status()
                    data = response.json()
                    
                    # Check for API error response inside the JSON
                    if "error" in data:
                        raise Exception(data["error"].get("message", "Unknown Gemini Error"))
                    
                    return data['candidates'][0]['content']['parts'][0]['text']
                except Exception as e:
                    last_error = e
                    if hasattr(e, 'response') and e.response is not None and e.response.status_code == 404:
                        continue
                    print(f"Gemini API Error with {model_name}: {e}")
                    break

            if last_error:
                raise Exception(f"Gemini API Error: {str(last_error)}")
            raise Exception("No compatible Gemini model endpoint succeeded.")
        else:
            # Fallback to local Ollama LLM
            try:
                response = requests.post(
                    f"{settings.OLLAMA_URL}/api/generate",
                    json={
                        "model": settings.OLLAMA_MODEL,
                        "prompt": prompt,
                        "stream": False
                    }
                )
                response.raise_for_status()
                result = response.json()
                return result.get("response", "")
            except Exception as e:
                print(f"Ollama local error: {e}")
                raise Exception(f"Ollama connection error: {str(e)}")
