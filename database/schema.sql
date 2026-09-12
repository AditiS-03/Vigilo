-- Vigilo Child-Safety Platform Database Schema
-- Compatible with Supabase, PostgreSQL 14+, and local SQLite schema mappers

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users (Parents / Guardians)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Children Profiles
CREATE TABLE IF NOT EXISTS children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    age INT DEFAULT 10,
    avatar VARCHAR(50) DEFAULT 'shield-bear',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Incidents (High-Risk Threat Records)
CREATE TABLE IF NOT EXISTS incidents (
    id VARCHAR(64) PRIMARY KEY, -- e.g. VIG-202609-8472
    child_id UUID REFERENCES children(id) ON DELETE SET NULL,
    threat_type VARCHAR(100) NOT NULL,
    threat_category VARCHAR(100) NOT NULL, -- gaming_scams, phishing, malicious_download, fake_login, suspicious_content
    risk_score INT NOT NULL, -- 0-100
    confidence INT NOT NULL, -- 0-100
    url TEXT NOT NULL,
    domain VARCHAR(255) NOT NULL,
    action_taken VARCHAR(100) NOT NULL, -- BLOCK_PAGE, CANCEL_DOWNLOAD, WARN, ALLOW
    detected_indicators JSONB DEFAULT '[]'::jsonb,
    ml_result JSONB DEFAULT '{}'::jsonb,
    ai_assessment JSONB DEFAULT '{}'::jsonb,
    download_metadata JSONB DEFAULT NULL,
    parent_notified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Threat Events (Aggregated audit stream)
CREATE TABLE IF NOT EXISTS threat_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id VARCHAR(64) REFERENCES incidents(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL, -- SAFE, SUSPICIOUS, HIGH_RISK, DANGEROUS
    score INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Downloads Clean-Up & Quarantine Log
CREATE TABLE IF NOT EXISTS downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id VARCHAR(64) REFERENCES incidents(id) ON DELETE SET NULL,
    filename VARCHAR(255) NOT NULL,
    file_size BIGINT DEFAULT 0,
    source_url TEXT NOT NULL,
    risk_score INT NOT NULL,
    threat_reason TEXT NOT NULL,
    quarantine_status VARCHAR(50) DEFAULT 'DEMO_QUARANTINED', -- DEMO_QUARANTINED, BLOCKED, ALLOWED
    recovery_guidance JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Privacy-Preserving Adaptive Risk Profiles (Aggregated category counters only)
CREATE TABLE IF NOT EXISTS risk_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    gaming_scams INT DEFAULT 0,
    phishing INT DEFAULT 0,
    malicious_downloads INT DEFAULT 0,
    fake_logins INT DEFAULT 0,
    suspicious_content INT DEFAULT 0,
    adapted_thresholds JSONB DEFAULT '{"gaming": 55, "phishing": 60, "downloads": 50, "default": 70}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Vigilo Coach Lessons
CREATE TABLE IF NOT EXISTS coach_lessons (
    id VARCHAR(64) PRIMARY KEY, -- e.g. LESSON-GAMING-01
    threat_category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    scenario_description TEXT NOT NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    explanation TEXT NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'BEGINNER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Vigilo Coach Attempts
CREATE TABLE IF NOT EXISTS coach_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id VARCHAR(64) REFERENCES coach_lessons(id) ON DELETE CASCADE,
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    user_answer VARCHAR(255) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    score INT DEFAULT 100,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Verified Safe Resources Database (Strict whitelist for AI recommendations)
CREATE TABLE IF NOT EXISTS safe_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL, -- gaming, learning, coding, video, search
    description TEXT NOT NULL,
    verified BOOLEAN DEFAULT TRUE,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Parent Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id VARCHAR(64) REFERENCES incidents(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL, -- HIGH, MEDIUM, LOW
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Evidence Packs
CREATE TABLE IF NOT EXISTS evidence_packs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id VARCHAR(64) UNIQUE REFERENCES incidents(id) ON DELETE CASCADE,
    report_json JSONB NOT NULL,
    report_pdf_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Verified Safe Resources
INSERT INTO safe_resources (name, url, category, description, verified, tags) VALUES
('Minecraft Official Site', 'https://www.minecraft.net', 'gaming', 'Official Minecraft home, news, and downloads', true, '["minecraft", "skins", "games", "mojang"]'::jsonb),
('Minecraft Marketplace', 'https://www.minecraft.net/en-us/marketplace', 'gaming', 'Official verified skins, worlds, and textures for Minecraft Bedrock', true, '["minecraft", "skins", "textures", "marketplace"]'::jsonb),
('CurseForge Minecraft Mods', 'https://www.curseforge.com/minecraft', 'gaming', 'Vetted community mods, skins, and modpacks with antivirus scanning', true, '["minecraft", "mods", "skins", "curseforge"]'::jsonb),
('Roblox Official', 'https://www.roblox.com', 'gaming', 'Official Roblox gaming platform and avatar shop', true, '["roblox", "robux", "avatar", "games"]'::jsonb),
('Scratch (MIT)', 'https://scratch.mit.edu', 'coding', 'Creative coding community for kids by MIT Media Lab', true, '["coding", "scratch", "education", "mit"]'::jsonb),
('Code.org', 'https://code.org', 'coding', 'Fun interactive computer science courses for kids', true, '["coding", "games", "education"]'::jsonb),
('National Geographic Kids', 'https://kids.nationalgeographic.com', 'learning', 'Fun animal facts, science games, and quizzes', true, '["animals", "science", "education", "quizzes"]'::jsonb),
('Khan Academy Kids', 'https://www.khanacademy.org/kids', 'learning', 'Inspiring interactive lessons in math, reading, and science', true, '["math", "learning", "education"]'::jsonb),
('PBS KIDS', 'https://pbskids.org', 'learning', 'Educational games and videos for children', true, '["pbs", "games", "education"]'::jsonb),
('NASA Kids Club', 'https://www.nasa.gov/learning-resources/nasa-kids-club', 'learning', 'Space missions, games, and astronomy learning', true, '["space", "nasa", "science"]'::jsonb)
ON CONFLICT DO NOTHING;
