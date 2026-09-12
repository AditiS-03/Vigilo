"""
Vigilo Parent Dashboard Endpoints
GET /api/dashboard/summary
GET /api/dashboard/threats
GET /api/dashboard/notifications
"""

from fastapi import APIRouter
from services.database_service import DatabaseService

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])
db_service = DatabaseService()

@router.get("/summary")
def get_dashboard_summary():
    """
    Returns aggregated today's protection stats, threat breakdown,
    and adaptive profile without disclosing invasive personal browsing history.
    """
    return db_service.get_dashboard_summary()

@router.get("/threats")
def get_dashboard_threats():
    """
    Returns recent threat event stream for analytics charts.
    """
    incidents = db_service.get_incidents(limit=20)
    summary = db_service.get_dashboard_summary()
    return {
        "recent_threats": incidents,
        "categories": summary["threat_categories"],
        "adaptive_profile": summary["adaptive_profile"]
    }

@router.get("/notifications")
def get_parent_notifications():
    """
    Returns high-severity alerts for parents.
    """
    conn = db_service._get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 20")
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]
