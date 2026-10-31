export type ViewMode = 
  | 'home'
  | 'dashboard' 
  | 'chat' 
  | 'explorer' 
  | 'radar' 
  | 'erl' 
  | 'discussions' 
  | 'reports';

export type ChatMode = 'conversational' | 'research';

export interface Persona {
  id: string;
  slug: string;
  name: string;
  title: string;
  department: string;
  facultyCode: 'FOP' | 'FCS' | 'FE' | 'FMS' | 'ORIC';
  avatar: string;
  systemPrompt?: string;
  accentColor: string;
  voiceLang: string;
}

export interface Project {
  id: string;
  project_code: string;
  title: string;
  faculty: string;
  faculty_code: 'FOP' | 'FCS' | 'FE' | 'FMS';
  department: string;
  lead_investigator: string;
  abstract: string;
  problem_statement: string;
  technology_stack: string[];
  development_stage: 'Concept' | 'Lab Prototype' | 'Bench Validated' | 'Field Tested' | 'Commercial Ready';
  trl_level: number;
  erl_level: number;
  ip_status: 'None' | 'Disclosure Filed' | 'Patent Pending' | 'Patent Granted';
  target_industries: string[];
  commercial_readiness: 'High' | 'Medium' | 'Emerging';
  estimated_funding_pkr: number;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  agent_name?: string;
  content: string;
  timestamp: string;
  mode?: ChatMode;
  citations?: string[];
  suggested_actions?: string[];
}

export interface IndustryCompany {
  id: string;
  name: string;
  cluster: 'Korangi Industrial Area' | 'S.I.T.E. Industrial Area' | 'Landhi Industrial Area' | 'Port Qasim' | 'Federal B Area';
  sector: 'Pharmaceutical' | 'Textile & Apparel' | 'Chemical & FMCG' | 'Biomedical & Healthcare' | 'Information Technology';
  turnover_range: string;
  verified_status: boolean;
  contact_person: string;
  contact_email: string;
  matching_project_code?: string;
  synergy_potential: 'High' | 'Moderate' | 'Strategic';
  tech_needs: string[];
}

export interface ErlDimensionScore {
  dimension: string;
  score: number;
  maxScore: number;
  keyStrength: string;
  criticalGap: string;
}

export interface ErlAssessment {
  project_id: string;
  project_code: string;
  project_title: string;
  overall_score: number;
  maturity_stage: string;
  dimensions: ErlDimensionScore[];
  identified_gaps: string[];
  recommended_milestones: {
    title: string;
    target_date: string;
    completed: boolean;
  }[];
}

export interface MeetingTranscript {
  id: string;
  title: string;
  project_code?: string;
  date: string;
  duration_minutes: number;
  recorded_by: string;
  full_transcript: string;
  ai_summary: string;
  decisions_made: string[];
  action_items: {
    task: string;
    assignee: string;
    deadline: string;
  }[];
}

