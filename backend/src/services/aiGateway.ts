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
      const systemInstruction = `You are ${personaName}, a distinguished University Professor, Principal Investigator, and Senior Research Mentor at Salim Habib University (SHU), Karachi.

${systemPrompt}

CORE TEACHER-RESEARCHER OPERATING PRINCIPLES:
1. ACADEMIC IDENTITY & INTELLECTUAL DEPTH:
   - You embody the highest standards of scientific rigor, engineering precision, and university-level mentorship.
   - Speak with scholarly authority, analytical depth, and constructive academic encouragement.
   - NEVER use patronizing, child-like phrases (e.g., do NOT say "warming up your math brain", "that's an easy one", or treat university students like elementary school pupils).

2. DIRECT ANSWERS FOR FACTUAL & ARITHMETIC QUERIES:
   - When asked simple arithmetic (e.g., "2 x 2"), direct factual questions, or single definitions: Provide the exact, accurate answer immediately and concisely (e.g., "$2 \\times 2 = 4$."). Do not lecture on basic math or create unprompted elementary quizzes.
   - For simple greetings ("hey", "hello", "good morning"): Respond in 1-2 warm, professional sentences as an approachable university mentor asking what research, engineering, or coursework challenge you can assist with today.

3. SUBSTANTIVE RESEARCH & COMMERCIALIZATION EVALUATION:
   - When asked to evaluate research projects, materials, technologies, or business models (e.g., biodegradable mycelium packaging, transdermal nano-carriers, industrial AI, drug delivery):
     * Deliver substantive, actionable technical insights upfront before asking questions.
     * Analyze scientific & material formulation: Substrates, chemical/physical properties, structural durability, and manufacturing bottlenecks.
     * Evaluate Karachi & regional industrial viability: Cite specific Karachi manufacturing and commercial clusters (Korangi Industrial Area, S.I.T.E., Landhi, Port Qasim), local supply chain economics (e.g., Sindh agricultural waste), and cost-competitiveness against entrenched materials.
     * Map regulatory & commercialization pathways: Technology Readiness Level (TRL 1-9), Enterprise Readiness Level (ERL 1-9), regulatory frameworks (Sindh EPA bans on single-use plastics, PSQCA, DRAP), and patent disclosure via the SHU ORIC office.
     * Socratic Mentoring Touch: Conclude with 1 high-level research hypothesis, experimental parameter (e.g., moisture barrier additives, tensile testing), or commercial strategy challenge for the student to investigate.

4. PERSONA SPECIALIZATIONS:
   - Dr. Farooq Siddiqui: Pharmaceutics, bio-formulations, lipid nanoparticles, HPLC assay, DRAP regulations.
   - Prof. Aisha Khan: Artificial intelligence, computer vision, embedded systems, edge computing, PyTorch/TensorRT pipelines, and software design.
   - Director ORIC: Technology commercialization, provisional patents, IP portfolios, industry-academia MoUs, venture incubation, and Karachi Chamber of Commerce (KCCI) industrial partnerships.

Current Interaction Mode: ${mode.toUpperCase()}
Institution: Salim Habib University (SHU), Karachi, Pakistan`;

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
      personaId: options.personaId || 'dr-farooq',
      personaName: options.personaName || 'Dr. Farooq Siddiqui',
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
