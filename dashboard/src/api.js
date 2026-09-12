/**
 * Vigilo API Client
 * Centralizes REST communication with the FastAPI backend.
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function fetchJSON(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API Error ${res.status}: ${errText}`);
  }
  return res.json();
}

export const api = {
  // Dashboard
  getSummary: () => fetchJSON("/api/dashboard/summary"),
  getThreats: () => fetchJSON("/api/dashboard/threats"),
  getNotifications: () => fetchJSON("/api/dashboard/notifications"),

  // Incidents & Evidence
  getIncidents: (limit = 50) => fetchJSON(`/api/incidents?limit=${limit}`),
  getIncident: (id) => fetchJSON(`/api/incidents/${id}`),
  getReportUrl: (id, format = "pdf") => `${API_BASE}/api/incidents/${id}/report?format=${format}`,

  // Adaptive Protection
  getAdaptiveProfile: () => fetchJSON("/api/adaptive-profile"),
  adjustAdaptiveProfile: (category, increment_by = 1) =>
    fetchJSON("/api/adaptive-profile/adjust", {
      method: "POST",
      body: JSON.stringify({ category, increment_by }),
    }),

  // Coach
  getCoachLessons: (category) => fetchJSON(category ? `/api/coach/lessons?category=${category}` : "/api/coach/lessons"),
  getCoachProgress: () => fetchJSON("/api/coach/progress"),
  generateCoachChallenge: (threat_category) =>
    fetchJSON("/api/coach/generate", {
      method: "POST",
      body: JSON.stringify({ threat_category }),
    }),
  answerCoachChallenge: (lesson_id, user_answer) =>
    fetchJSON("/api/coach/answer", {
      method: "POST",
      body: JSON.stringify({ lesson_id, user_answer }),
    }),

  // Safe Alternatives
  getSafeAlternatives: (query = "", category = "") =>
    fetchJSON(`/api/safe-alternatives?query=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`),

  // Ask Vigilo
  askVigilo: (question, current_url = "") =>
    fetchJSON("/api/ask-vigilo", {
      method: "POST",
      body: JSON.stringify({ question, current_url }),
    }),

  // Demo Showcase
  getDemoScenarios: () => fetchJSON("/api/demo/scenarios"),
  simulateDemo: (scenario_id) =>
    fetchJSON(`/api/demo/simulate/${scenario_id}`, { method: "POST" }),
};
