import requests

OLLAMA_URL = "http://localhost:11434/api/generate"


def analyze_resume(text):

    try:

        prompt = f"""
        You are an expert AI Interview Assistant.

        Analyze this resume text.

        Extract:
        1. Skills
        2. Role suggestion
        3. Experience level
        4. Generate 5 interview questions.

        Resume:
        {text}
        """

        response = requests.post(
            OLLAMA_URL,
            json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False
            }
        )

        result = response.json()

        return {
            "analysis": result.get("response")
        }

    except Exception as e:
        return {"error": str(e)}
