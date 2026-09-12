"""
Vigilo ML Training Pipeline
Trains a Random Forest classifier on URL and page heuristic vectors.
Designed with an abstract interface allowing XGBoost or LightGBM integration.
"""

import json
import os
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_score

from .feature_extraction import extract_features, FEATURE_NAMES
from .dataset import LABELED_DATASET

MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")
MODEL_PATH = os.path.join(MODEL_DIR, "model.joblib")
FEATURES_PATH = os.path.join(MODEL_DIR, "features.json")

def build_model(model_type: str = "random_forest"):
    """
    Model factory. Defaults to Random Forest; extensible to XGBoost.
    """
    if model_type == "random_forest":
        return RandomForestClassifier(
            n_estimators=100,
            max_depth=8,
            random_state=42,
            class_weight="balanced"
        )
    elif model_type == "xgboost":
        try:
            import xgboost as xgb
            return xgb.XGBClassifier(n_estimators=100, max_depth=6, random_state=42)
        except ImportError:
            print("[WARN] xgboost not installed, falling back to RandomForest")
            return RandomForestClassifier(n_estimators=100, random_state=42)
    else:
        raise ValueError(f"Unsupported model type: {model_type}")

def train_and_save_model(model_type: str = "random_forest"):
    """
    Extracts features across dataset, trains model, validates, and serializes artifact.
    """
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    X = []
    y = []
    
    for item in LABELED_DATASET:
        feat_res = extract_features(
            url=item["url"],
            page_content=item.get("page", ""),
            has_password_field=bool(item.get("pwd", 0))
        )
        X.append(feat_res["vector"])
        y.append(item["label"])
        
    X = np.array(X)
    y = np.array(y)
    
    model = build_model(model_type)
    
    # 3-Fold Stratified Cross Validation
    cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)
    scores = cross_val_score(model, X, y, cv=cv, scoring="accuracy")
    print(f"[ML-TRAIN] 3-Fold Cross-Validation Accuracy: {scores.mean():.3f} (+/- {scores.std():.3f})")
    
    # Fit full model
    model.fit(X, y)
    
    # Save model and feature names
    joblib.dump(model, MODEL_PATH)
    with open(FEATURES_PATH, "w", encoding="utf-8") as f:
        json.dump({
            "feature_names": FEATURE_NAMES,
            "model_type": model_type,
            "training_samples": len(X),
            "cv_accuracy": float(scores.mean())
        }, f, indent=2)
        
    print(f"[ML-TRAIN] Model serialized to {MODEL_PATH}")
    return model

if __name__ == "__main__":
    train_and_save_model()
