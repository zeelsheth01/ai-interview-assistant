from fastapi import FastAPI
from app.api.v1.endpoints import auth, resume

app = FastAPI()

app.include_router(auth.router, prefix="/auth")
app.include_router(resume.router, prefix="/resume")
