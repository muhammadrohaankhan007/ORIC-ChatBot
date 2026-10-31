'use client';

import React from 'react';
import { Project, ViewMode } from '@/types';
import { 
  Building2, 
  ArrowUpRight, 
  ShieldCheck, 
  CheckCircle2, 
  TrendingUp, 
  Layers, 
  FileCheck2, 
  Award,
  ChevronRight,
  Globe,
  Coins,
  Gauge,
  Sparkles
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
  // Cross-validated dynamic aggregations
  const totalProjects = projects.length || 1;
  const highReadiness = projects.filter(p => p.commercial_readiness === 'High');
  const patentPending = projects.filter(p => p.ip_status === 'Patent Pending' || p.ip_status === 'Disclosure Filed');
  const patentCount = projects.filter(p => p.ip_status === 'Patent Pending' || p.ip_status === 'Patent Granted').length;
  const disclosureCount = projects.filter(p => p.ip_status === 'Disclosure Filed').length;

  const totalFundingPKR = projects.reduce((acc, p) => acc + (p.estimated_funding_pkr || 0), 0);
  const totalFundingMillions = (totalFundingPKR / 1_000_000).toFixed(1);

  const avgTrl = (projects.reduce((acc, p) => acc + (p.trl_level || 0), 0) / totalProjects).toFixed(1);
  const avgErl = (projects.reduce((acc, p) => acc + (p.erl_level || 0), 0) / totalProjects).toFixed(1);

  // Dynamic Faculty Distribution
  const fopCount = projects.filter(p => p.faculty_code === 'FOP' || p.faculty?.toLowerCase().includes('pharmacy')).length;
  const fcsCount = projects.filter(p => p.faculty_code === 'FCS' || p.faculty?.toLowerCase().includes('information') || p.faculty?.toLowerCase().includes('comput')).length;
  const feCount = projects.filter(p => p.faculty_code === 'FE' || p.faculty?.toLowerCase().includes('engineer')).length;
  const fmsCount = projects.filter(p => p.faculty_code === 'FMS' || p.faculty?.toLowerCase().includes('management')).length;

  const fopPct = Math.round((fopCount / totalProjects) * 100);
  const fcsPct = Math.round((fcsCount / totalProjects) * 100);
  const fePct = Math.round((feCount / totalProjects) * 100);
  const fmsPct = Math.round((fmsCount / totalProjects) * 100);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans bg-black text-zinc-100">
      {/* Executive Command Banner */}
      <div className="rounded-md bg-zinc-950 border border-zinc-800 p-6 lg:p-8 space-y-4">
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-red-950/50 border border-red-800/60 text-red-400 text-xs font-bold uppercase tracking-wider font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
            <span>Salim Habib University • HEC Recognized Tier-1 ORIC</span>
          </div>
          <h2 className="font-display text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug">
            University Innovation & Commercialization Pipeline
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Central command dashboard connecting university laboratory research across Pharmaceutics, Computer Science, and Biomedical Engineering to industrial manufacturing clusters across Karachi and regional export markets.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="px-4 py-2.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs border border-zinc-800 flex items-center gap-2 transition"
            >
              <Globe className="w-4 h-4 text-red-500" />
              <span>Public University Website</span>
            </button>
            <button
              onClick={() => onNavigate('chat')}
              className="px-4 py-2.5 rounded-md bg-red-600 hover:bg-red-500 text-white font-display font-bold text-xs flex items-center gap-2 shadow-sm transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Faculty AI Advisory Workspace</span>
            </button>
            <button
              onClick={() => onNavigate('radar')}
              className="px-4 py-2.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-semibold text-xs border border-zinc-800 flex items-center gap-2 transition"
            >
              <Building2 className="w-4 h-4 text-red-500" />
              <span>Karachi Industry Radar</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards: Dynamic & Cross-Validated */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Projects */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-md p-5 space-y-2 hover:border-zinc-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">Total Projects</span>
            <div className="w-7 h-7 rounded bg-zinc-900 flex items-center justify-center text-zinc-300">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-3xl font-black text-white">{projects.length}</div>
          <div className="text-xs text-red-500 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Vector Indexed</span>
          </div>
        </div>

        {/* Pipeline Valuation */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-md p-5 space-y-2 hover:border-zinc-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">Pipeline Valuation</span>
            <div className="w-7 h-7 rounded bg-red-950/40 flex items-center justify-center text-red-500">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-3xl font-black text-red-500">PKR {totalFundingMillions}M</div>
          <div className="text-xs text-zinc-400">
            <span>R&D Grant Allocations</span>
          </div>
        </div>

        {/* High Commercial Readiness */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-md p-5 space-y-2 hover:border-zinc-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">MoU Readiness</span>
            <div className="w-7 h-7 rounded bg-zinc-900 flex items-center justify-center text-zinc-300">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-3xl font-black text-white">{highReadiness.length}</div>
          <div className="text-xs text-zinc-400">
            <span>{Math.round((highReadiness.length / totalProjects) * 100)}% of Pipeline</span>
          </div>
        </div>

        {/* Patent & IP Pipeline */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-md p-5 space-y-2 hover:border-zinc-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">IP Pipeline</span>
            <div className="w-7 h-7 rounded bg-zinc-900 flex items-center justify-center text-zinc-300">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-3xl font-black text-white">{patentPending.length}</div>
          <div className="text-xs text-zinc-400">
            <span>{patentCount} Pending • {disclosureCount} Disclosed</span>
          </div>
        </div>

        {/* Average Readiness Benchmarks */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-md p-5 space-y-2 hover:border-zinc-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">Average Maturity</span>
            <div className="w-7 h-7 rounded bg-zinc-900 flex items-center justify-center text-red-500">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-2xl font-black text-white">TRL {avgTrl} / ERL {avgErl}</div>
          <div className="text-xs text-zinc-400">
            <span>HEC Readiness Benchmarks</span>
          </div>
        </div>
      </div>

      {/* Faculty Distribution & Commercialization Leaders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: High Commercial Potential Projects */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-md p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-red-500" />
                <span>Commercialization Opportunities</span>
              </h3>
              <p className="text-xs text-zinc-400">Evaluated against HEC & ERL commercial readiness metrics</p>
            </div>
            <button
              onClick={() => onNavigate('explorer')}
              className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 font-mono"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {highReadiness.map((project) => (
              <div
                key={project.id}
                className="p-4 rounded bg-black border border-zinc-850 hover:border-zinc-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                      {project.project_code}
                    </span>
                    <span className="text-xs font-semibold text-red-500 font-mono">{project.faculty}</span>
                    {project.estimated_funding_pkr && (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-red-950/40 text-red-400 border border-red-900/40">
                        PKR {(project.estimated_funding_pkr / 1_000_000).toFixed(1)}M
                      </span>
                    )}
                  </div>
                  <h4 className="font-display text-sm font-bold text-white leading-snug">{project.title}</h4>
                  <p className="text-xs text-zinc-400 line-clamp-2">{project.abstract}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 font-mono">
                      TRL {project.trl_level}/9
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-red-950/40 text-red-400 border border-red-900/40 font-mono">
                      ERL {project.erl_level}/9
                    </span>
                    <span className="text-[11px] text-zinc-400">Lead: {project.lead_investigator}</span>
                  </div>
                </div>

                <div className="flex md:flex-col items-center justify-end gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onSelectProjectForChat(project);
                      onNavigate('chat');
                    }}
                    className="w-full md:w-auto px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition font-display"
                  >
                    <span>Analyze</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onNavigate('erl')}
                    className="w-full md:w-auto px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 border border-zinc-800 flex items-center justify-center transition"
                  >
                    <span>ERL Score</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: University R&D Distribution (Dynamic) */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-md p-6 space-y-6">
          <div>
            <h3 className="font-display text-base font-bold text-white">Faculty Distribution</h3>
            <p className="text-xs text-zinc-400">Research projects across Salim Habib University faculties</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-zinc-200">Faculty of Pharmacy (FOP)</span>
                <span className="text-zinc-400 font-mono">{fopPct}% ({fopCount} {fopCount === 1 ? 'Project' : 'Projects'})</span>
              </div>
              <div className="w-full h-1.5 rounded bg-zinc-900 overflow-hidden">
                <div style={{ width: `${fopPct}%` }} className="h-full bg-red-600 rounded transition-all duration-500" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-zinc-200">Faculty of Computing & IT (FCS)</span>
                <span className="text-zinc-400 font-mono">{fcsPct}% ({fcsCount} {fcsCount === 1 ? 'Project' : 'Projects'})</span>
              </div>
              <div className="w-full h-1.5 rounded bg-zinc-900 overflow-hidden">
                <div style={{ width: `${fcsPct}%` }} className="h-full bg-red-500 rounded transition-all duration-500" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-zinc-200">Faculty of Engineering (FE)</span>
                <span className="text-zinc-400 font-mono">{fePct}% ({feCount} {feCount === 1 ? 'Project' : 'Projects'})</span>
              </div>
              <div className="w-full h-1.5 rounded bg-zinc-900 overflow-hidden">
                <div style={{ width: `${fePct}%` }} className="h-full bg-red-700 rounded transition-all duration-500" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-zinc-200">Management Sciences (FMS)</span>
                <span className="text-zinc-400 font-mono">{fmsPct}% ({fmsCount} {fmsCount === 1 ? 'Project' : 'Projects'})</span>
              </div>
              <div className="w-full h-1.5 rounded bg-zinc-900 overflow-hidden">
                <div style={{ width: `${fmsPct}%` }} className="h-full bg-red-800 rounded transition-all duration-500" />
              </div>
            </div>
          </div>

          {/* Quick Stats Box */}
          <div className="p-4 rounded bg-black border border-zinc-800 space-y-2">
            <div className="font-display text-xs font-bold text-white">Karachi Industrial Reach</div>
            <p className="text-xs text-zinc-400">
              Active corporate mapping across Korangi, S.I.T.E., Landhi, and Port Qasim industrial clusters.
            </p>
            <button
              onClick={() => onNavigate('radar')}
              className="text-xs font-semibold text-red-500 hover:text-red-400 flex items-center gap-1 pt-1 font-mono"
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
