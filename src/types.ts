export interface Incident {
  id: string;
  child_id: string;
  threat_type: string;
  threat_category: 'gaming_scams' | 'phishing' | 'malicious_downloads' | 'fake_logins' | 'suspicious_content';
  risk_score: number;
  confidence: number;
  url: string;
  domain: string;
  action_taken: 'BLOCK_PAGE' | 'CANCEL_DOWNLOAD' | 'WARN' | 'ALLOW';
  detected_indicators: string[];
  ml_result: {
    domain: string;
    risk_score: number;
    confidence: number;
    threat_type: string;
    threat_category: string;
    detected_indicators: string[];
  };
  ai_assessment: {
    risk_verdict: string;
    risk_explanation: string;
    child_friendly_warning: string;
    recommended_actions: string[];
  };
  download_metadata?: {
    filename: string;
    file_size?: number;
    quarantine_status?: string;
  } | null;
  parent_notified: boolean;
  created_at: string;
}

export interface AdaptiveProfile {
  child_id: string;
  gaming_scams: number;
  phishing: number;
  malicious_downloads: number;
  fake_logins: number;
  suspicious_content: number;
  adapted_thresholds: {
    gaming: number;
    phishing: number;
    downloads: number;
    default: number;
  };
  threat_levels: {
    gaming_scams: 'LOW' | 'MEDIUM' | 'HIGH';
    phishing: 'LOW' | 'MEDIUM' | 'HIGH';
    malicious_downloads: 'LOW' | 'MEDIUM' | 'HIGH';
    fake_logins: 'LOW' | 'MEDIUM' | 'HIGH';
    suspicious_content: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  updated_at: string;
}

export interface CoachLesson {
  id: string;
  threat_category: string;
  title: string;
  scenario_description: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  created_at?: string;
}

export interface SafeResource {
  id: string;
  name: string;
  url: string;
  category: 'gaming' | 'coding' | 'learning' | 'search';
  description: string;
  verified: boolean;
  tags: string[];
}

export interface NotificationAlert {
  id: string;
  incident_id?: string;
  title: string;
  message: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  read: boolean;
  created_at: string;
}

export interface DemoScenario {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'url' | 'page' | 'download' | 'adaptive' | 'coach' | 'safe_alternative';
  url?: string;
  page_content?: string;
  has_password?: boolean;
  filename?: string;
  source_url?: string;
  file_size?: number;
  expected: string;
}
