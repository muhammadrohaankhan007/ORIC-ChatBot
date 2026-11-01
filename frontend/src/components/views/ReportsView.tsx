'use client';

import React, { useState } from 'react';
import { Project, ViewMode } from '@/types';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  CheckCircle2, 
  Printer, 
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
      title: 'Project Commercialization Assessment',
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
      title: 'Technology & Market Forecast',
      description: 'Scenario analysis, disruption risks, market adoption curves, and emerging substitute technologies.',
      badge: 'Strategic'
    },
    {
      id: 'executive_portfolio',
      title: 'University Executive Portfolio Dossier',
      description: 'Innovation metrics for the Vice Chancellor, Deans, and ORIC Governing Board.',
      badge: 'Executive'
    }
  ];

  const handleGenerate = () => {
    setIsCompiling(true);
    setCompileSuccess(false);

    setTimeout(() => {
      setIsCompiling(false);
      setCompileSuccess(true);
    }, 1200);
  };

  const handleDownload = (format: string) => {
    alert(`Downloading ${activeProject.project_code} dossier in .${format} format.`);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans bg-zinc-50 min-h-screen text-zinc-900">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold font-display text-zinc-900 tracking-tight">
            Commercial Dossier & Report Facility
          </h2>
          <p className="text-xs text-zinc-500">
            Export PDF dossiers, Microsoft Word briefs, and bilateral MoUs for corporate partners and university leadership
          </p>
        </div>

        {/* Project Selector */}
        <div className="relative w-full md:w-80">
          <select
            value={activeProject?.id}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full appearance-none bg-white border border-zinc-200 text-xs text-zinc-900 font-semibold py-2.5 pl-3.5 pr-10 rounded-lg focus:outline-hidden focus:border-zinc-400 shadow-xs cursor-pointer"
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

      {/* Select Report Template */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-zinc-900">Select Dossier Template</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTemplates.map((template) => {
            const isSelected = selectedReportType === template.id;
            return (
              <div
                key={template.id}
                onClick={() => setSelectedReportType(template.id)}
                className={`p-5 rounded-lg border cursor-pointer transition flex flex-col justify-between shadow-xs ${
                  isSelected
                    ? 'bg-red-50/60 border-red-300'
                    : 'bg-white border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                      {template.badge}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-red-600" />}
                  </div>
                  <h4 className="text-xs font-bold text-zinc-900">{template.title}</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">{template.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compiler Action Bar */}
      <div className="p-6 rounded-lg bg-white border border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="text-xs text-zinc-500">
            Selected Target: <strong className="text-zinc-900">{activeProject.title}</strong>
          </div>
          <div className="text-xs text-zinc-500">
            Lead: {activeProject.lead_investigator} • Faculty: {activeProject.faculty} • ERL: {activeProject.erl_level}/9
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={isCompiling}
            className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            {isCompiling ? (
              <span>Compiling Dossier...</span>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4" />
                <span>Compile Official Dossier</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Dossier Preview */}
      {compileSuccess && (
        <div className="p-8 rounded-lg bg-white border border-zinc-200 space-y-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900">
                  SHU-ORIC-DOSSIER-{activeProject.project_code}.pdf
                </h4>
                <div className="text-xs text-zinc-500">
                  Compiled under Higher Education Commission (HEC) commercialization policy
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload('pdf')}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => handleDownload('docx')}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium text-xs border border-zinc-200 flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Word (.docx)</span>
              </button>
              <button
                onClick={() => window.print()}
                className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition"
                title="Print Dossier"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dossier Abstract Preview */}
          <div className="space-y-4 text-xs text-zinc-700 leading-relaxed max-w-4xl">
            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
              <div className="font-bold text-zinc-900">1. Executive Technology Summary</div>
              <p>{activeProject.abstract}</p>
            </div>

            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
              <div className="font-bold text-zinc-900">2. Commercialization Readiness & IP State</div>
              <p>
                Candidate technology evaluated at TRL {activeProject.trl_level}/9 and ERL {activeProject.erl_level}/9 under university benchmarking standards. Intellectual property standing designated as &quot;{activeProject.ip_status}&quot; under the jurisdiction of the Salim Habib University ORIC Directorate.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
              <div className="font-bold text-zinc-900">3. Karachi Industrial Corridor Alignment</div>
              <p>
                Primary manufacturing alignment targeted with corporate partners across Korangi Industrial Area and Landhi Industrial Estate, targeting local supply chain integration and import substitution.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
