'use client';

import React from 'react';
import { ViewMode } from '@/types';
import {
  Globe,
  LayoutDashboard,
  Sparkles,
  FolderKanban,
  Radar,
  PieChart,
  Mic,
  FileSpreadsheet,
  GraduationCap,
  ArrowLeft
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  projectCount?: number;
}

export default function Sidebar({ currentView, onNavigate, projectCount = 4 }: SidebarProps) {
  const navItems = [
    {
      category: 'Public Portal',
      items: [
        {
          id: 'home' as ViewMode,
          label: 'Public University Website',
          icon: Globe,
          badge: 'Live',
          badgeColor: 'bg-red-950/60 text-red-400 border border-red-800/60'
        }
      ]
    },
    {
      category: 'Executive Intelligence',
      items: [
        {
          id: 'dashboard' as ViewMode,
          label: 'Executive Dashboard',
          icon: LayoutDashboard,
          badge: null,
          badgeColor: ''
        },
        {
          id: 'chat' as ViewMode,
          label: 'Faculty Research Advisors',
          icon: Sparkles,
          badge: 'Gemini 3.5',
          badgeColor: 'bg-zinc-900 text-zinc-300 border border-zinc-800'
        },
        {
          id: 'explorer' as ViewMode,
          label: 'Intellectual Property Explorer',
          icon: FolderKanban,
          badge: `${projectCount}`,
          badgeColor: 'bg-zinc-900 text-zinc-300 border border-zinc-800'
        }
      ]
    },
    {
      category: 'Commercialization & Industry',
      items: [
        {
          id: 'radar' as ViewMode,
          label: 'Karachi Industry Radar',
          icon: Radar,
          badge: 'Active',
          badgeColor: 'bg-red-950/60 text-red-400 border border-red-800/60'
        },
        {
          id: 'erl' as ViewMode,
          label: '8D ERL Readiness Scorer',
          icon: PieChart,
          badge: null,
          badgeColor: ''
        }
      ]
    },
    {
      category: 'Governance & Dossiers',
      items: [
        {
          id: 'discussions' as ViewMode,
          label: 'Meeting Transcriptions',
          icon: Mic,
          badge: 'WebRTC',
          badgeColor: 'bg-zinc-900 text-zinc-300 border border-zinc-800'
        },
        {
          id: 'reports' as ViewMode,
          label: 'Commercial Dossier Facility',
          icon: FileSpreadsheet,
          badge: 'HEC Aligned',
          badgeColor: 'bg-red-950/60 text-red-400 border border-red-800/60'
        }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-black border-r border-zinc-800 flex flex-col h-screen select-none shrink-0 font-sans">
      {/* Clickable Brand Header (Returns to Public Website) */}
      <button
        onClick={() => onNavigate('home')}
        title="Return to Public University Website"
        className="p-4 border-b border-zinc-800 flex items-center gap-3 bg-zinc-950 hover:bg-zinc-900 transition text-left w-full group"
      >
        <div className="w-9 h-9 rounded-md bg-red-600 flex items-center justify-center font-bold text-white shadow-md shadow-red-950/50">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-sm tracking-tight text-white group-hover:text-red-500 transition flex items-center justify-between">
            <span>SHU <span className="text-red-500">ORIC</span></span>
            <ArrowLeft className="w-3.5 h-3.5 text-zinc-500 group-hover:text-red-500 group-hover:-translate-x-0.5 transition" />
          </div>
          <div className="text-[11px] text-zinc-400 truncate">Salim Habib University</div>
        </div>
      </button>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-5">
        {navItems.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-2.5 text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
              {section.category}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-red-600 text-white shadow-sm shadow-red-950/40'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold shrink-0 ${
                        isActive ? 'bg-black/30 text-white' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Institutional Directorate Bar */}
      <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded bg-red-950/60 border border-red-800/60 flex items-center justify-center font-mono font-bold text-[10px] text-red-400">
          OD
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-xs font-semibold text-zinc-200 truncate">ORIC Directorate</div>
          <div className="text-[10px] text-zinc-400 truncate">Commercialization Office</div>
        </div>
        <div className="w-2 h-2 rounded-full bg-red-500" title="System Operational" />
      </div>
    </aside>
  );
}
