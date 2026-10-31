'use client';

import React from 'react';
import { ViewMode } from '@/types';
import {
  LayoutDashboard,
  Sparkles,
  FolderKanban,
  Radar,
  PieChart,
  Mic,
  FileSpreadsheet,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  projectCount?: number;
}

export default function Sidebar({ currentView, onNavigate, projectCount = 4 }: SidebarProps) {
  const navItems = [
    {
      category: 'Core Intelligence',
      items: [
        {
          id: 'dashboard' as ViewMode,
          label: 'Dashboard',
          icon: LayoutDashboard,
          badge: null
        },
        {
          id: 'chat' as ViewMode,
          label: 'AI Expert Chat',
          icon: Sparkles,
          badge: 'Voice',
          badgeColor: 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
        },
        {
          id: 'explorer' as ViewMode,
          label: 'Project Explorer',
          icon: FolderKanban,
          badge: `${projectCount}`,
          badgeColor: 'bg-slate-700 text-slate-300'
        }
      ]
    },
    {
      category: 'Commercialization & Synergies',
      items: [
        {
          id: 'radar' as ViewMode,
          label: 'Karachi Industry Radar',
          icon: Radar,
          badge: 'Live',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
        },
        {
          id: 'erl' as ViewMode,
          label: 'ERL 8D Assessment',
          icon: PieChart,
          badge: null
        }
      ]
    },
    {
      category: 'Operations & Meetings',
      items: [
        {
          id: 'discussions' as ViewMode,
          label: 'Meeting Transcription',
          icon: Mic,
          badge: 'WebRTC',
          badgeColor: 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
        },
        {
          id: 'reports' as ViewMode,
          label: 'Report Generator',
          icon: FileSpreadsheet,
          badge: 'PDF / Word',
          badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
        }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-gradient-to-r from-slate-950 to-slate-900">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-black text-slate-950 shadow-lg shadow-amber-500/10">
          <GraduationCap className="w-6 h-6 text-slate-950" />
        </div>
        <div>
          <div className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
            SHU <span className="text-amber-400">ORIC AI</span>
          </div>
          <div className="text-xs text-slate-400 tracking-wider font-medium">Salim Habib University</div>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navItems.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {section.category}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-slate-950/20 text-slate-950' : item.badgeColor
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

      {/* User Status Bar */}
      <div className="p-3 bg-slate-900/80 border-t border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-inner">
          OD
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-slate-200 truncate">ORIC Director</div>
          <div className="text-[11px] text-slate-400 truncate">Executive Leadership</div>
        </div>
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" title="System Online" />
      </div>
    </aside>
  );
}

