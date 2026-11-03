'use client';

import React, { useState } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Globe,
  Coins,
  Gauge,
  Sparkles,
  ArrowRight
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
  const [dashboardPage, setDashboardPage] = useState(1);
  const DASHBOARD_PAGE_SIZE = 5;
  const totalDashboardPages = Math.ceil(projects.length / DASHBOARD_PAGE_SIZE) || 1;
  const safeDashboardPage = Math.min(Math.max(1, dashboardPage), totalDashboardPages);
  const paginatedDashboardProjects = projects.slice(
    (safeDashboardPage - 1) * DASHBOARD_PAGE_SIZE,
    safeDashboardPage * DASHBOARD_PAGE_SIZE
  );

  // Institutional aggregations
  const totalProjects = projects.length || 1;
  const highReadiness = projects.filter(p => p.commercial_readiness === 'High');
  const patentProjects = projects.filter(p => p.ip_status !== 'None');
  const patentCount = projects.filter(p => p.ip_status === 'Patent Pending' || p.ip_status === 'Patent Granted').length;
  const disclosureCount = projects.filter(p => p.ip_status === 'Disclosure Filed').length;

  const totalFundingPKR = projects.reduce((acc, p) => acc + (p.estimated_funding_pkr || 0), 0);
  const totalFundingMillions = (totalFundingPKR / 1_000_000).toFixed(1);

  const avgTrl = (projects.reduce((acc, p) => acc + (p.trl_level || 0), 0) / totalProjects).toFixed(1);
  const avgErl = (projects.reduce((acc, p) => acc + (p.erl_level || 0), 0) / totalProjects).toFixed(1);

  // Faculty Distribution
  const fopCount = projects.filter(p => p.faculty_code === 'FOP' || p.faculty?.toLowerCase().includes('pharmacy')).length;
  const fcsCount = projects.filter(p => p.faculty_code === 'FCS' || p.faculty?.toLowerCase().includes('information') || p.faculty?.toLowerCase().includes('comput')).length;
  const feCount = projects.filter(p => p.faculty_code === 'FE' || p.faculty?.toLowerCase().includes('engineer')).length;
  const fmsCount = projects.filter(p => p.faculty_code === 'FMS' || p.faculty?.toLowerCase().includes('management')).length;

  const fopPct = Math.round((fopCount / totalProjects) * 100);
  const fcsPct = Math.round((fcsCount / totalProjects) * 100);
  const fePct = Math.round((feCount / totalProjects) * 100);
  const fmsPct = Math.round((fmsCount / totalProjects) * 100);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans bg-zinc-50 min-h-screen text-zinc-900">
      {/* Executive Command Banner */}
      <div className="rounded-lg bg-white border border-zinc-200 p-6 lg:p-8 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700 text-xs font-semibold border border-zinc-200">
              <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
              <span>Salim Habib University • HEC Recognized Tier-1 ORIC</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold font-display text-zinc-900 tracking-tight leading-snug">
              Research Portfolio & Commercialization Pipeline
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Institutional dashboard tracking university laboratory discoveries across Pharmaceutics, Computer Science, and Biomedical Engineering to industrial manufacturing partners in Karachi and regional export markets.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('chat')}
                className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Consult Research Assistant</span>
              </button>
              <button
                onClick={() => onNavigate('explorer')}
                className="px-4 py-2.5 rounded-lg bg-white hover:bg-zinc-50 text-zinc-800 font-medium text-xs border border-zinc-300 shadow-xs flex items-center gap-1.5 transition"
              >
                <FileCheck2 className="w-4 h-4 text-zinc-500" />
                <span>Patents & IP Explorer</span>
              </button>
              <button
                onClick={() => onNavigate('home')}
                className="px-4 py-2.5 rounded-lg bg-white hover:bg-zinc-50 text-zinc-700 font-medium text-xs border border-zinc-200 flex items-center gap-1.5 transition"
              >
                <Globe className="w-4 h-4 text-zinc-500" />
                <span>Public Portal</span>
              </button>
            </div>
          </div>
          <img
            src="/shu-logo.png"
            alt="Salim Habib University"
            className="h-14 w-auto object-contain hidden md:block shrink-0"
          />
        </div>
      </div>

      {/* KPI Cards: Dynamic & Cross-Validated */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Projects */}
        <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Active Projects</span>
            <Layers className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-900">{projects.length}</div>
          <div className="text-xs text-zinc-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-red-600" />
            <span>Verified Labs</span>
          </div>
        </div>

        {/* Total Committed Valuation */}
        <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Committed R&D Budget</span>
            <TrendingUp className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">PKR {totalFundingMillions}M</div>
          <div className="text-xs text-zinc-500">
            <span>Internal & External Grants</span>
          </div>
        </div>

        {/* High Commercialization Readiness */}
        <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>High Readiness</span>
            <Award className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-900">{highReadiness.length}</div>
          <div className="text-xs text-zinc-500">
            <span>{Math.round((highReadiness.length / totalProjects) * 100)}% of Portfolio</span>
          </div>
        </div>

        {/* Average Readiness Index */}
        <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Average Maturity</span>
            <Gauge className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-900">ERL {avgErl}</div>
          <div className="text-xs text-zinc-500">
            <span>Average TRL Score: {avgTrl}/9</span>
          </div>
        </div>

        {/* IP Portfolio */}
        <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Patents & IP</span>
            <FileCheck2 className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-900">{patentProjects.length}</div>
          <div className="text-xs text-zinc-500">
            <span>{patentCount} Pending • {disclosureCount} Disclosed</span>
          </div>
        </div>
      </div>

      {/* Two-Column Analytics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Research Pipeline (2 Columns) */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-lg p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                Active Research Pipeline
              </h3>
              <p className="text-xs text-zinc-500">
                Verified candidate technologies undergoing commercialization review
              </p>
            </div>
            <button
              onClick={() => onNavigate('explorer')}
              className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-zinc-100">
            {paginatedDashboardProjects.map((project, idx) => (
              <div key={`${project.id}-${idx}`} className="py-4 first:pt-0 last:pb-0 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                        {project.project_code}
                      </span>
                      <span className="text-xs font-semibold text-red-600">
                        {project.faculty}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-zinc-900">{project.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onSelectProjectForChat(project);
                        onNavigate('chat');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center gap-1 transition shadow-xs"
                    >
                      <span>Analyze</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onNavigate('erl')}
                      className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium border border-zinc-200 transition"
                    >
                      <span>ERL {project.erl_level}/9</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-zinc-600 line-clamp-2">{project.abstract}</p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 pt-1">
                  <span>Lead: <strong className="text-zinc-800">{project.lead_investigator}</strong></span>
                  <span>•</span>
                  <span>TRL {project.trl_level}/9</span>
                  <span>•</span>
                  <span>Status: <strong className="text-zinc-700">{project.ip_status}</strong></span>
                  {project.estimated_funding_pkr && (
                    <>
                      <span>•</span>
                      <span>Budget: PKR {(project.estimated_funding_pkr / 1_000_000).toFixed(1)}M</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Dashboard Pipeline Pagination Bar */}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-medium">
              Showing <strong className="text-zinc-900">{(safeDashboardPage - 1) * DASHBOARD_PAGE_SIZE + 1} - {Math.min(safeDashboardPage * DASHBOARD_PAGE_SIZE, projects.length)}</strong> of <strong className="text-zinc-900">{projects.length}</strong>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setDashboardPage((p) => Math.max(1, p - 1))}
                disabled={safeDashboardPage === 1}
                className="px-2.5 py-1 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-700 font-medium flex items-center gap-1 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <span className="px-2 font-mono text-zinc-600 font-semibold">
                {safeDashboardPage} / {totalDashboardPages}
              </span>
              <button
                onClick={() => setDashboardPage((p) => Math.min(totalDashboardPages, p + 1))}
                disabled={safeDashboardPage === totalDashboardPages}
                className="px-2.5 py-1 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-700 font-medium flex items-center gap-1 transition"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Faculty Distribution & Benchmarks (1 Column) */}
        <div className="space-y-6">
          <div className="bg-white border border-zinc-200 rounded-lg p-6 space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-zinc-900">
              Faculty R&D Allocation
            </h3>
            <p className="text-xs text-zinc-500">
              Distribution of active research projects by academic faculty
            </p>

            <div className="space-y-3 pt-2">
              {/* FOP */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-zinc-800">Faculty of Pharmacy (FOP)</span>
                  <span className="text-zinc-500">{fopPct}% ({fopCount})</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-600 rounded-full" style={{ width: `${fopPct}%` }} />
                </div>
              </div>

              {/* FCS */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-zinc-800">Computer Science (FCS)</span>
                  <span className="text-zinc-500">{fcsPct}% ({fcsCount})</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-700 rounded-full" style={{ width: `${fcsPct}%` }} />
                </div>
              </div>

              {/* FE */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-zinc-800">Engineering & Tech (FE)</span>
                  <span className="text-zinc-500">{fePct}% ({feCount})</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-500 rounded-full" style={{ width: `${fePct}%` }} />
                </div>
              </div>

              {/* FMS */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-zinc-800">Management Sciences (FMS)</span>
                  <span className="text-zinc-500">{fmsPct}% ({fmsCount})</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-400 rounded-full" style={{ width: `${fmsPct}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white border border-zinc-200 rounded-lg p-6 space-y-3 shadow-xs">
            <h4 className="text-sm font-bold text-zinc-900">Commercialization Tools</h4>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('radar')}
                className="w-full p-2.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-left flex items-center justify-between text-xs font-medium text-zinc-800 transition"
              >
                <span>Karachi Industry Radar</span>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </button>
              <button
                onClick={() => onNavigate('erl')}
                className="w-full p-2.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-left flex items-center justify-between text-xs font-medium text-zinc-800 transition"
              >
                <span>8-Dimension ERL Assessment</span>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </button>
              <button
                onClick={() => onNavigate('discussions')}
                className="w-full p-2.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-left flex items-center justify-between text-xs font-medium text-zinc-800 transition"
              >
                <span>Meeting Transcriptions</span>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </button>
              <button
                onClick={() => onNavigate('reports')}
                className="w-full p-2.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-left flex items-center justify-between text-xs font-medium text-zinc-800 transition"
              >
                <span>Commercial Dossier Generator</span>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
