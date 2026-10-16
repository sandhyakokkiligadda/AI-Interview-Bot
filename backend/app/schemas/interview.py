from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any, Dict
from datetime import datetime

class InterviewCreateRequest(BaseModel):
    candidate_name: Optional[str] = "Candidate"
    interview_type: str = "Technical Interview"
    job_role: str = "Software Developer"
    experience_level: str = "Fresher"
    difficulty: str = "Medium"
    duration_minutes: int = 15
    language: str = "English"
    interview_mode: str = "voice_and_text"
    enable_hints: bool = True
    enable_coding: bool = True
    company_preset: Optional[str] = "General Enterprise"
    resume_text: Optional[str] = None
    job_description: Optional[str] = None
    total_questions: Optional[int] = 5

class InterviewResponse(BaseModel):
    id: str
    candidate_name: str
    interview_type: str
    job_role: str
    experience_level: str
    difficulty: str
    duration_minutes: int
    language: str
    interview_mode: str
    enable_hints: bool
    enable_coding: bool
    company_preset: str
    status: str
    current_question_index: int
    total_questions: int
    proctoring_violations: int = 0
    is_terminated: bool = False
    termination_reason: Optional[str] = None
    created_at: datetime
    introduction_message: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class NextQuestionRequest(BaseModel):
    language: Optional[str] = None

class QuestionResponse(BaseModel):
    id: str
    interview_id: str
    question_index: int
    question_text: str
    question_type: str
    language: str
    expected_concepts: Optional[List[str]] = None
    hints: Optional[str] = None
    is_follow_up: bool = False
    code_starter: Optional[str] = None
    test_cases: Optional[List[Dict[str, Any]]] = None
    is_last_question: bool = False
    total_questions: int

class AnswerSubmitRequest(BaseModel):
    question_id: str
    transcript_text: str
    code_text: Optional[str] = None
    duration_seconds: Optional[float] = 0.0
    input_method: Optional[str] = "voice"

class EvaluationResponse(BaseModel):
    id: str
    question_id: str
    overall_score: float
    technical_score: float
    communication_score: float
    problem_solving_score: float
    relevance_score: float
    confidence_score: float
    feedback: str
    strengths: Optional[str] = None
    areas_for_improvement: Optional[str] = None
    missing_concepts: Optional[List[str]] = None
    mistakes_identified: Optional[List[str]] = None
    suggested_answer: Optional[str] = None
    follow_up_suggested: Optional[str] = None
    next_action: str = "next_question"

class InterviewCompleteRequest(BaseModel):
    pass

class InterviewTerminateRequest(BaseModel):
    termination_reason: str = "Terminated due to repeated tab switching"
    proctoring_violations: int = 3

class QuestionFeedbackDetail(BaseModel):
    question_index: int
    question_text: str
    question_type: str
    candidate_answer: str
    code_answer: Optional[str] = None
    overall_score: float
    technical_score: float
    communication_score: float
    problem_solving_score: float
    relevance_score: float
    confidence_score: float
    feedback: str
    strengths: Optional[str] = None
    areas_for_improvement: Optional[str] = None
    missing_concepts: Optional[List[str]] = None
    mistakes_identified: Optional[List[str]] = None
    suggested_answer: Optional[str] = None

class ReportResponse(BaseModel):
    id: str
    interview_id: str
    candidate_name: str
    job_role: str
    interview_type: str
    difficulty: str
    language: str
    overall_score: float
    technical_score: float
    communication_score: float
    problem_solving_score: float
    relevance_score: float
    confidence_clarity_score: float
    performance_rating: str  # Excellent, Good, Average, Needs Improvement
    summary: str
    strengths: List[str]
    improvements: List[str]
    missing_concepts: List[str]
    mistakes_identified: List[str]
    recommendations: List[str]
    recommended_topics: List[str]
    is_terminated: bool = False
    termination_reason: Optional[str] = None
    proctoring_violations: int = 0
    questions_detail: List[QuestionFeedbackDetail]
    completed_at: Optional[datetime] = None

class HistorySummaryResponse(BaseModel):
    id: str
    candidate_name: str
    job_role: str
    interview_type: str
    difficulty: str
    language: str
    overall_score: float
    status: str
    performance_rating: Optional[str] = None
    is_terminated: bool = False
    termination_reason: Optional[str] = None
    proctoring_violations: int = 0
    total_questions: int
    answered_questions: int
    created_at: datetime
    completed_at: Optional[datetime] = None

class ResumeParseRequest(BaseModel):
    resume_text: str

class ResumeParseResponse(BaseModel):
    skills: List[str]
    experience_years: Optional[str] = None
    key_projects: List[str]
    suggested_roles: List[str]
    summary: str
