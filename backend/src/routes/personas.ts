import { Router, Request, Response } from 'express';
import { pool, isDbConnected } from '../config/db.js';

export const personasRouter = Router();

const SEED_PERSONAS = [
  {
    id: 'p1',
    slug: 'pharmacy',
    name: 'Pharmaceutics & Health',
    title: 'Drug Formulation, Clinical Stability & DRAP Compliance',
    department: 'Faculty of Pharmacy (FOP)',
    faculty_code: 'FOP',
    avatar: 'PH',
    accent_color: '#DC2626',
    voice_lang: 'en-US',
    system_prompt: 'Guidance on pharmaceutical drug formulations, nano-carriers, stability assays, and DRAP regulatory clearances.'
  },
  {
    id: 'p2',
    slug: 'computing',
    name: 'Computing & AI',
    title: 'Computer Vision, Edge Systems & Software Architecture',
    department: 'Faculty of Computer Science (FCS)',
    faculty_code: 'FCS',
    avatar: 'CS',
    accent_color: '#DC2626',
    voice_lang: 'en-US',
    system_prompt: 'Guidance on artificial intelligence architectures, machine learning models, embedded vision, and data pipelines.'
  },
  {
    id: 'p3',
    slug: 'biomedical',
    name: 'Biomedical Engineering',
    title: 'Medical Devices, Instrumentation & Sensor Systems',
    department: 'Faculty of Engineering (FE)',
    faculty_code: 'FE',
    avatar: 'BM',
    accent_color: '#DC2626',
    voice_lang: 'en-US',
    system_prompt: 'Guidance on biomedical instrumentation, wearable biosensors, hardware prototyping, and ISO 13485 compliance.'
  },
  {
    id: 'p4',
    slug: 'commercialization',
    name: 'Commercialization & IP',
    title: 'Patent Strategy, ERL Assessment & Industry MoUs',
    department: 'ORIC Directorate',
    faculty_code: 'ORIC',
    avatar: 'IP',
    accent_color: '#DC2626',
    voice_lang: 'en-US',
    system_prompt: 'Guidance on patentability, IP licensing, Enterprise Readiness Levels (ERL 1-9), and Karachi industrial MoUs.'
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

