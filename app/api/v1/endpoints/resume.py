from fastapi import APIRouter, UploadFile, File
import os
import fitz  # PyMuPDF
import json
from app.db.session import db
from app.services.llm_provider import LLMProvider

router = APIRouter()
UPLOAD_DIR = "app/uploads"

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ===== Hybrid Extract text from PDF =====
def extract_resume_text(file_path: str) -> str:
    text = ""
    # 1. Try PyMuPDF (fitz) - extremely fast and native
    try:
        doc = fitz.open(file_path)
        for page in doc:
            page_text = page.get_text()
            if page_text:
                text += page_text + "\n"
    except Exception as e:
        print(f"PyMuPDF extraction failed: {e}")

    # 2. Try pdfplumber as a fallback for text extraction
    if len(text.strip()) < 50:
        try:
            import pdfplumber
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            print(f"pdfplumber extraction failed: {e}")

    # 3. Fallback to pytesseract OCR for scanned/image PDFs
    if len(text.strip()) < 50:
        try:
            import pytesseract
            from PIL import Image
            doc = fitz.open(file_path)
            ocr_text = ""
            for page in doc:
                pix = page.get_pixmap()
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                page_text = pytesseract.image_to_string(img)
                ocr_text += page_text + "\n"
            if ocr_text.strip():
                text = ocr_text
        except Exception as e:
            print(f"OCR extraction skipped or failed: {e}. Using empty text fallback.")

    return text

# ===== Upload API =====
@router.post("/resume/upload")
async def upload_resume(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    # Save file
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Text extraction
    resume_text = extract_resume_text(file_path)
    print("EXTRACTED TEXT LENGTH:", len(resume_text))

    # Generate questions via Gemini
    prompt = f"""
    You are an expert technical interviewer.
    Based on the following resume text, generate exactly 10 technical interview questions.
    The questions should focus on the candidate's skills, frameworks, and projects.
    Return ONLY the questions, one per line. Do NOT include numbers, bullet points, difficulty markers, or introductory text.
    
    Resume:
    {resume_text}
    """
    try:
        questions_text = LLMProvider.generate(prompt)
    except Exception as e:
        print(f"Question generation failed: {e}")
        questions_text = "Failed to generate questions. Please try again."

    # Convert to clean list
    questions_list = [
        q.strip() for q in questions_text.split("\n")
        if q.strip() != ""
    ]
    # Limit to 10 questions
    questions_list = questions_list[:10]

    # Ensure at least one mock user exists to link the resume
    user = await db.user.find_first()
    if not user:
        user = await db.user.create(
            data={
                "email": "test@gmail.com",
                "password": "password"
            }
        )
    user_id = user.id

    # Create Resume in DB
    resume = await db.resume.create(
        data={
            "userId": user_id,
            "fileName": file.filename,
            "filePath": file_path,
            "extractedText": resume_text,
            "resultJson": json.dumps({"questions": questions_list})
        }
    )

    # Bulk create questions
    if questions_list:
        await db.interviewquestion.create_many(
            data=[
                {"resumeId": resume.id, "question": question}
                for question in questions_list
            ]
        )

    return {
        "msg": "Resume uploaded & questions generated",
        "resume_id": resume.id,
        "questions": questions_list
    }

@router.get("/resume/{resume_id}")
async def get_resume(resume_id: int):
    print("GET RESUME CALLED:", resume_id)
    
    resume = await db.resume.find_unique(
        where={"id": resume_id},
        include={"questions": True}
    )

    if not resume:
        return {"questions": []}

    # Pull questions from DB relation
    questions_list = [q.question for q in resume.questions]
    
    return {
        "questions": questions_list
    }