"""
Vigilo Threat Intelligence Service
Optional external reputation lookup (e.g., VirusTotal, Google Safe Browsing).
Features graceful offline fallback: if API key is not configured or network fails,
the system seamlessly continues operating using ML + URL heuristics + Gemini reasoning.
"""

import os
import requests
from typing import Dict, Any

class ThreatIntelligenceService:
    def __init__(self):
        self.api_key = os.getenv("THREAT_INTEL_API_KEY", "").strip()
        self.provider = os.getenv("THREAT_INTEL_PROVIDER", "none").lower()

    def check_url_reputation(self, url: str) -> Dict[str, Any]:
        """
        Checks external reputation database if API key is provided.
        Falls back to passive heuristics if unconfigured.
        """
        if not self.api_key or self.provider == "none":
            return {
                "available": False,
                "provider": "local_heuristics_fallback",
                "risk_score": None,
                "is_malicious": False,
                "status": "OFFLINE_FALLBACK_ACTIVE",
                "message": "External threat intel API key not configured; using local ML & heuristics."
            }

        try:
            # Example provider integration (VirusTotal v3 style)
            if self.provider == "virustotal":
                import base64
                url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")
                res = requests.get(
                    f"https://www.virustotal.com/api/v3/urls/{url_id}",
                    headers={"x-apikey": self.api_key},
                    timeout=5
                )
                if res.status_code == 200:
                    data = res.json().get("data", {}).get("attributes", {})
                    stats = data.get("last_analysis_stats", {})
                    malicious = stats.get("malicious", 0)
                    suspicious = stats.get("suspicious", 0)
                    total = sum(stats.values()) or 1
                    risk_ratio = (malicious * 2 + suspicious) / total
                    score = min(100, int(risk_ratio * 100))
                    return {
                        "available": True,
                        "provider": "virustotal",
                        "risk_score": score,
                        "is_malicious": malicious > 0,
                        "malicious_votes": malicious,
                        "suspicious_votes": suspicious,
                        "status": "SUCCESS"
                    }
        except Exception as e:
            print(f"[THREAT-INTEL-WARN] Lookup failed: {e}")

        return {
            "available": False,
            "provider": self.provider,
            "risk_score": None,
            "is_malicious": False,
            "status": "FALLBACK",
            "message": "External query timed out or failed; proceeding with ML engine."
        }

    def check_file_hash(self, filename: str, file_hash: str = "") -> Dict[str, Any]:
        """
        Checks reputation of a downloaded file artifact.
        """
        lower = filename.lower()
        is_risky_ext = lower.endswith((".exe", ".scr", ".bat", ".vbs", ".msi", ".iso"))
        
        return {
            "filename": filename,
            "is_dangerous_extension": is_risky_ext,
            "threat_intel_verified": False,
            "reputation": "UNKNOWN_SUSPICIOUS" if is_risky_ext else "BENIGN"
        }
