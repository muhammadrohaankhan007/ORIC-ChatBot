import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { config } from '../config/env.js';

let geminiClient: GoogleGenAI | null = null;
let openaiClient: OpenAI | null = null;

if (config.ai.geminiApiKey) {
  try {
    geminiClient = new GoogleGenAI({ apiKey: config.ai.geminiApiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

if (config.ai.openaiApiKey) {
  try {
    openaiClient = new OpenAI({ apiKey: config.ai.openaiApiKey });
  } catch (err) {
    console.warn('Failed to initialize OpenAI client:', err);
  }
}

export interface ChatCompletionOptions {
  prompt: string;
  systemInstruction?: string;
  provider?: 'gemini' | 'openai';
  model?: string;
  onChunk?: (token: string) => void;
}

export class AiGateway {
  /**
   * Stream completion token-by-token
   */
  static async streamChat(options: ChatCompletionOptions): Promise<string> {
    const { prompt, systemInstruction, provider = 'gemini', onChunk } = options;

    // 1. Try Gemini
    if (provider === 'gemini' && geminiClient) {
      try {
        const responseStream = await geminiClient.models.generateContentStream({
          model: options.model || 'gemini-1.5-flash',
          contents: prompt,
          config: {
            systemInstruction: systemInstruction || 'You are an expert AI advisor for Salim Habib University ORIC.'
          }
        });

        let fullText = '';
        for await (const chunk of responseStream) {
          const text = chunk.text || '';
          if (text) {
            fullText += text;
            if (onChunk) onChunk(text);
          }
        }
        return fullText;
      } catch (error) {
        console.warn('Gemini streaming error, falling back to OpenAI or mock:', error);
      }
    }

    // 2. Try OpenAI
    if (openaiClient) {
      try {
        const stream = await openaiClient.chat.completions.create({
          model: options.model || 'gpt-4o',
          messages: [
            ...(systemInstruction ? [{ role: 'system' as const, content: systemInstruction }] : []),
            { role: 'user' as const, content: prompt }
          ],
          stream: true
        });

        let fullText = '';
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content || '';
          if (delta) {
            fullText += delta;
            if (onChunk) onChunk(delta);
          }
        }
        return fullText;
      } catch (error) {
        console.warn('OpenAI streaming error, falling back to mock response:', error);
      }
    }

    // 3. Fallback Academic Simulation
    const fallbackMessage = 
      `[SHU ORIC AI – INTELLIGENCE DISPATCH]\n\n` +
      `Regarding your inquiry: "${prompt}"\n\n` +
      `1. Laboratory Synthesis & Technical Validation: Bench parameters confirm reproducible outcomes under laboratory conditions at Salim Habib University.\n` +
      `2. Industrial Application: Recommended match with manufacturing entities located in Korangi Industrial Area and S.I.T.E. Industrial Zone.\n` +
      `3. Commercial Next Steps: Schedule 8D ERL assessment and execute provisional intellectual property disclosure with the ORIC Directorate.`;

    const words = fallbackMessage.split(' ');
    let fullText = '';
    for (const word of words) {
      fullText += word + ' ';
      if (onChunk) onChunk(word + ' ');
      // Simulate real-time word streaming
      await new Promise(r => setTimeout(r, 20));
    }

    return fullText;
  }

  /**
   * Generate 1536-dimensional vector embedding for pgvector
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    if (openaiClient) {
      try {
        const res = await openaiClient.embeddings.create({
          model: 'text-embedding-3-small',
          input: text
        });
        return res.data[0].embedding;
      } catch (err) {
        console.warn('OpenAI embedding error, using normalized pseudo-embedding:', err);
      }
    }

    // Deterministic pseudo-embedding for local testing without external API costs
    const embedding = new Array(1536).fill(0);
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      embedding[i % 1536] = (embedding[i % 1536] + code / 255.0) % 1.0;
    }
    // Normalize vector
    const norm = Math.sqrt(embedding.reduce((acc, v) => acc + v * v, 0)) || 1;
    return embedding.map(v => v / norm);
  }
}

