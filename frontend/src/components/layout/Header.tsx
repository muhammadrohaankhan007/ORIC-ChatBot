'use client';

import React from 'react';
import { ViewMode } from '@/types';
import { ShieldCheck, Cpu, Volume2, VolumeX, ExternalLink, Globe } from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  apiConnected: boolean;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onNavigate?: (view: ViewMode) => void;
}

export default function Header({
  currentView,
  apiConnected,
  voiceEnabled,
  onToggleVoice,
  onNavigate
}: HeaderProps) {
  const titles: Record<ViewMode, { title: string; subtitle: string }> = {
    home: {
      title: 'Salim Habib University ORIC Innovation Ecosystem',
      subtitle: 'HEC Tier-1 Commercialization Hub, Multi-Agent Faculty & Industry Radar'
    },
    dashboard: {
      title: 'Executive Intelligence & Research Command',
      subtitle: 'Institutional Portfolio, Grant Pipeline & Faculty Commercialization Metrics'
    },
    chat: {
      title: 'Faculty Research Advisors Workspace',
      subtitle: 'Dual-Mode Academic Mentoring & Commercial Feasibility Guidance (Gemini 3.5)'
    },
    explorer: {
      title: 'Intellectual Property & Project Repository',
      subtitle: 'Verified Research Database with Vectorized Document Embeddings'
    },
    radar: {
      title: 'Karachi & National Industry Radar',
      subtitle: 'Geographic Commercialization Matching Across Korangi, Landhi, S.I.T.E. & Port Qasim'
    },
    erl: {
      title: '8-Dimension Entrepreneurship Readiness Canvas',
      subtitle: 'Configurable Commercialization Maturity Scoring & Milestone Tracking'
    },
    discussions: {
      title: 'Meeting Recording & Speech Transcriber',
      subtitle: 'WebRTC Live Transcription, Automatic Action Extraction & Institutional Summaries'
    },
    reports: {
      title: 'Commercial Dossier & MoU Generator',
      subtitle: 'One-Click Compilation of Investor Briefs, ERL Reports & Feasibility Dossiers'
    }
  };

  const current = titles[currentView] || titles.dashboard;

  return (
    <header className="h-14 border-b border-zinc-800 bg-black px-6 flex items-center justify-between shrink-0 font-sans">
      <div className="flex items-center gap-4 min-w-0">
        <div className="truncate">
          <h1 className="font-display text-sm font-bold text-white tracking-tight truncate flex items-center gap-2">
            {current.title}
          </h1>
          <p className="text-[11px] text-zinc-400 truncate">{current.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {/* Switch to Public Website */}
        {onNavigate && (
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 transition"
          >
            <Globe className="w-3.5 h-3.5 text-red-500" />
            <span>Public Website</span>
          </button>
        )}

        {/* Voice Global Toggle */}
        <button
          onClick={onToggleVoice}
          title={voiceEnabled ? 'Mute Voice Audio' : 'Enable Voice Audio'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-all ${
            voiceEnabled
              ? 'bg-red-950/40 text-red-400 border-red-800/60 hover:bg-red-900/40'
              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
          }`}
        >
          {voiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-red-500" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline font-mono">{voiceEnabled ? 'Voice Active' : 'Voice Muted'}</span>
        </button>

        {/* Backend Status Badge */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border font-mono ${
            apiConnected
              ? 'bg-zinc-900 text-white border-zinc-800'
              : 'bg-zinc-900 text-zinc-400 border-zinc-800'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-red-500" />
          <span>{apiConnected ? 'Gemini 3.5 Live' : 'Local Fallback'}</span>
        </div>

        {/* Institutional Accreditation Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono font-medium bg-zinc-900 border border-zinc-800 text-zinc-300">
          <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
          <span>HEC Tier-1 ORIC</span>
        </div>

        {/* Sitemap Link */}
        <a
          href="/sitemap.xml"
          target="_blank"
          rel="noopener noreferrer"
          title="View Search Engine Sitemap"
          className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-md transition"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
}
