import io
import json
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.interview import (
    InterviewSession,
    InterviewQuestion,
    CandidateAnswer,
    QuestionEvaluation,
    InterviewReport
)
from app.schemas.interview import (
    InterviewCreateRequest,
    InterviewResponse,
    NextQuestionRequest,
    QuestionResponse,
    AnswerSubmitRequest,
    EvaluationResponse,
    InterviewCompleteRequest,
    InterviewTerminateRequest,
    ReportResponse,
    HistorySummaryResponse,
    ResumeParseRequest,
    ResumeParseResponse,
    QuestionFeedbackDetail
)
from app.services.ai_engine import ai_engine
from app.services.evaluation_service import evaluation_service
from app.services.tts_service import tts_service

router = APIRouter()

def utc_now():
    return datetime.now(timezone.utc)

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AI Interview Bot API",
        "timestamp": utc_now().isoformat(),
        "ai_configured": ai_engine.is_ai_configured()
    }

@router.get("/tts")
async def text_to_speech(text: str, language: Optional[str] = "English"):
    """
    Synthesize speech using Microsoft Edge Neural TTS matching Fliki studio voice (JennyNeural).
    Returns audio/mpeg stream.
    """
    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    try:
        audio_bytes = await tts_service.synthesize(text, language or "English")
        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline; filename=speech.mp3"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS synthesis failed: {str(e)}")


@router.post("/interviews", response_model=InterviewResponse)
def create_interview(req: InterviewCreateRequest, db: Session = Depends(get_db)):
    session = InterviewSession(
        candidate_name=req.candidate_name or "Candidate",
        interview_type=req.interview_type,
        job_role=req.job_role,
        experience_level=req.experience_level,
        difficulty=req.difficulty,
        duration_minutes=req.duration_minutes,
        language=req.language,
        interview_mode=req.interview_mode,
        enable_hints=req.enable_hints,
        enable_coding=req.enable_coding,
        company_preset=req.company_preset or "General Enterprise",
        resume_text=req.resume_text,
        job_description=req.job_description,
        total_questions=req.total_questions or 5,
        status="in_progress",
        current_question_index=0,
        proctoring_violations=0,
        is_terminated=False
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    intro_msg = ai_engine.get_introduction(session.language)
    resp = InterviewResponse.model_validate(session)
    resp.introduction_message = intro_msg
    return resp

@router.post("/interviews/{interview_id}/next-question", response_model=QuestionResponse)
def get_next_question(
    interview_id: str,
    req: Optional[NextQuestionRequest] = None,
    db: Session = Depends(get_db)
):
    session = db.query(InterviewSession).filter(InterviewSession.id == interview_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    if session.status in ["completed", "terminated"]:
        raise HTTPException(status_code=400, detail=f"Interview session is already {session.status}")

    current_lang = req.language if (req and req.language) else session.language

    previous_questions = (
        db.query(InterviewQuestion)
        .filter(InterviewQuestion.interview_id == interview_id)
        .order_by(InterviewQuestion.question_index)
        .all()
    )

    # Check for existing unanswered question
    for q in previous_questions:
        if not q.answer:
            concepts = json.loads(q.expected_concepts) if q.expected_concepts else []
            test_cases = json.loads(q.test_cases) if q.test_cases else None
            return QuestionResponse(
                id=q.id,
                interview_id=session.id,
                question_index=q.question_index,
                question_text=q.question_text,
                question_type=q.question_type,
                language=q.language,
                expected_concepts=concepts,
                hints=q.hints if session.enable_hints else None,
                is_follow_up=q.is_follow_up,
                code_starter=q.code_starter,
                test_cases=test_cases,
                is_last_question=(q.question_index >= session.total_questions - 1),
                total_questions=session.total_questions
            )

    if len(previous_questions) >= session.total_questions:
        raise HTTPException(
            status_code=400,
            detail="Maximum questions reached for this interview. Please complete the interview."
        )

    prev_qa_data = []
    for q in previous_questions:
        ans_text = q.answer.transcript_text if q.answer else ""
        prev_qa_data.append({
            "question": q.question_text,
            "answer": ans_text,
            "question_type": q.question_type,
            "is_follow_up": q.is_follow_up
        })

    # Exclude questions already asked in this session
    exclude_list = [q.question_text for q in previous_questions]

    # Also exclude questions asked in recent sessions for the same role
    past_questions = (
        db.query(InterviewQuestion.question_text)
        .join(InterviewSession, InterviewQuestion.interview_id == InterviewSession.id)
        .filter(InterviewSession.job_role == session.job_role, InterviewSession.id != session.id)
        .order_by(InterviewQuestion.created_at.desc())
        .limit(25)
        .all()
    )
    for pq in past_questions:
        if pq[0] not in exclude_list:
            exclude_list.append(pq[0])

    next_idx = len(previous_questions)
    gen_result = ai_engine.generate_next_question(
        job_role=session.job_role,
        interview_type=session.interview_type,
        experience_level=session.experience_level,
        difficulty=session.difficulty,
        language=current_lang,
        current_index=next_idx,
        total_questions=session.total_questions,
        previous_qa=prev_qa_data,
        resume_text=session.resume_text,
        job_description=session.job_description,
        exclude_questions=exclude_list,
        session_id=session.id
    )


    concepts_json = json.dumps(gen_result.get("expected_concepts", []))
    test_cases_json = json.dumps(gen_result.get("test_cases")) if gen_result.get("test_cases") else None

    new_question = InterviewQuestion(
        interview_id=session.id,
        question_index=next_idx,
        question_text=gen_result["question_text"],
        question_type=gen_result.get("question_type", "Technical"),
        language=current_lang,
        expected_concepts=concepts_json,
        hints=gen_result.get("hints"),
        is_follow_up=gen_result.get("is_follow_up", False),
        code_starter=gen_result.get("code_starter"),
        test_cases=test_cases_json
    )
    db.add(new_question)
    session.current_question_index = next_idx
    db.commit()
    db.refresh(new_question)

    return QuestionResponse(
        id=new_question.id,
        interview_id=session.id,
        question_index=new_question.question_index,
        question_text=new_question.question_text,
        question_type=new_question.question_type,
        language=new_question.language,
        expected_concepts=gen_result.get("expected_concepts", []),
        hints=new_question.hints if session.enable_hints else None,
        is_follow_up=new_question.is_follow_up,
        code_starter=new_question.code_starter,
        test_cases=gen_result.get("test_cases"),
        is_last_question=(next_idx >= session.total_questions - 1),
        total_questions=session.total_questions
    )

@router.post("/interviews/{interview_id}/answer", response_model=EvaluationResponse)
def submit_answer(
    interview_id: str,
    req: AnswerSubmitRequest,
    db: Session = Depends(get_db)
):
    question = db.query(InterviewQuestion).filter(
        InterviewQuestion.id == req.question_id,
        InterviewQuestion.interview_id == interview_id
    ).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    existing_answer = db.query(CandidateAnswer).filter(CandidateAnswer.question_id == question.id).first()
    if existing_answer:
        existing_answer.transcript_text = req.transcript_text
        existing_answer.code_text = req.code_text
        existing_answer.duration_seconds = req.duration_seconds or 0.0
        existing_answer.input_method = req.input_method or "voice"
    else:
        answer_record = CandidateAnswer(
            question_id=question.id,
            transcript_text=req.transcript_text,
            code_text=req.code_text,
            duration_seconds=req.duration_seconds or 0.0,
            input_method=req.input_method or "voice"
        )
        db.add(answer_record)

    expected_concepts = json.loads(question.expected_concepts) if question.expected_concepts else []
    eval_result = ai_engine.evaluate_answer(
        question_text=question.question_text,
        question_type=question.question_type,
        expected_concepts=expected_concepts,
        candidate_answer=req.transcript_text,
        code_answer=req.code_text,
        language=question.language
    )

    missing = [c for c in expected_concepts if c.lower() not in req.transcript_text.lower()][:2]
    mistakes = []
    if len(req.transcript_text.split()) < 10:
        mistakes.append("Answer was too brief without technical justification")

    existing_eval = db.query(QuestionEvaluation).filter(QuestionEvaluation.question_id == question.id).first()
    if existing_eval:
        existing_eval.overall_score = eval_result["overall_score"]
        existing_eval.technical_score = eval_result["technical_score"]
        existing_eval.communication_score = eval_result["communication_score"]
        existing_eval.problem_solving_score = eval_result["problem_solving_score"]
        existing_eval.relevance_score = eval_result["relevance_score"]
        existing_eval.confidence_score = eval_result["confidence_score"]
        existing_eval.feedback = eval_result["feedback"]
        existing_eval.strengths = eval_result.get("strengths")
        existing_eval.areas_for_improvement = eval_result.get("areas_for_improvement")
        existing_eval.missing_concepts_json = json.dumps(missing)
        existing_eval.mistakes_json = json.dumps(mistakes)
        existing_eval.suggested_answer = eval_result.get("suggested_answer")
        existing_eval.follow_up_suggested = eval_result.get("follow_up_suggested")
        eval_record = existing_eval
    else:
        eval_record = QuestionEvaluation(
            question_id=question.id,
            overall_score=eval_result["overall_score"],
            technical_score=eval_result["technical_score"],
            communication_score=eval_result["communication_score"],
            problem_solving_score=eval_result["problem_solving_score"],
            relevance_score=eval_result["relevance_score"],
            confidence_score=eval_result["confidence_score"],
            feedback=eval_result["feedback"],
            strengths=eval_result.get("strengths"),
            areas_for_improvement=eval_result.get("areas_for_improvement"),
            missing_concepts_json=json.dumps(missing),
            mistakes_json=json.dumps(mistakes),
            suggested_answer=eval_result.get("suggested_answer"),
            follow_up_suggested=eval_result.get("follow_up_suggested")
        )
        db.add(eval_record)

    db.commit()
    db.refresh(eval_record)

    return EvaluationResponse(
        id=eval_record.id,
        question_id=question.id,
        overall_score=eval_record.overall_score,
        technical_score=eval_record.technical_score,
        communication_score=eval_record.communication_score,
        problem_solving_score=eval_record.problem_solving_score,
        relevance_score=eval_record.relevance_score,
        confidence_score=eval_record.confidence_score,
        feedback=eval_record.feedback,
        strengths=eval_record.strengths,
        areas_for_improvement=eval_record.areas_for_improvement,
        missing_concepts=missing,
        mistakes_identified=mistakes,
        suggested_answer=eval_record.suggested_answer,
        follow_up_suggested=eval_record.follow_up_suggested,
        next_action=eval_result.get("next_action", "next_question")
    )

@router.post("/interviews/{interview_id}/terminate", response_model=ReportResponse)
def terminate_interview(
    interview_id: str,
    req: InterviewTerminateRequest,
    db: Session = Depends(get_db)
):
    session = db.query(InterviewSession).filter(InterviewSession.id == interview_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    session.status = "terminated"
    session.is_terminated = True
    session.termination_reason = req.termination_reason
    session.proctoring_violations = req.proctoring_violations
    session.completed_at = utc_now()

    return _build_and_save_report(session, db)

@router.post("/interviews/{interview_id}/complete", response_model=ReportResponse)
def complete_interview(interview_id: str, db: Session = Depends(get_db)):
    session = db.query(InterviewSession).filter(InterviewSession.id == interview_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    session.status = "completed"
    session.completed_at = utc_now()
    return _build_and_save_report(session, db)

def _build_and_save_report(session: InterviewSession, db: Session) -> ReportResponse:
    questions = (
        db.query(InterviewQuestion)
        .filter(InterviewQuestion.interview_id == session.id)
        .order_by(InterviewQuestion.question_index)
        .all()
    )

    evaluations = []
    questions_detail: List[QuestionFeedbackDetail] = []
    for q in questions:
        if q.evaluation:
            evaluations.append(q.evaluation)
            ans_text = q.answer.transcript_text if q.answer else "Not Answered"
            code_text = q.answer.code_text if q.answer else None
            mc = json.loads(q.evaluation.missing_concepts_json) if q.evaluation.missing_concepts_json else []
            mistakes = json.loads(q.evaluation.mistakes_json) if q.evaluation.mistakes_json else []
            questions_detail.append(
                QuestionFeedbackDetail(
                    question_index=q.question_index,
                    question_text=q.question_text,
                    question_type=q.question_type,
                    candidate_answer=ans_text,
                    code_answer=code_text,
                    overall_score=q.evaluation.overall_score,
                    technical_score=q.evaluation.technical_score,
                    communication_score=q.evaluation.communication_score,
                    problem_solving_score=q.evaluation.problem_solving_score,
                    relevance_score=q.evaluation.relevance_score,
                    confidence_score=q.evaluation.confidence_score,
                    feedback=q.evaluation.feedback,
                    strengths=q.evaluation.strengths,
                    areas_for_improvement=q.evaluation.areas_for_improvement,
                    missing_concepts=mc,
                    mistakes_identified=mistakes,
                    suggested_answer=q.evaluation.suggested_answer
                )
            )
        else:
            # Unanswered question
            questions_detail.append(
                QuestionFeedbackDetail(
                    question_index=q.question_index,
                    question_text=q.question_text,
                    question_type=q.question_type,
                    candidate_answer="Not Answered",
                    code_answer=None,
                    overall_score=0.0,
                    technical_score=0.0,
                    communication_score=0.0,
                    problem_solving_score=0.0,
                    relevance_score=0.0,
                    confidence_score=0.0,
                    feedback="Question was not answered before the interview concluded or was terminated.",
                    strengths="None",
                    areas_for_improvement="Answer all questions completely",
                    missing_concepts=json.loads(q.expected_concepts) if q.expected_concepts else [],
                    mistakes_identified=["Skipped / Not answered"],
                    suggested_answer=q.hints or "Provide a comprehensive answer covering key architectural trade-offs."
                )
            )

    compiled = evaluation_service.compile_final_report(session, evaluations)

    report = db.query(InterviewReport).filter(InterviewReport.interview_id == session.id).first()
    if not report:
        report = InterviewReport(
            interview_id=session.id,
            overall_score=compiled["overall_score"],
            technical_score=compiled["technical_score"],
            communication_score=compiled["communication_score"],
            problem_solving_score=compiled["problem_solving_score"],
            relevance_score=compiled["relevance_score"],
            confidence_clarity_score=compiled["confidence_clarity_score"],
            performance_rating=compiled["performance_rating"],
            summary=compiled["summary"],
            strengths_json=json.dumps(compiled["strengths"]),
            improvements_json=json.dumps(compiled["improvements"]),
            missing_concepts_json=json.dumps(compiled.get("missing_concepts", [])),
            mistakes_identified_json=json.dumps(compiled.get("mistakes_identified", [])),
            recommendations_json=json.dumps(compiled["recommendations"]),
            recommended_topics_json=json.dumps(compiled["recommended_topics"]),
            is_terminated=session.is_terminated,
            termination_reason=session.termination_reason,
            proctoring_violations=session.proctoring_violations
        )
        db.add(report)
    else:
        report.overall_score = compiled["overall_score"]
        report.technical_score = compiled["technical_score"]
        report.communication_score = compiled["communication_score"]
        report.problem_solving_score = compiled["problem_solving_score"]
        report.relevance_score = compiled["relevance_score"]
        report.confidence_clarity_score = compiled["confidence_clarity_score"]
        report.performance_rating = compiled["performance_rating"]
        report.summary = compiled["summary"]
        report.strengths_json = json.dumps(compiled["strengths"])
        report.improvements_json = json.dumps(compiled["improvements"])
        report.missing_concepts_json = json.dumps(compiled.get("missing_concepts", []))
        report.mistakes_identified_json = json.dumps(compiled.get("mistakes_identified", []))
        report.recommendations_json = json.dumps(compiled["recommendations"])
        report.recommended_topics_json = json.dumps(compiled["recommended_topics"])
        report.is_terminated = session.is_terminated
        report.termination_reason = session.termination_reason
        report.proctoring_violations = session.proctoring_violations

    db.commit()
    db.refresh(report)

    return ReportResponse(
        id=report.id,
        interview_id=session.id,
        candidate_name=session.candidate_name,
        job_role=session.job_role,
        interview_type=session.interview_type,
        difficulty=session.difficulty,
        language=session.language,
        overall_score=report.overall_score,
        technical_score=report.technical_score,
        communication_score=report.communication_score,
        problem_solving_score=report.problem_solving_score,
        relevance_score=report.relevance_score,
        confidence_clarity_score=report.confidence_clarity_score,
        performance_rating=report.performance_rating or "Good",
        summary=report.summary or "",
        strengths=json.loads(report.strengths_json) if report.strengths_json else [],
        improvements=json.loads(report.improvements_json) if report.improvements_json else [],
        missing_concepts=json.loads(report.missing_concepts_json) if report.missing_concepts_json else [],
        mistakes_identified=json.loads(report.mistakes_identified_json) if report.mistakes_identified_json else [],
        recommendations=json.loads(report.recommendations_json) if report.recommendations_json else [],
        recommended_topics=json.loads(report.recommended_topics_json) if report.recommended_topics_json else [],
        is_terminated=report.is_terminated,
        termination_reason=report.termination_reason,
        proctoring_violations=report.proctoring_violations,
        questions_detail=questions_detail,
        completed_at=session.completed_at
    )

@router.get("/interviews/{interview_id}/report", response_model=ReportResponse)
def get_interview_report(interview_id: str, db: Session = Depends(get_db)):
    session = db.query(InterviewSession).filter(InterviewSession.id == interview_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    report = db.query(InterviewReport).filter(InterviewReport.interview_id == interview_id).first()
    if not report:
        return complete_interview(interview_id, db)

    return _build_and_save_report(session, db)

@router.get("/interviews/history", response_model=List[HistorySummaryResponse])
def get_interview_history(db: Session = Depends(get_db)):
    sessions = (
        db.query(InterviewSession)
        .order_by(InterviewSession.created_at.desc())
        .limit(20)
        .all()
    )

    history = []
    for s in sessions:
        score = s.report.overall_score if s.report else 0.0
        rating = s.report.performance_rating if s.report else None
        answered_cnt = sum(1 for q in s.questions if q.answer is not None)
        history.append(
            HistorySummaryResponse(
                id=s.id,
                candidate_name=s.candidate_name,
                job_role=s.job_role,
                interview_type=s.interview_type,
                difficulty=s.difficulty,
                language=s.language,
                overall_score=score,
                status=s.status,
                performance_rating=rating,
                is_terminated=s.is_terminated,
                termination_reason=s.termination_reason,
                proctoring_violations=s.proctoring_violations,
                total_questions=s.total_questions,
                answered_questions=answered_cnt,
                created_at=s.created_at,
                completed_at=s.completed_at
            )
        )
    return history

@router.post("/parse-resume", response_model=ResumeParseResponse)
def parse_resume(req: ResumeParseRequest):
    if not req.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty")
    return ai_engine.parse_resume(req.resume_text)
