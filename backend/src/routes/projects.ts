import { Router, Request, Response } from 'express';
import multer from 'multer';
import { pool, isDbConnected } from '../config/db.js';
import { DocumentParser } from '../services/documentParser.js';
import { VectorStore } from '../services/vectorStore.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25 MB max
});

export const projectsRouter = Router();

// In-memory initial seed dataset
const SEED_PROJECTS = [
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
    created_at: new Date('2026-03-15').toISOString()
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
    created_at: new Date('2026-04-10').toISOString()
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
    created_at: new Date('2026-05-22').toISOString()
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
    created_at: new Date('2026-06-01').toISOString()
  }
];

let inMemoryProjects = [...SEED_PROJECTS];

/**
 * GET /api/v1/projects
 */
projectsRouter.get('/', async (req: Request, res: Response) => {
  const { faculty_code, search } = req.query;

  if (isDbConnected) {
    try {
      let sql = `SELECT * FROM projects WHERE 1=1`;
      const params: any[] = [];

      if (faculty_code && faculty_code !== 'ALL') {
        params.push(faculty_code);
        sql += ` AND faculty_code = $${params.length}`;
      }

      if (search) {
        params.push(`%${search}%`);
        sql += ` AND (title ILIKE $${params.length} OR abstract ILIKE $${params.length} OR project_code ILIKE $${params.length})`;
      }

      sql += ` ORDER BY created_at DESC`;
      const result = await pool.query(sql, params);
      return res.json(result.rows);
    } catch (err) {
      console.warn('DB query failed, using in-memory projects:', err);
    }
  }

  // In-memory filter
  let filtered = [...inMemoryProjects];
  if (faculty_code && faculty_code !== 'ALL') {
    filtered = filtered.filter(p => p.faculty_code === faculty_code);
  }
  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.abstract.toLowerCase().includes(q) ||
      p.project_code.toLowerCase().includes(q)
    );
  }

  res.json(filtered);
});

/**
 * GET /api/v1/projects/:id
 */
projectsRouter.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  if (isDbConnected) {
    try {
      const result = await pool.query(`SELECT * FROM projects WHERE id = $1 OR project_code = $1`, [id]);
      if (result.rows.length > 0) {
        return res.json(result.rows[0]);
      }
    } catch (err) {
      console.warn('DB query failed:', err);
    }
  }

  const proj = inMemoryProjects.find(p => p.id === id || p.project_code === id);
  if (!proj) {
    return res.status(404).json({ error: 'Project not found' });
  }

  res.json(proj);
});

/**
 * POST /api/v1/projects
 */
projectsRouter.post('/', async (req: Request, res: Response) => {
  const newProject = {
    id: `proj-${Date.now()}`,
    project_code: req.body.project_code || `SHU-ORIC-${Date.now().toString().slice(-4)}`,
    title: req.body.title || 'Untitled Research Project',
    faculty: req.body.faculty || 'Faculty of Pharmacy',
    faculty_code: req.body.faculty_code || 'FOP',
    department: req.body.department || 'Pharmaceutics',
    lead_investigator: req.body.lead_investigator || 'Principal Investigator',
    abstract: req.body.abstract || '',
    problem_statement: req.body.problem_statement || '',
    technology_stack: req.body.technology_stack || [],
    development_stage: req.body.development_stage || 'Lab Prototype',
    trl_level: req.body.trl_level || 4,
    erl_level: req.body.erl_level || 5,
    ip_status: req.body.ip_status || 'None',
    target_industries: req.body.target_industries || [],
    commercial_readiness: req.body.commercial_readiness || 'Medium',
    estimated_funding_pkr: req.body.estimated_funding_pkr || 0,
    created_at: new Date().toISOString()
  };

  if (isDbConnected) {
    try {
      await pool.query(
        `INSERT INTO projects (
          project_code, title, faculty, faculty_code, department, lead_investigator,
          abstract, problem_statement, technology_stack, development_stage, trl_level,
          erl_level, ip_status, target_industries, commercial_readiness, estimated_funding_pkr
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          newProject.project_code,
          newProject.title,
          newProject.faculty,
          newProject.faculty_code,
          newProject.department,
          newProject.lead_investigator,
          newProject.abstract,
          newProject.problem_statement,
          JSON.stringify(newProject.technology_stack),
          newProject.development_stage,
          newProject.trl_level,
          newProject.erl_level,
          newProject.ip_status,
          JSON.stringify(newProject.target_industries),
          newProject.commercial_readiness,
          newProject.estimated_funding_pkr
        ]
      );
    } catch (err) {
      console.warn('DB insert failed, stored in memory:', err);
    }
  }

  inMemoryProjects.unshift(newProject);
  res.status(201).json(newProject);
});

/**
 * POST /api/v1/projects/upload
 * Document ingestion: PDF / Word parsing, chunking, and vector indexing
 */
projectsRouter.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { project_id, project_code } = req.body;
    const originalName = req.file.originalname;
    const mimeType = req.file.mimetype;

    // 1. Extract text from PDF or DOCX
    const extractedText = await DocumentParser.extractText(req.file.buffer, mimeType, originalName);

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from document.' });
    }

    // 2. Chunk text
    const chunks = DocumentParser.chunkText(extractedText);

    // 3. Vectorize and store chunks in pgvector
    const indexedCount = await VectorStore.saveChunks(
      chunks,
      originalName,
      project_id,
      project_code
    );

    res.json({
      message: 'Document successfully ingested and indexed into vector memory.',
      documentName: originalName,
      charactersExtracted: extractedText.length,
      chunksCreated: chunks.length,
      chunksVectorized: indexedCount,
      projectCode: project_code || 'General'
    });
  } catch (error: any) {
    console.error('Document ingestion error:', error);
    res.status(500).json({ error: 'Failed to process document: ' + error.message });
  }
});

