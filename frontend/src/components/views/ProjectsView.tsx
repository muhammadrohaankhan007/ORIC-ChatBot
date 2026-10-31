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
  ExternalLink,
  ArrowRight
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
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans bg-black text-zinc-100">
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-black text-white tracking-tight">University Intellectual Property Repository</h2>
          <p className="text-xs text-zinc-400">
            {projects.length} verified projects with full relational schemas and vector embeddings
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects, technologies, or lead PIs..."
            className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 pl-10 pr-4 py-2.5 rounded-md focus:outline-none focus:border-red-600 transition"
          />
        </div>
      </div>

      {/* Dynamic Document Ingestion Dropzone */}
      <div className="p-6 rounded-md bg-zinc-950 border border-dashed border-red-900/60 hover:border-red-600 transition flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-md bg-red-950/50 border border-red-800/60 flex items-center justify-center text-red-500 shrink-0">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-display text-sm font-bold text-white">Dynamic Document Ingestion Pipeline</h4>
            <p className="text-xs text-zinc-400">
              Upload research dissertations, laboratory notes, or patent drafts (.pdf, .docx, .xlsx). The system automatically parses, chunks, and indexes embeddings into PostgreSQL pgvector.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          {uploadSuccess ? (
            <div className="px-4 py-2 rounded-md bg-red-950/60 border border-red-800/80 text-white text-xs font-bold flex items-center gap-2 font-mono">
              <CheckCircle2 className="w-4 h-4 text-red-500" />
              <span>Document Ingested & Vectorized!</span>
            </div>
          ) : (
            <button
              onClick={handleSimulateUpload}
              className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-500 text-white font-display font-bold text-xs flex items-center gap-2 shadow-md shadow-red-950/40 transition cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Ingest Laboratory Document</span>
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
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition font-mono ${
              selectedFaculty === f.code
                ? 'bg-red-600 text-white shadow-sm shadow-red-950/40'
                : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
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
            className="rounded-md bg-zinc-950 border border-zinc-800 p-6 space-y-4 hover:border-red-900/60 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-black text-red-400 border border-zinc-800">
                  {project.project_code}
                </span>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                  {project.development_stage}
                </span>
              </div>

              <h3 className="font-display text-base font-bold text-white leading-snug">{project.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">{project.abstract}</p>

              {/* Technologies */}
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-zinc-400">Core Technologies:</div>
                <div className="flex flex-wrap gap-1.5">
                  {project.technology_stack.map((tech, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded bg-black text-zinc-300 border border-zinc-800"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metrics Strip */}
              <div className="pt-2 border-t border-zinc-850 grid grid-cols-3 gap-2 text-center">
                <div className="bg-black p-2 rounded border border-zinc-800">
                  <div className="text-[10px] font-mono text-zinc-400">TRL Level</div>
                  <div className="font-display text-sm font-bold text-white">{project.trl_level} / 9</div>
                </div>
                <div className="bg-black p-2 rounded border border-zinc-800">
                  <div className="text-[10px] font-mono text-zinc-400">ERL Score</div>
                  <div className="font-display text-sm font-bold text-red-500">{project.erl_level} / 9</div>
                </div>
                <div className="bg-black p-2 rounded border border-zinc-800">
                  <div className="text-[10px] font-mono text-zinc-400">IP Status</div>
                  <div className="text-xs font-bold text-zinc-200 truncate">{project.ip_status}</div>
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="pt-4 border-t border-zinc-850 flex items-center justify-between gap-3">
              <span className="text-[11px] text-zinc-400 truncate">Lead: {project.lead_investigator}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveModalProject(project)}
                  className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold border border-zinc-800 transition"
                >
                  Dossier
                </button>
                <button
                  onClick={() => {
                    onSelectProjectForChat(project);
                    onNavigate('chat');
                  }}
                  className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-display font-bold flex items-center gap-1 shadow-sm transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Modal */}
      {activeModalProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-md max-w-2xl w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveModalProject(null)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="font-mono text-xs text-red-500">{activeModalProject.project_code}</span>
              <h3 className="font-display text-lg font-bold text-white">{activeModalProject.title}</h3>
              <p className="text-xs text-zinc-400">{activeModalProject.department} • {activeModalProject.faculty}</p>
            </div>

            <div className="space-y-2 text-xs text-zinc-300">
              <strong className="text-white block font-display">Problem Statement:</strong>
              <p className="leading-relaxed bg-black p-3 rounded border border-zinc-850">{activeModalProject.problem_statement}</p>
            </div>

            <div className="space-y-2 text-xs text-zinc-300">
              <strong className="text-white block font-display">Abstract & Methodology:</strong>
              <p className="leading-relaxed bg-black p-3 rounded border border-zinc-850">{activeModalProject.abstract}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-2">
              <div className="bg-black p-2.5 rounded border border-zinc-850">
                <span className="text-zinc-400 block font-mono">Estimated Funding (PKR)</span>
                <span className="font-display font-bold text-white">PKR {(activeModalProject.estimated_funding_pkr / 1_000_000).toFixed(1)} Million</span>
              </div>
              <div className="bg-black p-2.5 rounded border border-zinc-850">
                <span className="text-zinc-400 block font-mono">Target Industries</span>
                <span className="text-zinc-200">{activeModalProject.target_industries.join(', ')}</span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800">
              <button
                onClick={() => setActiveModalProject(null)}
                className="px-4 py-2 rounded bg-zinc-900 text-zinc-300 hover:text-white text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onSelectProjectForChat(activeModalProject);
                  setActiveModalProject(null);
                  onNavigate('chat');
                }}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-display font-bold flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Evaluate in Faculty AI Workspace</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
