from openai import AsyncOpenAI
from app.core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def analyze_resume(text: str):

    prompt = f"""
    Analyze this resume and do:

    1. Extract main skills
    2. Detect experience level
    3. Generate 5 interview questions

    Resume:
    {text}
    """

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an interview preparation assistant."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7
    )

    return response.choices[0].message.content
