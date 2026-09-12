import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_and_root():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["status"] == "ONLINE"
    
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_analyze_url_safe():
    res = client.post("/api/analyze/url", json={"url": "https://kids.nationalgeographic.com/animals"})
    assert res.status_code == 200
    data = res.json()
    assert data["severity"] == "SAFE"
    assert "ALLOW" in data["response_actions"]

def test_analyze_url_scam():
    res = client.post("/api/analyze/url", json={"url": "http://free-minecraft-coins-999.xyz/claim?user=steve"})
    assert res.status_code == 200
    data = res.json()
    assert data["risk_score"] >= 70
    assert "BLOCK_PAGE" in data["response_actions"]
    assert len(data["safe_alternatives"]) > 0

def test_analyze_download():
    res = client.post("/api/analyze/download", json={
        "filename": "free_minecraft_coins.exe",
        "source_url": "http://free-coins.xyz/download",
        "file_size": 1048576
    })
    assert res.status_code == 200
    data = res.json()
    assert data["quarantine_status"] == "DEMO_QUARANTINED"
    assert data["action_taken"] == "CANCEL_DOWNLOAD"
    assert len(data["recovery_guidance"]) > 0

def test_dashboard_and_incidents():
    res = client.get("/api/dashboard/summary")
    assert res.status_code == 200
    data = res.json()
    assert "todays_protection" in data
    assert "adaptive_profile" in data

    res = client.get("/api/incidents")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_adaptive_profile_flow():
    res = client.get("/api/adaptive-profile")
    assert res.status_code == 200
    initial_gaming = res.json()["gaming_scams"]

    res = client.post("/api/adaptive-profile/adjust", json={"category": "gaming_scams", "increment_by": 2})
    assert res.status_code == 200
    assert res.json()["gaming_scams"] == initial_gaming + 2

def test_coach_and_safe_alternatives():
    res = client.get("/api/coach/lessons")
    assert res.status_code == 200
    lessons = res.json()
    assert len(lessons) > 0

    first_lesson = lessons[0]
    res = client.post("/api/coach/answer", json={
        "lesson_id": first_lesson["id"],
        "user_answer": first_lesson["correct_answer"]
    })
    assert res.status_code == 200
    assert res.json()["is_correct"] is True

    res = client.get("/api/safe-alternatives?query=minecraft%20skins")
    assert res.status_code == 200
    alts = res.json()
    assert len(alts["verified_resources"]) > 0

def test_ask_vigilo_ai():
    res = client.post("/api/ask-vigilo", json={
        "question": "Is this website safe?",
        "current_url": "http://free-game-coins.xyz",
        "risk_score": 90,
        "threat_type": "Gaming Phishing"
    })
    assert res.status_code == 200
    assert len(res.json()["response"]) > 10

def test_demo_scenarios():
    res = client.get("/api/demo/scenarios")
    assert res.status_code == 200
    scenarios = res.json()
    assert len(scenarios) == 7

    res = client.post("/api/demo/simulate/scenario_2_gaming_scam")
    assert res.status_code == 200
    sim = res.json()
    assert sim["scenario"]["id"] == "scenario_2_gaming_scam"
    assert "result" in sim
