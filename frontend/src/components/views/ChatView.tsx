'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useVoice, stopSpeechImmediately } from '@/hooks/useVoice';
import { getApiBaseUrl } from '@/services/api';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Send,
  SlidersHorizontal,
  Square,
  Sparkles,
  ArrowRight,
  Info,
  RotateCcw,
  Radio
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  domainName?: string;
  timestamp: string;
}

const RESEARCH_DOMAINS = [
  {
    id: 'general',
    name: 'General ORIC Guidance',
    description: 'Institutional grant proposals, ERL benchmarking & patent discovery',
  },
  {
    id: 'pharmacy',
    name: 'Pharmaceutics & Health',
    description: 'Drug formulations, nano-carriers, stability assays & DRAP compliance',
  },
  {
    id: 'computing',
    name: 'Computing & AI',
    description: 'Computer vision, embedded edge models & software systems',
  },
  {
    id: 'biomedical',
    name: 'Biomedical Engineering',
    description: 'Medical instrumentation, biosensors & ISO 13485 standards',
  },
  {
    id: 'commercialization',
    name: 'Commercialization & IP',
    description: 'Patent drafting, technology licensing & Karachi industrial MoUs',
  },
];

const SUGGESTED_PROMPTS = [
  'Review our mycelium packaging project against DRAP regulations',
  'What ERL level does a prototype with customer feedback reach?',
  'Find pharmaceutical manufacturers in Korangi for transdermal patches',
  'Draft a provisional patent summary for our nano-carrier research',
];

export interface ChatViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  personas?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  projects?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedProject?: any | null;
  onClearSelectedProject?: () => void;
  voiceGlobalEnabled?: boolean;
  onOpenVoiceAgent?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  selectedProject,
  onClearSelectedProject,
  onOpenVoiceAgent,
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedDomain, setSelectedDomain] = useState(RESEARCH_DOMAINS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const sessionIdRef = useRef<string>('');
  const wsRef = useRef<WebSocket | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const settingsRef = useRef<HTMLDivElement | null>(null);

  // Initialize session ID and restore persistent chat memory
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let savedSessionId = sessionStorage.getItem('shu_oric_chat_session_id');
      if (!savedSessionId) {
        savedSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem('shu_oric_chat_session_id', savedSessionId);
      }
      sessionIdRef.current = savedSessionId;

      try {
        const cached = localStorage.getItem('shu_oric_chat_history');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }
      } catch (e) {
        console.warn('Failed to load chat history from cache', e);
      }
    }
  }, []);

  // Save chat messages to cache on update
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        localStorage.setItem('shu_oric_chat_history', JSON.stringify(messages));
      } catch (e) {
        console.warn('Failed to persist chat history', e);
      }
    }
  }, [messages]);

  // Auto-resize textarea as user types or dictates
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputPrompt]);

  // Click outside to close settings popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSettingsOpen]);

  const {
    isListening,
    isMuted,
    currentlySpeakingId,
    speechSpeed,
    availableVoices,
    selectedVoiceName,
    changePreferredVoice,
    changeSpeechSpeed,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    toggleMute,
  } = useVoice({
    onTranscriptChange: (transcript) => {
      setInputPrompt(transcript);
    },
  });

  const speakTextRef = useRef(speakText);
  speakTextRef.current = speakText;
  const selectedDomainRef = useRef(selectedDomain);
  selectedDomainRef.current = selectedDomain;
  const stopListeningRef = useRef(stopListening);
  stopListeningRef.current = stopListening;

  const handleClearChat = async () => {
    stopSpeaking();
    setMessages([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('shu_oric_chat_history');
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem('shu_oric_chat_session_id', newSessionId);
      sessionIdRef.current = newSessionId;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'clear', sessionId: sessionIdRef.current }));
    }

    try {
      const apiBase = getApiBaseUrl();
      await fetch(`${apiBase}/chat/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionIdRef.current }),
      });
    } catch (e) {
      // Ignore network errors on clear
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? inputPrompt).trim();
    if (!text || isGenerating) return;

    // Cleanly stop dictation
    stopListeningRef.current();
    stopSpeechImmediately();

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Extract previous conversation turns for full context memory
    const conversationHistory = messages
      .filter((m) => m.text && m.text.trim())
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsGenerating(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const projectContextPayload = selectedProject
      ? {
          title: selectedProject.title,
          project_code: selectedProject.project_code,
          faculty: selectedProject.faculty,
          department: selectedProject.department,
          lead_investigator: selectedProject.lead_investigator,
          abstract: selectedProject.abstract,
          problem_statement: selectedProject.problem_statement,
          technology_stack: selectedProject.technology_stack,
          development_stage: selectedProject.development_stage,
          trl_level: selectedProject.trl_level,
          erl_level: selectedProject.erl_level,
          ip_status: selectedProject.ip_status,
          target_industries: selectedProject.target_industries,
          commercial_readiness: selectedProject.commercial_readiness,
          estimated_funding_pkr: selectedProject.estimated_funding_pkr,
        }
      : null;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const payload = {
        type: 'chat',
        prompt: text,
        message: text,
        history: conversationHistory,
        sessionId: sessionIdRef.current || 'default_session',
        mode: 'mentoring',
        personaId: selectedDomain.id,
        persona_slug: selectedDomain.id,
        personaName: `ORIC Research Assistant (${selectedDomain.name})`,
        projectContext: projectContextPayload,
      };
      wsRef.current.send(JSON.stringify(payload));
      return;
    }

    // Resilient REST fallback
    try {
      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          message: text,
          history: conversationHistory,
          sessionId: sessionIdRef.current || 'default_session',
          mode: 'mentoring',
          personaId: selectedDomain.id,
          persona_slug: selectedDomain.id,
          personaName: `ORIC Research Assistant (${selectedDomain.name})`,
          projectContext: projectContextPayload,
        }),
      });

      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const data = await res.json();

      const aiResponse = data.response || 'No response returned.';
      const msgId = Date.now().toString();

      setMessages((prev) => [
        ...prev,
        {
          id: msgId,
          sender: 'ai',
          text: aiResponse,
          domainName: selectedDomain.name,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      setIsGenerating(false);
      speakTextRef.current(aiResponse, false, msgId, 'ORIC Research Assistant');
    } catch (err: any) {
      console.error('REST fallback error:', err);
      setIsGenerating(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'ai',
          text: `Service notification: Backend response active on fallback. Details: ${err.message}`,
          domainName: 'System',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const connectWebSocket = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    const defaultWsUrl = window.location.port === '3000' && host === 'localhost'
      ? `${protocol}//${host}:8000/api/v1/ws/chat`
      : `${protocol}//${window.location.host}/api/v1/ws/chat`;
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || defaultWsUrl;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('Connected to SHU ORIC AI Streaming Engine');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'start') {
            setIsGenerating(true);
            const msgId = Date.now().toString();
            setMessages((prev) => [
              ...prev,
              {
                id: msgId,
                sender: 'ai',
                text: '',
                domainName: selectedDomainRef.current.name,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          } else if (data.type === 'token' || data.type === 'chunk') {
            const token = data.token ?? data.chunk ?? '';
            setMessages((prev) => {
              if (prev.length === 0) return prev;
              const next = [...prev];
              const last = { ...next[next.length - 1] };
              if (last.sender === 'ai') {
                last.text += token;
                next[next.length - 1] = last;
              }
              return next;
            });
          } else if (data.type === 'done' || data.type === 'end') {
            setIsGenerating(false);
            setMessages((prev) => {
              if (prev.length === 0) return prev;
              const next = [...prev];
              const last = { ...next[next.length - 1] };
              if (last.sender === 'ai') {
                if (data.fullText && (!last.text || last.text.length < data.fullText.length)) {
                  last.text = data.fullText;
                  next[next.length - 1] = last;
                }
                speakTextRef.current(
                  last.text,
                  false,
                  last.id,
                  'ORIC Research Assistant'
                );
              }
              return next;
            });
          }
        } catch (e) {
          console.warn('WebSocket message parse error:', e);
        }
      };

      ws.onerror = (e) => {
        console.warn('WebSocket error, fallback to REST ready:', e);
      };

      wsRef.current = ws;
    } catch (e) {
      console.warn('Could not establish WebSocket:', e);
    }
  }, []);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [connectWebSocket]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white text-zinc-900 font-sans selection:bg-red-600 selection:text-white relative">
      {/* =========================================================================
          1. CHAT HEADER: HONEST AI IDENTITY + SPECIALIZATION SELECTOR + SETTINGS
          ========================================================================= */}
      <div className="h-14 px-6 border-b border-zinc-200 bg-white flex items-center justify-between shrink-0 shadow-xs">
        {/* Honest Assistant Identity */}
        <div className="flex items-center gap-3">
          <img
            src="/shu-logo.png"
            alt="Salim Habib University"
            className="h-8 w-auto object-contain"
          />
          <div className="h-6 w-px bg-zinc-200 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-zinc-900 tracking-tight">
                ORIC Research Assistant
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-700 font-semibold border border-red-200">
                Official AI
              </span>
            </div>
            <div className="text-[11px] text-zinc-500 font-normal">
              Salim Habib University • Research & Commercialization
            </div>
          </div>
        </div>

        {/* Controls: New Chat, Domain Selector & Settings Popover */}
        <div className="flex items-center gap-2.5">
          {/* Live Voice Call Button */}
          {onOpenVoiceAgent && (
            <button
              onClick={onOpenVoiceAgent}
              title="Start real-time duplex voice conversation (Gemini Voice Agent)"
              className="px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse" />
              <span className="hidden sm:inline">Voice Agent</span>
            </button>
          )}

          {/* Reset / New Chat Button */}
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              title="Start a new conversation and clear memory"
              className="px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-red-600 hover:border-red-200 transition text-xs font-medium flex items-center gap-1.5 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          )}

          {/* Domain Specialization Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-zinc-500 hidden md:inline">Focus Area:</span>
            <select
              value={selectedDomain.id}
              onChange={(e) => {
                const found = RESEARCH_DOMAINS.find((d) => d.id === e.target.value);
                if (found) setSelectedDomain(found);
              }}
              className="text-xs font-medium bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-800 hover:border-zinc-300 focus:outline-hidden focus:border-zinc-400 transition"
            >
              {RESEARCH_DOMAINS.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {domain.name}
                </option>
              ))}
            </select>
          </div>

          {/* Settings Popover Button */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              title="Voice & Playback Settings"
              className={`p-2 rounded-lg border transition ${
                isSettingsOpen
                  ? 'bg-zinc-100 text-zinc-900 border-zinc-300'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* Popover Card */}
            {isSettingsOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-zinc-200 rounded-lg shadow-lg p-4 space-y-4 z-50 text-xs">
                <div className="font-bold text-zinc-900 border-b border-zinc-100 pb-2">
                  Assistant Settings
                </div>

                {/* Voice Selection */}
                <div className="space-y-1.5">
                  <label className="font-medium text-zinc-700">Speech Voice</label>
                  <select
                    value={selectedVoiceName || ''}
                    onChange={(e) => changePreferredVoice(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-1.5 text-xs text-zinc-800 focus:outline-hidden"
                  >
                    {availableVoices.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Playback Speed */}
                <div className="space-y-1.5">
                  <label className="font-medium text-zinc-700">Playback Speed</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[0.9, 1.0, 1.15, 1.25].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => changeSpeechSpeed(speed)}
                        className={`py-1 rounded text-xs font-medium border transition ${
                          speechSpeed === speed
                            ? 'bg-red-50 text-red-700 border-red-300 font-bold'
                            : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Voice Mute Toggle */}
                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                  <span className="font-medium text-zinc-700">Audio Readout</span>
                  <button
                    onClick={toggleMute}
                    className={`px-2.5 py-1 rounded text-xs font-medium border transition ${
                      !isMuted
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                    }`}
                  >
                    {!isMuted ? 'Active' : 'Muted'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Project Notice (if user clicked Analyze from Project list) */}
      {selectedProject && (
        <div className="bg-zinc-50 border-b border-zinc-200 px-6 py-2 flex items-center justify-between text-xs text-zinc-600">
          <div className="flex items-center gap-2 truncate">
            <Info className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>Analyzing Project:</span>
            <strong className="text-zinc-900 truncate">{selectedProject.title}</strong>
            <span className="px-1.5 py-0.2 rounded bg-zinc-200 text-zinc-700 text-[10px] font-medium">
              TRL {selectedProject.trl_level}/9
            </span>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            {onOpenVoiceAgent && (
              <button
                onClick={onOpenVoiceAgent}
                title="Talk about this project with the Voice Agent"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition text-[11px] font-semibold shadow-xs"
              >
                <Radio className="w-3 h-3 text-white animate-pulse" />
                <span>Talk with Voice Agent</span>
              </button>
            )}
            {onClearSelectedProject && (
              <button
                onClick={onClearSelectedProject}
                className="text-zinc-500 hover:text-zinc-900 underline ml-1 shrink-0"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          2. MESSAGE FEED (FLATTENED DESIGN, CLEAN READABLE LINE LENGTH)
          ========================================================================= */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 max-w-4xl mx-auto w-full">
        {messages.length === 0 ? (
          /* Proper Honest Empty State */
          <div className="my-auto py-12 max-w-2xl mx-auto text-center space-y-5">
            <img
              src="/shu-logo.png"
              alt="Salim Habib University"
              className="h-14 w-auto object-contain mx-auto"
            />

            <div className="space-y-2">
              <h2 className="text-lg font-bold font-display text-zinc-900">
                ORIC Research Assistant
              </h2>
              <p className="text-sm text-zinc-600 leading-relaxed max-w-lg mx-auto">
                Review grant proposals, check patent eligibility, assess commercial readiness (ERL/TRL), or identify Karachi industrial manufacturing partners.
              </p>
            </div>

            {/* 4 Actionable Prompt Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-left">
              {SUGGESTED_PROMPTS.map((promptText, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputPrompt(promptText);
                    handleSendMessage(promptText);
                  }}
                  className="p-3 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 text-xs text-zinc-700 font-medium transition flex items-center justify-between group shadow-xs"
                >
                  <span className="line-clamp-2">{promptText}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-red-600 transition shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Flattened Messages */
          messages.map((msg) => (
            <div key={msg.id} className="group">
              {msg.sender === 'user' ? (
                /* User Message: Clean Right Bubble */
                <div className="flex flex-col items-end">
                  <div className="bg-zinc-100 border border-zinc-200 text-zinc-900 rounded-lg px-4 py-2.5 max-w-2xl text-sm leading-relaxed shadow-xs">
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1 mr-1">{msg.timestamp}</span>
                </div>
              ) : (
                /* Assistant Message: Plain text on Canvas with Hover Actions */
                <div className="flex flex-col items-start max-w-3xl">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-zinc-900">
                      ORIC Assistant
                    </span>
                    {msg.domainName && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 border border-zinc-200 font-medium">
                        {msg.domainName}
                      </span>
                    )}
                    <span className="text-[10px] text-zinc-400">{msg.timestamp}</span>
                  </div>

                  <div className="text-sm leading-relaxed text-zinc-800 prose prose-zinc max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.text}
                    </ReactMarkdown>
                  </div>

                  {/* Hover Actions: Copy & Listen */}
                  <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center gap-2 mt-2 pt-1 border-t border-zinc-100 w-full">
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-900 transition"
                      title="Copy text to clipboard"
                    >
                      {copiedMsgId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        if (currentlySpeakingId === msg.id) {
                          stopSpeaking();
                        } else {
                          speakText(msg.text, true, msg.id, 'ORIC Research Assistant');
                        }
                      }}
                      className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-900 transition ml-2"
                      title={currentlySpeakingId === msg.id ? 'Stop audio' : 'Listen to response'}
                    >
                      {currentlySpeakingId === msg.id ? (
                        <>
                          <Square className="w-3 h-3 text-red-600 fill-current" />
                          <span className="text-red-600 font-medium">Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading generation state */}
        {isGenerating && (
          <div className="flex items-center gap-2 text-xs text-zinc-500 pt-2">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span>Analyzing research query...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* =========================================================================
          3. CHAT COMPOSER (STREAMLINED ENTER KEY & SEAMLESS MIC DICTATION)
          ========================================================================= */}
      <div className="border-t border-zinc-200 bg-white p-4 shrink-0 shadow-xs">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="relative flex items-center bg-white border border-zinc-200 rounded-lg focus-within:border-zinc-400 focus-within:ring-1 focus-within:ring-zinc-400 shadow-xs transition">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about research projects, DRAP/PSQCA regulations, TRL/ERL scoring, or industry partners..."
              className="flex-1 resize-none bg-transparent px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-hidden max-h-40 leading-relaxed"
            />

            <div className="flex items-center gap-1.5 pr-2.5">
              {/* Inline Speech-to-Text Microphone */}
              <button
                type="button"
                onClick={() => {
                  if (isListening) {
                    stopListening();
                  } else {
                    startListening();
                  }
                }}
                title={isListening ? 'Stop dictation' : 'Dictate with microphone'}
                className={`p-1.5 rounded-md transition ${
                  isListening
                    ? 'bg-red-50 text-red-600 animate-pulse'
                    : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputPrompt.trim() || isGenerating}
                className="p-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:cursor-not-allowed transition shadow-xs"
                title="Send query (Enter)"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
            <span>Press Enter to send, Shift + Enter for new line</span>
            {isListening && (
              <span className="text-red-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                Listening to speech...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
