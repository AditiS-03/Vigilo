/**
 * Vigilo Background Service Worker (Manifest V3)
 * Coordinates URL inspection, download interception, backend communication, and tab alerts.
 */

const DEFAULT_BACKEND = "http://localhost:8000";

// Retrieve configured backend URL from storage
async function getBackendUrl() {
  const data = await chrome.storage.local.get(["vigilo_backend_url"]);
  return data.vigilo_backend_url || DEFAULT_BACKEND;
}

// Update Extension Icon Badge
function updateBadge(tabId, severity, score) {
  if (!tabId) return;
  let text = "";
  let color = "#10b981"; // Safe green

  if (severity === "DANGEROUS" || severity === "HIGH_RISK") {
    text = "!";
    color = "#ef4444"; // Red alert
  } else if (severity === "SUSPICIOUS") {
    text = "?";
    color = "#f59e0b"; // Warning yellow
  } else if (severity === "SAFE") {
    text = "OK";
    color = "#10b981";
  }

  chrome.action.setBadgeText({ tabId, text });
  chrome.action.setBadgeBackgroundColor({ tabId, color });
}

// 1. Download Interceptor & Clean-Up Workflow
chrome.downloads.onCreated.addListener(async (downloadItem) => {
  const filename = downloadItem.filename || "";
  const fnLower = filename.toLowerCase();
  const dangerousExts = [".exe", ".scr", ".bat", ".vbs", ".msi", ".iso", ".pif", ".cmd", ".ps1"];
  const isDangerous = dangerousExts.some((ext) => fnLower.endsWith(ext));

  if (isDangerous) {
    console.log(`[VIGILO] Intercepted suspicious download: ${filename}`);
    
    // Attempt browser-level cancellation
    try {
      chrome.downloads.cancel(downloadItem.id, () => {
        console.log(`[VIGILO] Download ${downloadItem.id} cancelled by Vigilo Clean-Up.`);
      });
    } catch (e) {
      console.warn("[VIGILO] Cancel error:", e);
    }

    // Report to backend clean-up endpoint
    try {
      const backend = await getBackendUrl();
      const res = await fetch(`${backend}/api/analyze/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: filename || "game_hack.exe",
          source_url: downloadItem.url || "",
          file_size: downloadItem.fileSize || 0
        })
      });
      const data = await res.json();

      // Broadcast alert to active tab
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (activeTab && activeTab.id) {
        chrome.tabs.sendMessage(activeTab.id, {
          action: "SHOW_DOWNLOAD_ALERT",
          downloadInfo: data
        });
      }
    } catch (err) {
      console.error("[VIGILO] Error contacting backend for download analysis:", err);
    }
  }
});

// 2. Message Dispatcher for Content Script and Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "ANALYZE_PAGE") {
    getBackendUrl().then((backend) => {
      fetch(`${backend}/api/analyze/page`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: request.url,
          page_content: request.page_content,
          has_password_field: request.has_password_field
        })
      })
      .then((r) => r.json())
      .then((data) => {
        if (sender.tab && sender.tab.id) {
          updateBadge(sender.tab.id, data.severity, data.risk_score);
          // Store result in local tab cache
          chrome.storage.local.set({ [`tab_${sender.tab.id}`]: data });
        }
        sendResponse({ success: true, data });
      })
      .catch((err) => {
        console.error("[VIGILO] Page analysis failed:", err);
        sendResponse({ success: false, error: err.message });
      });
    });
    return true; // Keep channel open for async response
  }

  if (request.action === "GET_CURRENT_TAB_STATUS") {
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (!tab) {
        sendResponse({ data: null });
        return;
      }
      chrome.storage.local.get([`tab_${tab.id}`]).then((stored) => {
        sendResponse({ tab, data: stored[`tab_${tab.id}`] || null });
      });
    });
    return true;
  }
});

console.log("[VIGILO] Background Service Worker active.");
