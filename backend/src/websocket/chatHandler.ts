import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { aiGateway, ChatRequestPayload } from '../services/aiGateway.js';

export function handleChatConnection(ws: WebSocket) {
  console.log('Client connected to AI Chat WebSocket Stream');

  ws.on('message', async (message: string) => {
    try {
      const data = JSON.parse(message.toString());
      const {
        prompt,
        mode = 'mentoring',
        personaId = 'dr-farooq',
        personaName = 'Dr. Farooq Siddiqui',
        systemPrompt = '',
      } = data;

      if (!prompt || prompt.trim() === '') {
        ws.send(JSON.stringify({ type: 'error', message: 'Prompt cannot be empty.' }));
        return;
      }

      ws.send(JSON.stringify({ type: 'start', personaName }));

      const payload: ChatRequestPayload = {
        prompt,
        mode,
        personaId,
        personaName,
        systemPrompt,
      };

      const fullResponse = await aiGateway.generateResponse(payload);

      // Clean token streaming loop preserving newlines and markdown formatting
      const chunks = fullResponse.split(/(?<=\s)/);
      for (const chunk of chunks) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'chunk', token: chunk }));
        }
        await new Promise((resolve) => setTimeout(resolve, 20));
      }

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'end', fullText: fullResponse }));
      }
    } catch (err) {
      console.error('Error in WebSocket chat handler:', err);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'error', message: 'Failed to generate response.' }));
      }
    }
  });

  ws.on('close', () => console.log('Client disconnected from AI Chat WebSocket Stream'));
}

export function setupChatWebSocket(wss: WebSocketServer): void {
  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const url = req.url || '';
    if (url.startsWith('/api/v1/ws/chat') || url === '/' || !url) {
      handleChatConnection(ws);
    } else {
      ws.close(1008, 'Invalid WebSocket endpoint path');
    }
  });
}
