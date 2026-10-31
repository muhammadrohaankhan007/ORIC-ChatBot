'use client';

import React, { useState } from 'react';
import { Project, ViewMode } from '@/types';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  Printer, 
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

interface ReportsViewProps {
  projects: Project[];
  onNavigate: (view: ViewMode) => void;
}

export default function ReportsView({ projects }: ReportsViewProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const [selectedReportType, setSelectedReportType] = useState('commercial_assessment');
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileSuccess, setCompileSuccess] = useState(false);

  const reportTemplates = [
    {
      id: 'commercial_assessment',
      title: 'Full Project Commercialization Assessment',
      description: 'Comprehensive 8D ERL assessment, TRL rating, competitor analysis, and investment feasibility.',
      badge: 'Most Popular'
    },
    {
      id: 'industry_mou',
      title: 'Karachi Industrial Partnership Brief & Draft MoU',
      description: 'Bilateral collaborative R&D framework formatted for Korangi and S.I.T.E. corporate partners.',
      badge: 'Corporate'
    },
    {
      id: 'tech_forecast',
      title: '1-Year & 3-Year Technology & Market Forecast',
      description: 'Scenario analysis, disruption risks, market adoption curves, and emerging substitute technologies.',
      badge: 'Strategic'
    },
    {
      id: 'executive_portfolio',
      title: 'University Executive Portfolio Dossier',
      description: 'Macro-level innovation metrics for the Vice Chancellor, Deans, and ORIC Governing Board.',
      badge: 'Executive'
    }
  ];

  const handleGenerate = () => {
    setIsCompiling(true);
    setCompileSuccess(false);

    setTimeout(() => {
      setIsCompiling(false);
      setCompileSuccess(true);
    }, 1800);
  };

  const handleDownload = (format: string) => {
    alert(`Downloading ${activeProject.project_code} report in .${format} format.`);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Automated Document Generation Engine</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Institutional Report Generation & Export Facility
          </h2>
          <p className="text-xs text-slate-400">
            Export publication-ready PDF dossiers, editable Microsoft Word briefs, and financial models for corporate partners and university leadership.
          </p>
        </div>

        {/* Project Selector */}
        <div className="relative w-full md:w-80">
          <select
            value={activeProject?.id}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full appearance-none bg-slate-900 border border-slate-800 text-xs text-white font-bold py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.project_code} – {p.title.slice(0, 32)}...
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 1 Col: Template Selector */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Select Report Template</h3>
          <div className="space-y-3">
            {reportTemplates.map((template) => {
              const isSelected = selectedReportType === template.id;
              return (
                <div
                  key={template.id}
                  onClick={() => setSelectedReportType(template.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{template.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700 font-semibold">
                      {template.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{template.description}</p>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isCompiling}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isCompiling ? 'Compiling AI Dossier...' : 'Generate Live Report'}</span>
          </button>
        </div>

        {/* Right 2 Cols: Live Preview Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Document Preview Canvas</span>
            </h3>

            {compileSuccess && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload('pdf')}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => handleDownload('docx')}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>DOCX</span>
                </button>
              </div>
            )}
          </div>

          {/* Paper Canvas Simulation */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-2xl relative">
            {/* Document Header */}
            <div className="border-b border-slate-800 pb-6 flex items-start justify-between">
              <div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-amber-400">
                  Salim Habib University (SHU) • ORIC
                </div>
                <h4 className="text-lg font-black text-white mt-1">
                  OFFICIAL COMMERCIALIZATION ASSESSMENT DOSSIER
                </h4>
                <p className="text-xs text-slate-400">
                  Project Code: <span className="font-mono text-white font-bold">{activeProject?.project_code}</span> • Date: {new Date().toLocaleDateString('en-GB')}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-xs text-amber-400">
                SHU
              </div>
            </div>

            {/* Document Body */}
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
              <div className="space-y-1">
                <h5 className="font-bold text-white uppercase text-[11px] tracking-wide text-amber-400">
                  1. Executive Project Abstract
                </h5>
                <p className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
                  {activeProject?.abstract}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                  <span className="text-[10px] text-slate-400">Technology Readiness Level (TRL)</span>
                  <div className="text-base font-black text-sky-400">Level {activeProject?.trl_level} of 9</div>
                  <p className="text-[10px] text-slate-400">Bench-scale validation completed under laboratory conditions.</p>
                </div>

                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                  <span className="text-[10px] text-slate-400">Entrepreneurship Readiness Level (ERL)</span>
                  <div className="text-base font-black text-amber-400">Score {activeProject?.erl_level} of 9</div>
                  <p className="text-[10px] text-slate-400">High commercialization viability with confirmed industrial demand.</p>
                </div>
              </div>

              <div className="space-y-1">
                <h5 className="font-bold text-white uppercase text-[11px] tracking-wide text-amber-400">
                  2. Targeted Commercial Clusters
                </h5>
                <p className="text-slate-300">
                  Primary manufacturing interest identified within <span className="text-white font-semibold">Korangi Industrial Area</span> and <span className="text-white font-semibold">S.I.T.E. Industrial Area</span>. Target industries include: {activeProject?.target_industries.join(', ')}.
                </p>
              </div>

              <div className="space-y-1">
                <h5 className="font-bold text-white uppercase text-[11px] tracking-wide text-amber-400">
                  3. Institutional Sign-off & Verification
                </h5>
                <div className="pt-6 grid grid-cols-2 gap-8 text-[11px] text-slate-400">
                  <div className="border-t border-slate-800 pt-2">
                    <div className="font-bold text-white">{activeProject?.lead_investigator}</div>
                    <div>Principal Investigator, {activeProject?.faculty}</div>
                  </div>
                  <div className="border-t border-slate-800 pt-2">
                    <div className="font-bold text-white">Director ORIC</div>
                    <div>Office of Research, Innovation & Commercialization</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Watermark Badge */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified by SHU Multi-Agent Governance
              </span>
              <span>Document Ref: SHU-ORIC-2026-CONFIDENTIAL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

