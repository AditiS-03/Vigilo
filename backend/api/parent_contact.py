"""
Vigilo Parent Contact & Alert Preference Endpoints
GET /api/parent-contact
POST /api/parent-contact
GET /api/parent-contact/alerts
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any

from services.database_service import DatabaseService

router = APIRouter(prefix="/api/parent-contact", tags=["Parent Contact"])
db_service = DatabaseService()

class ParentContactRequest(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "Sarah Miller"})
    relationship: str = Field("Parent / Guardian", json_schema_extra={"example": "Mother"})
    email: str = Field(..., json_schema_extra={"example": "sarah.miller@example.com"})
    phone: str = Field(..., json_schema_extra={"example": "+1 (555) 019-2834"})
    alert_high_risk: bool = True
    alert_downloads: bool = True
    alert_medium_risk: bool = False
    notification_method: str = "in_app"

@router.get("")
def get_parent_contact():
    contact = db_service.get_parent_contact()
    return contact

@router.post("")
def save_parent_contact(req: ParentContactRequest):
    if not req.name or not req.email:
        raise HTTPException(status_code=400, detail="Name and email are required")
    saved = db_service.save_parent_contact(req.model_dump())
    return {
        "status": "SUCCESS",
        "message": "Parent contact information and alert preferences updated",
        "data": saved
    }

@router.get("/alerts")
def get_parent_alerts(limit: int = 20):
    alerts = db_service.get_parent_alerts(limit=limit)
    return {
        "count": len(alerts),
        "alerts": alerts
    }
