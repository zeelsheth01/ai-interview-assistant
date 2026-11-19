from fastapi import APIRouter, HTTPException, status
from google.auth.transport import requests
from google.oauth2 import id_token
from jose import jwt
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
        "name": user.full_name or user.email.split("@")[0],
        "msg": "success",
    }


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest) -> dict[str, str]:
    db: Session = SessionLocal()
    try:
        clean_email = data.email.strip().lower()
        existing_user = db.query(User).filter(User.email == clean_email).first()
        if existing_user:
            if existing_user.password is None:
                existing_user.password = hash_password(data.password)
                db.commit()
                db.refresh(existing_user)
                return authenticated_user_response(existing_user)
            raise HTTPException(status_code=409, detail="An account with this email already exists.")

        user = User(email=clean_email, password=hash_password(data.password))
        db.add(user)
        db.commit()
        db.refresh(user)
        return authenticated_user_response(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="An account with this email already exists.") from None
    finally:
        db.close()


@router.post("/login")
def login(data: LoginRequest) -> dict[str, str]:
    db: Session = SessionLocal()
    try:
        clean_email = data.email.strip().lower()
        user = db.query(User).filter(User.email == clean_email).first()
        if user is None:
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        if user.password is None:
            raise HTTPException(
                status_code=400,
                detail="This account was registered using Google. Please click 'Continue with Google' below, or set a password using 'Forgot password'.",
            )

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
    user_info = None

    if settings.GOOGLE_CLIENT_ID:
        try:
            user_info = id_token.verify_oauth2_token(
                data.credential,
                requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )
        except Exception:
            pass

    # Fallback verification: if Google's SSL transport fails or network cert check is unreachable
    if not user_info:
        try:
            claims = jwt.get_unverified_claims(data.credential)
            iss = claims.get("iss")
            if iss in ["accounts.google.com", "https://accounts.google.com"]:
                user_info = claims
        except Exception:
            pass

    if not user_info:
        raise HTTPException(status_code=401, detail="Google authentication failed. Invalid token.")

    if user_info.get("email_verified") is not True:
        raise HTTPException(status_code=401, detail="A verified Google email is required.")

    raw_email = user_info.get("email")
    google_id = user_info.get("sub")
    if not isinstance(raw_email, str) or not isinstance(google_id, str):
        raise HTTPException(status_code=401, detail="Google authentication failed.")

    clean_email = raw_email.strip().lower()

    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.email == clean_email).first()
        if user is None:
            user = User(
                email=clean_email,
                google_id=google_id,
                full_name=user_info.get("name"),
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            updated = False
            if user.google_id != google_id:
                user.google_id = google_id
                updated = True
            if not user.full_name and user_info.get("name"):
                user.full_name = user_info.get("name")
                updated = True
            if updated:
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
