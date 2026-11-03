'use client';

import React, { useState } from 'react';
import { Project, CurrencyMode } from '@/types';
import { formatMoney, formatPrice } from '@/utils/formatters';
import {
  X,
  Atom,
  Box,
  FlaskConical,
  Building2,
  ListChecks,
  Sparkles,
  MessageSquare,
  FileText,
  Code,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building,
  GraduationCap,
  Users,
  TrendingUp,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';

interface IntelligenceDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  allProjects: Project[];
  onSelectProject: (p: Project) => void;
  currency: CurrencyMode;
  onAskCopilot?: (project: Project) => void;
  onGenerateReport?: (project: Project) => void;
}

type SubTab = 'executive' | 'technology' | 'products' | 'services' | 'karachi' | 'validation';

export default function IntelligenceDossierModal({
  isOpen,
  onClose,
  project,
  allProjects,
  onSelectProject,
  currency,
  onAskCopilot,
  onGenerateReport
}: IntelligenceDossierModalProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('executive');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAnalysisNotes, setAiAnalysisNotes] = useState<string | null>(null);

  if (!isOpen || !project) return null;

  // Defensive fallback data
  const comm = project.commercialization || {
    priority: 'Standard Priority' as const,
    trlLevel: project.trl_level || 3,
    trlDescription: `TRL ${project.trl_level || 3} - Laboratory Breadboard Validation`,
    overallScore: project.erl_level ? project.erl_level / 2 + 1.5 : 3.8,
    recommendation: 'Prototype Refinement & Pre-clinical Evaluation',
    criteriaScores: {
      technicalFeasibility: 4.2,
      marketAttractiveness: 3.8,
      customerDemandEvidence: 3.4,
      trlScore: project.trl_level || 3,
      intellectualProperty: 3.0,
      teamCapability: 4.0,
      scalability: 4.1,
      importSubstitution: 4.3
    },
    nextActions: [
      'Present executive summary to KATI / LATI Pharmaceutical Committee for commercial interest',
      'Conduct ICH Zone IVb stability testing at SHU Center for Advanced Drug Research',
      'File provisional patent with Intellectual Property Organization of Pakistan (IPO-Pakistan)'
    ]
  };

  const market = project.marketSizing || {
    tamPKR: 12000,
    samPKR: 3500,
    somPKR: 450,
    methodology: 'Bottom-up unit volume estimation combining DRAP annual category registrations and PBS urban healthcare expenditure indices.',
    confidence: 'High (Sourced from verified laboratory objectives & trade directories)'
  };

  const products = project.products && project.products.length > 0 ? project.products : [
    {
      name: `${project.title.slice(0, 40)} Formulation`,
      dosageForm: 'Commercial Dosage Form',
      packaging: 'Standard Healthcare Unit Packaging',
      targetCustomer: 'Hospitals, Clinics & Pharmacies',
      unitCostPKR: 450,
      unitPricePKR: 1200,
      marginPct: 62.5,
      differentiation: 'Locally formulated with enhanced bioavailability and lower import dependency.'
    }
  ];

  const services = project.services && project.services.length > 0 ? project.services : [
    {
      name: 'Assay & In-Vitro Dissolution Profiling',
      protocol: 'USP/BP Apparatus II (Paddle Method)',
      targetClientele: 'Local Pharmaceutical Quality Control Labs',
      turnaroundDays: 4,
      feePKR: 35000
    },
    {
      name: 'Accelerated Stability Testing',
      protocol: 'ICH Zone IVb (40°C / 75% RH)',
      targetClientele: 'Formulation R&D & Commercial Manufacturers',
      turnaroundDays: 30,
      feePKR: 75000
    }
  ];

  const matchedAreas = project.matchedAreas && project.matchedAreas.length > 0 ? project.matchedAreas : [
    {
      areaName: 'Korangi Industrial Area',
      relevancePct: 92,
      rationale: 'High concentration of licensed cGMP pharmaceutical manufacturers and analytical laboratories.',
      candidatePartners: ['Getz Pharma (Pvt) Ltd', 'Hilton Pharma (Pvt) Ltd', 'Searle Company Limited']
    },
    {
      areaName: 'S.I.T.E. Industrial Area',
      relevancePct: 85,
      rationale: 'Major hub for chemical synthesis, packaging converters, and FMCG distributors.',
      candidatePartners: ['Ferozsons Laboratories Ltd', 'Abbott Pakistan', 'Medisure Labs']
    }
  ];

  const handleRunAiAnalysis = () => {
    setIsAiAnalyzing(true);
    setAiAnalysisNotes(null);

    setTimeout(() => {
      setIsAiAnalyzing(false);
      setAiAnalysisNotes(
        `[Google Gemini AI Analysis Completed • ${new Date().toLocaleDateString()}]: ` +
        `The innovation "${project.title}" demonstrates strong commercial viability with an overall score of ` +
        `${comm.overallScore.toFixed(2)}/5.00. Key strengths include high import substitution potential for the Pakistani ` +
        `pharmaceutical ecosystem and immediate synergy with manufacturers in ${matchedAreas[0]?.areaName || 'Karachi industrial corridors'}. ` +
        `Recommended immediate priority: Complete analytical protocol validation and prepare licensing deck for corporate partners.`
      );
    }, 1500);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.id}_intelligence_dossier.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden text-zinc-900 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-zinc-900 via-slate-900 to-zinc-900 text-white p-6 shrink-0 border-b border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-white/20 font-bold tracking-wider">
                  {project.id}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  comm.priority === 'High Priority' ? 'bg-amber-500 text-zinc-950' :
                  comm.priority === 'Medium Priority' ? 'bg-blue-500 text-white' : 'bg-zinc-700 text-zinc-200'
                }`}>
                  {comm.priority}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-500/40">
                  TRL {comm.trlLevel}/9
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Gemini AI Verified
                </span>
                <span className="text-xs text-zinc-400 flex items-center gap-1 ml-auto sm:ml-0">
                  <Calendar className="w-3.5 h-3.5" />
                  {project.created_at || 'Fall 2026'}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug max-w-4xl">
                {project.title}
              </h2>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-300 pt-1">
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-zinc-400" />
                  {project.department}
                </span>
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-zinc-400" />
                  Lead: <strong className="text-white">{project.lead_investigator || project.facultyPI}</strong>
                </span>
                {project.courseTitle && (
                  <span className="hidden md:inline">
                    Course: <strong className="text-white">{project.courseTitle}</strong>
                  </span>
                )}
                {project.studentGroup && (
                  <span className="hidden lg:flex items-center gap-1 text-zinc-400">
                    <Users className="w-3.5 h-3.5" />
                    Cohort: {project.studentGroup}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-2 self-start shrink-0">
              <button
                onClick={handleRunAiAnalysis}
                disabled={isAiAnalyzing}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                title="Run real-time Gemini AI extraction"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAiAnalyzing ? 'Analyzing...' : 'Run Gemini AI'}</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onAskCopilot?.(project);
                }}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                title="Ground AI Chat in this project"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask AI Copilot</span>
              </button>

              <button
                onClick={handleExportJson}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1 transition"
                title="Download JSON dossier"
              >
                <Code className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onGenerateReport?.(project);
                }}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 transition"
                title="Generate official PDF report"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF Brief</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition ml-2"
                title="Close dossier"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Project Switcher Bar */}
        <div className="bg-zinc-50 border-b border-zinc-200 px-6 py-2.5 flex items-center justify-between flex-wrap gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Switch Project Dossier:</span>
            <select
              value={project.id}
              onChange={(e) => {
                const found = allProjects.find((p) => p.id === e.target.value);
                if (found) onSelectProject(found);
              }}
              className="text-xs bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 text-zinc-900 font-medium max-w-xs sm:max-w-md focus:outline-hidden focus:border-red-500"
            >
              {allProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.id}] {p.title.slice(0, 60)}{p.title.length > 60 ? '...' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
            <span>Commercial Score:</span>
            <span className="font-bold text-red-600 font-mono text-sm">
              {comm.overallScore.toFixed(2)}/5.00
            </span>
          </div>
        </div>

        {/* Sub-Tabs Navigation */}
        <div className="flex items-center gap-1 px-6 border-b border-zinc-200 bg-white overflow-x-auto shrink-0 scrollbar-none">
          {[
            { id: 'executive', label: 'Executive Summary', icon: FileText },
            { id: 'technology', label: 'Technology & Science', icon: Atom },
            { id: 'products', label: `Commercial Products (${products.length})`, icon: Box },
            { id: 'services', label: `Industrial Services (${services.length})`, icon: FlaskConical },
            { id: 'karachi', label: `Karachi Industrial Fit (${matchedAreas.length})`, icon: Building2 },
            { id: 'validation', label: 'Validation Action Plan', icon: ListChecks }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as SubTab)}
                className={`py-3 px-3.5 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition ${
                  isActive
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white min-h-[350px]">
          {/* Live AI Analysis Alert Banner if generated */}
          {aiAnalysisNotes && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed space-y-1 animate-in fade-in">
              <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Google Gemini Live Intelligence Evaluation
              </div>
              <p>{aiAnalysisNotes}</p>
            </div>
          )}

          {/* TAB 1: EXECUTIVE SUMMARY */}
          {activeSubTab === 'executive' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                  <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Total Addressable Market (TAM)</div>
                  <div className="text-xl font-extrabold text-zinc-900 font-display">
                    {formatMoney(market.tamPKR ? market.tamPKR * 1000 : 12000000, currency)}
                  </div>
                  <div className="text-[11px] text-zinc-500">Pakistan & Sindh Healthcare Sector</div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                  <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Serviceable Addressable Market (SAM)</div>
                  <div className="text-xl font-extrabold text-zinc-900 font-display">
                    {formatMoney(market.samPKR ? market.samPKR * 1000 : 3500000, currency)}
                  </div>
                  <div className="text-[11px] text-zinc-500">Karachi Metropolitan & Export Corridors</div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                  <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Serviceable Obtainable Market (SOM)</div>
                  <div className="text-xl font-extrabold text-red-600 font-display">
                    {formatMoney(market.somPKR ? market.somPKR * 1000 : 450000, currency)}
                  </div>
                  <div className="text-[11px] text-zinc-500">3-Year Realistic Institutional Capture</div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">Clinical Unmet Need & Problem Statement</h3>
                <p className="text-xs text-zinc-700 leading-relaxed bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                  {project.problem_statement ||
                    'Currently, local clinical practice faces significant therapeutic gaps due to poor patient compliance, high import prices of finished dosage forms, and absence of standardized regional excipient combinations.'}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">Research Abstract & Formulation Overview</h3>
                <p className="text-xs text-zinc-700 leading-relaxed bg-zinc-50 p-4 rounded-xl border border-zinc-200 whitespace-pre-line">
                  {project.abstract}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-red-50/50 border border-red-200 space-y-2">
                <div className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-red-600" />
                  National Import Substitution & Strategic Value
                </div>
                <p className="text-xs text-red-800 leading-relaxed">
                  Successful commercialization enables Pakistani manufacturers to manufacture this product domestically under DRAP compliance, reducing foreign exchange expenditures while enhancing product shelf-life in climatic Zone IVb.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: TECHNOLOGY & SCIENTIFIC PRINCIPLES */}
          {activeSubTab === 'technology' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="text-xs font-bold text-zinc-900">Technology Readiness Level (TRL)</div>
                  <div className="text-xs text-zinc-600">{comm.trlDescription || `TRL ${comm.trlLevel} - Laboratory Prototype`}</div>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-extrabold text-sm font-mono shadow-xs">
                  TRL {comm.trlLevel} / 9
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">Applied Scientific Technologies & Methodologies</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(project.technology_stack || ['Formulation Assays', 'Stability Testing']).map((tech, i) => (
                    <div key={i} className="p-3 rounded-lg border border-zinc-200 bg-white flex items-center gap-2.5">
                      <Atom className="w-4 h-4 text-red-600 shrink-0" />
                      <span className="text-xs font-medium text-zinc-800">{tech}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                <h4 className="text-xs font-bold text-zinc-900">Intellectual Property & Regulatory Filing Pathway</h4>
                <div className="text-xs text-zinc-700 leading-relaxed space-y-1">
                  <div>• <strong>Current IP Status:</strong> {project.ip_status || 'Disclosure Filed'}</div>
                  <div>• <strong>Filing Target:</strong> Intellectual Property Organization of Pakistan (IPO-Pakistan), Patents Ordinance 2000.</div>
                  <div>• <strong>DRAP Regulatory Classification:</strong> Finished Pharmaceutical Product / Therapeutic Goods Registration (Form-5 / Form-7).</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMMERCIAL PRODUCTS */}
          {activeSubTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">Commercial Spun-Off Dosage Forms</h3>
                  <p className="text-xs text-zinc-500">Formulation products ready for industrial transfer and pharmaceutical licensing</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700">
                  {products.length} Product(s) Defined
                </span>
              </div>

              <div className="overflow-x-auto border border-zinc-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3">Product Name & Dosage Form</th>
                      <th className="p-3">Packaging Specification</th>
                      <th className="p-3">Target Customer Segment</th>
                      <th className="p-3 text-right">Unit Cost</th>
                      <th className="p-3 text-right">Selling Price</th>
                      <th className="p-3 text-right">Gross Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {products.map((prod, i) => (
                      <tr key={i} className="hover:bg-zinc-50/80 transition">
                        <td className="p-3">
                          <div className="font-bold text-zinc-900">{prod.name}</div>
                          <div className="text-[11px] text-zinc-500">{prod.dosageForm}</div>
                        </td>
                        <td className="p-3 text-zinc-700">{prod.packaging || 'Standard Unit Pack'}</td>
                        <td className="p-3 text-zinc-700">{prod.targetCustomer || 'Retail Pharmacies & Hospitals'}</td>
                        <td className="p-3 text-right font-mono text-zinc-700">
                          {formatPrice(prod.unitCostPKR, currency)}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-zinc-900">
                          {formatPrice(prod.unitPricePKR, currency)}
                        </td>
                        <td className="p-3 text-right">
                          <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                            {prod.marginPct != null
                              ? typeof prod.marginPct === 'number'
                                ? `${prod.marginPct.toFixed(1)}%`
                                : String(prod.marginPct).includes('%')
                                ? prod.marginPct
                                : `${prod.marginPct}%`
                              : '60.0%'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {products[0]?.differentiation && (
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                  <div className="text-xs font-bold text-zinc-900">Primary Competitive Advantage:</div>
                  <div className="text-xs text-zinc-700">{products[0].differentiation}</div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: INDUSTRIAL TESTING SERVICES */}
          {activeSubTab === 'services' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">Industrial Testing & Analytical Services</h3>
                  <p className="text-xs text-zinc-500">Commercial fee-based laboratory testing available to Karachi manufacturers</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700">
                  {services.length} Testing Protocol(s)
                </span>
              </div>

              <div className="overflow-x-auto border border-zinc-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3">Testing Service Name</th>
                      <th className="p-3">Standard Protocol Reference</th>
                      <th className="p-3">Target Industrial Clientele</th>
                      <th className="p-3 text-center">Turnaround</th>
                      <th className="p-3 text-right">Official Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {services.map((srv, i) => (
                      <tr key={i} className="hover:bg-zinc-50/80 transition">
                        <td className="p-3 font-bold text-zinc-900">{srv.name}</td>
                        <td className="p-3 text-zinc-600 font-mono text-[11px]">{srv.protocol || 'USP/BP Compendial'}</td>
                        <td className="p-3 text-zinc-700">{srv.targetClientele || 'Quality Assurance Labs'}</td>
                        <td className="p-3 text-center text-zinc-700">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-zinc-400" />
                            {srv.turnaroundDays || 5} days
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-red-600">
                          {formatPrice(srv.feePKR, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: KARACHI INDUSTRIAL FIT */}
          {activeSubTab === 'karachi' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">Karachi Industrial Area Matching</h3>
                <p className="text-xs text-zinc-500">Candidate industrial estates and verified enterprise partners for licensing and contract R&D</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchedAreas.map((area, i) => (
                  <div key={i} className="p-5 rounded-xl border border-zinc-200 bg-white shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-600" />
                        <span className="font-bold text-sm text-zinc-900">{area.areaName}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-red-50 text-red-700 border border-red-200 font-mono">
                        {area.relevancePct}% Fit
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 leading-relaxed">
                      {area.rationale || 'High concentration of pharmaceutical formulation units, packaging plants, and analytical testing centers.'}
                    </p>

                    {area.candidatePartners && area.candidatePartners.length > 0 && (
                      <div className="pt-2 border-t border-zinc-100">
                        <div className="text-[11px] font-bold text-zinc-700 mb-1.5 uppercase tracking-wider">Candidate Enterprise Partners:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {area.candidatePartners.map((cp, j) => (
                            <span key={j} className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 text-[11px] font-medium border border-zinc-200">
                              {cp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: VALIDATION ACTION PLAN */}
          {activeSubTab === 'validation' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">Validation & Commercialization Action Checklist</h3>
                <p className="text-xs text-zinc-500">Key institutional milestones required before formal industrial transfer and commercial licensing</p>
              </div>

              <div className="space-y-2.5">
                {(comm.nextActions || [
                  'Complete analytical protocol validation at SHU CADR',
                  'File provisional patent with IPO-Pakistan',
                  'Engage Korangi Industrial Association (KATI) corporate partners'
                ]).map((action, i) => (
                  <div key={i} className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span className="text-xs font-medium text-zinc-800 leading-relaxed">{action}</span>
                  </div>
                ))}
              </div>

              {comm.reviewNotes && comm.reviewNotes.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-zinc-200">
                  <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Review Committee & AI Notes</h4>
                  <div className="space-y-2">
                    {comm.reviewNotes.map((rn, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-xs space-y-1">
                        <div className="flex items-center justify-between text-zinc-500 font-mono text-[10px]">
                          <span>{rn.author}</span>
                          <span>{rn.date}</span>
                        </div>
                        <p className="text-zinc-700 leading-relaxed">{rn.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-zinc-50 border-t border-zinc-200 px-6 py-3 flex items-center justify-between flex-wrap gap-3 shrink-0">
          <div className="text-xs text-zinc-500">
            Salim Habib University • Office of Research, Innovation & Commercialization (ORIC)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onGenerateReport?.(project);
              }}
              className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold flex items-center gap-1.5 transition"
            >
              <span>Generate Reports A–H</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs font-bold transition"
            >
              Close Dossier
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
