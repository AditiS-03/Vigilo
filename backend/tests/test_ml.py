import pytest
from ml.predict import predict_threat

def test_ml_predict_safe():
    res = predict_threat("https://kids.nationalgeographic.com/animals")
    assert res["risk_score"] < 40
    assert res["threat_category"] == "safe"
    assert "detected_indicators" in res

def test_ml_predict_scam():
    res = predict_threat(
        "http://free-minecraft-coins-999.xyz/claim?user=steve",
        page_content="Congratulations! You won 10,000 free coins. Enter username and password.",
        has_password_field=True
    )
    assert res["risk_score"] >= 70
    assert res["threat_category"] in ("gaming_scams", "phishing")
    assert len(res["detected_indicators"]) > 0
