import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import { config } from './config/env.js';
import { initDb } from './config/db.js';
import { healthRouter } from './routes/health.js';
import { projectsRouter } from './routes/projects.js';
import { personasRouter } from './routes/personas.js';
import { intelligenceRouter } from './routes/intelligence.js';
import { authRouter } from './routes/auth.js';
import { setupChatWebSocket } from './websocket/chatHandler.js';
import { aiGateway, AiGateway } from './services/aiGateway.js';

const app = express();

// Middlewares
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root & Health routes
app.use('/', healthRouter);
app.use('/api/v1', healthRouter);

// API v1 Routers
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/projects', projectsRouter);
app.use('/api/v1/personas', personasRouter);
app.use('/api/v1/intelligence', intelligenceRouter);

// REST fallback for chat messages (for clients without WebSockets)
app.post('/api/v1/chat/message', async (req: Request, res: Response) => {
  try {
    const promptText = req.body.prompt || req.body.message;
    if (!promptText || typeof promptText !== 'string' || promptText.trim() === '') {
      return res.status(400).json({ error: 'Message or prompt is required' });
    }

    const PERSONA_MAP: Record<string, string> = {
      'oric-assistant': 'ORIC Research Assistant',
      'pharmacy': 'Pharmaceutics & Health Specialization',
      'computing': 'Computing & AI Specialization',
      'biomedical': 'Biomedical Engineering Specialization',
      'commercialization': 'Commercialization & IP Specialization',
      'dr-farooq': 'Pharmaceutics & Health Specialization',
      'prof-aisha': 'Computing & AI Specialization',
      'engr-tariq': 'Biomedical Engineering Specialization',
      'director-oric': 'Commercialization & IP Specialization',
    };

    const rawMode = req.body.mode || 'mentoring';
    const mode = rawMode === 'voice' ? 'voice' : (rawMode === 'research' || rawMode === 'analysis' ? 'analysis' : 'mentoring');
    const personaId = req.body.personaId || req.body.persona_slug || 'oric-assistant';
    const personaName = req.body.personaName || PERSONA_MAP[personaId] || 'ORIC Research Assistant';
    const history = req.body.history || [];
    const projectContext = req.body.projectContext || null;
    const sessionId = req.body.sessionId || 'default_session';

    const response = await aiGateway.generateResponse({
      prompt: promptText.trim(),
      mode,
      personaId,
      personaName,
      systemPrompt: req.body.systemPrompt || '',
      history: Array.isArray(history) ? history : [],
      projectContext,
      sessionId,
    });

    res.json({
      agent: personaName,
      response,
      citations: [
        'Salim Habib University Research Repository (2026)',
        'Pakistan Journal of Pharmaceutical Sciences'
      ],
      suggested_actions: [
        'Run 8D ERL Assessment',
        'Scan Karachi Industry Radar for Partners',
        'Draft Collaborative MoU'
      ]
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to process chat message: ' + err.message });
  }
});

// Reset chat memory endpoint
app.post('/api/v1/chat/clear', (req: Request, res: Response) => {
  const sessionId = req.body.sessionId || 'default_session';
  aiGateway.clearSession(sessionId);
  res.json({ status: 'ok', message: 'Chat memory reset successfully.' });
});

// Create HTTP Server
const server = http.createServer(app);

// Attach WebSocket Server
const wss = new WebSocketServer({ server });
setupChatWebSocket(wss);

// Initialize Database & Start Server
async function startServer() {
  await initDb();

  server.listen(config.port, () => {
    console.log(`
============================================================
  🚀 SHU ORIC AI Multi-Agent Backend Running
  • HTTP Server: http://localhost:${config.port}
  • Health Check: http://localhost:${config.port}/health
  • REST API:     http://localhost:${config.port}/api/v1
  • WebSocket:    ws://localhost:${config.port}/api/v1/ws/chat
  • Environment:  ${config.nodeEnv}
============================================================
    `);
  });
}

// Export app for Vercel Express integration
export default app;

// Start standalone HTTP listener if not running in a Vercel serverless context
if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Fatal error starting server:', err);
    process.exit(1);
  });
} else {
  // In Vercel serverless environment, attempt DB initialization without blocking startup
  initDb().catch((err) => {
    console.warn('Vercel serverless DB initialization notice:', err);
  });
}
