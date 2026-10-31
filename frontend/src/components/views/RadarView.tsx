'use client';

import React, { useState } from 'react';
import { IndustryCompany, ViewMode } from '@/types';
import { INITIAL_COMPANIES } from '@/services/api';
import { 
  Building2, 
  Search, 
  MapPin, 
  CheckCircle2, 
  Sparkles, 
  Globe, 
  Handshake, 
  Cpu
} from 'lucide-react';

interface RadarViewProps {
  onNavigate: (view: ViewMode) => void;
}

export default function RadarView({ onNavigate }: RadarViewProps) {
  const [companies, setCompanies] = useState<IndustryCompany[]>(INITIAL_COMPANIES);
  const [selectedCluster, setSelectedCluster] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveScanning, setLiveScanning] = useState(false);
  const [mouDraftedCompany, setMouDraftedCompany] = useState<string | null>(null);

  const clusters = [
    { id: 'ALL', label: 'All Industrial Zones' },
    { id: 'Korangi Industrial Area', label: 'Korangi' },
    { id: 'S.I.T.E. Industrial Area', label: 'S.I.T.E.' },
    { id: 'Landhi Industrial Area', label: 'Landhi' },
    { id: 'Port Qasim', label: 'Port Qasim' }
  ];

  const filteredCompanies = companies.filter(c => {
    const matchesCluster = selectedCluster === 'ALL' || c.cluster === selectedCluster;
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tech_needs.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCluster && matchesSearch;
  });

  const handleLiveSearch = () => {
    if (!searchQuery.trim()) return;
    setLiveScanning(true);

    setTimeout(() => {
      const newCompany: IndustryCompany = {
        id: `comp-${Date.now()}`,
        name: searchQuery.includes(' ') ? searchQuery : `${searchQuery} Industries Pakistan`,
        cluster: 'Korangi Industrial Area',
        sector: 'Pharmaceutical',
        turnover_range: 'PKR 5B+',
        verified_status: true,
        contact_person: 'GM Production & Technology',
        contact_email: 'procurement@industry.example',
        matching_project_code: 'SHU-FOP-2026-001',
        synergy_potential: 'High',
        tech_needs: ['Automated Assay', 'Continuous Extraction', 'GMP Compliance']
      };

      setCompanies(prev => [newCompany, ...prev]);
      setLiveScanning(false);
    }, 1500);
  };

  const handleDraftMou = (companyName: string) => {
    setMouDraftedCompany(companyName);
    setTimeout(() => {
      onNavigate('reports');
    }, 1200);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans bg-black text-zinc-100">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-red-950/50 border border-red-800/60 text-red-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Globe className="w-3.5 h-3.5 text-red-500" />
            <span>Live Industrial Intelligence Pipeline</span>
          </div>
          <h2 className="font-display text-xl font-black text-white tracking-tight">
            Karachi & Regional Industry Intelligence Radar
          </h2>
          <p className="text-xs text-zinc-400">
            Real-time corporate opportunity discovery linking SHU laboratory research directly to industrial manufacturing demand.
          </p>
        </div>

        {/* Live Search Trigger */}
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLiveSearch()}
              placeholder="Search Karachi industrial leads..."
              className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 pl-10 pr-4 py-2.5 rounded-md focus:outline-none focus:border-red-600 transition"
            />
          </div>
          <button
            onClick={handleLiveSearch}
            disabled={liveScanning}
            className="px-4 py-2.5 rounded-md bg-red-600 hover:bg-red-500 text-white font-display font-bold text-xs flex items-center gap-1.5 shrink-0 transition"
          >
            {liveScanning ? (
              <>
                <Cpu className="w-4 h-4 animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Live Scan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Cluster Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {clusters.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCluster(c.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition font-mono ${
              selectedCluster === c.id
                ? 'bg-red-600 text-white shadow-sm shadow-red-950/40'
                : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Notification if MoU triggered */}
      {mouDraftedCompany && (
        <div className="p-4 rounded-md bg-red-950/40 border border-red-800/60 text-white text-xs font-semibold flex items-center justify-between font-mono animate-pulse">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-red-500" />
            <span>Generated Bilateral R&D Partnership MoU for {mouDraftedCompany}! Redirecting to Dossier Facility...</span>
          </div>
        </div>
      )}

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCompanies.map((company) => (
          <div
            key={company.id}
            className="rounded-md bg-zinc-950 border border-zinc-800 p-6 space-y-4 hover:border-red-900/60 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-red-500" />
                  {company.name}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 font-mono font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-red-500" />
                  SECP Verified
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>{company.cluster}</span>
                <span>•</span>
                <span className="text-zinc-300">{company.sector}</span>
              </div>

              {/* Technical Demand Tags */}
              <div className="space-y-1 pt-1">
                <div className="text-[11px] font-semibold text-zinc-400">Active R&D Demands:</div>
                <div className="flex flex-wrap gap-1.5">
                  {company.tech_needs.map((need, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded bg-black text-zinc-300 border border-zinc-800"
                    >
                      {need}
                    </span>
                  ))}
                </div>
              </div>

              {/* Matched Project Pill */}
              {company.matching_project_code && (
                <div className="p-3 rounded bg-black border border-zinc-850 flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-zinc-400 font-mono">Compatible SHU Research:</span>
                    <div className="font-mono text-xs font-bold text-white">{company.matching_project_code}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 font-mono">Synergy Rating</span>
                    <div className="text-xs font-bold text-red-500 font-mono">{company.synergy_potential}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-zinc-850 flex items-center justify-between gap-2">
              <span className="text-[11px] text-zinc-400 font-mono">Turnover: {company.turnover_range}</span>
              <button
                onClick={() => handleDraftMou(company.name)}
                className="px-3.5 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-display font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Handshake className="w-3.5 h-3.5" />
                <span>Initiate Corporate MoU</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
