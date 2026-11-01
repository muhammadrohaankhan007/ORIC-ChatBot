'use client';

import React, { useState, useEffect } from 'react';
import { Project, ViewMode } from '@/types';
import { useVoice } from '@/hooks/useVoice';
import { 
  Mic, 
  Square, 
  Pause, 
  Play, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  User, 
  ShieldCheck, 
  ChevronDown
} from 'lucide-react';

interface DiscussionsViewProps {
  projects: Project[];
  onNavigate?: (view: ViewMode) => void;
}

export default function DiscussionsView({ projects, onNavigate }: DiscussionsViewProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [meetingState, setMeetingState] = useState<'idle' | 'recording' | 'paused' | 'finished'>('idle');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [meetingTitle, setMeetingTitle] = useState('ORIC Bilateral Commercialization Advisory Session');
  const [liveTranscript, setLiveTranscript] = useState('');

  // Structured Meeting Intelligence
  const [savedTranscript, setSavedTranscript] = useState({
    title: 'Executive Advisory Session: Transdermal Formulations',
    date: '2026-03-30',
    participants: ['Dr. Farooq Siddiqui (PI)', 'Director ORIC', 'Commercialization Associate'],
    summary: 'The consultation addressed clinical formulation stability data for candidate SHU-FOP-2026-001. Discussion evaluated pilot-scale manufacturing bottlenecks with Korangi industrial partners, DRAP licensing requirements, and IP disclosure timelines.',
    keyDecisions: [
      'Advance transdermal nano-carrier formulation into 100-batch replication trial.',
      'Submit provisional patent disclosure to IPO Pakistan via SHU ORIC Directorate.',
      'Formalize NDA with Getz Pharma and Artistic Milliners R&D divisions.'
    ],
    actionItems: [
      { task: 'Submit DRAP Form 5 formulation documentation', assignee: 'Research Lead', deadline: '2026-04-15' },
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

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
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
        summary: `Session finalized. Transcript: ${liveTranscript.slice(0, 240)}... Decisions and action items cataloged.`
      }));
    }
  };

  const handleExport = (format: 'pdf' | 'docx') => {
    alert(`Exporting official SHU ORIC Meeting Dossier as .${format.toUpperCase()} format.`);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans bg-zinc-50 min-h-screen text-zinc-900">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold font-display text-zinc-900 tracking-tight">
            Meeting Transcriptions & Action Summaries
          </h2>
          <p className="text-xs text-zinc-500">
            Audio recording with automatic action items, decisions, and institutional records
          </p>
        </div>

        {/* Project Selector */}
        <div className="relative w-full md:w-80">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full appearance-none bg-white border border-zinc-200 text-xs text-zinc-900 font-semibold py-2.5 pl-3.5 pr-10 rounded-lg focus:outline-hidden focus:border-zinc-400 shadow-xs cursor-pointer"
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
      <div className="rounded-lg bg-white border border-zinc-200 p-6 space-y-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 flex-1">
            <input
              type="text"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              className="text-base font-bold text-zinc-900 bg-transparent border-b border-zinc-200 hover:border-zinc-300 focus:border-red-600 focus:outline-hidden w-full pb-1"
              placeholder="Enter meeting title..."
            />
            <div className="flex items-center gap-4 text-xs text-zinc-500 pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-red-600" />
                2026
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                ORIC Directorate
              </span>
              <span className="flex items-center gap-1.5 text-zinc-700 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Consent Confirmed
              </span>
            </div>
          </div>

          {/* Timer Display */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-lg font-bold text-red-600 flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span>{formatTimer(timerSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-zinc-100">
          {meetingState === 'idle' && (
            <button
              onClick={handleStartRecording}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Start Recording</span>
            </button>
          )}

          {meetingState === 'recording' && (
            <>
              <button
                onClick={handlePauseRecording}
                className="px-3.5 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-medium text-xs flex items-center gap-1.5 border border-zinc-200 transition cursor-pointer"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
              <button
                onClick={handleStopRecording}
                className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Square className="w-4 h-4" />
                <span>Stop & Transcribe</span>
              </button>
              <div className="flex items-center gap-2 text-xs text-red-700 font-semibold px-3 py-1 rounded-md bg-red-50 border border-red-200">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <span>Recording in progress</span>
              </div>
            </>
          )}

          {meetingState === 'paused' && (
            <>
              <button
                onClick={handleResumeRecording}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>Resume Recording</span>
              </button>
              <button
                onClick={handleStopRecording}
                className="px-3.5 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-medium text-xs flex items-center gap-1.5 border border-zinc-200 transition cursor-pointer"
              >
                <Square className="w-4 h-4 text-red-600" />
                <span>Finalize</span>
              </button>
            </>
          )}

          {meetingState === 'finished' && (
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Session Finalized. Executive Summary and Action Matrix Recorded.</span>
            </div>
          )}
        </div>
      </div>

      {/* Generated Intelligence Report Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Summary & Decisions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Executive Summary */}
          <div className="p-6 rounded-lg bg-white border border-zinc-200 space-y-3 shadow-xs">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-600" />
              <span>Executive Meeting Summary</span>
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              {savedTranscript.summary}
            </p>
          </div>

          {/* Key Decisions Taken */}
          <div className="p-6 rounded-lg bg-white border border-zinc-200 space-y-3 shadow-xs">
            <h3 className="text-sm font-bold text-zinc-900">Key Institutional Decisions</h3>
            <div className="space-y-2">
              {savedTranscript.keyDecisions.map((dec, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-zinc-700">
                  <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{dec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Action Items & Export */}
        <div className="space-y-6">
          <div className="p-6 rounded-lg bg-white border border-zinc-200 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-zinc-900">Action Item Matrix</h3>
            <div className="space-y-3">
              {savedTranscript.actionItems.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1.5 text-xs">
                  <div className="font-semibold text-zinc-900">{item.task}</div>
                  <div className="flex items-center justify-between text-zinc-500 text-[11px]">
                    <span>Assignee: <strong className="text-zinc-700">{item.assignee}</strong></span>
                    <span>Due: {item.deadline}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-zinc-100 flex items-center gap-2">
              <button
                onClick={() => handleExport('pdf')}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs transition shadow-xs text-center"
              >
                Export PDF
              </button>
              <button
                onClick={() => handleExport('docx')}
                className="flex-1 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium text-xs border border-zinc-200 transition text-center"
              >
                Export Word
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
