from fastapi import APIRouter, UploadFile, File
import os
import fitz
import json

from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.user import User
from app.models.resume import Resume
from app.models.skill import Skill
from app.models.interview_question import InterviewQuestion
from app.services.llm_provider import LLMProvider

router = APIRouter()

UPLOAD_DIR = "app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


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

    return text


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


@router.post("/resume/upload")
async def upload_resume(file: UploadFile = File(...)):

    db: Session = SessionLocal()

    try:
        file_path = os.path.join(
            UPLOAD_DIR,
            file.filename
        )

        with open(file_path, "wb") as f:
            f.write(await file.read())

        resume_text = extract_resume_text(file_path)

        skills_list = extract_skills(resume_text)

        prompt = f"""
Generate exactly 10 technical interview questions.

Resume:
{resume_text}
"""

        try:
            questions_text = LLMProvider.generate(prompt)

        except Exception as e:
            print("LLM Error:", e)

            questions_text = """
Explain React Hooks.
What is Node.js?
Difference between SQL and NoSQL?
Explain REST APIs?
What is JWT Authentication?
Explain Docker.
Explain PostgreSQL.
Explain FastAPI.
Explain MongoDB.
Tell me about your project.
"""

        questions_list = [
            q.strip()
            for q in questions_text.split("\n")
            if q.strip()
        ][:10]

        user = db.query(User).first()

        if not user:
            user = User(
                email="test@gmail.com",
                password="password"
            )

            db.add(user)
            db.commit()
            db.refresh(user)

        resume = Resume(
            file_name=file.filename,
            file_path=file_path,
            extracted_text=resume_text,
            result_json=json.dumps(
                {
                    "questions": questions_list,
                    "skills": skills_list
                }
            )
        )

        db.add(resume)
        db.commit()
        db.refresh(resume)

        for question in questions_list:
            db.add(
                InterviewQuestion(
                    resume_id=resume.id,
                    question=question
                )
            )

        for skill in skills_list:
            db.add(
                Skill(
                    resume_id=resume.id,
                    skill_name=skill,
                    confidence_score=1.0
                )
            )

        db.commit()

        return {
            "msg": "Resume uploaded successfully",
            "resume_id": resume.id,
            "questions": questions_list,
            "skills": skills_list
        }

    finally:
        db.close()


@router.get("/resume/{resume_id}")
async def get_resume(resume_id: int):

    db: Session = SessionLocal()

    try:
        resume = (
            db.query(Resume)
            .filter(Resume.id == resume_id)
            .first()
        )

        if not resume:
            return {
                "questions": [],
                "skills": []
            }

        questions = (
            db.query(InterviewQuestion)
            .filter(
                InterviewQuestion.resume_id == resume_id
            )
            .all()
        )

        skills = (
            db.query(Skill)
            .filter(
                Skill.resume_id == resume_id
            )
            .all()
        )

        return {
            "questions": [
                q.question for q in questions
            ],
            "skills": [
                s.skill_name for s in skills
            ]
        }

    finally:
        db.close()