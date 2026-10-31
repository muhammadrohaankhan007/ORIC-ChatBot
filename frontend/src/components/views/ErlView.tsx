'use client';

import React, { useState } from 'react';
import { Project, ViewMode, ErlAssessment } from '@/types';
import { 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  ChevronDown, 
  Sparkles, 
  FileSpreadsheet,
  Layers
} from 'lucide-react';

interface ErlViewProps {
  projects: Project[];
  onNavigate: (view: ViewMode) => void;
}

export default function ErlView({ projects, onNavigate }: ErlViewProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const [milestones, setMilestones] = useState([
    { title: 'In-vitro cytotoxic drug release verification in laboratory', completed: true, date: '2026-02-15' },
    { title: 'Provisional patent specification draft filed through SHU ORIC', completed: true, date: '2026-03-01' },
    { title: 'Formal commercial pilot agreement with Korangi pharmaceutical partner', completed: false, date: '2026-06-30' },
    { title: 'Animal model bioavailability trials under DRAP compliance', completed: false, date: '2026-09-15' },
    { title: 'HEC Technology Development Fund (TDF) grant submission', completed: false, date: '2026-11-01' }
  ]);

  const toggleMilestone = (index: number) => {
    setMilestones(prev =>
      prev.map((m, i) => (i === index ? { ...m, completed: !m.completed } : m))
    );
  };

  const dimensions = [
    {
      name: '1. Learning & Research Readiness',
      score: 8,
      strength: 'Comprehensive peer-reviewed literature benchmarking complete',
      gap: 'Needs structured cross-disciplinary pharmacy-chemistry cohort'
    },
    {
      name: '2. Innovation & Novelty',
      score: 9,
      strength: 'Proprietary lipid-nanocarrier synthesis achieves 4x entrapment efficiency',
      gap: 'Benchmarked against only one international competitor'
    },
    {
      name: '3. Team & Operational Readiness',
      score: 7,
      strength: 'Experienced lead PI with 14 indexed international publications',
      gap: 'Requires full-time dedicated postdoctoral formulation chemist'
    },
    {
      name: '4. Market Demand & Customer Validation',
      score: 6,
      strength: 'Strong initial validation from Karachi oncology clinicians',
      gap: 'Formal hospital procurement contracts have not yet been signed'
    },
    {
      name: '5. Technology Readiness (TRL)',
      score: 5,
      strength: 'Bench-scale reproducibility confirmed across 10 sample batches',
      gap: 'Pilot-scale high-pressure homogenization scale-up pending'
    },
    {
      name: '6. Business Model Viability',
      score: 7,
      strength: 'Favorable unit economics with low raw-material import tariffs',
      gap: 'Pricing structure requires formal health insurance reimbursement mapping'
    },
    {
      name: '7. Intellectual Property (IP)',
      score: 8,
      strength: 'Provisional patent drafted; prior-art search showed zero infringements',
      gap: 'PCT international filing deadline approaching in 10 months'
    },
    {
      name: '8. Funding & Financial Sustainability',
      score: 6,
      strength: 'Seed internal grant disbursed from Salim Habib University ORIC fund',
      gap: 'Requires PKR 4.5M external commercial co-funding'
    }
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header & Project Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>HEC & Global ERL Standard</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            8-Dimension Entrepreneurship Readiness Level (ERL) Canvas
          </h2>
          <p className="text-xs text-slate-400">
            Multidimensional maturity assessment diagnosing technology feasibility, IP status, market demand, and commercial viability.
          </p>
        </div>

        {/* Project Dropdown */}
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

      {/* Score Summary Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col items-center justify-center text-amber-400 shrink-0">
            <span className="text-2xl font-black leading-none">{activeProject?.erl_level || 6}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">of 9</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-amber-400 font-bold">{activeProject?.project_code}</span>
              <span className="text-xs text-slate-400">• {activeProject?.faculty}</span>
            </div>
            <h3 className="text-base font-bold text-white">{activeProject?.title}</h3>
            <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Current Status: Bench Validated • High Commercialization Trajectory</span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <button
            onClick={() => onNavigate('reports')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-2 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            <span>Export ERL Dossier</span>
          </button>
        </div>
      </div>

      {/* 8 Dimensions Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>8-Dimensional Maturity Breakdown</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dimensions.map((dim, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{dim.name}</span>
                  <span className="text-xs font-extrabold text-amber-400">{dim.score}/10</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${(dim.score / 10) * 100}%` }}
                  />
                </div>

                <div className="space-y-1.5 pt-1 text-[11px]">
                  <div className="text-emerald-400 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{dim.strength}</span>
                  </div>
                  <div className="text-rose-400 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{dim.gap}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Milestones Checklist */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white">Commercialization Milestones Checklist</h4>
            <p className="text-xs text-slate-400">
              Interactive milestones required to graduate project from ERL 6 to ERL 8
            </p>
          </div>
          <span className="text-xs font-bold text-amber-400">
            {milestones.filter(m => m.completed).length} of {milestones.length} Completed
          </span>
        </div>

        <div className="space-y-2">
          {milestones.map((m, idx) => (
            <div
              key={idx}
              onClick={() => toggleMilestone(idx)}
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 cursor-pointer transition ${
                m.completed
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={m.completed}
                  onChange={() => toggleMilestone(idx)}
                  className="w-4 h-4 rounded text-amber-500 bg-slate-800 border-slate-700 cursor-pointer"
                />
                <span className={`text-xs ${m.completed ? 'line-through text-slate-400 font-medium' : 'font-semibold text-white'}`}>
                  {m.title}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 shrink-0">Due: {m.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

