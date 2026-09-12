# Vigilo System Architecture & Technical Design

"Don't just block danger. Detect it, explain it, respond to it, and teach children to recognize it."

---

## 1. High-Level Architectural Topology

```
+-------------------------------------------------------------------------------+
|                             CHILD BROWSING ENVIRONMENT                        |
|                                                                               |
|  +---------------------+      +--------------------------------------------+  |
|  |   Active Web Page   | ---> |        Vigilo Content Script (MV3)         |  |
|  |  (DOM, Forms, Text) |      | (Inspects inputs, injects block & banner)  |  |
|  +---------------------+      +--------------------------------------------+  |
|             |                                        |                        |
|             v                                        v                        |
|  +---------------------+      +--------------------------------------------+  |
|  |  Browser Downloads  | ---> |        Background Service Worker           |  |
|  |   (.exe, .scr, ...) |      | (Cancels downloads, manages tab alerts)    |  |
|  +---------------------+      +--------------------------------------------+  |
|                                                      |                        |
+------------------------------------------------------|------------------------+
                                                       | REST API (JSON)
                                                       v
+-------------------------------------------------------------------------------+
|                             VIGILO FASTAPI BACKEND                            |
|                                                                               |
|  +--------------------+   +-----------------------+   +--------------------+  |
|  | URL & DOM Features |   |  Scikit-Learn Model   |   |   Gemini 2.5 AI    |  |
|  |  (16 Indicators)   |   | (RandomForest Engine) |   | (Reasoning/Explain)|  |
|  +--------------------+   +-----------------------+   +--------------------+  |
|            \                         |                         /              |
|             \                        v                        /               |
|              +-----------------------------------------------+                |
|              |      Multi-Signal Risk Engine (0-100 Score)   |                |
|              +-----------------------------------------------+                |
|                                      |                                        |
|                                      v                                        |
|              +-----------------------------------------------+                |
|              |        Response Agent & Policy Validator      |                |
|              |         (Fixed Allowlist Action Engine)       |                |
|              +-----------------------------------------------+                |
|                    /                  |                  \                    |
|                   v                   v                   v                   |
|         +------------------+ +------------------+ +-------------------+       |
|         |  Clean-Up Demo   | |  Evidence Pack   | |   Vigilo Coach    |       |
|         | Quarantine Engine| |  Generator (PDF) | | & Safe Alternative|       |
|         +------------------+ +------------------+ +-------------------+       |
+-------------------------------------------------------------------------------+
                                       |
                                       v
+-------------------------------------------------------------------------------+
|                       PARENT SAFETY DASHBOARD (React + Tailwind)              |
|                                                                               |
|   * Today's Protection KPI Counters    * Live Incident Feed                   |
|   * Evidence Pack & PDF Report Viewer  * Privacy-Safe Adaptive Profiler       |
|   * Coach Learning & Mastery Center    * 1-Click Judge Presentation Console   |
+-------------------------------------------------------------------------------+
```

---

## 2. Multi-Signal Risk Scoring Pipeline

The risk engine computes a calibrated 0–100 score by combining multiple independent security signals:

$$\text{Composite Score} = \frac{W_{\text{ml}} \cdot S_{\text{ml}} + W_{\text{heur}} \cdot S_{\text{heur}} + W_{\text{ai}} \cdot S_{\text{ai}} + W_{\text{intel}} \cdot S_{\text{intel}}}{\sum W}$$

### Signal Inputs:
1. **Machine Learning Classifier ($W=0.45$)**:
   - Random Forest trained on URL lexical features, structural characteristics, and page cues.
   - Outputs class probability $P(\text{Malicious})$.
2. **Heuristic Indicator Engine ($W=0.25$)**:
   - Flags high-risk TLDs (`.xyz`, `.top`, `.click`), raw IP hosts, multi-subdomains, credential harvester combinations.
3. **Gemini AI Assessment ($W=0.20$)**:
   - Contextual understanding of social engineering, deceptive phrasing, and counterfeit gaming bait.
4. **Threat Intelligence Service ($W=0.10$)**:
   - Optional external reputation score with automatic local fallback if unconfigured.

### Severity Buckets:
- **0–30: SAFE** (Action: `ALLOW`)
- **31–60: SUSPICIOUS** (Action: `WARN`, `SHOW_SAFE_ALTERNATIVE`)
- **61–80: HIGH RISK** (Action: `BLOCK_PAGE`, `NOTIFY_PARENT`, `GENERATE_EVIDENCE`, `SHOW_SAFE_ALTERNATIVE`)
- **81–100: DANGEROUS** (Action: `BLOCK_PAGE`, `CANCEL_DOWNLOAD`, `QUARANTINE_SIMULATION`, `GENERATE_EVIDENCE`, `NOTIFY_PARENT`, `START_COACH_LESSON`)

---

## 3. Response Agent Guardrails

To prevent unintended behaviors, the Response Agent operates under strict deterministic boundaries:
- **No Arbitrary Commands**: Gemini cannot execute shell scripts or system modifications.
- **Fixed Action Allowlist**:
  - `ALLOW`
  - `WARN`
  - `BLOCK_PAGE`
  - `CANCEL_DOWNLOAD`
  - `QUARANTINE_SIMULATION`
  - `GENERATE_EVIDENCE`
  - `NOTIFY_PARENT`
  - `SHOW_RECOVERY_GUIDANCE`
  - `SHOW_SAFE_ALTERNATIVE`
  - `START_COACH_LESSON`
- **Mandatory Policy Overrides**: If risk score exceeds threshold or dangerous executable is detected, mandatory safety actions are attached regardless of model output.

---

## 4. Safe Alternatives Architecture

Gemini analyzes the child's genuine intent (e.g. searching for Minecraft skins or game mods), but is **strictly barred from generating URLs**.
All recommendations are queried from the `safe_resources` verified table containing pre-vetted official portals (e.g., Minecraft Marketplace, CurseForge, Scratch MIT).
