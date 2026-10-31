import { Router, Request, Response } from 'express';
import { pool, isDbConnected } from '../config/db.js';

export const personasRouter = Router();

const SEED_PERSONAS = [
  {
    id: 'p1',
    slug: 'pharmacy_mentor',
    name: 'Dr. Farooq Siddiqui',
    title: 'Senior Pharmaceutics & Bio-formulation Specialist',
    department: 'Department of Pharmaceutics',
    faculty_code: 'FOP',
    avatar: '💊',
    accent_color: '#38BDF8',
    voice_lang: 'en-US',
    system_prompt: 'You are Dr. Farooq Siddiqui, an expert in pharmaceutical drug formulation, clinical stability, and DRAP regulatory pathways.'
  },
  {
    id: 'p2',
    slug: 'ai_mentor',
    name: 'Prof. Aisha Khan',
    title: 'AI, Embedded Vision & MedTech Mentor',
    department: 'Department of Computer Science',
    faculty_code: 'FCS',
    avatar: '🤖',
    accent_color: '#818CF8',
    voice_lang: 'en-US',
    system_prompt: 'You are Prof. Aisha Khan, guiding students and researchers on AI models, edge computing, computer vision, and IoT systems.'
  },
  {
    id: 'p3',
    slug: 'biomed_mentor',
    name: 'Engr. Tariq Mehmood',
    title: 'Biomedical Devices & Instrumentation Lead',
    department: 'Department of Biomedical Engineering',
    faculty_code: 'FE',
    avatar: '🧬',
    accent_color: '#34D399',
    voice_lang: 'en-US',
    system_prompt: 'You are Engr. Tariq Mehmood, specializing in medical device prototyping, sensor calibration, and ISO 13485 compliance.'
  },
  {
    id: 'p4',
    slug: 'oric_director',
    name: 'Director ORIC',
    title: 'Technology Commercialization & Venture Strategist',
    department: 'Office of Research, Innovation & Commercialization',
    faculty_code: 'ORIC',
    avatar: '🏛️',
    accent_color: '#F59E0B',
    voice_lang: 'en-US',
    system_prompt: 'You are Director ORIC, focused on commercial viability, intellectual property filings, investor ROI, and industrial MoUs.'
  }
];

let inMemoryPersonas = [...SEED_PERSONAS];

/**
 * GET /api/v1/personas
 */
personasRouter.get('/', async (_req: Request, res: Response) => {
  if (isDbConnected) {
    try {
      const result = await pool.query(`SELECT * FROM ai_agent_personas WHERE is_active = TRUE ORDER BY created_at ASC`);
      if (result.rows.length > 0) {
        return res.json(result.rows);
      }
    } catch (err) {
      console.warn('DB query personas failed:', err);
    }
  }

  res.json(inMemoryPersonas);
});

/**
 * POST /api/v1/personas
 */
personasRouter.post('/', async (req: Request, res: Response) => {
  const newPersona = {
    id: `p-${Date.now()}`,
    slug: req.body.slug || `persona_${Date.now()}`,
    name: req.body.name,
    title: req.body.title || 'Academic Mentor',
    department: req.body.department || 'Salim Habib University',
    faculty_code: req.body.faculty_code || 'GEN',
    avatar: req.body.avatar || '🎓',
    accent_color: req.body.accent_color || '#38BDF8',
    voice_lang: req.body.voice_lang || 'en-US',
    system_prompt: req.body.system_prompt || 'You are an academic mentor at Salim Habib University.'
  };

  if (isDbConnected) {
    try {
      await pool.query(
        `INSERT INTO ai_agent_personas (slug, name, title, department, faculty_code, avatar, accent_color, voice_lang, system_prompt)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          newPersona.slug,
          newPersona.name,
          newPersona.title,
          newPersona.department,
          newPersona.faculty_code,
          newPersona.avatar,
          newPersona.accent_color,
          newPersona.voice_lang,
          newPersona.system_prompt
        ]
      );
    } catch (err) {
      console.warn('DB insert persona failed:', err);
    }
  }

  inMemoryPersonas.push(newPersona);
  res.status(201).json(newPersona);
});

