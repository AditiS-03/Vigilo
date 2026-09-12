"""
Vigilo Database & Data Access Service
Supports SQLite local persistence out-of-the-box and PostgreSQL/Supabase when configured.
Adheres strictly to privacy principles: stores aggregated threat categories and incident
forensics without recording invasive personal browsing histories.
"""

import json
import sqlite3
import os
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

DB_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "vigilo.db")

class DatabaseService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseService, cls).__new__(cls)
            cls._instance._init_db()
        return cls._instance

    def _get_connection(self):
        conn = sqlite3.connect(DB_FILE)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        """Initialize local SQLite tables mirroring schema.sql"""
        conn = self._get_connection()
        cur = conn.cursor()

        cur.execute("""
        CREATE TABLE IF NOT EXISTS incidents (
            id TEXT PRIMARY KEY,
            child_id TEXT,
            threat_type TEXT NOT NULL,
            threat_category TEXT NOT NULL,
            risk_score INTEGER NOT NULL,
            confidence INTEGER NOT NULL,
            url TEXT NOT NULL,
            domain TEXT NOT NULL,
            action_taken TEXT NOT NULL,
            detected_indicators TEXT,
            ml_result TEXT,
            ai_assessment TEXT,
            download_metadata TEXT,
            parent_notified INTEGER DEFAULT 1,
            created_at TEXT NOT NULL
        )
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS downloads (
            id TEXT PRIMARY KEY,
            incident_id TEXT,
            filename TEXT NOT NULL,
            file_size INTEGER DEFAULT 0,
            source_url TEXT NOT NULL,
            risk_score INTEGER NOT NULL,
            threat_reason TEXT NOT NULL,
            quarantine_status TEXT DEFAULT 'DEMO_QUARANTINED',
            recovery_guidance TEXT,
            created_at TEXT NOT NULL
        )
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS risk_profiles (
            id TEXT PRIMARY KEY,
            child_id TEXT UNIQUE,
            gaming_scams INTEGER DEFAULT 0,
            phishing INTEGER DEFAULT 0,
            malicious_downloads INTEGER DEFAULT 0,
            fake_logins INTEGER DEFAULT 0,
            suspicious_content INTEGER DEFAULT 0,
            adapted_thresholds TEXT,
            updated_at TEXT NOT NULL
        )
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS coach_lessons (
            id TEXT PRIMARY KEY,
            threat_category TEXT NOT NULL,
            title TEXT NOT NULL,
            scenario_description TEXT NOT NULL,
            question TEXT NOT NULL,
            options TEXT NOT NULL,
            correct_answer TEXT NOT NULL,
            explanation TEXT NOT NULL,
            difficulty TEXT DEFAULT 'BEGINNER',
            created_at TEXT NOT NULL
        )
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS coach_attempts (
            id TEXT PRIMARY KEY,
            lesson_id TEXT,
            child_id TEXT,
            user_answer TEXT NOT NULL,
            is_correct INTEGER NOT NULL,
            score INTEGER DEFAULT 100,
            completed_at TEXT NOT NULL
        )
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS safe_resources (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            url TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            verified INTEGER DEFAULT 1,
            tags TEXT,
            created_at TEXT NOT NULL
        )
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            incident_id TEXT,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            severity TEXT NOT NULL,
            read INTEGER DEFAULT 0,
            created_at TEXT NOT NULL
        )
        """)

        conn.commit()

        # Seed initial safe resources if empty
        cur.execute("SELECT COUNT(*) as cnt FROM safe_resources")
        if cur.fetchone()["cnt"] == 0:
            self._seed_safe_resources(cur)

        # Seed initial adaptive profile if empty
        cur.execute("SELECT COUNT(*) as cnt FROM risk_profiles")
        if cur.fetchone()["cnt"] == 0:
            now_iso = datetime.now(timezone.utc).isoformat()
            default_thresholds = json.dumps({"gaming": 55, "phishing": 60, "downloads": 50, "default": 70})
            cur.execute("""
                INSERT INTO risk_profiles (id, child_id, gaming_scams, phishing, malicious_downloads, fake_logins, suspicious_content, adapted_thresholds, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (str(uuid.uuid4()), "default-child-1", 4, 2, 1, 1, 0, default_thresholds, now_iso))

        # Seed initial starter coach lessons if empty
        cur.execute("SELECT COUNT(*) as cnt FROM coach_lessons")
        if cur.fetchone()["cnt"] == 0:
            self._seed_coach_lessons(cur)

        conn.commit()
        conn.close()

    def _seed_safe_resources(self, cur):
        now_iso = datetime.now(timezone.utc).isoformat()
        seeds = [
            ("Minecraft Official Site", "https://www.minecraft.net", "gaming", "Official Minecraft home, news, and safe launcher downloads.", 1, json.dumps(["minecraft", "skins", "games", "mojang"])),
            ("Minecraft Marketplace", "https://www.minecraft.net/en-us/marketplace", "gaming", "Official verified skins, worlds, textures, and items.", 1, json.dumps(["minecraft", "skins", "textures", "marketplace"])),
            ("CurseForge Minecraft Mods", "https://www.curseforge.com/minecraft", "gaming", "Vetted community mods, skins, and modpacks with antivirus scanning.", 1, json.dumps(["minecraft", "mods", "skins", "curseforge"])),
            ("Roblox Official Platform", "https://www.roblox.com", "gaming", "Official Roblox gaming portal, verified avatar shop, and experiences.", 1, json.dumps(["roblox", "robux", "avatar", "games"])),
            ("Scratch MIT", "https://scratch.mit.edu", "coding", "Creative coding community for kids built by MIT Media Lab.", 1, json.dumps(["coding", "scratch", "education", "mit", "games"])),
            ("Code.org", "https://code.org", "coding", "Interactive computer science puzzles and safe games for kids.", 1, json.dumps(["coding", "games", "education"])),
            ("National Geographic Kids", "https://kids.nationalgeographic.com", "learning", "Fascinating animal facts, space science, and safe quizzes.", 1, json.dumps(["animals", "science", "education", "quizzes"])),
            ("Khan Academy Kids", "https://www.khanacademy.org/kids", "learning", "Engaging math, reading, and problem-solving lessons.", 1, json.dumps(["math", "learning", "education"])),
            ("PBS KIDS", "https://pbskids.org", "learning", "Safe educational games and videos featuring PBS characters.", 1, json.dumps(["pbs", "games", "education"])),
            ("NASA Kids' Club", "https://www.nasa.gov/learning-resources/nasa-kids-club", "learning", "Space exploration missions, STEM activities, and astronomy fun.", 1, json.dumps(["space", "nasa", "science", "astronomy"]))
        ]
        for name, url, category, desc, verified, tags in seeds:
            cur.execute("""
                INSERT INTO safe_resources (id, name, url, category, description, verified, tags, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (str(uuid.uuid4()), name, url, category, desc, verified, tags, now_iso))

    def _seed_coach_lessons(self, cur):
        now_iso = datetime.now(timezone.utc).isoformat()
        lessons = [
            (
                "LESSON-GAMING-01",
                "gaming_scams",
                "The Free Game Coins Trap",
                "You are playing your favorite game and see a pop-up saying: 'Congratulations! Get 10,000 Free V-Bucks or Robux now! Just enter your username and password.'",
                "What should you do?",
                json.dumps([
                    "Enter your password immediately to claim the free coins.",
                    "Close the page because real games never ask for your password to give free rewards.",
                    "Send the link to all your friends so they can get free coins too.",
                    "Type a fake password just to see what happens."
                ]),
                "Close the page because real games never ask for your password to give free rewards.",
                "Real game developers never ask for your password or give away unlimited currency on unofficial websites. That's a trick called credential harvesting!"
            ),
            (
                "LESSON-DOWNLOAD-01",
                "malicious_downloads",
                "Spotting Dangerous Downloads",
                "You find a website offering 'minecraft_cheat_infinite_diamonds.exe' or 'free_game_installer.scr'.",
                "Why is downloading this file dangerous?",
                json.dumps([
                    "It will make your computer faster.",
                    "Files ending in .exe or .scr from unknown websites can carry viruses or spyware that harm your computer.",
                    "It is completely safe as long as the website has bright colors.",
                    "It only takes up space on your desktop."
                ]),
                "Files ending in .exe or .scr from unknown websites can carry viruses or spyware that harm your computer.",
                "Executables (.exe, .scr, .bat) can run unauthorized software on your computer. Only download game mods and apps from verified stores or with parent permission!"
            ),
            (
                "LESSON-PHISHING-01",
                "phishing",
                "The Urgent Account Warning",
                "You receive an urgent message: 'URGENT: Your account will be DELETED in 10 minutes unless you click here and log in right now!'",
                "What is this psychological trick called?",
                json.dumps([
                    "A friendly reminder.",
                    "Urgency manipulation - scammers create false panic so you act before thinking.",
                    "Standard game maintenance.",
                    "A special VIP quest."
                ]),
                "Urgency manipulation - scammers create false panic so you act before thinking.",
                "Scammers use false urgency and count-down timers to panic you into typing your password. Always stop, take a breath, and ask a parent or Vigilo!"
            )
        ]
        for lid, cat, title, desc, q, opts, ans, expl in lessons:
            cur.execute("""
                INSERT INTO coach_lessons (id, threat_category, title, scenario_description, question, options, correct_answer, explanation, difficulty, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (lid, cat, title, desc, q, opts, ans, expl, 'BEGINNER', now_iso))

    # --- Incidents API ---
    def record_incident(self, incident: Dict[str, Any]) -> Dict[str, Any]:
        conn = self._get_connection()
        cur = conn.cursor()
        inc_id = incident.get("id") or f"VIG-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        now_iso = incident.get("created_at") or datetime.now(timezone.utc).isoformat()
        
        cur.execute("""
            INSERT OR REPLACE INTO incidents 
            (id, child_id, threat_type, threat_category, risk_score, confidence, url, domain, action_taken, detected_indicators, ml_result, ai_assessment, download_metadata, parent_notified, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            inc_id,
            incident.get("child_id", "default-child-1"),
            incident.get("threat_type", "Suspicious Activity"),
            incident.get("threat_category", "suspicious_content"),
            int(incident.get("risk_score", 0)),
            int(incident.get("confidence", 85)),
            incident.get("url", ""),
            incident.get("domain", ""),
            incident.get("action_taken", "BLOCK_PAGE"),
            json.dumps(incident.get("detected_indicators", [])),
            json.dumps(incident.get("ml_result", {})),
            json.dumps(incident.get("ai_assessment", {})),
            json.dumps(incident.get("download_metadata")) if incident.get("download_metadata") else None,
            1 if incident.get("parent_notified", True) else 0,
            now_iso
        ))

        # Record parent notification
        if incident.get("risk_score", 0) >= 60:
            notif_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO notifications (id, incident_id, title, message, severity, read, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                notif_id,
                inc_id,
                f"🚨 {incident.get('threat_type', 'Threat')} Intercepted",
                f"Vigilo blocked access to {incident.get('domain', 'suspicious site')} (Risk Score: {incident.get('risk_score', 0)}/100). Action: {incident.get('action_taken', 'BLOCKED')}",
                "HIGH" if incident.get("risk_score", 0) >= 80 else "MEDIUM",
                0,
                now_iso
            ))

        # Increment adaptive profile
        cat = incident.get("threat_category", "suspicious_content")
        self._increment_category_count(cur, cat)

        conn.commit()
        conn.close()

        incident["id"] = inc_id
        incident["created_at"] = now_iso
        return incident

    def get_incidents(self, limit: int = 50) -> List[Dict[str, Any]]:
        conn = self._get_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM incidents ORDER BY created_at DESC LIMIT ?", (limit,))
        rows = cur.fetchall()
        conn.close()
        results = []
        for r in rows:
            item = dict(r)
            item["detected_indicators"] = json.loads(item["detected_indicators"]) if item["detected_indicators"] else []
            item["ml_result"] = json.loads(item["ml_result"]) if item["ml_result"] else {}
            item["ai_assessment"] = json.loads(item["ai_assessment"]) if item["ai_assessment"] else {}
            item["download_metadata"] = json.loads(item["download_metadata"]) if item["download_metadata"] else None
            results.append(item)
        return results

    def get_incident(self, incident_id: str) -> Optional[Dict[str, Any]]:
        conn = self._get_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM incidents WHERE id = ?", (incident_id,))
        row = cur.fetchone()
        conn.close()
        if not row:
            return None
        item = dict(row)
        item["detected_indicators"] = json.loads(item["detected_indicators"]) if item["detected_indicators"] else []
        item["ml_result"] = json.loads(item["ml_result"]) if item["ml_result"] else {}
        item["ai_assessment"] = json.loads(item["ai_assessment"]) if item["ai_assessment"] else {}
        item["download_metadata"] = json.loads(item["download_metadata"]) if item["download_metadata"] else None
        return item

    # --- Downloads & Clean-Up ---
    def record_download_event(self, download: Dict[str, Any]) -> Dict[str, Any]:
        conn = self._get_connection()
        cur = conn.cursor()
        dl_id = str(uuid.uuid4())
        now_iso = datetime.now(timezone.utc).isoformat()
        cur.execute("""
            INSERT INTO downloads (id, incident_id, filename, file_size, source_url, risk_score, threat_reason, quarantine_status, recovery_guidance, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            dl_id,
            download.get("incident_id"),
            download.get("filename", "unknown_file"),
            download.get("file_size", 0),
            download.get("source_url", ""),
            int(download.get("risk_score", 90)),
            download.get("threat_reason", "Dangerous executable download detected"),
            download.get("quarantine_status", "DEMO_QUARANTINED"),
            json.dumps(download.get("recovery_guidance", [])),
            now_iso
        ))
        conn.commit()
        conn.close()
        download["id"] = dl_id
        download["created_at"] = now_iso
        return download

    # --- Adaptive Risk Profile ---
    def _increment_category_count(self, cur, category: str):
        valid_cols = {
            "gaming_scams": "gaming_scams",
            "gaming": "gaming_scams",
            "phishing": "phishing",
            "malicious_downloads": "malicious_downloads",
            "download": "malicious_downloads",
            "fake_logins": "fake_logins",
            "login": "fake_logins",
            "suspicious_content": "suspicious_content"
        }
        col = valid_cols.get(category.lower(), "suspicious_content")
        now_iso = datetime.now(timezone.utc).isoformat()
        
        cur.execute(f"UPDATE risk_profiles SET {col} = {col} + 1, updated_at = ? WHERE child_id = 'default-child-1'", (now_iso,))
        # Dynamically recalculate adaptive thresholds
        cur.execute("SELECT * FROM risk_profiles WHERE child_id = 'default-child-1'")
        row = cur.fetchone()
        if row:
            gaming = row["gaming_scams"]
            phishing = row["phishing"]
            downloads = row["malicious_downloads"]
            
            # Lower threshold means higher scrutiny
            gaming_threshold = max(35, 70 - (gaming * 3))
            phishing_threshold = max(40, 70 - (phishing * 4))
            download_threshold = max(30, 65 - (downloads * 5))
            
            thresholds = {
                "gaming": gaming_threshold,
                "phishing": phishing_threshold,
                "downloads": download_threshold,
                "default": 70
            }
            cur.execute("UPDATE risk_profiles SET adapted_thresholds = ? WHERE child_id = 'default-child-1'", (json.dumps(thresholds),))

    def get_adaptive_profile(self, child_id: str = "default-child-1") -> Dict[str, Any]:
        conn = self._get_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM risk_profiles WHERE child_id = ?", (child_id,))
        row = cur.fetchone()
        conn.close()
        if not row:
            return {
                "gaming_scams": 0,
                "phishing": 0,
                "malicious_downloads": 0,
                "fake_logins": 0,
                "suspicious_content": 0,
                "adapted_thresholds": {"gaming": 55, "phishing": 60, "downloads": 50, "default": 70},
                "threat_levels": {"gaming": "LOW", "phishing": "LOW", "downloads": "LOW"}
            }
        
        gaming = row["gaming_scams"]
        phishing = row["phishing"]
        downloads = row["malicious_downloads"]
        
        def get_level(count):
            if count >= 6:
                return "HIGH"
            elif count >= 3:
                return "MEDIUM"
            return "LOW"

        thresholds = json.loads(row["adapted_thresholds"]) if row["adapted_thresholds"] else {}

        return {
            "child_id": child_id,
            "gaming_scams": gaming,
            "phishing": phishing,
            "malicious_downloads": downloads,
            "fake_logins": row["fake_logins"],
            "suspicious_content": row["suspicious_content"],
            "adapted_thresholds": thresholds,
            "threat_levels": {
                "gaming_scams": get_level(gaming),
                "phishing": get_level(phishing),
                "malicious_downloads": get_level(downloads),
                "fake_logins": get_level(row["fake_logins"]),
                "suspicious_content": get_level(row["suspicious_content"])
            },
            "updated_at": row["updated_at"]
        }

    # --- Safe Resources API ---
    def get_safe_resources(self, category: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
        conn = self._get_connection()
        cur = conn.cursor()
        query = "SELECT * FROM safe_resources WHERE verified = 1"
        params = []
        if category:
            query += " AND category = ?"
            params.append(category)
        if search:
            query += " AND (name LIKE ? OR description LIKE ? OR tags LIKE ?)"
            term = f"%{search}%"
            params.extend([term, term, term])
        query += " ORDER BY name ASC"
        cur.execute(query, params)
        rows = cur.fetchall()
        conn.close()
        results = []
        for r in rows:
            item = dict(r)
            item["tags"] = json.loads(item["tags"]) if item["tags"] else []
            item["verified"] = bool(item["verified"])
            results.append(item)
        return results

    # --- Coach API ---
    def get_coach_lessons(self, category: Optional[str] = None) -> List[Dict[str, Any]]:
        conn = self._get_connection()
        cur = conn.cursor()
        if category:
            cur.execute("SELECT * FROM coach_lessons WHERE threat_category = ?", (category,))
        else:
            cur.execute("SELECT * FROM coach_lessons")
        rows = cur.fetchall()
        conn.close()
        results = []
        for r in rows:
            item = dict(r)
            item["options"] = json.loads(item["options"]) if item["options"] else []
            results.append(item)
        return results

    def record_coach_attempt(self, lesson_id: str, user_answer: str, is_correct: bool, score: int = 100) -> Dict[str, Any]:
        conn = self._get_connection()
        cur = conn.cursor()
        attempt_id = str(uuid.uuid4())
        now_iso = datetime.now(timezone.utc).isoformat()
        cur.execute("""
            INSERT INTO coach_attempts (id, lesson_id, child_id, user_answer, is_correct, score, completed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (attempt_id, lesson_id, "default-child-1", user_answer, 1 if is_correct else 0, score, now_iso))
        conn.commit()
        conn.close()
        return {
            "id": attempt_id,
            "lesson_id": lesson_id,
            "user_answer": user_answer,
            "is_correct": is_correct,
            "score": score,
            "completed_at": now_iso
        }

    def get_coach_progress(self) -> Dict[str, Any]:
        conn = self._get_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) as total_attempts, SUM(is_correct) as correct_count, AVG(score) as avg_score FROM coach_attempts")
        stats = cur.fetchone()
        cur.execute("SELECT COUNT(*) as total_lessons FROM coach_lessons")
        total_lessons = cur.fetchone()["total_lessons"]
        conn.close()
        
        attempts = stats["total_attempts"] or 0
        correct = stats["correct_count"] or 0
        accuracy = round((correct / attempts * 100) if attempts > 0 else 0)
        
        return {
            "total_lessons_available": total_lessons,
            "completed_challenges": attempts,
            "correct_challenges": correct,
            "accuracy_percentage": accuracy,
            "safety_badges": [
                {"name": "Gaming Shield Guardian", "unlocked": attempts >= 1, "description": "Spotted a fake currency scam"},
                {"name": "Phishing Detective", "unlocked": attempts >= 2, "description": "Identified a fake login page"},
                {"name": "Download Sentry", "unlocked": attempts >= 3, "description": "Avoided an unsafe executable download"}
            ]
        }

    # --- Dashboard Summary ---
    def get_dashboard_summary(self) -> Dict[str, Any]:
        conn = self._get_connection()
        cur = conn.cursor()
        
        cur.execute("SELECT COUNT(*) as cnt FROM incidents WHERE risk_score >= 80")
        high_risk_count = cur.fetchone()["cnt"]

        cur.execute("SELECT COUNT(*) as cnt FROM incidents WHERE risk_score BETWEEN 40 AND 79")
        suspicious_count = cur.fetchone()["cnt"]

        cur.execute("SELECT COUNT(*) as cnt FROM downloads WHERE quarantine_status = 'DEMO_QUARANTINED'")
        downloads_blocked = cur.fetchone()["cnt"]

        cur.execute("SELECT COUNT(*) as cnt FROM incidents WHERE action_taken = 'WARN'")
        warnings_count = cur.fetchone()["cnt"]

        cur.execute("SELECT threat_category, COUNT(*) as cnt FROM incidents GROUP BY threat_category")
        category_rows = cur.fetchall()
        category_breakdown = {r["threat_category"]: r["cnt"] for r in category_rows}

        conn.close()

        adaptive = self.get_adaptive_profile()

        return {
            "todays_protection": {
                "high_risk_threats": high_risk_count,
                "suspicious_websites": suspicious_count,
                "dangerous_downloads_blocked": downloads_blocked,
                "warnings_issued": warnings_count,
                "threats_resolved": high_risk_count + downloads_blocked
            },
            "threat_categories": category_breakdown,
            "adaptive_profile": adaptive,
            "safety_status": "ACTIVE_PROTECTION",
            "last_active": datetime.now(timezone.utc).isoformat()
        }
