from pydantic import BaseModel

# ---------- AUTH ----------

class RegisterRequest(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


# ---------- AI CHAT ----------

class ChatRequest(BaseModel):
    message: str
