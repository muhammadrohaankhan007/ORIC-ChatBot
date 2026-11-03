'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Project } from '@/types';
import { getApiBaseUrl } from '@/services/api';
import { cleanTextForSpeech, selectBestVoice } from './useVoice';

export type VoiceAgentStatus = 'idle' | 'listening' | 'thinking' | 'speaking' | 'paused';

export interface SpokenTurn {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

export interface UseVoiceAgentOptions {
  selectedProject?: Project | null;
  onProjectChange?: (project: Project | null) => void;
  lang?: string;
}

export function useVoiceAgent({ selectedProject, lang = 'en-US' }: UseVoiceAgentOptions = {}) {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<VoiceAgentStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [lastUserText, setLastUserText] = useState('');
  const [lastAgentText, setLastAgentText] = useState('');
  const [turns, setTurns] = useState<SpokenTurn[]>([]);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0); // 0.0 to 1.0 for visualizer orb

  // Internal references
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isSpeakingRef = useRef(false);
  const isMutedRef = useRef(false);
  const projectRef = useRef(selectedProject);
  projectRef.current = selectedProject;
  const turnsRef = useRef<SpokenTurn[]>([]);
  turnsRef.current = turns;

  // Keep volume animation loop running for visualizer
  const updateAudioVolume = useCallback(() => {
    if (analyserRef.current && !isMutedRef.current && !isSpeakingRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      // Normalized between 0 and 1
      const normalized = Math.min(1, Math.max(0, average / 64));
      setAudioVolume(normalized);
    } else if (isSpeakingRef.current) {
      // Simulate dynamic pulse while agent is speaking
      const time = Date.now() / 200;
      const wave = (Math.sin(time) + Math.cos(time * 1.5) + 2) / 4;
      setAudioVolume(0.4 + wave * 0.4);
    } else {
      setAudioVolume(0);
    }

    animFrameRef.current = requestAnimationFrame(updateAudioVolume);
  }, []);

  // Stop any active AI speech
  const stopAgentSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore synthesis cancel error
      }
    }
    isSpeakingRef.current = false;
  }, []);

  // Speak a text string via Web Speech API with the best available voice
  const speakSpokenResponse = useCallback((text: string, onDone?: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onDone?.();
      return;
    }

    stopAgentSpeech();
    const clean = cleanTextForSpeech(text);
    if (!clean) {
      onDone?.();
      return;
    }

    isSpeakingRef.current = true;
    setStatus('speaking');

    const utterance = new SpeechSynthesisUtterance(clean);
    const voices = window.speechSynthesis.getVoices();
    const bestVoice = selectBestVoice('ORIC Research Assistant', voices);
    if (bestVoice) {
      utterance.voice = bestVoice;
      utterance.lang = bestVoice.lang;
    }

    utterance.rate = 1.05; // Slightly faster for natural conversational pacing
    utterance.pitch = 1.0;

    utterance.onend = () => {
      isSpeakingRef.current = false;
      setStatus('listening');
      onDone?.();
    };

    utterance.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('Speech synthesis error:', e);
      }
      isSpeakingRef.current = false;
      setStatus('listening');
      onDone?.();
    };

    window.speechSynthesis.speak(utterance);
  }, [stopAgentSpeech]);

  // Send the user's spoken prompt to the backend with project context & history
  const sendSpokenPrompt = useCallback(async (promptText: string) => {
    if (!promptText || promptText.trim().length === 0) return;

    const trimmed = promptText.trim();
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

    // Build history for backend memory
    const historyPayload = turnsRef.current
      .slice(-8)
      .map((t) => ({
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

      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const data = await res.json();
      const answer = data.response || 'I am listening. Could you please repeat that?';

      setLastAgentText(answer);

      const agentTurn: SpokenTurn = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setTurns((prev) => [...prev, agentTurn]);

      // Speak aloud immediately
      speakSpokenResponse(answer);
    } catch (err: any) {
      console.error('Voice agent fetch error:', err);
      const fallbackMsg = "I couldn't reach the ORIC server. Please try saying that again.";
      setLastAgentText(fallbackMsg);
      speakSpokenResponse(fallbackMsg);
    }
  }, [speakSpokenResponse]);

  // Start the voice agent session
  const startVoiceAgent = useCallback(async () => {
    if (typeof window === 'undefined') return;

    setIsActive(true);
    setStatus('listening');
    setTranscript('');

    // 1. Initialize microphone & Web Audio API analyzer for visualizer
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      animFrameRef.current = requestAnimationFrame(updateAudioVolume);
    } catch (err) {
      console.warn('Microphone permission or Web Audio API not accessible:', err);
    }

    // 2. Setup Speech Recognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onresult = (event: any) => {
        // Barge-in: If the AI is currently talking and user speaks, interrupt AI immediately!
        if (isSpeakingRef.current) {
          stopAgentSpeech();
          setStatus('listening');
        }

        let interim = '';
        let finalPhrase = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalPhrase += text;
          } else {
            interim += text;
          }
        }

        const currentSpoken = (finalPhrase || interim).trim();
        if (currentSpoken) {
          setTranscript(currentSpoken);

          // Clear previous silence timer
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }

          // Silence Detection: 1.1s of silence after speech automatically sends the turn!
          silenceTimerRef.current = setTimeout(() => {
            if (currentSpoken.length >= 2) {
              sendSpokenPrompt(currentSpoken);
            }
          }, 1100);
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error !== 'no-speech') {
          console.warn('SpeechRecognition error:', e.error);
        }
      };

      recognition.onend = () => {
        // Automatically restart listening if still in active voice call
        if (recognitionRef.current && !isMutedRef.current) {
          try {
            recognition.start();
          } catch {
            // Ignore start error on restart
          }
        }
      };

      try {
        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    }

    // 3. Spoken Welcome Salutation
    const project = projectRef.current;
    const initialGreeting = project
      ? `Hello! I am your ORIC voice advisor for the ${project.title} project. What would you like to know about its TRL level, patent status, or industry partners?`
      : 'Hello! I am your ORIC voice assistant. Ask me anything about our university projects, grants, or patent commercialization.';

    setLastAgentText(initialGreeting);
    speakSpokenResponse(initialGreeting);
  }, [lang, sendSpokenPrompt, speakSpokenResponse, stopAgentSpeech, updateAudioVolume]);

  // End the voice agent session cleanly
  const endVoiceAgent = useCallback(() => {
    setIsActive(false);
    setStatus('idle');
    setTranscript('');
    setAudioVolume(0);

    stopAgentSpeech();

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
      recognitionRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }

    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {
        // Ignore
      }
      audioContextRef.current = null;
    }
  }, [stopAgentSpeech]);

  // Toggle Mute
  const toggleMicMute = useCallback(() => {
    const next = !isMicMuted;
    setIsMicMuted(next);
    isMutedRef.current = next;

    if (next) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }
      setStatus('paused');
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // Ignore
        }
      }
      setStatus('listening');
    }
  }, [isMicMuted]);

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
    audioVolume,
    startVoiceAgent,
    endVoiceAgent,
    toggleMicMute,
    sendSpokenPrompt,
    stopAgentSpeech,
  };
}

export default useVoiceAgent;
