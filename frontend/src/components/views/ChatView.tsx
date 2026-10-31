'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Project, Persona, ChatMessage, ChatMode } from '@/types';
import { sendChatMessage } from '@/services/api';
import { useVoice } from '@/hooks/useVoice';
import { 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  BookOpen, 
  Volume2, 
  RotateCcw, 
  ChevronDown, 
  ExternalLink,
  Bot
} from 'lucide-react';

interface ChatViewProps {
  personas: Persona[];
  projects: Project[];
  selectedProject: Project | null;
  onClearSelectedProject: () => void;
  voiceGlobalEnabled: boolean;
}

export default function ChatView({
  personas,
  projects,
  selectedProject,
  onClearSelectedProject,
  voiceGlobalEnabled
}: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      agent_name: 'Dr. Farooq Siddiqui',
      content: 'Welcome to the SHU ORIC AI Multi-Agent Intelligence Ecosystem! I can guide you through Salim Habib University’s research portfolio, evaluate commercialization feasibility, or match projects to industries in Korangi and S.I.T.E. You can type or use the voice button below.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: ['Salim Habib University ORIC Repository (2026)'],
      suggested_actions: [
        'Which SHU projects have high commercial potential?',
        'Scan Karachi Industry Radar for pharmaceutical partners',
        'Assess ERL for Nanoparticle Oncology'
      ]
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('research');
  const [selectedPersona, setSelectedPersona] = useState<Persona>(personas[0] || null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hook up Web Speech API for voice input
  const { isListening, startListening, stopListening, speak, isSupported } = useVoice({
    onTranscript: (spokenText) => {
      setInput(spokenText);
    },
    lang: selectedPersona?.voiceLang || 'en-US'
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    if (isListening) {
      stopListening();
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: chatMode
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const result = await sendChatMessage({
        message: query,
        mode: chatMode,
        persona_slug: selectedPersona?.slug || 'pharmacy_mentor',
        project_context_id: selectedProject?.id
      });

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        agent_name: result.agent,
        content: result.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: chatMode,
        citations: result.citations,
        suggested_actions: result.suggested_actions
      };

      setMessages(prev => [...prev, assistantMsg]);

      // If voice enabled globally, speak the summary
      if (voiceGlobalEnabled) {
        speak(result.response.slice(0, 200), selectedPersona?.voiceLang || 'en-US');
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'system',
        content: 'Failed to connect to the agent gateway. Please check your backend connection.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        agent_name: selectedPersona?.name || 'ORIC AI',
        content: `Conversation reset. I am ${selectedPersona?.name}. How can I assist you with Salim Habib University’s research and commercialization today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-900">
      {/* Top Controls Toolbar */}
      <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setChatMode('conversational')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                chatMode === 'conversational'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Conversational Mode
            </button>
            <button
              onClick={() => setChatMode('research')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                chatMode === 'research'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Research Mode</span>
            </button>
          </div>

          {/* Virtual Teacher Persona Dropdown */}
          <div className="relative inline-block">
            <select
              value={selectedPersona?.slug}
              onChange={(e) => {
                const p = personas.find(x => x.slug === e.target.value);
                if (p) setSelectedPersona(p);
              }}
              className="appearance-none bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold py-2 pl-3 pr-8 rounded-xl focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {personas.map((persona) => (
                <option key={persona.id} value={persona.slug}>
                  {persona.avatar} {persona.name} ({persona.facultyCode})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Project Context Badge if Selected */}
          {selectedProject && (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-medium">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="truncate max-w-xs">{selectedProject.title}</span>
              <button
                onClick={onClearSelectedProject}
                className="hover:text-white ml-1 font-bold"
                title="Clear project context"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <button
          onClick={clearChat}
          className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold shadow-md ${
                  isUser
                    ? 'bg-amber-500 text-slate-950 font-mono'
                    : 'bg-slate-800 border border-slate-700 text-slate-200'
                }`}
              >
                {isUser ? 'ME' : <Bot className="w-5 h-5 text-amber-400" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">
                    {isUser ? 'You' : msg.agent_name || 'SHU ORIC Agent'}
                  </span>
                  <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                  {!isUser && msg.mode && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 uppercase">
                      {msg.mode}
                    </span>
                  )}
                </div>

                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    isUser
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-lg'
                  }`}
                >
                  {msg.content}
                </div>

                {/* Citations & Sources */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                    <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      <span>Verified Sources & Citations:</span>
                    </div>
                    <ul className="text-xs text-slate-400 space-y-0.5 list-disc list-inside">
                      {msg.citations.map((cite, i) => (
                        <li key={i}>{cite}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Suggestions */}
                {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {msg.suggested_actions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(act)}
                        className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition"
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                )}

                {/* Read aloud button */}
                {!isUser && (
                  <button
                    onClick={() => speak(msg.content, selectedPersona?.voiceLang || 'en-US')}
                    className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 transition"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Read Aloud</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-3xl mr-auto">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>{selectedPersona?.name} is analyzing university intelligence...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-slate-950/80 border-t border-slate-800 shrink-0">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Quick Prompts Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-400 scrollbar-none">
            <span className="shrink-0 font-semibold text-slate-400">Suggested:</span>
            <button
              onClick={() => handleSend('Compare the commercial potential of all active SHU projects.')}
              className="shrink-0 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-slate-200 transition"
            >
              Compare All Projects
            </button>
            <button
              onClick={() => handleSend('Which companies in Korangi Industrial Area match our Pharmacy R&D?')}
              className="shrink-0 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-slate-200 transition"
            >
              Korangi Industrial Match
            </button>
            <button
              onClick={() => handleSend('Give me a 3-year market forecast for the AI fabric inspection system.')}
              className="shrink-0 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-slate-200 transition"
            >
              3-Year Forecast
            </button>
          </div>

          <div className="relative rounded-2xl bg-slate-900 border border-slate-800 focus-within:border-amber-500 shadow-xl overflow-hidden transition">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening
                  ? 'Listening to your voice... (speak in English or Urdu)'
                  : `Ask ${selectedPersona?.name} about research, patents, or commercialization (Press Enter to send)...`
              }
              rows={2}
              className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none resize-none"
            />

            <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-amber-400">Active Persona:</span>
                <span>{selectedPersona?.name}</span>
                {isListening && (
                  <span className="flex items-center gap-1.5 text-rose-400 font-bold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Live Audio Recording
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Voice Input Mic Button */}
                {isSupported && (
                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    className={`p-2 rounded-xl transition ${
                      isListening
                        ? 'bg-rose-500 text-white animate-bounce shadow-lg shadow-rose-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                    }`}
                    title={isListening ? 'Stop Listening' : 'Voice Input (Mic)'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                )}

                {/* Send Button */}
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

