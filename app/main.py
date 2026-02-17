from fastapi import FastAPI

from app.db.base import Base
from app.db.session import engine

from app.api.v1.endpoints import auth, resume

# ✅ Create app FIRST
app = FastAPI()

# ✅ Include routers
app.include_router(auth.router, prefix="/auth")
app.include_router(resume.router, prefix="/resume")

# ✅ Create tables automatically on startup
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
