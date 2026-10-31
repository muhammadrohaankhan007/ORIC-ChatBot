'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useVoice, stopSpeechImmediately } from '@/hooks/useVoice';
import { Mic, MicOff, Volume2, VolumeX, Send, Sparkles, BookOpen, Search, UserCheck, ShieldCheck } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  personaName?: string;
  timestamp: string;
}

const PERSONAS = [
  { id: 'dr-farooq', name: 'Dr. Farooq Siddiqui', title: 'Senior Research Mentor (Pharmaceutics)' },
  { id: 'prof-aisha', name: 'Prof. Aisha Khan', title: 'AI & Data Science Lead (Computing)' },
  { id: 'engr-tariq', name: 'Engr. Tariq Mehmood', title: 'Biomedical Devices & Instrumentation Lead' },
  { id: 'director-oric', name: 'Director ORIC', title: 'Commercialization & IP Advisor' },
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
}

export const ChatView: React.FC<ChatViewProps> = ({
  selectedProject,
  onClearSelectedProject,
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [mode, setMode] = useState<'mentoring' | 'analysis'>('mentoring');
  const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');

  const wsRef = useRef<WebSocket | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    isListening,
    isMuted,
    currentlySpeakingId,
    availableVoices,
    selectedVoiceName,
    changePreferredVoice,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    toggleMute,
  } = useVoice({
    onTranscriptChange: (transcript) => setInputPrompt(transcript),
  });

  const connectWebSocket = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    const wsUrl = `${protocol}//${host}:8000/api/v1/ws/chat`;

    try {
      setConnectionStatus('connecting');
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setConnectionStatus('connected');
        console.log('Connected to SHU ORIC AI Streaming Engine on port 8000');
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
                personaName: data.personaName,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          } else if (data.type === 'token') {
            setMessages((prev) => {
              if (prev.length === 0) return prev;
              const next = [...prev];
              const last = { ...next[next.length - 1] };
              if (last.sender === 'ai') {
                last.text += data.token;
                next[next.length - 1] = last;
              }
              return next;
            });
          } else if (data.type === 'done') {
            setIsGenerating(false);
            setMessages((prev) => {
              if (prev.length === 0) return prev;
              const last = prev[prev.length - 1];
              if (last.sender === 'ai') {
                speakText(last.text, false, last.id, last.personaName || selectedPersona.name);
              }
              return prev;
            });
          } else if (data.type === 'error') {
            setIsGenerating(false);
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                sender: 'ai',
                text: `Error: ${data.message || 'Encountered connection problem.'}`,
                personaName: 'System',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }
        } catch (err) {
          console.error('WS Parse error:', err);
        }
      };

      ws.onerror = (err) => {
        console.warn('WebSocket encountered error, fallback active:', err);
        setConnectionStatus('disconnected');
      };

      ws.onclose = () => {
        setConnectionStatus('disconnected');
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };

      wsRef.current = ws;
    } catch (e) {
      console.error('Failed to instantiate WebSocket:', e);
      setConnectionStatus('disconnected');
    }
  }, [speakText, selectedPersona.name]);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
      stopSpeechImmediately();
    };
  }, [connectWebSocket]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleSendMessage = async () => {
    const trimmed = inputPrompt.trim();
    if (!trimmed || isGenerating) return;

    stopSpeechImmediately();

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsGenerating(true);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const payload = {
        type: 'chat',
        prompt: trimmed,
        mode,
        personaId: selectedPersona.id,
        personaName: selectedPersona.name,
        projectContext: selectedProject ? {
          title: selectedProject.title,
          abstract: selectedProject.abstract,
          technology_stack: selectedProject.technology_stack,
          trl_level: selectedProject.trl_level,
          erl_level: selectedProject.erl_level,
        } : null,
      };
      wsRef.current.send(JSON.stringify(payload));
      return;
    }

    // Resilient REST fallback
    try {
      const res = await fetch('http://localhost:8000/api/v1/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: trimmed,
          mode,
          personaId: selectedPersona.id,
          personaName: selectedPersona.name,
          projectContext: selectedProject,
        }),
      });

      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const data = await res.json();

      const aiResponse = data.response || 'No response returned from model.';
      const msgId = Date.now().toString();

      setMessages((prev) => [
        ...prev,
        {
          id: msgId,
          sender: 'ai',
          text: aiResponse,
          personaName: selectedPersona.name,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      speakText(aiResponse, false, msgId, selectedPersona.name);
    } catch (err: any) {
      console.error('REST fallback error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'ai',
          text: `Gateway notice: Backend connection active on fallback. Details: ${err.message}`,
          personaName: 'System',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsGenerating(false);
      connectWebSocket();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-black text-zinc-100 rounded-md overflow-hidden border border-zinc-800 shadow-2xl font-sans m-4">
      {/* Top Header Bar */}
      <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        {/* Persona Selector */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-950/50 border border-red-800/60 rounded-md">
            <Sparkles className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <select
              value={selectedPersona.id}
              onChange={(e) => {
                const found = PERSONAS.find((p) => p.id === e.target.value);
                if (found) setSelectedPersona(found);
              }}
              className="bg-black text-white font-display font-bold text-sm border border-zinc-800 rounded px-2.5 py-1 focus:outline-none focus:border-red-600"
            >
              {PERSONAS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-zinc-400 mt-0.5">{selectedPersona.title}</p>
          </div>
        </div>

        {selectedProject && (
          <div className="flex items-center gap-2 bg-red-950/40 border border-red-800/60 rounded px-3 py-1 text-xs text-red-300">
            <span>Context: <strong className="text-white">{selectedProject.title || selectedProject.name}</strong></span>
            {onClearSelectedProject && (
              <button onClick={onClearSelectedProject} className="ml-1 text-zinc-400 hover:text-white">✕</button>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Live Status Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border border-zinc-800 bg-zinc-900 shadow-sm font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-red-500 animate-pulse'
                  : connectionStatus === 'connecting'
                  ? 'bg-zinc-400 animate-ping'
                  : 'bg-zinc-600'
              }`}
            />
            <span className="text-[11px] font-medium text-zinc-300">
              {connectionStatus === 'connected'
                ? 'Gemini 3.5 Live'
                : connectionStatus === 'connecting'
                ? 'Connecting...'
                : 'Offline (REST Active)'}
            </span>
          </div>

          {/* Natural Voice Selector */}
          {availableVoices.length > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs">
              <span className="text-[10px] text-red-500 font-mono font-semibold tracking-wider uppercase">Voice</span>
              <select
                value={selectedVoiceName}
                onChange={(e) => changePreferredVoice(e.target.value)}
                className="bg-transparent text-zinc-300 text-xs focus:outline-none max-w-[140px] truncate cursor-pointer"
                title="Select preferred text-to-speech voice"
              >
                <option value="" className="bg-black text-zinc-300">
                  Auto (Natural Neural)
                </option>
                {availableVoices
                  .filter((v) => v.lang.startsWith('en'))
                  .map((v) => (
                    <option key={v.name} value={v.name} className="bg-black text-zinc-300">
                      {v.name.replace(/(Microsoft|Google|English|United States|United Kingdom|\(|\))/gi, '').trim() || v.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="flex bg-zinc-900 p-1 rounded border border-zinc-800 text-xs">
            <button
              onClick={() => setMode('mentoring')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition font-display text-xs ${
                mode === 'mentoring'
                  ? 'bg-red-600 text-white font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Mentoring Mode
            </button>
            <button
              onClick={() => setMode('analysis')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition font-display text-xs ${
                mode === 'analysis'
                  ? 'bg-red-600 text-white font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" /> Research Analysis
            </button>
          </div>

          {/* Mute/Unmute Voice Audio Toggle */}
          <button
            onClick={toggleMute}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs transition font-mono ${
              isMuted
                ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                : 'bg-red-950/40 border-red-800/60 text-red-400 hover:bg-red-900/40'
            }`}
            title={isMuted ? 'Click to enable voice readout' : 'Click to mute voice readout'}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-zinc-400" />
                <span className="hidden sm:inline font-medium">Voice Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-red-500" />
                <span className="hidden sm:inline font-medium">Voice Active</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-black">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto text-zinc-500 space-y-3">
            <UserCheck className="w-12 h-12 text-zinc-700 animate-pulse" />
            <p className="text-sm font-sans text-zinc-400">
              Ask your Virtual Teacher a research query, commercialization milestone question, or press the mic to begin speaking.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-950/40 border border-red-800/50 px-3 py-1 rounded font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-red-500" /> Live Gemini 3.5 Intelligence Engine
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`group relative max-w-[85%] rounded-md px-5 py-3 text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-red-600 text-white font-medium rounded-tr-none shadow-md shadow-red-950/40'
                    : 'bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-tl-none'
                }`}
              >
                {msg.sender === 'ai' && msg.personaName && (
                  <div className="flex items-center justify-between gap-3 mb-1.5 border-b border-zinc-800 pb-1">
                    <span className="block text-[10px] font-mono font-bold tracking-wider uppercase text-red-500">
                      {msg.personaName}
                    </span>
                    <button
                      onClick={() => {
                        if (currentlySpeakingId === msg.id) {
                          stopSpeaking();
                        } else {
                          speakText(msg.text, true, msg.id, msg.personaName || selectedPersona.name);
                        }
                      }}
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] transition font-mono ${
                        currentlySpeakingId === msg.id
                          ? 'bg-red-950/60 text-red-400 font-semibold animate-pulse'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }`}
                      title={currentlySpeakingId === msg.id ? 'Stop reading' : 'Read answer aloud with Natural Voice'}
                    >
                      {currentlySpeakingId === msg.id ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-red-500" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="hidden group-hover:inline">Listen</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
                {msg.sender === 'user' ? (
                  <p className="whitespace-pre-wrap text-white font-medium">{msg.text}</p>
                ) : (
                  <div className="text-zinc-100 text-sm leading-relaxed prose prose-invert max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => (
                          <h1 className="font-display text-base font-bold text-white mt-3 mb-1.5 border-b border-zinc-800 pb-1">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="font-display text-sm font-bold text-white mt-2.5 mb-1 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block" />
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="font-display text-xs font-bold text-zinc-300 mt-2 mb-1 uppercase tracking-wide">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="my-1.5 leading-relaxed text-zinc-200">{children}</p>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-white">{children}</strong>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-outside pl-4 space-y-1 my-1.5 text-zinc-300">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-outside pl-4 space-y-1 my-1.5 text-zinc-300">{children}</ol>
                        ),
                        li: ({ children }) => (
                          <li className="leading-relaxed pl-1">{children}</li>
                        ),
                        code: ({ className, children, ...props }: any) => {
                          const isBlock = String(children).includes('\n') || (className && className.includes('language-'));
                          return isBlock ? (
                            <pre className="my-2 rounded border border-zinc-800 bg-zinc-950 p-2.5 font-mono text-xs text-red-400 overflow-x-auto">
                              <code {...props}>{children}</code>
                            </pre>
                          ) : (
                            <code className="bg-zinc-950 text-red-400 px-1.5 py-0.5 rounded text-xs font-mono border border-zinc-800" {...props}>
                              {children}
                            </code>
                          );
                        },
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-2 border-red-600 pl-3 my-2 text-zinc-300 italic bg-red-950/20 py-1 rounded-r">
                            {children}
                          </blockquote>
                        ),
                      }}
                    >
                      {msg.text || (isGenerating ? 'Analyzing with Google Gemini 3.5...' : '')}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 px-1 font-mono">{msg.timestamp}</span>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-zinc-950 border-t border-zinc-800">
        <div className="flex items-center gap-2 bg-black border border-zinc-800 rounded p-2 focus-within:border-red-600 transition">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`p-2.5 rounded transition ${
              isListening
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
            title={isListening ? 'Stop Voice Recording' : 'Start Voice Input (STT)'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={
              isListening ? 'Listening to speech...' : `Consult ${selectedPersona.name}...`
            }
            className="flex-1 bg-transparent border-none text-sm text-white placeholder-zinc-500 focus:outline-none px-2"
          />

          <button
            onClick={handleSendMessage}
            disabled={!inputPrompt.trim() || isGenerating}
            className="p-2.5 bg-red-600 text-white rounded hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition font-display font-semibold"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
