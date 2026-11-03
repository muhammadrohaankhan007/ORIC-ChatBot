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
 * Clean markdown symbols, LaTeX math, URLs, and code blocks into natural, spoken English prose.
 */
export function cleanTextForSpeech(text: string): string {
  return text
    .replace(/\$\$([\s\S]*?)\$\$/g, '$1') // block math
    .replace(/\$(.*?)\$/g, '$1') // inline math
    .replace(/\\times/g, ' times ')
    .replace(/\\circ/g, ' degrees ')
    .replace(/\\text\{(.*?)\}/g, '$1')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // links: keep readable label
    .replace(/https?:\/\/\S+/g, '') // raw urls
    .replace(/#{1,6}\s+/g, '') // headers
    .replace(/[*_~`]/g, '') // markdown bold/italics/code
    .replace(/^\s*[-*+]\s+/gm, '') // bullet lists
    .replace(/^\s*\d+\.\s+/gm, '') // numbered lists
    .replace(/>\s+/g, '') // blockquotes
    .replace(/\|/g, ' ') // table pipes
    .replace(/\n+/g, '. ') // line breaks become natural pauses
    .replace(/\s+/g, ' ')
    .trim();
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
  dialectCode: string = 'en-US',
  voices: SpeechSynthesisVoice[] = [],
  preferredVoiceName?: string,
  personaName?: string
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  if (preferredVoiceName) {
    const found = voices.find((v) => v.name === preferredVoiceName);
    if (found) return found;
  }

  const normalized = dialectCode.toLowerCase().replace('_', '-');
  const langPrefix = normalized.split('-')[0];

  // 1. Strict exact dialect match (e.g. en-gb, en-us, en-in, ur-pk)
  const exactMatches = voices.filter((v) =>
    v.lang.toLowerCase().replace('_', '-').startsWith(normalized)
  );

  // 2. Fallback to same language family (e.g. en-*)
  const langMatches =
    exactMatches.length > 0
      ? exactMatches
      : voices.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(langPrefix));

  const pool = langMatches.length > 0 ? langMatches : voices;

  const isFemale = (personaName || '').toLowerCase().includes('aisha');

  // Search natural/neural voices
  const natural = pool.filter((v) => /natural|neural|online|google/i.test(v.name));
  if (isFemale) {
    const female = (natural.length > 0 ? natural : pool).find((v) =>
      /female|jenny|aria|sonia|ava|victoria|clara|samantha|zira/i.test(v.name)
    );
    if (female) return female;
  } else {
    const male = (natural.length > 0 ? natural : pool).find((v) =>
      /male|guy|christopher|ryan|brian|george|arthur|david|daniel/i.test(v.name)
    );
    if (male) return male;
  }

  if (natural.length > 0) return natural[0];
  return pool[0] || null;
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
