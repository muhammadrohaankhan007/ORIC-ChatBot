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
 * Select the highest-fidelity, most natural, human-sounding voice available in the browser.
 * Prioritizes Modern Neural & Natural online voices (Edge Natural, Google Neural/Natural)
 * and matches the active Virtual Teacher persona.
 */
export function selectBestVoice(
  personaName?: string,
  voices: SpeechSynthesisVoice[] = [],
  preferredVoiceName?: string
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  // 1. If user explicitly picked a voice by name, use it
  if (preferredVoiceName) {
    const found = voices.find((v) => v.name === preferredVoiceName);
    if (found) return found;
  }

  const isFemale = personaName?.toLowerCase().includes('aisha');

  // Filter English voices
  const englishVoices = voices.filter((v) => v.lang.startsWith('en'));
  const candidatePool = englishVoices.length > 0 ? englishVoices : voices;

  // Modern Neural / Natural voices (Edge Natural & Google voices have highest realism)
  const naturalVoices = candidatePool.filter((v) =>
    /natural|neural|online|google/i.test(v.name)
  );

  if (isFemale) {
    // Top-tier female neural voices
    const bestFemale = naturalVoices.find((v) =>
      /jenny|aria|sonia|ava|female|victoria|clara/i.test(v.name)
    );
    if (bestFemale) return bestFemale;

    const fallbackFemale = candidatePool.find((v) =>
      /zira|female|samantha|karen/i.test(v.name)
    );
    if (fallbackFemale) return fallbackFemale;
  } else {
    // Top-tier male neural voices for Dr. Farooq Siddiqui & Director ORIC
    const bestMale = naturalVoices.find((v) =>
      /guy|christopher|ryan|brian|male|george|arthur/i.test(v.name)
    );
    if (bestMale) return bestMale;

    const fallbackMale = candidatePool.find((v) =>
      /david|male|daniel|alex|oliver/i.test(v.name)
    );
    if (fallbackMale) return fallbackMale;
  }

  // Fallback to any natural English neural voice
  if (naturalVoices.length > 0) return naturalVoices[0];

  // Default fallback English voice
  return candidatePool[0] || voices[0] || null;
}

export const useVoice = (options?: UseVoiceOptions) => {
  const [isListening, setIsListening] = useState(false);
  // Default to muted (true) so the AI never unexpectedly speaks out loud on typed messages
  const [isMuted, setIsMuted] = useState(true);
  const isMutedRef = useRef(true);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');

  // Load voices dynamically with onvoiceschanged support
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

  // Load user preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('shu_oric_voice_muted');
      const muted = savedMute !== null ? savedMute === 'true' : true;
      setIsMuted(muted);
      isMutedRef.current = muted;

      const savedVoice = localStorage.getItem('shu_oric_preferred_voice');
      if (savedVoice) {
        setSelectedVoiceName(savedVoice);
      }
    }
  }, []);

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
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      const combinedText = (finalTranscriptRef.current + interimTranscript).trim();
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
  }, [options]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      finalTranscriptRef.current = '';
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
        setIsListening(false);
      } catch (err) {
        console.error('Error stopping speech recognition:', err);
      }
    }
  }, [isListening]);

  const speakText = useCallback(
    (text: string, force = false, messageId?: string, personaName?: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      // Hard Guard: If muted and not explicitly triggered by user clicking "Listen"
      if (isMutedRef.current && !force) {
        stopSpeechImmediately();
        setCurrentlySpeakingId(null);
        return;
      }

      // Cancel existing audio stream before queuing new utterance
      stopSpeechImmediately();

      const cleanText = text
        .replace(/[*#_`~]/g, '') // remove markdown symbols
        .replace(/\[.*?\]\(.*?\)/g, '') // remove links
        .replace(/https?:\/\/\S+/g, '') // remove raw urls
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Select best natural/neural voice
      const voicesPool = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
      const bestVoice = selectBestVoice(personaName, voicesPool, selectedVoiceName);

      if (bestVoice) {
        utterance.voice = bestVoice;
        utterance.lang = bestVoice.lang;
      }

      const isFemale = personaName?.toLowerCase().includes('aisha');

      // Humanized, scholarly cadence settings (0.95 eliminates rushed robotic tone)
      utterance.rate = 0.95;
      utterance.pitch = isFemale ? 1.03 : 0.98;

      if (messageId) {
        setCurrentlySpeakingId(messageId);
      }

      utterance.onend = () => {
        setCurrentlySpeakingId(null);
      };

      utterance.onerror = () => {
        setCurrentlySpeakingId(null);
      };

      window.speechSynthesis.speak(utterance);
    },
    [availableVoices, selectedVoiceName]
  );

  const toggleMute = useCallback(() => {
    const nextState = !isMutedRef.current;
    isMutedRef.current = nextState;
    setIsMuted(nextState);

    if (typeof window !== 'undefined') {
      localStorage.setItem('shu_oric_voice_muted', String(nextState));
    }

    // Force kill browser speech queue immediately
    stopSpeechImmediately();
    setCurrentlySpeakingId(null);
  }, []);

  const changePreferredVoice = useCallback((voiceName: string) => {
    setSelectedVoiceName(voiceName);
    if (typeof window !== 'undefined') {
      localStorage.setItem('shu_oric_preferred_voice', voiceName);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    stopSpeechImmediately();
    setCurrentlySpeakingId(null);
  }, []);

  return {
    isListening,
    isMuted,
    currentlySpeakingId,
    availableVoices,
    selectedVoiceName,
    startListening,
    stopListening,
    speakText,
    speak: speakText, // For backward compatibility
    stopSpeaking,
    toggleMute,
    changePreferredVoice,
    isSupported: typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window),
  };
};

export default useVoice;
