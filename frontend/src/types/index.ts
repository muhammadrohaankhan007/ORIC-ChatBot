export type ViewMode = 
  | 'home'
  | 'dashboard' 
  | 'chat' 
  | 'explorer' 
  | 'radar' 
  | 'erl' 
  | 'discussions' 
  | 'reports'
  | 'sources'
  | 'upload';

export type ChatMode = 'conversational' | 'research';

export type CurrencyMode = 'PKR' | 'USD';

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

export interface ProductItem {
  name: string;
  dosageForm: string;
  packaging?: string;
  targetCustomer?: string;
  unitCostPKR?: number | string;
  unitPricePKR?: number | string;
  sellingPricePKR?: number | string;
  marginPct?: number | string;
  differentiation?: string;
}

export interface ServiceItem {
  name: string;
  protocol?: string;
  targetClientele?: string;
  turnaroundDays?: number | string;
  feePKR?: number | string;
}

export interface MarketSizing {
  currencyDefault?: string;
  exchangeRateUSD?: number;
  tamPKR?: number;
  samPKR?: number;
  somPKR?: number;
  tamUSD?: number;
  samUSD?: number;
  somUSD?: number;
  methodology?: string;
  confidence?: string;
}

export interface CommercializationCriteriaScores {
  technicalFeasibility?: number;
  marketAttractiveness?: number;
  customerDemandEvidence?: number;
  trlScore?: number;
  intellectualProperty?: number;
  teamCapability?: number;
  scalability?: number;
  importSubstitution?: number;
}

export interface CommercializationReviewNote {
  author: string;
  date: string;
  notes: string;
  assignedStatus?: string;
}

export interface CommercializationInfo {
  trlLevel: number;
  trlDescription?: string;
  overallScore: number;
  priority: 'High Priority' | 'Medium Priority' | 'Standard Priority' | string;
  recommendation?: string;
  criteriaScores?: CommercializationCriteriaScores;
  nextActions?: string[];
  reviewNotes?: CommercializationReviewNote[];
}

export interface MatchedIndustrialArea {
  id?: string;
  areaName: string;
  relevancePct: number;
  rationale?: string;
  candidatePartners?: string[];
}

export interface GrowthForecastItem {
  year?: number;
  scenario?: string;
  unitVolume?: number;
  revenuePKR?: number;
  [key: string]: any;
}

export interface Project {
  id: string;
  project_code: string;
  title: string;
  faculty?: string | null;
  faculty_code?: 'FOP' | 'FCS' | 'FE' | 'FMS' | string | null;
  department?: string | null;
  lead_investigator: string;
  abstract?: string | null;
  problem_statement?: string | null;
  technology_stack: string[];
  development_stage?: 'Concept' | 'Lab Prototype' | 'Bench Validated' | 'Field Tested' | 'Commercial Ready' | string | null;
  trl_level: number;
  erl_level: number;
  ip_status?: 'None' | 'Disclosure Filed' | 'Patent Pending' | 'Patent Granted' | string | null;
  target_industries: string[];
  commercial_readiness?: 'High' | 'Medium' | 'Emerging' | string | null;
  estimated_funding_pkr: number;
  created_at: string;

  // Enriched ORIC Core Intelligence & Governance properties
  facultyPI?: string | null;
  coSupervisors?: string[] | null;
  courseCode?: string | null;
  courseTitle?: string | null;
  classNbr?: string | null;
  semester?: string | null;
  exhibitionId?: string | null;
  studentGroup?: string | null;
  studentsCount?: number | null;
  domain?: string | null;
  technologies?: string[] | null;
  products?: ProductItem[];
  services?: ServiceItem[];
  marketSizing?: MarketSizing;
  commercialization?: CommercializationInfo;
  matchedAreas?: MatchedIndustrialArea[];
  growthForecast?: any;
  submissionDate?: string;
  documentSource?: string;
  excelRowIndex?: number;
  aiModelUsed?: string;
}

export interface EvidenceSource {
  id: string;
  name: string;
  type: string;
  url: string;
  description: string;
  credibility: string;
  relevantAreas: string;
  lastVerified: string;
}

export interface KarachiIndustrialArea {
  id: string;
  name: string;
  association: string;
  type: string;
  establishedYear: number;
  areaSqKm: string;
  unitsCount: string;
  coordinates: { lat: number; lng: number };
  verifiedSectors: string[];
  infrastructure: string;
  logisticsConstraints: string;
  majorPharmaPresence: string;
  techAdoptionPotential: string;
  annualTurnoverEst: string;
  dataSource: string;
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
  cluster: string;
  sector: string;
  turnover_range: string;
  verified_status: boolean;
  contact_person: string;
  contact_email: string;
  matching_project_code?: string;
  synergy_potential: 'High' | 'Moderate' | 'Strategic' | string;
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
