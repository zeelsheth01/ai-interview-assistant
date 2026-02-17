from fastapi import APIRouter, UploadFile, File
import shutil

from app.services.interview_service import InterviewService

router = APIRouter(prefix="/resume", tags=["Resume"])


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):

    file_location = f"uploads/{file.filename}"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    service = InterviewService()

    result = await service.process(file_location)

    return {
        "message": "Resume processed",
        "analysis": result
    }
