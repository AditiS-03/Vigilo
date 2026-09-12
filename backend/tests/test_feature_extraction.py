import pytest
from ml.feature_extraction import extract_features, FEATURE_NAMES

def test_extract_features_safe_url():
    url = "https://kids.nationalgeographic.com/animals"
    res = extract_features(url)
    assert res["domain"] == "kids.nationalgeographic.com"
    assert res["features"]["is_https"] == 1
    assert res["features"]["is_ip_address"] == 0
    assert res["features"]["has_suspicious_tld"] == 0
    assert len(res["vector"]) == len(FEATURE_NAMES)
    assert len(res["detected_indicators"]) == 0

def test_extract_features_scam_url():
    url = "http://192.168.1.10/free-minecraft-coins.xyz/claim?user=steve&token=123"
    res = extract_features(url, page_content="Enter password now for free coins!", has_password_field=True)
    assert res["features"]["is_https"] == 0
    assert res["features"]["is_ip_address"] == 1
    assert res["features"]["has_password_field"] == 1
    assert res["features"]["scam_keyword_count"] >= 2
    assert len(res["detected_indicators"]) >= 2
