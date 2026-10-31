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
  FlaskConical
} from 'lucide-react';

interface HomeHeroViewProps {
  projects: Project[];
  personas: Persona[];
  onNavigate: (view: ViewMode) => void;
  onSelectProjectForChat: (project: Project) => void;
}

export const HomeHeroView: React.FC<HomeHeroViewProps> = ({
  projects,
  personas,
  onNavigate,
  onSelectProjectForChat,
}) => {
  const [currentYear, setCurrentYear] = useState(2026);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  // Cross-validated dynamic statistics
  const totalFunding = projects.reduce((acc, p) => acc + (p.estimated_funding_pkr || 0), 0);
  const totalFundingMillions = (totalFunding / 1_000_000).toFixed(1);
  const highReadiness = projects.filter((p) => p.commercial_readiness === 'High');
  const patentProjects = projects.filter((p) => p.ip_status !== 'None');
  const patentCount = projects.filter((p) => p.ip_status === 'Patent Pending' || p.ip_status === 'Patent Granted').length;
  const disclosureCount = projects.filter((p) => p.ip_status === 'Disclosure Filed').length;
  const avgErl = (projects.reduce((acc, p) => acc + (p.erl_level || 0), 0) / (projects.length || 1)).toFixed(1);
  const avgTrl = (projects.reduce((acc, p) => acc + (p.trl_level || 0), 0) / (projects.length || 1)).toFixed(1);

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-red-600 selection:text-white overflow-x-hidden">
      {/* =========================================================================
          1. INSTITUTIONAL TOP BAR (BLACK, WHITE, CRIMSON RED)
          ========================================================================= */}
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Official Clickable University Crest & Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-md bg-red-600 flex items-center justify-center font-bold text-white shadow-md shadow-red-950/40">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-display font-bold text-base tracking-tight text-white group-hover:text-red-500 transition flex items-center gap-2">
                <span>Salim Habib University</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-800/60 uppercase font-semibold">
                  ORIC
                </span>
              </div>
              <div className="text-[11px] text-zinc-400 font-medium tracking-wide">
                Office of Research, Innovation & Commercialization
              </div>
            </div>
          </a>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-300">
            <a href="#pipeline" className="hover:text-white transition">
              Research Pipeline
            </a>
            <a href="#industry" className="hover:text-white transition">
              Industry Radar
            </a>
            <a href="#faculties" className="hover:text-white transition">
              Faculty Mentors
            </a>
            <a href="#framework" className="hover:text-white transition">
              8D ERL Framework
            </a>
            <a href="#contact" className="hover:text-white transition">
              Contact & MoUs
            </a>
          </nav>

          {/* Direct Functional CTA */}
          <div className="flex items-center gap-3">
            <a
              href="mailto:oric@shu.edu.pk"
              className="hidden lg:flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition"
              title="Official ORIC Directorate Email"
            >
              <Mail className="w-3.5 h-3.5 text-red-500" />
              <span>oric@shu.edu.pk</span>
            </a>

            <button
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-500 text-white font-display font-bold text-xs flex items-center gap-2 shadow-md shadow-red-900/30 transition transform hover:-translate-y-0.5"
            >
              <span>Open Research Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. INSTITUTIONAL HERO SECTION (EDITORIAL SPACE GROTESK)
          ========================================================================= */}
      <section className="relative border-b border-zinc-800 bg-gradient-to-b from-zinc-950 via-zinc-900 to-black py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Institutional Accreditation Pill */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-950/50 border border-red-800/60 text-red-400 text-xs font-bold uppercase tracking-wider font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
              HEC Recognized Tier-1 ORIC
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium">
              Karachi Industrial Corridor • Sindh, Pakistan
            </span>
          </div>

          {/* Master Institutional Headline */}
          <div className="max-w-4xl space-y-5">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Bridging Academic Laboratory Research with National Industrial Manufacturing
            </h1>
            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
              The Office of Research, Innovation & Commercialization (ORIC) at Salim Habib University drives technology transfer and enterprise formation. We translate research discoveries in <strong className="text-white font-semibold underline decoration-red-600 underline-offset-4">Pharmaceutics</strong>, <strong className="text-white font-semibold underline decoration-red-600 underline-offset-4">Artificial Intelligence</strong>, and <strong className="text-white font-semibold underline decoration-red-600 underline-offset-4">Biomedical Engineering</strong> into commercial solutions for Karachi&apos;s manufacturing powerhouses across Korangi, Landhi, and S.I.T.E. industrial estates.
            </p>
          </div>

          {/* Direct, Concrete Functional CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-3.5 rounded-md bg-red-600 hover:bg-red-500 text-white font-display font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-900/40 transition transform hover:-translate-y-0.5"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Open Research Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('chat')}
              className="px-6 py-3.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm border border-zinc-800 hover:border-zinc-700 flex items-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4 text-red-500" />
              <span>Consult Faculty Research Mentors</span>
            </button>

            <button
              onClick={() => onNavigate('radar')}
              className="px-5 py-3.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-medium text-sm border border-zinc-800 flex items-center gap-2 transition"
            >
              <Building2 className="w-4 h-4 text-red-500" />
              <span>Explore Korangi & S.I.T.E. Radar</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. VERIFIED METRICS TICKER (STARK CONTRAST)
          ========================================================================= */}
      <section className="border-b border-zinc-800 bg-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Total Projects */}
            <div className="p-4 rounded-md bg-zinc-950 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-semibold uppercase tracking-wider font-mono">Research Projects</span>
                <Layers className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="font-display text-2xl lg:text-3xl font-black text-white">{projects.length}</div>
              <div className="text-xs text-red-500 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Vector Indexed Labs</span>
              </div>
            </div>

            {/* Pipeline Valuation */}
            <div className="p-4 rounded-md bg-zinc-950 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-semibold uppercase tracking-wider font-mono">Grant Valuation</span>
                <TrendingUp className="w-4 h-4 text-red-500" />
              </div>
              <div className="font-display text-2xl lg:text-3xl font-black text-red-500">PKR {totalFundingMillions}M</div>
              <div className="text-xs text-zinc-400">
                <span>Committed R&D Budgets</span>
              </div>
            </div>

            {/* High Commercialization Candidates */}
            <div className="p-4 rounded-md bg-zinc-950 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-semibold uppercase tracking-wider font-mono">MoU Candidates</span>
                <Building2 className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="font-display text-2xl lg:text-3xl font-black text-white">{highReadiness.length}</div>
              <div className="text-xs text-zinc-400">
                <span>{Math.round((highReadiness.length / projects.length) * 100)}% of Active Portfolio</span>
              </div>
            </div>

            {/* Average Readiness Index */}
            <div className="p-4 rounded-md bg-zinc-950 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-semibold uppercase tracking-wider font-mono">Readiness Index</span>
                <Compass className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="font-display text-2xl lg:text-3xl font-black text-white">ERL {avgErl}</div>
              <div className="text-xs text-zinc-400">
                <span>Average TRL Score: {avgTrl}/9</span>
              </div>
            </div>

            {/* IP Filings */}
            <div className="p-4 rounded-md bg-zinc-950 border border-zinc-800 space-y-1 col-span-2 md:col-span-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-semibold uppercase tracking-wider font-mono">IP Filings</span>
                <FileCheck2 className="w-4 h-4 text-red-500" />
              </div>
              <div className="font-display text-2xl lg:text-3xl font-black text-white">{patentProjects.length}</div>
              <div className="text-xs text-red-400">
                <span>{patentCount} Pending • {disclosureCount} Disclosed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. ACTIVE RESEARCH PIPELINE (#pipeline)
          ========================================================================= */}
      <section id="pipeline" className="border-b border-zinc-800 py-16 lg:py-20 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 uppercase tracking-wider font-mono">
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Institutional R&D Portfolio</span>
              </div>
              <h2 className="font-display text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                Active Research Projects & Commercial Pipelines
              </h2>
              <p className="text-sm text-zinc-400 max-w-2xl">
                Multi-disciplinary research initiatives assessed under Higher Education Commission (HEC) commercialization benchmarks and Entrepreneurship Readiness Levels.
              </p>
            </div>

            <button
              onClick={() => onNavigate('explorer')}
              className="px-4 py-2 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs border border-zinc-800 flex items-center gap-1.5 transition self-start md:self-auto"
            >
              <span>Explore All {projects.length} Projects in Database</span>
              <ChevronRight className="w-3.5 h-3.5 text-red-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-black border border-zinc-800 rounded-md p-6 space-y-4 hover:border-red-900/60 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                      {project.project_code}
                    </span>
                    <span className="text-xs font-semibold text-red-500 font-mono">
                      {project.faculty}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-white leading-snug">
                    {project.title}
                  </h3>

                  <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3">
                    {project.abstract}
                  </p>

                  {/* Technical Meta Tags */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-900 text-white border border-zinc-800 font-medium">
                      TRL {project.trl_level}/9
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-red-950/40 text-red-400 border border-red-900/40 font-medium">
                      ERL {project.erl_level}/9
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 font-medium">
                      {project.ip_status}
                    </span>
                    {project.estimated_funding_pkr && (
                      <span className="text-[11px] font-mono text-zinc-400">
                        Valuation: PKR {(project.estimated_funding_pkr / 1_000_000).toFixed(1)}M
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                  <div className="text-xs text-zinc-400 truncate">
                    Lead: <span className="text-white font-medium">{project.lead_investigator}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onSelectProjectForChat(project);
                        onNavigate('chat');
                      }}
                      className="px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-500 text-white font-display font-bold text-xs flex items-center gap-1 transition"
                    >
                      <span>Analyze</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onNavigate('erl')}
                      className="px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold border border-zinc-800 transition"
                    >
                      <span>ERL Score</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. KARACHI INDUSTRIAL RADAR (#industry)
          ========================================================================= */}
      <section id="industry" className="border-b border-zinc-800 py-16 lg:py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 uppercase tracking-wider font-mono">
              <Building2 className="w-3.5 h-3.5" />
              <span>Commercialization Nexus</span>
            </div>
            <h2 className="font-display text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Karachi Industrial Corridor Matching Radar
            </h2>
            <p className="text-sm text-zinc-400 max-w-3xl">
              Salim Habib University is geographically anchored at Korangi Creek, providing direct physical access to major industrial estates across the Karachi metropolitan region.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Korangi */}
            <div className="p-5 rounded-md bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="text-xs font-bold text-red-500 uppercase tracking-wider font-mono">Cluster 01</div>
              <h3 className="font-display text-base font-bold text-white">Korangi Industrial Area</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Primary pharmaceutical manufacturing, textile exports, leather tanning, and specialty chemical processing.
              </p>
              <div className="pt-2 text-xs text-red-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
                <span>Active MoUs: Getz Pharma, Artistic</span>
              </div>
            </div>

            {/* Landhi */}
            <div className="p-5 rounded-md bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="text-xs font-bold text-red-500 uppercase tracking-wider font-mono">Cluster 02</div>
              <h3 className="font-display text-base font-bold text-white">Landhi Industrial Estate</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Secondary pharmaceutical formulations, automotive parts assembly, and large-scale FMCG distribution.
              </p>
              <div className="pt-2 text-xs text-red-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
                <span>Target Partners: Ferozsons, Searle</span>
              </div>
            </div>

            {/* S.I.T.E. */}
            <div className="p-5 rounded-md bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="text-xs font-bold text-red-500 uppercase tracking-wider font-mono">Cluster 03</div>
              <h3 className="font-display text-base font-bold text-white">S.I.T.E. Industrial Area</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Historic industrial hub specializing in composite textiles, heavy dyeing, and industrial plastic polymers.
              </p>
              <div className="pt-2 text-xs text-red-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
                <span>Target Partners: Gul Ahmed, EBM</span>
              </div>
            </div>

            {/* Port Qasim */}
            <div className="p-5 rounded-md bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="text-xs font-bold text-red-500 uppercase tracking-wider font-mono">Cluster 04</div>
              <h3 className="font-display text-base font-bold text-white">Port Qasim Industrial Zone</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Export terminal corridor, petro-chemicals, edible oils, thermal power, and maritime logistics.
              </p>
              <div className="pt-2 text-xs text-red-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
                <span>Target Partners: Engro, National Foods</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-md bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-display text-sm font-bold text-white">Corporate Collaboration Opportunities</h4>
              <p className="text-xs text-zinc-400">Review verified company profiles, technology demands, and corporate contacts in the interactive radar.</p>
            </div>
            <button
              onClick={() => onNavigate('radar')}
              className="px-5 py-2.5 rounded-md bg-red-600 hover:bg-red-500 text-white font-display font-bold text-xs flex items-center gap-2 shrink-0 transition"
            >
              <Building2 className="w-4 h-4" />
              <span>Open Industrial Radar Matrix</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. VIRTUAL RESEARCH FACULTY & MENTORS (#faculties)
          ========================================================================= */}
      <section id="faculties" className="border-b border-zinc-800 py-16 lg:py-20 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 uppercase tracking-wider font-mono">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Academic Advisory Directorate</span>
            </div>
            <h2 className="font-display text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Virtual Teachers & Academic Research Mentors
            </h2>
            <p className="text-sm text-zinc-400 max-w-3xl">
              Salim Habib University faculty mentors provide real-time Socratic guidance and technical evaluation, powered by live Google Gemini intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {personas.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-black border border-zinc-800 rounded-md p-5 space-y-4 hover:border-red-900/60 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800 text-red-500 font-mono font-bold text-xs flex items-center justify-center">
                      {mentor.avatar}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                      {mentor.facultyCode}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-sm font-bold text-white">{mentor.name}</h3>
                    <div className="text-[11px] text-red-500 font-medium">{mentor.title}</div>
                    <div className="text-[11px] text-zinc-400">{mentor.department}</div>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {mentor.systemPrompt?.replace(/^You are [^,]+,\s*/, '')}
                  </p>
                </div>

                <button
                  onClick={() => onNavigate('chat')}
                  className="w-full mt-2 py-2 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold border border-zinc-800 hover:border-zinc-700 flex items-center justify-center gap-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-red-500" />
                  <span>Consult in AI Workspace</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. HEC 8-DIMENSION ERL CANVAS (#framework)
          ========================================================================= */}
      <section id="framework" className="border-b border-zinc-800 py-16 lg:py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 uppercase tracking-wider font-mono">
              <Compass className="w-3.5 h-3.5" />
              <span>Rigorous Commercialization Metric</span>
            </div>
            <h2 className="font-display text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              The 8-Dimension Entrepreneurship Readiness (ERL) Canvas
            </h2>
            <p className="text-sm text-zinc-400 max-w-3xl">
              Commercializing academic research requires more than laboratory validation. Salim Habib University enforces the 8-Dimension ERL Framework to benchmark every candidate project across technical, legal, and market verticals.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-md bg-zinc-950 border border-zinc-800 space-y-1.5">
              <div className="text-xs font-mono text-red-500">DIMENSION 01</div>
              <h3 className="font-display text-sm font-bold text-white">Problem Validation</h3>
              <p className="text-xs text-zinc-400">Quantifiable pain points and corporate buyer discovery.</p>
            </div>

            <div className="p-4 rounded-md bg-zinc-950 border border-zinc-800 space-y-1.5">
              <div className="text-xs font-mono text-red-500">DIMENSION 02</div>
              <h3 className="font-display text-sm font-bold text-white">Market Sizing</h3>
              <p className="text-xs text-zinc-400">TAM, SAM, SOM analysis for national and GCC export markets.</p>
            </div>

            <div className="p-4 rounded-md bg-zinc-950 border border-zinc-800 space-y-1.5">
              <div className="text-xs font-mono text-red-500">DIMENSION 03</div>
              <h3 className="font-display text-sm font-bold text-white">Intellectual Property</h3>
              <p className="text-xs text-zinc-400">Patentability, freedom-to-operate, and trade secret filings.</p>
            </div>

            <div className="p-4 rounded-md bg-zinc-950 border border-zinc-800 space-y-1.5">
              <div className="text-xs font-mono text-red-500">DIMENSION 04</div>
              <h3 className="font-display text-sm font-bold text-white">Regulatory Clearance</h3>
              <p className="text-xs text-zinc-400">DRAP compliance, ISO standards, and environmental certifications.</p>
            </div>

            <div className="p-4 rounded-md bg-zinc-950 border border-zinc-800 space-y-1.5">
              <div className="text-xs font-mono text-red-500">DIMENSION 05</div>
              <h3 className="font-display text-sm font-bold text-white">Technical Maturity</h3>
              <p className="text-xs text-zinc-400">Bench testing, pilot validation, and TRL 1-9 progression.</p>
            </div>

            <div className="p-4 rounded-md bg-zinc-950 border border-zinc-800 space-y-1.5">
              <div className="text-xs font-mono text-red-500">DIMENSION 06</div>
              <h3 className="font-display text-sm font-bold text-white">Operational Team</h3>
              <p className="text-xs text-zinc-400">Principal investigators, postgraduates, and commercial leads.</p>
            </div>

            <div className="p-4 rounded-md bg-zinc-950 border border-zinc-800 space-y-1.5">
              <div className="text-xs font-mono text-red-500">DIMENSION 07</div>
              <h3 className="font-display text-sm font-bold text-white">Financial Feasibility</h3>
              <p className="text-xs text-zinc-400">Unit economics, CAPEX/OPEX modeling, and grant allocations.</p>
            </div>

            <div className="p-4 rounded-md bg-zinc-950 border border-zinc-800 space-y-1.5">
              <div className="text-xs font-mono text-red-500">DIMENSION 08</div>
              <h3 className="font-display text-sm font-bold text-white">Industrial Scalability</h3>
              <p className="text-xs text-zinc-400">Mass production workflows and factory-floor integration.</p>
            </div>
          </div>

          <div className="pt-2 flex justify-start">
            <button
              onClick={() => onNavigate('erl')}
              className="px-5 py-3 rounded-md bg-red-600 hover:bg-red-500 text-white font-display font-bold text-xs flex items-center gap-2 transition"
            >
              <span>Launch 8-Dimension ERL Assessment Tool</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. INSTITUTIONAL CONTACT & CORPORATE MOUS (#contact)
          ========================================================================= */}
      <section id="contact" className="border-b border-zinc-800 py-16 lg:py-20 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Contact Details */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 uppercase tracking-wider font-mono">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Institutional Collaboration</span>
                </div>
                <h2 className="font-display text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                  Office of Research, Innovation & Commercialization (ORIC)
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  We welcome industry leaders, investors, alumni, and research sponsors seeking corporate joint ventures, patent licensing, or subsidized laboratory access.
                </p>
              </div>

              <div className="space-y-3.5 text-sm text-zinc-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-red-500 mt-1 shrink-0" />
                  <div>
                    <strong className="text-white">Campus Address:</strong>
                    <div className="text-zinc-400">Salim Habib University, NC-24, Deh Dih, Korangi Creek, Karachi - 74900, Sindh, Pakistan.</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-red-500 shrink-0" />
                  <div>
                    <strong className="text-white">Official Email: </strong>
                    <a href="mailto:oric@shu.edu.pk" className="text-red-400 hover:underline">
                      oric@shu.edu.pk
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-red-500 shrink-0" />
                  <div>
                    <strong className="text-white">Telephone Exchange: </strong>
                    <a href="tel:+9221111248748" className="hover:text-white transition">
                      +92 (21) 111-248-748
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <ExternalLink className="w-4 h-4 text-red-500 shrink-0" />
                  <div>
                    <strong className="text-white">University Portal: </strong>
                    <a
                      href="https://shu.edu.pk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-300 hover:text-white hover:underline transition"
                    >
                      www.shu.edu.pk
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Corporate MoU Initiation Box */}
            <div className="p-8 rounded-md bg-black border border-zinc-800 space-y-6">
              <h3 className="font-display text-lg font-bold text-white">Corporate Collaboration Inquiries</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Connect directly with the ORIC Directorate for bilateral non-disclosure agreements (NDAs), technology evaluations, or faculty-sponsored research contracts.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="w-full py-3 rounded-md bg-red-600 hover:bg-red-500 text-white font-display font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-red-950/40 transition"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Access Research Database & Metrics</span>
                </button>

                <a
                  href="mailto:oric@shu.edu.pk?subject=Corporate%20MoU%20%26%20Research%20Collaboration%20Inquiry%20-%20Salim%20Habib%20University"
                  className="w-full py-3 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 font-semibold text-xs flex items-center justify-center gap-2 transition text-center"
                >
                  <Mail className="w-4 h-4 text-red-500" />
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
      <footer className="bg-black border-t border-zinc-800 py-12 text-zinc-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: University ORIC Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-display font-bold text-sm">
                <div className="w-7 h-7 rounded bg-red-600 flex items-center justify-center text-white font-black">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span>SHU ORIC</span>
              </div>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                Office of Research, Innovation & Commercialization, Salim Habib University. Recognized by the Higher Education Commission (HEC) of Pakistan.
              </p>
              <div className="text-[11px] text-zinc-400">
                NC-24, Deh Dih, Korangi Creek, Karachi, Pakistan.
              </div>
            </div>

            {/* Col 2: Institutional Sections */}
            <div className="space-y-2">
              <div className="text-white font-display font-semibold text-xs uppercase tracking-wider font-mono">Website Navigation</div>
              <ul className="space-y-1.5 text-[11px]">
                <li><a href="#pipeline" className="hover:text-white transition">Research Pipeline</a></li>
                <li><a href="#industry" className="hover:text-white transition">Karachi Industry Radar</a></li>
                <li><a href="#faculties" className="hover:text-white transition">Faculty Mentors</a></li>
                <li><a href="#framework" className="hover:text-white transition">8D ERL Framework</a></li>
                <li><a href="#contact" className="hover:text-white transition">Contact & MoUs</a></li>
              </ul>
            </div>

            {/* Col 3: Research Workspace Tools */}
            <div className="space-y-2">
              <div className="text-white font-display font-semibold text-xs uppercase tracking-wider font-mono">Workspace Tools</div>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <button onClick={() => onNavigate('dashboard')} className="hover:text-white transition text-left">
                    Executive Dashboard
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('chat')} className="hover:text-white transition text-left">
                    Faculty AI Chat & Voice
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('explorer')} className="hover:text-white transition text-left">
                    Project Database Explorer
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('radar')} className="hover:text-white transition text-left">
                    Karachi Corporate Radar
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('erl')} className="hover:text-white transition text-left">
                    ERL Readiness Scorer
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Accreditation & Legal */}
            <div className="space-y-2">
              <div className="text-white font-display font-semibold text-xs uppercase tracking-wider font-mono">Accreditation & Contact</div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Operating strictly in accordance with HEC Policy on Higher Education Research and National Technology Transfer frameworks.
              </p>
              <div className="pt-1">
                <a
                  href="mailto:oric@shu.edu.pk"
                  className="inline-flex items-center gap-1.5 text-red-500 hover:underline font-semibold text-[11px]"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>oric@shu.edu.pk</span>
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400">
            <div>
              © {currentYear} Salim Habib University (SHU) Office of Research, Innovation & Commercialization. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <a href="https://shu.edu.pk" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-200 transition">
                Salim Habib University Official
              </a>
              <span>•</span>
              <a href="https://hec.gov.pk" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-200 transition">
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
