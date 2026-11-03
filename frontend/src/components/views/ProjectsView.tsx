'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Project, ViewMode, CurrencyMode } from '@/types';
import { importProjectsDocument } from '@/services/api';
import { formatMoney } from '@/utils/formatters';
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
  FileSpreadsheet,
  Download,
  Filter,
  Sparkles,
  MapPin,
  Building,
  GraduationCap
} from 'lucide-react';

interface ProjectsViewProps {
  projects: Project[];
  onNavigate: (view: ViewMode) => void;
  onSelectProjectForChat: (project: Project) => void;
  onOpenVoiceAgentForProject?: (project: Project) => void;
  onAddProjects?: (newProjects: Project[]) => void;
  onOpenDossier?: (project: Project) => void;
  currency?: CurrencyMode;
}

export default function ProjectsView({
  projects,
  onNavigate,
  onSelectProjectForChat,
  onOpenVoiceAgentForProject,
  onAddProjects,
  onOpenDossier,
  currency = 'PKR'
}: ProjectsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('ALL');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('');

  const [activeModalProject, setActiveModalProject] = useState<Project | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const listTopRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const csvFileInputRef = useRef<HTMLInputElement | null>(null);

  // Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Extract distinct courses & domains
  const distinctCourses = Array.from(
    new Set(projects.map((p) => p.courseTitle).filter(Boolean) as string[])
  ).sort();

  const distinctDomains = Array.from(
    new Set(projects.map((p) => p.domain).filter(Boolean) as string[])
  ).sort();

  const industrialAreasList = [
    'Korangi Industrial Area',
    'S.I.T.E. Industrial Area',
    'Landhi Industrial Area',
    'Port Qasim Industrial Zone',
    'Federal B Area'
  ];

  const faculties = [
    { code: 'ALL', label: 'All Faculties' },
    { code: 'FOP', label: 'Pharmacy (FOP)' },
    { code: 'FCS', label: 'Computer Science & AI (FCS)' },
    { code: 'FE', label: 'Biomedical Engineering (FE)' },
    { code: 'FMS', label: 'Management Sciences (FMS)' }
  ];

  // Filtering Logic
  const filteredProjects = projects.filter((project) => {
    // 1. Faculty code filter
    if (selectedFaculty !== 'ALL' && project.faculty_code !== selectedFaculty) {
      return false;
    }

    // 2. Course filter
    if (selectedCourse && project.courseTitle !== selectedCourse) {
      return false;
    }

    // 3. Domain filter
    if (selectedDomain && project.domain !== selectedDomain) {
      return false;
    }

    // 4. Commercial Priority filter
    if (selectedPriority) {
      const priority = project.commercialization?.priority || (project.trl_level >= 6 ? 'High Priority' : 'Standard Priority');
      if (priority !== selectedPriority) return false;
    }

    // 5. Industrial Area filter
    if (selectedArea) {
      const matchesArea = project.matchedAreas?.some((m) => m.areaName.toLowerCase().includes(selectedArea.toLowerCase()));
      if (!matchesArea && !project.target_industries?.some((t) => t.toLowerCase().includes(selectedArea.toLowerCase()))) {
        return false;
      }
    }

    // 6. Text query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = (project.title || '').toLowerCase().includes(q);
      const matchAbstract = (project.abstract || '').toLowerCase().includes(q);
      const matchLead = (project.lead_investigator || project.facultyPI || '').toLowerCase().includes(q);
      const matchCode = (project.project_code || project.id || '').toLowerCase().includes(q);
      const matchCourse = (project.courseTitle || '').toLowerCase().includes(q);
      const matchDomain = (project.domain || '').toLowerCase().includes(q);
      return matchTitle || matchAbstract || matchLead || matchCode || matchCourse || matchDomain;
    }

    return true;
  });

  // Pagination calculation
  const totalItems = filteredProjects.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFaculty, selectedCourse, selectedDomain, selectedPriority, selectedArea, pageSize]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (listTopRef.current) {
      listTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Drag and drop upload handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadStatusText(`Extracting research projects from "${file.name}"...`);
    setUploadSuccessMessage(null);
    setUploadErrorMessage(null);

    try {
      const res = await importProjectsDocument(file);
      if (res && res.projects && res.projects.length > 0) {
        onAddProjects?.(res.projects);
        setUploadSuccessMessage(
          `Successfully ingested ${res.count || res.projects.length} project(s) from "${file.name}". They are now indexed across the AI knowledge base!`
        );
      } else {
        setUploadErrorMessage(`Could not extract valid projects from "${file.name}".`);
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      setUploadErrorMessage(err.message || `Failed to process "${file.name}".`);
    } finally {
      setIsUploading(false);
      setUploadStatusText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Native CSV Import Handler with Intelligent Column Mapper
  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const text = await file.text();

    try {
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        alert('CSV file contains no data rows.');
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/["']/g, ''));
      const idIdx = headers.findIndex((h) => h.includes('id') || h.includes('code'));
      const titleIdx = headers.findIndex((h) => h.includes('title') || h.includes('topic') || h.includes('name'));
      const abstractIdx = headers.findIndex((h) => h.includes('abstract') || h.includes('desc') || h.includes('summary'));
      const piIdx = headers.findIndex((h) => h.includes('pi') || h.includes('investigator') || h.includes('supervisor'));
      const courseIdx = headers.findIndex((h) => h.includes('course') || h.includes('dept') || h.includes('department'));
      const trlIdx = headers.findIndex((h) => h.includes('trl'));

      const imported: Project[] = [];
      for (let i = 1; i < lines.length; i++) {
        // Basic CSV regex to handle commas inside quotes
        const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
        const cleanRow = row.map((c) => c.replace(/^"|"$/g, '').trim());

        const pTitle = titleIdx >= 0 && cleanRow[titleIdx] ? cleanRow[titleIdx] : `Imported Innovation ${i}`;
        const pAbstract = abstractIdx >= 0 && cleanRow[abstractIdx] ? cleanRow[abstractIdx] : 'Formulation research and laboratory development.';
        const pPi = piIdx >= 0 && cleanRow[piIdx] ? cleanRow[piIdx] : 'Faculty Lead Investigator';
        const pCourse = courseIdx >= 0 && cleanRow[courseIdx] ? cleanRow[courseIdx] : 'Faculty of Pharmacy (FoP)';
        const pTrl = trlIdx >= 0 && !isNaN(Number(cleanRow[trlIdx])) ? Number(cleanRow[trlIdx]) : 4;

        const randomSalt = Math.random().toString(36).substring(2, 7);
        const pId = idIdx >= 0 && cleanRow[idIdx] ? cleanRow[idIdx] : `SHU-CSV-${Date.now().toString().slice(-4)}-${randomSalt}`;

        imported.push({
          id: pId,
          project_code: pId,
          title: pTitle,
          faculty: 'Faculty of Pharmacy',
          faculty_code: 'FOP',
          department: pCourse,
          lead_investigator: pPi,
          abstract: pAbstract,
          problem_statement: `Addresses formulation challenges and commercial requirements for ${pTitle}.`,
          technology_stack: ['Assay Validation', 'Analytical Chemistry', 'Formulation Protocols'],
          development_stage: pTrl >= 6 ? 'Bench Validated' : 'Lab Prototype',
          trl_level: pTrl,
          erl_level: Math.min(9, Math.max(1, pTrl + 1)),
          ip_status: pTrl >= 5 ? 'Patent Pending' : 'Disclosure Filed',
          target_industries: ['Pharmaceuticals', 'Healthcare'],
          commercial_readiness: pTrl >= 5 ? 'High' : 'Medium',
          estimated_funding_pkr: 1500000,
          created_at: new Date().toISOString().split('T')[0],

          facultyPI: pPi,
          courseTitle: pCourse,
          products: [
            {
              name: `${pTitle.slice(0, 30)} Formulation`,
              dosageForm: 'Healthcare Formulation',
              unitCostPKR: 450,
              unitPricePKR: 1200,
              marginPct: 62.5
            }
          ],
          services: [
            {
              name: 'In-Vitro Dissolution & Assay Protocol',
              protocol: 'USP/BP Compendial Standard',
              turnaroundDays: 4,
              feePKR: 35000
            }
          ],
          marketSizing: {
            tamPKR: 14000,
            samPKR: 4000,
            somPKR: 500
          },
          commercialization: {
            trlLevel: pTrl,
            overallScore: 4.10,
            priority: pTrl >= 5 ? 'High Priority' : 'Medium Priority'
          },
          matchedAreas: [
            {
              areaName: 'Korangi Industrial Area',
              relevancePct: 92,
              candidatePartners: ['Getz Pharma (Pvt) Ltd', 'Searle Company Limited']
            }
          ]
        });
      }

      if (imported.length > 0) {
        onAddProjects?.(imported);
        setUploadSuccessMessage(`Successfully imported ${imported.length} projects from CSV!`);
      }
    } catch (csvErr: any) {
      console.error('CSV import error:', csvErr);
      setUploadErrorMessage(`Failed to parse CSV: ${csvErr.message}`);
    } finally {
      if (csvFileInputRef.current) csvFileInputRef.current.value = '';
    }
  };

  // Native CSV Export of Filtered Projects
  const handleExportCsv = () => {
    if (filteredProjects.length === 0) {
      alert('No projects match current filters to export.');
      return;
    }

    const headers = ['ID', 'Title', 'Lead PI', 'Department', 'TRL', 'Priority', 'SOM Valuation (PKR)', 'Abstract'];
    const rows = filteredProjects.map((p) => {
      const somVal = p.marketSizing?.somPKR ? p.marketSizing.somPKR * 1000 : 450000;
      const cleanTitle = `"${(p.title || '').replace(/"/g, '""')}"`;
      const cleanAbstract = `"${(p.abstract || '').replace(/"/g, '""')}"`;
      const cleanLead = `"${(p.lead_investigator || p.facultyPI || '').replace(/"/g, '""')}"`;
      const cleanDept = `"${(p.department || '').replace(/"/g, '""')}"`;
      const priority = p.commercialization?.priority || (p.trl_level >= 6 ? 'High Priority' : 'Standard Priority');

      return [p.id, cleanTitle, cleanLead, cleanDept, p.trl_level, priority, somVal, cleanAbstract].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SHU_ORIC_Research_Repository_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans bg-zinc-50 min-h-screen text-zinc-900">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-display text-zinc-900 tracking-tight">
            Document Library & Research Repository
          </h2>
          <p className="text-xs text-zinc-500">
            Search, filter, inspect, and export <strong>{projects.length}</strong> university research innovations & IP dossiers
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => csvFileInputRef.current?.click()}
            className="px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            title="Import projects from custom CSV"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Import CSV</span>
          </button>
          <input
            ref={csvFileInputRef}
            type="file"
            accept=".csv"
            onChange={handleCsvImport}
            className="hidden"
          />

          <button
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-lg bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            title="Export filtered records as CSV"
          >
            <Download className="w-4 h-4 text-zinc-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => onNavigate('upload')}
            className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Ingest Document</span>
          </button>
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

      {/* Multi-Filter Search Bar */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Keyword Search Input */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, keyword, PI, or ID..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-50 border border-zinc-300 text-xs text-zinc-900 focus:outline-hidden focus:border-red-500 font-medium"
            />
          </div>

          {/* Course Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-zinc-50 border border-zinc-300 text-xs text-zinc-900 font-medium focus:outline-hidden focus:border-red-500 truncate"
            >
              <option value="">All Courses ({distinctCourses.length})</option>
              {distinctCourses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Research Domain Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-zinc-50 border border-zinc-300 text-xs text-zinc-900 font-medium focus:outline-hidden focus:border-red-500 truncate"
            >
              <option value="">All Domains ({distinctDomains.length})</option>
              {distinctDomains.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Commercial Priority Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-zinc-50 border border-zinc-300 text-xs text-zinc-900 font-medium focus:outline-hidden focus:border-red-500"
            >
              <option value="">All Priorities</option>
              <option value="High Priority">High Priority</option>
              <option value="Medium Priority">Medium Priority</option>
              <option value="Standard Priority">Standard Priority</option>
            </select>
          </div>

          {/* Industrial Area Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-zinc-50 border border-zinc-300 text-xs text-zinc-900 font-medium focus:outline-hidden focus:border-red-500 truncate"
            >
              <option value="">All Industrial Areas</option>
              {industrialAreasList.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters row */}
        {(searchTerm || selectedCourse || selectedDomain || selectedPriority || selectedArea || selectedFaculty !== 'ALL') && (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100">
            <span className="text-zinc-500">
              Showing <strong>{filteredProjects.length}</strong> matching projects
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCourse('');
                setSelectedDomain('');
                setSelectedPriority('');
                setSelectedArea('');
                setSelectedFaculty('ALL');
              }}
              className="text-red-600 font-bold hover:underline"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

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
              {f.code === 'FOP' && ` (${projects.filter((p) => p.faculty_code === 'FOP').length})`}
            </button>
          ))}
        </div>

        {/* Page Size & Result Counter */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 self-end sm:self-auto">
          <span>Show:</span>
          {[10, 15, 25, 50].map((size) => (
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

      <div ref={listTopRef} />

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {paginatedProjects.map((project, idx) => {
          const somVal = project.marketSizing?.somPKR ? project.marketSizing.somPKR * 1000 : 450000;
          const commScore = project.commercialization?.overallScore || 3.8;
          const priority = project.commercialization?.priority || (project.trl_level >= 6 ? 'High Priority' : 'Standard Priority');

          return (
            <div
              key={`${project.id}-${idx}`}
              className="rounded-xl bg-white border border-zinc-200 p-5 space-y-3.5 shadow-xs hover:border-zinc-300 hover:shadow-sm transition flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                    {project.id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    priority === 'High Priority' ? 'bg-amber-100 text-amber-800' :
                    priority === 'Medium Priority' ? 'bg-blue-100 text-blue-800' : 'bg-zinc-100 text-zinc-700'
                  }`}>
                    {priority}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-zinc-900 leading-snug line-clamp-2">
                  {project.title}
                </h3>

                <p className="text-xs text-zinc-600 leading-relaxed line-clamp-3">
                  {project.abstract}
                </p>

                <div className="text-[11px] text-zinc-500 space-y-0.5 pt-1">
                  <div>Lead: <strong className="text-zinc-800">{project.lead_investigator || project.facultyPI}</strong></div>
                  {project.courseTitle && <div className="truncate text-zinc-400">{project.courseTitle}</div>}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-extrabold text-zinc-900 font-mono">
                      {formatMoney(somVal, currency)}
                    </div>
                    <div className="text-[10px] text-zinc-400 uppercase">Target SOM</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-red-600 font-mono">
                      TRL {project.trl_level}/9
                    </span>
                    <div className="text-[10px] text-zinc-400 font-mono">Score: {commScore.toFixed(2)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      if (onOpenDossier) {
                        onOpenDossier(project);
                      } else {
                        setActiveModalProject(project);
                      }
                    }}
                    className="py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-xs"
                  >
                    <span>Inspect Dossier</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => {
                      onSelectProjectForChat(project);
                      onNavigate('chat');
                    }}
                    className="py-1.5 px-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold transition flex items-center justify-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-red-600" />
                    <span>Ask AI</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-200 text-xs text-zinc-600">
          <div>
            Showing <strong>{startIndex + 1}</strong> to <strong>{endIndex}</strong> of <strong>{totalItems}</strong> projects
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(1)}
              disabled={safeCurrentPage === 1}
              className="p-1.5 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 transition"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              className="p-1.5 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 transition"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-mono font-bold text-zinc-900 bg-white border border-zinc-200 rounded-md">
              Page {safeCurrentPage} of {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              disabled={safeCurrentPage === totalPages}
              className="p-1.5 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 transition"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={safeCurrentPage === totalPages}
              className="p-1.5 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 transition"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
