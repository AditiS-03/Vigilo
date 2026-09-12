# Vigilo - AI-Powered Child-Safety Browser Defense & Dashboard

> **"Don't just block danger. Detect it, explain it, respond to it, and teach children to recognize it."**

Vigilo is an intelligent, multi-layered child safety ecosystem designed for a 48-hour hackathon build. It combines client-side browser defense (Manifest V3 Chrome Extension) with a server-side multi-signal detection engine (Scikit-Learn Random Forest + Google Gemini AI + Threat Intelligence) and an executive Parent Safety Analytics Dashboard.

---

## 🌟 Hackathon Scope & Disclaimer

> [!IMPORTANT]
> This is a hackathon MVP, not a commercial antivirus product. Vigilo does not claim to provide complete operating-system-level security or malware disinfection. Where platform sandbox boundaries prevent OS-level quarantine, a clearly labeled **"Demo Quarantine"** workflow is executed to illustrate the full security and recovery lifecycle.

---

## 🛡️ Core Modules Implemented

1. **ML-Powered Scam & Phishing Detection**: Feature extraction engine (16 lexical and page signals) paired with a trained Scikit-Learn Random Forest model (extensible to XGBoost) delivering 0–100 risk scores and confidence metrics.
2. **Vigilo Response Agent**: Guardrailed Gemini-assisted response agent operating strictly on a fixed allowlist of actions (`BLOCK_PAGE`, `CANCEL_DOWNLOAD`, `QUARANTINE_SIMULATION`, `GENERATE_EVIDENCE`, `NOTIFY_PARENT`, `SHOW_RECOVERY_GUIDANCE`, `SHOW_SAFE_ALTERNATIVE`, `START_COACH_LESSON`).
3. **Vigilo Clean-Up**: Browser-level suspicious download detection, automatic cancellation of `.exe`/`.scr`/`.bat` files, demo quarantine simulation, and child recovery guidance.
4. **Vigilo Evidence Pack**: Structured JSON security forensic records, responsive HTML evidence previews, and official branded PDF reports.
5. **Parent Safety Dashboard**: Cyber-defense theme built with React and Tailwind CSS featuring Today's Protection KPIs, incident feeds, threat category breakdowns, and a 1-click Judge Demo Console.
6. **Vigilo Coach**: Interactive cybersecurity challenges for children, teaching credential safety, bait identification, and download hazards with instant feedback.
7. **Vigilo Adaptive Protection**: Privacy-preserving threat model that adapts warning thresholds based on aggregated category counters (e.g. lowering gaming scam threshold from 70 to 55) without storing private browsing history.
8. **Vigilo Safe Alternatives**: Replaces sterile block screens with vetted official resources (Minecraft Marketplace, CurseForge, Scratch MIT) queried from a verified database—AI URL fabrication is strictly forbidden.
9. **Ask Vigilo AI**: Context-aware child safety companion owl accessible directly within the browser extension popup.

---

## 📐 Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend Framework** | Python 3.14, FastAPI, Uvicorn, Pydantic |
| **Machine Learning** | Scikit-Learn (Random Forest), NumPy, Joblib |
| **Generative AI** | Google Gemini 2.5 Flash (Direct REST API / SDK) |
| **PDF & Evidence** | FPDF2, JSON Schema, Custom HTML Forensic Templates |
| **Browser Extension** | Chrome Extensions Manifest V3, Service Workers, Content Script Injection |
| **Parent Dashboard** | React 18, Vite, Tailwind CSS, Lucide Icons |
| **Storage & DB** | SQLite local persistence out-of-the-box, Supabase/PostgreSQL schema ready |

---

## ⚡ Quick Start Guide

### Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- Node.js v18+ (Tested on Node.js v22)
- Google Chrome, Brave, or Edge browser

---

### Step 1: Start the FastAPI Backend

```bash
# Navigate to backend directory
cd vigilo/backend

# (Optional) Set your Gemini API key in .env or environment:
# set GEMINI_API_KEY=your_key_here

# Run backend server
python main.py
```
Backend will start on: **`http://localhost:8000`**  
Interactive API Docs (Swagger UI): **`http://localhost:8000/docs`**

---

### Step 2: Start the React Parent Dashboard

```bash
# In a new terminal, navigate to dashboard directory
cd vigilo/dashboard

# Install packages (if not done yet)
npm install

# Start Vite development server
npm run dev
```
Dashboard will be live at: **`http://localhost:5173`**

---

### Step 3: Load the Vigilo Chrome Extension

1. Open Chrome/Brave/Edge and navigate to `chrome://extensions/`.
2. Enable **Developer mode** in the top-right toggle.
3. Click **Load unpacked**.
4. Select the folder: `vigilo/extension`.
5. The Vigilo Shield icon will appear in your browser bar!

---

## 🎯 Live Demo Presentation Scenarios

You can trigger any scenario instantly via the 1-Click Banner in the Parent Dashboard or inside the Extension Popup:

1. **Scenario 1: Safe Educational Site** (`https://kids.nationalgeographic.com/animals`)  
   *Result*: 🟢 Score 10/100 (SAFE) • Access permitted.
2. **Scenario 2: Fake Gaming Reward** (`http://free-minecraft-coins-999.xyz/claim`)  
   *Result*: 🔴 Score 92/100 (HIGH RISK) • Block screen injected • Minecraft safe alternatives surfaced • Coach quiz prompted.
3. **Scenario 3: Fake Login Phishing** (`http://192.168.1.105/roblox/login-verify.html`)  
   *Result*: 🔴 Score 94/100 (DANGEROUS) • Credential harvester blocked • Evidence Pack created • Parent notified.
4. **Scenario 4: Suspicious Download** (`free-minecraft-coins.exe`)  
   *Result*: 🚨 Download cancelled • Demo Quarantine • Recovery guidance displayed.
5. **Scenario 5: Adaptive Protection Shift**  
   *Result*: ⚡ Gaming scam exposures lower detection threshold from 70 to 55.
6. **Scenario 6: Vigilo Coach Challenge**  
   *Result*: 🎮 Interactive scenario quiz with child-friendly explanation.
7. **Scenario 7: Evidence Pack PDF**  
   *Result*: 📄 One-click download of branded forensic incident report.

---

## 🔒 Privacy Guarantee

- **Zero Full Browsing Surveillance**: No history logs of safe websites or search queries are stored.
- **No Password Capture**: Form values are never read or transmitted to AI.
- **Aggregated Security Counters**: Adaptation relies exclusively on category frequencies (`gaming_scams: 8`).

---

## 📚 Documentation Links
- [System Architecture](docs/architecture.md)
- [Privacy Standards](docs/privacy.md)
- [Live Presentation Script](docs/demo.md)
