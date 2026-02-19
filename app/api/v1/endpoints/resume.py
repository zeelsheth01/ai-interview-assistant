from fastapi import APIRouter, UploadFile, File
import os
import pdfplumber
import requests

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


def generate_questions(file_path):

    prompt = """
    Analyze this resume and generate technical interview questions
    based ONLY on skills mentioned.
    """

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3",
            "prompt": prompt,
            "stream": False
        }
    )

    return response.json()["response"]

# ===== Upload API =====
@router.post("/resume/upload")
async def upload_resume(file: UploadFile = File(...)):

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    resume_text = extract_resume_text(file_path)
    

    questions = generate_questions(file_path)



    questions = generate_questions(resume_text)

    return {
        "msg": "Resume uploaded successfully",
        "questions": questions
    }
