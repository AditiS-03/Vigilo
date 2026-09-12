"""
Vigilo Gemini AI Integration Service
Provides child-friendly threat explanations, policy reasoning, Coach challenge generation,
safe intent classification, and the Ask Vigilo interactive AI assistant.
Adheres to strict safety guardrails and privacy: NEVER transmits passwords or form inputs.
Includes robust fallback logic so the app functions seamlessly even without an API key.
"""

import os
import json
import requests
from typing import Dict, Any, List, Optional

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "").strip()
        self.model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    def _call_gemini_raw(self, system_instruction: str, prompt: str, temperature: float = 0.2) -> Optional[str]:
        """Direct REST call to Google Gemini generateContent endpoint."""
        api_key = os.getenv("GEMINI_API_KEY", self.api_key).strip()
        if not api_key:
            return None

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": f"{system_instruction}\n\nTask:\n{prompt}"}]}
            ],
            "generationConfig": {
                "temperature": temperature,
                "responseMimeType": "application/json"
            }
        }

        try:
            res = requests.post(url, headers=headers, json=payload, timeout=12)
            if res.status_code == 200:
                data = res.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        return parts[0].get("text", "")
            else:
                print(f"[GEMINI-WARN] Status {res.status_code}: {res.text[:200]}")
        except Exception as e:
            print(f"[GEMINI-ERROR] Request failed: {e}")
        return None

    def explain_threat(self, threat_type: str, url: str, domain: str, risk_score: int, indicators: List[str]) -> Dict[str, Any]:
        """
        Produces a dual-audience explanation:
        1. Child-friendly (simple, calming, educational, empowering)
        2. Parent-technical (clear forensic breakdown and security context)
        """
        prompt = f"""
        Analyze this security threat detected for a 10-year-old child:
        - Threat Type: {threat_type}
        - Domain: {domain}
        - URL: {url}
        - Risk Score: {risk_score}/100
        - Detection Indicators: {json.dumps(indicators)}

        Return JSON matching this schema:
        {{
            "child_explanation": "Simple 2-3 sentence explanation for a 10-year-old explaining why this site isn't safe and what to do instead.",
            "parent_technical_summary": "Clear forensic summary for parents explaining the threat mechanics.",
            "risk_verdict": "SAFE" | "SUSPICIOUS" | "HIGH_RISK" | "DANGEROUS",
            "recommended_action_advice": "Short safety recommendation for the family."
        }}
        """
        raw = self._call_gemini_raw(
            system_instruction="You are Vigilo, an expert AI child-safety cybersecurity guardian. Always explain threats clearly, without jargon for kids, and accurately for parents.",
            prompt=prompt
        )

        if raw:
            try:
                parsed = json.loads(raw)
                return parsed
            except Exception:
                pass

        # Robust graceful fallback
        if risk_score >= 80:
            return {
                "child_explanation": f"This website looks like a trick! It might be pretending to give away free items or trying to peek at your secret passwords. Real game companies never ask for your password to give rewards.",
                "parent_technical_summary": f"High confidence indicator of {threat_type} targeting juvenile users via deceptive domain heuristics, credential harvesting triggers, or bait patterns.",
                "risk_verdict": "DANGEROUS" if risk_score >= 85 else "HIGH_RISK",
                "recommended_action_advice": "Block access, do not submit account credentials, and inspect recent family login activity."
            }
        elif risk_score >= 40:
            return {
                "child_explanation": f"Hold on! This website has a few unusual signs like an unverified address or confusing buttons. Let's be careful and double-check with a parent.",
                "parent_technical_summary": f"Moderate risk detected. Unconventional domain or suspicious URL parameters present.",
                "risk_verdict": "SUSPICIOUS",
                "recommended_action_advice": "Proceed with caution or browse verified alternatives."
            }
        else:
            return {
                "child_explanation": "This website looks clean and safe for your adventures. Have fun exploring!",
                "parent_technical_summary": "Clean reputation. Standard protocol and verified characteristics.",
                "risk_verdict": "SAFE",
                "recommended_action_advice": "Safe to browse."
            }

    def reason_response_actions(self, threat_context: Dict[str, Any]) -> List[str]:
        """
        Determines recommended actions from the strictly allowed list:
        ALLOW, WARN, BLOCK_PAGE, CANCEL_DOWNLOAD, QUARANTINE_SIMULATION,
        GENERATE_EVIDENCE, NOTIFY_PARENT, SHOW_RECOVERY_GUIDANCE,
        SHOW_SAFE_ALTERNATIVE, START_COACH_LESSON
        """
        prompt = f"""
        Select recommended response actions for this safety event:
        {json.dumps(threat_context, indent=2)}

        ALLOWED ACTIONS (YOU CAN ONLY CHOOSE FROM THIS EXACT LIST):
        - ALLOW
        - WARN
        - BLOCK_PAGE
        - CANCEL_DOWNLOAD
        - QUARANTINE_SIMULATION
        - GENERATE_EVIDENCE
        - NOTIFY_PARENT
        - SHOW_RECOVERY_GUIDANCE
        - SHOW_SAFE_ALTERNATIVE
        - START_COACH_LESSON

        Return JSON matching this schema:
        {{
            "actions": ["ACTION_1", "ACTION_2", ...],
            "reasoning": "Brief rationale"
        }}
        """
        raw = self._call_gemini_raw(
            system_instruction="You are Vigilo's Response Agent Policy Advisor. You must only choose actions from the allowed list.",
            prompt=prompt
        )
        if raw:
            try:
                data = json.loads(raw)
                actions = data.get("actions", [])
                valid_allowed = {
                    "ALLOW", "WARN", "BLOCK_PAGE", "CANCEL_DOWNLOAD", "QUARANTINE_SIMULATION",
                    "GENERATE_EVIDENCE", "NOTIFY_PARENT", "SHOW_RECOVERY_GUIDANCE",
                    "SHOW_SAFE_ALTERNATIVE", "START_COACH_LESSON"
                }
                filtered = [a for a in actions if a in valid_allowed]
                if filtered:
                    return filtered
            except Exception:
                pass

        # Fallback policy rules
        score = threat_context.get("risk_score", 0)
        is_dl = "download" in threat_context.get("threat_category", "") or "download" in str(threat_context).lower()
        if is_dl and score >= 60:
            return ["CANCEL_DOWNLOAD", "QUARANTINE_SIMULATION", "GENERATE_EVIDENCE", "NOTIFY_PARENT", "SHOW_RECOVERY_GUIDANCE"]
        elif score >= 80:
            return ["BLOCK_PAGE", "GENERATE_EVIDENCE", "NOTIFY_PARENT", "SHOW_SAFE_ALTERNATIVE", "START_COACH_LESSON"]
        elif score >= 50:
            return ["WARN", "SHOW_SAFE_ALTERNATIVE"]
        return ["ALLOW"]

    def generate_coach_challenge(self, threat_category: str) -> Dict[str, Any]:
        """
        Generates a child-friendly interactive quiz challenge for a specific threat category.
        """
        prompt = f"""
        Create a child-friendly cybersecurity quiz question for a 10-year-old child on the topic: '{threat_category}'.
        Make it fun, engaging, and realistic (e.g. gaming scams, free skins, fake logins, or strange downloads).

        Return JSON matching this schema:
        {{
            "title": "Short catchy title (e.g. 🎮 The Secret Diamond Trap)",
            "scenario": "Short 2-sentence scenario",
            "question": "Which action is safest?",
            "options": [
                "Option A",
                "Option B",
                "Option C",
                "Option D"
            ],
            "correct_answer": "Exact text of the correct option",
            "explanation": "Why this answer protects them in simple words."
        }}
        """
        raw = self._call_gemini_raw(
            system_instruction="You are Vigilo Coach, an inspiring cybersecurity teacher for young digital explorers.",
            prompt=prompt
        )
        if raw:
            try:
                parsed = json.loads(raw)
                if all(k in parsed for k in ["title", "question", "options", "correct_answer", "explanation"]):
                    return parsed
            except Exception:
                pass

        # Fallback lesson
        return {
            "title": "🎮 The Mysterious Free Coins Portal",
            "scenario": "You are playing a game and a banner says 'Click here for 50,000 Free Coins! Just type your account name and password.'",
            "question": "What is the best thing to do?",
            "options": [
                "Close the banner because real games never ask for your password to give rewards.",
                "Type your password quickly before the offer disappears.",
                "Share the link with all your school friends.",
                "Enter your parent's credit card number instead."
            ],
            "correct_answer": "Close the banner because real games never ask for your password to give rewards.",
            "explanation": "Great job! Scammers pretend to give free prizes to steal accounts. Real developers never ask for your password."
        }

    def classify_safe_intent(self, user_search_or_page: str) -> Dict[str, Any]:
        """
        Classifies what the child was attempting to do (e.g. finding Minecraft skins, Roblox games, coding, homework)
        so Vigilo can recommend safe alternatives from the verified whitelist.
        """
        prompt = f"""
        The child was visiting or searching for:
        "{user_search_or_page}"

        Determine their genuine intent and safe category.
        Categories allowed: 'gaming', 'coding', 'learning', 'video', 'search'

        Return JSON:
        {{
            "user_intent": "Brief description of what they wanted (e.g. Minecraft skins)",
            "category": "gaming" | "coding" | "learning" | "video" | "search",
            "search_keywords": ["keyword1", "keyword2"]
        }}
        """
        raw = self._call_gemini_raw(
            system_instruction="You are Vigilo Intent Analyzer. Categorize child internet searches into safe interest categories.",
            prompt=prompt
        )
        if raw:
            try:
                parsed = json.loads(raw)
                return parsed
            except Exception:
                pass

        # Fallback intent classification
        lower = user_search_or_page.lower()
        if any(w in lower for w in ["minecraft", "roblox", "fortnite", "skin", "coins", "robux", "vbucks", "game"]):
            return {"user_intent": "Looking for game content or mods", "category": "gaming", "search_keywords": ["minecraft", "skins", "gaming"]}
        elif any(w in lower for w in ["code", "scratch", "python", "programming"]):
            return {"user_intent": "Learning to code", "category": "coding", "search_keywords": ["coding", "scratch"]}
        else:
            return {"user_intent": "Educational or creative exploration", "category": "learning", "search_keywords": ["learning", "science"]}

    def ask_vigilo(self, child_question: str, context: Dict[str, Any]) -> str:
        """
        Child-facing AI safety assistant. Answers questions like 'Is this site safe?', 'Why is this blocked?'.
        Answers in supportive, child-friendly language without technical jargon.
        """
        prompt = f"""
        A child is asking Vigilo:
        "{child_question}"

        Current Browsing Context:
        - Current Page: {context.get('url', 'Unknown')}
        - Risk Score: {context.get('risk_score', 0)}/100
        - Threat Detected: {context.get('threat_type', 'None')}
        - Indicators: {json.dumps(context.get('detected_indicators', []))}

        Answer the child directly in 2-3 warm, empowering, child-friendly sentences.
        If the site is dangerous, explain what the trick is and encourage them not to share passwords or download files.
        """
        raw = self._call_gemini_raw(
            system_instruction="You are Vigilo, the friendly cybersecurity companion owl for kids. Be encouraging, protective, and easy to understand.",
            prompt=prompt
        )
        if raw:
            try:
                # In case response came as json or string
                parsed = json.loads(raw)
                if isinstance(parsed, dict) and "response" in parsed:
                    return parsed["response"]
                elif isinstance(parsed, str):
                    return parsed
            except Exception:
                return raw.strip()

        # Fallback responses
        score = context.get("risk_score", 0)
        if score >= 70:
            return "This website looks like a trick that wants your password or asks you to download strange files. It's best to stay safe and close this page, or ask a grown-up to help you!"
        elif score >= 40:
            return "This page has a few suspicious things, so be extra careful and don't type any personal information or passwords here."
        else:
            return "This website looks clean and safe! Remember to always keep your passwords private and have fun exploring."
