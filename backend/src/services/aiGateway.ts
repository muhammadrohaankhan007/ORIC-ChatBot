import { GoogleGenAI } from '@google/genai';
import { config, loadEnv } from '../config/env.js';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface ProjectContext {
  id?: string;
  project_code?: string;
  title?: string;
  faculty?: string;
  faculty_code?: string;
  department?: string;
  lead_investigator?: string;
  abstract?: string;
  problem_statement?: string;
  technology_stack?: string[] | string;
  development_stage?: string;
  trl_level?: number;
  erl_level?: number;
  ip_status?: string;
  target_industries?: string[] | string;
  commercial_readiness?: string;
  estimated_funding_pkr?: number;
}

export interface ChatRequestPayload {
  prompt: string;
  mode: 'mentoring' | 'analysis' | 'voice';
  personaId: string;
  personaName: string;
  systemPrompt?: string;
  history?: ChatMessage[];
  projectContext?: ProjectContext | null;
  sessionId?: string;
}

export class AIGatewayService {
  private ai: GoogleGenAI | null = null;
  private currentApiKey: string = '';
  // In-memory multi-turn session store (Session ID -> Array of turns)
  private sessionMemory = new Map<string, ChatMessage[]>();

  constructor() {
    this.getClient();
  }

  public getClient(): GoogleGenAI | null {
    let apiKey = process.env.GEMINI_API_KEY || config.ai.geminiApiKey;
    if (!apiKey || apiKey === 'your_actual_gemini_api_key_here') {
      loadEnv();
      apiKey = process.env.GEMINI_API_KEY || config.ai.geminiApiKey;
    }

    if (apiKey && apiKey !== 'your_actual_gemini_api_key_here' && apiKey.trim() !== '') {
      if (!this.ai || this.currentApiKey !== apiKey.trim()) {
        try {
          this.currentApiKey = apiKey.trim();
          this.ai = new GoogleGenAI({ apiKey: this.currentApiKey });
          console.log('[AIGateway] GoogleGenAI client initialized successfully.');
        } catch (err) {
          console.warn('[AIGateway] Failed to initialize GoogleGenAI client:', err);
          return null;
        }
      }
      return this.ai;
    }

    return null;
  }

  public clearSession(sessionId: string): void {
    if (this.sessionMemory.has(sessionId)) {
      this.sessionMemory.delete(sessionId);
    }
  }

  /**
   * Constructs valid multi-turn contents with strict role alternation for the Gemini API
   */
  private buildConversationContents(
    history: ChatMessage[] | undefined,
    currentPrompt: string,
    projectContext?: ProjectContext | null
  ): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
    const formatted: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Format active project context if supplied
    let userTurn = currentPrompt.trim();
    if (projectContext && projectContext.title) {
      const techStack = Array.isArray(projectContext.technology_stack)
        ? projectContext.technology_stack.join(', ')
        : projectContext.technology_stack || 'N/A';
      const targetInd = Array.isArray(projectContext.target_industries)
        ? projectContext.target_industries.join(', ')
        : projectContext.target_industries || 'N/A';

      const projectCard = `[ACTIVE PROJECT CONTEXT:
• Project: ${projectContext.title} (${projectContext.project_code || 'SHU-ORIC'})
• Lead Investigator: ${projectContext.lead_investigator || 'Faculty Researcher'}
• Faculty & Dept: ${projectContext.faculty || ''} - ${projectContext.department || ''}
• Abstract: ${projectContext.abstract || 'N/A'}
• Problem Statement: ${projectContext.problem_statement || 'N/A'}
• Tech Stack: ${techStack}
• TRL Level: ${projectContext.trl_level ?? 'N/A'}/9 | ERL Level: ${projectContext.erl_level ?? 'N/A'}/9
• IP Status: ${projectContext.ip_status || 'N/A'}
• Target Industries: ${targetInd}
• Development Stage: ${projectContext.development_stage || 'N/A'}
• Est. Funding: PKR ${projectContext.estimated_funding_pkr?.toLocaleString() || 'N/A'}]`;

      userTurn = `${projectCard}\n\nResearcher Prompt: ${currentPrompt.trim()}`;
    }

    // Process previous conversation history
    if (history && Array.isArray(history) && history.length > 0) {
      for (const item of history) {
        if (!item.text || !item.text.trim()) continue;

        const rawRole = (item.role || (item as any).sender || '').toLowerCase();
        const role: 'user' | 'model' = rawRole === 'model' || rawRole === 'ai' || rawRole === 'assistant' ? 'model' : 'user';

        if (formatted.length === 0) {
          // Multi-turn conversation must begin with a user turn
          if (role === 'user') {
            formatted.push({ role: 'user', parts: [{ text: item.text.trim() }] });
          }
        } else {
          const last = formatted[formatted.length - 1];
          if (last.role === role) {
            // Merge consecutive messages of the same role
            last.parts[0].text += `\n\n${item.text.trim()}`;
          } else {
            formatted.push({ role, parts: [{ text: item.text.trim() }] });
          }
        }
      }
    }

    // Append the current user prompt
    if (formatted.length > 0 && formatted[formatted.length - 1].role === 'user') {
      formatted[formatted.length - 1].parts[0].text += `\n\n${userTurn}`;
    } else {
      formatted.push({ role: 'user', parts: [{ text: userTurn }] });
    }

    return formatted;
  }

  async generateResponse(payload: ChatRequestPayload): Promise<string> {
    const {
      prompt,
      mode,
      personaName,
      systemPrompt = '',
      history: clientHistory,
      projectContext,
      sessionId = 'default_session',
    } = payload;

    const ai = this.getClient();
    if (!ai) {
      return 'GEMINI_API_KEY is missing in backend/.env. Please add your key to proceed.';
    }

    // Resolve conversation history: Client-passed history takes precedence; fallback to in-memory session store
    let effectiveHistory: ChatMessage[] = [];
    if (clientHistory && Array.isArray(clientHistory) && clientHistory.length > 0) {
      effectiveHistory = clientHistory;
      this.sessionMemory.set(sessionId, [...clientHistory]);
    } else if (this.sessionMemory.has(sessionId)) {
      effectiveHistory = this.sessionMemory.get(sessionId) || [];
    }

    const isVoice = mode === 'voice';

    const voiceSystemInstruction = `You are the ORIC Voice Agent at Salim Habib University (SHU), Karachi, Pakistan.
You are on an active, hands-free spoken phone conversation with a researcher, faculty member, or student.

CRITICAL VOICE CALL RULES:
1. MAX 1 TO 2 NATURAL SPOKEN SENTENCES (strictly under 35 words total). Never speak in paragraphs or long dossiers.
2. ABSOLUTELY ZERO FORMATTING: Do NOT use markdown bolding (**), asterisks (*), headers (###), bullet points (-), numbered lists, emojis, code blocks, or LaTeX math. Return plain natural spoken English words only.
3. CONVERSATIONAL PACING: Be direct, collegial, and warm. Answer the user's specific question using the project context, and conclude with one short, natural follow-up question.
4. SALIM HABIB UNIVERSITY RESEARCH REPOSITORY:
   - Faculty of Pharmacy (FOP): Comprehensive repository of 230+ pharmaceutical research projects spanning Pharmaceutics, Medicinal Chemistry, Pharmacognosy, Pharmacology, and Pharmacy Practice (effervescent formulations, oral dissolving films, ChitoShield biopolymer patches, herbal syrups, date seed polyphenols, medicinal plant fingerprints, and prodrugs).
   - AI Textile Quality Control: Prof. Aisha Khan, YOLOv10 edge AI, TRL 7, Artistic Milliners (KIA).
   - Oncology Nano-carriers: Dr. Farooq Siddiqui, paclitaxel hybrid nanoparticles, TRL 5, Getz Pharma (KIA), DRAP compliance.
   - Glucose Biosensor: Engr. Tariq Mehmood, non-invasive NIR optical sensor, TRL 4, ISO 13485.
   - ESG Carbon Tracking: Dr. Zeeshan Haider, EU CBAM compliance, TRL 8, Pakistani exporters.`;

    const standardSystemInstruction = `You are the ORIC Research Assistant, the authoritative institutional AI advisor for the Office of Research, Innovation & Commercialization (ORIC) at Salim Habib University (SHU), Karachi, Pakistan.

You assist university professors, research scholars, postgraduate students, and commercialization officers across research formulation, grant acquisition, patent filings, and Karachi industry collaborations.

CORE OPERATIONAL PRINCIPLES:
1. CONTINUOUS CONVERSATION MEMORY & COHERENCE:
   - You possess persistent memory across the entire ongoing discussion thread.
   - When the user asks follow-up questions ("tell me more", "how can we validate this", "who was the lead?", "what about the regulatory approval?", "draft an MoU for this", "what is the next milestone?"), seamlessly connect your response to the specific project details, formulas, hardware specs, and company names previously discussed.
   - NEVER start with repetitive greetings ("Hello", "Welcome to ORIC") once the conversation is underway. Dive straight into rigorous, helpful, high-value guidance.
   - Accurately resolve pronouns ("this", "it", "that algorithm", "our previous discussion") using the conversation history.

2. HONEST & PROFESSIONAL IDENTITY:
   - You are an AI assistant developed for SHU ORIC, NOT a human faculty member.
   - Never claim physical locations ("my office", "our laboratory down the hall").
   - Maintain absolute academic rigor, technical depth, and professional respect. Avoid patronizing or fluff phrases.

3. SALIM HABIB UNIVERSITY RESEARCH REPOSITORY:
   - Faculty of Pharmacy (FOP): Comprehensive institutional portfolio of 230+ academic and commercial research initiatives across Pharmaceutics (dosage form science, effervescent formulations, biopolymers, oral dissolving films), Pharmaceutical Chemistry (bioactive syntheses, prodrug design, HPLC assay validation, molecular docking, in-silico screening), Pharmacognosy (phytochemical fingerprint database of Pakistani medicinal plants, polyphenolic extracts, UV/blue-light photoprotective creams), Pharmacology & Therapeutics (mechanisms of drug-induced liver injury, neuroprotection, antidiabetic formulations), and Pharmacy Practice (hospital drug safety, clinical trials, healthcare informatics). Flagship lead: Dr. Farooq Siddiqui (Nanoparticle Drug Delivery System for Targeted Oncology, paclitaxel lipid-polymer hybrid nanoparticles, TRL 5, ERL 6). Focus: DRAP compliance, bioequivalence, lyophilization, cytotoxicity reduction.
   - Faculty of Information Technology (FCS): Prof. Aisha Khan (AI-Powered Computer Vision for Industrial Textile Quality Control, YOLOv10/TensorRT, real-time 120 FPS fabric inspection, TRL 7, ERL 7). Focus: High-speed edge AI, false positive reduction, international export standards.
   - Faculty of Engineering (FE): Engr. Tariq Mehmood (Non-Invasive Continuous Blood Glucose Optical Biosensor, NIR spectroscopy, ARM Cortex-M4, TRL 4, ERL 5). Focus: ISO 13485 medical device standards, non-invasive calibration.
   - Faculty of Management Sciences (FMS): Dr. Zeeshan Haider (Supply Chain Carbon Tracking & ESG Verification Platform, EU CBAM carbon audit compliance, TRL 8, ERL 8). Focus: Green trade compliance, Pakistani exporters.

4. KARACHI INDUSTRIAL RADAR & MANUFACTURING PARTNERS:
   - Korangi Industrial Area (KIA): Artistic Milliners (Textile AI inspection), Getz Pharma (Pvt) Ltd (Nano-formulations, lyophilization), Indus Dyeing, Lucky Core Industries.
   - S.I.T.E. Industrial Area: Ferozsons Laboratories, Gul Ahmed Textile Mills, Al-Karam Textile Mills, Abbott Pakistan.
   - Landhi Industrial Area: Shabbir Tiles & Ceramics, National Foods, Landhi textile and chemical mills.
   - Port Qasim: Engro Polymer & Chemicals, Engro Fertilizers, Lotte Chemical.

5. REGULATORY STANDARDS & IP FRAMEWORKS:
   - DRAP (Drug Regulatory Authority of Pakistan): Drug Act 1976 / DRAP Act 2012, Form-5/6/7 registration, cGMP compliance, clinical trial approvals.
   - PSQCA (Pakistan Standards and Quality Control Authority): Industrial and manufacturing specifications.
   - IPO-Pakistan (Intellectual Property Organization of Pakistan): Patents Ordinance 2000, Form-P1 (provisional specification) and Form-P2 (complete specification). Novelty, inventive step, industrial utility.
   - TRL (Technology Readiness Level 1-9) and ERL (Enterprise Readiness Level 1-9) benchmarking.

6. HIGH-IMPACT RESPONSE STRUCTURE:
   - Answer directly and factually first.
   - Structure complex guidance using markdown bold headings, bullet points, and clear technical parameters.
   - Always conclude substantial technical advice with 1 concrete **Next Technical Milestone** or **Recommended Action** (e.g. testing parameter, draft MoU clause, or grant proposal section).

${systemPrompt ? `ADDITIONAL DOMAIN INSTRUCTION: ${systemPrompt}` : ''}
Focus Specialization: ${personaName || 'General ORIC'}
Interaction Mode: ${mode.toUpperCase()}
Institution: Salim Habib University (SHU), Karachi, Pakistan.`;

    const systemInstruction = isVoice ? voiceSystemInstruction : standardSystemInstruction;

    const contents = this.buildConversationContents(effectiveHistory, prompt, projectContext);
    const model = process.env.GEMINI_MODEL || config.ai.geminiModel || 'gemini-3.5-flash-lite';

    try {
      const response = await ai.models.generateContent({
        model,
        config: {
          systemInstruction,
          temperature: isVoice ? 0.6 : 0.7,
          ...(isVoice ? { maxOutputTokens: 95 } : {}),
        },
        contents,
      });

      let fullResponse = response.text || "I'm sorry, I couldn't generate a response.";
      if (isVoice) {
        fullResponse = fullResponse
          .replace(/[*_#`~>]/g, '')
          .replace(/^\s*[-•]\s*/gm, '')
          .replace(/\s+/g, ' ')
          .trim();
      }

      // Record this turn in the session memory
      effectiveHistory.push({ role: 'user', text: prompt.trim() });
      effectiveHistory.push({ role: 'model', text: fullResponse });
      // Keep within last 50 turns
      if (effectiveHistory.length > 50) {
        effectiveHistory = effectiveHistory.slice(-50);
      }
      this.sessionMemory.set(sessionId, effectiveHistory);

      return fullResponse;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Gemini API Error:', error);

      // Graceful fallback to gemini-3.5-flash-lite if specified model is 404/deprecated
      if (
        model !== 'gemini-3.5-flash-lite' &&
        (error?.status === 404 || error?.message?.includes('not found') || error?.message?.includes('no longer available'))
      ) {
        try {
          console.warn(`[AIGateway] Model ${model} unavailable, falling back to gemini-3.5-flash-lite...`);
          const fallbackResponse = await ai.models.generateContent({
            model: 'gemini-3.5-flash-lite',
            config: {
              systemInstruction,
              temperature: isVoice ? 0.6 : 0.7,
              ...(isVoice ? { maxOutputTokens: 95 } : {}),
            },
            contents,
          });

          let text = fallbackResponse.text || "I'm sorry, I couldn't generate a response.";
          if (isVoice) {
            text = text
              .replace(/[*_#`~>]/g, '')
              .replace(/^\s*[-•]\s*/gm, '')
              .replace(/\s+/g, ' ')
              .trim();
          }
          effectiveHistory.push({ role: 'user', text: prompt.trim() });
          effectiveHistory.push({ role: 'model', text: text });
          this.sessionMemory.set(sessionId, effectiveHistory);
          return text;
        } catch (fallbackError: any) {
          console.error('[AIGateway] Fallback failed:', fallbackError);
        }
      }

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
    history?: ChatMessage[];
    projectContext?: ProjectContext | null;
    sessionId?: string;
    onChunk?: (token: string) => void;
  }): Promise<string> {
    const fullText = await aiGateway.generateResponse({
      prompt: options.prompt,
      mode: options.mode || 'mentoring',
      personaId: options.personaId || 'oric-assistant',
      personaName: options.personaName || 'ORIC Research Assistant',
      systemPrompt: options.systemInstruction,
      history: options.history,
      projectContext: options.projectContext,
      sessionId: options.sessionId,
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
