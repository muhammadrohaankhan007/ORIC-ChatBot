'use client';

import React, { useState, useEffect } from 'react';
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
  Send
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

  const {
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
    interruptAndListen,
    sendSpokenPrompt,
    startListeningForUser,
  } = useVoiceAgent({
    selectedProject,
    onProjectChange: onSelectProject,
  });

  // Start call when modal opens, end call when modal closes
  useEffect(() => {
    if (isOpen) {
      startVoiceAgent();
    } else {
      endVoiceAgent();
    }
  }, [isOpen, startVoiceAgent, endVoiceAgent]);

  if (!isOpen) return null;

  // Calculate dynamic scale & glow for the central audio orb based on status & volume
  const orbScale = 1 + audioVolume * 0.45;
  const orbGlow = Math.min(60, 20 + audioVolume * 80);

  const getStatusColor = () => {
    switch (status) {
      case 'welcome':
      case 'speaking':
        return 'from-rose-500 via-red-600 to-amber-500 shadow-red-500/50';
      case 'thinking':
        return 'from-purple-500 via-indigo-600 to-pink-500 shadow-purple-500/50';
      case 'listening':
        return 'from-cyan-400 via-blue-600 to-emerald-400 shadow-cyan-500/50';
      case 'paused':
      default:
        return 'from-zinc-600 to-zinc-700 shadow-zinc-600/30';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'welcome':
        return 'Welcoming you to ORIC...';
      case 'speaking':
        return 'Speaking to you';
      case 'thinking':
        return 'Thinking...';
      case 'listening':
        return transcript ? 'Hearing you...' : 'Listening to your voice...';
      case 'paused':
        return 'Microphone Muted';
      default:
        return 'Ready';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-2xl text-white font-sans selection:bg-red-600 selection:text-white transition-opacity">
      {/* Top Header Controls */}
      <div className="absolute top-0 inset-x-0 h-20 px-6 sm:px-10 flex items-center justify-between border-b border-white/10 bg-zinc-950/40 z-20">
        {/* Brand / Mode Badge */}
        <div className="flex items-center gap-3">
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
            <div className="text-[11px] text-zinc-400">Salim Habib University • Conversational Research AI</div>
          </div>
        </div>

        {/* Project Selector Pill */}
        <div className="relative">
          <button
            onClick={() => setIsProjectDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-zinc-200 transition shadow-inner"
          >
            <FolderKanban className="w-3.5 h-3.5 text-red-400" />
            <span className="max-w-[180px] sm:max-w-xs truncate font-medium">
              {selectedProject ? selectedProject.title : 'All Projects (General ORIC)'}
            </span>
            {selectedProject && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-600/40 text-red-200 font-mono">
                TRL {selectedProject.trl_level}/9
              </span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {/* Project Switcher Dropdown */}
          {isProjectDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-zinc-900 border border-white/15 shadow-2xl p-2 z-50 text-xs space-y-1">
              <div className="px-3 py-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-white/10">
                Ground Voice Agent in a Project:
              </div>
              <button
                onClick={() => {
                  onSelectProject(null);
                  setIsProjectDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition flex items-center justify-between ${
                  !selectedProject
                    ? 'bg-red-600 text-white font-semibold'
                    : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                <span>General ORIC Guidance (All Faculty)</span>
              </button>
              {projects.map((proj) => (
                <button
                  key={proj.id}
                  onClick={() => {
                    onSelectProject(proj);
                    setIsProjectDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition flex flex-col gap-0.5 ${
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
                    {proj.lead_investigator} • {proj.faculty}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition"
          title="Exit Voice Call"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Central Interactive Canvas */}
      <div className="flex flex-col items-center justify-center max-w-2xl w-full px-6 text-center space-y-7 z-10">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-300 tracking-wide">
          <span
            className={`w-2 h-2 rounded-full ${
              status === 'speaking' || status === 'welcome'
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
        <div className="relative flex items-center justify-center py-4">
          {/* Ambient Outer Halo */}
          <div
            className={`absolute w-60 h-60 rounded-full bg-gradient-to-tr ${getStatusColor()} blur-3xl opacity-30 transition-all duration-300`}
            style={{
              transform: `scale(${orbScale * 1.2})`,
            }}
          />

          {/* Core Interactive Glowing Orb */}
          <div
            className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-br ${getStatusColor()} shadow-2xl transition-transform duration-150 flex items-center justify-center relative cursor-pointer`}
            style={{
              transform: `scale(${orbScale})`,
              boxShadow: `0 0 ${orbGlow}px rgba(239, 68, 68, 0.45)`,
            }}
            onClick={() => {
              if (status === 'speaking' || status === 'welcome') {
                interruptAndListen();
              } else if (status === 'paused' || status === 'idle') {
                startListeningForUser();
              }
            }}
            title={
              status === 'speaking' || status === 'welcome'
                ? 'Click to interrupt and speak'
                : 'Click to speak'
            }
          >
            {/* Inner dynamic rings */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border border-white/30 backdrop-blur-md flex items-center justify-center">
              {status === 'speaking' || status === 'welcome' ? (
                <Volume2 className="w-10 h-10 text-white animate-bounce" />
              ) : status === 'thinking' ? (
                <Sparkles className="w-10 h-10 text-white animate-spin" />
              ) : (
                <Mic className="w-10 h-10 text-white" />
              )}
            </div>
          </div>
        </div>

        {/* Quick Action Hints beneath Orb */}
        <div className="h-6">
          {(status === 'speaking' || status === 'welcome') && (
            <button
              onClick={interruptAndListen}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs text-zinc-300 transition"
            >
              <span>Tap to Interrupt & Speak</span>
            </button>
          )}
          {status === 'listening' && transcript && (
            <button
              onClick={() => sendSpokenPrompt(transcript)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <Send className="w-3 h-3" />
              <span>Send Now</span>
            </button>
          )}
          {status === 'listening' && !transcript && (
            <span className="text-xs text-zinc-400 animate-pulse">
              Listening... Speak freely into your mic
            </span>
          )}
        </div>

        {/* Audio Waveform Bars when listening / speaking */}
        <div className="flex items-center gap-1.5 h-6">
          {[0.2, 0.5, 0.8, 0.4, 0.9, 0.6, 0.3, 0.7, 0.5, 0.3].map((factor, i) => {
            const barHeight = Math.max(4, Math.min(24, 4 + audioVolume * 24 * factor));
            return (
              <span
                key={i}
                className="w-1 rounded-full bg-gradient-to-t from-red-600 to-rose-400 transition-all duration-75"
                style={{ height: `${barHeight}px` }}
              />
            );
          })}
        </div>

        {/* Live Spoken Transcription Display */}
        <div className="min-h-[80px] w-full max-w-lg space-y-2">
          {transcript ? (
            /* Live User Speaking in Real-time */
            <p className="text-lg font-medium text-white transition-opacity leading-relaxed">
              &ldquo;{transcript}&rdquo;
            </p>
          ) : lastAgentText ? (
            /* Last Agent Spoken Statement */
            <p className="text-sm sm:text-base text-zinc-200 leading-relaxed font-normal">
              {lastAgentText}
            </p>
          ) : (
            <p className="text-sm text-zinc-500 italic">
              Speak naturally. I am listening...
            </p>
          )}

          {lastUserText && !transcript && (
            <div className="text-xs text-zinc-500 truncate pt-1">
              You asked: &ldquo;{lastUserText}&rdquo;
            </div>
          )}

          {!speechSupported && (
            <div className="text-xs text-amber-400 bg-amber-950/40 border border-amber-500/30 p-2 rounded-lg">
              Notice: Web Speech API is best supported in Google Chrome, Edge, and modern Chromium browsers.
            </div>
          )}
        </div>
      </div>

      {/* Expandable Conversation Transcript Drawer */}
      {showHistory && (
        <div className="absolute right-6 top-24 bottom-28 w-80 sm:w-96 rounded-2xl bg-zinc-900/90 border border-white/10 shadow-2xl backdrop-blur-xl p-4 flex flex-col z-30 animate-in fade-in slide-in-from-right-4">
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

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-8 inset-x-0 flex items-center justify-center gap-4 z-20">
        {/* Toggle Dialogue Drawer */}
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

        {/* Microphone Mute / Unmute Toggle */}
        <button
          onClick={toggleMicMute}
          className={`p-4 rounded-full border transition shadow-lg ${
            isMicMuted
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-zinc-900/80 text-white border-white/20 hover:bg-zinc-800'
          }`}
          title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {isMicMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {/* End Call Button */}
        <button
          onClick={onClose}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition shadow-xl shadow-red-600/30 flex items-center justify-center"
          title="End voice conversation"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default VoiceAgentModal;
