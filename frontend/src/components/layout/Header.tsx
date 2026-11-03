'use client';

import React from 'react';
import { ViewMode } from '@/types';
import { Volume2, VolumeX, Globe, Radio } from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  apiConnected: boolean;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onNavigate?: (view: ViewMode) => void;
  onOpenVoiceAgent?: () => void;
}

export default function Header({
  currentView,
  apiConnected,
  voiceEnabled,
  onToggleVoice,
  onNavigate,
  onOpenVoiceAgent,
}: HeaderProps) {
  const titles: Record<ViewMode, { title: string; subtitle: string }> = {
    home: {
      title: 'Salim Habib University ORIC',
      subtitle: 'Office of Research, Innovation & Commercialization',
    },
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Portfolio Overview, Grant Pipeline & Commercialization Metrics',
    },
    chat: {
      title: 'ORIC Research Assistant',
      subtitle: 'AI Guidance for Proposal Review, Patent Discovery & Commercialization',
    },
    explorer: {
      title: 'Patents & IP Repository',
      subtitle: 'Verified Research Projects and Intellectual Property Records',
    },
    radar: {
      title: 'Industry Contacts & Radar',
      subtitle: 'Commercialization Matching Across Karachi Industrial Estates',
    },
    erl: {
      title: 'Readiness Assessment Canvas',
      subtitle: '8-Dimension Commercialization Maturity Benchmarking',
    },
    discussions: {
      title: 'Meeting Transcriptions',
      subtitle: 'Meeting Audio Records, Dictation & Action Item Extraction',
    },
    reports: {
      title: 'Commercial Reports & Dossiers',
      subtitle: 'Investor Briefs, Feasibility Reports & Bilateral MoUs',
    },
  };

  const current = titles[currentView] || titles.dashboard;

  return (
    <header className="h-14 border-b border-zinc-200 bg-white px-6 flex items-center justify-between shrink-0 font-sans shadow-xs">
      {/* Title & Context */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="truncate">
          <h1 className="text-sm font-bold text-zinc-900 tracking-tight truncate">
            {current.title}
          </h1>
          <p className="text-xs text-zinc-500 truncate">{current.subtitle}</p>
        </div>
      </div>

      {/* Clean Right Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Public Website Button */}
        {onNavigate && currentView !== 'home' && (
          <button
            onClick={() => onNavigate('home')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 transition"
          >
            <Globe className="w-3.5 h-3.5 text-zinc-500" />
            <span>Public Portal</span>
          </button>
        )}

        {/* Live Voice Agent Launch Button */}
        {onOpenVoiceAgent && (
          <button
            onClick={onOpenVoiceAgent}
            title="Start real-time conversational voice call (Gemini Voice Agent)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-xs shadow-red-600/30 transition transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
            <span>Voice Agent</span>
          </button>
        )}

        {/* Real Single Source of Truth for Voice Mute/Audio */}
        <button
          onClick={onToggleVoice}
          title={voiceEnabled ? 'Mute AI Audio' : 'Enable AI Audio'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
            voiceEnabled
              ? 'bg-zinc-50 text-zinc-800 border-zinc-300 hover:bg-zinc-100'
              : 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:text-zinc-700'
          }`}
        >
          {voiceEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-red-600" />
              <span className="hidden sm:inline">Voice Audio On</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Voice Audio Muted</span>
            </>
          )}
        </button>

        {/* Genuine Backend Connection Status */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-600 font-medium px-2 py-1">
          <span
            className={`w-2 h-2 rounded-full ${
              apiConnected ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
          <span className="hidden md:inline">
            {apiConnected ? 'Connected' : 'Offline Mode'}
          </span>
        </div>
      </div>
    </header>
  );
}
