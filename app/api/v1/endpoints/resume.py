from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import shutil

from app.services.interview_service import InterviewService
from app.db.dependencies import get_db
from app.models.resume import Resume

router = APIRouter()

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):

    # ✅ Save uploaded file
    file_location = f"uploads/{file.filename}"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # ✅ Process using AI service
    service = InterviewService()
    result = await service.process(file_location)

    # ✅ Save result into database
    new_resume = Resume(
        file_path=file_location,
        result_json=result
    )

    db.add(new_resume)
    await db.commit()

    # optional:
    await db.refresh(new_resume)

    return {
        "message": "Upload successful",
        "analysis": result
    }
