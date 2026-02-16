from fastapi import FastAPI
from app.api.v1.endpoints import auth, resume, interview
from dotenv import load_dotenv
load_dotenv()



app = FastAPI()

app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(interview.router)
