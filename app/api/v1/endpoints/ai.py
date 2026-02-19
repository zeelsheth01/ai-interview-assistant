from fastapi import APIRouter
from app.models.schemas import ChatRequest
from app.services.interview_service import InterviewService

router = APIRouter()

@router.post("/chat")
def chat(data: ChatRequest):

    service = InterviewService()

    result = service.process_chat(data.message)

    return result
