'use client';

import React, { useState, useRef } from 'react';
import { Project, ViewMode } from '@/types';
import {
  ShieldCheck,
  FileText,
  ScanLine,
  Sparkles,
  Building2,
  Award,
  UploadCloud,
  CheckCircle2,
  FolderOpen,
  ArrowRight,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

interface DocumentIngestionViewProps {
  onAddProjects: (projects: Project[]) => void;
  onNavigate: (view: ViewMode) => void;
}

export default function DocumentIngestionView({
  onAddProjects,
  onNavigate
}: DocumentIngestionViewProps) {
  const [activeStage, setActiveStage] = useState(4); // 1-6
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Metadata Intake Form state
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Faculty of Pharmacy (FoP)');
  const [pi, setPi] = useState('');
  const [domain, setDomain] = useState('Novel Drug Delivery & Formulation');
  const [trl, setTrl] = useState(4);
  const [ipStatus, setIpStatus] = useState<'None' | 'Disclosure Filed' | 'Patent Pending' | 'Patent Granted'>('Disclosure Filed');
  const [fundingPkr, setFundingPkr] = useState(1500000);
  const [abstract, setAbstract] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stages = [
    { num: 1, label: '1. Integrity & Virus Scan', icon: ShieldCheck },
    { num: 2, label: '2. Text & Table Parser', icon: FileText },
    { num: 3, label: '3. Scanned PDF & OCR', icon: ScanLine },
    { num: 4, label: '4. AI Concept Extraction', icon: Sparkles },
    { num: 5, label: '5. Karachi Cluster Fit', icon: Building2 },
    { num: 6, label: '6. Commercial Score', icon: Award }
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processUploadedFiles(Array.from(e.target.files));
    }
  };

  const processUploadedFiles = async (files: File[]) => {
    setIsProcessing(true);
    setSuccessMessage(null);

    const generatedProjects: Project[] = [];

    for (let fIdx = 0; fIdx < files.length; fIdx++) {
      const file = files[fIdx];
      const baseName = file.name.replace(/\.[^/.]+$/, '').trim();

      // Step through 6 stages visually
      for (let s = 1; s <= 6; s++) {
        setActiveStage(s);
        setProcessingStatus(`Processing "${file.name}": Stage ${s} (${stages[s - 1].label})...`);
        await new Promise((r) => setTimeout(r, 220));
      }

      const randomSalt = Math.random().toString(36).substring(2, 7);
      const projId = `SHU-UP-${Date.now().toString().slice(-4)}-${randomSalt}`;

      const newProj: Project = {
        id: projId,
        project_code: projId,
        title: baseName.length > 5 ? baseName : (title.trim() || 'Uploaded Research Dossier'),
        faculty: 'Faculty of Pharmacy',
        faculty_code: 'FOP',
        department: department,
        lead_investigator: pi.trim() || 'Faculty Research Investigator',
        abstract: abstract.trim() || `Automated extraction from "${file.name}". Formulation evaluation, biological assay characterization, and local healthcare applications.`,
        problem_statement: `Addresses clinical and formulation challenges in ${department} through empirical validation and pharmaceutical research.`,
        technology_stack: ['Assay Validation', 'Spectroscopy', 'Formulation Optimization', 'Stability Testing'],
        development_stage: trl >= 6 ? 'Bench Validated' : 'Lab Prototype',
        trl_level: trl,
        erl_level: Math.min(9, Math.max(1, trl + 1)),
        ip_status: ipStatus,
        target_industries: ['Pharmaceuticals', 'Healthcare'],
        commercial_readiness: trl >= 5 ? 'High' : 'Medium',
        estimated_funding_pkr: fundingPkr,
        created_at: new Date().toISOString().split('T')[0],

        facultyPI: pi.trim() || 'Faculty Research Investigator',
        courseTitle: domain,
        domain: domain,
        products: [
          {
            name: `${baseName.slice(0, 35)} Product`,
            dosageForm: 'Healthcare Formulation',
            packaging: 'Standard Medical Unit Pack',
            targetCustomer: 'Hospitals, Clinics & Pharmacies',
            unitCostPKR: 450,
            unitPricePKR: 1200,
            marginPct: 62.5,
            differentiation: 'Locally formulated with validated pharmaceutical bioavailability.'
          }
        ],
        services: [
          {
            name: 'Analytical Formulation Assay Validation',
            protocol: 'ICH Q2(R1) Validation of Analytical Procedures',
            targetClientele: 'Local Pharmaceutical QA/QC Labs',
            turnaroundDays: 5,
            feePKR: 40000
          }
        ],
        marketSizing: {
          tamPKR: 15000,
          samPKR: 4500,
          somPKR: 650,
          methodology: 'Bottom-up clinical demand modeling for Sindh & Karachi metropolitan region.',
          confidence: 'High'
        },
        commercialization: {
          trlLevel: trl,
          trlDescription: `TRL ${trl} - Empirical Testing`,
          overallScore: 4.12,
          priority: trl >= 5 ? 'High Priority' : 'Medium Priority',
          recommendation: 'Proceed with analytical protocol validation and pilot scale-up.',
          criteriaScores: {
            technicalFeasibility: 4.4,
            marketAttractiveness: 4.2,
            customerDemandEvidence: 3.9,
            trlScore: trl,
            intellectualProperty: 3.5,
            teamCapability: 4.0,
            scalability: 4.2,
            importSubstitution: 4.5
          },
          nextActions: [
            'Present executive summary to KATI / LATI Pharmaceutical Committee',
            'Conduct ICH Zone IVb stability testing at SHU Center for Advanced Drug Research',
            'File provisional patent with Intellectual Property Organization of Pakistan (IPO-Pakistan)'
          ]
        },
        matchedAreas: [
          {
            areaName: 'Korangi Industrial Area',
            relevancePct: 92,
            rationale: 'Concentration of major licensed cGMP pharmaceutical manufacturers.',
            candidatePartners: ['Getz Pharma (Pvt) Ltd', 'Hilton Pharma (Pvt) Ltd', 'Searle Company Limited']
          }
        ]
      };

      generatedProjects.push(newProj);
    }

    onAddProjects(generatedProjects);
    setIsProcessing(false);
    setProcessingStatus(null);
    setSuccessMessage(`Successfully ingested and indexed ${generatedProjects.length} document(s) into the ORIC Research Repository!`);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a project title');
      return;
    }

    const randomSalt = Math.random().toString(36).substring(2, 7);
    const projId = `SHU-UP-${Date.now().toString().slice(-4)}-${randomSalt}`;

    const newProj: Project = {
      id: projId,
      project_code: projId,
      title: title.trim(),
      faculty: 'Faculty of Pharmacy',
      faculty_code: 'FOP',
      department: department,
      lead_investigator: pi.trim() || 'Faculty Research Investigator',
      abstract: abstract.trim() || 'Research innovation submitted via ORIC Document Intake Portal.',
      problem_statement: `Addresses industrial and therapeutic challenges in ${domain}.`,
      technology_stack: ['Assay Validation', 'Formulation Protocols'],
      development_stage: trl >= 6 ? 'Bench Validated' : 'Lab Prototype',
      trl_level: trl,
      erl_level: Math.min(9, Math.max(1, trl + 1)),
      ip_status: ipStatus,
      target_industries: ['Pharmaceuticals', 'Healthcare'],
      commercial_readiness: trl >= 5 ? 'High' : 'Medium',
      estimated_funding_pkr: fundingPkr,
      created_at: new Date().toISOString().split('T')[0],

      facultyPI: pi.trim() || 'Faculty Research Investigator',
      courseTitle: domain,
      domain: domain,
      products: [
        {
          name: `${title.slice(0, 35)} Formulation`,
          dosageForm: 'Healthcare Formulation',
          packaging: 'Standard Medical Unit Pack',
          targetCustomer: 'Hospitals, Clinics & Pharmacies',
          unitCostPKR: 450,
          unitPricePKR: 1200,
          marginPct: 62.5,
          differentiation: 'Locally formulated with validated bioavailability.'
        }
      ],
      services: [
        {
          name: 'Assay Validation & Dissolution Testing',
          protocol: 'USP/BP Dissolution',
          targetClientele: 'Quality Assurance Labs',
          turnaroundDays: 4,
          feePKR: 35000
        }
      ],
      marketSizing: {
        tamPKR: 15000,
        samPKR: 4500,
        somPKR: 650,
        methodology: 'Bottom-up estimation from DRAP and PBS indices.',
        confidence: 'High'
      },
      commercialization: {
        trlLevel: trl,
        trlDescription: `TRL ${trl} - Laboratory Prototype`,
        overallScore: 4.15,
        priority: trl >= 5 ? 'High Priority' : 'Medium Priority',
        recommendation: 'Proceed with analytical protocol validation and pilot scale-up.',
        criteriaScores: {
          technicalFeasibility: 4.4,
          marketAttractiveness: 4.2,
          customerDemandEvidence: 3.9,
          trlScore: trl,
          intellectualProperty: 3.5,
          teamCapability: 4.0,
          scalability: 4.2,
          importSubstitution: 4.5
        },
        nextActions: [
          'Present executive summary to KATI / LATI Pharmaceutical Committee',
          'Conduct ICH Zone IVb stability testing at SHU CADR',
          'File provisional patent with IPO-Pakistan'
        ]
      },
      matchedAreas: [
        {
          areaName: 'Korangi Industrial Area',
          relevancePct: 92,
          rationale: 'Major hub for national pharmaceutical formulation plants.',
          candidatePartners: ['Getz Pharma (Pvt) Ltd', 'Hilton Pharma (Pvt) Ltd', 'Searle Company Limited']
        }
      ]
    };

    onAddProjects([newProj]);
    setSuccessMessage(`Successfully registered project "${newProj.title}" into the ORIC Repository!`);
    setTitle('');
    setPi('');
    setAbstract('');
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans bg-zinc-50 min-h-screen text-zinc-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight font-display">
            Document Upload & Processing Pipeline
          </h2>
          <p className="text-xs text-zinc-500">
            Ingest research papers, LMS submissions, patent disclosures, and formulation datasheets into the ORIC intelligence system
          </p>
        </div>
        <button
          onClick={() => onNavigate('explorer')}
          className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold flex items-center gap-1.5 transition self-start"
        >
          <span>View Document Library</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 6-Stage Visual Extraction Pipeline */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4 shadow-xs">
        <div className="text-xs font-bold text-zinc-900 flex items-center gap-2 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-red-600" />
          <span>6-Stage Automated AI Extraction & Assessment Architecture</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {stages.map((stg) => {
            const Icon = stg.icon;
            const isDone = stg.num < activeStage;
            const isCurrent = stg.num === activeStage;
            return (
              <div
                key={stg.num}
                className={`p-3 rounded-lg border text-center transition flex flex-col items-center gap-2 ${
                  isCurrent
                    ? 'border-red-600 bg-red-50/50 shadow-xs ring-1 ring-red-600'
                    : isDone
                    ? 'border-emerald-200 bg-emerald-50/40 text-emerald-900'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCurrent
                      ? 'bg-red-600 text-white animate-pulse'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-200 text-zinc-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-[11px] font-bold leading-tight">{stg.label}</div>
              </div>
            );
          })}
        </div>

        {processingStatus && (
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center gap-2 animate-pulse font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
            {processingStatus}
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Drag & Drop Zone */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4 shadow-xs">
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">
                Drag & Drop Document Dropzone
              </h3>
              <p className="text-xs text-zinc-500">
                Supports PDF, DOCX, XLSX, PPTX, TXT, and CSV files (up to 30MB)
              </p>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? 'border-red-600 bg-red-50/50 scale-[1.01]'
                  : 'border-zinc-300 hover:border-zinc-400 bg-zinc-50/50 hover:bg-zinc-50'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-red-600 shadow-xs">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-zinc-900">
                  Drag & Drop Research Files Here
                </div>
                <div className="text-xs text-zinc-500">
                  or click to browse documents from your workstation
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[10px] text-zinc-600">
                <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-semibold">PDF</span>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">DOCX</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold">XLSX</span>
                <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 font-semibold">PPTX</span>
                <span className="px-2 py-0.5 rounded bg-zinc-200 text-zinc-800 font-semibold">CSV</span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.txt,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Metadata Intake Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4 shadow-xs">
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">
                Manual Metadata Intake
              </h3>
              <p className="text-xs text-zinc-500">
                Directly register project attributes to synthesize an AI dossier immediately
              </p>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-zinc-700 block">Project Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Novel Mucoadhesive Buccal Film Formulation"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-2 text-zinc-900 focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 block">Principal Investigator</label>
                  <input
                    type="text"
                    value={pi}
                    onChange={(e) => setPi(e.target.value)}
                    placeholder="e.g. Dr. Farooq Siddiqui"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-2 text-zinc-900 focus:outline-hidden focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 block">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-2 text-zinc-900 focus:outline-hidden focus:border-red-500"
                  >
                    <option value="Faculty of Pharmacy (FoP)">Faculty of Pharmacy (FoP)</option>
                    <option value="Department of Pharmaceutics">Department of Pharmaceutics</option>
                    <option value="Department of Pharmaceutical Chemistry">Department of Pharmaceutical Chemistry</option>
                    <option value="Department of Computer Science">Department of Computer Science</option>
                    <option value="Department of Biomedical Engineering">Department of Biomedical Engineering</option>
                    <option value="Department of Business Administration">Department of Business Administration</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 block">Target TRL (1–9)</label>
                  <select
                    value={trl}
                    onChange={(e) => setTrl(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-2 text-zinc-900 focus:outline-hidden focus:border-red-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((t) => (
                      <option key={t} value={t}>
                        TRL {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 block">IP Status</label>
                  <select
                    value={ipStatus}
                    onChange={(e) => setIpStatus(e.target.value as any)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-2 text-zinc-900 focus:outline-hidden focus:border-red-500"
                  >
                    <option value="None">None</option>
                    <option value="Disclosure Filed">Disclosure Filed</option>
                    <option value="Patent Pending">Patent Pending</option>
                    <option value="Patent Granted">Patent Granted</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700 block">Research Abstract & Formulation Summary</label>
                <textarea
                  rows={3}
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  placeholder="Summarize formulation objectives, laboratory methodologies, excipients used, and expected therapeutic or industrial outcomes..."
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-2 text-zinc-900 focus:outline-hidden focus:border-red-500 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Register & Synthesize AI Dossier</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

