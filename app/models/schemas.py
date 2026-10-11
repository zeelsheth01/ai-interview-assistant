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