import { GoogleGenAI } from '@google/genai';
import { config } from '../config/env.js';

export interface ChatRequestPayload {
  prompt: string;
  mode: 'mentoring' | 'analysis';
  personaId: string;
  personaName: string;
  systemPrompt?: string;
}

export class AIGatewayService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || config.ai.geminiApiKey;
    if (apiKey && apiKey !== 'your_actual_gemini_api_key_here' && apiKey.trim() !== '') {
      try {
        this.ai = new GoogleGenAI({ apiKey });
      } catch (err) {
        console.warn('Failed to initialize GoogleGenAI client:', err);
      }
    }
  }

  async generateResponse(payload: ChatRequestPayload): Promise<string> {
    const { prompt, mode, personaName, systemPrompt = '' } = payload;

    if (!this.ai) {
      return 'GEMINI_API_KEY is missing in backend/.env. Please add your key to proceed.';
    }

    try {
      const systemInstruction = `You are the ORIC Research Assistant, an AI system developed for the Office of Research, Innovation & Commercialization (ORIC) at Salim Habib University (SHU), Karachi.

You are an institutional AI tool designed to assist university faculty, researchers, postgraduate scholars, and commercialization officers.

CORE PRINCIPLES:
1. HONEST AI IDENTITY:
   - You are an AI assistant, NOT a human faculty member. Never claim physical locations ("my office", "our laboratory", "walking down the hall").
   - Never say "Welcome to my office" or offer coffee/seats.
   - For simple greetings ("hello", "hey", "good morning", "hi"): Respond in 1 single polite, natural sentence offering assistance with research, patent disclosure, grant proposals, or commercialization.
   - NEVER repeat greetings if the conversation is already underway.

2. RIGOROUS ACADEMIC & TECHNICAL PRECISION:
   - Speak with clarity, scientific precision, and academic professionalism.
   - NEVER use patronizing language (e.g. "warming up your brain", "that's an easy one"). Treat users as university researchers and professionals.
   - Direct factual answers: When asked direct factual, arithmetic, or definitional queries (e.g. "2 x 2", "Define TRL 4"), answer concisely and immediately without fluff.

3. RESEARCH & COMMERCIALIZATION GUIDANCE:
   - When discussing projects, evaluate them systematically:
     * Material and scientific formulation (compounds, engineering bottlenecks, experimental validation).
     * Karachi industrial ecosystem: Specific industrial zones (Korangi Industrial Area, S.I.T.E., Landhi, Port Qasim) and manufacturing partners (Getz Pharma, Searle, Artistic Milliners, Engro, etc.).
     * Regulatory & Standards: DRAP (Drug Regulatory Authority of Pakistan), PSQCA, Sindh EPA regulations, ISO standards.
     * Technology Readiness Level (TRL 1-9) & Enterprise Readiness Level (ERL 1-9).
     * Commercialization: Intellectual Property (IP) disclosure, provisional patents, industry-academia MoUs.
   - Conclude substantive evaluations with 1 actionable technical parameter or next milestone for the researcher.

Current Specialization Area: ${personaName || 'General ORIC'}
Interaction Mode: ${mode.toUpperCase()}
Institution: Salim Habib University (SHU), Karachi, Pakistan.`;

      const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
      const response = await this.ai.models.generateContent({
        model,
        contents: `${systemInstruction}\n\nStudent/Researcher Prompt: ${prompt}`,
      });

      return response.text || "I'm sorry, I couldn't generate a response.";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      return `[Gemini API Error]: ${error.message || 'Failed to call Gemini API'}`;
    }
  }

  /**
   * Generate 1536-dimensional vector embedding for pgvector
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const embedding = new Array(1536).fill(0);
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      embedding[i % 1536] = (embedding[i % 1536] + code / 255.0) % 1.0;
    }
    const norm = Math.sqrt(embedding.reduce((acc, v) => acc + v * v, 0)) || 1;
    return embedding.map((v) => v / norm);
  }
}

export const aiGateway = new AIGatewayService();

/**
 * Backward-compatible helper class for VectorStore and REST controllers
 */
export class AiGateway {
  static async streamChat(options: {
    prompt: string;
    mode?: 'mentoring' | 'analysis';
    personaId?: string;
    personaName?: string;
    systemInstruction?: string;
    onChunk?: (token: string) => void;
  }): Promise<string> {
    const fullText = await aiGateway.generateResponse({
      prompt: options.prompt,
      mode: options.mode || 'mentoring',
      personaId: options.personaId || 'oric-assistant',
      personaName: options.personaName || 'ORIC Research Assistant',
      systemPrompt: options.systemInstruction,
    });

    const words = fullText.split(' ');
    for (let i = 0; i < words.length; i++) {
      const chunk = words[i] + (i === words.length - 1 ? '' : ' ');
      if (options.onChunk) options.onChunk(chunk);
      await new Promise((r) => setTimeout(r, 20));
    }
    return fullText;
  }

  static async generateEmbedding(text: string): Promise<number[]> {
    return aiGateway.generateEmbedding(text);
  }
}
