from app.services.ai_service import generate_interview_questions

async def generate_questions(resume_text: str):

    ai_output = await generate_interview_questions(resume_text)

    return ai_output
