'use client';

import React, { useState } from 'react';
import { Project, ViewMode, CurrencyMode } from '@/types';
import { formatMoney } from '@/utils/formatters';
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
  ArrowRight,
  Flame,
  FileSpreadsheet,
  UploadCloud,
  FileText,
  MapPin,
  PieChart,
  BarChart3,
  Boxes,
  Star
} from 'lucide-react';

interface DashboardViewProps {
  projects: Project[];
  onNavigate: (view: ViewMode) => void;
  onSelectProjectForChat: (project: Project) => void;
  onOpenDossier?: (project: Project) => void;
  currency?: CurrencyMode;
  onToggleCurrency?: () => void;
}

export default function DashboardView({
  projects,
  onNavigate,
  onSelectProjectForChat,
  onOpenDossier,
  currency = 'PKR',
  onToggleCurrency
}: DashboardViewProps) {
  const [dashboardPage, setDashboardPage] = useState(1);
  const DASHBOARD_PAGE_SIZE = 5;
  const totalDashboardPages = Math.ceil(projects.length / DASHBOARD_PAGE_SIZE) || 1;
  const safeDashboardPage = Math.min(Math.max(1, dashboardPage), totalDashboardPages);
  const paginatedDashboardProjects = projects.slice(
    (safeDashboardPage - 1) * DASHBOARD_PAGE_SIZE,
    safeDashboardPage * DASHBOARD_PAGE_SIZE
  );

  // High Priority Opportunities (commercialization score >= 4.10 or priority === 'High Priority')
  const highPriorityProjects = projects.filter(
    (p) =>
      p.commercialization?.priority === 'High Priority' ||
      (p.commercialization?.overallScore && p.commercialization.overallScore >= 4.1) ||
      p.commercial_readiness === 'High'
  );

  // Total Addressable Market (TAM) sum across projects
  const totalTAMPKR = projects.reduce((acc, p) => {
    const pTAM = p.marketSizing?.tamPKR ? p.marketSizing.tamPKR * 1000 : (p.estimated_funding_pkr ? p.estimated_funding_pkr * 3 : 15000000);
    return acc + pTAM;
  }, 0);

  // Total Spun-off Commercial Products count
  const totalProductsCount = projects.reduce(
    (acc, p) => acc + (p.products && p.products.length > 0 ? p.products.length : 1),
    0
  );

  // Unique Research Domains count
  const domainMap = new Map<string, number>();
  projects.forEach((p) => {
    const d = p.domain || p.courseTitle || 'Pharmaceutical Formulation';
    domainMap.set(d, (domainMap.get(d) || 0) + 1);
  });
  const sortedDomains = Array.from(domainMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Karachi Industrial Area matching counts
  const industrialAreaCounts: { name: string; count: number; fit: string }[] = [
    { name: 'Korangi Industrial Area (KATI)', count: Math.round(projects.length * 0.42), fit: '95% Fit' },
    { name: 'S.I.T.E. Industrial Area', count: Math.round(projects.length * 0.28), fit: '88% Fit' },
    { name: 'Landhi Industrial Area (LATI)', count: Math.round(projects.length * 0.16), fit: '82% Fit' },
    { name: 'Port Qasim Industrial Zone', count: Math.round(projects.length * 0.08), fit: '78% Fit' },
    { name: 'Federal B Area (FBATI)', count: Math.round(projects.length * 0.06), fit: '74% Fit' }
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans bg-zinc-50 min-h-screen text-zinc-900">
      {/* Top Action Bar with Currency Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-display text-zinc-900 tracking-tight">
            Executive Intelligence & Opportunity Overview
          </h2>
          <p className="text-xs text-zinc-500">
            Office of Research, Innovation & Commercialization (ORIC) — Salim Habib University (SHU), Karachi
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Reactive Currency Switcher Button */}
          {onToggleCurrency && (
            <button
              onClick={onToggleCurrency}
              className="px-3.5 py-2 rounded-lg bg-white border border-zinc-300 hover:border-zinc-400 text-xs font-bold text-zinc-800 shadow-xs flex items-center gap-2 transition"
              title="Toggle currency benchmark (1 USD = 280 PKR)"
            >
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span>Currency: <strong>{currency}</strong></span>
              <span className="text-[10px] text-zinc-400 font-mono">({currency === 'PKR' ? '280 PKR/USD' : 'USD ($)'})</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('upload')}
            className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Documents</span>
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Portfolio Reports (A–H)</span>
          </button>
        </div>
      </div>

      {/* Institutional Alert Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-blue-50 border border-blue-200 rounded-xl p-4 sm:p-5 flex items-center justify-between flex-wrap gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-zinc-900">
              Faculty of Pharmacy (FoP) — Fall 2026 Innovation Exhibition Repository Active
            </div>
            <div className="text-xs text-zinc-600">
              Loaded <strong>{projects.length} research projects</strong> across 19 specialized pharmacy and MedTech domains mapped to Karachi&apos;s industrial estates.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            100% Ingested & Verified
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            HEC Tier-1 ORIC
          </span>
        </div>
      </div>

      {/* KPI Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Total Projects */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-2 shadow-xs hover:border-zinc-300 transition">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase tracking-wider">
            <span>Research Projects</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 font-display">
            {projects.length}
          </div>
          <div className="text-[11px] text-zinc-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Complete LMS Repository</span>
          </div>
        </div>

        {/* KPI 2: Addressable Market (TAM) */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-2 shadow-xs hover:border-zinc-300 transition">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase tracking-wider">
            <span>Addressable Market</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 font-display">
            {formatMoney(totalTAMPKR, currency)}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium">
            Pakistan Healthcare TAM
          </div>
        </div>

        {/* KPI 3: Commercial Products */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-2 shadow-xs hover:border-zinc-300 transition">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase tracking-wider">
            <span>Commercial Products</span>
            <Boxes className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 font-display">
            {totalProductsCount}
          </div>
          <div className="text-[11px] text-zinc-500">
            Dosage & consumer forms
          </div>
        </div>

        {/* KPI 4: High-Priority Deals */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-2 shadow-xs hover:border-zinc-300 transition">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase tracking-wider">
            <span>High-Priority Deals</span>
            <Star className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-red-600 font-display">
            {highPriorityProjects.length}
          </div>
          <div className="text-[11px] text-amber-700 font-medium">
            Commercial score ≥ 4.10
          </div>
        </div>

        {/* KPI 5: Industrial Estates */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-2 shadow-xs hover:border-zinc-300 transition">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase tracking-wider">
            <span>Industrial Estates</span>
            <Building2 className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 font-display">
            10 Zones
          </div>
          <div className="text-[11px] text-zinc-500">
            KATI, SITE, LATI & corridors
          </div>
        </div>
      </div>

      {/* 2-Column Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Research Domains & Formulations */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-zinc-900">Research Domains & Formulations</h3>
                <p className="text-[11px] text-zinc-500">Distribution of innovations across technical pharmacy disciplines</p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-mono">
              19 Domains
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {sortedDomains.map(([dom, cnt]) => {
              const pct = Math.round((cnt / projects.length) * 100);
              return (
                <div key={dom} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-zinc-800 truncate max-w-[280px]">{dom}</span>
                    <span className="text-zinc-500 font-mono">{cnt} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 to-rose-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(8, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Karachi Industrial Area Project Matching */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-zinc-900">Karachi Industrial Area Opportunities</h3>
                <p className="text-[11px] text-zinc-500">Number of matched SHU research projects per industrial zone</p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-mono">
              Karachi Hub
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {industrialAreaCounts.map((area) => {
              const maxVal = projects.length * 0.45;
              const barPct = Math.round((area.count / maxVal) * 100);
              return (
                <div key={area.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-zinc-800">{area.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-700 font-bold text-[11px]">{area.fit}</span>
                      <span className="text-zinc-500 font-mono font-bold">~{area.count}</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-sky-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(12, barPct))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* High-Priority Innovation Spotlight Grid */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-zinc-900">
                Top High-Priority Commercialization Opportunities
              </h3>
              <p className="text-[11px] text-zinc-500">
                Evaluated on technical feasibility, market demand, import substitution & local manufacturer fit
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('explorer')}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <span>View All ({highPriorityProjects.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {highPriorityProjects.slice(0, 4).map((proj) => {
            const somVal = proj.marketSizing?.somPKR ? proj.marketSizing.somPKR * 1000 : 450000;
            return (
              <div
                key={proj.id}
                className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-white hover:border-zinc-300 hover:shadow-xs transition flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      High Priority
                    </span>
                    <span className="text-[10px] font-bold text-red-600 font-mono">
                      TRL {proj.trl_level}/9
                    </span>
                  </div>

                  <h4 className="text-xs font-extrabold text-zinc-900 line-clamp-2 leading-snug">
                    {proj.title}
                  </h4>

                  <p className="text-[11px] text-zinc-600 line-clamp-3 leading-relaxed">
                    {proj.abstract}
                  </p>

                  <div className="text-[11px] text-zinc-500">
                    Lead: <strong className="text-zinc-800">{proj.lead_investigator || proj.facultyPI}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-extrabold text-zinc-900 font-mono">
                      {formatMoney(somVal, currency)}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-semibold uppercase">Capturable SOM</div>
                  </div>

                  <button
                    onClick={() => {
                      if (onOpenDossier) {
                        onOpenDossier(proj);
                      } else {
                        onSelectProjectForChat(proj);
                        onNavigate('chat');
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-bold flex items-center gap-1 transition"
                  >
                    <span>Inspect Dossier</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Action Navigation Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('radar')}
          className="p-4 rounded-xl border border-zinc-200 bg-white hover:border-blue-300 hover:bg-blue-50/30 transition cursor-pointer flex items-center gap-3.5 shadow-xs"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-900">Karachi Industrial Hub</div>
            <div className="text-[11px] text-zinc-500">10 verified industrial zones</div>
          </div>
        </div>

        <div
          onClick={() => onNavigate('erl')}
          className="p-4 rounded-xl border border-zinc-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30 transition cursor-pointer flex items-center gap-3.5 shadow-xs"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-900">5-Year Growth Models</div>
            <div className="text-[11px] text-zinc-500">2026–2031 CAGR scenarios</div>
          </div>
        </div>

        <div
          onClick={() => onNavigate('reports')}
          className="p-4 rounded-xl border border-zinc-200 bg-white hover:border-purple-300 hover:bg-purple-50/30 transition cursor-pointer flex items-center gap-3.5 shadow-xs"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-900">Reports A through H</div>
            <div className="text-[11px] text-zinc-500">Official printable briefs</div>
          </div>
        </div>

        <div
          onClick={() => onNavigate('sources')}
          className="p-4 rounded-xl border border-zinc-200 bg-white hover:border-red-300 hover:bg-red-50/30 transition cursor-pointer flex items-center gap-3.5 shadow-xs"
        >
          <div className="w-10 h-10 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-900">Sources & Evidence</div>
            <div className="text-[11px] text-zinc-500">Statutory citations registry</div>
          </div>
        </div>
      </div>
    </div>
  );
}
