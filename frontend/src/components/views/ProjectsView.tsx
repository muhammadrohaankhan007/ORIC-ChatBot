'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Project, ViewMode } from '@/types';
import { importProjectsDocument } from '@/services/api';
import { 
  Search, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  X,
  ArrowRight,
  Radio,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertCircle,
  Loader2,
  FileSpreadsheet
} from 'lucide-react';

interface ProjectsViewProps {
  projects: Project[];
  onNavigate: (view: ViewMode) => void;
  onSelectProjectForChat: (project: Project) => void;
  onOpenVoiceAgentForProject?: (project: Project) => void;
  onAddProjects?: (newProjects: Project[]) => void;
}

export default function ProjectsView({
  projects,
  onNavigate,
  onSelectProjectForChat,
  onOpenVoiceAgentForProject,
  onAddProjects
}: ProjectsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('ALL');
  const [activeModalProject, setActiveModalProject] = useState<Project | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const listTopRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const faculties = [
    { code: 'ALL', label: 'All Faculties' },
    { code: 'FOP', label: 'Pharmacy (FOP)' },
    { code: 'FCS', label: 'Computer Science & AI (FCS)' },
    { code: 'FE', label: 'Biomedical Engineering (FE)' },
    { code: 'FMS', label: 'Management Sciences (FMS)' }
  ];

  // Reset to page 1 whenever search query, faculty, or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFaculty, pageSize]);

  const filteredProjects = projects.filter(p => {
    const matchesFaculty = selectedFaculty === 'ALL' || p.faculty_code === selectedFaculty;
    const matchesSearch = 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.project_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lead_investigator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.technology_stack.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFaculty && matchesSearch;
  });

  const totalItems = filteredProjects.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  const goToPage = (pageNumber: number) => {
    const target = Math.min(Math.max(1, pageNumber), totalPages);
    setCurrentPage(target);
    if (listTopRef.current) {
      listTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Generate pagination range with ellipses
  const getPaginationRange = () => {
    const delta = 2;
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= safeCurrentPage - delta && i <= safeCurrentPage + delta)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l) {
        if ((i as number) - l === 2) {
          rangeWithDots.push(l + 1);
        } else if ((i as number) - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i as number;
    }

    return rangeWithDots;
  };

  const processUploadedFile = async (file: File) => {
    const ext = file.name.toLowerCase().split('.').pop() || '';
    const validExts = ['xlsx', 'xls', 'docx', 'doc', 'csv', 'pdf'];
    if (!validExts.includes(ext)) {
      setUploadErrorMessage(`Invalid file format ".${ext}". Please upload an Excel (.xlsx, .xls) or Word (.docx, .doc) file.`);
      return;
    }

    setIsUploading(true);
    setUploadErrorMessage(null);
    setUploadSuccessMessage(null);
    setUploadStatusText(`Extracting & indexing projects from "${file.name}"...`);

    try {
      const res = await importProjectsDocument(file);
      if (res.success && Array.isArray(res.projects) && res.projects.length > 0) {
        onAddProjects?.(res.projects);
        setUploadSuccessMessage(`Successfully imported ${res.count} research project(s) from "${file.name}"! Added to the repository.`);
        setCurrentPage(1);
        setTimeout(() => setUploadSuccessMessage(null), 8000);
      } else {
        setUploadErrorMessage(res.message || 'No valid projects could be extracted from this document.');
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      setUploadErrorMessage(err.message || 'Failed to upload document. Please check the file contents.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processUploadedFile(e.target.files[0]);
    }
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

      {/* Real Document Ingestion Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-6 rounded-xl border-2 border-dashed transition flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs ${
          isDragging
            ? 'bg-red-50/80 border-red-500 scale-[1.01]'
            : 'bg-white border-zinc-300 hover:border-zinc-400'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx,.xls,.docx,.doc,.csv,.pdf"
          className="hidden"
        />

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-zinc-900">
                Upload & Ingest Research Projects
              </h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
                Excel & Word Supported
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              Upload course LMS sheets, proposal lists, or research synopses (<strong>.xlsx</strong>, <strong>.xls</strong>, <strong>.docx</strong>, <strong>.doc</strong>). Projects are automatically parsed, added to your active repository, and indexed for AI chat.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          {isUploading ? (
            <div className="px-4 py-2.5 rounded-lg bg-zinc-100 text-zinc-700 text-xs font-semibold flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
              <span>{uploadStatusText}</span>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Choose Excel / Word File</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Banner */}
      {uploadSuccessMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{uploadSuccessMessage}</span>
          </div>
          <button
            onClick={() => setUploadSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Error Banner */}
      {uploadErrorMessage && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{uploadErrorMessage}</span>
          </div>
          <button
            onClick={() => setUploadErrorMessage(null)}
            className="text-rose-700 hover:text-rose-900 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Faculty Filter Buttons & Page Size Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {faculties.map((f) => (
            <button
              key={f.code}
              onClick={() => setSelectedFaculty(f.code)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedFaculty === f.code
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              {f.label}
              {f.code === 'ALL' && ` (${projects.length})`}
              {f.code === 'FOP' && ` (${projects.filter(p => p.faculty_code === 'FOP').length})`}
            </button>
          ))}
        </div>

        {/* Page Size & Result Counter */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 self-end sm:self-auto">
          <span>Show:</span>
          {[10, 20, 50].map((size) => (
            <button
              key={size}
              onClick={() => setPageSize(size)}
              className={`px-2 py-1 rounded text-xs font-semibold transition ${
                pageSize === size
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              {size}
            </button>
          ))}
          <span className="ml-2 text-zinc-400">|</span>
          <span className="font-medium text-zinc-700">
            {totalItems} total
          </span>
        </div>
      </div>

      {/* Anchor for smooth scroll-to-top on page change */}
      <div ref={listTopRef} />

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {paginatedProjects.map((project, idx) => (
          <div
            key={`${project.id}-${idx}`}
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
                {onOpenVoiceAgentForProject && (
                  <button
                    onClick={() => onOpenVoiceAgentForProject(project)}
                    title="Talk with Voice Agent about this project"
                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition"
                  >
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                  </button>
                )}
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

      {/* Pagination Controls & Item Counter */}
      {totalItems > 0 && (
        <div className="bg-white border border-zinc-200 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
          {/* Results Summary */}
          <div className="text-xs text-zinc-600 font-medium text-center md:text-left">
            Showing <strong className="text-zinc-900">{startIndex + 1}</strong> to{' '}
            <strong className="text-zinc-900">{endIndex}</strong> of{' '}
            <strong className="text-zinc-900">{totalItems}</strong> projects
            {searchTerm && <span> for &ldquo;{searchTerm}&rdquo;</span>}
          </div>

          {/* Page Navigation Buttons */}
          <div className="flex items-center gap-1">
            {/* First Page */}
            <button
              onClick={() => goToPage(1)}
              disabled={safeCurrentPage === 1}
              className="p-1.5 rounded-md border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* Previous Page */}
            <button
              onClick={() => goToPage(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              className="px-2.5 py-1.5 rounded-md border border-zinc-200 bg-white text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Numbered Page Buttons */}
            <div className="flex items-center gap-1 mx-1">
              {getPaginationRange().map((pageItem, idx) => (
                typeof pageItem === 'number' ? (
                  <button
                    key={idx}
                    onClick={() => goToPage(pageItem)}
                    className={`min-w-8 h-8 px-2 rounded-md text-xs font-semibold transition ${
                      safeCurrentPage === pageItem
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    {pageItem}
                  </button>
                ) : (
                  <span key={idx} className="px-1 text-zinc-400 text-xs">
                    {pageItem}
                  </span>
                )
              ))}
            </div>

            {/* Next Page */}
            <button
              onClick={() => goToPage(safeCurrentPage + 1)}
              disabled={safeCurrentPage === totalPages}
              className="px-2.5 py-1.5 rounded-md border border-zinc-200 bg-white text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
              title="Next Page"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Last Page */}
            <button
              onClick={() => goToPage(totalPages)}
              disabled={safeCurrentPage === totalPages}
              className="p-1.5 rounded-md border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Empty State when 0 items match */}
      {totalItems === 0 && (
        <div className="p-12 text-center bg-white border border-zinc-200 rounded-lg space-y-3">
          <FileText className="w-10 h-10 text-zinc-300 mx-auto" />
          <h3 className="text-base font-bold text-zinc-900">No projects found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            No research projects matched your search criteria or faculty filter. Try searching with different terms or reset your filters.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedFaculty('ALL');
            }}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition"
          >
            Clear Filters
          </button>
        </div>
      )}

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
              {onOpenVoiceAgentForProject && (
                <button
                  onClick={() => {
                    const p = activeModalProject;
                    setActiveModalProject(null);
                    onOpenVoiceAgentForProject(p);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-medium text-xs flex items-center gap-1.5 border border-red-200 transition"
                >
                  <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                  <span>Talk with Voice Agent</span>
                </button>
              )}
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
