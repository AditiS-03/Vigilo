# Vigilo Live Hackathon Presentation & Demo Script

This guide details how to demonstrate Vigilo to hackathon judges reliably in under 5 minutes.

---

## Quick Demo Execution (1-Click Judge Console)

You can run the entire presentation using either:
1. **The Parent Dashboard Banner**: Click any of the 7 scenario buttons in `http://localhost:5173`.
2. **The Extension Popup**: Click the **⚡ Judge Demo** tab in the Chrome extension.
3. **The Interactive API**: Use Swagger UI at `http://localhost:8000/docs#/Demo%20Showcase`.

---

## Presentation Walkthrough (Step-by-Step)

### Scenario 1: Safe Educational Website
- **Action**: Trigger Scenario 1 or visit `https://kids.nationalgeographic.com/animals`.
- **Observed Behavior**:
  - Score: **< 20 / 100 (SAFE)**.
  - Extension Shield displays green badge `OK`.
  - Content is fully allowed.
  - No intrusive alerts shown.

### Scenario 2: Fake Gaming Reward Scam
- **Action**: Trigger Scenario 2 or visit `http://free-minecraft-coins-999.xyz/claim?user=steve`.
- **Observed Behavior**:
  - ML & Heuristics detect bait keywords (`free`, `coins`, `claim`) on a suspicious `.xyz` TLD.
  - Score: **92 / 100 (HIGH RISK)**.
  - **In-Page Safety Shield** intercepts the tab with a child-friendly explanation:
    *"This website looks like a trick! Real game companies never ask for your password to give rewards."*
  - Recommends verified alternatives (e.g. **Minecraft Marketplace**, **CurseForge Verified Mods**).
  - Prompts the child to take a **Vigilo Coach Challenge**.

### Scenario 3: Fake Login / Credential Phishing
- **Action**: Trigger Scenario 3 or visit spoofed login URL.
- **Observed Behavior**:
  - Score: **94 / 100 (DANGEROUS)**.
  - Response Agent enforces `BLOCK_PAGE`, `GENERATE_EVIDENCE`, `NOTIFY_PARENT`.
  - Evidence Pack generated with structured forensic indicators.

### Scenario 4: Suspicious Download & Clean-Up Workflow
- **Action**: Trigger Scenario 4 (simulating `free-minecraft-coins.exe` download).
- **Observed Behavior**:
  - Browser extension intercepts the file extension `.exe`.
  - Action taken: `CANCEL_DOWNLOAD`.
  - Quarantine Status: **"Demo Quarantine (Browser Isolation Simulated)"**.
  - Recovery Guidance displayed: Check download history, delete unverified files, run system scan.
  - High-priority alert dispatched to Parent Dashboard.

### Scenario 5: Adaptive Protection in Action
- **Action**: Trigger Scenario 5.
- **Observed Behavior**:
  - Aggregated gaming scam counter increments.
  - Gaming risk level shifts from `LOW` -> `MEDIUM` -> `HIGH`.
  - Adapted warning threshold automatically tightens from **70** down to **55**.
  - Demonstrates privacy-safe adaptation without tracking personal browsing history.

### Scenario 6: Vigilo Coach Challenge
- **Action**: Switch to the **Vigilo Coach** tab on the dashboard.
- **Observed Behavior**:
  - Generates an interactive scenario quiz tailored to recent threats.
  - Select an answer and submit: Receive instant positive reinforcement and child-friendly reasoning.
  - Demonstrates educational empowerment rather than mere passive blocking.

### Scenario 7: Evidence Pack & Official PDF Report
- **Action**: Open **Evidence Packs & Incidents** on the dashboard and click **Download PDF Report**.
- **Observed Behavior**:
  - Downloads a branded, official incident report PDF with forensic indicators, timeline, and AI assessment.
