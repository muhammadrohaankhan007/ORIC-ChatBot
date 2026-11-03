'use client';

import React, { useState, useEffect } from 'react';
import { ViewMode, Project, Persona, CurrencyMode } from '@/types';
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
import DataSourcesView from '@/components/sources/DataSourcesView';
import DocumentIngestionView from '@/components/upload/DocumentIngestionView';
import IntelligenceDossierModal from '@/components/dossier/IntelligenceDossierModal';
import VoiceAgentModal from '@/components/voice/VoiceAgentModal';

/**
 * Strictly deduplicate research projects by unique ID and unique title.
 * Automatically remediates duplicate IDs (e.g., from parallel uploads or legacy localStorage)
 * by generating unique fallback IDs.
 */
function deduplicateProjects(list: Project[]): Project[] {
  const seenIds = new Set<string>();
  const seenTitles = new Set<string>();
  const unique: Project[] = [];

  for (const proj of list) {
    if (!proj) continue;
    const cleanTitle = (proj.title || '').trim().toLowerCase();
    let id = (proj.id || '').trim();

    // If duplicate or missing ID, give it a guaranteed unique ID
    if (!id || seenIds.has(id)) {
      id = `proj-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    // Skip duplicate items sharing the exact same title
    if (cleanTitle && seenTitles.has(cleanTitle)) {
      continue;
    }

    if (cleanTitle) seenTitles.add(cleanTitle);
    seenIds.add(id);

    unique.push({ ...proj, id });
  }

  return unique;
}

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [projects, setProjects] = useState<Project[]>(() => deduplicateProjects(INITIAL_PROJECTS));
  const [personas] = useState<Persona[]>(INITIAL_PERSONAS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeDossierProject, setActiveDossierProject] = useState<Project | null>(null);
  const [currency, setCurrency] = useState<CurrencyMode>('PKR');
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
          setProjects((prev) => deduplicateProjects([...prev, ...data]));
        }
      })
      .catch(() => {
        // Fallback already provided by INITIAL_PROJECTS
      });

    // Restore currency preference from localStorage
    try {
      const savedCurrency = localStorage.getItem('shu_oric_currency') as CurrencyMode;
      if (savedCurrency === 'PKR' || savedCurrency === 'USD') {
        setCurrency(savedCurrency);
      }
    } catch (e) {
      // Ignore localStorage read error
    }

    // Restore user-uploaded projects from persistent localStorage and clean any corrupted duplicate keys
    try {
      const cached = localStorage.getItem('shu_oric_custom_projects');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitizedCached = deduplicateProjects(parsed);
          localStorage.setItem('shu_oric_custom_projects', JSON.stringify(sanitizedCached));

          setProjects((prev) => {
            const combined = [...sanitizedCached, ...prev];
            return deduplicateProjects(combined);
          });
        }
      }
    } catch (e) {
      console.warn('Could not load custom projects from localStorage', e);
    }
  }, []);

  const handleToggleCurrency = () => {
    setCurrency((prev) => {
      const next = prev === 'PKR' ? 'USD' : 'PKR';
      try {
        localStorage.setItem('shu_oric_currency', next);
      } catch (e) {
        // Ignore
      }
      return next;
    });
  };

  const handleAddProjects = (newProjects: Project[]) => {
    setProjects((prev) => {
      const uniqueNew = deduplicateProjects(newProjects);
      const combined = deduplicateProjects([...uniqueNew, ...prev]);

      if (typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem('shu_oric_custom_projects');
          const existingCached = cached ? JSON.parse(cached) : [];
          const combinedCached = deduplicateProjects([...uniqueNew, ...existingCached]);
          localStorage.setItem('shu_oric_custom_projects', JSON.stringify(combinedCached));
        } catch (e) {
          console.warn('Could not persist custom projects:', e);
        }
      }
      return combined;
    });
  };

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
          onOpenVoiceAgentForProject={(project) => {
            setSelectedProject(project);
            setIsVoiceAgentOpen(true);
          }}
        />
        <VoiceAgentModal
          isOpen={isVoiceAgentOpen}
          onClose={() => setIsVoiceAgentOpen(false)}
          selectedProject={selectedProject}
          onSelectProject={setSelectedProject}
          projects={projects}
        />
        <IntelligenceDossierModal
          isOpen={activeDossierProject !== null}
          onClose={() => setActiveDossierProject(null)}
          project={activeDossierProject}
          allProjects={projects}
          onSelectProject={setActiveDossierProject}
          currency={currency}
          onAskCopilot={(p) => {
            setSelectedProject(p);
            setCurrentView('chat');
          }}
          onGenerateReport={(p) => {
            setSelectedProject(p);
            setCurrentView('reports');
          }}
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
        {/* Top Header Bar with Currency switcher & Voice Agent trigger */}
        <Header
          currentView={currentView}
          apiConnected={apiConnected}
          voiceEnabled={voiceGlobalEnabled}
          onToggleVoice={() => setVoiceGlobalEnabled((prev) => !prev)}
          onNavigate={setCurrentView}
          onOpenVoiceAgent={() => setIsVoiceAgentOpen(true)}
          currency={currency}
          onToggleCurrency={handleToggleCurrency}
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
              onOpenDossier={(project) => setActiveDossierProject(project)}
              currency={currency}
              onToggleCurrency={handleToggleCurrency}
            />
          )}

          {currentView === 'chat' && (
            <ChatView
              personas={personas}
              projects={projects}
              selectedProject={selectedProject}
              onSelectProject={setSelectedProject}
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
              onOpenVoiceAgentForProject={(project) => {
                setSelectedProject(project);
                setIsVoiceAgentOpen(true);
              }}
              onAddProjects={handleAddProjects}
              onOpenDossier={(project) => setActiveDossierProject(project)}
              currency={currency}
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
              currency={currency}
            />
          )}

          {currentView === 'sources' && (
            <DataSourcesView
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'upload' && (
            <DocumentIngestionView
              onAddProjects={handleAddProjects}
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

      {/* Deep AI Intelligence Dossier Modal (6 Sub-Tabs) */}
      <IntelligenceDossierModal
        isOpen={activeDossierProject !== null}
        onClose={() => setActiveDossierProject(null)}
        project={activeDossierProject}
        allProjects={projects}
        onSelectProject={setActiveDossierProject}
        currency={currency}
        onAskCopilot={(p) => {
          setSelectedProject(p);
          setCurrentView('chat');
        }}
        onGenerateReport={(p) => {
          setSelectedProject(p);
          setCurrentView('reports');
        }}
      />
    </div>
  );
}
