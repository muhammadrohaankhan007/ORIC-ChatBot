'use client';

import React, { useState, useEffect } from 'react';
import { Project, Persona, ViewMode } from '@/types';
import {
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Layers,
  FileCheck2,
  Building2,
  Compass,
  GraduationCap,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  FlaskConical,
  Check,
  Search,
  Radio,
  X
} from 'lucide-react';

interface HomeHeroViewProps {
  projects: Project[];
  personas?: Persona[];
  onNavigate: (view: ViewMode) => void;
  onSelectProjectForChat: (project: Project) => void;
  onOpenVoiceAgentForProject?: (project: Project) => void;
}

export const HomeHeroView: React.FC<HomeHeroViewProps> = ({
  projects,
  onNavigate,
  onSelectProjectForChat,
  onOpenVoiceAgentForProject,
}) => {
  const [currentYear, setCurrentYear] = useState(2026);
  const [pipelineSearch, setPipelineSearch] = useState('');
  const [pipelineFaculty, setPipelineFaculty] = useState<string>('ALL');
  const [pipelinePage, setPipelinePage] = useState(1);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  // Institutional statistics computed from active portfolio
  const totalFunding = projects.reduce((acc, p) => acc + (p.estimated_funding_pkr || 0), 0);
  const totalFundingMillions = (totalFunding / 1_000_000).toFixed(1);
  const highReadiness = projects.filter((p) => p.commercial_readiness === 'High');
  const patentProjects = projects.filter((p) => p.ip_status !== 'None');
  const patentCount = projects.filter((p) => p.ip_status === 'Patent Pending' || p.ip_status === 'Patent Granted').length;
  const disclosureCount = projects.filter((p) => p.ip_status === 'Disclosure Filed').length;
  const avgErl = (projects.reduce((acc, p) => acc + (p.erl_level || 0), 0) / (projects.length || 1)).toFixed(1);
  const avgTrl = (projects.reduce((acc, p) => acc + (p.trl_level || 0), 0) / (projects.length || 1)).toFixed(1);

  // Filtered & Paginated Pipeline Portfolio
  const filteredPipelineProjects = projects.filter((p) => {
    const matchesFaculty = pipelineFaculty === 'ALL' || p.faculty_code === pipelineFaculty;
    if (!matchesFaculty) return false;
    if (!pipelineSearch.trim()) return true;
    const q = pipelineSearch.toLowerCase();
    return (
      (p.title || '').toLowerCase().includes(q) ||
      (p.lead_investigator || '').toLowerCase().includes(q) ||
      (p.department || '').toLowerCase().includes(q) ||
      (p.project_code || '').toLowerCase().includes(q) ||
      p.technology_stack?.some((t) => t.toLowerCase().includes(q))
    );
  });

  const PAGE_SIZE = 8;
  const filteredProjectsCount = filteredPipelineProjects.length;
  const totalPipelinePagesCount = Math.ceil(filteredProjectsCount / PAGE_SIZE) || 1;
  const safeCurrentPage = Math.min(pipelinePage, totalPipelinePagesCount);
  const paginatedPipelineProjects = filteredPipelineProjects.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE
  );

  const specializationAreas = [
    {
      id: 'pharmacy',
      code: 'FOP',
      title: 'Pharmaceutics & Health Sciences',
      lead: 'Drug Formulation, Clinical Stability & DRAP Compliance',
      description: 'Nanocarriers, transdermal therapeutics, dissolution kinetics, and regulatory dossiers for Karachi pharmaceutical manufacturers.',
    },
    {
      id: 'computing',
      code: 'FCS',
      title: 'Computing & Artificial Intelligence',
      lead: 'Embedded Vision, Edge Inference & Data Engineering',
      description: 'Factory-floor computer vision, automated quality assurance, predictive maintenance, and scalable institutional software.',
    },
    {
      id: 'biomedical',
      code: 'FE',
      title: 'Biomedical Engineering',
      lead: 'Instrumentation, Biosensors & Medical Devices',
      description: 'Wearable diagnostic sensors, non-invasive physiological monitors, and ISO 13485 medical device prototyping.',
    },
    {
      id: 'commercialization',
      code: 'ORIC',
      title: 'Technology Commercialization',
      lead: 'Patent Strategy, ERL Benchmarking & Bilateral MoUs',
      description: 'Institutional intellectual property filings, industry-academia matching, technology licensing, and venture spinouts.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-red-600 selection:text-white">
      {/* =========================================================================
          1. INSTITUTIONAL TOP BAR (WHITE CANVAS, CLEAN RED ACCENT)
          ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* University Official Brand & Crest */}
          <div className="flex items-center gap-3">
            <img
              src="/shu-logo.png"
              alt="Salim Habib University Official Logo"
              className="h-10 w-auto object-contain"
            />
            <div className="h-7 w-px bg-zinc-200 hidden sm:block" />
            <div>
              <div className="font-bold text-xs tracking-tight text-zinc-900 flex items-center gap-1.5">
                <span>ORIC</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-50 text-red-700 font-semibold border border-red-200">
                  HEC Tier-1
                </span>
              </div>
              <div className="text-[11px] text-zinc-500 font-normal hidden sm:block">
                Office of Research, Innovation & Commercialization
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-600">
            <a href="#pipeline" className="hover:text-zinc-900 transition">
              Research Pipeline
            </a>
            <a href="#industry" className="hover:text-zinc-900 transition">
              Industry Radar
            </a>
            <a href="#specializations" className="hover:text-zinc-900 transition">
              Specialization Areas
            </a>
            <a href="#framework" className="hover:text-zinc-900 transition">
              8D ERL Framework
            </a>
            <a href="#contact" className="hover:text-zinc-900 transition">
              Contact & MoUs
            </a>
          </nav>

          {/* Functional Actions */}
          <div className="flex items-center gap-3">
            <a
              href="mailto:oric@shu.edu.pk"
              className="hidden lg:flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 transition"
              title="Official ORIC Directorate Email"
            >
              <Mail className="w-3.5 h-3.5 text-red-600" />
              <span>oric@shu.edu.pk</span>
            </a>

            <button
              onClick={() => onNavigate('dashboard')}
              className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <span>Research Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. INSTITUTIONAL HERO SECTION (CLEAN OFF-WHITE CANVAS)
          ========================================================================= */}
      <section className="border-b border-zinc-200 bg-zinc-50/70 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Institutional Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-zinc-200 text-zinc-700 text-xs font-semibold shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
              HEC Recognized Tier-1 ORIC
            </span>
            <span className="text-xs text-zinc-500">
              Salim Habib University • Korangi Creek, Karachi
            </span>
          </div>

          {/* Master Headline */}
          <div className="max-w-4xl space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-zinc-900 tracking-tight leading-tight">
              Bridging University Research with National Industrial Manufacturing
            </h1>
            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
              The Office of Research, Innovation & Commercialization (ORIC) accelerates technology transfer and enterprise development at Salim Habib University. We translate laboratory discoveries in Pharmaceutics, Artificial Intelligence, and Biomedical Engineering into commercial solutions for Karachi&apos;s industrial estates across Korangi, Landhi, and S.I.T.E.
            </p>
          </div>

          {/* Actionable CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Open Research Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('chat')}
              className="px-5 py-2.5 rounded-lg bg-white hover:bg-zinc-50 text-zinc-800 font-semibold text-xs border border-zinc-300 flex items-center gap-2 shadow-xs transition"
            >
              <Sparkles className="w-4 h-4 text-red-600" />
              <span>Consult ORIC Research Assistant</span>
            </button>

            <button
              onClick={() => onNavigate('radar')}
              className="px-4 py-2.5 rounded-lg bg-white hover:bg-zinc-50 text-zinc-700 font-medium text-xs border border-zinc-200 flex items-center gap-2 transition"
            >
              <Building2 className="w-4 h-4 text-zinc-500" />
              <span>Karachi Industry Radar</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. VERIFIED METRICS TICKER (CLEAN CARDS)
          ========================================================================= */}
      <section className="border-b border-zinc-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Total Projects */}
            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
                <span>Active Projects</span>
                <Layers className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-zinc-900">{projects.length}</div>
              <div className="text-xs text-zinc-500 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-red-600" />
                <span>Verified Laboratory Units</span>
              </div>
            </div>

            {/* Grant Pipeline */}
            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
                <span>Committed R&D Budget</span>
                <TrendingUp className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-red-600">PKR {totalFundingMillions}M</div>
              <div className="text-xs text-zinc-500">
                <span>Internal & External Grants</span>
              </div>
            </div>

            {/* High Commercialization Candidates */}
            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
                <span>High-Readiness Candidates</span>
                <Building2 className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-zinc-900">{highReadiness.length}</div>
              <div className="text-xs text-zinc-500">
                <span>{Math.round((highReadiness.length / (projects.length || 1)) * 100)}% of Active Portfolio</span>
              </div>
            </div>

            {/* Average Readiness Index */}
            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
                <span>Average Maturity</span>
                <Compass className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-zinc-900">ERL {avgErl}</div>
              <div className="text-xs text-zinc-500">
                <span>Average TRL Score: {avgTrl}/9</span>
              </div>
            </div>

            {/* IP Filings */}
            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1 col-span-2 md:col-span-1">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
                <span>Patent & IP Filings</span>
                <FileCheck2 className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-zinc-900">{patentProjects.length}</div>
              <div className="text-xs text-zinc-500">
                <span>{patentCount} Granted/Pending • {disclosureCount} Filed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. ACTIVE RESEARCH PIPELINE (#pipeline)
          ========================================================================= */}
      <section id="pipeline" className="border-b border-zinc-200 py-16 lg:py-20 bg-zinc-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600">
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Institutional Portfolio</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-extrabold font-display text-zinc-900 tracking-tight">
                Active Research Projects & Commercial Pipelines
              </h2>
              <p className="text-sm text-zinc-600 max-w-2xl">
                Multi-disciplinary research projects evaluated under HEC benchmarks and the 8-Dimension Entrepreneurship Readiness framework.
              </p>
            </div>

            <button
              onClick={() => onNavigate('explorer')}
              className="px-3.5 py-2 rounded-lg bg-white hover:bg-zinc-50 text-zinc-800 font-medium text-xs border border-zinc-200 shadow-xs flex items-center gap-1.5 transition self-start md:self-auto"
            >
              <span>View All {projects.length} in IP Repository</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          </div>

          {/* Search Bar & Faculty Filters */}
          <div className="space-y-3">
            {/* Faculty Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { code: 'ALL', label: `All Projects (${projects.length})` },
                { code: 'FOP', label: `Pharmacy (${projects.filter(p => p.faculty_code === 'FOP').length})` },
                { code: 'FCS', label: 'Computer Science & AI (FCS)' },
                { code: 'FE', label: 'Biomedical Engineering (FE)' },
                { code: 'FMS', label: 'Management Sciences (FMS)' },
              ].map((tab) => (
                <button
                  key={tab.code}
                  onClick={() => {
                    setPipelineFaculty(tab.code);
                    setPipelinePage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    pipelineFaculty === tab.code
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-lg">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={pipelineSearch}
                  onChange={(e) => {
                    setPipelineSearch(e.target.value);
                    setPipelinePage(1);
                  }}
                  placeholder="Search 230+ projects by title, supervisor, drug/formulation, or keyword..."
                  className="w-full bg-white border border-zinc-200 rounded-lg pl-10 pr-8 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-hidden focus:border-red-500 shadow-2xs"
                />
                {pipelineSearch && (
                  <button
                    onClick={() => {
                      setPipelineSearch('');
                      setPipelinePage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Counter */}
              <div className="text-xs text-zinc-500 font-medium">
                Showing{' '}
                <strong className="text-zinc-900">
                  {Math.min(
                    filteredProjectsCount,
                    (safeCurrentPage - 1) * 8 + 1
                  )}{' '}
                  -{' '}
                  {Math.min(
                    filteredProjectsCount,
                    safeCurrentPage * 8
                  )}
                </strong>{' '}
                of <strong className="text-zinc-900">{filteredProjectsCount}</strong> matching projects
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paginatedPipelineProjects.map((project, idx) => (
              <div
                key={`${project.id}-${idx}`}
                className="bg-white border border-zinc-200 rounded-lg p-6 space-y-4 shadow-xs hover:border-zinc-300 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                      {project.project_code}
                    </span>
                    <span className="text-xs font-semibold text-red-600">
                      {project.faculty}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-zinc-900 leading-snug">
                    {project.title}
                  </h3>

                  <p className="text-xs text-zinc-600 leading-relaxed line-clamp-3">
                    {project.abstract}
                  </p>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200 font-medium">
                      TRL {project.trl_level}/9
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-medium">
                      ERL {project.erl_level}/9
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200 font-medium">
                      {project.ip_status}
                    </span>
                    {project.estimated_funding_pkr && (
                      <span className="text-xs text-zinc-500 font-medium">
                        Valuation: PKR {(project.estimated_funding_pkr / 1_000_000).toFixed(1)}M
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 flex items-center justify-between gap-3">
                  <div className="text-xs text-zinc-500 truncate">
                    Lead: <span className="text-zinc-800 font-medium">{project.lead_investigator}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {onOpenVoiceAgentForProject && (
                      <button
                        onClick={() => onOpenVoiceAgentForProject(project)}
                        title="Talk with Live Voice Agent about this project"
                        className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs border border-red-200 flex items-center gap-1 transition shadow-2xs"
                      >
                        <Radio className="w-3 h-3 text-red-600 animate-pulse" />
                        <span className="hidden sm:inline">Voice Agent</span>
                      </button>
                    )}
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
                      <span>ERL</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state if search returned no results */}
          {paginatedPipelineProjects.length === 0 && (
            <div className="p-12 text-center bg-white border border-zinc-200 rounded-lg space-y-2">
              <div className="text-sm font-bold text-zinc-900">No matching projects found</div>
              <p className="text-xs text-zinc-500">
                Try searching for different keywords, drug formulation names, or investigators.
              </p>
              <button
                onClick={() => {
                  setPipelineSearch('');
                  setPipelineFaculty('ALL');
                }}
                className="mt-2 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPipelinePagesCount > 1 && (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setPipelinePage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className="px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-xs text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
              >
                Previous
              </button>
              <span className="text-xs text-zinc-500 font-medium">
                Page <strong className="text-zinc-900">{safeCurrentPage}</strong> of{' '}
                <strong className="text-zinc-900">{totalPipelinePagesCount}</strong>
              </span>
              <button
                onClick={() => setPipelinePage((p) => Math.min(totalPipelinePagesCount, p + 1))}
                disabled={safeCurrentPage === totalPipelinePagesCount}
                className="px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-xs text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          5. KARACHI INDUSTRIAL RADAR (#industry)
          ========================================================================= */}
      <section id="industry" className="border-b border-zinc-200 py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600">
              <Building2 className="w-3.5 h-3.5" />
              <span>Commercialization Hub</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold font-display text-zinc-900 tracking-tight">
              Karachi Industrial Corridor Matching
            </h2>
            <p className="text-sm text-zinc-600 max-w-3xl">
              Salim Habib University is situated in Korangi Creek, providing direct proximity to Karachi&apos;s primary industrial manufacturing corridors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Korangi */}
            <div className="p-5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2.5">
              <div className="text-xs font-semibold text-red-600">Cluster 01</div>
              <h3 className="text-sm font-bold text-zinc-900">Korangi Industrial Area</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Primary pharmaceutical manufacturing, textile exports, leather tanning, and specialty chemicals.
              </p>
              <div className="pt-2 text-xs text-zinc-700 font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-red-600" />
                <span>Active MoUs: Getz Pharma, Artistic</span>
              </div>
            </div>

            {/* Landhi */}
            <div className="p-5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2.5">
              <div className="text-xs font-semibold text-red-600">Cluster 02</div>
              <h3 className="text-sm font-bold text-zinc-900">Landhi Industrial Estate</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Secondary pharmaceutical formulations, automotive parts assembly, and large-scale FMCG distribution.
              </p>
              <div className="pt-2 text-xs text-zinc-700 font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-red-600" />
                <span>Target Partners: Ferozsons, Searle</span>
              </div>
            </div>

            {/* S.I.T.E. */}
            <div className="p-5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2.5">
              <div className="text-xs font-semibold text-red-600">Cluster 03</div>
              <h3 className="text-sm font-bold text-zinc-900">S.I.T.E. Industrial Area</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Industrial hub specializing in composite textiles, heavy dyeing, and industrial plastic polymers.
              </p>
              <div className="pt-2 text-xs text-zinc-700 font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-red-600" />
                <span>Target Partners: Gul Ahmed, EBM</span>
              </div>
            </div>

            {/* Port Qasim */}
            <div className="p-5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2.5">
              <div className="text-xs font-semibold text-red-600">Cluster 04</div>
              <h3 className="text-sm font-bold text-zinc-900">Port Qasim Zone</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Export terminal corridor, petro-chemicals, edible oils, thermal power, and maritime logistics.
              </p>
              <div className="pt-2 text-xs text-zinc-700 font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-red-600" />
                <span>Target Partners: Engro, National Foods</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg bg-zinc-50 border border-zinc-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-zinc-900">Corporate Collaboration Inquiries</h4>
              <p className="text-xs text-zinc-600">Review verified company profiles, technology demands, and corporate contacts in the interactive radar.</p>
            </div>
            <button
              onClick={() => onNavigate('radar')}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center gap-1.5 shrink-0 transition shadow-xs"
            >
              <Building2 className="w-4 h-4" />
              <span>Open Industrial Radar</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. RESEARCH SPECIALIZATION AREAS (#specializations)
          ========================================================================= */}
      <section id="specializations" className="border-b border-zinc-200 py-16 lg:py-20 bg-zinc-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Academic Domains</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold font-display text-zinc-900 tracking-tight">
              Research Specialization Areas
            </h2>
            <p className="text-sm text-zinc-600 max-w-3xl">
              Salim Habib University faculty researchers collaborate across distinct domain verticals to advance laboratory validation and technology commercialization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {specializationAreas.map((area) => (
              <div
                key={area.id}
                className="bg-white border border-zinc-200 rounded-lg p-5 space-y-3 shadow-xs hover:border-zinc-300 transition flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                      {area.code}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">{area.title}</h3>
                    <div className="text-xs text-red-600 font-medium pt-0.5">{area.lead}</div>
                  </div>

                  <p className="text-xs text-zinc-600 leading-relaxed">
                    {area.description}
                  </p>
                </div>

                <button
                  onClick={() => onNavigate('chat')}
                  className="w-full mt-2 py-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-zinc-800 text-xs font-medium border border-zinc-200 flex items-center justify-center gap-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-red-600" />
                  <span>Open in AI Assistant</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. HEC 8-DIMENSION ERL CANVAS (#framework)
          ========================================================================= */}
      <section id="framework" className="border-b border-zinc-200 py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600">
              <Compass className="w-3.5 h-3.5" />
              <span>Commercialization Framework</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold font-display text-zinc-900 tracking-tight">
              8-Dimension Entrepreneurship Readiness (ERL) Framework
            </h2>
            <p className="text-sm text-zinc-600 max-w-3xl">
              Academic research projects are assessed across 8 critical dimensions to benchmark technical validity, IP protection, and industrial commercialization readiness.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
              <div className="text-xs font-semibold text-red-600">DIMENSION 01</div>
              <h3 className="text-sm font-bold text-zinc-900">Problem Validation</h3>
              <p className="text-xs text-zinc-600">Quantifiable pain points and corporate buyer discovery.</p>
            </div>

            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
              <div className="text-xs font-semibold text-red-600">DIMENSION 02</div>
              <h3 className="text-sm font-bold text-zinc-900">Market Sizing</h3>
              <p className="text-xs text-zinc-600">TAM, SAM, SOM analysis for national and regional export corridors.</p>
            </div>

            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
              <div className="text-xs font-semibold text-red-600">DIMENSION 03</div>
              <h3 className="text-sm font-bold text-zinc-900">Intellectual Property</h3>
              <p className="text-xs text-zinc-600">Patentability, freedom-to-operate, and provisional filings.</p>
            </div>

            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
              <div className="text-xs font-semibold text-red-600">DIMENSION 04</div>
              <h3 className="text-sm font-bold text-zinc-900">Regulatory Clearance</h3>
              <p className="text-xs text-zinc-600">DRAP compliance, PSQCA guidelines, and ISO standards.</p>
            </div>

            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
              <div className="text-xs font-semibold text-red-600">DIMENSION 05</div>
              <h3 className="text-sm font-bold text-zinc-900">Technical Maturity</h3>
              <p className="text-xs text-zinc-600">Bench testing, pilot validation, and TRL 1-9 progression.</p>
            </div>

            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
              <div className="text-xs font-semibold text-red-600">DIMENSION 06</div>
              <h3 className="text-sm font-bold text-zinc-900">Operational Team</h3>
              <p className="text-xs text-zinc-600">Principal investigators, research associates, and commercial leads.</p>
            </div>

            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
              <div className="text-xs font-semibold text-red-600">DIMENSION 07</div>
              <h3 className="text-sm font-bold text-zinc-900">Financial Feasibility</h3>
              <p className="text-xs text-zinc-600">Unit economics, CAPEX/OPEX modeling, and grant allocations.</p>
            </div>

            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
              <div className="text-xs font-semibold text-red-600">DIMENSION 08</div>
              <h3 className="text-sm font-bold text-zinc-900">Industrial Scalability</h3>
              <p className="text-xs text-zinc-600">Mass production workflows and factory-floor integration.</p>
            </div>
          </div>

          <div className="pt-2 flex justify-start">
            <button
              onClick={() => onNavigate('erl')}
              className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center gap-2 transition shadow-xs"
            >
              <span>Launch 8-Dimension Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. INSTITUTIONAL CONTACT & MOUS (#contact)
          ========================================================================= */}
      <section id="contact" className="border-b border-zinc-200 py-16 lg:py-20 bg-zinc-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Contact Details */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Institutional Collaboration</span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-extrabold font-display text-zinc-900 tracking-tight">
                  Office of Research, Innovation & Commercialization
                </h2>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  We collaborate with corporate partners, research sponsors, alumni, and investors seeking bilaterally structured joint ventures, technology licensing, or laboratory access.
                </p>
              </div>

              <div className="space-y-3.5 text-sm text-zinc-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-red-600 mt-1 shrink-0" />
                  <div>
                    <strong className="text-zinc-900">Campus Address:</strong>
                    <div className="text-zinc-600">Salim Habib University, NC-24, Deh Dih, Korangi Creek, Karachi - 74900, Sindh, Pakistan.</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-red-600 shrink-0" />
                  <div>
                    <strong className="text-zinc-900">Official Email: </strong>
                    <a href="mailto:oric@shu.edu.pk" className="text-red-600 hover:underline">
                      oric@shu.edu.pk
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-red-600 shrink-0" />
                  <div>
                    <strong className="text-zinc-900">Telephone Exchange: </strong>
                    <a href="tel:+9221111248748" className="hover:text-zinc-900 transition">
                      +92 (21) 111-248-748
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <ExternalLink className="w-4 h-4 text-red-600 shrink-0" />
                  <div>
                    <strong className="text-zinc-900">University Portal: </strong>
                    <a
                      href="https://shu.edu.pk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-700 hover:text-zinc-900 hover:underline transition"
                    >
                      www.shu.edu.pk
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Corporate MoU Box */}
            <div className="p-8 rounded-lg bg-white border border-zinc-200 space-y-5 shadow-xs">
              <h3 className="text-base font-bold text-zinc-900">Commercial Collaboration Inquiries</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Connect directly with the ORIC Directorate for non-disclosure agreements (NDAs), technology evaluations, or faculty-sponsored research contracts.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Access Research Dashboard</span>
                </button>

                <a
                  href="mailto:oric@shu.edu.pk?subject=Corporate%20MoU%20%26%20Research%20Collaboration%20Inquiry%20-%20Salim%20Habib%20University"
                  className="w-full py-2.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border border-zinc-200 font-medium text-xs flex items-center justify-center gap-2 transition text-center"
                >
                  <Mail className="w-4 h-4 text-red-600" />
                  <span>Send Direct Commercialization Inquiry</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. INSTITUTIONAL WEBSITE FOOTER
          ========================================================================= */}
      <footer className="bg-white border-t border-zinc-200 py-12 text-zinc-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: University ORIC Info */}
            <div className="space-y-3">
              <img
                src="/shu-logo.png"
                alt="Salim Habib University"
                className="h-10 w-auto object-contain"
              />
              <p className="text-zinc-500 leading-relaxed text-xs">
                Office of Research, Innovation & Commercialization, Salim Habib University. Recognized by the Higher Education Commission (HEC) of Pakistan.
              </p>
              <div className="text-xs text-zinc-500">
                NC-24, Deh Dih, Korangi Creek, Karachi, Pakistan.
              </div>
            </div>

            {/* Col 2: Institutional Sections */}
            <div className="space-y-2">
              <div className="text-zinc-900 font-semibold text-xs">Website Navigation</div>
              <ul className="space-y-1.5 text-xs text-zinc-600">
                <li><a href="#pipeline" className="hover:text-zinc-900 transition">Research Pipeline</a></li>
                <li><a href="#industry" className="hover:text-zinc-900 transition">Karachi Industry Radar</a></li>
                <li><a href="#specializations" className="hover:text-zinc-900 transition">Specialization Areas</a></li>
                <li><a href="#framework" className="hover:text-zinc-900 transition">8D ERL Framework</a></li>
                <li><a href="#contact" className="hover:text-zinc-900 transition">Contact & MoUs</a></li>
              </ul>
            </div>

            {/* Col 3: Research Workspace Tools */}
            <div className="space-y-2">
              <div className="text-zinc-900 font-semibold text-xs">Workspace Tools</div>
              <ul className="space-y-1.5 text-xs text-zinc-600">
                <li>
                  <button onClick={() => onNavigate('dashboard')} className="hover:text-zinc-900 transition text-left">
                    Dashboard
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('chat')} className="hover:text-zinc-900 transition text-left">
                    Research Assistant
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('explorer')} className="hover:text-zinc-900 transition text-left">
                    Patents & IP
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('radar')} className="hover:text-zinc-900 transition text-left">
                    Industry Contacts
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('erl')} className="hover:text-zinc-900 transition text-left">
                    Readiness Score
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Accreditation & Contact */}
            <div className="space-y-2">
              <div className="text-zinc-900 font-semibold text-xs">Accreditation & Contact</div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Operating strictly in accordance with HEC Policy on Higher Education Research and National Technology Transfer frameworks.
              </p>
              <div className="pt-1">
                <a
                  href="mailto:oric@shu.edu.pk"
                  className="inline-flex items-center gap-1.5 text-red-600 hover:underline font-medium text-xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>oric@shu.edu.pk</span>
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <div>
              © {currentYear} Salim Habib University (SHU) Office of Research, Innovation & Commercialization. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <a href="https://shu.edu.pk" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-800 transition">
                Salim Habib University Official
              </a>
              <span>•</span>
              <a href="https://hec.gov.pk" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-800 transition">
                HEC Pakistan
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeHeroView;
