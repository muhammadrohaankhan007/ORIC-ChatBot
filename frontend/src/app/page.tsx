'use client';

import React, { useState, useEffect } from 'react';
import { ViewMode, Project, Persona } from '@/types';
import { INITIAL_PROJECTS, INITIAL_PERSONAS, fetchHealth } from '@/services/api';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import DashboardView from '@/components/views/DashboardView';
import ChatView from '@/components/views/ChatView';
import ProjectsView from '@/components/views/ProjectsView';
import RadarView from '@/components/views/RadarView';
import ErlView from '@/components/views/ErlView';
import DiscussionsView from '@/components/views/DiscussionsView';
import ReportsView from '@/components/views/ReportsView';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [projects] = useState<Project[]>(INITIAL_PROJECTS);
  const [personas] = useState<Persona[]>(INITIAL_PERSONAS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [apiConnected, setApiConnected] = useState(false);
  const [voiceGlobalEnabled, setVoiceGlobalEnabled] = useState(true);

  useEffect(() => {
    // Check backend health
    fetchHealth()
      .then((res) => {
        setApiConnected(res.status === 'ok' || res.status === 'online-fallback');
      })
      .catch(() => {
        setApiConnected(false);
      });
  }, []);

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      {/* 1. Modern Left Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        projectCount={projects.length}
      />

      {/* 2. Main Central Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <Header
          currentView={currentView}
          apiConnected={apiConnected}
          voiceEnabled={voiceGlobalEnabled}
          onToggleVoice={() => setVoiceGlobalEnabled(prev => !prev)}
        />

        {/* View Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-900/60">
          {currentView === 'dashboard' && (
            <DashboardView
              projects={projects}
              onNavigate={setCurrentView}
              onSelectProjectForChat={setSelectedProject}
            />
          )}

          {currentView === 'chat' && (
            <ChatView
              personas={personas}
              projects={projects}
              selectedProject={selectedProject}
              onClearSelectedProject={() => setSelectedProject(null)}
              voiceGlobalEnabled={voiceGlobalEnabled}
            />
          )}

          {currentView === 'explorer' && (
            <ProjectsView
              projects={projects}
              onNavigate={setCurrentView}
              onSelectProjectForChat={setSelectedProject}
            />
          )}

          {currentView === 'radar' && (
            <RadarView
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'erl' && (
            <ErlView
              projects={projects}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'discussions' && (
            <DiscussionsView
              projects={projects}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'reports' && (
            <ReportsView
              projects={projects}
              onNavigate={setCurrentView}
            />
          )}
        </main>
      </div>
    </div>
  );
}
