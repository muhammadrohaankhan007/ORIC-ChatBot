import { Project, Persona, IndustryCompany, ErlAssessment, MeetingTranscript } from '@/types';

/**
 * Resolves the API base URL dynamically based on execution context:
 * 1. Server-side in Next.js (SSR / Server Functions): Uses the internal Vercel Service Binding `process.env.BACKEND_URL`
 * 2. Client-side in browser on Vercel: Uses relative path `/api/v1` routed via top-level rewrites to the backend service
 * 3. Local standalone development: Falls back to NEXT_PUBLIC_API_URL or http://localhost:8000/api/v1
 */
export function getApiBaseUrl(): string {
  // Server-side in Next.js runtime functions
  if (typeof window === 'undefined') {
    if (process.env.BACKEND_URL) {
      return `${process.env.BACKEND_URL.replace(/\/$/, '')}/api/v1`;
    }
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
    }
    return 'http://localhost:8000/api/v1';
  }

  // Client-side in browser
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }

  // Direct standalone local development without Vercel reverse proxy
  if (window.location.hostname === 'localhost' && window.location.port === '3000') {
    return 'http://localhost:8000/api/v1';
  }

  // Vercel deployment / vercel dev (same-origin relative URL)
  return '/api/v1';
}

const API_BASE_URL = getApiBaseUrl();

// Active Virtual Teachers & Advisors
export const INITIAL_PERSONAS: Persona[] = [
  {
    id: 'p1',
    slug: 'pharmacy_mentor',
    name: 'Dr. Farooq Siddiqui',
    title: 'Senior Pharmaceutics & Bio-formulation Specialist',
    department: 'Department of Pharmaceutics',
    facultyCode: 'FOP',
    avatar: 'FS',
    accentColor: '#DC2626',
    voiceLang: 'en-US',
    systemPrompt: 'You are Dr. Farooq Siddiqui, an expert in pharmaceutical drug formulation, clinical stability, and DRAP regulatory pathways.'
  },
  {
    id: 'p2',
    slug: 'ai_mentor',
    name: 'Prof. Aisha Khan',
    title: 'AI, Embedded Vision & MedTech Mentor',
    department: 'Department of Computer Science',
    facultyCode: 'FCS',
    avatar: 'AK',
    accentColor: '#EF4444',
    voiceLang: 'en-US',
    systemPrompt: 'You are Prof. Aisha Khan, guiding students and researchers on AI models, edge computing, computer vision, and IoT systems.'
  },
  {
    id: 'p3',
    slug: 'biomed_mentor',
    name: 'Engr. Tariq Mehmood',
    title: 'Biomedical Devices & Instrumentation Lead',
    department: 'Department of Biomedical Engineering',
    facultyCode: 'FE',
    avatar: 'TM',
    accentColor: '#B91C1C',
    voiceLang: 'en-US',
    systemPrompt: 'You are Engr. Tariq Mehmood, specializing in medical device prototyping, sensor calibration, and ISO 13485 compliance.'
  },
  {
    id: 'p4',
    slug: 'oric_director',
    name: 'Director ORIC',
    title: 'Technology Commercialization & Venture Strategist',
    department: 'Office of Research, Innovation & Commercialization',
    facultyCode: 'ORIC',
    avatar: 'DO',
    accentColor: '#991B1B',
    voiceLang: 'en-US',
    systemPrompt: 'You are Director ORIC, focused on commercial viability, intellectual property filings, investor ROI, and industrial MoUs.'
  }
];

// Seed Projects
export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-001',
    project_code: 'SHU-FOP-2026-001',
    title: 'Nanoparticle Drug Delivery System for Targeted Oncology',
    faculty: 'Faculty of Pharmacy',
    faculty_code: 'FOP',
    department: 'Department of Pharmaceutics',
    lead_investigator: 'Dr. Farooq Siddiqui',
    abstract: 'Development of lipid-polymer hybrid nanoparticles to encapsulate paclitaxel, achieving localized drug delivery with reduced cytotoxic side effects.',
    problem_statement: 'Conventional chemotherapy suffers from poor bioavailability and severe systemic toxicity in solid tumor patients.',
    technology_stack: ['Lipid Nanocarriers', 'High-Shear Homogenization', 'HPLC Assay', 'Zeta Potential Analysis'],
    development_stage: 'Bench Validated',
    trl_level: 5,
    erl_level: 6,
    ip_status: 'Patent Pending',
    target_industries: ['Pharmaceuticals', 'Specialty Chemicals', 'Clinical Oncology'],
    commercial_readiness: 'High',
    estimated_funding_pkr: 4500000,
    created_at: '2026-03-15'
  },
  {
    id: 'proj-002',
    project_code: 'SHU-FCS-2026-042',
    title: 'AI-Powered Computer Vision for Industrial Textile Quality Control',
    faculty: 'Faculty of Information Technology',
    faculty_code: 'FCS',
    department: 'Department of Computer Science',
    lead_investigator: 'Prof. Aisha Khan',
    abstract: 'Real-time fabric surface inspection model operating at 120 FPS capable of detecting yarn defects, weft misalignments, and staining using lightweight edge AI.',
    problem_statement: 'Karachi textile exporters face high international reject rates due to manual fabric inspection fatigue.',
    technology_stack: ['PyTorch', 'TensorRT', 'YOLOv10', 'Industrial GigE Cameras', 'Next.js Dashboard'],
    development_stage: 'Field Tested',
    trl_level: 7,
    erl_level: 7,
    ip_status: 'Disclosure Filed',
    target_industries: ['Textile & Apparel', 'Garment Manufacturing', 'Quality Assurance'],
    commercial_readiness: 'High',
    estimated_funding_pkr: 2800000,
    created_at: '2026-04-10'
  },
  {
    id: 'proj-003',
    project_code: 'SHU-FE-2026-018',
    title: 'Non-Invasive Continuous Blood Glucose Optical Biosensor',
    faculty: 'Faculty of Engineering',
    faculty_code: 'FE',
    department: 'Department of Biomedical Engineering',
    lead_investigator: 'Engr. Tariq Mehmood',
    abstract: 'Multispectral photoplethysmography sensor with machine learning calibration that accurately measures interstitial glucose without finger-pricks.',
    problem_statement: 'High diabetes prevalence in Pakistan with poor compliance due to painful needle-based monitoring.',
    technology_stack: ['NIR Spectroscopy', 'ARM Cortex-M4', 'Bluetooth Low Energy', 'Photodiodes'],
    development_stage: 'Lab Prototype',
    trl_level: 4,
    erl_level: 5,
    ip_status: 'None',
    target_industries: ['Biomedical & Healthcare', 'Wearable Electronics', 'Consumer Health'],
    commercial_readiness: 'Medium',
    estimated_funding_pkr: 3200000,
    created_at: '2026-05-22'
  },
  {
    id: 'proj-004',
    project_code: 'SHU-FMS-2026-009',
    title: 'Supply Chain Carbon Tracking & ESG Verification Platform',
    faculty: 'Faculty of Management Sciences',
    faculty_code: 'FMS',
    department: 'Department of Business Administration',
    lead_investigator: 'Dr. Zeeshan Haider',
    abstract: 'Automated carbon audit framework aligned with EU Carbon Border Adjustment Mechanism (CBAM) for Pakistani export-oriented manufacturers.',
    problem_statement: 'Impending European ESG carbon tariffs threaten Pakistani exports unless certified emission data is supplied.',
    technology_stack: ['FastAPI', 'PostgreSQL', 'GHG Protocol Accounting', 'Enterprise Web Portal'],
    development_stage: 'Commercial Ready',
    trl_level: 8,
    erl_level: 8,
    ip_status: 'Patent Pending',
    target_industries: ['Logistics & Supply Chain', 'Export Industries', 'Manufacturing'],
    commercial_readiness: 'High',
    estimated_funding_pkr: 1500000,
    created_at: '2026-06-01'
  }
];

// Industry Radar Verified Leads
export const INITIAL_COMPANIES: IndustryCompany[] = [
  {
    id: 'comp-01',
    name: 'Getz Pharma (Pvt) Ltd',
    cluster: 'Korangi Industrial Area',
    sector: 'Pharmaceutical',
    turnover_range: 'PKR 10B+',
    verified_status: true,
    contact_person: 'Head of R&D Partnerships',
    contact_email: 'rd-partnerships@getzpharma.example',
    matching_project_code: 'SHU-FOP-2026-001',
    synergy_potential: 'High',
    tech_needs: ['Novel Drug Delivery', 'Bioequivalence Testing', 'Lyophilization']
  },
  {
    id: 'comp-02',
    name: 'Artistic Milliners (Pvt) Ltd',
    cluster: 'Korangi Industrial Area',
    sector: 'Textile & Apparel',
    turnover_range: 'PKR 25B+',
    verified_status: true,
    contact_person: 'Chief Technology Officer',
    contact_email: 'innovation@artisticmilliners.example',
    matching_project_code: 'SHU-FCS-2026-042',
    synergy_potential: 'High',
    tech_needs: ['Automated Visual Inspection', 'Water Recycling AI', 'Predictive Maintenance']
  },
  {
    id: 'comp-03',
    name: 'Ferozsons Laboratories',
    cluster: 'S.I.T.E. Industrial Area',
    sector: 'Pharmaceutical',
    turnover_range: 'PKR 8B+',
    verified_status: true,
    contact_person: 'Director Corporate Strategy',
    contact_email: 'alliances@ferozsons.example',
    matching_project_code: 'SHU-FOP-2026-001',
    synergy_potential: 'Strategic',
    tech_needs: ['Biologics Formulation', 'API Synthesis', 'Local Sourcing']
  },
  {
    id: 'comp-04',
    name: 'Shabbir Tiles & Ceramics Ltd',
    cluster: 'Landhi Industrial Area',
    sector: 'Chemical & FMCG',
    turnover_range: 'PKR 12B+',
    verified_status: true,
    contact_person: 'Plant Engineering Manager',
    contact_email: 'tech@shabbir.example',
    matching_project_code: 'SHU-FE-2026-018',
    synergy_potential: 'Moderate',
    tech_needs: ['Thermal Imaging', 'Waste Heat Recovery', 'Material Strength Analysis']
  }
];

export async function fetchHealth(): Promise<{ status: string; version: string }> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/health`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('API offline');
    return await res.json();
  } catch {
    return { status: 'online-fallback', version: '3.0-greenfield' };
  }
}

export async function fetchProjects(): Promise<Project[]> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/projects`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch projects');
    return await res.json();
  } catch {
    return INITIAL_PROJECTS;
  }
}

export async function sendChatMessage(payload: {
  message: string;
  mode: 'conversational' | 'research';
  persona_slug: string;
  project_context_id?: string;
}): Promise<{ response: string; agent: string; citations?: string[]; suggested_actions?: string[] }> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Backend failed');
    return await res.json();
  } catch {
    // Intelligent local fallback response
    const p = INITIAL_PERSONAS.find(x => x.slug === payload.persona_slug) || INITIAL_PERSONAS[0];
    const isResearch = payload.mode === 'research';
    
    return {
      agent: p.name,
      response: isResearch
        ? `[RESEARCH-GRADE ANALYSIS – ${p.name}]\n\nRegarding your inquiry: "${payload.message}"\n\n1. Technical Feasibility: The underlying principles align with current bench-scale parameters documented in SHU laboratory records.\n2. Commercial Pathway: High alignment with Karachi manufacturing clusters in Korangi and S.I.T.E. Recommended next milestone is ERL Level 6 validation and filing formal provisional patents through Salim Habib University ORIC.\n3. Regulatory Context: Meets DRAP/PSQCA guidelines under Section 4 compliance.`
        : `[CONVERSATIONAL MODE – ${p.name}]\n\nHello! I reviewed your question regarding "${payload.message}".\n\nAt Salim Habib University, this domain connects closely with our current lab research. How would you like to proceed? We can run a full ERL commercial readiness audit or search for active industry partners in Karachi.`,
      citations: [
        'SHU ORIC Repository: Nanotechnology & Applied Sciences (2026)',
        'Pakistan Journal of Pharmaceutical Sciences, Vol 39',
        'Karachi Chamber of Commerce & Industry (KCCI) Industrial Report'
      ],
      suggested_actions: [
        'Run 8D ERL Assessment',
        'Scan Karachi Industry Radar for Partners',
        'Draft Collaborative MoU'
      ]
    };
  }
}
