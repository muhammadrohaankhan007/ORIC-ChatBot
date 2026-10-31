'use client';

import React from 'react';
import { Project, ViewMode } from '@/types';
import { 
  Building2, 
  ArrowUpRight, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  Layers, 
  FileCheck2, 
  Award,
  ChevronRight
} from 'lucide-react';

interface DashboardViewProps {
  projects: Project[];
  onNavigate: (view: ViewMode) => void;
  onSelectProjectForChat: (project: Project) => void;
}

export default function DashboardView({
  projects,
  onNavigate,
  onSelectProjectForChat
}: DashboardViewProps) {
  const highReadiness = projects.filter(p => p.commercial_readiness === 'High');
  const patentPending = projects.filter(p => p.ip_status === 'Patent Pending' || p.ip_status === 'Disclosure Filed');

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Hero Executive Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-8 shadow-xl overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Greenfield 3.0 Platform Online</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug">
            Empowering Salim Habib University’s Innovation & Industry Pipeline
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Automated intelligence bridging laboratory research across Pharmacy, Engineering, and Computing to manufacturing hubs in Korangi, S.I.T.E., Landhi, and regional Gulf markets.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('chat')}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch AI Expert Chat</span>
            </button>
            <button
              onClick={() => onNavigate('radar')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-2 transition"
            >
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Explore Industry Radar</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-2 hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Ingested Projects</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{projects.length}</div>
          <div className="text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Vector Indexed</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-2 hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">High Commercial Potential</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{highReadiness.length}</div>
          <div className="text-xs text-slate-400">
            <span>Ready for Corporate MoUs</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-2 hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Patent & IP Pipeline</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{patentPending.length}</div>
          <div className="text-xs text-amber-400">
            <span>2 Pending • 1 Disclosed</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-2 hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Karachi Industry Matches</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">4</div>
          <div className="text-xs text-indigo-300">
            <span>Getz, Artistic, Ferozsons</span>
          </div>
        </div>
      </div>

      {/* Faculty Distribution & Commercialization Leaders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: High Commercial Potential Projects */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Commercialization Opportunities</span>
              </h3>
              <p className="text-xs text-slate-400">Evaluated against HEC & ERL commercial readiness metrics</p>
            </div>
            <button
              onClick={() => onNavigate('explorer')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {highReadiness.map((project) => (
              <div
                key={project.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {project.project_code}
                    </span>
                    <span className="text-xs font-semibold text-amber-400">{project.faculty}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug">{project.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{project.abstract}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                      TRL Level {project.trl_level}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      ERL Score {project.erl_level}/9
                    </span>
                    <span className="text-[11px] text-slate-400">Lead: {project.lead_investigator}</span>
                  </div>
                </div>

                <div className="flex md:flex-col items-center justify-end gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onSelectProjectForChat(project);
                      onNavigate('chat');
                    }}
                    className="w-full md:w-auto px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 flex items-center justify-center gap-1.5 transition"
                  >
                    <span>Analyze</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                  <button
                    onClick={() => onNavigate('erl')}
                    className="w-full md:w-auto px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-xs font-semibold text-amber-300 border border-amber-500/30 flex items-center justify-center transition"
                  >
                    <span>ERL Score</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: University R&D Distribution */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Faculty Distribution</h3>
            <p className="text-xs text-slate-400">Research projects by Salim Habib University faculty</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-sky-400">Faculty of Pharmacy (FOP)</span>
                <span className="text-slate-400">25% (1 Proj)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="w-1/4 h-full bg-sky-500 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-indigo-400">Faculty of Information Technology (FCS)</span>
                <span className="text-slate-400">25% (1 Proj)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="w-1/4 h-full bg-indigo-500 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-emerald-400">Faculty of Engineering (FE)</span>
                <span className="text-slate-400">25% (1 Proj)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="w-1/4 h-full bg-emerald-500 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-amber-400">Management Sciences (FMS)</span>
                <span className="text-slate-400">25% (1 Proj)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="w-1/4 h-full bg-amber-500 rounded-full" />
              </div>
            </div>
          </div>

          {/* Quick Stats Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-200">Karachi Industrial Reach</div>
            <p className="text-xs text-slate-400">
              Active corporate mapping across Korangi, S.I.T.E., Landhi, and Port Qasim.
            </p>
            <button
              onClick={() => onNavigate('radar')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 pt-1"
            >
              <span>View Industrial Matrix</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

