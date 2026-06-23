from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.base import Base

class InterviewQuestion(Base):

    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True)

    resume_id = Column(
        Integer,
        ForeignKey("resumes.id")
    )

    question = Column(String)