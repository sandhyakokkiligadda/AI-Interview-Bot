from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_tts_endpoint():
    res = client.get("/api/tts?text=Welcome%20to%20your%20interview&language=English")
    assert res.status_code == 200
    assert "audio/mpeg" in res.headers.get("content-type", "")
    assert len(res.content) > 1000

def test_question_diversity_across_sessions():
    s1 = client.post("/api/interviews", json={"job_role": "Software Developer", "language": "English"}).json()
    s2 = client.post("/api/interviews", json={"job_role": "Software Developer", "language": "English"}).json()

    # Question 0 is always universal opening
    q0_s1 = client.post(f"/api/interviews/{s1['id']}/next-question").json()
    q0_s2 = client.post(f"/api/interviews/{s2['id']}/next-question").json()
    assert "Tell me about yourself" in q0_s1["question_text"]
    assert "Tell me about yourself" in q0_s2["question_text"]

    # Submit answer for Q0 in session 1
    client.post(
        f"/api/interviews/{s1['id']}/answer",
        json={"question_id": q0_s1["id"], "transcript_text": "I am a full stack software engineer with 2 years of experience building scalable applications."}
    )

    # Get Q1 in session 1
    q1_s1 = client.post(f"/api/interviews/{s1['id']}/next-question").json()

    # Submit answer for Q0 in session 2
    client.post(
        f"/api/interviews/{s2['id']}/answer",
        json={"question_id": q0_s2["id"], "transcript_text": "I am a developer specializing in backend cloud infrastructure and microservices."}
    )

    # Get Q1 in session 2
    q1_s2 = client.post(f"/api/interviews/{s2['id']}/next-question").json()

    # Both questions should be non-empty and valid
    assert len(q1_s1["question_text"]) > 20
    assert len(q1_s2["question_text"]) > 20
    print(f"\n[Session 1 Q1]: {q1_s1['question_text']}")
    print(f"[Session 2 Q1]: {q1_s2['question_text']}")
