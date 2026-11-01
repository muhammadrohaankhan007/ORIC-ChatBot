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
        message: altMessage,
        mode = 'mentoring',
        personaId = 'oric-assistant',
        personaName = 'ORIC Research Assistant',
        systemPrompt = '',
      } = data;

      const userText = prompt || altMessage;
      if (!userText || typeof userText !== 'string' || userText.trim() === '') {
        ws.send(JSON.stringify({ type: 'error', message: 'Prompt or message cannot be empty.' }));
        return;
      }

      ws.send(JSON.stringify({ type: 'start', personaName }));

      const payload: ChatRequestPayload = {
        prompt: userText.trim(),
        mode: mode === 'analysis' || mode === 'research' ? 'analysis' : 'mentoring',
        personaId,
        personaName,
        systemPrompt,
      };

      const fullResponse = await aiGateway.generateResponse(payload);

      // Token streaming loop with both 'token' and 'chunk' event aliases for 100% compatibility
      const chunks = fullResponse.split(/(?<=\s)/);
      for (const chunk of chunks) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'token', token: chunk, chunk }));
        }
        await new Promise((resolve) => setTimeout(resolve, 20));
      }

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'done', fullText: fullResponse, message: fullResponse, token: '', end: true }));
      }
    } catch (err: any) {
      console.error('Error in WebSocket chat handler:', err);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'error', message: err?.message || 'Failed to generate response.' }));
      }
    }
  });

  ws.on('close', () => console.log('Client disconnected from AI Chat WebSocket Stream'));
}

export function setupChatWebSocket(wss: WebSocketServer): void {
  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const url = req.url || '';
    if (url.startsWith('/api/v1/ws/chat') || url.startsWith('/ws') || url.startsWith('/api/ws') || url === '/' || !url) {
      handleChatConnection(ws);
    } else {
      ws.close(1008, 'Invalid WebSocket endpoint path');
    }
  });
}
