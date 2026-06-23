from fastapi import APIRouter, HTTPException
from app.models.schemas import RegisterRequest, LoginRequest
from app.db.session import db

router = APIRouter(prefix="/auth")

# REGISTER
@router.post("/register")
async def register(data: RegisterRequest):
    user = await db.user.find_unique(where={"email": data.email})
    if user:
        raise HTTPException(status_code=400, detail="User already exists")

    await db.user.create(
        data={
            "email": data.email,
            "password": data.password
        }
    )

    return {"msg": "registered successfully"}


# LOGIN
@router.post("/login")
async def login(data: LoginRequest):
    user = await db.user.find_unique(where={"email": data.email})

    if not user or user.password != data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"token": "dummy-jwt-token"}