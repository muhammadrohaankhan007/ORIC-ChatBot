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
      badge: 'Core Assessment'
    },
    {
      id: 'industry_mou',
      title: 'Karachi Industrial Partnership Brief & Draft MoU',
      description: 'Bilateral collaborative R&D framework formatted for Korangi and S.I.T.E. corporate partners.',
      badge: 'Corporate MoU'
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
    }, 1500);
  };

  const handleDownload = (format: string) => {
    alert(`Downloading ${activeProject.project_code} dossier in .${format} format.`);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans bg-black text-zinc-100">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-red-950/50 border border-red-800/60 text-red-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5 text-red-500" />
            <span>Automated Document Generation Engine</span>
          </div>
          <h2 className="font-display text-xl font-black text-white tracking-tight">
            Institutional Report Generation & Export Facility
          </h2>
          <p className="text-xs text-zinc-400">
            Export publication-ready PDF dossiers, editable Microsoft Word briefs, and financial models for corporate partners and university leadership.
          </p>
        </div>

        {/* Project Selector */}
        <div className="relative w-full md:w-80">
          <select
            value={activeProject?.id}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full appearance-none bg-zinc-950 border border-zinc-800 text-xs text-white font-bold py-2.5 pl-4 pr-10 rounded-md focus:outline-none focus:border-red-600 cursor-pointer font-mono"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.project_code} – {p.title.slice(0, 32)}...
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Template Selector */}
        <div className="space-y-4">
          <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">Select Dossier Template</h3>
          <div className="space-y-3">
            {reportTemplates.map((template) => {
              const isSelected = selectedReportType === template.id;
              return (
                <div
                  key={template.id}
                  onClick={() => setSelectedReportType(template.id)}
                  className={`p-4 rounded-md border cursor-pointer transition flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'bg-red-950/30 border-red-800/80'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xs font-bold text-white">{template.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-black text-red-400 border border-zinc-800 font-mono font-semibold">
                      {template.badge}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{template.description}</p>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isCompiling}
            className="w-full py-3 rounded-md bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-display font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-red-950/40 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isCompiling ? 'Compiling AI Dossier...' : 'Generate Commercial Dossier'}</span>
          </button>
        </div>

        {/* Right 2 Cols: Live Preview Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Printer className="w-4 h-4 text-red-500" />
              <span>Document Preview Canvas</span>
            </h3>

            {compileSuccess && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload('pdf')}
                  className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold border border-zinc-800 flex items-center gap-1.5 font-mono"
                >
                  <Download className="w-3.5 h-3.5 text-red-500" />
                  <span>PDF Format</span>
                </button>
                <button
                  onClick={() => handleDownload('docx')}
                  className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold border border-zinc-800 flex items-center gap-1.5 font-mono"
                >
                  <Download className="w-3.5 h-3.5 text-red-500" />
                  <span>Word DOCX</span>
                </button>
              </div>
            )}
          </div>

          <div className="p-8 rounded-md bg-zinc-950 border border-zinc-800 space-y-6 text-zinc-300">
            {/* Document Header */}
            <div className="border-b border-zinc-800 pb-6 flex items-start justify-between">
              <div>
                <div className="font-mono text-xs text-red-500 font-bold uppercase tracking-wider">
                  Salim Habib University • HEC Tier-1 ORIC
                </div>
                <h4 className="font-display text-xl font-bold text-white mt-1">
                  {activeProject.title}
                </h4>
                <div className="text-xs text-zinc-400 mt-0.5 font-mono">
                  Project Code: {activeProject.project_code} • Lead: {activeProject.lead_investigator}
                </div>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-black text-white border border-zinc-800">
                TRL {activeProject.trl_level}/9 • ERL {activeProject.erl_level}/9
              </span>
            </div>

            {/* Document Body */}
            <div className="space-y-4 text-xs leading-relaxed">
              <div className="space-y-1">
                <strong className="text-white block font-display">Executive Problem Statement:</strong>
                <p className="bg-black p-3.5 rounded border border-zinc-850 text-zinc-300">
                  {activeProject.problem_statement}
                </p>
              </div>

              <div className="space-y-1">
                <strong className="text-white block font-display">Technical Abstract & Methodology:</strong>
                <p className="bg-black p-3.5 rounded border border-zinc-850 text-zinc-300">
                  {activeProject.abstract}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-black p-3 rounded border border-zinc-850">
                  <span className="text-zinc-500 block font-mono text-[10px]">Commercial Valuation</span>
                  <span className="font-display font-bold text-red-500 text-sm">
                    PKR {(activeProject.estimated_funding_pkr / 1_000_000).toFixed(1)} Million
                  </span>
                </div>
                <div className="bg-black p-3 rounded border border-zinc-850">
                  <span className="text-zinc-500 block font-mono text-[10px]">Intellectual Property Status</span>
                  <span className="font-bold text-white text-sm font-mono">
                    {activeProject.ip_status}
                  </span>
                </div>
              </div>
            </div>

            {/* Document Verification Footer */}
            <div className="pt-6 border-t border-zinc-850 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              <span>Digitally Verified by Salim Habib University ORIC</span>
              <span>Classification: Confidential Industry Brief</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
