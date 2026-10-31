import { Router, Request, Response } from 'express';
import { isDbConnected } from '../config/db.js';

export const healthRouter = Router();

healthRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    version: '3.0-greenfield',
    runtime: 'Node.js Express TypeScript',
    database: isDbConnected ? 'PostgreSQL 16 + pgvector (Connected)' : 'Resilient In-Memory Mode',
    timestamp: new Date().toISOString()
  });
});

