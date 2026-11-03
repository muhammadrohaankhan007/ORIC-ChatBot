'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Project } from '@/types';
import { useVoiceAgent } from '@/hooks/useVoiceAgent';
import {
  Mic,
  MicOff,
  PhoneOff,
  Sparkles,
  ChevronDown,
  Volume2,
  FolderKanban,
  MessageSquare,
  X,
  Radio,
  Send,
  Globe,
  Pause,
  Play,
  Check,
  SlidersHorizontal,
  Search
} from 'lucide-react';

export interface VoiceAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProject: Project | null;
  onSelectProject: (project: Project | null) => void;
  projects: Project[];
}

export const VoiceAgentModal: React.FC<VoiceAgentModalProps> = ({
  isOpen,
  onClose,
  selectedProject,
  onSelectProject,
  projects,
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isDialectDropdownOpen, setIsDialectDropdownOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [modalFacultyFilter, setModalFacultyFilter] = useState<'ALL' | 'FOP' | 'OTHER'>('ALL');

  const dialectDropdownRef = useRef<HTMLDivElement | null>(null);
  const projectDropdownRef = useRef<HTMLDivElement | null>(null);

  const {
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
    dialects,
    startVoiceAgent,
    endVoiceAgent,
    toggleMicMute,
    togglePause,
    changeDialect,
    changeVoice,
    changeSpeed,
    interruptAndListen,
    sendSpokenPrompt,
    startListeningForUser,
  } = useVoiceAgent({
    selectedProject,
    onProjectChange: onSelectProject,
  });

  // Start call when modal opens, end call completely when modal closes
  useEffect(() => {
    if (isOpen) {
      startVoiceAgent();
    } else {
      endVoiceAgent();
    }
  }, [isOpen, startVoiceAgent, endVoiceAgent]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dialectDropdownRef.current &&
        !dialectDropdownRef.current.contains(e.target as Node)
      ) {
        setIsDialectDropdownOpen(false);
      }
      if (
        projectDropdownRef.current &&
        !projectDropdownRef.current.contains(e.target as Node)
      ) {
        setIsProjectDropdownOpen(false);
      }
    };

    if (isDialectDropdownOpen || isProjectDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDialectDropdownOpen, isProjectDropdownOpen]);

  if (!isOpen) return null;

  // Dedicated clean end-call function that guarantees zero background speech or listening
  const handleEndCall = () => {
    endVoiceAgent();
    onClose();
  };

  // Find active dialect object
  const currentDialectObj =
    dialects.find((d) => d.code === selectedDialect) || dialects[0];

  // Dynamic scale & glow for the central audio orb based on status & volume
  const orbScale = isPaused ? 1.0 : 1 + audioVolume * 0.45;
  const orbGlow = isPaused ? 15 : Math.min(60, 20 + audioVolume * 80);

  const getStatusColor = () => {
    if (isPaused) {
      return 'from-amber-600 via-amber-700 to-zinc-700 shadow-amber-600/30';
    }
    if (isMicMuted) {
      return 'from-orange-600 via-amber-600 to-zinc-700 shadow-orange-600/30';
    }
    switch (status) {
      case 'welcome':
      case 'speaking':
        return 'from-rose-500 via-red-600 to-amber-500 shadow-red-500/50';
      case 'thinking':
        return 'from-purple-500 via-indigo-600 to-pink-500 shadow-purple-500/50';
      case 'listening':
        return 'from-cyan-400 via-blue-600 to-emerald-400 shadow-cyan-500/50';
      default:
        return 'from-zinc-600 to-zinc-700 shadow-zinc-600/30';
    }
  };

  const getStatusLabel = () => {
    if (isPaused) {
      return 'Call Paused (Click to resume)';
    }
    if (isMicMuted) {
      return 'Microphone Muted';
    }
    switch (status) {
      case 'welcome':
        return 'Welcoming you to ORIC...';
      case 'speaking':
        return 'Speaking to you';
      case 'thinking':
        return 'Thinking...';
      case 'listening':
        return transcript
          ? 'Hearing you...'
          : `Listening (${currentDialectObj.shortLabel})...`;
      default:
        return 'Ready';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950/95 backdrop-blur-3xl text-white font-sans overflow-hidden select-none">
      {/* Top Header Controls (Fixed height, shrink-0) */}
      <header className="h-20 shrink-0 px-4 sm:px-8 flex items-center justify-between border-b border-white/10 bg-zinc-950/70 z-20 gap-3">
        {/* Brand / Mode Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-400 flex items-center justify-center shadow-lg shadow-red-600/30">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white">ORIC Voice Agent</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                Live Duplex Voice
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 hidden sm:block">
              Salim Habib University • Conversational Research AI
            </div>
          </div>
        </div>

        {/* Right Header Controls: Dialect Selector + Project Selector + Close Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Voice Dialect & Accent Selector Pill */}
          <div className="relative" ref={dialectDropdownRef}>
            <button
              onClick={() => {
                setIsDialectDropdownOpen((prev) => !prev);
                setIsProjectDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-zinc-200 transition shadow-inner"
              title="Select Voice Dialect & Accent"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-medium hidden sm:inline">{currentDialectObj.flag} {currentDialectObj.shortLabel}</span>
              <span className="font-medium sm:hidden">{currentDialectObj.flag}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {/* Dialect Popover Menu */}
            {isDialectDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-zinc-900 border border-white/15 shadow-2xl p-3 z-50 text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    Voice Dialects & Accents
                  </span>
                  <span className="text-[10px] text-zinc-400">Speech & Voice</span>
                </div>

                <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                  {dialects.map((d) => (
                    <button
                      key={d.code}
                      onClick={() => {
                        changeDialect(d.code);
                        setIsDialectDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-xl transition flex items-center justify-between ${
                        selectedDialect === d.code
                          ? 'bg-red-600 text-white font-semibold'
                          : 'text-zinc-300 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{d.flag}</span>
                        <span>{d.label}</span>
                      </div>
                      {selectedDialect === d.code && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>

                {/* Available Browser Voices for Dialect */}
                {availableVoices.length > 0 && (
                  <div className="pt-2 border-t border-white/10 space-y-1">
                    <label className="text-[10px] text-zinc-400 font-semibold block">
                      Preferred Browser Voice (Optional):
                    </label>
                    <select
                      value={selectedVoiceName}
                      onChange={(e) => changeVoice(e.target.value)}
                      className="w-full bg-zinc-800 border border-white/15 rounded-lg p-1.5 text-[11px] text-zinc-200 focus:outline-hidden"
                    >
                      <option value="">Auto-select highest quality natural voice</option>
                      {availableVoices.map((v) => (
                        <option key={v.name} value={v.name}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Speaking Speed Controls */}
                <div className="pt-2 border-t border-white/10">
                  <div className="text-[10px] text-zinc-400 font-semibold mb-1.5 flex items-center justify-between">
                    <span>Speaking Speed:</span>
                    <span className="font-mono text-zinc-300">{speechSpeed}x</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[0.9, 1.0, 1.05, 1.2].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => changeSpeed(spd)}
                        className={`py-1 rounded-lg text-center text-[11px] font-medium border transition ${
                          speechSpeed === spd
                            ? 'bg-red-600 text-white border-red-500 font-bold'
                            : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Project Selector Pill */}
          <div className="relative" ref={projectDropdownRef}>
            <button
              onClick={() => {
                setIsProjectDropdownOpen((prev) => !prev);
                setIsDialectDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-zinc-200 transition shadow-inner max-w-[180px] sm:max-w-sm"
              title="Ground Voice Agent in a Project"
            >
              <FolderKanban className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span className="truncate font-medium">
                {selectedProject ? selectedProject.title : 'All Projects'}
              </span>
              {selectedProject && (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-600/40 text-red-200 font-mono hidden sm:inline shrink-0">
                  TRL {selectedProject.trl_level}/9
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            </button>

            {/* Project Switcher Dropdown */}
            {isProjectDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-zinc-900 border border-white/15 shadow-2xl p-2 z-50 text-xs space-y-1.5">
                <div className="px-2 pt-1 pb-2 border-b border-white/10 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
                    Ground Voice in Project
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {projects.length} Available
                  </span>
                </div>

                {/* Faculty Category Filters */}
                <div className="flex items-center gap-1 px-1">
                  {[
                    { code: 'ALL', label: 'All' },
                    { code: 'FOP', label: `Pharmacy (${projects.filter(p => p.faculty_code === 'FOP').length})` },
                    { code: 'OTHER', label: 'Other' },
                  ].map((tab) => (
                    <button
                      key={tab.code}
                      onClick={() => setModalFacultyFilter(tab.code as any)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
                        modalFacultyFilter === tab.code
                          ? 'bg-red-600 text-white font-semibold'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Filter Search Input */}
                <div className="relative px-1">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    placeholder="Search 230+ projects or leads..."
                    className="w-full bg-zinc-800 border border-white/15 rounded-lg pl-7 pr-2.5 py-1.5 text-[11px] text-zinc-200 placeholder-zinc-500 focus:outline-hidden"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                  <button
                    onClick={() => {
                      onSelectProject(null);
                      setIsProjectDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between ${
                      !selectedProject
                        ? 'bg-red-600 text-white font-semibold'
                        : 'text-zinc-300 hover:bg-white/5'
                    }`}
                  >
                    <span>General ORIC Guidance (All Faculty)</span>
                  </button>

                  {projects
                    .filter((proj) => {
                      if (modalFacultyFilter === 'FOP' && proj.faculty_code !== 'FOP') return false;
                      if (modalFacultyFilter === 'OTHER' && proj.faculty_code === 'FOP') return false;
                      if (!projectSearch.trim()) return true;
                      const q = projectSearch.toLowerCase();
                      return (
                        proj.title.toLowerCase().includes(q) ||
                        proj.lead_investigator.toLowerCase().includes(q) ||
                        proj.department.toLowerCase().includes(q) ||
                        proj.project_code.toLowerCase().includes(q)
                      );
                    })
                    .map((proj) => (
                      <button
                        key={proj.id}
                        onClick={() => {
                          onSelectProject(proj);
                          setIsProjectDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl transition flex flex-col gap-0.5 ${
                          selectedProject?.id === proj.id
                            ? 'bg-red-600 text-white font-semibold'
                            : 'text-zinc-300 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate font-medium">{proj.title}</span>
                          <span className="text-[10px] font-mono shrink-0 ml-2 opacity-80">
                            TRL {proj.trl_level}/9
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 truncate">
                          {proj.lead_investigator} • {proj.department || proj.faculty}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Close Button with Safe Full Teardown */}
          <button
            onClick={handleEndCall}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition"
            title="Exit Voice Call"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Central Interactive Canvas (flex-1, centered, overflow-hidden) */}
      <main className="flex-1 min-h-0 flex flex-col items-center justify-center px-6 text-center space-y-4 sm:space-y-5 relative z-10">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-300 tracking-wide">
          <span
            className={`w-2 h-2 rounded-full ${
              isPaused
                ? 'bg-amber-500 animate-pulse'
                : isMicMuted
                ? 'bg-orange-500'
                : status === 'speaking' || status === 'welcome'
                ? 'bg-rose-500 animate-ping'
                : status === 'listening'
                ? 'bg-cyan-400 animate-pulse'
                : status === 'thinking'
                ? 'bg-purple-500 animate-spin'
                : 'bg-zinc-500'
            }`}
          />
          <span>{getStatusLabel()}</span>
        </div>

        {/* Central Glowing Pulsing Audio Orb (Gemini Style) */}
        <div className="relative flex items-center justify-center py-2">
          {/* Ambient Outer Halo */}
          <div
            className={`absolute w-56 h-56 rounded-full bg-gradient-to-tr ${getStatusColor()} blur-3xl opacity-30 transition-all duration-300`}
            style={{
              transform: `scale(${orbScale * 1.2})`,
            }}
          />

          {/* Core Interactive Glowing Orb */}
          <div
            className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br ${getStatusColor()} shadow-2xl transition-transform duration-150 flex items-center justify-center relative cursor-pointer`}
            style={{
              transform: `scale(${orbScale})`,
              boxShadow: `0 0 ${orbGlow}px rgba(239, 68, 68, 0.45)`,
            }}
            onClick={() => {
              if (isPaused) {
                togglePause();
              } else if (isMicMuted) {
                toggleMicMute();
              } else if (status === 'speaking' || status === 'welcome') {
                interruptAndListen();
              } else if (status === 'paused' || status === 'idle') {
                startListeningForUser();
              }
            }}
            title={
              isPaused
                ? 'Call is paused. Click to resume'
                : isMicMuted
                ? 'Microphone is muted. Click to unmute'
                : status === 'speaking' || status === 'welcome'
                ? 'Click to interrupt and speak'
                : 'Click to speak'
            }
          >
            {/* Inner dynamic rings */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-white/30 backdrop-blur-md flex items-center justify-center">
              {isPaused ? (
                <Play className="w-8 h-8 text-white ml-1 animate-pulse" />
              ) : isMicMuted ? (
                <MicOff className="w-8 h-8 text-white" />
              ) : status === 'speaking' || status === 'welcome' ? (
                <Volume2 className="w-8 h-8 text-white animate-bounce" />
              ) : status === 'thinking' ? (
                <Sparkles className="w-8 h-8 text-white animate-spin" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </div>
          </div>
        </div>

        {/* Quick Action Hints beneath Orb */}
        <div className="h-6 flex items-center justify-center">
          {isPaused && (
            <button
              onClick={togglePause}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs text-amber-300 transition"
            >
              <Play className="w-3 h-3" />
              <span>Resume Call</span>
            </button>
          )}
          {!isPaused && isMicMuted && (
            <button
              onClick={toggleMicMute}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-xs text-orange-300 transition"
            >
              <Mic className="w-3 h-3" />
              <span>Unmute Microphone</span>
            </button>
          )}
          {!isPaused && !isMicMuted && (status === 'speaking' || status === 'welcome') && (
            <button
              onClick={interruptAndListen}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs text-zinc-300 transition"
            >
              <span>Tap to Interrupt & Speak</span>
            </button>
          )}
          {!isPaused && !isMicMuted && status === 'listening' && transcript && (
            <button
              onClick={() => sendSpokenPrompt(transcript)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <Send className="w-3 h-3" />
              <span>Send Now</span>
            </button>
          )}
          {!isPaused && !isMicMuted && status === 'listening' && !transcript && (
            <span className="text-xs text-zinc-400 animate-pulse">
              Listening in {currentDialectObj.shortLabel}... Speak into your mic
            </span>
          )}
        </div>

        {/* Audio Waveform Bars when listening / speaking */}
        <div className="flex items-center gap-1.5 h-5">
          {[0.2, 0.5, 0.8, 0.4, 0.9, 0.6, 0.3, 0.7, 0.5, 0.3].map((factor, i) => {
            const barHeight = isPaused || isMicMuted
              ? 4
              : Math.max(4, Math.min(20, 4 + audioVolume * 20 * factor));
            return (
              <span
                key={i}
                className="w-1 rounded-full bg-gradient-to-t from-red-600 to-rose-400 transition-all duration-75"
                style={{ height: `${barHeight}px` }}
              />
            );
          })}
        </div>

        {/* Live Spoken Text Display - Clamped to 3 lines */}
        <div className="w-full max-w-xl h-24 flex flex-col items-center justify-center px-4 overflow-hidden">
          {transcript ? (
            <p className="text-base sm:text-lg font-medium text-white transition-opacity leading-snug line-clamp-3 text-center">
              &ldquo;{transcript}&rdquo;
            </p>
          ) : lastAgentText ? (
            <p className="text-sm sm:text-base text-zinc-200 leading-snug font-normal line-clamp-3 text-center">
              {lastAgentText}
            </p>
          ) : (
            <p className="text-sm text-zinc-500 italic text-center">
              Speak naturally. I am listening...
            </p>
          )}

          {lastUserText && !transcript && (
            <div className="text-[11px] text-zinc-500 truncate pt-1 max-w-md">
              You asked: &ldquo;{lastUserText}&rdquo;
            </div>
          )}

          {!speechSupported && (
            <div className="text-[11px] text-amber-400 bg-amber-950/40 border border-amber-500/30 px-3 py-1 rounded-lg mt-1">
              Notice: Web Speech API is best supported in Google Chrome, Edge, and modern Chromium browsers.
            </div>
          )}
        </div>
      </main>

      {/* Expandable Conversation Transcript Drawer */}
      {showHistory && (
        <div className="absolute right-4 sm:right-6 top-24 bottom-28 w-80 sm:w-96 rounded-2xl bg-zinc-900/95 border border-white/10 shadow-2xl backdrop-blur-xl p-4 flex flex-col z-30 animate-in fade-in slide-in-from-right-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-red-500" />
              Dialogue History
            </span>
            <button
              onClick={() => setShowHistory(false)}
              className="text-zinc-400 hover:text-white text-xs"
            >
              Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-3 text-xs">
            {turns.length === 0 ? (
              <div className="text-zinc-500 text-center py-8">No dialogue yet.</div>
            ) : (
              turns.map((turn) => (
                <div
                  key={turn.id}
                  className={`p-2.5 rounded-xl ${
                    turn.sender === 'user'
                      ? 'bg-white/10 ml-6 text-zinc-100'
                      : 'bg-red-950/40 border border-red-500/20 mr-6 text-zinc-200'
                  }`}
                >
                  <div className="text-[10px] text-zinc-400 mb-1 flex items-center justify-between font-mono">
                    <span>{turn.sender === 'user' ? 'You' : 'ORIC Advisor'}</span>
                    <span>{turn.timestamp}</span>
                  </div>
                  <div className="leading-relaxed">{turn.text}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Bottom Floating Control Bar with Mute, Pause, and End Call */}
      <footer className="h-24 shrink-0 px-6 flex items-center justify-center gap-4 sm:gap-6 border-t border-white/10 bg-zinc-950/70 z-20">
        {/* 1. Toggle Dialogue Drawer */}
        <button
          onClick={() => setShowHistory((prev) => !prev)}
          className={`p-3.5 rounded-full border transition ${
            showHistory
              ? 'bg-white text-zinc-950 border-white'
              : 'bg-zinc-900/80 text-zinc-300 border-white/15 hover:bg-zinc-800 hover:text-white'
          }`}
          title="Toggle conversation transcript"
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        {/* 2. Microphone Mute / Unmute Toggle */}
        <button
          onClick={toggleMicMute}
          className={`p-4 rounded-full border transition shadow-lg ${
            isMicMuted
              ? 'bg-orange-600 text-white border-orange-500 shadow-orange-600/40'
              : 'bg-zinc-900/80 text-white border-white/20 hover:bg-zinc-800'
          }`}
          title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {isMicMuted ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
        </button>

        {/* 3. Pause / Resume Call Toggle */}
        <button
          onClick={togglePause}
          className={`p-4 rounded-full border transition shadow-lg ${
            isPaused
              ? 'bg-amber-600 text-white border-amber-500 shadow-amber-600/40'
              : 'bg-zinc-900/80 text-white border-white/20 hover:bg-zinc-800'
          }`}
          title={isPaused ? 'Resume conversation' : 'Pause conversation'}
        >
          {isPaused ? <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" /> : <Pause className="w-5 h-5 sm:w-6 sm:h-6" />}
        </button>

        {/* 4. End Call Button (Guaranteed complete immediate teardown) */}
        <button
          onClick={handleEndCall}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition shadow-xl shadow-red-600/40 flex items-center justify-center hover:scale-105 active:scale-95"
          title="End voice conversation"
        >
          <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </footer>
    </div>
  );
};

export default VoiceAgentModal;
