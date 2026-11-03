'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Project } from '@/types';
import { getApiBaseUrl, INITIAL_PROJECTS } from '@/services/api';
import { cleanTextForSpeech, selectBestVoice } from './useVoice';

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
  lang?: string;
}

export function useVoiceAgent({ selectedProject, onProjectChange, lang = 'en-US' }: UseVoiceAgentOptions = {}) {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<VoiceAgentStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [lastUserText, setLastUserText] = useState('');
  const [lastAgentText, setLastAgentText] = useState('');
  const [turns, setTurns] = useState<SpokenTurn[]>([]);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0); // 0.0 to 1.0 for visualizer
  const [speechSupported, setSpeechSupported] = useState(true);

  // References
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const isRecognitionRunningRef = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isSpeakingRef = useRef(false);
  const isMutedRef = useRef(false);
  const projectRef = useRef(selectedProject);
  projectRef.current = selectedProject;
  const onProjectChangeRef = useRef(onProjectChange);
  onProjectChangeRef.current = onProjectChange;
  const turnsRef = useRef<SpokenTurn[]>([]);
  turnsRef.current = turns;
  const activeProjectIdRef = useRef<string | null>(selectedProject?.id || null);

  // Real-time microphone audio volume calculation for the pulsing visualizer orb
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

  // Stop active speech synthesis
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

  // Safe starter for speech recognition
  const startListeningForUser = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (isMutedRef.current) return;

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
      recognition.lang = lang;

      recognition.onstart = () => {
        isRecognitionRunningRef.current = true;
        setStatus('listening');
      };

      recognition.onresult = (event: any) => {
        // Prevent acoustic loop: do not process if the AI is currently speaking
        if (isSpeakingRef.current) return;

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

          // Automatic Project Matching: If user mentions a project by name, switch context automatically!
          const lowerSpoken = currentSpoken.toLowerCase();
          for (const proj of INITIAL_PROJECTS) {
            const matchesTextile =
              (lowerSpoken.includes('textile') || lowerSpoken.includes('vision') || lowerSpoken.includes('fabric')) &&
              proj.id === 'proj-002';
            const matchesDrug =
              (lowerSpoken.includes('drug') || lowerSpoken.includes('nano') || lowerSpoken.includes('cancer') || lowerSpoken.includes('oncology')) &&
              proj.id === 'proj-001';
            const matchesGlucose =
              (lowerSpoken.includes('glucose') || lowerSpoken.includes('blood') || lowerSpoken.includes('biosensor')) &&
              proj.id === 'proj-003';
            const matchesCarbon =
              (lowerSpoken.includes('carbon') || lowerSpoken.includes('esg') || lowerSpoken.includes('supply chain')) &&
              proj.id === 'proj-004';

            if (matchesTextile || matchesDrug || matchesGlucose || matchesCarbon) {
              if (projectRef.current?.id !== proj.id && onProjectChangeRef.current) {
                onProjectChangeRef.current(proj);
                projectRef.current = proj;
              }
              break;
            }
          }

          // Clear previous silence timer
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }

          // Silence Detection: 1.1 seconds of silence after speaking automatically commits the turn
          silenceTimerRef.current = setTimeout(() => {
            if (currentSpoken.length >= 2) {
              sendSpokenPrompt(currentSpoken);
            }
          }, 1100);
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error === 'not-allowed') {
          console.warn('Microphone access not allowed for SpeechRecognition');
          setStatus('paused');
        }
      };

      recognition.onend = () => {
        isRecognitionRunningRef.current = false;
        // If voice call is active and we are not speaking and not muted, seamlessly restart listening
        if (!isSpeakingRef.current && !isMutedRef.current) {
          setTimeout(() => {
            if (!isSpeakingRef.current && !isMutedRef.current && !isRecognitionRunningRef.current) {
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
  }, [lang]);

  // Pause speech recognition safely while the AI speaks to prevent acoustic feedback
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

  // Speak aloud via Web Speech API and cleanly transition back to listening
  const speakSpokenResponse = useCallback(
    (text: string, onDone?: () => void) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        onDone?.();
        return;
      }

      // Stop any existing speech and pause recognition so the AI doesn't hear itself
      stopAgentSpeech();
      pauseListening();

      const clean = cleanTextForSpeech(text);
      if (!clean) {
        onDone?.();
        startListeningForUser();
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

      utterance.rate = 1.05; // Conversational tempo
      utterance.pitch = 1.0;

      utterance.onend = () => {
        isSpeakingRef.current = false;
        onDone?.();
        // Wait 250ms for room echo to clear, then start listening for user
        setTimeout(() => {
          startListeningForUser();
        }, 250);
      };

      utterance.onerror = (e) => {
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn('Speech synthesis error:', e);
        }
        isSpeakingRef.current = false;
        onDone?.();
        setTimeout(() => {
          startListeningForUser();
        }, 250);
      };

      window.speechSynthesis.speak(utterance);
    },
    [pauseListening, startListeningForUser, stopAgentSpeech]
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
          const trimmed = cleanAnswer.substring(0, 210).replace(/\s+\S*$/, '');
          conversationalAnswer = trimmed + '.';
        }

        setLastAgentText(conversationalAnswer);

        const agentTurn: SpokenTurn = {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          text: conversationalAnswer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setTurns((prev) => [...prev, agentTurn]);

        // Speak aloud immediately and resume listening once done
        speakSpokenResponse(conversationalAnswer);
      } catch (err: any) {
        console.error('Voice agent fetch error:', err);
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

    setIsActive(true);
    setStatus('welcome');
    setTranscript('');
    isMutedRef.current = false;
    setIsMicMuted(false);

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
      welcomeGreeting = `Welcome to Salim Habib University ORIC! I am your AI voice advisor for ${project.title}, led by ${project.lead_investigator}. How can I assist you with this project today?`;
    } else {
      welcomeGreeting = `Welcome to Salim Habib University ORIC! Which research project would you like to discuss today? We have AI Textile Quality Control, Nanoparticle Oncology, the Glucose Biosensor, or Carbon Tracking. Which one would you like to explore?`;
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
    // Notice: Recognition is NOT active while this greeting plays!
    // As soon as the greeting finishes, speakSpokenResponse automatically calls startListeningForUser()!
    speakSpokenResponse(welcomeGreeting);
  }, [speakSpokenResponse, updateAudioVolume]);

  // End the voice agent session cleanly
  const endVoiceAgent = useCallback(() => {
    setIsActive(false);
    setStatus('idle');
    setTranscript('');
    setAudioVolume(0);

    stopAgentSpeech();
    pauseListening();

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
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
  }, [pauseListening, stopAgentSpeech]);

  // Toggle Mute
  const toggleMicMute = useCallback(() => {
    const next = !isMicMuted;
    setIsMicMuted(next);
    isMutedRef.current = next;

    if (next) {
      pauseListening();
      setStatus('paused');
    } else {
      startListeningForUser();
    }
  }, [isMicMuted, pauseListening, startListeningForUser]);

  // Interrupt AI immediately (Barge-in button / tap)
  const interruptAndListen = useCallback(() => {
    stopAgentSpeech();
    setTranscript('');
    startListeningForUser();
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
    audioVolume,
    speechSupported,
    startVoiceAgent,
    endVoiceAgent,
    toggleMicMute,
    sendSpokenPrompt,
    stopAgentSpeech,
    interruptAndListen,
    startListeningForUser,
  };
}

export default useVoiceAgent;
