/**
 * Vigilo Content Script
 * Inspects webpage DOM indicators (password fields, text cues) safely without capturing personal data.
 * Injects child-friendly block screens, warning banners, and download alerts.
 */

(function () {
  // Prevent duplicate injection
  if (window.__vigilo_injected) return;
  window.__vigilo_injected = true;

  // 1. Safe DOM Feature Extraction
  function extractPageSignals() {
    const hasPassword = document.querySelector('input[type="password"]') !== null;
    
    // Extract non-sensitive page text snippet for scam keyword analysis
    // Strictly avoiding values of input/textarea fields
    const bodyClone = document.body ? document.body.cloneNode(true) : null;
    let snippet = "";
    if (bodyClone) {
      // Remove scripts, styles, forms
      const unwanted = bodyClone.querySelectorAll("script, style, form, input, textarea");
      unwanted.forEach(el => el.remove());
      snippet = (bodyClone.innerText || "").slice(0, 1500).replace(/\s+/g, " ").trim();
    }

    return {
      url: window.location.href,
      page_content: snippet,
      has_password_field: hasPassword
    };
  }

  // 2. Render In-Page Child-Friendly Block Screen
  function renderBlockScreen(data) {
    // Stop audio/video playing on the blocked page
    document.querySelectorAll("video, audio").forEach(m => m.pause());

    const overlay = document.createElement("div");
    overlay.id = "vigilo-block-overlay";
    
    const explanation = data.explanation?.child_explanation || 
      "This website looks like a trick! It might be pretending to give away free items or trying to peek at your secret passwords.";
    
    const safeAltsHtml = (data.safe_alternatives || []).map(alt => `
      <div class="vigilo-alt-card">
        <div class="vigilo-alt-title">🛡️ ${alt.name} <span class="vigilo-verified-badge">✓ Verified Safe</span></div>
        <div class="vigilo-alt-desc">${alt.description}</div>
        <a href="${alt.url}" class="vigilo-alt-btn">Visit Safe Option →</a>
      </div>
    `).join("");

    overlay.innerHTML = `
      <div class="vigilo-block-modal">
        <div class="vigilo-shield-icon">🛡️</div>
        <div class="vigilo-threat-badge">DANGER BLOCKED</div>
        <h1 class="vigilo-title">Vigilo Kept You Safe!</h1>
        <div class="vigilo-score-pill">Risk Score: ${data.risk_score || 90}/100 • ${data.threat_type || "Suspicious Scam"}</div>
        
        <p class="vigilo-child-expl">${explanation}</p>

        <div class="vigilo-alternatives-container">
          <div class="vigilo-alt-header">✨ Safer Places to Explore Instead:</div>
          <div class="vigilo-alt-grid">
            ${safeAltsHtml || '<div class="vigilo-alt-card"><div class="vigilo-alt-title">Minecraft Official</div><a href="https://www.minecraft.net" class="vigilo-alt-btn">Go to Minecraft.net</a></div>'}
          </div>
        </div>

        <div class="vigilo-actions-row">
          <button id="vigilo-btn-coach" class="vigilo-btn-secondary">🎮 Play Coach Quiz</button>
          <button id="vigilo-btn-ask" class="vigilo-btn-secondary">🦉 Ask Vigilo</button>
          <button id="vigilo-btn-back" class="vigilo-btn-primary">← Take Me Back to Safety</button>
        </div>
        
        <div class="vigilo-footer-note">Incident logged to Parent Dashboard • Privacy Guard Active</div>
      </div>
    `;

    document.documentElement.appendChild(overlay);

    // Event handlers
    document.getElementById("vigilo-btn-back").addEventListener("click", () => {
      window.history.back();
      setTimeout(() => {
        window.location.href = "https://kids.nationalgeographic.com";
      }, 500);
    });

    document.getElementById("vigilo-btn-coach").addEventListener("click", () => {
      window.open("http://localhost:5173", "_blank");
    });

    document.getElementById("vigilo-btn-ask").addEventListener("click", () => {
      alert("Tip: Click the Vigilo Owl icon in your browser toolbar to chat with Vigilo AI!");
    });
  }

  // 3. Render Top Warning Banner for Moderate Risk
  function renderWarningBanner(data) {
    if (document.getElementById("vigilo-warn-banner")) return;
    const banner = document.createElement("div");
    banner.id = "vigilo-warn-banner";
    banner.innerHTML = `
      <div class="vigilo-warn-content">
        <span class="vigilo-warn-icon">⚠️</span>
        <div class="vigilo-warn-text">
          <strong>Vigilo Safety Alert:</strong> This page has suspicious signs (Score: ${data.risk_score}/100). Do not type your password or download anything!
        </div>
        <button id="vigilo-warn-close" class="vigilo-warn-btn">I Understand</button>
      </div>
    `;
    document.body.prepend(banner);
    document.getElementById("vigilo-warn-close").addEventListener("click", () => {
      banner.remove();
    });
  }

  // 4. Render Download Interception Clean-Up Modal
  function renderDownloadModal(dlInfo) {
    const existing = document.getElementById("vigilo-dl-modal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "vigilo-dl-modal";
    
    const guidanceHtml = (dlInfo.recovery_guidance || []).map(g => `<li>${g}</li>`).join("");

    modal.innerHTML = `
      <div class="vigilo-dl-card">
        <div class="vigilo-dl-badge">🚨 SUSPICIOUS DOWNLOAD INTERCEPTED</div>
        <h2>Download Prevented & Quarantined</h2>
        
        <div class="vigilo-dl-info-box">
          <p><strong>File:</strong> <code>${dlInfo.filename}</code></p>
          <p><strong>Risk Score:</strong> <span style="color: #ef4444; font-weight: bold;">${dlInfo.risk_score}/100</span></p>
          <p><strong>Reason:</strong> ${dlInfo.reason || "Suspicious executable from unverified website."}</p>
          <p><strong>Status:</strong> <span class="vigilo-quarantine-tag">🛡️ DEMO QUARANTINE (Isolated)</span></p>
        </div>

        <div class="vigilo-recovery-box">
          <h3>📋 Safety Guidance:</h3>
          <ul>${guidanceHtml || "<li>Do not open the file.</li><li>Vigilo notified your parents.</li>"}</ul>
        </div>

        <button id="vigilo-dl-dismiss" class="vigilo-btn-primary" style="width: 100%; margin-top: 1rem;">Close Safety Notice</button>
      </div>
    `;
    document.documentElement.appendChild(modal);

    document.getElementById("vigilo-dl-dismiss").addEventListener("click", () => {
      modal.remove();
    });
  }

  // Listen for messages from background worker
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "SHOW_DOWNLOAD_ALERT") {
      renderDownloadModal(msg.downloadInfo);
    }
  });

  // Run analysis on page load
  const signals = extractPageSignals();
  chrome.runtime.sendMessage({ action: "ANALYZE_PAGE", ...signals }, (response) => {
    if (!response || !response.success) return;
    const data = response.data;
    
    if (data.severity === "DANGEROUS" || data.severity === "HIGH_RISK" || data.response_actions?.includes("BLOCK_PAGE")) {
      renderBlockScreen(data);
    } else if (data.severity === "SUSPICIOUS" || data.response_actions?.includes("WARN")) {
      renderWarningBanner(data);
    }
  });
})();
