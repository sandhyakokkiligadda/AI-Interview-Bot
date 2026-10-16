"""
Evaluation Service for aggregating question evaluations into a comprehensive interview report.
Includes performance rating tier calculation, missing concepts, and proctoring termination notes.
"""

import json
from typing import List, Dict, Any
from app.models.interview import InterviewSession, QuestionEvaluation, InterviewReport

class EvaluationService:
    @staticmethod
    def get_performance_rating(score: float) -> str:
        if score >= 85:
            return "Excellent"
        elif score >= 70:
            return "Good"
        elif score >= 55:
            return "Average"
        else:
            return "Needs Improvement"

    @staticmethod
    def compile_final_report(session: InterviewSession, evaluations: List[QuestionEvaluation]) -> Dict[str, Any]:
        if not evaluations:
            rating = "Needs Improvement"
            summary = (
                "Interview concluded before any question responses were submitted. "
                "No technical knowledge evaluation could be established."
            )
            if session.is_terminated:
                summary = (
                    f"Interview was terminated early: {session.termination_reason}. "
                    "No candidate answers were recorded."
                )

            return {
                "overall_score": 0.0,
                "technical_score": 0.0,
                "communication_score": 0.0,
                "problem_solving_score": 0.0,
                "relevance_score": 0.0,
                "confidence_clarity_score": 0.0,
                "performance_rating": rating,
                "summary": summary,
                "strengths": ["Session initiated"],
                "improvements": ["Complete all interview questions under strict proctoring focus"],
                "missing_concepts": ["All core interview topics (session terminated early)"],
                "mistakes_identified": [session.termination_reason or "Session terminated before answering"],
                "recommendations": ["Re-attempt the mock interview and remain within the interview tab"],
                "recommended_topics": ["General Technical Foundations", "STAR Behavioral Preparation"]
            }

        avg_overall = sum(e.overall_score for e in evaluations) / len(evaluations)
        avg_tech = sum(e.technical_score for e in evaluations) / len(evaluations)
        avg_comm = sum(e.communication_score for e in evaluations) / len(evaluations)
        avg_ps = sum(e.problem_solving_score for e in evaluations) / len(evaluations)
        avg_rel = sum(e.relevance_score for e in evaluations) / len(evaluations)
        avg_conf = sum(e.confidence_score for e in evaluations) / len(evaluations)

        # Aggregate strengths & improvements
        strengths = []
        improvements = []
        missing_concepts = []
        mistakes_identified = []

        for e in evaluations:
            if e.strengths:
                for item in e.strengths.split("; "):
                    item_clean = item.strip()
                    if item_clean and item_clean not in strengths:
                        strengths.append(item_clean)
            if e.areas_for_improvement:
                for item in e.areas_for_improvement.split("; "):
                    item_clean = item.strip()
                    if item_clean and item_clean not in improvements:
                        improvements.append(item_clean)
            if e.missing_concepts_json:
                try:
                    for mc in json.loads(e.missing_concepts_json):
                        if mc not in missing_concepts:
                            missing_concepts.append(mc)
                except Exception:
                    pass

        if not strengths:
            strengths = [
                "Demonstrated active listening and engagement throughout the interview",
                "Structured responses with clear communication",
                "Approached problem-solving with a systematic mindset"
            ]

        if not improvements:
            improvements = [
                "Incorporate more quantitative metrics in your behavioral answers",
                "Discuss memory and runtime complexity trade-offs explicitly",
                "Provide alternative architectural approaches when answering system design questions"
            ]

        if not missing_concepts:
            missing_concepts = [
                "Edge-case complexity analysis (Big-O time and space)",
                "Error recovery and non-blocking I/O handling"
            ]

        if session.is_terminated:
            mistakes_identified.append(
                f"Proctoring violation: {session.termination_reason} ({session.proctoring_violations} tab switches recorded)"
            )
        else:
            mistakes_identified.append("Brief answers without addressing secondary architectural trade-offs")

        # Performance rating tier
        rating = EvaluationService.get_performance_rating(avg_overall)

        # Generate personalized summary
        if session.is_terminated:
            summary = (
                f"Interview Session Terminated: {session.termination_reason}. "
                f"The candidate answered {len(evaluations)} question(s) before termination. "
                f"Partial evaluation score: {round(avg_overall, 1)}/100 ({rating} performance on submitted answers)."
            )
        elif avg_overall >= 85:
            summary = (
                f"Outstanding performance ({rating}) for {session.job_role}! You demonstrated advanced subject mastery, "
                "crisp articulate communication, and strong architectural problem-solving instincts. "
                "You are well-prepared for competitive enterprise placement rounds."
            )
        elif avg_overall >= 70:
            summary = (
                f"Solid, competitive performance ({rating}) for {session.job_role}. You have a solid grasp of core fundamentals "
                "and communicated your ideas clearly. With slight sharpening of edge-case handling and quantitative STAR metrics, "
                "you will comfortably stand out in hiring manager interviews."
            )
        elif avg_overall >= 55:
            summary = (
                f"Average baseline performance ({rating}) for {session.job_role}. You engaged with each scenario. "
                "Focusing on structured technical explanations, deepening algorithmic trade-offs, and expanding on real-world projects "
                "will elevate your interview readiness."
            )
        else:
            summary = (
                f"Needs Improvement ({rating}) for {session.job_role}. Practice articulating definitions, providing code logic, "
                "and structuring explanations using the STAR framework."
            )

        recommendations = [
            f"Review standard technical patterns commonly tested in {session.job_role} recruitment drives.",
            "Practice structuring behavioral questions strictly using the STAR (Situation, Task, Action, Result) model.",
            "Re-read the model answers provided in this report to see how senior engineers frame trade-offs.",
            "Maintain continuous focus on the interview screen to adhere to enterprise proctoring standards."
        ]

        if session.job_role in ["Software Developer", "Backend Developer", "Full-Stack Developer"]:
            recommended_topics = [
                "Asynchronous Event Loop & Concurrency Models",
                "Database Indexing & Query Plan Optimization",
                "RESTful API Versioning & Rate Limiting",
                "Distributed Caching with Redis & In-Memory Stores"
            ]
        elif session.job_role == "Frontend Developer":
            recommended_topics = [
                "React Fiber Architecture & Reconciliation",
                "Core Web Vitals (LCP, CLS, INP) Optimization",
                "State Management & Custom Hook Patterns",
                "CSS Grid & Responsive Layout Architecture"
            ]
        else:
            recommended_topics = [
                "Core Object-Oriented Design Patterns",
                "SQL vs NoSQL Database Selection",
                "Quantitative Aptitude & Time-Distance Problems",
                "STAR Behavioral Storytelling"
            ]

        return {
            "overall_score": round(avg_overall, 1),
            "technical_score": round(avg_tech, 1),
            "communication_score": round(avg_comm, 1),
            "problem_solving_score": round(avg_ps, 1),
            "relevance_score": round(avg_rel, 1),
            "confidence_clarity_score": round(avg_conf, 1),
            "performance_rating": rating,
            "summary": summary,
            "strengths": strengths[:4],
            "improvements": improvements[:4],
            "missing_concepts": missing_concepts[:4],
            "mistakes_identified": mistakes_identified[:4],
            "recommendations": recommendations,
            "recommended_topics": recommended_topics
        }

evaluation_service = EvaluationService()
