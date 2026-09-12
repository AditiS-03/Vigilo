import pytest
from services.risk_engine import RiskEngine

def test_risk_engine_safe():
    engine = RiskEngine()
    result = engine.compute_composite_risk(
        ml_score=10,
        detected_indicators=[],
        gemini_verdict="SAFE"
    )
    assert result["risk_score"] < 30
    assert result["severity"] == "SAFE"
    assert not result["requires_block"]

def test_risk_engine_dangerous():
    engine = RiskEngine()
    result = engine.compute_composite_risk(
        ml_score=90,
        detected_indicators=["Insecure HTTP", "Suspicious TLD", "Credential Harvester"],
        gemini_verdict="DANGEROUS"
    )
    assert result["risk_score"] >= 80
    assert result["severity"] == "DANGEROUS"
    assert result["requires_block"]
