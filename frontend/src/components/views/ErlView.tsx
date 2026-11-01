'use client';

import React, { useState } from 'react';
import { Project, ViewMode } from '@/types';
import { 
  ChevronDown, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  FileSpreadsheet
} from 'lucide-react';

interface ErlViewProps {
  projects: Project[];
  onNavigate: (view: ViewMode) => void;
}

export default function ErlView({ projects, onNavigate }: ErlViewProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const [milestones, setMilestones] = useState([
    { title: 'Full Formulation Assay Replication under DRAP Protocol', completed: true, date: '2026-03-12' },
    { title: 'Independent In Vitro Permeation Testing at Verified Testing Lab', completed: true, date: '2026-03-28' },
    { title: 'File Provisional Patent Application with IPO Pakistan via SHU ORIC', completed: false, date: '2026-04-15' },
    { title: 'Pilot Batch Homogenization Run (100L) with Korangi Pharma Partner', completed: false, date: '2026-05-30' },
    { title: 'Execute Commercial Technology Transfer Licensing Agreement', completed: false, date: '2026-07-15' }
  ]);

  const toggleMilestone = (index: number) => {
    setMilestones(prev => {
      const copy = [...prev];
      copy[index].completed = !copy[index].completed;
      return copy;
    });
  };

  const dimensions = [
    {
      name: '1. Regulatory Readiness',
      score: 7,
      strength: 'Formulation meets DRAP stability testing criteria',
      gap: 'Formal PSQCA bio-equivalence filing in progress'
    },
    {
      name: '2. IP Protection',
      score: 8,
      strength: 'Provisional patent disclosure drafted with claims matrix',
      gap: 'International PCT filing extension not yet initiated'
    },
    {
      name: '3. Team Readiness',
      score: 7,
      strength: 'Lead PI with 14 indexed international publications',
      gap: 'Requires dedicated formulation research chemist'
    },
    {
      name: '4. Market Demand',
      score: 6,
      strength: 'Validation from Karachi clinical practitioners',
      gap: 'Hospital procurement contracts pending pilot batch'
    },
    {
      name: '5. Technology (TRL)',
      score: 5,
      strength: 'Bench reproducibility confirmed across 10 sample batches',
      gap: 'High-pressure homogenization scale-up pending'
    },
    {
      name: '6. Business Model',
      score: 7,
      strength: 'Unit economics supported by low raw-material import tariffs',
      gap: 'Pricing structure requires reimbursement mapping'
    },
    {
      name: '7. Industry Scalability',
      score: 5,
      strength: 'Compatible with standard Korangi manufacturing lines',
      gap: 'Requires customized clean-room blister sealing protocol'
    },
    {
      name: '8. Grant Funding',
      score: 6,
      strength: 'Seed internal grant disbursed from SHU ORIC fund',
      gap: 'Requires PKR 4.5M external commercial co-funding'
    }
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans bg-zinc-50 min-h-screen text-zinc-900">
      {/* Header & Project Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold font-display text-zinc-900 tracking-tight">
            8-Dimension Entrepreneurship Readiness (ERL) Canvas
          </h2>
          <p className="text-xs text-zinc-500">
            Multidimensional maturity assessment diagnosing technology feasibility, IP status, market demand, and commercial viability
          </p>
        </div>

        {/* Project Dropdown */}
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

      {/* Score Summary Banner */}
      <div className="p-6 rounded-lg bg-white border border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-6">
          <div className="w-18 h-18 rounded-lg bg-red-50 border border-red-200 flex flex-col items-center justify-center text-red-600 shrink-0">
            <span className="text-3xl font-extrabold leading-none">{activeProject?.erl_level || 6}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">of 9</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600 font-semibold">{activeProject?.project_code}</span>
              <span className="text-xs text-zinc-500">• {activeProject?.faculty}</span>
            </div>
            <h3 className="text-base font-bold text-zinc-900">{activeProject?.title}</h3>
            <div className="text-xs text-zinc-600 font-medium flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-red-600" />
              <span>Status: Bench Validated • High Commercialization Trajectory</span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <button
            onClick={() => onNavigate('reports')}
            className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center gap-2 shadow-xs transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Generate HEC ERL Dossier</span>
          </button>
        </div>
      </div>

      {/* 8 Dimensions Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-red-600" />
          <span>8-Dimensional Maturity Breakdown</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dimensions.map((dim, i) => (
            <div
              key={i}
              className="p-5 rounded-lg bg-white border border-zinc-200 space-y-3 shadow-xs hover:border-zinc-300 transition flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900">{dim.name}</span>
                  <span className="text-xs font-bold text-red-600">{dim.score}/10</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                  <div
                    className="h-full bg-red-600 rounded-full transition-all duration-500"
                    style={{ width: `${(dim.score / 10) * 100}%` }}
                  />
                </div>

                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="text-zinc-700 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                    <span>{dim.strength}</span>
                  </div>
                  <div className="text-zinc-500 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                    <span>{dim.gap}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Milestones Checklist */}
      <div className="bg-white border border-zinc-200 rounded-lg p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-zinc-900">Commercialization Milestones Checklist</h4>
            <p className="text-xs text-zinc-500">
              Action items required to advance project maturity from ERL 6 to ERL 8
            </p>
          </div>
          <span className="text-xs font-bold text-red-600">
            {milestones.filter(m => m.completed).length} of {milestones.length} Completed
          </span>
        </div>

        <div className="space-y-2">
          {milestones.map((m, idx) => (
            <div
              key={idx}
              onClick={() => toggleMilestone(idx)}
              className={`p-3 rounded-lg border flex items-center justify-between gap-4 cursor-pointer transition ${
                m.completed
                  ? 'bg-zinc-50 border-zinc-200 text-zinc-500'
                  : 'bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={m.completed}
                  onChange={() => toggleMilestone(idx)}
                  className="w-4 h-4 rounded text-red-600 bg-white border-zinc-300 cursor-pointer accent-red-600"
                />
                <span className={`text-xs ${m.completed ? 'line-through text-zinc-400 font-medium' : 'font-semibold text-zinc-800'}`}>
                  {m.title}
                </span>
              </div>
              <span className="text-xs text-zinc-500 shrink-0">Due: {m.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
