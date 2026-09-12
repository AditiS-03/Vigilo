import pytest
from services.response_agent import ResponseAgent, ALLOWED_ACTIONS
from services.gemini_service import GeminiService
from services.database_service import DatabaseService

def test_response_agent_allowed_actions_only():
    agent = ResponseAgent(GeminiService(), DatabaseService())
    context = {
        "url": "http://free-game-coins.xyz/hack.exe",
        "domain": "free-game-coins.xyz",
        "threat_type": "Dangerous Executable",
        "threat_category": "malicious_downloads",
        "risk_score": 92,
        "is_download": True,
        "download_metadata": {"filename": "hack.exe", "file_size": 1024}
    }
    decision = agent.decide_and_execute(context)
    actions = decision["actions"]
    assert "CANCEL_DOWNLOAD" in actions
    assert "QUARANTINE_SIMULATION" in actions
    assert "NOTIFY_PARENT" in actions
    for a in actions:
        assert a in ALLOWED_ACTIONS
