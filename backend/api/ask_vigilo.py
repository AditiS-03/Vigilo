"""
Vigilo Ask Vigilo Child-Safety Assistant Endpoint
POST /api/ask-vigilo
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from services.gemini_service import GeminiService

router = APIRouter(prefix="/api/ask-vigilo", tags=["Ask Vigilo AI"])
gemini_service = GeminiService()

class AskVigiloRequest(BaseModel):
    question: str = Field(..., json_schema_extra={"example": "Is this website safe?"})
    current_url: Optional[str] = "https://example.com"
    risk_score: Optional[int] = 0
    threat_type: Optional[str] = "None"
    detected_indicators: Optional[list] = []
    context: Optional[Any] = None

@router.post("")
def ask_vigilo(req: AskVigiloRequest):
    ctx = {
        "url": req.current_url,
        "risk_score": req.risk_score,
        "threat_type": req.threat_type,
        "detected_indicators": req.detected_indicators or []
    }
    if isinstance(req.context, dict):
        ctx.update(req.context)
    elif isinstance(req.context, str) and req.context:
        ctx["url"] = req.context

    answer = gemini_service.ask_vigilo(req.question, ctx)
    prevention = gemini_service.build_prevention_guidance(req.question, ctx)
    return {
        "question": req.question,
        "answer": answer,
        "response": answer,
        "assistant_name": "Vigilo Companion Owl",
        "tone": "child_friendly",
        "safety_tip": prevention["safety_tip"],
        "action_recommended": prevention["action_recommended"],
    }
