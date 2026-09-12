"""
Vigilo Response Agent & Policy Guardrail Engine
Coordinates multi-signal threat inputs, queries Gemini AI for policy reasoning,
and enforces a strict security policy engine with a fixed set of allowed actions.
Arbitrary command execution is strictly prohibited by design.
"""

from typing import Dict, Any, List
from .gemini_service import GeminiService
from .database_service import DatabaseService

ALLOWED_ACTIONS = {
    "ALLOW",
    "WARN",
    "BLOCK_PAGE",
    "CANCEL_DOWNLOAD",
    "QUARANTINE_SIMULATION",
    "GENERATE_EVIDENCE",
    "NOTIFY_PARENT",
    "SHOW_RECOVERY_GUIDANCE",
    "SHOW_SAFE_ALTERNATIVE",
    "START_COACH_LESSON"
}

class ResponseAgent:
    def __init__(self, gemini_service: GeminiService, db_service: DatabaseService):
        self.gemini = gemini_service
        self.db = db_service

    def decide_and_execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Full response workflow:
        1. Query Gemini for advisory recommendations
        2. Policy Engine validates and strictly filters allowed actions
        3. Policy Engine enforces mandatory guardrails based on risk score and download status
        4. Triggers automatic evidence generation and parent alert when appropriate
        5. Returns structured action response to client
        """
        risk_score = context.get("risk_score", 0)
        threat_category = context.get("threat_category", "suspicious_content")
        is_download = context.get("is_download", False)
        
        # 1. Ask Gemini for recommendations
        gemini_recommendations = self.gemini.reason_response_actions(context)
        
        # 2. Filter strictly by ALLOWED_ACTIONS
        validated_actions = [a for a in gemini_recommendations if a in ALLOWED_ACTIONS]
        
        # 3. Deterministic Policy Guardrails (Backend Rules override model omissions)
        final_actions = set(validated_actions)

        if is_download:
            if risk_score >= 50:
                final_actions.add("CANCEL_DOWNLOAD")
                final_actions.add("QUARANTINE_SIMULATION")
                final_actions.add("SHOW_RECOVERY_GUIDANCE")
                final_actions.add("GENERATE_EVIDENCE")
                final_actions.add("NOTIFY_PARENT")
                final_actions.discard("ALLOW")
        elif risk_score >= 80:
            final_actions.add("BLOCK_PAGE")
            final_actions.add("GENERATE_EVIDENCE")
            final_actions.add("NOTIFY_PARENT")
            final_actions.add("SHOW_SAFE_ALTERNATIVE")
            final_actions.add("START_COACH_LESSON")
            final_actions.discard("ALLOW")
            final_actions.discard("WARN")
        elif risk_score >= 55:
            final_actions.add("WARN")
            final_actions.add("SHOW_SAFE_ALTERNATIVE")
            final_actions.discard("ALLOW")
        else:
            if not final_actions:
                final_actions.add("ALLOW")

        ordered_actions = [a for a in [
            "BLOCK_PAGE", "CANCEL_DOWNLOAD", "QUARANTINE_SIMULATION", "WARN",
            "GENERATE_EVIDENCE", "NOTIFY_PARENT", "SHOW_RECOVERY_GUIDANCE",
            "SHOW_SAFE_ALTERNATIVE", "START_COACH_LESSON", "ALLOW"
        ] if a in final_actions]

        # Recovery guidance if relevant
        recovery_guidance = []
        if "SHOW_RECOVERY_GUIDANCE" in ordered_actions:
            recovery_guidance = [
                "The suspicious file download was prevented and placed in demo quarantine.",
                "Check your browser download history and delete any incomplete .part or .crdownload files.",
                "Never run files ending in .exe, .scr, or .bat from unverified gaming or prize websites.",
                "If you entered any account passwords on this website, tell a parent and change your password immediately."
            ]

        # 4. Create Incident & Evidence Pack if High Risk or Download
        incident_id = None
        if "GENERATE_EVIDENCE" in ordered_actions or risk_score >= 60:
            incident_data = {
                "threat_type": context.get("threat_type", "High Risk Activity"),
                "threat_category": threat_category,
                "risk_score": risk_score,
                "confidence": context.get("confidence", 90),
                "url": context.get("url", ""),
                "domain": context.get("domain", ""),
                "action_taken": "BLOCK_PAGE" if "BLOCK_PAGE" in ordered_actions else ("CANCEL_DOWNLOAD" if is_download else "WARN"),
                "detected_indicators": context.get("detected_indicators", []),
                "ml_result": context.get("ml_result", {}),
                "ai_assessment": context.get("ai_assessment", {}),
                "download_metadata": context.get("download_metadata"),
                "parent_notified": "NOTIFY_PARENT" in ordered_actions
            }
            recorded = self.db.record_incident(incident_data)
            incident_id = recorded["id"]

            if is_download:
                self.db.record_download_event({
                    "incident_id": incident_id,
                    "filename": context.get("download_metadata", {}).get("filename", "unknown.exe"),
                    "file_size": context.get("download_metadata", {}).get("file_size", 0),
                    "source_url": context.get("url", ""),
                    "risk_score": risk_score,
                    "threat_reason": f"Executable download blocked from suspicious origin: {context.get('threat_type', '')}",
                    "quarantine_status": "DEMO_QUARANTINED",
                    "recovery_guidance": recovery_guidance
                })

        return {
            "status": "PROCESSED",
            "risk_score": risk_score,
            "actions": ordered_actions,
            "incident_id": incident_id,
            "recovery_guidance": recovery_guidance,
            "policy_audit": {
                "gemini_proposed": gemini_recommendations,
                "policy_enforced": ordered_actions,
                "guardrail_status": "SECURE_VALIDATED"
            }
        }
