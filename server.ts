import express from 'express';
import cors from 'cors';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- Gemini AI Lazy Initialization ---
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// --- In-Memory Persistent Database for Hackathon Demonstration ---
const defaultGamingThreshold = Number(process.env.GAMING_WARNING_THRESHOLD) || 55;
const defaultPhishingThreshold = Number(process.env.PHISHING_WARNING_THRESHOLD) || 60;
const defaultDownloadThreshold = Number(process.env.DOWNLOAD_WARNING_THRESHOLD) || 50;
const defaultGeneralThreshold = Number(process.env.DEFAULT_WARNING_THRESHOLD) || 70;

let adaptiveProfile = {
  child_id: 'default-child-1',
  gaming_scams: 5,
  phishing: 2,
  malicious_downloads: 2,
  fake_logins: 1,
  suspicious_content: 3,
  adapted_thresholds: {
    gaming: defaultGamingThreshold,
    phishing: defaultPhishingThreshold,
    downloads: defaultDownloadThreshold,
    default: defaultGeneralThreshold
  },
  threat_levels: {
    gaming_scams: 'HIGH',
    phishing: 'MEDIUM',
    malicious_downloads: 'MEDIUM',
    fake_logins: 'LOW',
    suspicious_content: 'LOW'
  },
  updated_at: new Date().toISOString()
};

function recalculateAdaptiveThresholds() {
  const g = adaptiveProfile.gaming_scams;
  const p = adaptiveProfile.phishing;
  const d = adaptiveProfile.malicious_downloads;

  adaptiveProfile.adapted_thresholds.gaming = Math.max(35, 70 - g * 3);
  adaptiveProfile.adapted_thresholds.phishing = Math.max(40, 70 - p * 4);
  adaptiveProfile.adapted_thresholds.downloads = Math.max(30, 65 - d * 5);

  const getLevel = (count: number) => (count >= 5 ? 'HIGH' : count >= 2 ? 'MEDIUM' : 'LOW');
  adaptiveProfile.threat_levels.gaming_scams = getLevel(g);
  adaptiveProfile.threat_levels.phishing = getLevel(p);
  adaptiveProfile.threat_levels.malicious_downloads = getLevel(d);
  adaptiveProfile.updated_at = new Date().toISOString();
}

let incidents = [
  {
    id: 'VIG-202609-8472',
    child_id: 'default-child-1',
    threat_type: 'Fake Gaming Currency Scam',
    threat_category: 'gaming_scams',
    risk_score: 92,
    confidence: 96,
    url: 'http://free-minecraft-coins-999.xyz/claim?user=steve',
    domain: 'free-minecraft-coins-999.xyz',
    action_taken: 'BLOCK_PAGE',
    detected_indicators: [
      'High-risk suspicious TLD (.xyz)',
      'Bait reward keywords: "free", "coins", "claim"',
      'Urgency trigger pressure: "claim before time runs out"',
      'Fake login password credential harvest trap'
    ],
    ml_result: {
      domain: 'free-minecraft-coins-999.xyz',
      risk_score: 92,
      confidence: 96,
      threat_type: 'Fake Gaming Currency Scam',
      threat_category: 'gaming_scams',
      detected_indicators: ['Suspicious .xyz TLD', 'Currency lure']
    },
    ai_assessment: {
      risk_verdict: 'HIGH_RISK_SCAM',
      risk_explanation: 'This domain uses artificial countdown pressure and promises counterfeit Minecraft coins to trick children into revealing account credentials.',
      child_friendly_warning: 'This site is trying to trick you! Real games like Minecraft never give out free coins on unofficial websites.',
      recommended_actions: ['BLOCK_PAGE', 'SHOW_SAFE_ALTERNATIVE', 'START_COACH_LESSON']
    },
    parent_notified: true,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: 'VIG-202609-8471',
    child_id: 'default-child-1',
    threat_type: 'Roblox Credential Harvester',
    threat_category: 'phishing',
    risk_score: 95,
    confidence: 98,
    url: 'http://192.168.1.105/roblox/login-verify.html',
    domain: '192.168.1.105',
    action_taken: 'BLOCK_PAGE',
    detected_indicators: [
      'Raw IP host address instead of official registered domain',
      'Phishing credential form asking for password',
      'Deceptive alert warning account will be deleted'
    ],
    ml_result: {
      domain: '192.168.1.105',
      risk_score: 95,
      confidence: 98,
      threat_type: 'Roblox Credential Harvester',
      threat_category: 'phishing',
      detected_indicators: ['Direct IP host', 'Password harvester']
    },
    ai_assessment: {
      risk_verdict: 'DANGEROUS_PHISHING',
      risk_explanation: 'Deceptive webpage impersonating Roblox security verification on an unencrypted IP host with false urgency.',
      child_friendly_warning: 'Stop! Someone created a fake page to steal your Roblox password. Roblox only lives at roblox.com.',
      recommended_actions: ['BLOCK_PAGE', 'GENERATE_EVIDENCE', 'NOTIFY_PARENT']
    },
    parent_notified: true,
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  },
  {
    id: 'VIG-202609-8470',
    child_id: 'default-child-1',
    threat_type: 'Dangerous Executable Download',
    threat_category: 'malicious_downloads',
    risk_score: 89,
    confidence: 94,
    url: 'http://free-game-rewards.xyz/download',
    domain: 'free-game-rewards.xyz',
    action_taken: 'CANCEL_DOWNLOAD',
    detected_indicators: [
      'Direct executable file extension (.exe)',
      'Bait reward filename "free-minecraft-coins.exe"',
      'Unverified web origin without SSL verification'
    ],
    ml_result: {
      domain: 'free-game-rewards.xyz',
      risk_score: 89,
      confidence: 94,
      threat_type: 'Dangerous Executable Download',
      threat_category: 'malicious_downloads',
      detected_indicators: ['.exe binary extension', 'Bait name']
    },
    ai_assessment: {
      risk_verdict: 'MALICIOUS_DOWNLOAD',
      risk_explanation: 'Suspicious executable payload attempting unverified browser download. Intercepted by Vigilo Clean-Up.',
      child_friendly_warning: 'Vigilo stopped this download because .exe files from unverified websites can hurt your computer.',
      recommended_actions: ['CANCEL_DOWNLOAD', 'QUARANTINE_SIMULATION', 'SHOW_RECOVERY_GUIDANCE']
    },
    download_metadata: {
      filename: 'free-minecraft-coins.exe',
      file_size: 2457600,
      quarantine_status: 'DEMO_QUARANTINED'
    },
    parent_notified: true,
    created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString()
  },
  {
    id: 'VIG-202609-8469',
    child_id: 'default-child-1',
    threat_type: 'Fake Game Mod Installer',
    threat_category: 'malicious_downloads',
    risk_score: 86,
    confidence: 92,
    url: 'http://cheat-diamond-minecraft.top/installer.scr',
    domain: 'cheat-diamond-minecraft.top',
    action_taken: 'CANCEL_DOWNLOAD',
    detected_indicators: [
      'High-risk screensaver executable (.scr)',
      'High-risk TLD (.top)',
      'Bait keyword "cheat-diamond"'
    ],
    ml_result: {
      domain: 'cheat-diamond-minecraft.top',
      risk_score: 86,
      confidence: 92,
      threat_type: 'Fake Game Mod Installer',
      threat_category: 'malicious_downloads',
      detected_indicators: ['.scr extension', '.top TLD']
    },
    ai_assessment: {
      risk_verdict: 'MALICIOUS_DOWNLOAD',
      risk_explanation: 'Screensaver executable file disguise used to execute background spyware.',
      child_friendly_warning: 'Be careful! Game cheats from unknown sites often hide programs that spy on your computer.',
      recommended_actions: ['CANCEL_DOWNLOAD', 'SHOW_SAFE_ALTERNATIVE']
    },
    download_metadata: {
      filename: 'installer.scr',
      file_size: 1153433,
      quarantine_status: 'DEMO_QUARANTINED'
    },
    parent_notified: true,
    created_at: new Date(Date.now() - 180 * 60 * 1000).toISOString()
  },
  {
    id: 'VIG-202609-8468',
    child_id: 'default-child-1',
    threat_type: 'Deceptive Subscription Lure',
    threat_category: 'suspicious_content',
    risk_score: 58,
    confidence: 88,
    url: 'http://fun-arcade-games-online.club/play',
    domain: 'fun-arcade-games-online.club',
    action_taken: 'WARN',
    detected_indicators: [
      'Aggressive hidden recurring charge disclosure',
      'Deceptive fake "Close Window" button that clicks ads',
      'Bait arcade layout'
    ],
    ml_result: {
      domain: 'fun-arcade-games-online.club',
      risk_score: 58,
      confidence: 88,
      threat_type: 'Deceptive Subscription Lure',
      threat_category: 'suspicious_content',
      detected_indicators: ['Subscription trap']
    },
    ai_assessment: {
      risk_verdict: 'SUSPICIOUS_LURE',
      risk_explanation: 'Website disguises third-party recurring charges behind free browser games.',
      child_friendly_warning: 'Watch out! This site has tricky buttons that might sign up for things without asking.',
      recommended_actions: ['WARN', 'SHOW_SAFE_ALTERNATIVE']
    },
    parent_notified: false,
    created_at: new Date(Date.now() - 240 * 60 * 1000).toISOString()
  }
];

let coachLessons = [
  {
    id: 'LESSON-GAMING-01',
    threat_category: 'gaming_scams',
    title: 'The Free Game Coins Trap',
    scenario_description: 'You are playing your favorite game and see a pop-up saying: "CONGRATULATIONS! Get 10,000 Free V-Bucks or Robux now! Just enter your username and password."',
    question: 'What is the safest action to take?',
    options: [
      'Enter your password immediately to claim the free coins.',
      'Close the page because real games never ask for your password to give free rewards.',
      'Send the link to all your friends so they can get free coins too.',
      'Type a fake password just to see what happens.'
    ],
    correct_answer: 'Close the page because real games never ask for your password to give free rewards.',
    explanation: 'Real game developers never ask for your password or give away unlimited currency on unofficial websites. That is a trick called credential harvesting!',
    difficulty: 'BEGINNER'
  },
  {
    id: 'LESSON-DOWNLOAD-01',
    threat_category: 'malicious_downloads',
    title: 'Spotting Dangerous Downloads',
    scenario_description: 'You find a website offering "minecraft_cheat_infinite_diamonds.exe" or "free_game_installer.scr".',
    question: 'Why is downloading this file dangerous?',
    options: [
      'It will make your computer faster.',
      'Files ending in .exe or .scr from unknown websites can carry viruses or spyware that harm your computer.',
      'It is completely safe as long as the website has bright colors.',
      'It only takes up space on your desktop.'
    ],
    correct_answer: 'Files ending in .exe or .scr from unknown websites can carry viruses or spyware that harm your computer.',
    explanation: 'Executables (.exe, .scr, .bat) can run unauthorized software on your computer. Only download game mods and apps from verified stores or with parent permission!',
    difficulty: 'BEGINNER'
  },
  {
    id: 'LESSON-PHISHING-01',
    threat_category: 'phishing',
    title: 'The Urgent Account Warning',
    scenario_description: 'You receive an urgent message: "URGENT: Your account will be DELETED in 10 minutes unless you click here and log in right now!"',
    question: 'What is this psychological trick called?',
    options: [
      'A friendly reminder.',
      'Urgency manipulation - scammers create false panic so you act before thinking.',
      'Standard game maintenance.',
      'A special VIP quest.'
    ],
    correct_answer: 'Urgency manipulation - scammers create false panic so you act before thinking.',
    explanation: 'Scammers use false urgency and count-down timers to panic you into typing your password. Always stop, take a breath, and ask a parent or Vigilo!',
    difficulty: 'INTERMEDIATE'
  }
];

let coachAttempts = [
  { id: 'att-1', lesson_id: 'LESSON-GAMING-01', is_correct: true, score: 100 },
  { id: 'att-2', lesson_id: 'LESSON-DOWNLOAD-01', is_correct: true, score: 100 }
];

const safeResources = [
  {
    id: 'sr-1',
    name: 'Minecraft Official Site',
    url: 'https://www.minecraft.net',
    category: 'gaming',
    description: 'Official Minecraft home, news, and safe launcher downloads.',
    verified: true,
    tags: ['minecraft', 'skins', 'games', 'mojang']
  },
  {
    id: 'sr-2',
    name: 'Minecraft Marketplace',
    url: 'https://www.minecraft.net/en-us/marketplace',
    category: 'gaming',
    description: 'Official verified skins, worlds, textures, and add-ons scanned by Mojang.',
    verified: true,
    tags: ['minecraft', 'skins', 'textures', 'marketplace']
  },
  {
    id: 'sr-3',
    name: 'CurseForge Minecraft Mods',
    url: 'https://www.curseforge.com/minecraft',
    category: 'gaming',
    description: 'Vetted community mods, skins, and modpacks with automated antivirus scanning.',
    verified: true,
    tags: ['minecraft', 'mods', 'skins', 'curseforge']
  },
  {
    id: 'sr-4',
    name: 'Roblox Official Platform',
    url: 'https://www.roblox.com',
    category: 'gaming',
    description: 'Official Roblox gaming portal, verified avatar shop, and experiences.',
    verified: true,
    tags: ['roblox', 'robux', 'avatar', 'games']
  },
  {
    id: 'sr-5',
    name: 'Scratch MIT',
    url: 'https://scratch.mit.edu',
    category: 'coding',
    description: 'Creative coding community for kids built by MIT Media Lab.',
    verified: true,
    tags: ['coding', 'scratch', 'education', 'mit', 'games']
  },
  {
    id: 'sr-6',
    name: 'Code.org',
    url: 'https://code.org',
    category: 'coding',
    description: 'Interactive computer science puzzles and safe games for kids.',
    verified: true,
    tags: ['coding', 'games', 'education']
  },
  {
    id: 'sr-7',
    name: 'National Geographic Kids',
    url: 'https://kids.nationalgeographic.com',
    category: 'learning',
    description: 'Fascinating animal facts, space science, and safe educational quizzes.',
    verified: true,
    tags: ['animals', 'science', 'education', 'quizzes']
  },
  {
    id: 'sr-8',
    name: 'Khan Academy Kids',
    url: 'https://www.khanacademy.org/kids',
    category: 'learning',
    description: 'Engaging math, reading, and problem-solving interactive lessons.',
    verified: true,
    tags: ['math', 'learning', 'education']
  },
  {
    id: 'sr-9',
    name: 'PBS KIDS',
    url: 'https://pbskids.org',
    category: 'learning',
    description: 'Safe educational games and videos featuring PBS characters.',
    verified: true,
    tags: ['pbs', 'games', 'education']
  },
  {
    id: 'sr-10',
    name: "NASA Kids' Club",
    url: 'https://www.nasa.gov/learning-resources/nasa-kids-club',
    category: 'learning',
    description: 'Space exploration missions, STEM activities, and astronomy fun.',
    verified: true,
    tags: ['space', 'nasa', 'science', 'astronomy']
  }
];

const demoScenarios = [
  {
    id: 'scenario_1_safe',
    title: 'Scenario 1: Safe Educational Website',
    description: 'Child explores National Geographic Kids animal discovery portal.',
    category: 'safe',
    url: 'https://kids.nationalgeographic.com/animals',
    type: 'url',
    expected: '🟢 SAFE (Score < 20, Access Allowed)'
  },
  {
    id: 'scenario_2_gaming_scam',
    title: 'Scenario 2: Fake Gaming Reward (V-Bucks / Minecraft Coins)',
    description: 'Bait website promising 10,000 free game coins and demanding account password.',
    category: 'gaming_scams',
    url: 'http://free-minecraft-coins-999.xyz/claim?user=steve',
    type: 'page',
    page_content: 'CONGRATULATIONS! You won 10,000 Free Coins! Enter your username and password to claim immediately before time runs out!',
    has_password: true,
    expected: '🔴 HIGH RISK (Score 92+, Blocked, Safe Alternative to Minecraft Marketplace, Coach Prompt)'
  },
  {
    id: 'scenario_3_fake_login',
    title: 'Scenario 3: Fake Login / Credential Phishing',
    description: 'Deceptive site spoofing Roblox/Steam account verification with urgent threat of deletion.',
    category: 'phishing',
    url: 'http://192.168.1.105/roblox/login-verify.html',
    type: 'page',
    page_content: 'URGENT SECURITY ALERT: Your account will be permanently deleted unless verified right now. Enter your login password.',
    has_password: true,
    expected: '🔴 DANGEROUS PHISHING (Score 94+, Blocked, Evidence Pack Generated, Parent Alert)'
  },
  {
    id: 'scenario_4_download',
    title: 'Scenario 4: Suspicious Download & Demo Quarantine',
    description: "Attempt to download 'free-minecraft-coins.exe' from unverified web origin.",
    category: 'malicious_downloads',
    filename: 'free-minecraft-coins.exe',
    source_url: 'http://free-game-rewards.xyz/download',
    file_size: 2457600,
    type: 'download',
    expected: '🚨 DOWNLOAD PREVENTED (Demo Quarantine, Recovery Guidance, Parent Alert, Evidence Pack)'
  },
  {
    id: 'scenario_5_adaptive',
    title: 'Scenario 5: Adaptive Protection in Action',
    description: 'Child encounters repeated gaming scams, causing Vigilo to tighten sensitivity for gaming threats.',
    category: 'gaming_scams',
    type: 'adaptive',
    expected: '⚡ THRESHOLD ADAPTED (Gaming threshold tightened from 70 to 55, High Gaming Scrutiny)'
  },
  {
    id: 'scenario_6_coach',
    title: 'Scenario 6: Vigilo Coach Challenge',
    description: 'Personalized quiz challenge triggered by gaming scam exposure.',
    category: 'gaming_scams',
    type: 'coach',
    expected: '🎮 GAMING SCAM CHALLENGE (Interactive Quiz & Instant Child-Friendly Feedback)'
  },
  {
    id: 'scenario_7_safe_alt',
    title: 'Scenario 7: Safe Alternative Recommendation',
    description: 'Instead of a simple block screen, Vigilo understands intent and recommends vetted alternatives.',
    category: 'gaming',
    query: 'free minecraft skins',
    type: 'safe_alternative',
    expected: '🛡️ VETTED SAFE OPTIONS (Minecraft Official, Marketplace, CurseForge Vetted Mods)'
  }
];

// --- Heuristic & Multi-Signal Detection Engine ---
function analyzeContent(url: string, pageContent: string = '', hasPassword = false) {
  const urlLower = (url || '').toLowerCase();
  const contentLower = (pageContent || '').toLowerCase();
  const indicators: string[] = [];

  let domain = 'unknown-domain';
  try {
    const parsed = new URL(url.startsWith('http') ? url : `http://${url}`);
    domain = parsed.hostname;
  } catch {
    domain = url.split('/')[0];
  }

  // 1. High risk TLD check
  const badTlds = ['.xyz', '.top', '.click', '.club', '.buzz', '.work', '.gq', '.cf', '.tk'];
  if (badTlds.some(t => domain.endsWith(t))) {
    indicators.push(`High-risk domain extension (${domain.split('.').pop()})`);
  }

  // 2. IP Host check
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain)) {
    indicators.push(`Unverified raw IP address host (${domain})`);
  }

  // 3. Bait keywords
  const baitTerms = ['free', 'coins', 'robux', 'vbuck', 'v-bucks', 'claim', 'hack', 'cheat', 'generator', 'giftcard'];
  const matchedBait = baitTerms.filter(term => urlLower.includes(term) || contentLower.includes(term));
  if (matchedBait.length > 0) {
    indicators.push(`Lure bait keywords detected: "${matchedBait.slice(0, 3).join(', ')}"`);
  }

  // 4. Urgency manipulation
  const urgencyTerms = ['urgent', 'immediately', 'permanently deleted', 'timer', 'hurry', 'suspended'];
  if (urgencyTerms.some(term => contentLower.includes(term))) {
    indicators.push('Urgency manipulation tactics inducing panic');
  }

  // 5. Credential harvest check
  if (hasPassword || contentLower.includes('password') || contentLower.includes('passcode')) {
    indicators.push('Credential harvesting input (requests account password)');
  }

  // Safe checks
  const safeDomains = ['nationalgeographic.com', 'khanacademy.org', 'minecraft.net', 'scratch.mit.edu', 'pbskids.org'];
  const isSafe = safeDomains.some(d => domain.includes(d));

  if (isSafe) {
    return {
      domain,
      risk_score: 12,
      severity: 'SAFE',
      confidence: 98,
      threat_type: 'Safe Educational Portal',
      threat_category: 'safe',
      detected_indicators: [],
      response_actions: ['ALLOW']
    };
  }

  // Compute composite score
  let score = 25;
  if (indicators.length >= 4) score = 94;
  else if (indicators.length === 3) score = 88;
  else if (indicators.length === 2) score = 72;
  else if (indicators.length === 1) score = 48;

  let category: 'gaming_scams' | 'phishing' | 'malicious_downloads' | 'fake_logins' | 'suspicious_content' = 'suspicious_content';
  if (matchedBait.some(b => ['coins', 'robux', 'vbuck', 'v-bucks'].includes(b))) {
    category = 'gaming_scams';
  } else if (hasPassword || indicators.some(i => i.includes('Credential'))) {
    category = 'phishing';
  }

  let actions = ['ALLOW'];
  if (score >= 80) {
    actions = ['BLOCK_PAGE', 'GENERATE_EVIDENCE', 'NOTIFY_PARENT', 'SHOW_SAFE_ALTERNATIVE', 'START_COACH_LESSON'];
  } else if (score >= 50) {
    actions = ['WARN', 'SHOW_SAFE_ALTERNATIVE'];
  }

  return {
    domain,
    risk_score: score,
    severity: score >= 80 ? 'DANGEROUS' : score >= 50 ? 'HIGH_RISK' : 'SUSPICIOUS',
    confidence: 94,
    threat_type: category === 'gaming_scams' ? 'Fake Gaming Currency Trap' : category === 'phishing' ? 'Roblox/Game Credential Phishing' : 'Suspicious Web Destination',
    threat_category: category,
    detected_indicators: indicators,
    response_actions: actions
  };
}

// ================= API ROUTES =================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'vigilo-fullstack',
    port: PORT,
    ai_status: {
      gemini_configured: Boolean(process.env.GEMINI_API_KEY),
      model: GEMINI_MODEL
    }
  });
});

// Dashboard Summary
app.get('/api/dashboard/summary', (req, res) => {
  const highRisk = incidents.filter(i => i.risk_score >= 80).length;
  const suspicious = incidents.filter(i => i.risk_score >= 40 && i.risk_score < 80).length;
  const downloads = incidents.filter(i => i.download_metadata).length;
  const warnings = incidents.filter(i => i.action_taken === 'WARN').length;

  const categoriesCount: Record<string, number> = {
    gaming_scams: 0,
    phishing: 0,
    malicious_downloads: 0,
    fake_logins: 0,
    suspicious_content: 0
  };

  incidents.forEach(i => {
    if (categoriesCount[i.threat_category] !== undefined) {
      categoriesCount[i.threat_category]++;
    }
  });

  res.json({
    todays_protection: {
      high_risk_threats: highRisk,
      suspicious_websites: suspicious,
      dangerous_downloads_blocked: downloads,
      warnings_issued: warnings,
      threats_resolved: highRisk + downloads
    },
    threat_categories: categoriesCount,
    adaptive_profile: adaptiveProfile,
    safety_status: 'ACTIVE_PROTECTION',
    ai_status: {
      gemini_configured: Boolean(process.env.GEMINI_API_KEY),
      model: GEMINI_MODEL,
      status: process.env.GEMINI_API_KEY ? 'ACTIVE' : 'FALLBACK_HEURISTICS'
    },
    last_active: new Date().toISOString()
  });
});

// Incidents list
app.get('/api/incidents', (req, res) => {
  let list = [...incidents];
  const { category, severity, search } = req.query;

  if (category && category !== 'all') {
    list = list.filter(i => i.threat_category === category);
  }
  if (severity && severity !== 'all') {
    if (severity === 'dangerous') list = list.filter(i => i.risk_score >= 80);
    else if (severity === 'high') list = list.filter(i => i.risk_score >= 50 && i.risk_score < 80);
    else if (severity === 'suspicious') list = list.filter(i => i.risk_score < 50);
  }
  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    list = list.filter(i => i.url.toLowerCase().includes(s) || i.domain.toLowerCase().includes(s) || i.threat_type.toLowerCase().includes(s));
  }

  res.json(list);
});

// Incident detail
app.get('/api/incidents/:id', (req, res) => {
  const inc = incidents.find(i => i.id === req.params.id);
  if (!inc) return res.status(404).json({ error: 'Incident not found' });
  res.json(inc);
});

// Adaptive Profile
app.get('/api/adaptive', (req, res) => {
  res.json(adaptiveProfile);
});

app.post('/api/adaptive/thresholds', (req, res) => {
  adaptiveProfile.adapted_thresholds = { ...adaptiveProfile.adapted_thresholds, ...req.body };
  adaptiveProfile.updated_at = new Date().toISOString();
  res.json({ message: 'Thresholds updated successfully', profile: adaptiveProfile });
});

app.post('/api/adaptive/trigger', (req, res) => {
  const { category = 'gaming_scams' } = req.body;
  if (category === 'gaming_scams') adaptiveProfile.gaming_scams += 1;
  else if (category === 'phishing') adaptiveProfile.phishing += 1;
  else if (category === 'malicious_downloads') adaptiveProfile.malicious_downloads += 1;

  recalculateAdaptiveThresholds();
  res.json({ message: `Adaptive profile adjusted for ${category}`, profile: adaptiveProfile });
});

// Coach
app.get('/api/coach/lessons', (req, res) => {
  const { category } = req.query;
  if (category) {
    return res.json(coachLessons.filter(l => l.threat_category === category));
  }
  res.json(coachLessons);
});

app.post('/api/coach/answer', (req, res) => {
  const { lesson_id, user_answer } = req.body;
  const lesson = coachLessons.find(l => l.id === lesson_id);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

  const is_correct = (lesson.correct_answer || '').trim().toLowerCase() === (user_answer || '').trim().toLowerCase() ||
    (user_answer || '').toLowerCase().includes((lesson.correct_answer || '').toLowerCase());

  const score = is_correct ? 100 : 30;
  coachAttempts.push({
    id: `att-${Date.now()}`,
    lesson_id,
    is_correct,
    score
  });

  res.json({
    is_correct,
    score,
    correct_answer: lesson.correct_answer,
    explanation: lesson.explanation,
    child_feedback: is_correct
      ? '🌟 Correct! You spotted the trick and kept your account safe!'
      : '💡 Nice try! Remember to never enter passwords on unofficial websites.'
  });
});

app.get('/api/coach/progress', (req, res) => {
  const total = coachAttempts.length;
  const correct = coachAttempts.filter(a => a.is_correct).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100;

  res.json({
    total_lessons_available: coachLessons.length,
    completed_challenges: total,
    correct_challenges: correct,
    accuracy_percentage: accuracy,
    safety_badges: [
      { name: 'Gaming Shield Guardian', unlocked: total >= 1, description: 'Spotted a fake currency scam' },
      { name: 'Phishing Detective', unlocked: total >= 2, description: 'Identified a fake login page' },
      { name: 'Download Sentry', unlocked: total >= 3, description: 'Avoided an unsafe executable download' }
    ]
  });
});

// Generate dynamic AI Coach challenge
app.post('/api/coach/generate', async (req, res) => {
  const { threat_category = 'gaming_scams' } = req.body;
  const ai = getAI();

  if (ai) {
    try {
      const prompt = `Create an interactive cybersecurity challenge for a 10-year-old child about "${threat_category}".
Return ONLY a valid JSON object with the following fields:
{
  "title": "Short catchy title",
  "scenario": "A 2-sentence scenario description of the trap the child encounters",
  "question": "Clear multiple choice question",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct_answer": "The exact correct option string",
  "explanation": "Friendly educational reason why that choice is the safest"
}`;
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt
      });

      const text = response.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const newLesson = {
          id: `LESSON-AI-${Date.now().toString().slice(-4)}`,
          threat_category,
          title: parsed.title,
          scenario_description: parsed.scenario,
          question: parsed.question,
          options: parsed.options,
          correct_answer: parsed.correct_answer,
          explanation: parsed.explanation,
          difficulty: 'INTERMEDIATE' as const
        };
        coachLessons.unshift(newLesson);
        return res.json(newLesson);
      }
    } catch (err) {
      console.warn('Gemini coach generation fallback:', err);
    }
  }

  // Deterministic fallback challenge
  const fallback = {
    id: `LESSON-DYN-${Date.now().toString().slice(-4)}`,
    threat_category,
    title: 'The Discord Nitro Scam',
    scenario_description: 'A stranger in your gaming Discord server sends you a DM saying: "Claim 3 months of free Discord Nitro! Just scan this QR code or login with your Steam account."',
    question: 'How should you respond to this message?',
    options: [
      'Scan the QR code right away to get the Nitro perk.',
      'Ignore and block the stranger, because QR code scans can hijack your account session.',
      'Ask them to send the Nitro code to your email instead.',
      'Share the link with your school friends.'
    ],
    correct_answer: 'Ignore and block the stranger, because QR code scans can hijack your account session.',
    explanation: 'Scammers frequently send fake Nitro promotions containing malicious QR codes designed to take over Discord accounts instantly!',
    difficulty: 'INTERMEDIATE' as const
  };

  coachLessons.unshift(fallback);
  res.json(fallback);
});

// Safe Alternatives
app.get('/api/safe-alternatives', (req, res) => {
  const { category, search } = req.query;
  let results = [...safeResources];

  if (category && category !== 'all') {
    results = results.filter(r => r.category === category);
  }
  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    results = results.filter(r => r.name.toLowerCase().includes(s) || r.description.toLowerCase().includes(s));
  }
  res.json(results);
});

// Demo Scenarios
app.get('/api/demo/scenarios', (req, res) => {
  res.json(demoScenarios);
});

app.post('/api/demo/simulate/:id', async (req, res) => {
  const scenario = demoScenarios.find(s => s.id === req.params.id);
  if (!scenario) return res.status(404).json({ error: 'Scenario not found' });

  if (scenario.id === 'scenario_1_safe') {
    const analysis = analyzeContent(scenario.url!);
    return res.json({
      scenario,
      result: {
        ...analysis,
        url: scenario.url,
        explanation: {
          risk_verdict: 'SAFE',
          risk_explanation: 'Vetted educational science and animal exploration portal. Clean SSL certificate and COPPA verified.',
          child_friendly_warning: 'This site is completely safe and fun to explore!'
        }
      }
    });
  }

  if (scenario.id === 'scenario_2_gaming_scam') {
    const analysis = analyzeContent(scenario.url!, scenario.page_content, scenario.has_password);
    const newInc = {
      id: `VIG-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      child_id: 'default-child-1',
      threat_type: 'Fake Gaming Currency Scam',
      threat_category: 'gaming_scams' as const,
      risk_score: 92,
      confidence: 96,
      url: scenario.url!,
      domain: analysis.domain,
      action_taken: 'BLOCK_PAGE' as const,
      detected_indicators: analysis.detected_indicators,
      ml_result: {
        domain: analysis.domain,
        risk_score: 92,
        confidence: 96,
        threat_type: 'Fake Gaming Currency Scam',
        threat_category: 'gaming_scams',
        detected_indicators: analysis.detected_indicators
      },
      ai_assessment: {
        risk_verdict: 'HIGH_RISK_SCAM',
        risk_explanation: 'Bait page promising counterfeit Minecraft currency to harvest user passwords.',
        child_friendly_warning: 'This website looks like a trick! Real game companies never ask for your password to give rewards.',
        recommended_actions: ['BLOCK_PAGE', 'SHOW_SAFE_ALTERNATIVE', 'START_COACH_LESSON']
      },
      parent_notified: true,
      created_at: new Date().toISOString()
    };
    incidents.unshift(newInc);

    return res.json({
      scenario,
      result: {
        ...analysis,
        risk_score: 92,
        severity: 'HIGH_RISK',
        incident_id: newInc.id,
        explanation: newInc.ai_assessment,
        response_actions: ['BLOCK_PAGE', 'SHOW_SAFE_ALTERNATIVE', 'START_COACH_LESSON', 'NOTIFY_PARENT'],
        safe_resources: safeResources.filter(r => r.category === 'gaming').slice(0, 3)
      }
    });
  }

  if (scenario.id === 'scenario_3_fake_login') {
    const analysis = analyzeContent(scenario.url!, scenario.page_content, scenario.has_password);
    const newInc = {
      id: `VIG-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      child_id: 'default-child-1',
      threat_type: 'Roblox Account Phishing',
      threat_category: 'phishing' as const,
      risk_score: 95,
      confidence: 98,
      url: scenario.url!,
      domain: analysis.domain,
      action_taken: 'BLOCK_PAGE' as const,
      detected_indicators: analysis.detected_indicators,
      ml_result: {
        domain: analysis.domain,
        risk_score: 95,
        confidence: 98,
        threat_type: 'Roblox Account Phishing',
        threat_category: 'phishing',
        detected_indicators: analysis.detected_indicators
      },
      ai_assessment: {
        risk_verdict: 'DANGEROUS_PHISHING',
        risk_explanation: 'Counterfeit Roblox security alert demanding password entry on raw IP host.',
        child_friendly_warning: 'Do not enter your password! This is an imposter website trying to steal your Roblox account.',
        recommended_actions: ['BLOCK_PAGE', 'GENERATE_EVIDENCE', 'NOTIFY_PARENT']
      },
      parent_notified: true,
      created_at: new Date().toISOString()
    };
    incidents.unshift(newInc);

    return res.json({
      scenario,
      result: {
        ...analysis,
        risk_score: 95,
        severity: 'DANGEROUS',
        incident_id: newInc.id,
        explanation: newInc.ai_assessment,
        response_actions: ['BLOCK_PAGE', 'GENERATE_EVIDENCE', 'NOTIFY_PARENT']
      }
    });
  }

  if (scenario.id === 'scenario_4_download') {
    const newInc = {
      id: `VIG-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      child_id: 'default-child-1',
      threat_type: 'Dangerous Executable Intercepted',
      threat_category: 'malicious_downloads' as const,
      risk_score: 90,
      confidence: 95,
      url: scenario.source_url!,
      domain: 'free-game-rewards.xyz',
      action_taken: 'CANCEL_DOWNLOAD' as const,
      detected_indicators: ['Executable payload (.exe)', 'Bait reward name', 'Unverified origin'],
      ml_result: {
        domain: 'free-game-rewards.xyz',
        risk_score: 90,
        confidence: 95,
        threat_type: 'Dangerous Executable Intercepted',
        threat_category: 'malicious_downloads',
        detected_indicators: ['.exe extension']
      },
      ai_assessment: {
        risk_verdict: 'MALICIOUS_DOWNLOAD',
        risk_explanation: 'Suspicious Windows executable file download detected and cancelled.',
        child_friendly_warning: 'Vigilo cancelled this download because .exe files from unverified websites can harm your computer.',
        recommended_actions: ['CANCEL_DOWNLOAD', 'QUARANTINE_SIMULATION', 'SHOW_RECOVERY_GUIDANCE']
      },
      download_metadata: {
        filename: scenario.filename!,
        file_size: scenario.file_size,
        quarantine_status: 'DEMO_QUARANTINED'
      },
      parent_notified: true,
      created_at: new Date().toISOString()
    };
    incidents.unshift(newInc);

    return res.json({
      scenario,
      result: {
        filename: scenario.filename,
        source_url: scenario.source_url,
        risk_score: 90,
        severity: 'DANGEROUS',
        action_taken: 'CANCEL_DOWNLOAD',
        quarantine_status: 'DEMO_QUARANTINED',
        notice: 'DEMO QUARANTINE: Simulated isolation workflow in compliance with browser sandbox boundaries.',
        recovery_guidance: [
          'Verify browser download history does not contain untrusted .exe files.',
          'Delete any suspicious installer packages in your Downloads folder.',
          'Always use official app stores like Microsoft Store or Steam.'
        ],
        incident_id: newInc.id
      }
    });
  }

  if (scenario.id === 'scenario_5_adaptive') {
    adaptiveProfile.gaming_scams += 3;
    recalculateAdaptiveThresholds();
    return res.json({
      scenario,
      result: {
        message: 'Simulated 3 gaming scam exposures. Aggregated category counter updated.',
        updated_profile: adaptiveProfile
      }
    });
  }

  if (scenario.id === 'scenario_6_coach') {
    return res.json({
      scenario,
      result: {
        active_lesson: coachLessons[0],
        message: 'Interactive child cybersecurity challenge ready.'
      }
    });
  }

  if (scenario.id === 'scenario_7_safe_alt') {
    return res.json({
      scenario,
      result: {
        intent: 'Minecraft Verified Resources',
        safe_resources: safeResources.filter(r => r.category === 'gaming').slice(0, 3),
        message: 'Child redirected to official vetted alternatives.'
      }
    });
  }

  res.status(400).json({ error: 'Unsupported scenario' });
});

// Live Analyzer (URL, Page, Download)
app.post('/api/analyze/url', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });

  const analysis = analyzeContent(url);
  const ai = getAI();
  let aiExplanation = {
    risk_verdict: analysis.severity,
    risk_explanation: analysis.risk_score >= 70
      ? `This URL shows characteristics of deceptive engineering (${analysis.detected_indicators.join('; ')}).`
      : 'URL appears to be benign with standard security credentials.',
    child_friendly_warning: analysis.risk_score >= 70
      ? 'Be careful! This website might be a trap trying to trick you.'
      : 'This website looks safe!'
  };

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `You are Vigilo, an AI child-safety threat defense engine.
Analyze this URL for child online safety: "${url}".
Detected signals: ${JSON.stringify(analysis.detected_indicators)}.
Calculated Risk Score: ${analysis.risk_score}/100.
Return JSON ONLY:
{
  "risk_verdict": "SAFE or SUSPICIOUS or HIGH_RISK",
  "risk_explanation": "One clear sentence for parents explaining the threat",
  "child_friendly_warning": "One friendly, empowering sentence explaining the danger to a 10-year-old"
}`
      });
      const match = response.text?.match(/\{[\s\S]*\}/);
      if (match) aiExplanation = JSON.parse(match[0]);
    } catch (e) {
      console.warn('Gemini URL analysis fallback:', e);
    }
  }

  const safeAlts = analysis.risk_score >= 50
    ? safeResources.filter(r => r.category === 'gaming').slice(0, 2)
    : [];

  res.json({
    url,
    domain: analysis.domain,
    threat_type: analysis.threat_type,
    threat_category: analysis.threat_category,
    risk_score: analysis.risk_score,
    severity: analysis.severity,
    confidence: analysis.confidence,
    detected_indicators: analysis.detected_indicators,
    explanation: aiExplanation,
    response_actions: analysis.response_actions,
    safe_alternatives: safeAlts
  });
});

app.post('/api/analyze/page', async (req, res) => {
  const { url, page_content, has_password_field } = req.body;
  const analysis = analyzeContent(url, page_content, has_password_field);

  res.json({
    url,
    domain: analysis.domain,
    threat_type: analysis.threat_type,
    threat_category: analysis.threat_category,
    risk_score: analysis.risk_score,
    severity: analysis.severity,
    confidence: analysis.confidence,
    detected_indicators: analysis.detected_indicators,
    explanation: {
      risk_verdict: analysis.severity,
      risk_explanation: `Page content analysis revealed ${analysis.detected_indicators.length} threat indicators.`,
      child_friendly_warning: 'Never enter your passwords on pages that make urgent threats or promise free rewards.'
    },
    response_actions: analysis.response_actions,
    safe_alternatives: safeResources.filter(r => r.category === 'gaming').slice(0, 2)
  });
});

app.post('/api/analyze/download', (req, res) => {
  const { filename, source_url, file_size } = req.body;
  const fnLower = (filename || '').toLowerCase();
  const dangerousExts = ['.exe', '.scr', '.bat', '.vbs', '.msi', '.iso', '.cmd'];
  const isExec = dangerousExts.some(ext => fnLower.endsWith(ext));

  const indicators: string[] = [];
  if (isExec) indicators.push(`Direct executable extension (${fnLower.split('.').pop()})`);
  if (['free', 'cheat', 'hack', 'coins', 'robux'].some(k => fnLower.includes(k))) {
    indicators.push('Bait lure in filename');
  }

  const risk = isExec ? 90 : 25;

  res.json({
    filename,
    source_url,
    risk_score: risk,
    severity: risk >= 80 ? 'DANGEROUS' : 'SAFE',
    action_taken: isExec ? 'CANCEL_DOWNLOAD' : 'ALLOW',
    quarantine_status: isExec ? 'DEMO_QUARANTINED' : 'NONE',
    reason: isExec
      ? `Dangerous executable package (${filename}) intercepted.`
      : 'File extension poses low execution risk.',
    detected_indicators: indicators,
    recovery_guidance: [
      'Verify that only official verified apps are stored in your Downloads directory.',
      'Check with a parent or guardian before executing downloaded installers.'
    ],
    notice: 'DEMO QUARANTINE: Simulated browser isolation in compliance with OS sandbox boundaries.'
  });
});

// Ask Vigilo Owl Assistant
app.post('/api/ask-vigilo', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'Question required' });

  const ai = getAI();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `You are Vigilo, a wise and friendly safety owl companion for children and parents.
The user is asking: "${question}".
Explain with warmth, encouragement, and practical cybersecurity wisdom suitable for a 10-year-old.
Return JSON ONLY:
{
  "answer": "A 2-3 sentence encouraging and clear response starting with Hoo!",
  "safety_tip": "One memorable rule for kids",
  "action_recommended": "The safest immediate step"
}`
      });

      const match = response.text?.match(/\{[\s\S]*\}/);
      if (match) {
        return res.json(JSON.parse(match[0]));
      }
    } catch (err) {
      console.warn('Gemini ask-vigilo fallback:', err);
    }
  }

  // Fallback intelligent safety responses
  const qLower = question.toLowerCase();
  let answer = "Hoo! 🦉 That's a great question about online safety! Always remember: if an offer looks too good to be true, it almost certainly is!";
  let tip = "Never share your password with anyone except your parents.";
  let action = "Check with an adult before clicking.";

  if (qLower.includes('robux') || qLower.includes('vbuck') || qLower.includes('coins') || qLower.includes('free')) {
    answer = "Hoo! 🦉 Websites promising thousands of free Robux or game coins are almost always tricks called 'phishing'. Real games like Roblox never give away unlimited coins on external websites!";
    tip = "Only get game currency inside the official game store with parent permission.";
    action = "Close the tab and do not enter any account info.";
  } else if (qLower.includes('.exe') || qLower.includes('download')) {
    answer = "Hoo! 🦉 Files ending in .exe can run programs directly on your computer. Scammers disguise virus programs as game cheats or mods!";
    tip = "Only download mods from verified websites like CurseForge or official stores.";
    action = "Cancel any unverified .exe downloads immediately.";
  } else if (qLower.includes('password')) {
    answer = "Hoo! 🦉 A super-strong password is like a magical shield! Use a passphrase with 3 or 4 random fun words plus a number (e.g. 'BluePandaJumps42!').";
    tip = "Keep your passwords secret from friends and never type them on unverified sites.";
    action = "Use unique passwords for each of your favorite games.";
  }

  res.json({
    answer,
    safety_tip: tip,
    action_recommended: action
  });
});

// --- Vite Middleware Integration ---
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[VIGILO] Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
