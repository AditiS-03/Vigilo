"""
Vigilo Adaptive Protection API
GET /api/adaptive-profile
POST /api/adaptive-profile/adjust
"""

import json
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict

from services.database_service import DatabaseService

router = APIRouter(prefix="/api/adaptive-profile", tags=["Adaptive Protection"])
db_service = DatabaseService()

class AdjustProfileRequest(BaseModel):
    category: str
    increment_by: Optional[int] = 1

@router.get("")
def get_adaptive_profile():
    return db_service.get_adaptive_profile()

@router.post("/adjust")
def adjust_adaptive_profile(req: AdjustProfileRequest):
    """
    Manually increments category counter or simulates repeated exposure to adapt protection.
    """
    conn = db_service._get_connection()
    cur = conn.cursor()
    for _ in range(req.increment_by):
        db_service._increment_category_count(cur, req.category)
    conn.commit()
    conn.close()
    return db_service.get_adaptive_profile()
