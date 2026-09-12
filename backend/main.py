"""
Vigilo Child-Safety Platform - Backend Application Entrypoint
FastAPI server orchestrating ML detection, Gemini response reasoning,
clean-up demo quarantine, evidence generation, parent analytics, and coach education.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from api.analyze import router as analyze_router
from api.agent import router as agent_router
from api.incidents import router as incidents_router
from api.dashboard import router as dashboard_router
from api.adaptive import router as adaptive_router
from api.coach import router as coach_router
from api.safe_alternatives import router as safe_alt_router
from api.ask_vigilo import router as ask_vigilo_router
from api.demo import router as demo_router
from services.database_service import DatabaseService

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    db = DatabaseService()
    print("[VIGILO-CORE] Initialized Vigilo backend engine & local storage.")
    yield

app = FastAPI(
    title="Vigilo AI Child-Safety Defense API",
    description="Backend for Vigilo child-safety browser layer and parent dashboard.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Chrome Extension (chrome-extension://*) and Dashboard (http://localhost:5173, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(analyze_router)
app.include_router(agent_router)
app.include_router(incidents_router)
app.include_router(dashboard_router)
app.include_router(adaptive_router)
app.include_router(coach_router)
app.include_router(safe_alt_router)
app.include_router(ask_vigilo_router)
app.include_router(demo_router)

@app.get("/")
def root():
    return {
        "product": "Vigilo Child-Safety AI Defense",
        "tagline": "Don't just block danger. Detect it, explain it, respond to it, and teach children to recognize it.",
        "status": "ONLINE",
        "documentation": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "vigilo-backend"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"[VIGILO-CORE] Launching server on http://localhost:{port}")
    uvicorn.run("main:app", host=host, port=port, reload=False)
