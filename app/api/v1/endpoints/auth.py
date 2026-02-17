from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.dependencies import get_db
from app.models.user import User
from app.core.security import hash_password, create_token

router = APIRouter()

@router.post("/register")
async def register(email:str, password:str, db:AsyncSession=Depends(get_db)):

    user = User(email=email, password=hash_password(password))

    db.add(user)
    await db.commit()

    return {"msg":"registered"}

@router.post("/login")
async def login(email:str, password:str):

    return {"token": create_token({"email":email})}
