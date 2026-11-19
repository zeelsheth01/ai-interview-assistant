import uuid
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class MockInterviewSession(Base):
    __tablename__ = "mock_interview_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    job_role = Column(String, nullable=False)
    technologies = Column(Text, nullable=False, default="[]")  # JSON encoded list of strings
    interview_type = Column(String, nullable=False, default="Full Mock Interview")
    difficulty = Column(String, nullable=False, default="Adaptive")
    duration_minutes = Column(Integer, nullable=False, default=30)
    status = Column(String, nullable=False, default="in_progress", index=True)  # in_progress, completed, terminated
    start_time = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    turns = relationship(
        "MockInterviewTurn",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="MockInterviewTurn.turn_number"
    )
    report = relationship(
        "MockInterviewReport",
        back_populates="session",
        uselist=False,
        cascade="all, delete-orphan"
    )


class MockInterviewTurn(Base):
    __tablename__ = "mock_interview_turns"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(36), ForeignKey("mock_interview_sessions.id"), nullable=False, index=True)
    turn_number = Column(Integer, nullable=False)
    category = Column(String, nullable=False)
    question = Column(Text, nullable=False)
    candidate_response = Column(Text, nullable=True)
    score = Column(Float, nullable=True)  # 0 to 10
    feedback_positive = Column(Text, nullable=True)
    feedback_missing = Column(Text, nullable=True)
    feedback_improvements = Column(Text, nullable=True)
    expected_key_points = Column(Text, nullable=True)  # JSON encoded list
    evaluation_json = Column(Text, nullable=True)
    answered_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    session = relationship("MockInterviewSession", back_populates="turns")


class MockInterviewReport(Base):
    __tablename__ = "mock_interview_reports"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(36), ForeignKey("mock_interview_sessions.id"), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    overall_score = Column(Float, nullable=False)  # 0 to 100
    total_questions = Column(Integer, nullable=False)
    correct_count = Column(Integer, nullable=False)
    partially_correct_count = Column(Integer, nullable=False)
    incorrect_count = Column(Integer, nullable=False)
    duration_seconds = Column(Integer, nullable=False, default=0)
    category_scores = Column(Text, nullable=False, default="{}")  # JSON map {category: score}
    strengths = Column(Text, nullable=False, default="[]")  # JSON list
    weaknesses = Column(Text, nullable=False, default="[]")  # JSON list
    knowledge_gaps = Column(Text, nullable=False, default="[]")  # JSON list
    recommended_questions = Column(Text, nullable=False, default="[]")  # JSON list
    learning_roadmap = Column(Text, nullable=False, default="[]")  # JSON list of dicts
    summary = Column(Text, nullable=False, default="")
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    session = relationship("MockInterviewSession", back_populates="report")
