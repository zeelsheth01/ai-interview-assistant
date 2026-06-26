from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session

from app.models.schemas import RegisterRequest, LoginRequest, GoogleAuthRequest, ForgotPasswordRequest
from app.models.user import User
from app.db.session import SessionLocal
from google.oauth2 import id_token
from google.auth.transport import requests

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


# ==========================================
# PASTE GOOGLE LOGIN CODE BELOW THIS LINE
# ==========================================

@router.post("/google")
async def google_login(data: GoogleAuthRequest):

    db: Session = SessionLocal()

    try:
        user_info = id_token.verify_oauth2_token(
            data.credential,
            requests.Request(),
            "887184951396-bhmccf8fvinbjdrah03olo8mp7kbmvkn.apps.googleusercontent.com"
        )

        email = user_info["email"]
        google_id = user_info["sub"]
        full_name = user_info.get("name")

        user = db.query(User).filter(
            User.email == email
        ).first()

        if not user:

            user = User(
                email=email,
                google_id=google_id,
                full_name=full_name,
                password=None
            )

            db.add(user)
            db.commit()
            db.refresh(user)

        db.close()

        return {
            "token": "google-jwt-token",
            "email": email
        }

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Google authentication failed"
        )


@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):

    db: Session = SessionLocal()

    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if not user:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user.password = data.new_password
    db.commit()
    db.refresh(user)
    db.close()

    return {"msg": "Password updated successfully"}

    