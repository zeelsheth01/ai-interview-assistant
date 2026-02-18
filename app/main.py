from fastapi import FastAPI
from app.db.session import engine
from app.db.base import Base

from app.api.v1.endpoints import auth, resume
from app.api.v1.endpoints import ai

app = FastAPI()


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


app.include_router(auth.router, prefix="/auth")
app.include_router(resume.router, prefix="/resume")


app.include_router(ai.router, prefix="/ai")
