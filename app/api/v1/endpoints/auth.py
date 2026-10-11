from fastapi import APIRouter, HTTPException, status
from google.auth.transport import requests
from google.oauth2 import id_token
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_token, hash_password, verify_password
from app.db.session import SessionLocal
from app.models.schemas import (
    ForgotPasswordRequest,
    GoogleAuthRequest,
    LoginRequest,
    RegisterRequest,
)
from app.models.user import User

router = APIRouter(prefix="/auth")


def authenticated_user_response(user: User) -> dict[str, str]:
    return {
        "token": create_token({"sub": str(user.id), "email": user.email}),
        "email": user.email,
    }


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest) -> dict[str, str]:
    db: Session = SessionLocal()
    try:
        if db.query(User).filter(User.email == data.email).first():
            raise HTTPException(status_code=409, detail="An account with this email already exists.")

        user = User(email=data.email, password=hash_password(data.password))
        db.add(user)
        db.commit()
        return {"msg": "registered successfully"}
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="An account with this email already exists.") from None
    finally:
        db.close()


@router.post("/login")
def login(data: LoginRequest) -> dict[str, str]:
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.email == data.email).first()
        if user is None or user.password is None:
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        stored_password = user.password
        is_bcrypt_hash = stored_password.startswith(("$2a$", "$2b$", "$2y$"))
        is_valid = (
            verify_password(data.password, stored_password)
            if is_bcrypt_hash
            else data.password == stored_password
        )
        if not is_valid:
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        if not is_bcrypt_hash:
            user.password = hash_password(data.password)
            db.commit()

        return authenticated_user_response(user)
    finally:
        db.close()


@router.post("/google")
def google_login(data: GoogleAuthRequest) -> dict[str, str]:
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=503, detail="Google sign-in is not configured.")

    try:
        user_info = id_token.verify_oauth2_token(
            data.credential,
            requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except ValueError:
        raise HTTPException(status_code=401, detail="Google authentication failed.") from None

    if user_info.get("email_verified") is not True:
        raise HTTPException(status_code=401, detail="A verified Google email is required.")

    email = user_info.get("email")
    google_id = user_info.get("sub")
    if not isinstance(email, str) or not isinstance(google_id, str):
        raise HTTPException(status_code=401, detail="Google authentication failed.")

    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user is None:
            user = User(
                email=email,
                google_id=google_id,
                full_name=user_info.get("name"),
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        elif user.google_id != google_id:
            user.google_id = google_id
            db.commit()

        return authenticated_user_response(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Unable to create the Google account.") from None
    finally:
        db.close()


@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest) -> dict[str, str]:
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.email == data.email).first()
        if user is None:
            raise HTTPException(status_code=404, detail="User not found.")

        user.password = hash_password(data.new_password)
        db.commit()
        return {"msg": "Password updated successfully"}
    finally:
        db.close()
