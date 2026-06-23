from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session

from app.models.schemas import RegisterRequest, LoginRequest
from app.models.user import User
from app.db.session import SessionLocal

router = APIRouter(prefix="/auth")


@router.post("/register")
async def register(data: RegisterRequest):

    db: Session = SessionLocal()

    existing_user = db.query(User).filter(
        User.email == data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )

    user = User(
        email=data.email,
        password=data.password
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    db.close()

    return {"msg": "registered successfully"}


@router.post("/login")
async def login(data: LoginRequest):

    db: Session = SessionLocal()

    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if not user or user.password != data.password:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    db.close()

    return {"token": "dummy-jwt-token"}