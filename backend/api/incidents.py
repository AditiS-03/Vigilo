"""
Vigilo Evidence Pack & Incidents API
POST /api/incidents
GET /api/incidents
GET /api/incidents/{id}
GET /api/incidents/{id}/report
"""

import os
from fastapi import APIRouter, HTTPException, Query, Response
from fastapi.responses import FileResponse, HTMLResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from services.database_service import DatabaseService
from evidence.report_generator import generate_pdf_report, generate_html_report

router = APIRouter(prefix="/api/incidents", tags=["Incidents & Evidence"])
db_service = DatabaseService()

class CreateIncidentRequest(BaseModel):
    threat_type: str
    threat_category: str
    risk_score: int
    confidence: Optional[int] = 90
    url: str
    domain: str
    action_taken: str
    detected_indicators: Optional[List[str]] = []
    ml_result: Optional[Dict[str, Any]] = {}
    ai_assessment: Optional[Dict[str, Any]] = {}
    download_metadata: Optional[Dict[str, Any]] = None

@router.post("")
def create_incident(req: CreateIncidentRequest):
    data = req.dict()
    saved = db_service.record_incident(data)
    return saved

@router.get("")
def list_incidents(limit: int = Query(50, ge=1, le=100)):
    return db_service.get_incidents(limit=limit)

@router.get("/{incident_id}")
def get_incident_detail(incident_id: str):
    inc = db_service.get_incident(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc

@router.get("/{incident_id}/report")
def get_incident_report(incident_id: str, format: str = Query("pdf", pattern="^(pdf|html|json)$")):
    inc = db_service.get_incident(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    if format == "json":
        return inc
    elif format == "html":
        html_content = generate_html_report(inc)
        return HTMLResponse(content=html_content)
    else: # pdf
        pdf_path = generate_pdf_report(inc)
        if not os.path.exists(pdf_path):
            raise HTTPException(status_code=500, detail="Failed to generate PDF")
        return FileResponse(
            path=pdf_path,
            filename=f"Vigilo_Evidence_{incident_id}.pdf",
            media_type="application/pdf"
        )
