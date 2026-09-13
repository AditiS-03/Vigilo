"""
Vigilo Adaptive Protection API Router
GET /api/adaptive
POST /api/adaptive/trigger
POST /api/adaptive/thresholds
"""

import json
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict

from services.database_service import DatabaseService

router = APIRouter(prefix="/api/adaptive", tags=["Adaptive Protection"])
db_service = DatabaseService()

class TriggerAdaptiveRequest(BaseModel):
    category: str

class UpdateThresholdsRequest(BaseModel):
    gaming: Optional[int] = 55
    phishing: Optional[int] = 60
    downloads: Optional[int] = 50
    default: Optional[int] = 70

@router.get("")
def get_adaptive_profile():
    return db_service.get_adaptive_profile()

@router.post("/trigger")
def trigger_adaptive_incident(req: TriggerAdaptiveRequest):
    conn = db_service._get_connection()
    cur = conn.cursor()
    db_service._increment_category_count(cur, req.category)
    conn.commit()
    conn.close()
    profile = db_service.get_adaptive_profile()
    return {
        "status": "SUCCESS",
        "category_incremented": req.category,
        "profile": profile
    }

@router.post("/thresholds")
def update_adaptive_thresholds(req: UpdateThresholdsRequest):
    conn = db_service._get_connection()
    cur = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()
    thresholds = {
        "gaming": req.gaming,
        "phishing": req.phishing,
        "downloads": req.downloads,
        "default": req.default
    }
    cur.execute("""
        UPDATE risk_profiles 
        SET adapted_thresholds = ?, updated_at = ? 
        WHERE child_id = 'default-child-1'
    """, (json.dumps(thresholds), now_iso))
    conn.commit()
    conn.close()
    return {
        "status": "SUCCESS",
        "message": "Custom adaptive protection thresholds saved successfully",
        "thresholds": thresholds
    }
