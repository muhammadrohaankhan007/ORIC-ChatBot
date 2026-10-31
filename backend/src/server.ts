import express, { Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import { config } from './config/env.js';
import { initDb } from './config/db.js';
import { healthRouter } from './routes/health.js';
import { projectsRouter } from './routes/projects.js';
import { personasRouter } from './routes/personas.js';
import { intelligenceRouter } from './routes/intelligence.js';
import { setupChatWebSocket } from './websocket/chatHandler.js';
import { AiGateway } from './services/aiGateway.js';

const app = express();

// Middlewares
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Logging middleware
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root & Health routes
app.use('/', healthRouter);
app.use('/api/v1', healthRouter);

// API v1 Routers
app.use('/api/v1/projects', projectsRouter);
app.use('/api/v1/personas', personasRouter);
app.use('/api/v1/intelligence', intelligenceRouter);

// REST fallback for chat messages (for clients without WebSockets)
app.post('/api/v1/chat/message', async (req: Request, res: Response) => {
  try {
    const { message, mode, persona_slug } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const isResearch = mode === 'research';
    const response = await AiGateway.streamChat({
      prompt: message,
      systemInstruction: `You are an expert AI advisor for Salim Habib University ORIC. Mode: ${isResearch ? 'Research' : 'Conversational'}.`
    });

    res.json({
      agent: persona_slug ? `Dr. Farooq Siddiqui` : 'SHU ORIC Agent',
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

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});

