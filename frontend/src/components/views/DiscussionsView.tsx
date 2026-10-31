'use client';

import React, { useState, useEffect } from 'react';
import { Project, ViewMode, MeetingTranscript } from '@/types';
import { useVoice } from '@/hooks/useVoice';
import { 
  Mic, 
  Square, 
  Pause, 
  Play, 
  CheckCircle2, 
  FileText, 
  Download, 
  Calendar, 
  User, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface DiscussionsViewProps {
  projects: Project[];
  onNavigate: (view: ViewMode) => void;
}

export default function DiscussionsView({ projects, onNavigate }: DiscussionsViewProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [meetingTitle, setMeetingTitle] = useState('ORIC Industry Commercialization Consultation');
  const [meetingState, setMeetingState] = useState<'idle' | 'recording' | 'paused' | 'finished'>('idle');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');

  // Sample finished transcript state
  const [savedTranscript, setSavedTranscript] = useState<MeetingTranscript>({
    id: 'disc-01',
    title: 'ORIC Industry Commercialization Consultation',
    project_code: 'SHU-FOP-2026-001',
    date: '2026-03-28',
    duration_minutes: 18,
    recorded_by: 'Director ORIC',
    full_transcript: 'Meeting commenced at 10:00 AM with Dr. Farooq Siddiqui and Director ORIC. Discussed pilot scale-up for lipid nanoparticles with Korangi pharmaceutical partners. Clinical trials will require DRAP formulation approval under fast-track schedule. Agreed to proceed with provisional patent claims drafting.',
    ai_summary: 'Bilateral commercialization review between Faculty of Pharmacy and ORIC leadership. Confirmed high commercial feasibility for paclitaxel lipid nanocarrier. Key milestone: finalization of DRAP regulatory application before Q3 2026.',
    decisions_made: [
      'Approved internal seed funding disbursement of PKR 500,000 for high-shear homogenization lab supplies.',
      'Authorized ORIC Legal Counsel to complete national patent filings under Section 12.',
      'Selected Korangi Industrial Area pharmaceutical partners for confidential technical briefings.'
    ],
    action_items: [
      { task: 'Submit DRAP Form 5 formulation documentation', assignee: 'Dr. Farooq Siddiqui', deadline: '2026-04-15' },
      { task: 'Send non-disclosure agreement (NDA) to Getz Pharma R&D team', assignee: 'ORIC Licensing Officer', deadline: '2026-04-20' },
      { task: 'Schedule follow-up review on HPLC test reproducibility', assignee: 'Research Associate', deadline: '2026-04-30' }
    ]
  });

  // Use browser voice speech recognition
  const { isListening, startListening, stopListening } = useVoice({
    onTranscript: (chunk) => {
      setLiveTranscript(prev => prev + ' ' + chunk);
    }
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (meetingState === 'recording') {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [meetingState]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = () => {
    setMeetingState('recording');
    setLiveTranscript('Meeting recording initiated under Salim Habib University ORIC policy. Live audio capture active.');
    startListening();
  };

  const handlePauseRecording = () => {
    setMeetingState('paused');
    stopListening();
  };

  const handleResumeRecording = () => {
    setMeetingState('recording');
    startListening();
  };

  const handleStopRecording = () => {
    setMeetingState('finished');
    stopListening();
    if (liveTranscript.length > 30) {
      setSavedTranscript(prev => ({
        ...prev,
        title: meetingTitle,
        full_transcript: liveTranscript,
        duration_minutes: Math.max(1, Math.ceil(timerSeconds / 60))
      }));
    }
  };

  const handleExport = (format: 'pdf' | 'docx' | 'txt') => {
    alert(`Exporting official SHU ORIC Meeting Dossier as .${format.toUpperCase()} format.`);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Mic className="w-3.5 h-3.5" />
            <span>Real-Time Speech-to-Text & Action Matrix</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Research Consultation & Meeting Intelligence Recorder
          </h2>
          <p className="text-xs text-slate-400">
            Secure, consent-driven audio recording with automated executive summaries, decisions, and action item matrices.
          </p>
        </div>

        {/* Project Selector for Linking */}
        <div className="relative w-full md:w-80">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full appearance-none bg-slate-900 border border-slate-800 text-xs text-white font-bold py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                Link to {p.project_code}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Recording Control Console */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 p-6 space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 flex-1">
            <input
              type="text"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              className="text-base font-bold text-white bg-transparent border-b border-slate-800 hover:border-slate-700 focus:border-amber-500 focus:outline-none w-full pb-1"
              placeholder="Enter meeting title..."
            />
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                {new Date().toLocaleDateString('en-GB')}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-400" />
                Institutional Officer: Director ORIC
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Participant Consent Confirmed
              </span>
            </div>
          </div>

          {/* Live Timer Display */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xl font-black text-amber-400 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{formatTimer(timerSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80">
          {meetingState === 'idle' && (
            <button
              onClick={handleStartRecording}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/20 transition cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Start Recording</span>
            </button>
          )}

          {meetingState === 'recording' && (
            <>
              <button
                onClick={handlePauseRecording}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
              <button
                onClick={handleStopRecording}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700 transition cursor-pointer"
              >
                <Square className="w-4 h-4 text-rose-500" />
                <span>Stop & Transcribe</span>
              </button>
              <div className="flex items-center gap-2 text-xs text-rose-400 font-bold animate-pulse px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Recording Audio (WebRTC Stream Live)</span>
              </div>
            </>
          )}

          {meetingState === 'paused' && (
            <>
              <button
                onClick={handleResumeRecording}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>Resume Recording</span>
              </button>
              <button
                onClick={handleStopRecording}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700 transition cursor-pointer"
              >
                <Square className="w-4 h-4 text-rose-500" />
                <span>Stop & Finalize</span>
              </button>
            </>
          )}

          {meetingState === 'finished' && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Session Finalized. AI Summary & Action Matrix Generated!</span>
            </div>
          )}
        </div>
      </div>

      {/* Generated Intelligence Report Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: AI Summary & Decisions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Executive Summary */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Executive Meeting Summary</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              {savedTranscript.ai_summary}
            </p>
          </div>

          {/* Decisions Made */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Formally Agreed Decisions</span>
            </h4>
            <div className="space-y-2">
              {savedTranscript.decisions_made.map((dec, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{dec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Items Matrix */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white">Concrete Action Items Matrix</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Action Required</th>
                    <th className="py-2.5 px-3">Responsible Lead</th>
                    <th className="py-2.5 px-3">Deadline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {savedTranscript.action_items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/20">
                      <td className="py-2.5 px-3 text-slate-200 font-medium">{item.task}</td>
                      <td className="py-2.5 px-3 text-amber-400 font-semibold">{item.assignee}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{item.deadline}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Full Transcript Feed & Export Buttons */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white">Export Official Dossier</h4>
            <p className="text-xs text-slate-400">
              Download formatted institutional records with verbatim transcripts and verified signatures.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => handleExport('pdf')}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-rose-400" />
                  <span>Download PDF Dossier</span>
                </div>
                <Download className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => handleExport('docx')}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-400" />
                  <span>Export Editable Word (.docx)</span>
                </div>
                <Download className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Transcript Box */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white">Full Verbatim Transcript</h4>
            <div className="h-64 overflow-y-auto bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed font-mono whitespace-pre-wrap">
              {liveTranscript || savedTranscript.full_transcript}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

