'use client';

import React, { useState } from 'react';
import { Project, ViewMode } from '@/types';
import { 
  Search, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  X,
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
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans bg-zinc-50 min-h-screen text-zinc-900">
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold font-display text-zinc-900 tracking-tight">University Intellectual Property Repository</h2>
          <p className="text-xs text-zinc-500">
            {projects.length} verified research initiatives with indexed relational metadata and vector embeddings
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects, technologies, or investigators..."
            className="w-full bg-white border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 pl-10 pr-4 py-2.5 rounded-lg focus:outline-hidden focus:border-zinc-400 shadow-xs transition"
          />
        </div>
      </div>

      {/* Document Ingestion Dropzone */}
      <div className="p-6 rounded-lg bg-white border border-dashed border-zinc-300 hover:border-zinc-400 transition flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-zinc-900">Document Ingestion & Indexing</h4>
            <p className="text-xs text-zinc-500">
              Upload laboratory dissertations, patent claims, or clinical notes (.pdf, .docx). Documents are automatically indexed into the ORIC intelligence store.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          {uploadSuccess ? (
            <div className="px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Document Indexed & Vectorized</span>
            </div>
          ) : (
            <button
              onClick={handleSimulateUpload}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          )}
        </div>
      </div>

      {/* Faculty Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {faculties.map((f) => (
          <button
            key={f.code}
            onClick={() => setSelectedFaculty(f.code)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedFaculty === f.code
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
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
            className="rounded-lg bg-white border border-zinc-200 p-6 space-y-4 shadow-xs hover:border-zinc-300 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                  {project.project_code}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-50 text-zinc-600 border border-zinc-200">
                  {project.development_stage}
                </span>
              </div>

              <h3 className="text-base font-bold text-zinc-900 leading-snug">{project.title}</h3>
              <p className="text-xs text-zinc-600 leading-relaxed line-clamp-3">{project.abstract}</p>

              {/* Technologies */}
              <div className="space-y-1">
                <div className="text-xs font-medium text-zinc-500">Core Technologies:</div>
                <div className="flex flex-wrap gap-1.5">
                  {project.technology_stack.map((tech, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metrics Strip */}
              <div className="pt-2 border-t border-zinc-100 grid grid-cols-3 gap-2 text-center">
                <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-200">
                  <div className="text-[10px] text-zinc-500 font-medium">TRL Level</div>
                  <div className="text-sm font-bold text-zinc-900">{project.trl_level} / 9</div>
                </div>
                <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-200">
                  <div className="text-[10px] text-zinc-500 font-medium">ERL Score</div>
                  <div className="text-sm font-bold text-red-600">{project.erl_level} / 9</div>
                </div>
                <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-200">
                  <div className="text-[10px] text-zinc-500 font-medium">IP Status</div>
                  <div className="text-xs font-semibold text-zinc-800 truncate">{project.ip_status}</div>
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between gap-3">
              <div className="text-xs text-zinc-500 truncate">
                PI: <span className="text-zinc-800 font-medium">{project.lead_investigator}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveModalProject(project)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium text-xs border border-zinc-200 transition"
                >
                  Details
                </button>
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
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal View for Project Detail */}
      {activeModalProject && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-lg max-w-2xl w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                {activeModalProject.project_code}
              </span>
              <button
                onClick={() => setActiveModalProject(null)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-zinc-900">{activeModalProject.title}</h3>
              <div className="text-xs text-zinc-500">
                Lead Investigator: <strong className="text-zinc-800">{activeModalProject.lead_investigator}</strong> ({activeModalProject.faculty})
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">{activeModalProject.abstract}</p>

            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-zinc-500 block">TRL Level</span>
                <strong className="text-zinc-900">{activeModalProject.trl_level} of 9</strong>
              </div>
              <div>
                <span className="text-zinc-500 block">ERL Level</span>
                <strong className="text-red-600">{activeModalProject.erl_level} of 9</strong>
              </div>
              <div>
                <span className="text-zinc-500 block">IP Status</span>
                <strong className="text-zinc-900">{activeModalProject.ip_status}</strong>
              </div>
              <div>
                <span className="text-zinc-500 block">Readiness</span>
                <strong className="text-zinc-900">{activeModalProject.commercial_readiness}</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModalProject(null)}
                className="px-4 py-2 rounded-lg bg-zinc-100 text-zinc-700 font-medium text-xs hover:bg-zinc-200 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onSelectProjectForChat(activeModalProject);
                  setActiveModalProject(null);
                  onNavigate('chat');
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs transition"
              >
                <span>Analyze in Research Assistant</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
