import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { aiGateway, ChatRequestPayload } from '../services/aiGateway.js';

export function handleChatConnection(ws: WebSocket) {
  // Generate a unique connection-scoped session ID
  const connectionSessionId = `conn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  console.log(`[WebSocket] Client connected (Session ID: ${connectionSessionId})`);

  ws.on('message', async (message: string) => {
    try {
      const data = JSON.parse(message.toString());

      // Allow client to explicitly clear chat memory
      if (data.type === 'clear' || data.type === 'reset') {
        const targetSessionId = data.sessionId || connectionSessionId;
        aiGateway.clearSession(targetSessionId);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'cleared', message: 'Chat memory reset successfully.' }));
        }
        return;
      }

      const {
        prompt,
        message: altMessage,
        mode = 'mentoring',
        personaId = 'oric-assistant',
        personaName = 'ORIC Research Assistant',
        systemPrompt = '',
        history = [],
        projectContext = null,
        sessionId,
      } = data;

      const userText = prompt || altMessage;
      if (!userText || typeof userText !== 'string' || userText.trim() === '') {
        ws.send(JSON.stringify({ type: 'error', message: 'Prompt or message cannot be empty.' }));
        return;
      }

      ws.send(JSON.stringify({ type: 'start', personaName }));

      const payload: ChatRequestPayload = {
        prompt: userText.trim(),
        mode: mode === 'voice' ? 'voice' : (mode === 'analysis' || mode === 'research' ? 'analysis' : 'mentoring'),
        personaId,
        personaName,
        systemPrompt,
        history: Array.isArray(history) ? history : [],
        projectContext,
        sessionId: sessionId || connectionSessionId,
      };

      const fullResponse = await aiGateway.generateResponse(payload);

      // Token streaming loop with both 'token' and 'chunk' event aliases for 100% compatibility
      const chunks = fullResponse.split(/(?<=\s)/);
      for (const chunk of chunks) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'token', token: chunk, chunk }));
        }
        await new Promise((resolve) => setTimeout(resolve, 15));
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

  ws.on('close', () => {
    console.log(`[WebSocket] Client disconnected (Session ID: ${connectionSessionId})`);
  });
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
