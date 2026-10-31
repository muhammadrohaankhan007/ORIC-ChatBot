'use client';

import React from 'react';
import { ViewMode } from '@/types';
import { ShieldCheck, Cpu, Volume2, VolumeX, ExternalLink } from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  apiConnected: boolean;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
}

export default function Header({
  currentView,
  apiConnected,
  voiceEnabled,
  onToggleVoice
}: HeaderProps) {
  const titles: Record<ViewMode, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'University Executive Intelligence Dashboard',
      subtitle: 'Portfolio Overview, Commercial Pipeline & Faculty Metrics'
    },
    chat: {
      title: 'SHU Multi-Agent Conversational Workspace',
      subtitle: 'Dual-Mode Text & Speech Intelligence with Dynamic Virtual Teachers'
    },
    explorer: {
      title: 'Intellectual Property & Project Explorer',
      subtitle: 'Verified Research Database with Vectorized Document Embeddings'
    },
    radar: {
      title: 'Karachi & National Industry Radar',
      subtitle: 'Live Geographic Commercialization Matching Across Industrial Estates'
    },
    erl: {
      title: '8-Dimension Entrepreneurship Readiness Canvas',
      subtitle: 'Configurable Commercialization Maturity Scoring & Milestone Tracking'
    },
    discussions: {
      title: 'Meeting Recording & Speech-to-Text Transcriber',
      subtitle: 'WebRTC Live Transcription, Automatic Action Extraction & Summaries'
    },
    reports: {
      title: 'Intelligent Report Generation Facility',
      subtitle: 'One-Click Compilation of Investor Briefs, ERL Reports & Feasibility Dossiers'
    }
  };

  const current = titles[currentView] || titles.dashboard;

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            {current.title}
          </h1>
          <p className="text-xs text-slate-400">{current.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Voice Global Toggle */}
        <button
          onClick={onToggleVoice}
          title={voiceEnabled ? 'Mute AI Voice Responses' : 'Enable AI Voice Responses'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            voiceEnabled
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>{voiceEnabled ? 'Voice Active' : 'Voice Muted'}</span>
        </button>

        {/* Backend Status Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${
            apiConnected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>{apiConnected ? 'FastAPI 3.12 Connected' : 'Greenfield Engine Ready'}</span>
        </div>

        {/* Security & Verification Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/60 border border-slate-700/60 text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>SHU Sovereign AI</span>
        </div>

        {/* Documentation Link */}
        <a
          href="/sitemap.xml"
          target="_blank"
          rel="noopener noreferrer"
          title="View Search Engine Sitemap"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
}

