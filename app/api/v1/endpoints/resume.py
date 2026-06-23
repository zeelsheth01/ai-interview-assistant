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


# ===== Extract text from PDF =====
def extract_resume_text(file_path: str) -> str:
    text = ""

    try:
        doc = fitz.open(file_path)
        for page in doc:
            page_text = page.get_text()
            if page_text:
                text += page_text + "\n"
    except Exception as e:
        print(f"PyMuPDF extraction failed: {e}")

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

    if len(text.strip()) < 50:
        try:
            import pytesseract
            from PIL import Image

            doc = fitz.open(file_path)
            ocr_text = ""

            for page in doc:
                pix = page.get_pixmap()
                img = Image.frombytes(
                    "RGB",
                    [pix.width, pix.height],
                    pix.samples
                )

                page_text = pytesseract.image_to_string(img)
                ocr_text += page_text + "\n"

            if ocr_text.strip():
                text = ocr_text

        except Exception as e:
            print(f"OCR extraction failed: {e}")

    return text


# ===== Simple Skill Extractor =====
def extract_skills(resume_text: str):
    known_skills = [
        "React",
        "Next.js",
        "Node.js",
        "Express",
        "JavaScript",
        "TypeScript",
        "Python",
        "FastAPI",
        "Django",
        "Flask",
        "Java",
        "Spring Boot",
        "PostgreSQL",
        "MySQL",
        "MongoDB",
        "Prisma",
        "Redis",
        "Docker",
        "AWS",
        "Firebase",
        "Git",
        "GitHub",
        "HTML",
        "CSS",
        "Tailwind CSS",
        "Bootstrap",
        "Flutter",
        "React Native",
        "Angular",
        "C",
        "C++",
        "REST API"
    ]

    found_skills = []

    for skill in known_skills:
        if skill.lower() in resume_text.lower():
            found_skills.append(skill)

    return list(set(found_skills))


# ===== Upload API =====
@router.post("/resume/upload")
async def upload_resume(file: UploadFile = File(...)):

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Extract resume text
    resume_text = extract_resume_text(file_path)

    print("EXTRACTED TEXT LENGTH:", len(resume_text))

    # Extract skills
    skills_list = extract_skills(resume_text)

    # Generate Interview Questions
    prompt = f"""
    You are an expert technical interviewer.

    Based on the following resume text,
    generate exactly 10 technical interview questions.

    Focus on:
    - Skills
    - Frameworks
    - Projects
    - Experience

    Return ONLY questions.
    One question per line.

    Resume:
    {resume_text}
    """

    try:
        questions_text = LLMProvider.generate(prompt)

    except Exception as e:
        print(f"Question generation failed: {e}")

        questions_text = """
        Explain React Hooks.
        What is Node.js?
        Difference between SQL and NoSQL?
        Explain REST APIs.
        What is JWT Authentication?
        Explain PostgreSQL indexing.
        What is Docker?
        What is Prisma ORM?
        Explain React State Management.
        Tell us about your recent project.
        """

    questions_list = [
        q.strip()
        for q in questions_text.split("\n")
        if q.strip()
    ]

    questions_list = questions_list[:10]

    # Create test user if none exists
    user = await db.user.find_first()

    if not user:
        user = await db.user.create(
            data={
                "email": "test@gmail.com",
                "password": "password"
            }
        )

    user_id = user.id

    # Save Resume
    resume = await db.resume.create(
        data={
            "userId": user_id,
            "fileName": file.filename,
            "filePath": file_path,
            "extractedText": resume_text,
            "resultJson": json.dumps(
                {
                    "questions": questions_list,
                    "skills": skills_list
                }
            )
        }
    )

    # Save Questions
    if questions_list:
        await db.interviewquestion.create_many(
            data=[
                {
                    "resumeId": resume.id,
                    "question": question
                }
                for question in questions_list
            ]
        )

    # Save Skills
    if skills_list:
        await db.skill.create_many(
            data=[
                {
                    "resumeId": resume.id,
                    "skillName": skill,
                    "confidenceScore": 1.0
                }
                for skill in skills_list
            ]
        )

    return {
        "msg": "Resume uploaded successfully",
        "resume_id": resume.id,
        "questions": questions_list,
        "skills": skills_list
    }


@router.get("/resume/{resume_id}")
async def get_resume(resume_id: int):

    resume = await db.resume.find_unique(
        where={"id": resume_id},
        include={
            "questions": True,
            "skills": True
        }
    )

    if not resume:
        return {
            "questions": [],
            "skills": []
        }

    questions = [
        q.question
        for q in resume.questions
    ]

    skills = [
        s.skillName
        for s in resume.skills
    ]

    return {
        "questions": questions,
        "skills": skills
    }