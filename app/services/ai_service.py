from openai import OpenAI
from app.core.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def analyze_resume(text):

    prompt = f"""
    Analyze resume and return JSON:

    Extract:
    - skills
    - role
    - experience_level

    Generate:
    - technical_questions
    - hr_questions

    Resume:
    {text}
    """

    response = client.responses.create(
        model="gpt-4.1-mini",
        input=prompt
    )

    return response.output_text
