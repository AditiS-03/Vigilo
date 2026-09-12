"""
Vigilo Multi-Signal Risk Engine
Combines ML risk score, URL heuristics, page indicators, AI risk assessment,
threat intelligence reputation, and adaptive protection thresholds into a calibrated
composite risk score (0-100) and severity classification.
"""

from typing import Dict, Any, List, Optional

class RiskEngine:
    def __init__(self):
        # Configurable signal weights (sum to 1.0)
        self.weights = {
            "ml_model": 0.45,
            "url_heuristics": 0.25,
            "gemini_assessment": 0.20,
            "threat_intel": 0.10
        }

    def compute_composite_risk(
        self,
        ml_score: int,
        detected_indicators: List[str],
        gemini_verdict: Optional[str] = None,
        threat_intel_score: Optional[int] = None,
        threat_category: str = "suspicious_content",
        adaptive_thresholds: Optional[Dict[str, int]] = None
    ) -> Dict[str, Any]:
        """
        Combines multiple distinct security signals into a composite score (0-100).
        Applies adaptive sensitivity boosts if the category has high historical frequency.
        """
        # Heuristic score based on detected indicator severity
        heuristic_score = min(100, len(detected_indicators) * 25)
        
        # AI score mapping
        ai_score_map = {
            "SAFE": 10,
            "SUSPICIOUS": 45,
            "HIGH_RISK": 75,
            "DANGEROUS": 95
        }
        ai_score = ai_score_map.get(gemini_verdict, ml_score)

        # Threat intel adjustment
        intel_weight = self.weights["threat_intel"] if threat_intel_score is not None else 0.0
        active_weights_sum = self.weights["ml_model"] + self.weights["url_heuristics"] + self.weights["gemini_assessment"] + intel_weight

        # Weighted calculation
        raw_composite = (
            (ml_score * self.weights["ml_model"]) +
            (heuristic_score * self.weights["url_heuristics"]) +
            (ai_score * self.weights["gemini_assessment"]) +
            ((threat_intel_score or 0) * intel_weight)
        ) / active_weights_sum

        composite_score = int(round(raw_composite))

        # Adaptive threshold check
        thresholds = adaptive_thresholds or {"gaming": 55, "phishing": 60, "downloads": 50, "default": 70}
        category_threshold = thresholds.get(threat_category.replace("_scams", ""), thresholds.get("default", 70))

        # Determine severity level
        if composite_score >= 81:
            severity = "DANGEROUS"
        elif composite_score >= 61 or (composite_score >= category_threshold and composite_score >= 55):
            severity = "HIGH_RISK"
        elif composite_score >= 31:
            severity = "SUSPICIOUS"
        else:
            severity = "SAFE"

        # Signal breakdown for auditability
        signals = {
            "ml_risk_score": ml_score,
            "heuristic_score": heuristic_score,
            "gemini_score": ai_score,
            "threat_intel_score": threat_intel_score if threat_intel_score is not None else "N/A",
            "indicator_count": len(detected_indicators),
            "adaptive_threshold_applied": category_threshold
        }

        return {
            "risk_score": composite_score,
            "severity": severity,
            "signals": signals,
            "requires_block": severity in ("HIGH_RISK", "DANGEROUS"),
            "requires_warning": severity == "SUSPICIOUS"
        }
