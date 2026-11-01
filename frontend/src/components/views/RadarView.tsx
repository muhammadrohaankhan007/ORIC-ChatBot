'use client';

import React, { useState } from 'react';
import { IndustryCompany, ViewMode } from '@/types';
import { INITIAL_COMPANIES } from '@/services/api';
import { 
  Building2, 
  Search, 
  MapPin, 
  CheckCircle2, 
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
        tech_needs: ['Lipid formulation', 'Automated QA', 'DRAP Dossier Validation']
      };

      setCompanies(prev => [newCompany, ...prev]);
      setLiveScanning(false);
    }, 1000);
  };

  const handleDraftMou = (companyName: string) => {
    setMouDraftedCompany(companyName);
    setTimeout(() => {
      onNavigate('reports');
    }, 1200);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans bg-zinc-50 min-h-screen text-zinc-900">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold font-display text-zinc-900 tracking-tight">
            Karachi Industrial Intelligence Radar
          </h2>
          <p className="text-xs text-zinc-500">
            Corporate discovery matching university research directly to Karachi manufacturing demand
          </p>
        </div>

        {/* Search Trigger */}
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLiveSearch()}
              placeholder="Search Karachi industrial leads..."
              className="w-full bg-white border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 pl-10 pr-4 py-2.5 rounded-lg focus:outline-hidden focus:border-zinc-400 shadow-xs transition"
            />
          </div>
          <button
            onClick={handleLiveSearch}
            disabled={liveScanning}
            className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center gap-1.5 shrink-0 transition shadow-xs"
          >
            {liveScanning ? (
              <>
                <Cpu className="w-4 h-4 animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <span>Search Leads</span>
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
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedCluster === c.id
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Notification if MoU triggered */}
      {mouDraftedCompany && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Initiated Bilateral MoU for {mouDraftedCompany}. Navigating to Reports...</span>
        </div>
      )}

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCompanies.map((company) => (
          <div
            key={company.id}
            className="rounded-lg bg-white border border-zinc-200 p-6 space-y-4 shadow-xs hover:border-zinc-300 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-red-600" />
                  {company.name}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-red-600" />
                  Verified
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>{company.cluster}</span>
                <span>•</span>
                <span className="text-zinc-700 font-medium">{company.sector}</span>
              </div>

              {/* Technical Demand Tags */}
              <div className="space-y-1 pt-1">
                <div className="text-xs font-medium text-zinc-500">Active R&D Demands:</div>
                <div className="flex flex-wrap gap-1.5">
                  {company.tech_needs.map((need, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200"
                    >
                      {need}
                    </span>
                  ))}
                </div>
              </div>

              {/* Matched Project Pill */}
              {company.matching_project_code && (
                <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-zinc-500">Compatible SHU Research:</span>
                    <div className="text-xs font-bold text-zinc-900">{company.matching_project_code}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500">Synergy Potential</span>
                    <div className="text-xs font-bold text-red-600">{company.synergy_potential}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between gap-2">
              <span className="text-xs text-zinc-500">Turnover: {company.turnover_range}</span>
              <button
                onClick={() => handleDraftMou(company.name)}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Handshake className="w-3.5 h-3.5" />
                <span>Initiate Bilateral MoU</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
