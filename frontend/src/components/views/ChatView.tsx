'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useVoice, stopSpeechImmediately } from '@/hooks/useVoice';
import { getApiBaseUrl } from '@/services/api';
import { Project } from '@/types';
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
  Radio,
  FolderKanban,
  Search,
  ChevronDown,
  X,
  FlaskConical,
  GraduationCap
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
  projects?: Project[];
  selectedProject?: Project | null;
  onSelectProject?: (project: Project | null) => void;
  onClearSelectedProject?: () => void;
  voiceGlobalEnabled?: boolean;
  onOpenVoiceAgent?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  projects = [],
  selectedProject,
  onSelectProject,
  onClearSelectedProject,
  onOpenVoiceAgent,
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedDomain, setSelectedDomain] = useState(RESEARCH_DOMAINS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [selectedFacultyTab, setSelectedFacultyTab] = useState<'ALL' | 'FOP' | 'FCS' | 'FE' | 'FMS'>('ALL');
  const [emptyStateProjectSearch, setEmptyStateProjectSearch] = useState('');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const sessionIdRef = useRef<string>('');
  const wsRef = useRef<WebSocket | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const settingsRef = useRef<HTMLDivElement | null>(null);
  const projectDropdownRef = useRef<HTMLDivElement | null>(null);

  // Filter projects for dropdown & quick search
  const filteredProjects = projects.filter((p) => {
    const matchesFaculty = selectedFacultyTab === 'ALL' || p.faculty_code === selectedFacultyTab;
    if (!matchesFaculty) return false;
    if (!projectSearch.trim()) return true;
    const q = projectSearch.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.lead_investigator.toLowerCase().includes(q) ||
      p.department.toLowerCase().includes(q) ||
      p.project_code.toLowerCase().includes(q) ||
      p.technology_stack?.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleSelectProject = (proj: Project | null) => {
    onSelectProject?.(proj);
    setIsProjectDropdownOpen(false);
  };

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

  // Click outside to close settings and project dropdown popovers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false);
      }
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(e.target as Node)) {
        setIsProjectDropdownOpen(false);
      }
    };
    if (isSettingsOpen || isProjectDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSettingsOpen, isProjectDropdownOpen]);

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

        {/* Controls: Live Voice Call, Project Selector, New Chat, Domain Selector & Settings Popover */}
        <div className="flex items-center gap-2">
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

          {/* Project Grounding Selector Pill & Searchable Popover */}
          <div className="relative" ref={projectDropdownRef}>
            <button
              onClick={() => {
                setIsProjectDropdownOpen(!isProjectDropdownOpen);
                setIsSettingsOpen(false);
              }}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition shadow-xs ${
                selectedProject
                  ? 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100'
                  : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
              title="Ground AI in a specific research project (230+ projects)"
            >
              <FolderKanban className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span className="max-w-[110px] sm:max-w-[160px] truncate">
                {selectedProject ? selectedProject.title : `Select Project (${projects.length})`}
              </span>
              <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0" />
            </button>

            {/* Project Switcher Dropdown Popover */}
            {isProjectDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-zinc-200 shadow-xl p-3 z-50 text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <span className="font-bold text-zinc-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <FolderKanban className="w-3.5 h-3.5 text-red-600" />
                    Ground AI in Project
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {projects.length} Total
                  </span>
                </div>

                {/* Faculty filter tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
                  {[
                    { code: 'ALL', label: 'All' },
                    { code: 'FOP', label: 'Pharmacy (230+)' },
                    { code: 'FCS', label: 'CS & AI' },
                    { code: 'FE', label: 'Engineering' },
                    { code: 'FMS', label: 'Management' },
                  ].map((tab) => (
                    <button
                      key={tab.code}
                      onClick={() => setSelectedFacultyTab(tab.code as any)}
                      className={`px-2 py-0.5 rounded-md whitespace-nowrap transition ${
                        selectedFacultyTab === tab.code
                          ? 'bg-red-600 text-white font-semibold'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Search bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    placeholder="Search 230+ projects or supervisors..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-8 pr-7 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-hidden focus:border-red-400"
                    autoFocus
                  />
                  {projectSearch && (
                    <button
                      onClick={() => setProjectSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Project list */}
                <div className="max-h-64 overflow-y-auto space-y-1 pr-0.5">
                  <button
                    onClick={() => handleSelectProject(null)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg transition flex items-center justify-between ${
                      !selectedProject
                        ? 'bg-red-50 text-red-700 font-semibold border border-red-200'
                        : 'text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <span>General ORIC Inquiries (All Faculty)</span>
                    {!selectedProject && <Check className="w-3.5 h-3.5 text-red-600" />}
                  </button>

                  {filteredProjects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectProject(p)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg transition flex flex-col gap-0.5 ${
                        selectedProject?.id === p.id
                          ? 'bg-red-50 text-red-700 font-semibold border border-red-200'
                          : 'text-zinc-700 hover:bg-zinc-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-medium text-zinc-900 truncate">{p.title}</span>
                        <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-100 text-zinc-600 shrink-0">
                          TRL {p.trl_level}/9
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-500 truncate flex items-center gap-1.5">
                        <span className="text-red-600 font-medium">{p.faculty_code}</span>
                        <span>•</span>
                        <span>{p.lead_investigator}</span>
                        <span>•</span>
                        <span className="truncate">{p.department}</span>
                      </div>
                    </button>
                  ))}

                  {filteredProjects.length === 0 && (
                    <div className="text-center text-zinc-400 py-4 text-xs">
                      No matching projects found.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

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

            {/* Live Voice Agent Callout Card in Empty State */}
            {onOpenVoiceAgent && (
              <div className="pt-1">
                <button
                  onClick={onOpenVoiceAgent}
                  className="w-full max-w-lg mx-auto p-4 rounded-xl border border-red-200 bg-gradient-to-r from-red-50/70 via-white to-rose-50/70 hover:border-red-300 text-left transition flex items-center justify-between shadow-xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/30 group-hover:scale-105 transition shrink-0">
                      <Radio className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                        <span>Talk with Live Voice Agent</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">Gemini Voice</span>
                      </div>
                      <div className="text-xs text-zinc-500 line-clamp-1">
                        Hands-free spoken voice conversation with instant audio answers.
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-red-600 group-hover:translate-x-1 transition shrink-0 ml-3" />
                </button>
              </div>
            )}

            {selectedProject ? (
              /* Active Selected Project Card with Tailored Questions */
              <div className="bg-red-50/60 border border-red-200 rounded-xl p-5 text-left space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-600 text-white">
                    Active Research Grounding
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white text-zinc-700 border border-red-200">
                      TRL {selectedProject.trl_level}/9 • ERL {selectedProject.erl_level}/9
                    </span>
                    {onClearSelectedProject && (
                      <button
                        onClick={onClearSelectedProject}
                        className="text-xs text-zinc-500 hover:text-red-600 transition underline"
                      >
                        Change
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-zinc-900 leading-snug">
                    {selectedProject.title}
                  </h3>
                  <div className="text-xs text-zinc-600 mt-1">
                    Lead: <span className="font-semibold text-zinc-800">{selectedProject.lead_investigator}</span> • {selectedProject.department} ({selectedProject.faculty})
                  </div>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed line-clamp-2">
                  {selectedProject.abstract}
                </p>

                {onOpenVoiceAgent && (
                  <button
                    onClick={onOpenVoiceAgent}
                    className="w-full py-2 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition shadow-xs"
                  >
                    <Radio className="w-4 h-4 text-white animate-pulse" />
                    <span>Talk about this project with Live Voice Agent</span>
                  </button>
                )}

                <div className="pt-2 border-t border-red-200/60 space-y-2">
                  <div className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider">
                    Suggested Research Questions:
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      `Summarize the formulation mechanism and expected drug delivery outcomes of "${selectedProject.title}"`,
                      `What are the DRAP (Drug Regulatory Authority of Pakistan) compliance requirements for this project?`,
                      `How can we advance this project from TRL ${selectedProject.trl_level}/9 to clinical/commercial readiness?`,
                    ].map((promptText, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setInputPrompt(promptText);
                          handleSendMessage(promptText);
                        }}
                        className="p-2.5 rounded-lg border border-red-200/80 bg-white hover:bg-red-50 text-xs text-zinc-800 font-medium transition flex items-center justify-between group shadow-2xs"
                      >
                        <span className="line-clamp-1">{promptText}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-red-500 group-hover:translate-x-0.5 transition shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* No Project Selected: Select Project Section + Prompt Chips */
              <div className="space-y-4">
                {/* Project Quick-Selector Section */}
                <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/70 text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FolderKanban className="w-3.5 h-3.5 text-red-600" />
                      Select a Research Project to Ground AI ({projects.length} available)
                    </span>
                    <span className="text-[11px] text-zinc-500 font-medium hidden sm:inline">
                      232 Pharmacy Initiatives
                    </span>
                  </div>

                  {/* Empty state search input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={emptyStateProjectSearch}
                      onChange={(e) => setEmptyStateProjectSearch(e.target.value)}
                      placeholder="Search 230+ projects by title, supervisor, drug/formulation, or keyword..."
                      className="w-full bg-white border border-zinc-200 rounded-lg pl-8 pr-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-hidden focus:border-red-400 shadow-2xs"
                    />
                  </div>

                  {/* 6 Quick Project Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {projects
                      .filter((p) => {
                        if (!emptyStateProjectSearch.trim()) return true;
                        const q = emptyStateProjectSearch.toLowerCase();
                        return (
                          p.title.toLowerCase().includes(q) ||
                          p.lead_investigator.toLowerCase().includes(q) ||
                          p.department.toLowerCase().includes(q) ||
                          p.project_code.toLowerCase().includes(q) ||
                          p.technology_stack?.some((t) => t.toLowerCase().includes(q))
                        );
                      })
                      .slice(0, 6)
                      .map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleSelectProject(p)}
                          className="p-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-red-50/50 hover:border-red-300 transition text-left space-y-1 shadow-2xs group"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-zinc-900 truncate group-hover:text-red-700">
                              {p.title}
                            </span>
                            <span className="text-[9px] font-mono px-1 rounded bg-zinc-100 text-zinc-600 shrink-0">
                              {p.faculty_code}
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-500 truncate">
                            {p.lead_investigator} • {p.department}
                          </div>
                        </button>
                      ))}
                  </div>
                </div>

                {/* 4 Actionable Prompt Chips */}
                <div className="text-left space-y-1.5 pt-1">
                  <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                    Or Ask General Inquiries:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
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
              </div>
            )}
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
              {/* Direct Live Voice Agent Call Button in Composer */}
              {onOpenVoiceAgent && (
                <button
                  type="button"
                  onClick={onOpenVoiceAgent}
                  title="Talk directly with the Live Voice Agent"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 font-semibold text-xs transition shadow-xs"
                >
                  <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
                  <span className="hidden sm:inline">Voice Agent</span>
                </button>
              )}

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
