from fastapi import APIRouter
from app.models.schemas import ChatRequest
from app.services.interview_service import InterviewService

router = APIRouter()

@router.post("/chat")
def chat(data: ChatRequest):

    service = InterviewService()

    result = service.process_chat(data.message)

    return result



@router.get("/resume/{resume_id}")
def get_resume(resume_id: int):

    cursor.execute(
        "SELECT result_json FROM resumes WHERE id=%s",
        (resume_id,)
    )

    data = cursor.fetchone()

    if not data:
        return {"questions": []}

    return {
        "questions": data[0]["questions"]
    }