from fastapi import APIRouter, UploadFile, File
import os
import pdfplumber
import requests
from app.services.ocr_parser import extract_text_from_image_pdf


router = APIRouter()

UPLOAD_DIR = "app/uploads"


# ===== Extract text from PDF =====
def extract_resume_text(file_path: str):

    text = ""

    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text

    return text


# ===== Generate questions using OLLAMA =====


def generate_questions(resume_text):

    prompt = f"""
You are an expert technical interviewer.

Read this resume content:

{resume_text}

Generate ONLY technical interview questions based on skills mentioned.
If Java is present -> ask Java questions.
If React present -> React questions.
DO NOT say "resume not provided".
"""

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3",
            "prompt": prompt,
            "stream": False
        }
    )

    data = response.json()

    return data["response"]

# ===== Upload API =====
@router.post("/resume/upload")
async def upload_resume(file: UploadFile = File(...)):

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    # ⭐ OCR extraction
    resume_text = extract_text_from_image_pdf(file_path)

    print("OCR TEXT LENGTH:", len(resume_text))

    # ⭐ AI question generation
    questions = generate_questions(resume_text)

    return {
        "msg": "Resume uploaded successfully",
        "questions": questions
    }
