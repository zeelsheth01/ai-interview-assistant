from fastapi import APIRouter

router = APIRouter()

@router.post("/chat")
async def chat(data: dict):

    message = data.get("message")

    return {
        "reply": f"AI response for: {message}"
    }
