from pydantic import BaseModel, Field, field_validator


def _validate_bcrypt_password_length(password: str) -> str:
    if len(password.encode("utf-8")) > 72:
        raise ValueError("Password must be no more than 72 UTF-8 bytes.")
    return password


# ---------- AUTH ----------

class RegisterRequest(BaseModel):
    email: str
    password: str

    @field_validator("password")
    @classmethod
    def validate_password_length(cls, password: str) -> str:
        return _validate_bcrypt_password_length(password)


class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("password")
    @classmethod
    def validate_password_length(cls, password: str) -> str:
        return _validate_bcrypt_password_length(password)


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

    @field_validator("new_password")
    @classmethod
    def validate_new_password_length(cls, password: str) -> str:
        return _validate_bcrypt_password_length(password)


class CreatePaymentOrderRequest(BaseModel):
    minutes: int = Field(ge=1, le=120)


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str = Field(min_length=1, max_length=100)
    razorpay_payment_id: str = Field(min_length=1, max_length=100)
    razorpay_signature: str = Field(min_length=1, max_length=256)


class ConsumeMinuteRequest(BaseModel):
    session_id: str = Field(min_length=1, max_length=64)
    minute_number: int = Field(ge=1, le=120)


# ---------- MOCK INTERVIEW ----------

class CreateMockInterviewRequest(BaseModel):
    job_role: str = "Full Stack Developer"
    technologies: list[str] = Field(default_factory=list)
    interview_type: str = "Full Mock Interview"
    difficulty: str = "Adaptive"
    duration_minutes: int = Field(default=30, ge=5, le=120)


class RespondMockInterviewRequest(BaseModel):
    response: str = Field(min_length=1)


class MockInterviewTurnResponse(BaseModel):
    id: int
    turn_number: int
    category: str
    question: str
    candidate_response: str | None = None
    score: float | None = None
    feedback_positive: str | None = None
    feedback_missing: str | None = None
    feedback_improvements: str | None = None
    expected_key_points: list[str] = Field(default_factory=list)
    answered_at: str | None = None


class MockInterviewSessionResponse(BaseModel):
    id: str
    job_role: str
    technologies: list[str] = Field(default_factory=list)
    interview_type: str
    difficulty: str
    duration_minutes: int
    status: str
    start_time: str | None = None
    end_time: str | None = None
    turns: list[MockInterviewTurnResponse] = Field(default_factory=list)
    report_id: int | None = None
    created_at: str | None = None


class MockInterviewReportResponse(BaseModel):
    id: int
    session_id: str
    job_role: str
    overall_score: float
    total_questions: int
    correct_count: int
    partially_correct_count: int
    incorrect_count: int
    duration_seconds: int
    category_scores: dict[str, float] = Field(default_factory=dict)
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    knowledge_gaps: list[str] = Field(default_factory=list)
    recommended_questions: list[str] = Field(default_factory=list)
    learning_roadmap: list[dict] = Field(default_factory=list)
    summary: str = ""
    turns: list[MockInterviewTurnResponse] = Field(default_factory=list)
    created_at: str | None = None
