from datetime import datetime, timedelta, timezone

import bcrypt
from jose import jwt

from app.core.config import settings

ALGORITHM = "HS256"
TOKEN_LIFETIME = timedelta(hours=12)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("ascii")


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("ascii"))
    except (ValueError, TypeError):
        return False


def create_token(data: dict[str, str | int]) -> str:
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + TOKEN_LIFETIME
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)
