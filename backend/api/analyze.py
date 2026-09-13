"""
Vigilo Analyze Endpoints
POST /api/analyze/url
POST /api/analyze/page
POST /api/analyze/download
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

from ml.predict import predict_threat
from services.gemini_service import GeminiService
from services.threat_intelligence_service import ThreatIntelligenceService
from services.risk_engine import RiskEngine
from services.response_agent import ResponseAgent
from services.database_service import DatabaseService

router = APIRouter(prefix="/api/analyze", tags=["Analyze"])

gemini_service = GeminiService()
threat_intel = ThreatIntelligenceService()
risk_engine = RiskEngine()
db_service = DatabaseService()
response_agent = ResponseAgent(gemini_service, db_service)

class URLAnalyzeRequest(BaseModel):
    url: str = Field(..., json_schema_extra={"example": "http://free-minecraft-coins-999.xyz/claim"})
    context: Optional[Dict[str, Any]] = None

class PageAnalyzeRequest(BaseModel):
    url: str = Field(..., json_schema_extra={"example": "http://roblox-free-robux.top/login.html"})
    page_content: str = Field(..., json_schema_extra={"example": "Congratulations! Claim 10,000 Robux now. Enter password."})
    has_password_field: bool = False
    context: Optional[Dict[str, Any]] = None

class DownloadAnalyzeRequest(BaseModel):
    filename: str = Field(..., json_schema_extra={"example": "free-minecraft-coins.exe"})
    source_url: str = Field(..., json_schema_extra={"example": "http://free-coins.xyz/download"})
    file_size: Optional[int] = 0

class ScreenAnalyzeRequest(BaseModel):
    image_base64: str
    url: Optional[str] = ""
    page_title: Optional[str] = "Screen Capture"

def compute_verification_status(domain: str, url: str, risk_score: int, indicators: List[str], db_service: DatabaseService) -> str:
    trusted = db_service.get_trusted_sources_db()
    for t in trusted:
        if t["domain"].lower() in domain.lower() or t["domain"].lower() in url.lower():
            return "VERIFIED"
    if risk_score >= 60 or any(k in " ".join(indicators).lower() for k in ["credential", "lure", "phishing", "fake", "executable"]):
        return "SUSPICIOUS"
    return "UNVERIFIED"

@router.post("/url")
def analyze_url(req: URLAnalyzeRequest):
    if not req.url:
        raise HTTPException(status_code=400, detail="URL is required")

    # 1. ML Analysis
    ml_res = predict_threat(req.url)

    # 2. Threat Intel (optional external check)
    intel_res = threat_intel.check_url_reputation(req.url)

    # 3. Adaptive Profile Fetch
    adaptive_profile = db_service.get_adaptive_profile()

    # 4. Gemini Threat Explanation
    ai_explanation = gemini_service.explain_threat(
        threat_type=ml_res["threat_type"],
        url=req.url,
        domain=ml_res["domain"],
        risk_score=ml_res["risk_score"],
        indicators=ml_res["detected_indicators"]
    )

    # 5. Composite Risk Calculation
    composite = risk_engine.compute_composite_risk(
        ml_score=ml_res["risk_score"],
        detected_indicators=ml_res["detected_indicators"],
        gemini_verdict=ai_explanation.get("risk_verdict"),
        threat_intel_score=intel_res.get("risk_score"),
        threat_category=ml_res["threat_category"],
        adaptive_thresholds=adaptive_profile.get("adapted_thresholds")
    )

    verif_status = compute_verification_status(
        domain=ml_res["domain"],
        url=req.url,
        risk_score=composite["risk_score"],
        indicators=ml_res["detected_indicators"],
        db_service=db_service
    )

    # 6. Response Agent Execution
    agent_context = {
        "url": req.url,
        "domain": ml_res["domain"],
        "threat_type": ml_res["threat_type"],
        "threat_category": ml_res["threat_category"],
        "risk_score": composite["risk_score"],
        "confidence": ml_res["confidence"],
        "detected_indicators": ml_res["detected_indicators"],
        "verification_status": verif_status,
        "ml_result": ml_res,
        "ai_assessment": ai_explanation,
        "is_download": False
    }
    agent_decision = response_agent.decide_and_execute(agent_context)

    # 7. Safe Alternatives if blocked/warned
    safe_alts = []
    if composite["requires_block"] or composite["requires_warning"]:
        intent_info = gemini_service.classify_safe_intent(req.url)
        safe_alts = db_service.get_safe_resources(category=intent_info.get("category", "gaming"))

    return {
        "url": req.url,
        "domain": ml_res["domain"],
        "threat_type": ml_res["threat_type"],
        "threat_category": ml_res["threat_category"],
        "risk_score": composite["risk_score"],
        "severity": composite["severity"],
        "verification_status": verif_status,
        "confidence": ml_res["confidence"],
        "detected_indicators": ml_res["detected_indicators"],
        "explanation": ai_explanation,
        "response_actions": agent_decision["actions"],
        "incident_id": agent_decision.get("incident_id"),
        "safe_alternatives": safe_alts[:3],
        "signals": composite["signals"]
    }

@router.post("/page")
def analyze_page(req: PageAnalyzeRequest):
    ml_res = predict_threat(
        url=req.url,
        page_content=req.page_content,
        has_password_field=req.has_password_field
    )
    
    adaptive_profile = db_service.get_adaptive_profile()

    ai_explanation = gemini_service.explain_threat(
        threat_type=ml_res["threat_type"],
        url=req.url,
        domain=ml_res["domain"],
        risk_score=ml_res["risk_score"],
        indicators=ml_res["detected_indicators"]
    )

    composite = risk_engine.compute_composite_risk(
        ml_score=ml_res["risk_score"],
        detected_indicators=ml_res["detected_indicators"],
        gemini_verdict=ai_explanation.get("risk_verdict"),
        threat_category=ml_res["threat_category"],
        adaptive_thresholds=adaptive_profile.get("adapted_thresholds")
    )

    verif_status = compute_verification_status(
        domain=ml_res["domain"],
        url=req.url,
        risk_score=composite["risk_score"],
        indicators=ml_res["detected_indicators"],
        db_service=db_service
    )

    agent_context = {
        "url": req.url,
        "domain": ml_res["domain"],
        "threat_type": ml_res["threat_type"],
        "threat_category": ml_res["threat_category"],
        "risk_score": composite["risk_score"],
        "confidence": ml_res["confidence"],
        "detected_indicators": ml_res["detected_indicators"],
        "verification_status": verif_status,
        "ml_result": ml_res,
        "ai_assessment": ai_explanation,
        "is_download": False
    }
    agent_decision = response_agent.decide_and_execute(agent_context)

    safe_alts = []
    if composite["requires_block"] or composite["requires_warning"]:
        intent_info = gemini_service.classify_safe_intent(req.url + " " + req.page_content)
        safe_alts = db_service.get_safe_resources(category=intent_info.get("category", "gaming"))

    return {
        "url": req.url,
        "domain": ml_res["domain"],
        "threat_type": ml_res["threat_type"],
        "threat_category": ml_res["threat_category"],
        "risk_score": composite["risk_score"],
        "severity": composite["severity"],
        "verification_status": verif_status,
        "confidence": ml_res["confidence"],
        "detected_indicators": ml_res["detected_indicators"],
        "explanation": ai_explanation,
        "response_actions": agent_decision["actions"],
        "incident_id": agent_decision.get("incident_id"),
        "safe_alternatives": safe_alts[:3]
    }

@router.post("/download")
def analyze_download(req: DownloadAnalyzeRequest):
    """
    Vigilo Clean-Up: Analyzes incoming browser download event.
    Interception, calculation, quarantine simulation, and recovery guidance.
    """
    fn_lower = req.filename.lower()
    dangerous_exts = [".exe", ".scr", ".bat", ".vbs", ".msi", ".iso", ".pif", ".cmd", ".ps1"]
    is_exec = any(fn_lower.endswith(ext) for ext in dangerous_exts)
    
    indicators = []
    if is_exec:
        indicators.append(f"Direct executable file extension ({fn_lower.split('.')[-1]})")
    if any(k in fn_lower for k in ["free", "cheat", "hack", "coin", "robux", "vbuck", "skin"]):
        indicators.append("Bait reward keyword in filename")
        
    source_ml = predict_threat(req.source_url)
    
    # Calculate download risk
    risk = 92 if is_exec and indicators else (85 if is_exec else 30)
    
    agent_context = {
        "url": req.source_url,
        "domain": source_ml["domain"],
        "threat_type": "Dangerous Executable Download",
        "threat_category": "malicious_downloads",
        "risk_score": risk,
        "confidence": 95,
        "detected_indicators": indicators + source_ml["detected_indicators"],
        "download_metadata": {
            "filename": req.filename,
            "file_size": req.file_size
        },
        "is_download": True
    }
    
    agent_decision = response_agent.decide_and_execute(agent_context)

    return {
        "filename": req.filename,
        "source_url": req.source_url,
        "risk_score": risk,
        "severity": "DANGEROUS" if risk >= 80 else "SUSPICIOUS",
        "action_taken": "CANCEL_DOWNLOAD",
        "quarantine_status": "DEMO_QUARANTINED",
        "reason": f"Suspicious executable ({req.filename}) from unverified origin with bait characteristics.",
        "detected_indicators": indicators,
        "recovery_guidance": agent_decision.get("recovery_guidance", []),
        "incident_id": agent_decision.get("incident_id"),
        "parent_alert_sent": True,
        "notice": "DEMO QUARANTINE: Simulated quarantine workflow in compliance with browser sandbox boundaries."
    }

@router.post("/screen")
def analyze_screen(req: ScreenAnalyzeRequest):
    """
    Analyzes captured screen share image via Gemini Vision AI and feature extraction.
    """
    if not req.image_base64:
        raise HTTPException(status_code=400, detail="Image base64 payload is required")

    vision_res = gemini_service.analyze_screen_image(req.image_base64, req.url or "")
    
    url_target = req.url or "https://screen-capture.local"
    domain = url_target.split("//")[-1].split("/")[0] or "screen-share.local"
    risk_score = vision_res.get("risk_score", 85)
    indicators = vision_res.get("detected_indicators", []) + vision_res.get("visual_signals", [])

    verif_status = compute_verification_status(
        domain=domain,
        url=url_target,
        risk_score=risk_score,
        indicators=indicators,
        db_service=db_service
    )

    agent_context = {
        "url": url_target,
        "domain": domain,
        "threat_type": vision_res.get("threat_type", "Suspicious Page Elements"),
        "threat_category": vision_res.get("threat_category", "gaming_scams"),
        "risk_score": risk_score,
        "confidence": 92,
        "detected_indicators": indicators,
        "verification_status": verif_status,
        "is_download": False
    }
    agent_decision = response_agent.decide_and_execute(agent_context)

    intent_info = gemini_service.classify_safe_intent(vision_res.get("threat_type", "gaming"))
    safe_alts = db_service.get_safe_resources(category=intent_info.get("category", "gaming"))

    return {
        "url": url_target,
        "domain": domain,
        "threat_type": vision_res.get("threat_type", "Suspicious Page Elements"),
        "threat_category": vision_res.get("threat_category", "gaming_scams"),
        "risk_score": risk_score,
        "severity": "DANGEROUS" if risk_score >= 80 else ("SUSPICIOUS" if risk_score >= 50 else "SAFE"),
        "verification_status": verif_status,
        "confidence": 92,
        "detected_indicators": indicators,
        "explanation": {
            "child_explanation": vision_res.get("child_explanation"),
            "parent_technical_summary": vision_res.get("parent_technical_summary"),
            "risk_explanation": vision_res.get("child_explanation")
        },
        "response_actions": agent_decision["actions"],
        "incident_id": agent_decision.get("incident_id"),
        "safe_alternatives": safe_alts[:3],
        "final_decision": "BLOCK_PAGE" if risk_score >= 80 else ("WARN" if risk_score >= 50 else "ALLOW")
    }

