"""
Vigilo Demo Scenarios & Judge Showcase Controller
Enables 1-click execution of the 7 official hackathon demo scenarios
without requiring judges to visit live malicious sites.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List

from .analyze import analyze_url, analyze_page, analyze_download, URLAnalyzeRequest, PageAnalyzeRequest, DownloadAnalyzeRequest
from services.database_service import DatabaseService

router = APIRouter(prefix="/api/demo", tags=["Demo Showcase"])
db_service = DatabaseService()

DEMO_SCENARIOS = [
    {
        "id": "scenario_1_safe",
        "title": "Scenario 1: Safe Educational Website",
        "description": "Child explores National Geographic Kids animal discovery portal.",
        "category": "safe",
        "url": "https://kids.nationalgeographic.com/animals",
        "type": "url",
        "expected": "🟢 SAFE (Score < 20, Access Allowed)"
    },
    {
        "id": "scenario_2_gaming_scam",
        "title": "Scenario 2: Fake Gaming Reward (V-Bucks / Minecraft Coins)",
        "description": "Bait website promising 10,000 free game coins and demanding account password.",
        "category": "gaming_scams",
        "url": "http://free-minecraft-coins-999.xyz/claim?user=steve",
        "type": "page",
        "page_content": "CONGRATULATIONS! You won 10,000 Free Coins! Enter your username and password to claim immediately before time runs out!",
        "has_password": True,
        "expected": "🔴 HIGH RISK (Score 92+, Blocked, Safe Alternative to Minecraft Marketplace, Coach Prompt)"
    },
    {
        "id": "scenario_3_fake_login",
        "title": "Scenario 3: Fake Login / Credential Phishing",
        "description": "Deceptive site spoofing Roblox/Steam account verification with urgent threat of deletion.",
        "category": "phishing",
        "url": "http://192.168.1.105/roblox/login-verify.html",
        "type": "page",
        "page_content": "URGENT SECURITY ALERT: Your account will be permanently deleted unless verified right now. Enter your login password.",
        "has_password": True,
        "expected": "🔴 DANGEROUS PHISHING (Score 94+, Blocked, Evidence Pack Generated, Parent Alert)"
    },
    {
        "id": "scenario_4_download",
        "title": "Scenario 4: Suspicious Download & Demo Quarantine",
        "description": "Attempt to download 'free-minecraft-coins.exe' from unverified web origin.",
        "category": "malicious_downloads",
        "filename": "free-minecraft-coins.exe",
        "source_url": "http://free-game-rewards.xyz/download",
        "file_size": 2457600,
        "type": "download",
        "expected": "🚨 DOWNLOAD PREVENTED (Demo Quarantine, Recovery Guidance, Parent Alert, Evidence Pack)"
    },
    {
        "id": "scenario_5_adaptive",
        "title": "Scenario 5: Adaptive Protection in Action",
        "description": "Child encounters repeated gaming scams, causing Vigilo to tighten sensitivity for gaming threats.",
        "category": "gaming_scams",
        "type": "adaptive",
        "expected": "⚡ THRESHOLD ADAPTED (Gaming threshold tightened from 70 to 55, High Gaming Scrutiny)"
    },
    {
        "id": "scenario_6_coach",
        "title": "Scenario 6: Vigilo Coach Challenge",
        "description": "Personalized quiz challenge triggered by gaming scam exposure.",
        "category": "gaming_scams",
        "type": "coach",
        "expected": "🎮 GAMING SCAM CHALLENGE (Interactive Quiz & Instant Child-Friendly Feedback)"
    },
    {
        "id": "scenario_7_safe_alt",
        "title": "Scenario 7: Safe Alternative Recommendation",
        "description": "Instead of a simple block screen, Vigilo understands intent and recommends vetted alternatives.",
        "category": "gaming",
        "query": "free minecraft skins",
        "type": "safe_alternative",
        "expected": "🛡️ VETTED SAFE OPTIONS (Minecraft Official, Marketplace, CurseForge Vetted Mods)"
    }
]

@router.get("/scenarios")
def get_scenarios() -> List[Dict[str, Any]]:
    return DEMO_SCENARIOS

@router.post("/simulate/{scenario_id}")
def simulate_scenario(scenario_id: str):
    scenario = next((s for s in DEMO_SCENARIOS if s["id"] == scenario_id), None)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    stype = scenario.get("type")

    if stype == "url":
        res = analyze_url(URLAnalyzeRequest(url=scenario["url"]))
        return {"scenario": scenario, "result": res}

    elif stype == "page":
        res = analyze_page(PageAnalyzeRequest(
            url=scenario["url"],
            page_content=scenario["page_content"],
            has_password_field=scenario.get("has_password", False)
        ))
        return {"scenario": scenario, "result": res}

    elif stype == "download":
        res = analyze_download(DownloadAnalyzeRequest(
            filename=scenario["filename"],
            source_url=scenario["source_url"],
            file_size=scenario.get("file_size", 0)
        ))
        return {"scenario": scenario, "result": res}

    elif stype == "adaptive":
        # Simulate incrementing gaming scams
        conn = db_service._get_connection()
        cur = conn.cursor()
        for _ in range(3):
            db_service._increment_category_count(cur, "gaming_scams")
        conn.commit()
        conn.close()
        profile = db_service.get_adaptive_profile()
        return {
            "scenario": scenario,
            "result": {
                "message": "Simulated 3 gaming scam detections. Adaptive protection adjusted.",
                "updated_profile": profile
            }
        }

    elif stype == "coach":
        lessons = db_service.get_coach_lessons("gaming_scams")
        lesson = lessons[0] if lessons else None
        return {
            "scenario": scenario,
            "result": {
                "active_lesson": lesson,
                "message": "Coach challenge ready for child engagement."
            }
        }

    elif stype == "safe_alternative":
        resources = db_service.get_safe_resources("gaming")
        return {
            "scenario": scenario,
            "result": {
                "intent": "Minecraft Skins & Gaming Add-ons",
                "safe_resources": resources[:3],
                "message": "Child presented with verified, trusted alternatives instead of blank block page."
            }
        }

    raise HTTPException(status_code=400, detail="Invalid scenario type")
