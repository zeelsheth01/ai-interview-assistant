import requests

def generate_questions(resume_text):

    print("SENDING TO OLLAMA...")
    print(resume_text[:200])

    prompt = f"""
Generate technical interview questions ONLY based on this resume:

{resume_text}

Return only questions.
"""

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3",
            "prompt": prompt,
            "stream": False
        }
    )

    data = response.json()

    print("OLLAMA RESPONSE:", data)

    return data.get("response", "No questions generated")
