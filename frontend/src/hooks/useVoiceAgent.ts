'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Project } from '@/types';
import { getApiBaseUrl, INITIAL_PROJECTS } from '@/services/api';
import {
  cleanTextForSpeech,
  phoneticTextAnalysisForSpeech,
  stopSpeechImmediately,
  selectVoiceForDialect,
  VOICE_DIALECTS,
  VoiceDialect,
} from './useVoice';

export type VoiceAgentStatus = 'idle' | 'welcome' | 'listening' | 'thinking' | 'speaking' | 'paused';

export interface SpokenTurn {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

export interface UseVoiceAgentOptions {
  selectedProject?: Project | null;
  onProjectChange?: (project: Project | null) => void;
  defaultDialect?: string;
}

export function useVoiceAgent({ selectedProject, onProjectChange, defaultDialect = 'en-US' }: UseVoiceAgentOptions = {}) {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<VoiceAgentStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [lastUserText, setLastUserText] = useState('');
  const [lastAgentText, setLastAgentText] = useState('');
  const [turns, setTurns] = useState<SpokenTurn[]>([]);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0); // 0.0 to 1.0 for visualizer
  const [speechSupported, setSpeechSupported] = useState(true);

  // Dialect, Voice, and Speed States
  const [selectedDialect, setSelectedDialect] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('shu_oric_voice_dialect') || defaultDialect;
    }
    return defaultDialect;
  });

  const [selectedVoiceName, setSelectedVoiceName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('shu_oric_preferred_voice') || '';
    }
    return '';
  });

  const [speechSpeed, setSpeechSpeed] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shu_oric_speech_speed');
      return saved ? parseFloat(saved) : 1.05;
    }
    return 1.05;
  });

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // References for reliable real-time event checks
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const isRecognitionRunningRef = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const isActiveRef = useRef(false);
  const isPausedRef = useRef(false);
  const isMutedRef = useRef(false);
  const isSpeakingRef = useRef(false);

  const dialectRef = useRef(selectedDialect);
  dialectRef.current = selectedDialect;
  const speechSpeedRef = useRef(speechSpeed);
  speechSpeedRef.current = speechSpeed;
  const selectedVoiceNameRef = useRef(selectedVoiceName);
  selectedVoiceNameRef.current = selectedVoiceName;

  const projectRef = useRef(selectedProject);
  projectRef.current = selectedProject;
  const onProjectChangeRef = useRef(onProjectChange);
  onProjectChangeRef.current = onProjectChange;
  const turnsRef = useRef<SpokenTurn[]>([]);
  turnsRef.current = turns;
  const activeProjectIdRef = useRef<string | null>(selectedProject?.id || null);

  // Dynamically load browser voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const updateVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
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

  // Real-time microphone audio volume calculation for the pulsing visualizer orb
  const updateAudioVolume = useCallback(() => {
    if (!isActiveRef.current || isPausedRef.current || isMutedRef.current) {
      setAudioVolume(0);
      animFrameRef.current = requestAnimationFrame(updateAudioVolume);
      return;
    }

    if (analyserRef.current && !isSpeakingRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      // Normalized between 0 and 1
      const normalized = Math.min(1, Math.max(0, average / 48));
      setAudioVolume(normalized);
    } else if (isSpeakingRef.current) {
      // Dynamic pulsing wave when AI speaks
      const time = Date.now() / 150;
      const wave = (Math.sin(time) + Math.cos(time * 1.3) + 2) / 4;
      setAudioVolume(0.45 + wave * 0.45);
    } else {
      setAudioVolume(0);
    }

    animFrameRef.current = requestAnimationFrame(updateAudioVolume);
  }, []);

  // Stop active speech synthesis immediately
  const stopAgentSpeech = useCallback(() => {
    stopSpeechImmediately();
    isSpeakingRef.current = false;
  }, []);

  // Pause speech recognition safely
  const pauseListening = useCallback(() => {
    if (recognitionRef.current && isRecognitionRunningRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
      isRecognitionRunningRef.current = false;
    }
  }, []);

  // Safe starter for speech recognition
  const startListeningForUser = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!isActiveRef.current || isPausedRef.current || isMutedRef.current) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    // If already running, do nothing
    if (isRecognitionRunningRef.current && recognitionRef.current) {
      setStatus('listening');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = dialectRef.current;

      recognition.onstart = () => {
        if (!isActiveRef.current || isPausedRef.current || isMutedRef.current) {
          try {
            recognition.abort();
          } catch {}
          return;
        }
        isRecognitionRunningRef.current = true;
        setStatus('listening');
      };

      recognition.onresult = (event: any) => {
        // Prevent acoustic feedback: do not process if call is not active, paused, or AI is speaking
        if (!isActiveRef.current || isPausedRef.current || isSpeakingRef.current) return;

        let completeFinal = '';
        let currentInterim = '';

        // Iterate over ALL results from index 0 to retain the full multi-phrase utterance
        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            completeFinal += res[0].transcript + ' ';
          } else {
            currentInterim += res[0].transcript;
          }
        }

        const completeUtterance = (completeFinal + currentInterim).replace(/\s+/g, ' ').trim();
        if (!completeUtterance) return;

        setTranscript(completeUtterance);

        // Clear previous silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }

        // Pacing & End-of-Speech Detection:
        // If current chunk is interim (user is mid-speech), grant 2200ms grace period.
        // If the chunk reached a final pause / punctuation, grant 1600ms grace period.
        const isInterim = Boolean(currentInterim.trim());
        const silenceWaitMs = isInterim ? 2200 : 1600;

        silenceTimerRef.current = setTimeout(() => {
          if (isActiveRef.current && !isPausedRef.current && !isSpeakingRef.current && completeUtterance.length >= 2) {
            sendSpokenPrompt(completeUtterance);
          }
        }, silenceWaitMs);
      };

      recognition.onerror = (e: any) => {
        if (e.error === 'not-allowed') {
          console.warn('Microphone access not allowed for SpeechRecognition');
          setStatus('paused');
        }
      };

      recognition.onend = () => {
        isRecognitionRunningRef.current = false;
        // Check strict active flags: DO NOT restart if ended, paused, muted, or AI speaking
        if (isActiveRef.current && !isPausedRef.current && !isMutedRef.current && !isSpeakingRef.current) {
          setTimeout(() => {
            if (isActiveRef.current && !isPausedRef.current && !isMutedRef.current && !isSpeakingRef.current && !isRecognitionRunningRef.current) {
              try {
                recognition.start();
              } catch {
                // Ignore start error
              }
            }
          }, 200);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      isRecognitionRunningRef.current = true;
      setStatus('listening');
    } catch (err) {
      console.warn('Recognition start exception:', err);
    }
  }, []);

  // Speak aloud via Web Speech API and cleanly transition back to listening
  const speakSpokenResponse = useCallback(
    (text: string, onDone?: () => void) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        onDone?.();
        return;
      }

      if (!isActiveRef.current || isPausedRef.current) {
        onDone?.();
        return;
      }

      // Stop any existing speech and pause recognition so the AI doesn't hear itself
      stopAgentSpeech();
      pauseListening();

      const clean = phoneticTextAnalysisForSpeech(text);
      if (!clean) {
        onDone?.();
        if (isActiveRef.current && !isPausedRef.current && !isMutedRef.current) {
          startListeningForUser();
        }
        return;
      }

      isSpeakingRef.current = true;
      setStatus('speaking');

      const utterance = new SpeechSynthesisUtterance(clean);
      const voicesPool = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
      const bestVoice = selectVoiceForDialect(
        dialectRef.current,
        voicesPool,
        selectedVoiceNameRef.current,
        'ORIC Research Assistant'
      );

      if (bestVoice) {
        utterance.voice = bestVoice;
        utterance.lang = bestVoice.lang;
      } else {
        utterance.lang = dialectRef.current;
      }

      utterance.rate = speechSpeedRef.current;
      utterance.pitch = 1.02; // Warm conversational pitch

      utterance.onend = () => {
        isSpeakingRef.current = false;
        onDone?.();
        // Strict guard: DO NOT resume listening if call was closed or paused
        if (!isActiveRef.current || isPausedRef.current || isMutedRef.current) return;
        setTimeout(() => {
          if (!isActiveRef.current || isPausedRef.current || isMutedRef.current) return;
          startListeningForUser();
        }, 250);
      };

      utterance.onerror = (e) => {
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn('Speech synthesis error:', e);
        }
        isSpeakingRef.current = false;
        onDone?.();
        if (!isActiveRef.current || isPausedRef.current || isMutedRef.current) return;
        setTimeout(() => {
          if (!isActiveRef.current || isPausedRef.current || isMutedRef.current) return;
          startListeningForUser();
        }, 250);
      };

      window.speechSynthesis.speak(utterance);
    },
    [availableVoices, pauseListening, startListeningForUser, stopAgentSpeech]
  );

  // Audio acknowledgement when project changes while voice call is active
  useEffect(() => {
    if (isActive) {
      const currentId = selectedProject?.id || null;
      if (activeProjectIdRef.current !== currentId) {
        activeProjectIdRef.current = currentId;
        if (selectedProject) {
          const switchNotice = `Switched to ${selectedProject.title}, led by ${selectedProject.lead_investigator}. What would you like to know about this research?`;
          setLastAgentText(switchNotice);
          speakSpokenResponse(switchNotice);
        } else {
          const switchNotice = `Switched to General ORIC guidance. Which research project would you like to explore?`;
          setLastAgentText(switchNotice);
          speakSpokenResponse(switchNotice);
        }
      }
    } else {
      activeProjectIdRef.current = selectedProject?.id || null;
    }
  }, [isActive, selectedProject, speakSpokenResponse]);

  // Send the user's spoken prompt to the backend with project context & history
  const sendSpokenPrompt = useCallback(
    async (promptText: string) => {
      if (!promptText || promptText.trim().length === 0) return;
      if (!isActiveRef.current || isPausedRef.current) return;

      const trimmed = promptText.trim();
      pauseListening();
      setStatus('thinking');
      setLastUserText(trimmed);
      setTranscript('');

      const userTurn: SpokenTurn = {
        id: Date.now().toString(),
        sender: 'user',
        text: trimmed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setTurns((prev) => [...prev, userTurn]);

      // History of recent turns
      const historyPayload = turnsRef.current.slice(-8).map((t) => ({
        role: (t.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
        text: t.text,
      }));

      try {
        const apiBase = getApiBaseUrl();
        const currentProj = projectRef.current;

        const res = await fetch(`${apiBase}/chat/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: trimmed,
            message: trimmed,
            mode: 'voice',
            personaId: 'oric-assistant',
            personaName: 'ORIC Voice Advisor',
            history: historyPayload,
            projectContext: currentProj
              ? {
                  title: currentProj.title,
                  project_code: currentProj.project_code,
                  lead_investigator: currentProj.lead_investigator,
                  faculty: currentProj.faculty,
                  department: currentProj.department,
                  abstract: currentProj.abstract,
                  problem_statement: currentProj.problem_statement,
                  technology_stack: currentProj.technology_stack,
                  trl_level: currentProj.trl_level,
                  erl_level: currentProj.erl_level,
                  target_industries: currentProj.target_industries,
                  ip_status: currentProj.ip_status,
                  development_stage: currentProj.development_stage,
                }
              : null,
            sessionId: 'voice_session_active',
          }),
        });

        if (!isActiveRef.current || isPausedRef.current) return;

        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        const data = await res.json();
        const rawAnswer = data.response || 'I heard you. Could you please clarify that point?';

        // 1. Sanitize text for natural speech (strip markdown headers, bold, bullets, math)
        const cleanAnswer = cleanTextForSpeech(rawAnswer);

        // 2. Strict conversational brevity: extract 1-2 spoken sentences (max ~220 chars)
        const sentences = cleanAnswer.match(/[^.!?]+[.!?]+(?:\s|$)/g);
        let conversationalAnswer = cleanAnswer;
        if (sentences && sentences.length > 2) {
          conversationalAnswer = sentences.slice(0, 2).join(' ').trim();
        } else if (cleanAnswer.length > 220) {
          const trimmedWord = cleanAnswer.substring(0, 210).replace(/\s+\S*$/, '');
          conversationalAnswer = trimmedWord + '.';
        }

        setLastAgentText(conversationalAnswer);

        const agentTurn: SpokenTurn = {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          text: conversationalAnswer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setTurns((prev) => [...prev, agentTurn]);

        if (!isActiveRef.current || isPausedRef.current) return;

        // Speak aloud immediately and resume listening once done
        speakSpokenResponse(conversationalAnswer);
      } catch (err: any) {
        console.error('Voice agent fetch error:', err);
        if (!isActiveRef.current || isPausedRef.current) return;
        const fallbackMsg = "I couldn't reach the ORIC server. Please try saying that again.";
        setLastAgentText(fallbackMsg);
        speakSpokenResponse(fallbackMsg);
      }
    },
    [pauseListening, speakSpokenResponse]
  );

  // Start the voice agent session with proper welcome greeting first
  const startVoiceAgent = useCallback(async () => {
    if (typeof window === 'undefined') return;

    isActiveRef.current = true;
    isPausedRef.current = false;
    isMutedRef.current = false;

    setIsActive(true);
    setIsPaused(false);
    setIsMicMuted(false);
    setStatus('welcome');
    setTranscript('');

    // 1. Initialize microphone stream & Web Audio API analyzer for visualizer
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);
        analyserRef.current = analyser;

        animFrameRef.current = requestAnimationFrame(updateAudioVolume);
      }
    } catch (err) {
      console.warn('Microphone permission or Web Audio API notice:', err);
    }

    // 2. Prepare the warm, context-aware welcome greeting
    const project = projectRef.current;
    let welcomeGreeting = '';

    if (project) {
      welcomeGreeting = `Welcome to Salim Habib University O-rick! I am your AI voice advisor for ${project.title}, led by ${project.lead_investigator}. How can I assist you with this project today?`;
    } else {
      welcomeGreeting = `Welcome to Salim Habib University O-rick! Which research project would you like to discuss today? We have AI Textile Quality Control, Nanoparticle Oncology, the Glucose Biosensor, or Carbon Tracking. Which one would you like to explore?`;
    }

    setLastAgentText(welcomeGreeting);

    // Add welcome turn to history drawer
    const welcomeTurn: SpokenTurn = {
      id: Date.now().toString(),
      sender: 'agent',
      text: welcomeGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setTurns([welcomeTurn]);

    // 3. Play the welcome greeting aloud FIRST.
    speakSpokenResponse(welcomeGreeting);
  }, [speakSpokenResponse, updateAudioVolume]);

  // End the voice agent session completely and reliably
  const endVoiceAgent = useCallback(() => {
    isActiveRef.current = false;
    isPausedRef.current = false;
    isMutedRef.current = false;
    isSpeakingRef.current = false;

    setIsActive(false);
    setIsPaused(false);
    setIsMicMuted(false);
    setStatus('idle');
    setTranscript('');
    setAudioVolume(0);

    // 1. Immediately terminate all speech synthesis
    stopSpeechImmediately();

    // 2. Clear silence timer and visualizer frame
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    // 3. Decouple and abort SpeechRecognition to guarantee zero background restarts
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch {
        // Ignore
      }
      recognitionRef.current = null;
    }
    isRecognitionRunningRef.current = false;

    // 4. Stop and release all microphone media stream tracks
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      micStreamRef.current = null;
    }

    // 5. Close AudioContext
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {
        // Ignore
      }
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  // Toggle Microphone Mute
  const toggleMicMute = useCallback(() => {
    const next = !isMicMuted;
    setIsMicMuted(next);
    isMutedRef.current = next;

    if (next) {
      pauseListening();
      setAudioVolume(0);
      setStatus('paused');
    } else {
      if (isActiveRef.current && !isPausedRef.current) {
        startListeningForUser();
      }
    }
  }, [isMicMuted, pauseListening, startListeningForUser]);

  // Toggle Call Pause / Resume
  const togglePause = useCallback(() => {
    const next = !isPaused;
    setIsPaused(next);
    isPausedRef.current = next;

    if (next) {
      stopAgentSpeech();
      pauseListening();
      setAudioVolume(0);
      setStatus('paused');
    } else {
      if (isActiveRef.current && !isMutedRef.current) {
        startListeningForUser();
      }
    }
  }, [isPaused, pauseListening, startListeningForUser, stopAgentSpeech]);

  // Change Dialect / Language
  const changeDialect = useCallback((dialectCode: string) => {
    setSelectedDialect(dialectCode);
    dialectRef.current = dialectCode;
    if (typeof window !== 'undefined') {
      localStorage.setItem('shu_oric_voice_dialect', dialectCode);
    }
    // Update recognition language on the fly if running
    if (recognitionRef.current && isRecognitionRunningRef.current) {
      try {
        recognitionRef.current.lang = dialectCode;
      } catch {
        // Ignore
      }
    }
  }, []);

  // Change Voice
  const changeVoice = useCallback((voiceName: string) => {
    setSelectedVoiceName(voiceName);
    selectedVoiceNameRef.current = voiceName;
    if (typeof window !== 'undefined') {
      localStorage.setItem('shu_oric_preferred_voice', voiceName);
    }
  }, []);

  // Change Speech Speed
  const changeSpeed = useCallback((speed: number) => {
    setSpeechSpeed(speed);
    speechSpeedRef.current = speed;
    if (typeof window !== 'undefined') {
      localStorage.setItem('shu_oric_speech_speed', String(speed));
    }
  }, []);

  // Interrupt AI immediately (Barge-in button / tap)
  const interruptAndListen = useCallback(() => {
    stopAgentSpeech();
    setTranscript('');
    if (isActiveRef.current && !isPausedRef.current && !isMutedRef.current) {
      startListeningForUser();
    }
  }, [startListeningForUser, stopAgentSpeech]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endVoiceAgent();
    };
  }, [endVoiceAgent]);

  return {
    isActive,
    status,
    transcript,
    lastUserText,
    lastAgentText,
    turns,
    isMicMuted,
    isPaused,
    audioVolume,
    speechSupported,
    selectedDialect,
    selectedVoiceName,
    speechSpeed,
    availableVoices,
    dialects: VOICE_DIALECTS,
    startVoiceAgent,
    endVoiceAgent,
    toggleMicMute,
    togglePause,
    changeDialect,
    changeVoice,
    changeSpeed,
    sendSpokenPrompt,
    stopAgentSpeech,
    interruptAndListen,
    startListeningForUser,
  };
}

export default useVoiceAgent;
