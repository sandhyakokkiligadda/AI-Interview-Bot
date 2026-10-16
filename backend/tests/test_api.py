import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "service" in data

def test_create_interview_and_flow():
    # 1. Create interview session in Telugu
    payload = {
        "candidate_name": "Ravi Kumar",
        "interview_type": "Technical Interview",
        "job_role": "Software Developer",
        "experience_level": "Fresher",
        "difficulty": "Medium",
        "duration_minutes": 15,
        "language": "Telugu",
        "interview_mode": "voice_and_text",
        "enable_hints": True,
        "enable_coding": True,
        "total_questions": 3
    }
    create_resp = client.post("/api/interviews", json=payload)
    assert create_resp.status_code == 200
    interview = create_resp.json()
    interview_id = interview["id"]
    assert interview["candidate_name"] == "Ravi Kumar"
    assert interview["language"] == "Telugu"

    # 2. Get next question
    q_resp = client.post(f"/api/interviews/{interview_id}/next-question")
    assert q_resp.status_code == 200
    q_data = q_resp.json()
    q_id = q_data["id"]
    assert q_data["question_index"] == 0

    # 3. Submit candidate answer
    ans_payload = {
        "question_id": q_id,
        "transcript_text": "సింక్రోనస్ ప్రోగ్రామింగ్‌లో ఒక పని పూర్తయ్యే వరకు వేచి ఉండాలి. అసెంక్రోనస్ లో ఈవెంట్ లూప్ మరియు నాన్-బ్లాకింగ్ I/O ద్వారా ఇతర పనులు ఆగకుండా నడుస్తాయి.",
        "input_method": "voice",
        "duration_seconds": 25.5
    }
    ans_resp = client.post(f"/api/interviews/{interview_id}/answer", json=ans_payload)
    assert ans_resp.status_code == 200
    eval_data = ans_resp.json()
    assert eval_data["overall_score"] > 50.0

    # 4. Complete interview & get final report
    comp_resp = client.post(f"/api/interviews/{interview_id}/complete")
    assert comp_resp.status_code == 200
    report = comp_resp.json()
    assert report["candidate_name"] == "Ravi Kumar"
    assert report["performance_rating"] in ["Excellent", "Good", "Average", "Needs Improvement"]
    assert len(report["strengths"]) > 0

def test_termination_endpoint():
    create_resp = client.post("/api/interviews", json={"candidate_name": "Proctoring Test", "job_role": "AI/ML Engineer"})
    session = create_resp.json()
    term_resp = client.post(
        f"/api/interviews/{session['id']}/terminate",
        json={"termination_reason": "Terminated due to repeated tab switching", "proctoring_violations": 3}
    )
    assert term_resp.status_code == 200
    data = term_resp.json()
    assert data["is_terminated"] is True
    assert data["proctoring_violations"] == 3
    assert "tab switching" in data["termination_reason"]

def test_resume_parser():
    resume_payload = {
        "resume_text": "Experienced Python, React and PostgreSQL developer with Docker, AWS cloud deployment, and REST API design."
    }
    resp = client.post("/api/parse-resume", json=resume_payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "Python" in data["skills"]
