from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
async def register_user():
    return {"message": "register logic here"}

@router.post("/login")
async def login_user():
    return {"message": "login logic here"}
