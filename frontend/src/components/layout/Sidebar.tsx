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
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  projectCount?: number;
}

export default function Sidebar({ currentView, onNavigate, projectCount = 4 }: SidebarProps) {
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
          label: 'Patents & IP',
          icon: FolderKanban,
          badge: projectCount > 0 ? `${projectCount}` : undefined,
        },
      ]
    },
    {
      group: 'Commercialization Tools',
      items: [
        {
          id: 'radar' as ViewMode,
          label: 'Industry Contacts',
          icon: Radar,
        },
        {
          id: 'erl' as ViewMode,
          label: 'Readiness Score',
          icon: PieChart,
        },
        {
          id: 'discussions' as ViewMode,
          label: 'Meetings',
          icon: Mic,
        },
        {
          id: 'reports' as ViewMode,
          label: 'Reports',
          icon: FileSpreadsheet,
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
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-zinc-500" />
              <span>Public Portal</span>
            </div>
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="px-3 space-y-5 pt-1">
          {navSections.map((section) => (
            <div key={section.group} className="space-y-1">
              <div className="px-3 text-[11px] font-semibold text-zinc-400">
                {section.group}
              </div>
              <nav className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                        isActive
                          ? 'bg-red-50 text-red-700 font-semibold'
                          : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-red-600' : 'text-zinc-400'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Institutional Footer */}
      <div className="p-4 border-t border-zinc-200 bg-zinc-50/50">
        <div className="text-xs font-medium text-zinc-800">ORIC Directorate</div>
        <div className="text-[11px] text-zinc-500">Korangi Creek Campus, Karachi</div>
      </div>
    </aside>
  );
}
