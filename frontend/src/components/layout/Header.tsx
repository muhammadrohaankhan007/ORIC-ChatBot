'use client';

import React from 'react';
import { ViewMode, CurrencyMode } from '@/types';
import { AuthUser } from '@/config/auth';
import { Volume2, VolumeX, Globe, Radio, Coins, LogOut, User } from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  apiConnected: boolean;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onNavigate?: (view: ViewMode) => void;
  onOpenVoiceAgent?: () => void;
  currency?: CurrencyMode;
  onToggleCurrency?: () => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

export default function Header({
  currentView,
  apiConnected,
  voiceEnabled,
  onToggleVoice,
  onNavigate,
  onOpenVoiceAgent,
  currency = 'PKR',
  onToggleCurrency,
  currentUser,
  onLogout
}: HeaderProps) {
  const titles: Record<ViewMode, { title: string; subtitle: string }> = {
    home: {
      title: 'Salim Habib University ORIC',
      subtitle: 'Office of Research, Innovation & Commercialization',
    },
    dashboard: {
      title: 'Executive Intelligence Dashboard',
      subtitle: 'Portfolio Overview, Addressable Market Valuation & Opportunity Overview',
    },
    chat: {
      title: 'ORIC Research Assistant',
      subtitle: 'Conversational & Analytical Guidance Grounded in University Research Dossiers',
    },
    explorer: {
      title: 'Document Library & Research Repository',
      subtitle: 'Search, Filter, Inspect & Export Complete Institutional Research Portfolios',
    },
    radar: {
      title: 'Karachi Industrial Hub & Radar',
      subtitle: 'Commercialization Matching Across Karachi 10 Industrial Estates',
    },
    erl: {
      title: 'Commercial Readiness Canvas',
      subtitle: '8-Dimension Commercialization Maturity & TRL Evaluation',
    },
    discussions: {
      title: 'Meeting Transcriptions',
      subtitle: 'Meeting Audio Records, Dictation & Action Item Extraction',
    },
    reports: {
      title: 'Institutional Report Suite (Reports A–H)',
      subtitle: 'Publication-Ready Briefs, Feasibility Reports, Multi-Project Ranking & Official Signatures',
    },
    sources: {
      title: 'Data Sources, Evidence & Assumptions Registry',
      subtitle: 'Verified Statutory Authorities (PBS, SBP, DRAP, PPMA) & Economic Baselines',
    },
    upload: {
      title: 'Document Ingestion Pipeline',
      subtitle: '6-Stage Automated AI Extraction & Metadata Intake Architecture',
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
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Currency Switcher Pill */}
        {onToggleCurrency && (
          <button
            onClick={onToggleCurrency}
            title="Toggle between PKR and USD (280 PKR/USD benchmark)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-800 transition"
          >
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span>{currency}</span>
          </button>
        )}

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
              <span className="hidden md:inline">Voice Audio On</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden md:inline">Voice Audio Muted</span>
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
          <span className="hidden lg:inline">
            {apiConnected ? 'Connected' : 'Offline Mode'}
          </span>
        </div>

        {/* Authenticated User & Logout Action */}
        {currentUser && (
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-200">
            <div className="hidden sm:flex items-center gap-2 text-right">
              <div>
                <div className="text-xs font-bold text-zinc-900 leading-tight">
                  {currentUser.displayName}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  {currentUser.username}
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center border border-red-200">
                {currentUser.displayName.charAt(0)}
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                title="Sign out of ORIC portal"
                className="p-1.5 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
