'use client';

import React, { useState } from 'react';
import { IndustryCompany, ViewMode } from '@/types';
import { INITIAL_COMPANIES } from '@/services/api';
import karachiIndustrialAreas from '@/data/karachi_industrial_areas.json';
import { 
  Building2, 
  Search, 
  MapPin, 
  CheckCircle2, 
  Handshake, 
  Cpu,
  Factory
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
    ...karachiIndustrialAreas.map((area) => ({
      id: area.name,
      label: area.name.replace(' Industrial Area', '').replace(' (Sindh Industrial Trading Estate)', ''),
    }))
  ];

  const activeEstate = karachiIndustrialAreas.find(
    (a) => a.name.toLowerCase() === selectedCluster.toLowerCase() ||
           selectedCluster.toLowerCase().includes(a.name.toLowerCase())
  );

  const filteredCompanies = companies.filter(c => {
    const matchesCluster = selectedCluster === 'ALL' || c.cluster.toLowerCase().includes(selectedCluster.toLowerCase()) || selectedCluster.toLowerCase().includes(c.cluster.toLowerCase());
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
        cluster: selectedCluster === 'ALL' ? 'Korangi Industrial Area' : selectedCluster,
        sector: 'Pharmaceutical & Chemical',
        turnover_range: 'PKR 5B+',
        verified_status: true,
        contact_person: 'GM Production & Commercialization',
        contact_email: 'procurement@industry.example',
        matching_project_code: 'SHU-FOP-001',
        synergy_potential: 'High',
        tech_needs: ['Lipid nano-formulation', 'Automated QA', 'DRAP Dossier Validation', 'Process Analytical Tech']
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
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold font-display text-zinc-900 tracking-tight">
              Karachi Industrial Intelligence Radar
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
              10 Major Industrial Zones
            </span>
          </div>
          <p className="text-xs text-zinc-500">
            Corporate discovery matching university research directly to Karachi&apos;s industrial manufacturing estates and trade associations
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
            className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center gap-1.5 shrink-0 transition shadow-xs cursor-pointer"
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
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              selectedCluster === c.id
                ? 'bg-red-600 text-white shadow-xs font-semibold'
                : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Active Industrial Estate Information Banner */}
      {activeEstate && (
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
                <Factory className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-zinc-900">{activeEstate.name}</h3>
                <p className="text-[11px] text-zinc-500">{activeEstate.association} • Established {activeEstate.establishedYear}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="font-mono bg-zinc-100 px-2.5 py-1 rounded text-zinc-700 font-semibold">
                {activeEstate.unitsCount}
              </span>
              <span className="font-mono bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded font-bold">
                Turnover: {activeEstate.annualTurnoverEst}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Major Pharma Presence:</span>
              <p className="text-zinc-700 font-medium">{activeEstate.majorPharmaPresence}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Infrastructure & Logistics:</span>
              <p className="text-zinc-700">{activeEstate.infrastructure}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Tech Adoption Potential:</span>
              <p className="text-red-700 font-medium">{activeEstate.techAdoptionPotential}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mr-1">Verified Sectors:</span>
            {activeEstate.verifiedSectors.map((sector: string, idx: number) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 text-[11px]">
                {sector}
              </span>
            ))}
          </div>
        </div>
      )}

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