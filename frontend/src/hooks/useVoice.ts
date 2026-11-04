import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseVoiceOptions {
  onTranscriptChange?: (transcript: string) => void;
  onTranscript?: (transcript: string) => void;
  lang?: string;
  defaultMuted?: boolean;
}

export const stopSpeechImmediately = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.pause();
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      window.speechSynthesis.cancel();
    } catch {
      // Ignore browser speech abort errors
    }
  }
};

/**
 * Advanced Phonetic & Semantic Speech Preprocessor for Natural Conversational Audio.
 * Converts academic acronyms, abbreviations, currency, medical dosage forms,
 * chemical notation, and numbers into fluid, human-spoken English.
 * Eliminates robotic "reading" of raw symbols, letters, and codes to ensure natural Gemini-like pronunciation.
 */
export function phoneticTextAnalysisForSpeech(text: string): string {
  if (!text) return "";

  let t = text;

  // 1. Remove Markdown syntax, LaTeX math, code, URLs, and block quotes
  t = t
    .replace(/\$\$([\s\S]*?)\$\$/g, "$1")
    .replace(/\$(.*?)\$/g, "$1")
    .replace(/\\times/g, " times ")
    .replace(/\\circ/g, " degrees ")
    .replace(/\\text\{(.*?)\}/g, "$1")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/#{1,6}\s+/g, "")
    .replace(/[*_~\`]/g, "")
    .replace(/^\s*[-*+•]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/>\s+/g, "")
    .replace(/\|/g, " ");

  // 2. Academic & Professional Titles & Honorifics
  t = t
    .replace(/\bDr\.\s*/gi, "Doctor ")
    .replace(/\bProf\.\s*/gi, "Professor ")
    .replace(/\bEngr\.\s*/gi, "Engineer ")
    .replace(/\bMr\.\s*/gi, "Mister ")
    .replace(/\bMs\.\s*/gi, "Miss ")
    .replace(/\bMrs\.\s*/gi, "Missus ");

  // 3. Institutional & Campus Acronyms (Make speech synth pronounce them correctly)
  t = t
    .replace(/\bORIC\b/g, "O-rick")
    .replace(/\bSHU\b/g, "S-H-U")
    .replace(/\bFoP\b|\bFOP\b/g, "Faculty of Pharmacy")
    .replace(/\bFCS\b/g, "Faculty of Computer Science")
    .replace(/\bFE\b(?=\s+Faculty|\s+Dept|\s+Department|\s+students)/gi, "Faculty of Engineering")
    .replace(/\bFMS\b/g, "Faculty of Management Sciences")
    .replace(/\bHEC\b/g, "H-E-C")
    .replace(/\bKATI\b/g, "Kah-tee")
    .replace(/\bLATI\b/g, "Lah-tee")
    .replace(/\bSITE\b|\bS\.I\.T\.E\.\b/gi, "SITE")
    .replace(/\bPCSIR\b/g, "P-C-S-I-R")
    .replace(/\bTDAP\b/g, "T-D-A-P")
    .replace(/\bPPMA\b/g, "P-P-M-A")
    .replace(/\bSBP\b/g, "State Bank of Pakistan")
    .replace(/\bPBS\b/g, "Pakistan Bureau of Statistics");

  // 4. Technology Readiness & Maturity Levels
  t = t
    .replace(/\bTRL\s*([0-9])\s*\/\s*9\b/gi, "T-R-L level $1 of 9")
    .replace(/\bTRL\s*([0-9])\b/gi, "T-R-L level $1")
    .replace(/\bTRL\b/g, "T-R-L")
    .replace(/\bERL\s*([0-9])\s*\/\s*9\b/gi, "E-R-L level $1 of 9")
    .replace(/\bERL\s*([0-9])\b/gi, "E-R-L level $1")
    .replace(/\bERL\b/g, "E-R-L");

  // 5. Regulatory, IP & Industry Terms
  t = t
    .replace(/\bDRAP\b/g, "D-RAP")
    .replace(/\bIPO\b/g, "I-P-O")
    .replace(/\bPSQCA\b/g, "P-S-Q-C-A")
    .replace(/\bMoU\b|\bMOU\b/g, "Memorandum of Understanding")
    .replace(/\bFastAPI\b/gi, "Fast A-P-I")
    .replace(/\bPostgreSQL\b/gi, "Postgres Q-L")
    .replace(/\bYOLOv10\b/gi, "Yolo version 10")
    .replace(/\bYOLOv([0-9]+)\b/gi, "Yolo version $1")
    .replace(/\bAPI\b/g, "A-P-I")
    .replace(/\bAPIs\b/g, "A-P-Is")
    .replace(/\bAI\b/g, "A-I")
    .replace(/\bNIR\b/g, "Near Infrared")
    .replace(/\bHPLC\b/g, "H-P-L-C")
    .replace(/\bCBAM\b/g, "C-BAM")
    .replace(/\bESG\b/g, "E-S-G")
    .replace(/\bGHG\b/g, "Greenhouse Gas")
    .replace(/\bISO\s*([0-9]+)\b/gi, "I-S-O $1")
    .replace(/\bSaaS\b/g, "Software as a service")
    .replace(/\bTAM\b/g, "Total Addressable Market")
    .replace(/\bSAM\b/g, "Serviceable Addressable Market")
    .replace(/\bSOM\b/g, "Serviceable Obtainable Market")
    .replace(/\bCO2\b|CO₂/g, "C-O-2")
    .replace(/\bFPS\b/g, "frames per second")
    .replace(/\bCAGR\b/g, "compound annual growth rate");

  // 6. Currencies & Financial Values
  t = t
    .replace(/\bPKR\s*([0-9,]+(?:\.[0-9]+)?)\s*(?:Billion|B)\b/gi, "$1 billion rupees")
    .replace(/\bPKR\s*([0-9,]+(?:\.[0-9]+)?)\s*(?:Million|M)\b/gi, "$1 million rupees")
    .replace(/\bPKR\s*([0-9,]+(?:\.[0-9]+)?)\s*(?:K|Thousand)\b/gi, "$1 thousand rupees")
    .replace(/\bPKR\s*([0-9,]+)\b/gi, (match, numStr) => {
      const num = parseInt(numStr.replace(/,/g, ""), 10);
      if (isNaN(num)) return match;
      if (num >= 1000000000) return (num / 1000000000).toFixed(1) + " billion rupees";
      if (num >= 1000000) return (num / 1000000).toFixed(1) + " million rupees";
      if (num >= 1000) return (num / 1000).toFixed(0) + " thousand rupees";
      return num + " rupees";
    })
    .replace(/\$\s*([0-9,]+(?:\.[0-9]+)?)\s*(?:Billion|B)\b/gi, "$1 billion dollars")
    .replace(/\$\s*([0-9,]+(?:\.[0-9]+)?)\s*(?:Million|M)\b/gi, "$1 million dollars")
    .replace(/\$\s*([0-9,]+(?:\.[0-9]+)?)\s*(?:K|Thousand)\b/gi, "$1 thousand dollars")
    .replace(/\$\s*([0-9,]+(?:\.[0-9]+)?)\b/g, "$1 dollars");

  // 7. Scientific & Engineering Units
  t = t
    .replace(/\bmg\/dL\b/gi, "milligrams per deciliter")
    .replace(/\bµm\b|um\b/gi, "micrometers")
    .replace(/\bnm\b/gi, "nanometers")
    .replace(/\bkg\b/gi, "kilograms")
    .replace(/\bmg\b/gi, "milligrams")
    .replace(/\bml\b|\bmL\b/g, "milliliters")
    .replace(/\bw\/v\b/gi, "weight by volume")
    .replace(/\bv\/v\b/gi, "volume by volume")
    .replace(/\bpH\s*([0-9]+(?:\.[0-9]+)?)\b/gi, "p-H $1");

  // 8. Latin & Common Literary Abbreviations
  t = t
    .replace(/\be\.g\.,?\s*/gi, "for example, ")
    .replace(/\bi\.e\.,?\s*/gi, "that is, ")
    .replace(/\betc\.\s*/gi, "et cetera, ")
    .replace(/\bvs\.\s*|\bvs\s+/gi, "versus ")
    .replace(/\band\/or\b/gi, "and or ")
    .replace(/\bNo\.\s*([0-9]+)\b|\bno\.\s*([0-9]+)\b/gi, "number $1")
    .replace(/([0-9]+)%/g, "$1 percent");

  // 9. Clean up Project Identifiers & Parenthetical Clutter
  t = t
    .replace(/\(SHU-[A-Z0-9\-]+\)/gi, "")
    .replace(/SHU-[A-Z0-9\-]+/gi, "")
    .replace(/\(\s*TRL\s*[0-9\/\s,]+\s*,\s*ERL\s*[0-9\/\s,]+\s*\)/gi, "")
    .replace(/Project\s+0*([0-9]+)\s*[-:–—]\s*/gi, "Project $1: ")
    .replace(/\(([^)]+)\)/g, ", $1, ");

  // 10. Natural Pacing, Micro-Pauses & Punctuation
  t = t
    .replace(/[:;]\s*/g, ", ")
    .replace(/\//g, " or ")
    .replace(/[—–]/g, ", ")
    .replace(/\.{2,}/g, ".")
    .replace(/,{2,}/g, ",")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\n+/g, ". ")
    .replace(/\s+/g, " ")
    .trim();

  return t;
}

/**
 * Backward-compatible wrapper that cleans text and applies phonetic speech analysis.
 */
export function cleanTextForSpeech(text: string): string {
  return phoneticTextAnalysisForSpeech(text);
}

/**
 * Group text into fluid, natural paragraph chunks (200-280 chars) for seamless Web Speech API delivery.
 * Eliminates Chrome's 15-second hang and prevents mid-word stutters.
 */
export function chunkForSmoothSpeech(cleanText: string): string[] {
  if (cleanText.length <= 260) return [cleanText];

  const sentences = cleanText.match(/[^.!?]+[.!?]+(?:\s|$)/g) || [cleanText];
  const chunks: string[] = [];
  let current = '';

  for (const s of sentences) {
    const candidate = (current ? current + ' ' : '') + s.trim();
    if (candidate.length < 240) {
      current = candidate;
    } else {
      if (current) chunks.push(current);
      current = s.trim();
    }
  }
  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [cleanText];
}

/**
 * Select the highest-fidelity, most natural, human-sounding voice available in the browser.
 */
export interface VoiceDialect {
  code: string;
  label: string;
  flag: string;
  shortLabel: string;
}

export const VOICE_DIALECTS: VoiceDialect[] = [
  { code: 'en-US', label: 'English (United States)', flag: '🇺🇸', shortLabel: 'US English' },
  { code: 'en-GB', label: 'English (United Kingdom)', flag: '🇬🇧', shortLabel: 'UK English' },
  { code: 'en-IN', label: 'English (Pakistan / South Asia)', flag: '🇵🇰', shortLabel: 'Pakistani / South Asian' },
  { code: 'en-AU', label: 'English (Australia)', flag: '🇦🇺', shortLabel: 'Australian' },
  { code: 'en-CA', label: 'English (Canada)', flag: '🇨🇦', shortLabel: 'Canadian' },
  { code: 'ur-PK', label: 'Urdu (Pakistan)', flag: '🇵🇰', shortLabel: 'Urdu' },
];

/**
 * Select the best voice matching a specific dialect / accent code.
 */
export function selectVoiceForDialect(
  dialectCode: string = "en-US",
  voices: SpeechSynthesisVoice[] = [],
  preferredVoiceName?: string,
  personaName?: string
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  // 1. Honor explicit user choice from the dropdown
  if (preferredVoiceName) {
    const found = voices.find((v) => v.name === preferredVoiceName);
    if (found) return found;
  }

  const normalized = dialectCode.toLowerCase().replace("_", "-");
  const langPrefix = normalized.split("-")[0];
  const isFemale = (personaName || "").toLowerCase().includes("aisha");

  // 2. Score each candidate voice based on human naturalness
  const scoreVoice = (v: SpeechSynthesisVoice): number => {
    let score = 0;
    const name = v.name.toLowerCase();
    const lang = v.lang.toLowerCase().replace("_", "-");

    // Language / Dialect Match
    if (lang === normalized) {
      score += 120;
    } else if (lang.startsWith(normalized)) {
      score += 100;
    } else if (lang.startsWith(langPrefix)) {
      score += 50;
    } else {
      score -= 60;
    }

    // Top Tier: Microsoft Online (Natural) Neural Voices (Edge / Windows 11)
    if (name.includes("online (natural)") || name.includes("neural")) {
      score += 160;
    }

    // Tier 2: Google Chrome natural voices
    if (name.includes("google")) {
      score += 110;
    }

    // Tier 3: Apple / Premium / Natural
    if (name.includes("natural") || name.includes("premium")) {
      score += 70;
    }

    // Gender / persona matching
    if (isFemale) {
      if (/jenny|aria|sonia|ava|emma|clara|victoria|zira|female/i.test(name)) {
        score += 40;
      }
    } else {
      if (/guy|ryan|christopher|brian|prabhat|neerja|male|george|arthur/i.test(name)) {
        score += 40;
      }
    }

    // Strongly penalize legacy robotic desktop SAPI voices (Microsoft David, Mark, Hazel)
    if (name.includes("desktop") || name.includes("microsoft david") || name.includes("microsoft mark")) {
      score -= 90;
    }

    return score;
  };

  const sorted = [...voices].sort((a, b) => scoreVoice(b) - scoreVoice(a));
  return sorted[0] || voices[0] || null;
}

export function selectBestVoice(
  personaName?: string,
  voices: SpeechSynthesisVoice[] = [],
  preferredVoiceName?: string
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  if (preferredVoiceName) {
    const found = voices.find((v) => v.name === preferredVoiceName);
    if (found) return found;
  }

  const pLower = (personaName || '').toLowerCase();
  const isFemale = pLower.includes('aisha');

  const englishVoices = voices.filter((v) => v.lang.startsWith('en'));
  const candidatePool = englishVoices.length > 0 ? englishVoices : voices;

  const naturalVoices = candidatePool.filter((v) =>
    /natural|neural|online|google/i.test(v.name)
  );

  if (isFemale) {
    const bestFemale = naturalVoices.find((v) =>
      /jenny|aria|sonia|ava|female|victoria|clara/i.test(v.name)
    );
    if (bestFemale) return bestFemale;

    const fallbackFemale = candidatePool.find((v) =>
      /zira|female|samantha|karen/i.test(v.name)
    );
    if (fallbackFemale) return fallbackFemale;
  } else {
    const bestMale = naturalVoices.find((v) =>
      /guy|christopher|ryan|brian|male|george|arthur/i.test(v.name)
    );
    if (bestMale) return bestMale;

    const fallbackMale = candidatePool.find((v) =>
      /david|male|daniel|alex|oliver/i.test(v.name)
    );
    if (fallbackMale) return fallbackMale;
  }

  if (naturalVoices.length > 0) return naturalVoices[0];
  return candidatePool[0] || voices[0] || null;
}

export const useVoice = (options?: UseVoiceOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);

  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [speechSpeed, setSpeechSpeed] = useState(1.0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');

  // Internal playback refs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');
  const keepaliveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksQueueRef = useRef<string[]>([]);
  const activeMessageIdRef = useRef<string | null>(null);
  const activePersonaNameRef = useRef<string | undefined>(undefined);
  const isSpeechAbortedRef = useRef(false);

  // Load voices dynamically
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        setAvailableVoices(v);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Load user preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('shu_oric_voice_muted');
      const muted = savedMute !== null ? savedMute === 'true' : false;
      setIsMuted(muted);
      isMutedRef.current = muted;

      const savedVoice = localStorage.getItem('shu_oric_preferred_voice');
      if (savedVoice) setSelectedVoiceName(savedVoice);

      const savedSpeed = localStorage.getItem('shu_oric_speech_speed');
      if (savedSpeed) {
        const parsed = parseFloat(savedSpeed);
        if (!isNaN(parsed) && parsed >= 0.75 && parsed <= 2.0) {
          setSpeechSpeed(parsed);
        }
      }
    }
  }, []);

  // Speech-to-Text Setup
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = options?.lang || 'en-US';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      const combinedText = (finalTranscriptRef.current + interim).trim();

      if (options?.onTranscriptChange) {
        options.onTranscriptChange(combinedText);
      }
      if (options?.onTranscript) {
        options.onTranscript(combinedText);
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        // Ignore stop errors
      }
    };
  }, [options]);

  const startListening = useCallback((initialPrefix = '') => {
    if (recognitionRef.current && !isListening) {
      finalTranscriptRef.current = initialPrefix ? initialPrefix.trim() + ' ' : '';
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Error starting speech recognition:', err);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Error stopping speech recognition:', err);
      } finally {
        setIsListening(false);
      }
    }
  }, [isListening]);

  const stopKeepalive = useCallback(() => {
    if (keepaliveTimerRef.current) {
      clearInterval(keepaliveTimerRef.current);
      keepaliveTimerRef.current = null;
    }
  }, []);

  const startKeepalive = useCallback(() => {
    stopKeepalive();
    keepaliveTimerRef.current = setInterval(() => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }
    }, 8000);
  }, [stopKeepalive]);

  // Seamless low-latency chunk player
  const playChunkAtIndex = useCallback(
    (index: number) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      if (isSpeechAbortedRef.current) return;

      const queue = chunksQueueRef.current;
      if (index >= queue.length) {
        setCurrentlySpeakingId(null);
        stopKeepalive();
        return;
      }

      const chunk = queue[index];
      const utterance = new SpeechSynthesisUtterance(chunk);

      const voicesPool =
        availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
      const bestVoice = selectBestVoice(
        activePersonaNameRef.current,
        voicesPool,
        selectedVoiceName
      );

      if (bestVoice) {
        utterance.voice = bestVoice;
        utterance.lang = bestVoice.lang;
      }

      const pLower = (activePersonaNameRef.current || '').toLowerCase();
      const isFemale = pLower.includes('aisha');

      utterance.rate = speechSpeed;
      utterance.pitch = isFemale ? 1.02 : 0.98;

      utterance.onend = () => {
        if (!isSpeechAbortedRef.current) {
          playChunkAtIndex(index + 1);
        }
      };

      utterance.onerror = (e) => {
        if (e.error === 'interrupted' || e.error === 'canceled') return;
        if (!isSpeechAbortedRef.current) {
          playChunkAtIndex(index + 1);
        }
      };

      window.speechSynthesis.speak(utterance);
    },
    [availableVoices, selectedVoiceName, speechSpeed, stopKeepalive]
  );

  /**
   * Seamless Speech Output:
   * Starts instantly without clunky UI cards or robotic pauses.
   */
  const speakText = useCallback(
    (text: string, force = false, messageId?: string, personaName?: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      // If user clicks Listen on the currently speaking message, stop it!
      if (currentlySpeakingId && messageId && currentlySpeakingId === messageId) {
        stopSpeaking();
        return;
      }

      // Hard Guard: If muted and not explicitly triggered by user clicking "Listen"
      if (isMutedRef.current && !force) {
        stopSpeechImmediately();
        setCurrentlySpeakingId(null);
        stopKeepalive();
        return;
      }

      stopSpeechImmediately();
      stopKeepalive();
      isSpeechAbortedRef.current = false;

      const cleaned = cleanTextForSpeech(text);
      if (!cleaned) {
        setCurrentlySpeakingId(null);
        return;
      }

      const chunks = chunkForSmoothSpeech(cleaned);
      chunksQueueRef.current = chunks;
      activeMessageIdRef.current = messageId || Date.now().toString();
      activePersonaNameRef.current = personaName;

      setCurrentlySpeakingId(activeMessageIdRef.current);
      startKeepalive();
      playChunkAtIndex(0);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentlySpeakingId, playChunkAtIndex, startKeepalive, stopKeepalive]
  );

  const stopSpeaking = useCallback(() => {
    isSpeechAbortedRef.current = true;
    chunksQueueRef.current = [];
    stopKeepalive();
    stopSpeechImmediately();
    setCurrentlySpeakingId(null);
  }, [stopKeepalive]);

  const toggleMute = useCallback(() => {
    const nextState = !isMutedRef.current;
    isMutedRef.current = nextState;
    setIsMuted(nextState);

    if (typeof window !== 'undefined') {
      localStorage.setItem('shu_oric_voice_muted', String(nextState));
    }

    if (nextState) {
      stopSpeaking();
    }
  }, [stopSpeaking]);

  const changePreferredVoice = useCallback((voiceName: string) => {
    setSelectedVoiceName(voiceName);
    if (typeof window !== 'undefined') {
      localStorage.setItem('shu_oric_preferred_voice', voiceName);
    }
  }, []);

  const changeSpeechSpeed = useCallback((newSpeed: number) => {
    setSpeechSpeed(newSpeed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('shu_oric_speech_speed', String(newSpeed));
    }
  }, []);

  return {
    isListening,
    isMuted,
    currentlySpeakingId,
    speechSpeed,
    availableVoices,
    selectedVoiceName,
    startListening,
    stopListening,
    speakText,
    speak: speakText,
    stopSpeaking,
    toggleMute,
    changePreferredVoice,
    changeSpeechSpeed,
    isSupported:
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window),
  };
};

export default useVoice;
