"""
Vigilo Evidence Pack & PDF Incident Report Generator
Generates structured JSON security records and branded forensic PDF reports
for parents and cybersecurity review.
Strictly avoids logging child passwords, form entries, or private browsing history.
"""

import os
import json
from datetime import datetime
from typing import Dict, Any
from fpdf import FPDF

REPORTS_DIR = os.path.join(os.path.dirname(__file__), "storage")

class VigiloIncidentPDF(FPDF):
    def __init__(self, incident: Dict[str, Any]):
        super().__init__()
        self.incident = incident
        self.set_auto_page_break(auto=True, margin=15)
        self.add_page()

    def header(self):
        # Banner Header
        self.set_fill_color(15, 23, 42) # Slate 900
        self.rect(0, 0, 210, 30, 'F')
        
        self.set_font("Helvetica", "B", 18)
        self.set_text_color(56, 189, 248) # Cyan 400
        self.set_xy(15, 8)
        self.cell(0, 8, "VIGILO CHILD-SAFETY INCIDENT REPORT", 0, 1, 'L')
        
        self.set_font("Helvetica", "", 10)
        self.set_text_color(203, 213, 225) # Slate 300
        self.set_xy(15, 18)
        self.cell(0, 6, "AI-Powered Threat Detection, Response & Evidence Forensics", 0, 1, 'L')
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(148, 163, 184)
        self.cell(0, 10, f"Vigilo Autonomous Child Defense • Incident ID: {self.incident.get('id', 'N/A')} • Confidential Family Security Document", 0, 0, 'C')

    def generate(self, output_path: str):
        inc = self.incident
        
        # 1. Incident Overview Box
        self.set_fill_color(241, 245, 249)
        self.rect(15, 38, 180, 42, 'F')
        self.set_draw_color(203, 213, 225)
        self.rect(15, 38, 180, 42, 'D')

        self.set_font("Helvetica", "B", 11)
        self.set_text_color(30, 41, 59)
        self.set_xy(20, 42)
        self.cell(50, 6, "INCIDENT IDENTIFIER:", 0, 0)
        self.set_font("Helvetica", "", 11)
        self.cell(0, 6, str(inc.get("id", "N/A")), 0, 1)

        self.set_font("Helvetica", "B", 11)
        self.set_xy(20, 50)
        self.cell(50, 6, "THREAT CLASSIFICATION:", 0, 0)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(220, 38, 38) if inc.get("risk_score", 0) >= 70 else self.set_text_color(217, 119, 6)
        self.cell(0, 6, f"{inc.get('threat_type', 'Suspicious Activity')} ({inc.get('threat_category', 'general')})", 0, 1)

        self.set_font("Helvetica", "B", 11)
        self.set_text_color(30, 41, 59)
        self.set_xy(20, 58)
        self.cell(50, 6, "RISK SCORE / CONFIDENCE:", 0, 0)
        self.set_font("Helvetica", "", 11)
        self.cell(0, 6, f"{inc.get('risk_score', 0)} / 100  (Confidence: {inc.get('confidence', 90)}%)", 0, 1)

        self.set_font("Helvetica", "B", 11)
        self.set_xy(20, 66)
        self.cell(50, 6, "TIMESTAMP / ACTION:", 0, 0)
        self.set_font("Helvetica", "", 11)
        self.cell(0, 6, f"{inc.get('created_at', 'N/A')}  |  Action Taken: {inc.get('action_taken', 'BLOCKED')}", 0, 1)

        self.ln(12)

        # 2. Target Details
        self.set_xy(15, 86)
        self.set_font("Helvetica", "B", 12)
        self.set_text_color(15, 23, 42)
        self.cell(0, 8, "1. Forensic Target Details", 0, 1)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(51, 65, 85)
        self.multi_cell(180, 6, f"Target URL: {inc.get('url', 'N/A')}\nDomain: {inc.get('domain', 'N/A')}")
        
        # Download metadata if present
        dl_meta = inc.get("download_metadata")
        if dl_meta:
            self.ln(2)
            self.set_font("Helvetica", "I", 10)
            self.set_text_color(185, 28, 28)
            self.multi_cell(180, 6, f"Download Intercepted: {dl_meta.get('filename', 'unknown')} ({dl_meta.get('file_size', 0)} bytes)\nQuarantine State: DEMO_QUARANTINED (Safe isolation simulated)")

        self.ln(4)

        # 3. Detection Indicators
        self.set_font("Helvetica", "B", 12)
        self.set_text_color(15, 23, 42)
        self.cell(0, 8, "2. Detected Security Indicators", 0, 1)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(71, 85, 105)

        indicators = inc.get("detected_indicators", [])
        if indicators:
            for ind in indicators:
                self.cell(5, 6, "-", 0, 0)
                self.cell(0, 6, f" {ind}", 0, 1)
        else:
            self.cell(0, 6, "No specific heuristic anomalies flagged.", 0, 1)

        self.ln(6)

        # 4. AI & Response Agent Assessment
        self.set_font("Helvetica", "B", 12)
        self.set_text_color(15, 23, 42)
        self.cell(0, 8, "3. Vigilo AI & Response Agent Analysis", 0, 1)
        
        ai_meta = inc.get("ai_assessment", {})
        child_expl = ai_meta.get("child_explanation") or "Identified dangerous or deceptive patterns targeting young users."
        parent_tech = ai_meta.get("parent_technical_summary") or "Automated multi-signal classifier flagged suspicious behavioral traits."
        
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(30, 41, 59)
        self.cell(0, 6, "Child-Friendly Explanation:", 0, 1)
        self.set_font("Helvetica", "I", 10)
        self.set_text_color(71, 85, 105)
        self.multi_cell(180, 6, f'"{child_expl}"')

        self.ln(2)
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(30, 41, 59)
        self.cell(0, 6, "Parent Forensic Summary:", 0, 1)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(71, 85, 105)
        self.multi_cell(180, 6, parent_tech)

        self.ln(6)

        # 5. Recommended Actions for Parents
        self.set_font("Helvetica", "B", 12)
        self.set_text_color(15, 23, 42)
        self.cell(0, 8, "4. Recommended Next Steps", 0, 1)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(71, 85, 105)
        self.multi_cell(180, 6, (
            "1. Inform the child about credential harvesting and fake gaming currencies.\n"
            "2. Ensure no account passwords or personal emails were submitted.\n"
            "3. Encourage the child to complete the related Vigilo Coach challenge to reinforce learning.\n"
            "4. Access the Parent Dashboard for adaptive protection updates."
        ))

        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        self.output(output_path)
        return output_path

def generate_pdf_report(incident: Dict[str, Any]) -> str:
    """Generates and persists a PDF report, returning the absolute file path."""
    os.makedirs(REPORTS_DIR, exist_ok=True)
    inc_id = incident.get("id", "INCIDENT")
    pdf_filename = f"Vigilo_Report_{inc_id}.pdf"
    output_path = os.path.join(REPORTS_DIR, pdf_filename)
    
    pdf = VigiloIncidentPDF(incident)
    pdf.generate(output_path)
    return output_path

def generate_html_report(incident: Dict[str, Any]) -> str:
    """Generates an attractive standalone HTML version of the incident evidence pack."""
    inc = incident
    indicators_html = "".join(f"<li>{ind}</li>" for ind in inc.get("detected_indicators", []))
    
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Vigilo Incident Evidence - {inc.get('id')}</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 2rem; }}
        .container {{ max-width: 800px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 2rem; box-shadow: 0 10px 25px rgba(0,0,0,0.5); border: 1px solid #334155; }}
        .header {{ display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 1rem; margin-bottom: 1.5rem; }}
        .badge {{ background: #ef4444; color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-weight: bold; font-size: 0.85rem; }}
        .score {{ font-size: 2.5rem; font-weight: 800; color: #f87171; }}
        h1 {{ margin: 0; font-size: 1.5rem; color: #38bdf8; }}
        .section {{ margin-bottom: 1.5rem; }}
        .section h2 {{ font-size: 1.1rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }}
        .quote {{ background: #0f172a; border-left: 4px solid #38bdf8; padding: 0.75rem 1rem; font-style: italic; border-radius: 4px; }}
        ul {{ margin: 0; padding-left: 1.25rem; }}
        li {{ margin-bottom: 0.25rem; color: #cbd5e1; }}
        .footer {{ font-size: 0.8rem; color: #64748b; text-align: center; margin-top: 2rem; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <h1>🛡️ VIGILO INCIDENT EVIDENCE</h1>
                <div style="color: #94a3b8; font-size: 0.9rem; margin-top: 4px;">ID: {inc.get('id')} • {inc.get('created_at')}</div>
            </div>
            <div style="text-align: right;">
                <div class="score">{inc.get('risk_score')}/100</div>
                <span class="badge">{inc.get('action_taken')}</span>
            </div>
        </div>

        <div class="section">
            <h2>Threat Classification</h2>
            <p style="font-size: 1.2rem; font-weight: 600; color: #fca5a5; margin: 0;">{inc.get('threat_type')} <span style="font-size: 0.9rem; color: #94a3b8;">({inc.get('threat_category')})</span></p>
            <p style="margin-top: 6px; word-break: break-all;"><strong>URL:</strong> <code>{inc.get('url')}</code></p>
        </div>

        <div class="section">
            <h2>Detected Forensic Indicators</h2>
            <ul>{indicators_html or "<li>Standard behavioral flags</li>"}</ul>
        </div>

        <div class="section">
            <h2>Vigilo AI Explanation</h2>
            <div class="quote">"{inc.get('ai_assessment', {}).get('child_explanation', 'Threat pattern intercepted.')}"</div>
        </div>

        <div class="section">
            <h2>Parent Technical Summary</h2>
            <p>{inc.get('ai_assessment', {}).get('parent_technical_summary', 'Automated heuristic and ML detection pipeline triggered response policy.')}</p>
        </div>

        <div class="footer">
            Generated autonomously by Vigilo Child-Safety Platform • Zero Personal Surveillance Policy
        </div>
    </div>
</body>
</html>
"""
    return html
