from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# IMPORT ROUTERS
from app.api.v1.endpoints.resume import router as resume_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.ai import router as ai_router
from app.db.session import db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect Prisma to PostgreSQL
    print("Connecting database...")
    await db.connect()
    yield
    # Disconnect database
    print("Disconnecting database...")
    await db.disconnect()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# REGISTER ROUTERS
app.include_router(resume_router)
app.include_router(auth_router)
app.include_router(ai_router, prefix="/ai")