# app/services/ai_service.py

from openai import AsyncOpenAI

client = AsyncOpenAI(api_key="YOUR_API_KEY")

async def extract_skills(text: str):

    prompt = f"""
    Extract technical skills from this resume:

    {text}

    Return list only.
    """

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )

    skills = response.choices[0].message.content

    return skills
