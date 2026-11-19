import json
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.dependencies import get_db
from app.models.mock_interview import MockInterviewReport, MockInterviewSession, MockInterviewTurn
from app.models.schemas import (
    CreateMockInterviewRequest,
    MockInterviewReportResponse,
    MockInterviewSessionResponse,
    MockInterviewTurnResponse,
    RespondMockInterviewRequest,
)
from app.models.user import User
from app.services.mock_interview_service import (
    FIRST_QUESTION,
    INTERVIEW_CATEGORIES,
    MockInterviewService,
)

router = APIRouter(prefix="/mock-interview", tags=["Mock Interview"])


def _format_turn_response(turn: MockInterviewTurn) -> MockInterviewTurnResponse:
    key_points = []
    if turn.expected_key_points:
        try:
            key_points = json.loads(turn.expected_key_points)
        except Exception:
            key_points = [turn.expected_key_points]

    return MockInterviewTurnResponse(
        id=turn.id,
        turn_number=turn.turn_number,
        category=turn.category,
        question=turn.question,
        candidate_response=turn.candidate_response,
        score=turn.score,
        feedback_positive=turn.feedback_positive,
        feedback_missing=turn.feedback_missing,
        feedback_improvements=turn.feedback_improvements,
        expected_key_points=key_points,
        answered_at=turn.answered_at.isoformat() if turn.answered_at else None,
    )


def _format_session_response(session: MockInterviewSession) -> MockInterviewSessionResponse:
    technologies = []
    if session.technologies:
        try:
            technologies = json.loads(session.technologies)
        except Exception:
            technologies = [session.technologies]

    return MockInterviewSessionResponse(
        id=session.id,
        job_role=session.job_role,
        technologies=technologies,
        interview_type=session.interview_type,
        difficulty=session.difficulty,
        duration_minutes=session.duration_minutes,
        status=session.status,
        start_time=session.start_time.isoformat() if session.start_time else None,
        end_time=session.end_time.isoformat() if session.end_time else None,
        turns=[_format_turn_response(t) for t in session.turns],
        report_id=session.report.id if session.report else None,
        created_at=session.created_at.isoformat() if session.created_at else None,
    )


@router.post("/sessions", response_model=MockInterviewSessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(
    data: CreateMockInterviewRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Initialize a new Mock Interview Session with mandatory self-introduction question as Turn 1.
    """
    new_session = MockInterviewSession(
        user_id=user.id,
        job_role=data.job_role.strip(),
        technologies=json.dumps(data.technologies),
        interview_type=data.interview_type.strip(),
        difficulty=data.difficulty.strip(),
        duration_minutes=data.duration_minutes,
        status="in_progress",
    )
    db.add(new_session)
    db.flush()

    # Mandatory First Question: Self Introduction & Academic Background
    turn_one = MockInterviewTurn(
        session_id=new_session.id,
        turn_number=1,
        category="Introduction & Academic Background",
        question=FIRST_QUESTION,
    )
    db.add(turn_one)
    db.commit()
    db.refresh(new_session)

    return _format_session_response(new_session)


@router.get("/sessions", response_model=List[MockInterviewSessionResponse])
def get_user_sessions(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    List all mock interview sessions conducted by the current user.
    """
    sessions = (
        db.query(MockInterviewSession)
        .filter(MockInterviewSession.user_id == user.id)
        .order_by(MockInterviewSession.created_at.desc())
        .all()
    )
    return [_format_session_response(s) for s in sessions]


@router.get("/sessions/{session_id}", response_model=MockInterviewSessionResponse)
def get_session(
    session_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Get session details, full turn history, and status.
    """
    session = (
        db.query(MockInterviewSession)
        .filter(MockInterviewSession.id == session_id, MockInterviewSession.user_id == user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found.")
    return _format_session_response(session)


@router.post("/sessions/{session_id}/respond")
def respond_to_question(
    session_id: str,
    data: RespondMockInterviewRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Submit candidate response to current turn. Evaluates response and dynamically generates the next question.
    """
    session = (
        db.query(MockInterviewSession)
        .filter(MockInterviewSession.id == session_id, MockInterviewSession.user_id == user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found.")

    if session.status != "in_progress":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This interview session has already ended."
        )

    # Find the current pending turn
    pending_turn = (
        db.query(MockInterviewTurn)
        .filter(
            MockInterviewTurn.session_id == session.id,
            MockInterviewTurn.candidate_response.is_(None)
        )
        .order_by(MockInterviewTurn.turn_number.desc())
        .first()
    )

    if not pending_turn:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No pending question awaits an answer in this session."
        )

    # Candidate response text
    candidate_answer = data.response.strip()
    if not candidate_answer:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Candidate response cannot be empty."
        )

    # Load technologies
    technologies = []
    if session.technologies:
        try:
            technologies = json.loads(session.technologies)
        except Exception:
            technologies = [session.technologies]

    # Gather past conversation history
    past_turns = (
        db.query(MockInterviewTurn)
        .filter(
            MockInterviewTurn.session_id == session.id,
            MockInterviewTurn.turn_number < pending_turn.turn_number
        )
        .order_by(MockInterviewTurn.turn_number.asc())
        .all()
    )
    history_records = [
        {
            "turn_number": t.turn_number,
            "category": t.category,
            "question": t.question,
            "candidate_response": t.candidate_response,
            "score": t.score
        }
        for t in past_turns
    ]

    # Evaluate answer and generate next adaptive question
    ai_result = MockInterviewService.evaluate_and_generate_next(
        job_role=session.job_role,
        technologies=technologies,
        interview_type=session.interview_type,
        difficulty=session.difficulty,
        history=history_records,
        current_question=pending_turn.question,
        current_category=pending_turn.category,
        candidate_response=candidate_answer,
        current_turn_number=pending_turn.turn_number,
    )

    eval_data = ai_result.get("evaluation", {})
    next_q_data = ai_result.get("next_question", {})

    # Update pending turn
    pending_turn.candidate_response = candidate_answer
    pending_turn.score = eval_data.get("score")
    pending_turn.feedback_positive = eval_data.get("feedback_positive")
    pending_turn.feedback_missing = eval_data.get("feedback_missing")
    pending_turn.feedback_improvements = eval_data.get("feedback_improvements")
    pending_turn.expected_key_points = json.dumps(eval_data.get("expected_key_points", []))
    pending_turn.answered_at = datetime.now(timezone.utc)

    # Create next turn
    next_turn_number = pending_turn.turn_number + 1
    new_turn = MockInterviewTurn(
        session_id=session.id,
        turn_number=next_turn_number,
        category=next_q_data.get("category", "General Technical Questions"),
        question=next_q_data.get("question", "Could you elaborate on the architecture of your system?"),
    )
    db.add(new_turn)
    db.commit()
    db.refresh(pending_turn)
    db.refresh(new_turn)

    return {
        "evaluation": {
            "score": pending_turn.score,
            "feedback_positive": pending_turn.feedback_positive,
            "feedback_missing": pending_turn.feedback_missing,
            "feedback_improvements": pending_turn.feedback_improvements,
            "expected_key_points": eval_data.get("expected_key_points", []),
        },
        "next_turn": _format_turn_response(new_turn),
        "turn_completed": pending_turn.turn_number,
    }


@router.post("/sessions/{session_id}/complete", response_model=MockInterviewReportResponse)
def complete_interview(
    session_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Conclude mock interview session and generate the final performance assessment report.
    """
    session = (
        db.query(MockInterviewSession)
        .filter(MockInterviewSession.id == session_id, MockInterviewSession.user_id == user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found.")

    # If report already exists, return it
    if session.report:
        return _format_report_response(session.report, session)

    # Mark completed
    now = datetime.now(timezone.utc)
    session.status = "completed"
    session.end_time = now

    # Calculate duration
    start = session.start_time
    if start.tzinfo is None:
        start = start.replace(tzinfo=timezone.utc)
    duration_seconds = max(0, int((now - start).total_seconds()))

    # Gather answered turns
    turns_data = [
        {
            "turn_number": t.turn_number,
            "category": t.category,
            "question": t.question,
            "candidate_response": t.candidate_response,
            "score": t.score,
            "feedback_positive": t.feedback_positive,
            "feedback_missing": t.feedback_missing,
            "feedback_improvements": t.feedback_improvements,
        }
        for t in session.turns
    ]

    technologies = []
    if session.technologies:
        try:
            technologies = json.loads(session.technologies)
        except Exception:
            technologies = [session.technologies]

    # Synthesize comprehensive report via AI service
    report_dict = MockInterviewService.generate_final_report(
        session_id=session.id,
        job_role=session.job_role,
        technologies=technologies,
        interview_type=session.interview_type,
        difficulty=session.difficulty,
        duration_seconds=duration_seconds,
        turns=turns_data,
    )

    new_report = MockInterviewReport(
        session_id=session.id,
        user_id=user.id,
        overall_score=report_dict["overall_score"],
        total_questions=report_dict["total_questions"],
        correct_count=report_dict["correct_count"],
        partially_correct_count=report_dict["partially_correct_count"],
        incorrect_count=report_dict["incorrect_count"],
        duration_seconds=duration_seconds,
        category_scores=json.dumps(report_dict["category_scores"]),
        strengths=json.dumps(report_dict["strengths"]),
        weaknesses=json.dumps(report_dict["weaknesses"]),
        knowledge_gaps=json.dumps(report_dict["knowledge_gaps"]),
        recommended_questions=json.dumps(report_dict["recommended_questions"]),
        learning_roadmap=json.dumps(report_dict["learning_roadmap"]),
        summary=report_dict["summary"],
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    return _format_report_response(new_report, session)


@router.get("/sessions/{session_id}/report", response_model=MockInterviewReportResponse)
def get_report(
    session_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Retrieve existing performance report for a mock interview session.
    """
    session = (
        db.query(MockInterviewSession)
        .filter(MockInterviewSession.id == session_id, MockInterviewSession.user_id == user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found.")

    if not session.report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report has not been generated for this session yet."
        )

    return _format_report_response(session.report, session)


def _format_report_response(report: MockInterviewReport, session: MockInterviewSession) -> MockInterviewReportResponse:
    def _parse_json(val, default):
        if not val:
            return default
        try:
            return json.loads(val)
        except Exception:
            return default

    # Only include answered turns for question-wise evaluation
    answered_turns = [
        _format_turn_response(t)
        for t in session.turns
        if t.candidate_response is not None
    ]

    return MockInterviewReportResponse(
        id=report.id,
        session_id=report.session_id,
        job_role=session.job_role,
        overall_score=report.overall_score,
        total_questions=report.total_questions,
        correct_count=report.correct_count,
        partially_correct_count=report.partially_correct_count,
        incorrect_count=report.incorrect_count,
        duration_seconds=report.duration_seconds,
        category_scores=_parse_json(report.category_scores, {}),
        strengths=_parse_json(report.strengths, []),
        weaknesses=_parse_json(report.weaknesses, []),
        knowledge_gaps=_parse_json(report.knowledge_gaps, []),
        recommended_questions=_parse_json(report.recommended_questions, []),
        learning_roadmap=_parse_json(report.learning_roadmap, []),
        summary=report.summary,
        turns=answered_turns,
        created_at=report.created_at.isoformat() if report.created_at else None,
    )
