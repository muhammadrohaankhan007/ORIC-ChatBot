'use client';

import React from 'react';
import { ViewMode } from '@/types';
import evidenceSources from '@/data/evidence_sources.json';
import {
  ShieldCheck,
  Building,
  ExternalLink,
  Table,
  CheckCircle2,
  FileText,
  BadgeCheck,
  Scale
} from 'lucide-react';

interface DataSourcesViewProps {
  onNavigate: (view: ViewMode) => void;
}

export default function DataSourcesView({ onNavigate }: DataSourcesViewProps) {
  const assumptions = [
    {
      parameter: 'Exchange Rate Benchmark',
      value: '1 USD = 280.00 PKR',
      source: 'State Bank of Pakistan (SBP) Weighted Average Forex',
      impact: 'Directly applied to export valuations, imported API substitution calculations, and international patent filings.'
    },
    {
      parameter: 'Sindh Provincial Consumption Share',
      value: '32.5% of National Market',
      source: 'Pakistan Bureau of Statistics (PBS) Household Expenditure Survey',
      impact: 'Used as baseline multiplier to determine Serviceable Addressable Market (SAM) from National TAM.'
    },
    {
      parameter: 'Pharmaceutical Sector Baseline CAGR',
      value: '11.4% (2026–2031)',
      source: 'PPMA Sector Census / IQVIA Pakistan Audits',
      impact: 'Applied to 5-year commercial forecasts for therapeutic dosage forms, tablets, and injectables.'
    },
    {
      parameter: 'Nutraceutical & Herbal Formulation CAGR',
      value: '15.8% (2026–2031)',
      source: 'DRAP Alternative Medicine Directorate & Export Data',
      impact: 'Applied to botanical extracts, dietary syrups, antioxidant supplements, and dermatological creams.'
    },
    {
      parameter: 'Digital Health & MedTech CAGR',
      value: '21.0% (2026–2031)',
      source: 'Ministry of IT & Telecom / Venture Funding Indices',
      impact: 'Applied to continuous biosensors, AI textile inspection units, and ESG supply chain platforms.'
    },
    {
      parameter: 'Average Commercial Gross Margin',
      value: '58% - 72%',
      source: 'PSX Listed Pharmaceutical Disclosures (Formulation Division)',
      impact: 'Used to model unit economics, gross margins, and university licensing royalty expectations.'
    }
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans bg-zinc-50 min-h-screen text-zinc-900">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight font-display">
            Data Sources, Evidence & Assumptions Registry
          </h2>
          <p className="text-xs text-zinc-500">
            Traceable market evidence registry ensuring academic credibility, verifiable statutory citations, and methodological transparency
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
          <BadgeCheck className="w-4 h-4 text-emerald-600" />
          <span>8 Verified Statutory Authorities</span>
        </div>
      </div>

      {/* Credibility Assurance Callout */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold text-blue-950">Methodological Integrity Standard: </strong>
          In accordance with Salim Habib University ORIC guidelines, all numerical market sizing, TAM/SAM/SOM estimations, and growth projections originate either from verified statutory registries (PBS, SBP, DRAP, PPMA) or transparent bottom-up scenario models. No unsubstantiated market sizes or fictitious financial claims are permitted within institutional dossiers.
        </div>
      </div>

      {/* Statutory Evidence Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {evidenceSources.map((src) => (
          <div
            key={src.id}
            className="p-5 rounded-xl border border-zinc-200 bg-white shadow-xs flex flex-col justify-between space-y-3 hover:border-zinc-300 transition"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {src.credibility.split('-')[0].trim()}
                </span>
                <span className="text-[10px] font-mono text-zinc-400 font-bold">{src.id}</span>
              </div>

              <h4 className="text-sm font-extrabold text-zinc-900 leading-snug">{src.name}</h4>
              <div className="text-[11px] font-semibold text-red-600">{src.type}</div>
              <p className="text-xs text-zinc-600 leading-relaxed">{src.description}</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-100 text-xs">
              <div className="text-[11px] text-zinc-500 bg-zinc-50 p-2 rounded-lg border border-zinc-200">
                <strong>Applied To:</strong> {src.relevantAreas}
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-zinc-400">Verified: {src.lastVerified}</span>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-red-600 hover:text-red-700 inline-flex items-center gap-1"
                >
                  <span>Official Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Transparent Economic & Financial Modeling Assumptions Table */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-red-600" />
          <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">
            Economic & Financial Modeling Assumptions
          </h3>
        </div>

        <div className="overflow-x-auto border border-zinc-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Macroeconomic Parameter</th>
                <th className="p-3.5">Benchmark Value</th>
                <th className="p-3.5">Authoritative Source</th>
                <th className="p-3.5">Application & Modeling Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {assumptions.map((row, idx) => (
                <tr key={idx} className="hover:bg-zinc-50/80 transition">
                  <td className="p-3.5 font-bold text-zinc-900">{row.parameter}</td>
                  <td className="p-3.5 font-mono font-bold text-red-600 whitespace-nowrap">{row.value}</td>
                  <td className="p-3.5 text-zinc-600">{row.source}</td>
                  <td className="p-3.5 text-zinc-700 leading-relaxed">{row.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
