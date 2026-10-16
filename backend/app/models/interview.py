import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    candidate_name = Column(String(100), default="Candidate")
    interview_type = Column(String(50), default="Technical Interview")
    job_role = Column(String(100), default="Software Developer")
    experience_level = Column(String(50), default="Fresher")
    difficulty = Column(String(30), default="Medium")
    duration_minutes = Column(Integer, default=15)
    language = Column(String(30), default="English")
    interview_mode = Column(String(30), default="voice_and_text")
    enable_hints = Column(Boolean, default=True)
    enable_coding = Column(Boolean, default=True)
    company_preset = Column(String(100), default="General Enterprise")
    resume_text = Column(Text, nullable=True)
    job_description = Column(Text, nullable=True)
    
    status = Column(String(30), default="created")  # created, in_progress, paused, completed, terminated
    current_question_index = Column(Integer, default=0)
    total_questions = Column(Integer, default=5)
    
    # Proctoring & Anti-cheating
    proctoring_violations = Column(Integer, default=0)
    is_terminated = Column(Boolean, default=False)
    termination_reason = Column(String(200), nullable=True)
    
    created_at = Column(DateTime, default=utc_now)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    questions = relationship("InterviewQuestion", back_populates="interview", cascade="all, delete-orphan", order_by="InterviewQuestion.question_index")
    report = relationship("InterviewReport", back_populates="interview", uselist=False, cascade="all, delete-orphan")


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    interview_id = Column(String(36), ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False)
    question_index = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), default="Technical")
    language = Column(String(30), default="English")
    expected_concepts = Column(Text, nullable=True)  # JSON string or comma-separated
    hints = Column(Text, nullable=True)
    is_follow_up = Column(Boolean, default=False)
    parent_question_id = Column(String(36), nullable=True)
    
    # Coding specific
    code_starter = Column(Text, nullable=True)
    test_cases = Column(Text, nullable=True)  # JSON string
    
    created_at = Column(DateTime, default=utc_now)

    # Relationships
    interview = relationship("InterviewSession", back_populates="questions")
    answer = relationship("CandidateAnswer", back_populates="question", uselist=False, cascade="all, delete-orphan")
    evaluation = relationship("QuestionEvaluation", back_populates="question", uselist=False, cascade="all, delete-orphan")


class CandidateAnswer(Base):
    __tablename__ = "candidate_answers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    question_id = Column(String(36), ForeignKey("interview_questions.id", ondelete="CASCADE"), nullable=False)
    transcript_text = Column(Text, nullable=False)
    code_text = Column(Text, nullable=True)
    duration_seconds = Column(Float, default=0.0)
    input_method = Column(String(20), default="voice")  # voice or text
    created_at = Column(DateTime, default=utc_now)

    # Relationship
    question = relationship("InterviewQuestion", back_populates="answer")


class QuestionEvaluation(Base):
    __tablename__ = "question_evaluations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    question_id = Column(String(36), ForeignKey("interview_questions.id", ondelete="CASCADE"), nullable=False)
    overall_score = Column(Float, default=75.0)
    technical_score = Column(Float, default=75.0)
    communication_score = Column(Float, default=75.0)
    problem_solving_score = Column(Float, default=75.0)
    relevance_score = Column(Float, default=75.0)
    confidence_score = Column(Float, default=75.0)
    
    feedback = Column(Text, nullable=True)
    strengths = Column(Text, nullable=True)
    areas_for_improvement = Column(Text, nullable=True)
    missing_concepts_json = Column(Text, nullable=True)
    mistakes_json = Column(Text, nullable=True)
    suggested_answer = Column(Text, nullable=True)
    follow_up_suggested = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    # Relationship
    question = relationship("InterviewQuestion", back_populates="evaluation")


class InterviewReport(Base):
    __tablename__ = "interview_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    interview_id = Column(String(36), ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False)
    overall_score = Column(Float, default=75.0)
    technical_score = Column(Float, default=75.0)
    communication_score = Column(Float, default=75.0)
    problem_solving_score = Column(Float, default=75.0)
    relevance_score = Column(Float, default=75.0)
    confidence_clarity_score = Column(Float, default=75.0)
    performance_rating = Column(String(50), default="Good")  # Excellent, Good, Average, Needs Improvement
    
    summary = Column(Text, nullable=True)
    strengths_json = Column(Text, nullable=True)
    improvements_json = Column(Text, nullable=True)
    missing_concepts_json = Column(Text, nullable=True)
    mistakes_identified_json = Column(Text, nullable=True)
    recommendations_json = Column(Text, nullable=True)
    recommended_topics_json = Column(Text, nullable=True)
    
    # Termination & Proctoring metadata
    is_terminated = Column(Boolean, default=False)
    termination_reason = Column(String(200), nullable=True)
    proctoring_violations = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=utc_now)

    # Relationship
    interview = relationship("InterviewSession", back_populates="report")
