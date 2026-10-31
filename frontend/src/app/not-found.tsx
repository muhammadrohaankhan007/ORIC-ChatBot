'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GraduationCap, ArrowLeft, Mail } from 'lucide-react';

export default function NotFound() {
  const [currentYear, setCurrentYear] = useState(2026);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col justify-between selection:bg-red-600 selection:text-white font-sans">
      {/* Top Bar */}
      <header className="border-b border-zinc-800 bg-zinc-950 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-md bg-red-600 flex items-center justify-center font-bold text-white shadow-md shadow-red-950/40">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-base tracking-tight text-white group-hover:text-red-500 transition">
              SHU <span className="text-red-500">ORIC</span>
            </div>
            <div className="text-[11px] text-zinc-400 font-medium">Salim Habib University</div>
          </div>
        </Link>
        <div className="text-xs text-zinc-400 font-mono">
          HEC Recognized ORIC • Karachi, Pakistan
        </div>
      </header>

      {/* Main 404 Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-md p-8 shadow-2xl space-y-6 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded bg-red-950/50 border border-red-800/60 text-red-400 text-xs font-mono font-semibold uppercase tracking-wider">
            HTTP 404 • Resource Not Found
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-3xl font-black text-white tracking-tight">
              Page Does Not Exist
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              The research dossier, project page, or portal endpoint you requested could not be located on the Salim Habib University ORIC system.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-4 py-2.5 rounded-md bg-red-600 hover:bg-red-500 text-white font-display font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-red-950/40 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to University Portal</span>
            </Link>
            <a
              href="mailto:oric@shu.edu.pk"
              className="px-4 py-2.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 font-semibold text-xs flex items-center justify-center gap-2 transition"
            >
              <Mail className="w-4 h-4 text-red-500" />
              <span>Contact ORIC Support</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-950 px-6 py-4 text-center text-xs text-zinc-500">
        © {currentYear} Salim Habib University (SHU) Office of Research, Innovation & Commercialization. All rights reserved.
      </footer>
    </div>
  );
}
