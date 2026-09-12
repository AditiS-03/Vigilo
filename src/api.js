// Vigilo API client

const API_BASE = '/api';

export async function fetchDashboardSummary() {
  const res = await fetch(`${API_BASE}/dashboard/summary`);
  if (!res.ok) throw new Error('Failed to fetch dashboard summary');
  return res.json();
}

export async function fetchIncidents(params = {}) {
  const query = new URLSearchParams();
  if (params.category) query.append('category', params.category);
  if (params.severity) query.append('severity', params.severity);
  if (params.search) query.append('search', params.search);
  
  const res = await fetch(`${API_BASE}/incidents?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch incidents');
  return res.json();
}

export async function fetchIncidentDetail(id) {
  const res = await fetch(`${API_BASE}/incidents/${id}`);
  if (!res.ok) throw new Error('Failed to fetch incident details');
  return res.json();
}

export async function fetchAdaptiveProfile() {
  const res = await fetch(`${API_BASE}/adaptive`);
  if (!res.ok) throw new Error('Failed to fetch adaptive profile');
  return res.json();
}

export async function updateAdaptiveThresholds(thresholds) {
  const res = await fetch(`${API_BASE}/adaptive/thresholds`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(thresholds)
  });
  if (!res.ok) throw new Error('Failed to update thresholds');
  return res.json();
}

export async function triggerAdaptiveIncident(category) {
  const res = await fetch(`${API_BASE}/adaptive/trigger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category })
  });
  if (!res.ok) throw new Error('Failed to trigger adaptive update');
  return res.json();
}

export async function fetchCoachLessons(category = null) {
  const url = category ? `${API_BASE}/coach/lessons?category=${category}` : `${API_BASE}/coach/lessons`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch coach lessons');
  return res.json();
}

export async function submitCoachAnswer(lessonId, userAnswer) {
  const res = await fetch(`${API_BASE}/coach/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lesson_id: lessonId, user_answer: userAnswer })
  });
  if (!res.ok) throw new Error('Failed to submit coach answer');
  return res.json();
}

export async function generateAICoachChallenge(threatCategory = 'gaming_scams') {
  const res = await fetch(`${API_BASE}/coach/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ threat_category: threatCategory })
  });
  if (!res.ok) throw new Error('Failed to generate coach challenge');
  return res.json();
}

export async function fetchCoachProgress() {
  const res = await fetch(`${API_BASE}/coach/progress`);
  if (!res.ok) throw new Error('Failed to fetch coach progress');
  return res.json();
}

export async function fetchSafeResources(category = null, search = null) {
  const query = new URLSearchParams();
  if (category && category !== 'all') query.append('category', category);
  if (search) query.append('search', search);

  const res = await fetch(`${API_BASE}/safe-alternatives?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch safe resources');
  return res.json();
}

export async function fetchDemoScenarios() {
  const res = await fetch(`${API_BASE}/demo/scenarios`);
  if (!res.ok) throw new Error('Failed to fetch demo scenarios');
  return res.json();
}

export async function simulateScenario(scenarioId) {
  const res = await fetch(`${API_BASE}/demo/simulate/${scenarioId}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to simulate scenario');
  return res.json();
}

export async function analyzeLiveInput(type, payload) {
  const endpoint = type === 'url' ? '/analyze/url' : type === 'page' ? '/analyze/page' : '/analyze/download';
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Analysis request failed');
  return res.json();
}

export async function askVigiloAI(question, context = '') {
  const res = await fetch(`${API_BASE}/ask-vigilo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, context })
  });
  if (!res.ok) throw new Error('Failed to get answer from Vigilo AI');
  return res.json();
}
