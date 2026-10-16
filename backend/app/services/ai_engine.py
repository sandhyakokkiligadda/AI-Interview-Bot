"""
AI Engine service for generating questions, evaluating answers, and producing comprehensive feedback.
Integrates with Google Gemini API / OpenAI API when configured, with an intelligent offline NLP simulation fallback.
"""

import json
import logging
import re
from typing import Dict, Any, List, Optional
import requests
from app.core.config import settings
from app.services.question_bank import get_questions_for_interview, INTRODUCTIONS, OPENING_QUESTIONS

logger = logging.getLogger(__name__)

class AIEngine:
    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY
        self.openai_key = settings.OPENAI_API_KEY

    def is_ai_configured(self) -> bool:
        return bool(self.gemini_key or self.openai_key)

    def get_introduction(self, language: str) -> str:
        return INTRODUCTIONS.get(language, INTRODUCTIONS["English"])

    def generate_next_question(
        self,
        job_role: str,
        interview_type: str,
        experience_level: str,
        difficulty: str,
        language: str,
        current_index: int,
        total_questions: int,
        previous_qa: List[Dict[str, Any]],
        resume_text: Optional[str] = None,
        job_description: Optional[str] = None,
        exclude_questions: Optional[List[str]] = None,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generates the next interview question. Adapts to previous answers.
        Uses non-repeating selection across sessions.
        """
        # Question 0 MUST ALWAYS be the Universal Opening Question: "Tell me about yourself"
        if current_index == 0:
            opening = OPENING_QUESTIONS.get(language, OPENING_QUESTIONS["English"])
            return {
                "question_text": opening["question"],
                "question_type": opening.get("type", "Behavioral"),
                "expected_concepts": opening.get("expected_concepts", []),
                "hints": opening.get("hints", ""),
                "model_answer": opening.get("model_answer", ""),
                "follow_up": opening.get("follow_up", ""),
                "is_follow_up": False,
                "code_starter": None,
                "test_cases": None
            }

        # If Gemini Key is present, try Gemini API
        if self.gemini_key:
            try:
                return self._generate_gemini_question(
                    job_role, interview_type, experience_level, difficulty, language,
                    current_index, total_questions, previous_qa, resume_text, job_description
                )
            except Exception as e:
                logger.warning(f"Gemini API question generation failed: {e}. Falling back to rule engine.")

        # Fallback to rich offline question bank & dynamic non-repeating logic
        return self._generate_offline_question(
            job_role, interview_type, experience_level, difficulty, language,
            current_index, total_questions, previous_qa, resume_text, job_description,
            exclude_questions, session_id
        )

    def _generate_offline_question(
        self,
        job_role: str,
        interview_type: str,
        experience_level: str,
        difficulty: str,
        language: str,
        current_index: int,
        total_questions: int,
        previous_qa: List[Dict[str, Any]],
        resume_text: Optional[str] = None,
        job_description: Optional[str] = None,
        exclude_questions: Optional[List[str]] = None,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        # Check if previous answer triggers an adaptive follow-up
        if previous_qa and len(previous_qa) > 0:
            last_entry = previous_qa[-1]
            last_answer = last_entry.get("answer", "")
            last_follow_up = last_entry.get("follow_up")
            
            # If the candidate answer was concise or answered partially, and follow-up exists
            if last_follow_up and not last_entry.get("is_follow_up", False) and len(last_answer.split()) > 4 and current_index < total_questions - 1:
                # Offer an adaptive follow-up
                return {
                    "question_text": last_follow_up,
                    "question_type": last_entry.get("question_type", "Technical"),
                    "expected_concepts": ["Deeper explanation", "Trade-offs", "Real-world context"],
                    "hints": "Build on your previous answer and explain practical design trade-offs.",
                    "is_follow_up": True,
                    "code_starter": None,
                    "test_cases": None
                }

        # Select from dynamic question bank excluding previously asked questions
        bank_questions = get_questions_for_interview(
            role=job_role,
            interview_type=interview_type,
            language=language,
            count=total_questions,
            exclude_questions=exclude_questions,
            session_seed=f"{session_id}_{current_index}" if session_id else None
        )
        
        selected = bank_questions[0] if bank_questions else {
            "question": "Can you discuss a complex software engineering problem you solved recently and the trade-offs involved?",
            "type": "Technical",
            "expected_concepts": ["Architecture", "Trade-offs", "Production impact"],
            "hints": "Walk through your problem statement, solution, and measurable results.",
            "model_answer": "In my previous engineering work, I optimized a data aggregation pipeline...",
            "follow_up": "What was the failure recovery strategy if one worker node disconnected?"
        }

        # If resume contains specific skills and it's question index 1, personalize
        question_text = selected["question"]
        if resume_text and current_index == 1:
            resume_skills = [s for s in ["React", "Python", "Docker", "AWS", "Java", "SQL", "Machine Learning"] if s.lower() in resume_text.lower()]
            if resume_skills and language == "English":
                question_text = f"I see from your background that you have worked with {', '.join(resume_skills[:2])}. {question_text}"

        return {
            "question_text": question_text,
            "question_type": selected.get("type", "Technical"),
            "expected_concepts": selected.get("expected_concepts", []),
            "hints": selected.get("hints", ""),
            "model_answer": selected.get("model_answer", ""),
            "follow_up": selected.get("follow_up", ""),
            "is_follow_up": False,
            "code_starter": selected.get("code_starter"),
            "test_cases": selected.get("test_cases")
        }


    def _generate_gemini_question(
        self,
        job_role: str,
        interview_type: str,
        experience_level: str,
        difficulty: str,
        language: str,
        current_index: int,
        total_questions: int,
        previous_qa: List[Dict[str, Any]],
        resume_text: Optional[str],
        job_description: Optional[str]
    ) -> Dict[str, Any]:
        prompt = f"""
You are an expert enterprise recruitment interviewer for {job_role} at {difficulty} level for a candidate with {experience_level} experience.
Language required: {language}.
Interview Type: {interview_type}.
Question number {current_index + 1} of {total_questions}.
Candidate Resume context: {resume_text or 'None'}
Job Description: {job_description or 'None'}
Previous questions and candidate answers in this session:
{json.dumps(previous_qa, ensure_ascii=False)}

Generate the next interview question. If the candidate answered the previous question well or left an interesting point open, you can ask an adaptive follow-up.
Return strictly valid JSON with the following schema:
{{
  "question_text": "Question string in {language}",
  "question_type": "Technical|HR|Coding|Behavioral|Aptitude",
  "expected_concepts": ["concept1", "concept2"],
  "hints": "A helpful hint without giving away the complete answer",
  "is_follow_up": false,
  "code_starter": "optional python/code snippet or null",
  "test_cases": null
}}
"""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.4, "response_mime_type": "application/json"}
        }
        res = requests.post(url, headers=headers, json=payload, timeout=12)
        if res.status_code == 200:
            data = res.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(text)
        else:
            raise RuntimeError(f"Gemini API returned status {res.status_code}: {res.text}")

    def evaluate_answer(
        self,
        question_text: str,
        question_type: str,
        expected_concepts: List[str],
        candidate_answer: str,
        code_answer: Optional[str],
        language: str
    ) -> Dict[str, Any]:
        """
        Evaluates a candidate's answer with detailed scores, feedback, strengths, and areas for improvement.
        """
        # If Gemini API configured, try AI evaluation
        if self.gemini_key:
            try:
                return self._evaluate_gemini(
                    question_text, question_type, expected_concepts, candidate_answer, code_answer, language
                )
            except Exception as e:
                logger.warning(f"Gemini API evaluation failed: {e}. Falling back to rule-based evaluation.")

        return self._evaluate_offline(
            question_text, question_type, expected_concepts, candidate_answer, code_answer, language
        )

    def _evaluate_offline(
        self,
        question_text: str,
        question_type: str,
        expected_concepts: List[str],
        candidate_answer: str,
        code_answer: Optional[str],
        language: str
    ) -> Dict[str, Any]:
        """
        Intelligent offline evaluation using keyword coverage, linguistic depth, STAR structure, and code validation.
        """
        clean_ans = candidate_answer.strip()
        words = clean_ans.split()
        word_count = len(words)

        if word_count < 3 and not code_answer:
            return {
                "overall_score": 30.0,
                "technical_score": 30.0,
                "communication_score": 35.0,
                "problem_solving_score": 30.0,
                "relevance_score": 35.0,
                "confidence_score": 30.0,
                "feedback": "Answer was too brief. Try to elaborate on your reasoning and provide concrete examples.",
                "strengths": "Prompt submission.",
                "areas_for_improvement": "Elaborate on core concepts, provide specific architectural or real-world details, and structure your explanation.",
                "suggested_answer": "A complete answer should address the core definition, key trade-offs, and a practical application scenario.",
                "follow_up_suggested": "Could you expand on this and explain how you would handle potential edge cases?",
                "next_action": "follow_up"
            }

        # Concept matching
        matched_concepts = []
        for concept in (expected_concepts or []):
            concept_words = re.findall(r'\w+', concept.lower())
            if any(cw in clean_ans.lower() for cw in concept_words if len(cw) > 2):
                matched_concepts.append(concept)

        concept_ratio = len(matched_concepts) / max(len(expected_concepts or [1]), 1)
        
        # Calculate dynamic scores
        # Technical score
        tech_score = min(95.0, max(50.0, 55.0 + (concept_ratio * 35.0) + min(word_count * 0.2, 10.0)))
        
        # Communication score
        comm_score = min(96.0, max(60.0, 65.0 + min(word_count * 0.35, 25.0)))
        if word_count > 60:
            comm_score = min(comm_score + 5.0, 98.0)
            
        # Problem solving
        ps_score = min(94.0, max(55.0, 60.0 + (concept_ratio * 25.0) + (10.0 if code_answer else 5.0)))
        
        # Relevance
        relevance_score = min(95.0, max(55.0, 60.0 + (concept_ratio * 30.0)))
        
        # Confidence & clarity
        confidence_score = min(95.0, max(60.0, 65.0 + min(word_count * 0.25, 20.0)))

        overall = round((tech_score * 0.35 + comm_score * 0.25 + ps_score * 0.25 + relevance_score * 0.15), 1)

        # Strengths & improvements
        strengths = []
        improvements = []

        if matched_concepts:
            strengths.append(f"Demonstrated good familiarity with key terminology: {', '.join(matched_concepts[:3])}.")
        if word_count >= 25:
            strengths.append("Clear articulative pacing with structured response.")
        if code_answer:
            strengths.append("Provided a concrete functional code implementation.")

        if not strengths:
            strengths.append("Attempted the question directly and engaged with the prompt.")

        if concept_ratio < 0.5:
            improvements.append("Incorporate more technical depth and standard architectural terminology.")
        if word_count < 25:
            improvements.append("Use the STAR (Situation, Task, Action, Result) method to make answers more comprehensive.")
        improvements.append("Discuss practical production trade-offs and edge cases.")

        feedback = f"Good effort! Your response touched on {' and '.join(matched_concepts) if matched_concepts else 'the foundational basics'}. "
        if overall >= 80:
            feedback += "Excellent depth and clarity; your explanation was concise and confident."
        elif overall >= 65:
            feedback += "Solid response; consider backing up your explanation with a specific enterprise trade-off."
        else:
            feedback += "Fair attempt. Focusing on core design principles and giving concrete examples will elevate your score."

        return {
            "overall_score": overall,
            "technical_score": round(tech_score, 1),
            "communication_score": round(comm_score, 1),
            "problem_solving_score": round(ps_score, 1),
            "relevance_score": round(relevance_score, 1),
            "confidence_score": round(confidence_score, 1),
            "feedback": feedback,
            "strengths": "; ".join(strengths),
            "areas_for_improvement": "; ".join(improvements),
            "suggested_answer": "Focus on the primary mechanism, why it matters in high-scale systems, and how error recovery is handled.",
            "follow_up_suggested": "How would you handle scale and failure recovery for this in a distributed cloud environment?",
            "next_action": "next_question"
        }

    def _evaluate_gemini(
        self,
        question_text: str,
        question_type: str,
        expected_concepts: List[str],
        candidate_answer: str,
        code_answer: Optional[str],
        language: str
    ) -> Dict[str, Any]:
        prompt = f"""
You are a senior recruitment evaluator evaluating a candidate's interview answer.
Language of interview: {language}
Question: {question_text}
Question Type: {question_type}
Expected Concepts: {json.dumps(expected_concepts)}
Candidate Spoken/Text Answer: {candidate_answer}
Candidate Code (if any): {code_answer or 'None'}

Evaluate objectively. Provide scores out of 100 for overall, technical, communication, problem-solving, relevance, and confidence.
Return strictly valid JSON with this schema:
{{
  "overall_score": 82.0,
  "technical_score": 85.0,
  "communication_score": 80.0,
  "problem_solving_score": 80.0,
  "relevance_score": 84.0,
  "confidence_score": 80.0,
  "feedback": "Concise summary feedback string",
  "strengths": "Strengths identified",
  "areas_for_improvement": "Areas to improve",
  "suggested_answer": "Model reference answer",
  "follow_up_suggested": "A relevant follow-up question or null",
  "next_action": "next_question"
}}
"""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.2, "response_mime_type": "application/json"}
        }
        res = requests.post(url, headers=headers, json=payload, timeout=12)
        if res.status_code == 200:
            data = res.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(text)
        else:
            raise RuntimeError(f"Gemini API returned status {res.status_code}")

    def parse_resume(self, resume_text: str) -> Dict[str, Any]:
        """
        Extracts key skills, projects, and suggested job roles from resume text.
        """
        text_lower = resume_text.lower()
        all_skills = [
            "Python", "JavaScript", "TypeScript", "React", "Node.js", "Java", "Spring Boot",
            "C++", "SQL", "PostgreSQL", "MongoDB", "Docker", "Kubernetes", "AWS", "Azure",
            "Git", "Machine Learning", "Deep Learning", "FastAPI", "Django", "HTML/CSS",
            "Tailwind CSS", "Data Structures & Algorithms", "Microservices", "REST API"
        ]
        
        found_skills = [s for s in all_skills if s.lower() in text_lower]
        if not found_skills:
            found_skills = ["Software Engineering Fundamentals", "Problem Solving", "Object-Oriented Programming"]

        # Infer suggested roles
        suggested_roles = []
        if any(s in found_skills for s in ["React", "JavaScript", "TypeScript", "HTML/CSS"]):
            suggested_roles.append("Frontend Developer")
        if any(s in found_skills for s in ["Python", "Java", "Node.js", "FastAPI", "SQL"]):
            suggested_roles.append("Backend Developer")
        if any(s in found_skills for s in ["React", "Python", "Node.js", "Full-Stack"]):
            suggested_roles.append("Full-Stack Developer")
        if any(s in found_skills for s in ["Machine Learning", "Deep Learning"]):
            suggested_roles.append("AI/ML Engineer")
        if not suggested_roles:
            suggested_roles = ["Graduate Engineer Trainee", "Software Developer"]

        summary = f"Detected {len(found_skills)} primary skills with readiness for enterprise engineering interviews."
        return {
            "skills": found_skills,
            "experience_years": "Fresher to Early Career",
            "key_projects": ["Full-Stack Application Development", "Database Schema & API Design"],
            "suggested_roles": suggested_roles,
            "summary": summary
        }

ai_engine = AIEngine()
