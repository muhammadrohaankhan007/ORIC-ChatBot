'use client';

import React, { useState } from 'react';
import { Project, ViewMode } from '@/types';
import { 
  Search, 
  UploadCloud, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  X,
  ExternalLink
} from 'lucide-react';

interface ProjectsViewProps {
  projects: Project[];
  onNavigate: (view: ViewMode) => void;
  onSelectProjectForChat: (project: Project) => void;
}

export default function ProjectsView({
  projects,
  onNavigate,
  onSelectProjectForChat
}: ProjectsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('ALL');
  const [activeModalProject, setActiveModalProject] = useState<Project | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const faculties = [
    { code: 'ALL', label: 'All Faculties' },
    { code: 'FOP', label: 'Pharmacy (FOP)' },
    { code: 'FCS', label: 'Computer Science & AI (FCS)' },
    { code: 'FE', label: 'Biomedical Engineering (FE)' },
    { code: 'FMS', label: 'Management Sciences (FMS)' }
  ];

  const filteredProjects = projects.filter(p => {
    const matchesFaculty = selectedFaculty === 'ALL' || p.faculty_code === selectedFaculty;
    const matchesSearch = 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.project_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lead_investigator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.technology_stack.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFaculty && matchesSearch;
  });

  const handleSimulateUpload = () => {
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 4000);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">University Intellectual Property Repository</h2>
          <p className="text-xs text-slate-400">
            {projects.length} verified projects with full relational schemas and vector embeddings
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects, technologies, or lead PIs..."
            className="w-full bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      {/* Dynamic Document Ingestion Dropzone */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-dashed border-amber-500/30 hover:border-amber-500/60 transition flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Dynamic Document Ingestion Pipeline</h4>
            <p className="text-xs text-slate-400">
              Upload research dissertations, laboratory notes, or patent drafts (.pdf, .docx, .xlsx). The system automatically parses, chunks, and indexes embeddings into PostgreSQL pgvector.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          {uploadSuccess ? (
            <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Document Ingested & Vectorized!</span>
            </div>
          ) : (
            <button
              onClick={handleSimulateUpload}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 transition cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Ingest Document</span>
            </button>
          )}
        </div>
      </div>

      {/* Faculty Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {faculties.map((f) => (
          <button
            key={f.code}
            onClick={() => setSelectedFaculty(f.code)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedFaculty === f.code
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 hover:border-slate-700 hover:shadow-xl transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-950 text-amber-400 border border-slate-800">
                  {project.project_code}
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {project.development_stage}
                </span>
              </div>

              <h3 className="text-base font-bold text-white leading-snug">{project.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{project.abstract}</p>

              {/* Technologies */}
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-slate-400">Core Technologies:</div>
                <div className="flex flex-wrap gap-1.5">
                  {project.technology_stack.map((tech, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metrics Strip */}
              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                  <div className="text-[10px] text-slate-400">TRL Level</div>
                  <div className="text-sm font-bold text-sky-400">{project.trl_level} / 9</div>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                  <div className="text-[10px] text-slate-400">ERL Score</div>
                  <div className="text-sm font-bold text-amber-400">{project.erl_level} / 9</div>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                  <div className="text-[10px] text-slate-400">IP Status</div>
                  <div className="text-xs font-bold text-slate-200 truncate">{project.ip_status}</div>
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400 truncate">Lead: {project.lead_investigator}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveModalProject(project)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                >
                  Dossier
                </button>
                <button
                  onClick={() => {
                    onSelectProjectForChat(project);
                    onNavigate('chat');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 shadow-sm transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Chat AI</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Deep Dossier Modal */}
      {activeModalProject && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {activeModalProject.project_code}
                  </span>
                  <span className="text-xs text-slate-400">{activeModalProject.faculty}</span>
                </div>
                <h3 className="text-lg font-black text-white">{activeModalProject.title}</h3>
                <p className="text-xs text-slate-400">Principal Investigator: {activeModalProject.lead_investigator}</p>
              </div>
              <button
                onClick={() => setActiveModalProject(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="space-y-1">
                <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">Problem Statement</h5>
                <p className="bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
                  {activeModalProject.problem_statement}
                </p>
              </div>

              <div className="space-y-1">
                <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">Project Abstract</h5>
                <p className="bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
                  {activeModalProject.abstract}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400">Estimated Capital Needed:</span>
                  <div className="text-sm font-bold text-amber-400">
                    PKR {activeModalProject.estimated_funding_pkr.toLocaleString()}
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400">Target Industries:</span>
                  <div className="text-xs font-semibold text-slate-200">
                    {activeModalProject.target_industries.join(', ')}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setActiveModalProject(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const p = activeModalProject;
                  setActiveModalProject(null);
                  onSelectProjectForChat(p);
                  onNavigate('chat');
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch Project Analysis in Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

