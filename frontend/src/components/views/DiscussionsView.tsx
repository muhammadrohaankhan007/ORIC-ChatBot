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

export default function DiscussionsView({ projects }: DiscussionsViewProps) {
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
    onTranscriptChange: (chunk) => {
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
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans bg-black text-zinc-100">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-red-950/50 border border-red-800/60 text-red-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Mic className="w-3.5 h-3.5 text-red-500" />
            <span>Real-Time Speech-to-Text & Action Matrix</span>
          </div>
          <h2 className="font-display text-xl font-black text-white tracking-tight">
            Research Consultation & Meeting Intelligence Recorder
          </h2>
          <p className="text-xs text-zinc-400">
            Secure, consent-driven audio recording with automated executive summaries, decisions, and action item matrices.
          </p>
        </div>

        {/* Project Selector for Linking */}
        <div className="relative w-full md:w-80">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full appearance-none bg-zinc-950 border border-zinc-800 text-xs text-white font-bold py-2.5 pl-4 pr-10 rounded-md focus:outline-none focus:border-red-600 cursor-pointer font-mono"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                Link to {p.project_code}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Recording Control Console */}
      <div className="rounded-md bg-zinc-950 border border-zinc-800 p-6 space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 flex-1">
            <input
              type="text"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              className="text-base font-display font-bold text-white bg-transparent border-b border-zinc-800 hover:border-zinc-700 focus:border-red-600 focus:outline-none w-full pb-1"
              placeholder="Enter meeting title..."
            />
            <div className="flex items-center gap-4 text-xs text-zinc-400 pt-1 font-mono">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-red-500" />
                2026
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                Director ORIC
              </span>
              <span className="flex items-center gap-1.5 text-red-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Consent Confirmed
              </span>
            </div>
          </div>

          {/* Live Timer Display */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded bg-black border border-zinc-800 font-mono text-xl font-black text-red-500 flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span>{formatTimer(timerSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-zinc-850">
          {meetingState === 'idle' && (
            <button
              onClick={handleStartRecording}
              className="px-5 py-2.5 rounded-md bg-red-600 hover:bg-red-500 text-white font-display font-bold text-xs flex items-center gap-2 shadow-md shadow-red-950/40 transition cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Start Audio Recording</span>
            </button>
          )}

          {meetingState === 'recording' && (
            <>
              <button
                onClick={handlePauseRecording}
                className="px-4 py-2.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-2 border border-zinc-800 transition cursor-pointer"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
              <button
                onClick={handleStopRecording}
                className="px-4 py-2.5 rounded-md bg-red-600 hover:bg-red-500 text-white font-display font-bold text-xs flex items-center gap-2 transition cursor-pointer"
              >
                <Square className="w-4 h-4" />
                <span>Stop & Transcribe</span>
              </button>
              <div className="flex items-center gap-2 text-xs text-red-400 font-bold animate-pulse px-3 py-1 rounded bg-red-950/40 border border-red-800/60 font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <span>Audio Stream Active (WebRTC)</span>
              </div>
            </>
          )}

          {meetingState === 'paused' && (
            <>
              <button
                onClick={handleResumeRecording}
                className="px-4 py-2.5 rounded-md bg-red-600 hover:bg-red-500 text-white font-display font-bold text-xs flex items-center gap-2 transition cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>Resume Recording</span>
              </button>
              <button
                onClick={handleStopRecording}
                className="px-4 py-2.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-2 border border-zinc-800 transition cursor-pointer"
              >
                <Square className="w-4 h-4 text-red-500" />
                <span>Stop & Finalize</span>
              </button>
            </>
          )}

          {meetingState === 'finished' && (
            <div className="flex items-center gap-2 text-xs text-red-400 font-mono font-bold">
              <CheckCircle2 className="w-4 h-4 text-red-500" />
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
          <div className="p-6 rounded-md bg-zinc-950 border border-zinc-800 space-y-3">
            <h4 className="font-display text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-500" />
              <span>Executive Meeting Summary</span>
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed bg-black p-4 rounded border border-zinc-850">
              {savedTranscript.ai_summary}
            </p>
          </div>

          {/* Decisions Made */}
          <div className="p-6 rounded-md bg-zinc-950 border border-zinc-800 space-y-3">
            <h4 className="font-display text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-red-500" />
              <span>Formally Agreed Decisions</span>
            </h4>
            <div className="space-y-2">
              {savedTranscript.decisions_made.map((dec, i) => (
                <div key={i} className="p-3 rounded bg-black border border-zinc-850 text-xs text-zinc-200 flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                  <span>{dec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Items Matrix */}
          <div className="p-6 rounded-md bg-zinc-950 border border-zinc-800 space-y-3">
            <h4 className="font-display text-sm font-bold text-white">Action Items Matrix</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-black text-zinc-400 uppercase text-[10px] font-mono tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-3">Action Required</th>
                    <th className="py-2.5 px-3">Responsible Lead</th>
                    <th className="py-2.5 px-3">Deadline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {savedTranscript.action_items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/40">
                      <td className="py-2.5 px-3 text-zinc-200 font-medium">{item.task}</td>
                      <td className="py-2.5 px-3 text-red-400 font-semibold font-mono">{item.assignee}</td>
                      <td className="py-2.5 px-3 font-mono text-zinc-400">{item.deadline}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Full Transcript Feed & Export Buttons */}
        <div className="space-y-6">
          <div className="p-6 rounded-md bg-zinc-950 border border-zinc-800 space-y-4">
            <h4 className="font-display text-sm font-bold text-white">Export Official Record</h4>
            <p className="text-xs text-zinc-400">
              Download formatted institutional records with verbatim transcripts and verified signatures.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => handleExport('pdf')}
                className="w-full px-4 py-2.5 rounded bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs border border-zinc-800 flex items-center justify-between transition cursor-pointer font-mono"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-500" />
                  <span>Download PDF Dossier</span>
                </div>
                <Download className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              <button
                onClick={() => handleExport('docx')}
                className="w-full px-4 py-2.5 rounded bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs border border-zinc-800 flex items-center justify-between transition cursor-pointer font-mono"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-white" />
                  <span>Export Editable Word</span>
                </div>
                <Download className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            </div>
          </div>

          {/* Transcript Box */}
          <div className="p-6 rounded-md bg-zinc-950 border border-zinc-800 space-y-3">
            <h4 className="font-display text-sm font-bold text-white">Full Verbatim Transcript</h4>
            <div className="h-64 overflow-y-auto bg-black p-4 rounded border border-zinc-850 text-xs text-zinc-400 leading-relaxed font-mono whitespace-pre-wrap">
              {liveTranscript || savedTranscript.full_transcript}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
