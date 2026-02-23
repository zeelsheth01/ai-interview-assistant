import requests

OLLAMA_URL = "http://localhost:11434/api/generate"

def generate_interview_questions(resume_text):

    prompt = f"""
    You are an interview assistant.

    Based on this resume generate 10 technical interview questions.

    Resume:
    {resume_text}

    Return only list of questions.
    """

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": "llama3",
            "prompt": prompt,
            "stream": False
        }
    )

    data = response.json()

    return data["response"]