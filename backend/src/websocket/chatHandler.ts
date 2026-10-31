import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { AiGateway } from '../services/aiGateway.js';
import { VectorStore } from '../services/vectorStore.js';

interface InboundChatMessage {
  session_id?: string;
  message: string;
  mode?: 'conversational' | 'research';
  persona_slug?: string;
  project_code?: string;
}

export function setupChatWebSocket(wss: WebSocketServer): void {
  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const url = req.url || '';
    if (!url.startsWith('/api/v1/ws/chat')) {
      ws.close(1008, 'Invalid WebSocket endpoint path');
      return;
    }

    // Send connection greeting
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'Connected to SHU ORIC Multi-Agent AI Streaming Engine.'
    }));

    ws.on('message', async (raw: string) => {
      try {
        const payload: InboundChatMessage = JSON.parse(raw.toString());
        const userQuery = payload.message?.trim();

        if (!userQuery) {
          ws.send(JSON.stringify({ type: 'error', message: 'Empty query received' }));
          return;
        }

        const isResearch = payload.mode === 'research';
        const projectCode = payload.project_code;

        // 1. Vector similarity search for context
        const relevantChunks = await VectorStore.searchSimilar(userQuery, 3, projectCode);
        const contextText = relevantChunks.map(c => `[Context from ${c.documentName}]: ${c.content}`).join('\n\n');

        // 2. Formulate Prompt
        const systemPrompt = `
You are an expert academic and industrial AI intelligence advisor for Salim Habib University (SHU), Karachi, Pakistan.
Mode: ${isResearch ? 'RESEARCH (Rigorous, evidence-backed, citations, commercialization metrics)' : 'CONVERSATIONAL (Pedagogical, mentoring, encouraging)'}.
${contextText ? `Verified University Knowledge Base:\n${contextText}` : ''}
Guide the user accurately regarding technical feasibility, patents, and Karachi industrial demand (Korangi, SITE, Landhi).
        `.trim();

        ws.send(JSON.stringify({
          type: 'start',
          agent: 'SHU ORIC Agent',
          mode: payload.mode || 'research'
        }));

        // 3. Stream response tokens
        await AiGateway.streamChat({
          prompt: userQuery,
          systemInstruction: systemPrompt,
          onChunk: (token: string) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'chunk',
                token
              }));
            }
          }
        });

        // 4. Send completion with citations
        if (ws.readyState === WebSocket.OPEN) {
          const citations = relevantChunks.map(c => `${c.documentName} (Chunk #${c.chunkIndex})`);
          if (citations.length === 0) {
            citations.push('Salim Habib University ORIC Repository (2026)');
          }

          ws.send(JSON.stringify({
            type: 'done',
            citations,
            suggested_actions: [
              'Run 8D ERL Assessment',
              'Check Karachi Industry Radar for Partners',
              'Draft Collaborative MoU'
            ]
          }));
        }
      } catch (err: any) {
        console.error('WebSocket processing error:', err);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Failed to process AI chat stream: ' + err.message
          }));
        }
      }
    });

    ws.on('close', () => {
      // Clean up session if needed
    });
  });
}

