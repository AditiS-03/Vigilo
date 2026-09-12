"""
Vigilo Response Agent Endpoint
POST /api/agent/respond
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

from services.gemini_service import GeminiService
from services.database_service import DatabaseService
from services.response_agent import ResponseAgent

router = APIRouter(prefix="/api/agent", tags=["Response Agent"])

gemini_service = GeminiService()
db_service = DatabaseService()
response_agent = ResponseAgent(gemini_service, db_service)

class AgentRespondRequest(BaseModel):
    url: str
    domain: Optional[str] = ""
    threat_type: str = "Suspicious Activity"
    threat_category: str = "suspicious_content"
    risk_score: int = Field(..., ge=0, le=100)
    confidence: Optional[int] = 90
    detected_indicators: Optional[List[str]] = []
    download_metadata: Optional[Dict[str, Any]] = None
    is_download: Optional[bool] = False

@router.post("/respond")
def respond_to_threat(req: AgentRespondRequest):
    context = req.dict()
    result = response_agent.decide_and_execute(context)
    return result
