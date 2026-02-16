# app/api/v1/endpoints/resume.py

from fastapi import APIRouter, UploadFile, File
from app.services.resume_parser_service import extract_text
from app.services.ai_service import extract_skills
from app.core.database import save_resume

router = APIRouter()

@router.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):

    # Step 1: Extract text
    text = await extract_text(file)

    # Step 2: Send text to AI
    skills = await extract_skills(text)

    # Step 3: Save in DB
    await save_resume(text, skills)

    return {
        "message": "Resume processed",
        "skills": skills
    }
