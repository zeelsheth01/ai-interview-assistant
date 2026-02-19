from fastapi import APIRouter, UploadFile, File

router = APIRouter()

@router.post("/resume/upload")
async def upload_resume(file: UploadFile = File(...)):

    content = await file.read()

    print("Uploaded file:", file.filename)

    # simulate parsing
    return {"msg": "Resume uploaded successfully"}
