"""
Vigilo Coach API
POST /api/coach/generate
POST /api/coach/answer
GET /api/coach/lessons
GET /api/coach/progress
"""

import json
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from services.gemini_service import GeminiService
from services.database_service import DatabaseService

router = APIRouter(prefix="/api/coach", tags=["Vigilo Coach"])
gemini_service = GeminiService()
db_service = DatabaseService()

class GenerateLessonRequest(BaseModel):
    threat_category: Optional[str] = "gaming_scams"

class AnswerLessonRequest(BaseModel):
    lesson_id: str
    user_answer: str

@router.get("/lessons")
def list_lessons(category: Optional[str] = None):
    return db_service.get_coach_lessons(category)

@router.get("/progress")
def get_progress():
    return db_service.get_coach_progress()

@router.post("/generate")
def generate_lesson(req: GenerateLessonRequest):
    """
    Generates an interactive cybersecurity challenge customized to recent threats.
    """
    challenge = gemini_service.generate_coach_challenge(req.threat_category)
    
    lesson_id = f"LESSON-DYN-{uuid.uuid4().hex[:6].upper()}"
    now_iso = datetime.now(timezone.utc).isoformat()
    
    conn = db_service._get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO coach_lessons (id, threat_category, title, scenario_description, question, options, correct_answer, explanation, difficulty, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        lesson_id,
        req.threat_category,
        challenge.get("title", "Safety Challenge"),
        challenge.get("scenario", "Be alert for deceptive traps!"),
        challenge.get("question", "What is the safest action?"),
        json.dumps(challenge.get("options", [])),
        challenge.get("correct_answer", ""),
        challenge.get("explanation", ""),
        "INTERMEDIATE",
        now_iso
    ))
    conn.commit()
    conn.close()

    challenge["id"] = lesson_id
    challenge["threat_category"] = req.threat_category
    return challenge

@router.post("/answer")
def submit_answer(req: AnswerLessonRequest):
    """
    Validates the child's answer, awards score, records attempt, and gives immediate feedback.
    """
    conn = db_service._get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM coach_lessons WHERE id = ?", (req.lesson_id,))
    row = cur.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Lesson not found")

    correct_answer = row["correct_answer"].strip().lower()
    user_answer = req.user_answer.strip().lower()

    is_correct = (user_answer == correct_answer) or (user_answer in correct_answer) or (correct_answer in user_answer)
    score = 100 if is_correct else 30

    attempt = db_service.record_coach_attempt(
        lesson_id=req.lesson_id,
        user_answer=req.user_answer,
        is_correct=is_correct,
        score=score
    )

    feedback_msg = "🌟 Correct! You spotted the trick and kept your account safe!" if is_correct else "💡 Nice try! Remember to never enter passwords on unofficial websites."

    return {
        "is_correct": is_correct,
        "score": score,
        "correct_answer": row["correct_answer"],
        "explanation": row["explanation"],
        "child_feedback": feedback_msg,
        "attempt_id": attempt["id"]
    }
