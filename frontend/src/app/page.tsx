'use client';

import React, { useState, useEffect } from 'react';
import { ViewMode, Project, Persona } from '@/types';
import { INITIAL_PROJECTS, INITIAL_PERSONAS, fetchHealth, fetchProjects } from '@/services/api';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import HomeHeroView from '@/components/views/HomeHeroView';
import DashboardView from '@/components/views/DashboardView';
import ChatView from '@/components/views/ChatView';
import ProjectsView from '@/components/views/ProjectsView';
import RadarView from '@/components/views/RadarView';
import ErlView from '@/components/views/ErlView';
import DiscussionsView from '@/components/views/DiscussionsView';
import ReportsView from '@/components/views/ReportsView';
import VoiceAgentModal from '@/components/voice/VoiceAgentModal';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [personas] = useState<Persona[]>(INITIAL_PERSONAS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [apiConnected, setApiConnected] = useState(false);
  const [voiceGlobalEnabled, setVoiceGlobalEnabled] = useState(true);
  const [isVoiceAgentOpen, setIsVoiceAgentOpen] = useState(false);

  useEffect(() => {
    // Check backend health & fetch projects if backend is live
    fetchHealth()
      .then((res) => {
        setApiConnected(res.status === 'ok' || res.status === 'online-fallback');
      })
      .catch(() => {
        setApiConnected(false);
      });

    fetchProjects()
      .then((data) => {
        if (data && data.length > 0) {
          setProjects(data);
        }
      })
      .catch(() => {
        // Fallback already provided by INITIAL_PROJECTS
      });
  }, []);

  // 1. Standalone Institutional Public Website View
  if (currentView === 'home') {
    return (
      <>
        <HomeHeroView
          projects={projects}
          personas={personas}
          onNavigate={setCurrentView}
          onSelectProjectForChat={(project) => {
            setSelectedProject(project);
            setCurrentView('chat');
          }}
        />
        <VoiceAgentModal
          isOpen={isVoiceAgentOpen}
          onClose={() => setIsVoiceAgentOpen(false)}
          selectedProject={selectedProject}
          onSelectProject={setSelectedProject}
          projects={projects}
        />
      </>
    );
  }

  // 2. Executive Portal & Research Workspace Layout
  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 overflow-hidden font-sans relative">
      {/* Modern Left Sidebar with Clickable Logo to return home */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        projectCount={projects.length}
      />

      {/* Main Central Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-zinc-50">
        {/* Top Header Bar with Public Website shortcut & Voice Agent trigger */}
        <Header
          currentView={currentView}
          apiConnected={apiConnected}
          voiceEnabled={voiceGlobalEnabled}
          onToggleVoice={() => setVoiceGlobalEnabled((prev) => !prev)}
          onNavigate={setCurrentView}
          onOpenVoiceAgent={() => setIsVoiceAgentOpen(true)}
        />

        {/* View Content Area */}
        <main className="flex-1 overflow-y-auto bg-zinc-50">
          {currentView === 'dashboard' && (
            <DashboardView
              projects={projects}
              onNavigate={setCurrentView}
              onSelectProjectForChat={(project) => {
                setSelectedProject(project);
                setCurrentView('chat');
              }}
            />
          )}

          {currentView === 'chat' && (
            <ChatView
              personas={personas}
              projects={projects}
              selectedProject={selectedProject}
              onClearSelectedProject={() => setSelectedProject(null)}
              voiceGlobalEnabled={voiceGlobalEnabled}
              onOpenVoiceAgent={() => setIsVoiceAgentOpen(true)}
            />
          )}

          {currentView === 'explorer' && (
            <ProjectsView
              projects={projects}
              onNavigate={setCurrentView}
              onSelectProjectForChat={(project) => {
                setSelectedProject(project);
                setCurrentView('chat');
              }}
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

      {/* Real-Time Duplex Voice Agent Modal */}
      <VoiceAgentModal
        isOpen={isVoiceAgentOpen}
        onClose={() => setIsVoiceAgentOpen(false)}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        projects={projects}
      />
    </div>
  );
}
