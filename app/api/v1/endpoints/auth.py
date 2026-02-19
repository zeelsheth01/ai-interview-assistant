from fastapi import APIRouter, HTTPException
from app.models.schemas import RegisterRequest, LoginRequest

router = APIRouter()

fake_users_db = {}

@router.post("/register")
def register(data: RegisterRequest):

    if data.email in fake_users_db:
        raise HTTPException(status_code=400, detail="User exists")

    fake_users_db[data.email] = data.password

    return {"msg": "registered"}


@router.post("/login")
def login(data: LoginRequest):

    if fake_users_db.get(data.email) != data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"token": "dummy-jwt-token"}
