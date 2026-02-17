from fastapi import APIRouter, UploadFile, File
import shutil
import os

from app.services.interview_service import InterviewService

router = APIRouter()

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):

    file_location = f"{UPLOAD_DIR}/{file.filename}"

    # save file
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # process resume via AI pipeline
    service = InterviewService()

    result = await service.process(file_location)

    return {
        "message": "Resume processed",
        "analysis": result
    }
