/**
 * Vigilo Popup Controller
 * Manages safety score rendering, child-friendly AI chat, and judge demo simulation.
 */

const DEFAULT_BACKEND = "http://localhost:8000";

let currentContext = {
  url: "",
  risk_score: 0,
  threat_type: "Analyzing...",
  detected_indicators: []
};

async function getBackend() {
  const data = await chrome.storage.local.get(["vigilo_backend_url"]);
  return data.vigilo_backend_url || DEFAULT_BACKEND;
}

document.addEventListener("DOMContentLoaded", async () => {
  setupTabs();
  setupChat();
  setupDemoRunner();
  setupLinks();
  await loadCurrentTabSafety();
});

// 1. Tab Navigation
function setupTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));

      btn.classList.add("active");
      const target = btn.getAttribute("data-tab");
      document.getElementById(target).classList.add("active");
    });
  });
}

// 2. Fetch and Render Current Tab Safety
async function loadCurrentTabSafety() {
  chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
    if (!tab || !tab.url) {
      renderUnknownState("No active webpage detected.");
      return;
    }

    const domain = new URL(tab.url).hostname;
    document.getElementById("current-domain").textContent = domain;
    currentContext.url = tab.url;

    // Check stored analysis
    chrome.storage.local.get([`tab_${tab.id}`], async (stored) => {
      let data = stored[`tab_${tab.id}`];

      if (!data) {
        // Query backend directly
        try {
          const backend = await getBackend();
          const res = await fetch(`${backend}/api/analyze/url`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: tab.url })
          });
          data = await res.json();
        } catch (e) {
          console.warn("[VIGILO] Backend unreachable:", e);
        }
      }

      if (data) {
        applySafetyData(data);
      } else {
        renderUnknownState("Vigilo Protection Active (Offline Cache)");
      }
    });
  });
}

function applySafetyData(data) {
  currentContext.risk_score = data.risk_score || 0;
  currentContext.threat_type = data.threat_type || "Safe";
  currentContext.detected_indicators = data.detected_indicators || [];

  const scoreEl = document.getElementById("score-number");
  const circleEl = document.getElementById("score-circle");
  const severityEl = document.getElementById("threat-severity");
  const explEl = document.getElementById("explanation-text");

  scoreEl.textContent = data.risk_score;
  severityEl.textContent = `${data.severity || "SAFE"} • ${data.threat_type || "Safe Page"}`;

  // Severity color formatting
  let color = "#10b981"; // Safe green
  if (data.severity === "DANGEROUS" || data.severity === "HIGH_RISK") {
    color = "#ef4444";
  } else if (data.severity === "SUSPICIOUS") {
    color = "#f59e0b";
  }

  circleEl.style.borderColor = color;
  severityEl.style.color = color;

  explEl.textContent = data.explanation?.child_explanation ||
    "This website looks safe and clean for browsing. Keep having fun!";

  // Indicators
  const indCard = document.getElementById("indicators-card");
  const indList = document.getElementById("indicators-list");
  if (data.detected_indicators && data.detected_indicators.length > 0) {
    indCard.style.display = "block";
    indList.innerHTML = data.detected_indicators.map((ind) => `<li>${ind}</li>`).join("");
  } else {
    indCard.style.display = "none";
  }

  // Safe Alternatives
  const altCard = document.getElementById("safe-alt-card");
  const altList = document.getElementById("safe-alt-list");
  if (data.safe_alternatives && data.safe_alternatives.length > 0) {
    altCard.style.display = "block";
    altList.innerHTML = data.safe_alternatives.map((alt) =>
      `<a href="${alt.url}" target="_blank">✓ ${alt.name} →</a>`
    ).join("");
  } else {
    altCard.style.display = "none";
  }
}

function renderUnknownState(msg) {
  document.getElementById("score-number").textContent = "0";
  document.getElementById("threat-severity").textContent = "SAFE";
  document.getElementById("explanation-text").textContent = msg;
}

// 3. Ask Vigilo AI Chat
function setupChat() {
  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("chat-send");
  const msgContainer = document.getElementById("chat-messages");

  async function handleSend() {
    const text = input.value.trim();
    if (!text) return;

    // Append user message
    const userMsg = document.createElement("div");
    userMsg.className = "chat-msg user";
    userMsg.textContent = text;
    msgContainer.appendChild(userMsg);
    input.value = "";
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // Append bot thinking
    const botMsg = document.createElement("div");
    botMsg.className = "chat-msg bot";
    botMsg.textContent = "Vigilo is thinking...";
    msgContainer.appendChild(botMsg);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    try {
      const backend = await getBackend();
      const res = await fetch(`${backend}/api/ask-vigilo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text,
          current_url: currentContext.url,
          risk_score: currentContext.risk_score,
          threat_type: currentContext.threat_type,
          detected_indicators: currentContext.detected_indicators
        })
      });
      const data = await res.json();
      botMsg.textContent = data.response;
    } catch (err) {
      botMsg.textContent = "I'm keeping watch! Remember never to share your passwords or download unknown game files.";
    }
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  sendBtn.addEventListener("click", handleSend);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSend();
  });
}

// 4. Judge Demo Runner
function setupDemoRunner() {
  const buttons = document.querySelectorAll(".demo-btn");
  const resultBox = document.getElementById("demo-result");
  const resultTitle = document.getElementById("demo-result-title");
  const resultBody = document.getElementById("demo-result-body");

  buttons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const scenarioId = btn.getAttribute("data-scenario");
      btn.textContent = "Simulating...";

      try {
        const backend = await getBackend();
        const res = await fetch(`${backend}/api/demo/simulate/${scenarioId}`, {
          method: "POST"
        });
        const data = await res.json();

        resultBox.style.display = "block";
        resultTitle.textContent = `🎯 ${data.scenario?.title || "Scenario Simulated"}`;
        resultBody.textContent = JSON.stringify(data.result, null, 2);

        // If the result contains analysis info, reflect in the shield tab too
        if (data.result?.risk_score !== undefined) {
          applySafetyData(data.result);
        }
      } catch (err) {
        resultBox.style.display = "block";
        resultTitle.textContent = "Simulation Notice";
        resultBody.textContent = `Scenario triggered: ${err.message}`;
      } finally {
        btn.textContent = btn.getAttribute("data-scenario").replace("scenario_", "").replace(/_/g, " ");
      }
    });
  });
}

// 5. Links
function setupLinks() {
  document.getElementById("btn-open-dashboard").addEventListener("click", () => {
    chrome.tabs.create({ url: "http://localhost:5173" });
  });

  document.getElementById("link-options").addEventListener("click", (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
}
