from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel

from app.db.dependencies import get_db
from app.models.user import User
from app.core.security import hash_password, create_token

router = APIRouter()


# =========================
# Request Models (JSON BODY)
# =========================

class RegisterRequest(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


# =========================
# REGISTER
# =========================

@router.post("/register")
async def register(
    data: RegisterRequest,
    db: AsyncSession = Depends(get_db)
):

    user = User(
        email=data.email,
        password=hash_password(data.password)
    )

    db.add(user)

    try:
        await db.commit()

    except IntegrityError:

        await db.rollback()

        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    return {"msg": "registered"}


# =========================
# LOGIN
# =========================

@router.post("/login")
async def login(data: LoginRequest):

    token = create_token({
        "email": data.email
    })

    return {"token": token}
