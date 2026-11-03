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
  UploadCloud,
  ShieldCheck,
  Scale
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  projectCount?: number;
}

export default function Sidebar({ currentView, onNavigate, projectCount = 238 }: SidebarProps) {
  const navSections = [
    {
      group: 'Workspace',
      items: [
        {
          id: 'dashboard' as ViewMode,
          label: 'Dashboard',
          icon: LayoutDashboard,
        },
        {
          id: 'chat' as ViewMode,
          label: 'Research Assistant',
          icon: Sparkles,
        },
        {
          id: 'explorer' as ViewMode,
          label: 'Document Library',
          icon: FolderKanban,
          badge: projectCount > 0 ? `${projectCount}` : undefined,
        },
        {
          id: 'upload' as ViewMode,
          label: 'Document Pipeline',
          icon: UploadCloud,
        },
      ]
    },
    {
      group: 'Commercialization & Governance',
      items: [
        {
          id: 'radar' as ViewMode,
          label: 'Karachi Industrial Hub',
          icon: Radar,
        },
        {
          id: 'erl' as ViewMode,
          label: 'Readiness Score',
          icon: PieChart,
        },
        {
          id: 'reports' as ViewMode,
          label: 'Reports (A–H)',
          icon: FileSpreadsheet,
        },
        {
          id: 'sources' as ViewMode,
          label: 'Sources & Citations',
          icon: ShieldCheck,
        },
        {
          id: 'discussions' as ViewMode,
          label: 'Meeting Transcripts',
          icon: Mic,
        },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col justify-between shrink-0 font-sans select-none min-h-screen">
      {/* Brand & Crest */}
      <div>
        <div className="h-16 px-4 border-b border-zinc-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/shu-logo.png"
              alt="Salim Habib University"
              className="h-9 w-auto object-contain shrink-0"
            />
            <div className="min-w-0">
              <div className="font-bold text-xs tracking-tight text-zinc-900 truncate">ORIC Portal</div>
              <div className="text-[10px] text-zinc-500 truncate">Salim Habib University</div>
            </div>
          </div>
        </div>

        {/* Public Website Shortcut Button */}
        <div className="p-3">
          <button
            onClick={() => onNavigate('home')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
              currentView === 'home'
                ? 'bg-red-50 text-red-700 font-semibold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 border border-zinc-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-zinc-500" />
              <span>Public Website</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-mono">
              Live
            </span>
          </button>
        </div>

        {/* Nav Sections */}
        <div className="px-3 py-2 space-y-6">
          {navSections.map((section) => (
            <div key={section.group} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                {section.group}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                        isActive
                          ? 'bg-red-600 text-white font-semibold shadow-xs'
                          : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full font-mono ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-zinc-200 text-zinc-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Institutional Footer */}
      <div className="p-3 border-t border-zinc-200 bg-zinc-50/50">
        <div className="p-2.5 rounded-lg border border-zinc-200/80 bg-white space-y-1 text-center">
          <div className="text-[11px] font-bold text-zinc-900 flex items-center justify-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-red-600" />
            <span>Salim Habib University</span>
          </div>
          <div className="text-[10px] text-zinc-500">
            Karachi, Sindh • HEC Tier-1 ORIC
          </div>
        </div>
      </div>
    </aside>
  );
}
