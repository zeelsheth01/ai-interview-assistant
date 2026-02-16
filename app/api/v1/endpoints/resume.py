from fastapi import APIRouter, UploadFile
from app.services.resume_service import upload_resume

router = APIRouter(prefix="/resume", tags=["Resume"])

@router.post("/upload")
async def upload(file: UploadFile):
    return await upload_resume(file)

@router.get("/{id}")
async def get_resume(id: int):
    return {"resume_id": id}
