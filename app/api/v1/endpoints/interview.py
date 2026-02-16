from fastapi import APIRouter
from app.services.interview_service import generate_questions

router = APIRouter(prefix="/interview", tags=["Interview"])

@router.post("/generate")
async def generate(data: dict):

    resume_text = data["resume_text"]

    return await generate_questions(resume_text)


@router.get("/questions/{resume_id}")
async def get_questions(resume_id: int):
    return {"resume_id": resume_id}
