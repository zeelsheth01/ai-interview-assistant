import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_cache.backends.inmemory import InMemoryBackend
from redis import asyncio as aioredis

from app.api.v1.endpoints.resume import router as resume_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.ai import router as ai_router
from app.api.v1.endpoints.payments import router as payments_router
from app.api.v1.endpoints.mock_interview import router as mock_interview_router

from app.db.base import Base
from app.db.session import engine
from app.models.user import User
from app.models.resume import Resume
from app.models.skill import Skill
from app.models.interview_question import InterviewQuestion
from app.models.payment import PaymentOrder, MinuteUsage
from app.models.mock_interview import MockInterviewSession, MockInterviewTurn, MockInterviewReport

Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        redis = aioredis.from_url("redis://localhost", encoding="utf8", decode_responses=True)
        await asyncio.wait_for(redis.ping(), timeout=1.0)
        FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")
    except Exception:
        FastAPICache.init(InMemoryBackend(), prefix="fastapi-cache")
    yield

app = FastAPI(lifespan=lifespan)

@app.get("/")
def home():
    return {
        "message": "AI Interview Assistant API Running Successfully"
    }

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://ai-interview-assistant-1-atvh.onrender.com",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume_router)
app.include_router(auth_router)
app.include_router(ai_router, prefix="/ai")
app.include_router(payments_router)
app.include_router(mock_interview_router)