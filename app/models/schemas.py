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


# ---------- RESPONSES ----------

class ResumeResponse(BaseModel):
    questions: list[str]
    skills: list[str]


class TokenResponse(BaseModel):
    token: str

class GoogleAuthRequest(BaseModel):
    credential: str


class ForgotPasswordRequest(BaseModel):
    email: str
    new_password: str