"""
Vigilo ML Prediction & Inference Pipeline
Loads trained model and evaluates incoming URLs or webpage payloads.
"""

import os
import joblib
import numpy as np
from typing import Dict, Any

from .feature_extraction import extract_features, FEATURE_NAMES

MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")
MODEL_PATH = os.path.join(MODEL_DIR, "model.joblib")

_LOADED_MODEL = None

def get_model():
    """Lazy-loads or auto-trains model on first inference request."""
    global _LOADED_MODEL
    if _LOADED_MODEL is None:
        if not os.path.exists(MODEL_PATH):
            from .train import train_and_save_model
            _LOADED_MODEL = train_and_save_model()
        else:
            _LOADED_MODEL = joblib.load(MODEL_PATH)
    return _LOADED_MODEL

def predict_threat(url: str, page_content: str = "", has_password_field: bool = False) -> Dict[str, Any]:
    """
    Evaluates URL and page characteristics to return risk score, threat category, and indicators.
    """
    feat_res = extract_features(url, page_content, has_password_field)
    vector = np.array([feat_res["vector"]])
    
    model = get_model()
    
    # Predict probabilities: [P(Safe), P(Malicious)]
    probs = model.predict_proba(vector)[0]
    prob_malicious = float(probs[1]) if len(probs) > 1 else float(probs[0])
    
    # Scale to 0-100
    risk_score = int(round(prob_malicious * 100))
    confidence = int(round(max(probs) * 100))
    
    # Determine specific threat classification
    url_lower = (url or "").lower()
    page_lower = (page_content or "").lower()
    
    threat_category = "safe"
    threat_type = "Safe Website"
    
    if risk_score >= 50:
        if any(w in url_lower for w in [".exe", ".scr", ".bat", ".msi", "installer", "download"]):
            threat_category = "malicious_downloads"
            threat_type = "Malicious Download Portal"
        elif any(w in url_lower or w in page_lower for w in ["coins", "robux", "vbucks", "prize", "winner", "gems"]):
            threat_category = "gaming_scams"
            threat_type = "Gaming Scam & Fake Reward"
        elif feat_res["features"]["has_password_field"] or any(w in url_lower for w in ["login", "signin", "verify", "password", "steamcommunity", "discord"]):
            threat_category = "phishing"
            threat_type = "Credential Phishing Portal"
        else:
            threat_category = "suspicious_content"
            threat_type = "Suspicious Domain Activity"
    elif risk_score >= 30:
        threat_category = "suspicious_content"
        threat_type = "Potential Security Concern"

    return {
        "url": url,
        "domain": feat_res["domain"],
        "risk_score": risk_score,
        "threat_type": threat_type,
        "threat_category": threat_category,
        "confidence": confidence,
        "detected_indicators": feat_res["detected_indicators"],
        "features": feat_res["features"],
        "model_version": "RandomForest-1.0"
    }
