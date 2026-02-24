from fastapi import APIRouter, HTTPException
from app.models.schemas import RegisterRequest, LoginRequest
import psycopg2

router = APIRouter(prefix="/auth")

conn = psycopg2.connect(
    database="ai_interview_db",
    user="postgres",
    password="test123",   # your real password
    host="localhost",
    port="5432"
)

cursor = conn.cursor()

# REGISTER
@router.post("/register")
def register(data: RegisterRequest):

    cursor.execute("SELECT * FROM users WHERE email=%s", (data.email,))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="User already exists")

    cursor.execute(
        "INSERT INTO users (email, password) VALUES (%s, %s)",
        (data.email, data.password)
    )

    conn.commit()

    return {"msg": "registered successfully"}


# LOGIN
@router.post("/login")
def login(data: LoginRequest):

    cursor.execute("SELECT password FROM users WHERE email=%s", (data.email,))
    user = cursor.fetchone()

    if not user or user[0] != data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"token": "dummy-jwt-token"}