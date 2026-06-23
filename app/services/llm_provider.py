import requests
from app.core.config import settings

class LLMProvider:

    @staticmethod
    def generate(prompt: str) -> str:
        if settings.LLM_PROVIDER == "gemini":
            api_key = settings.GEMINI_API_KEY
            if not api_key:
                raise ValueError("GEMINI_API_KEY is not configured. Please add it to your .env file.")

            url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
            headers = {
                "Content-Type": "application/json",
                "x-goog-api-key": api_key
            }
            payload = {
                "contents": [{
                    "parts": [{"text": prompt}]
                }]
            }
            try:
                response = requests.post(url, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()
                
                # Check for API error response inside the JSON
                if "error" in data:
                    raise Exception(data["error"].get("message", "Unknown Gemini Error"))
                
                return data['candidates'][0]['content']['parts'][0]['text']
            except Exception as e:
                print(f"Gemini API Error: {e}")
                # Provide a descriptive error message from the response if available
                if hasattr(e, 'response') and e.response is not None:
                    try:
                        error_details = e.response.json()
                        error_msg = error_details.get("error", {}).get("message", str(e))
                        raise Exception(f"Gemini API Error: {error_msg}")
                    except Exception:
                        pass
                raise Exception(f"Gemini API Error: {str(e)}")
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
