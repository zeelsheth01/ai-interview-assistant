from fastapi import APIRouter, UploadFile, File
import os
import pdfplumber
import requests
from app.services.ocr_parser import extract_text_from_image_pdf
import psycopg2

conn = psycopg2.connect(
    database="ai_interview_db",
    user="postgres",
    password="test123",   # <-- PUT CORRECT PASSWORD
    host="localhost",
    port="5432"
)

cursor = conn.cursor()

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

    # OCR extraction
    resume_text = extract_text_from_image_pdf(file_path)

    print("OCR TEXT LENGTH:", len(resume_text))

    # 🔥 INSERT RESUME INTO DATABASE
    cursor.execute("""
        INSERT INTO resumes (user_id, file_name, file_path, extracted_text)
        VALUES (%s, %s, %s, %s)
        RETURNING id;
    """, (1, file.filename, file_path, resume_text))  # user_id=1 temporary

    resume_id = cursor.fetchone()[0]

    # AI question generation
    questions_text = generate_questions(resume_text)

    # Split questions into lines
    questions_list = questions_text.split("\n")

    for q in questions_list:
        if q.strip() != "":
            cursor.execute("""
                INSERT INTO interview_questions (resume_id, question)
                VALUES (%s, %s);
            """, (resume_id, q.strip()))

    conn.commit()

    return {
        "msg": "Resume uploaded & saved successfully",
        "resume_id": resume_id
    }