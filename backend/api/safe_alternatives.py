"""
Vigilo Safe Alternatives API
GET /api/safe-alternatives
Enforces strict security guardrail: Gemini determines intent/category,
but all returned recommendations are pulled strictly from the verified safe resources database.
"""

from fastapi import APIRouter, Query
from typing import Optional, List

from services.gemini_service import GeminiService
from services.database_service import DatabaseService

router = APIRouter(prefix="/api/safe-alternatives", tags=["Safe Alternatives"])
gemini_service = GeminiService()
db_service = DatabaseService()

@router.get("")
def get_safe_alternatives(
    query: Optional[str] = Query(None, description="What the child was searching for or the blocked URL"),
    category: Optional[str] = Query(None, description="Explicit category filter")
):
    detected_category = category
    user_intent = None

    if query and not category:
        intent_data = gemini_service.classify_safe_intent(query)
        detected_category = intent_data.get("category", "gaming")
        user_intent = intent_data.get("user_intent")

    # Fetch verified resources matching category or search
    resources = db_service.get_safe_resources(category=detected_category, search=query if not detected_category else None)

    # Fallback to general gaming / learning if none found
    if not resources:
        resources = db_service.get_safe_resources(category="gaming")

    return {
        "user_query": query,
        "detected_intent": user_intent or f"Looking for verified {detected_category} content",
        "category": detected_category or "general",
        "verified_resources": resources,
        "policy_guarantee": "All links are pre-vetted by Vigilo Safety Standards. AI URL generation is strictly prohibited."
    }
