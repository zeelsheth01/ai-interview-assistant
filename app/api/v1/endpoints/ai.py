from fastapi import APIRouter, Request, Response
from app.models.schemas import ChatRequest
from app.services.interview_service import InterviewService
from fastapi_cache.decorator import cache
import hashlib

router = APIRouter()

def chat_key_builder(func, namespace: str = "", request: Request = None, response: Response = None, *args, **kwargs):
    data = kwargs.get('data')
    if data:
        message = data.message.lower().strip()
        key = hashlib.md5(message.encode()).hexdigest()
        return f"{namespace}:{func.__module__}:{func.__name__}:{key}"
    return f"{namespace}:{func.__module__}:{func.__name__}"

@router.post("/chat")
@cache(expire=3600, key_builder=chat_key_builder)
def chat(data: ChatRequest):
    try:
        service = InterviewService()
        result = service.process_chat(data.message)
        return result
    except Exception as e:
        print("Chat LLM Error:", e)
        user_msg = data.message.lower()
        if "explain" in user_msg or "how to" in user_msg or "what is" in user_msg or "react" in user_msg or "node" in user_msg or "sql" in user_msg:
            reply = f"I am currently operating in offline mode because the Gemini API is rate-limited or offline. In a technical interview, when answering questions related to your query, remember to use the STAR method: describe the Situation, Task, Action, and Result, highlighting specific design choices and tradeoffs."
        else:
            reply = "I am currently in offline mode as the Gemini API is rate-limited or unavailable. Let me know if you want to discuss mock interview structures or general preparation strategies!"
        return {"reply": reply}