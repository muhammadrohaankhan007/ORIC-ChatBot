/* ==========================================================================
   ORIC-IOAP Main Application Controller & View Router
   Salim Habib University (SHU), Karachi, Pakistan
   ========================================================================== */

class OricApp {
  constructor() {
    this.currentView = 'dashboard';
    this.views = {
      dashboard: DashboardView,
      upload: UploadView,
      library: LibraryView,
      intelligence: IntelligenceView,
      products: ProductsView,
      industries: IndustriesView,
      karachi: KarachiView,
      forecasting: ForecastingView,
      commercialization: CommercializationView,
      reports: ReportsView,
      sources: SourcesView
    };

    this.viewTitles = {
      dashboard: { title: 'Executive Overview', breadcrumb: 'Overview' },
      upload: { title: 'Document Ingestion', breadcrumb: 'Ingestion Pipeline' },
      library: { title: 'Research Repository', breadcrumb: 'Document Library' },
      intelligence: { title: 'AI Intelligence Dossier', breadcrumb: 'Deep Intelligence' },
      products: { title: 'Products & Services', breadcrumb: 'Commercial Catalog' },
      industries: { title: 'Industry Applications', breadcrumb: 'Sectors & Taxonomy' },
      karachi: { title: 'Karachi Industrial Intelligence', breadcrumb: 'Karachi Clusters' },
      forecasting: { title: '5-Year Forecasts', breadcrumb: 'Financial Models' },
      commercialization: { title: 'Commercial Scoring', breadcrumb: 'Evaluations' },
      reports: { title: 'Institutional Reports', breadcrumb: 'PDF Reports' },
      sources: { title: 'Sources & Citations', breadcrumb: 'Evidence Registry' }
    };
  }

  init() {
    console.log('Bootstrapping ORIC-IOAP Platform for Salim Habib University...');

    // Subscribe to data store updates
    window.oricStore.subscribe((eventType, store) => {
      this.handleStoreEvent(eventType, store);
    });

    // Initialize data store
    window.oricStore.init().then(() => {
      this.renderCurrentView();
      this.updateHeaderState();
    });

    // Attach global keyboard shortcuts (Escape closes modals, etc.)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });
  }

  // View Navigation Router
  navigate(viewName, filterParams = null) {
    if (viewName === 'admin' || !this.views[viewName]) {
      viewName = 'dashboard';
    }

    if (filterParams) {
      Object.assign(window.oricStore.filters, filterParams);
    }

    this.currentView = viewName;
    window.oricStore.activeView = viewName;

    // Update active class in sidebar
    document.querySelectorAll('.nav-item').forEach(el => {
      if (el.getAttribute('data-view') === viewName) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Update topbar titles
    const meta = this.viewTitles[viewName] || { title: 'ORIC Platform', breadcrumb: 'ORIC' };
    const heading = document.getElementById('topbarPageHeading');
    const breadcrumb = document.getElementById('topbarPageBreadcrumb');
    if (heading) heading.textContent = meta.title;
    if (breadcrumb) breadcrumb.textContent = meta.breadcrumb;

    // Render view
    this.renderCurrentView();

    // Close mobile sidebar if open
    document.getElementById('appSidebar')?.classList.remove('mobile-open');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderCurrentView() {
    const viewContainer = document.getElementById('mainContentContainer');
    if (!viewContainer) return;

    // Render the active view component
    const view = this.views[this.currentView];
    if (view && typeof view.render === 'function') {
      view.render(viewContainer, window.oricStore);
    }
  }

  handleStoreEvent(eventType, store) {
    this.updateHeaderState();
    if (eventType === 'currency' || eventType === 'projectAdded' || eventType === 'dbImported') {
      this.renderCurrentView();
    }
  }

  updateHeaderState() {
    // Update currency buttons
    const pkrBtn = document.getElementById('currBtnPkr');
    const usdBtn = document.getElementById('currBtnUsd');
    if (pkrBtn && usdBtn) {
      if (window.oricStore.currency === 'PKR') {
        pkrBtn.classList.add('active');
        usdBtn.classList.remove('active');
      } else {
        usdBtn.classList.add('active');
        pkrBtn.classList.remove('active');
      }
    }

    // Update role select
    const roleSelect = document.getElementById('topbarRoleSelect');
    if (roleSelect) {
      roleSelect.value = window.oricStore.currentRole;
    }
    const roleLabel = document.getElementById('sidebarUserRole');
    if (roleLabel) {
      roleLabel.textContent = window.oricStore.currentRole;
    }

    // Update badge counts in sidebar
    const docBadge = document.getElementById('badgeDocCount');
    if (docBadge) {
      docBadge.textContent = window.oricStore.projects.length;
    }
    const dealBadge = document.getElementById('badgeDealsCount');
    if (dealBadge) {
      const deals = window.oricStore.projects.filter(p => p.commercialization && p.commercialization.priority === 'High Priority').length;
      dealBadge.textContent = deals;
    }
  }

  // Quick Action Shortcuts
  openProjectDossier(projectId) {
    window.oricStore.setActiveProject(projectId);
    this.navigate('intelligence');
  }

  openForecast(projectId) {
    window.oricStore.setActiveProject(projectId);
    this.navigate('forecasting');
  }

  openCommercialScoring(projectId) {
    window.oricStore.setActiveProject(projectId);
    this.navigate('commercialization');
  }

  openReportForProject(projectId) {
    window.oricStore.setActiveProject(projectId);
    this.navigate('reports');
  }

  // Mobile Sidebar Toggle
  toggleMobileSidebar() {
    const sidebar = document.getElementById('appSidebar');
    if (sidebar) {
      sidebar.classList.toggle('mobile-open');
    }
  }

  // Toast Notification System
  showToast(message, type = 'info') {
    let container = document.getElementById('oricToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'oricToastContainer';
      container.style.position = 'fixed';
      container.style.bottom = '24px';
      container.style.right = '24px';
      container.style.zIndex = '9999';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '10px';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.background = '#FFFFFF';
    toast.style.border = '1px solid var(--border-medium)';
    toast.style.borderRadius = 'var(--radius-md)';
    toast.style.padding = '12px 18px';
    toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '12px';
    toast.style.fontSize = '0.85rem';
    toast.style.fontWeight = '500';
    toast.style.color = 'var(--shu-navy)';
    toast.style.animation = 'fadeIn 200ms ease';

    let iconHtml = '<i class="fa-solid fa-info-circle text-primary"></i>';
    if (type === 'success') {
      toast.style.borderLeft = '4px solid var(--shu-emerald)';
      iconHtml = '<i class="fa-solid fa-circle-check" style="color: var(--shu-emerald);"></i>';
    } else if (type === 'warning') {
      toast.style.borderLeft = '4px solid var(--shu-amber)';
      iconHtml = '<i class="fa-solid fa-triangle-exclamation" style="color: var(--shu-amber);"></i>';
    } else if (type === 'error') {
      toast.style.borderLeft = '4px solid var(--shu-rose)';
      iconHtml = '<i class="fa-solid fa-circle-xmark" style="color: var(--shu-rose);"></i>';
    } else {
      toast.style.borderLeft = '4px solid var(--shu-blue-primary)';
    }

    toast.innerHTML = `${iconHtml} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 300ms ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  closeAllModals() {
    document.querySelectorAll('.oric-modal-backdrop').forEach(m => m.classList.remove('open'));
    this.closeAiCopilot();
  }

  // ================= ORIC AI COPILOT INTERACTIVE DRAWER ================= //
  openAiCopilot(projectId = null) {
    if (projectId) {
      window.oricStore.setActiveProject(projectId);
    }
    const proj = window.oricStore.getActiveProject();
    const drawer = document.getElementById('aiCopilotDrawer');
    if (!drawer) return;

    drawer.classList.add('open');
    const badge = document.getElementById('aiDrawerProjectBadge');
    if (badge && proj) {
      badge.textContent = `${proj.id}: ${proj.title.substring(0, 35)}...`;
    }

    const input = document.getElementById('aiCopilotInput');
    if (input) input.focus();
  }

  closeAiCopilot() {
    document.getElementById('aiCopilotDrawer')?.classList.remove('open');
  }

  async sendAiCopilotMessage(promptText = null) {
    const input = document.getElementById('aiCopilotInput');
    const question = promptText || (input ? input.value.trim() : '');
    if (!question) return;

    if (input && !promptText) input.value = '';

    const chatBody = document.getElementById('aiChatMessages');
    if (!chatBody) return;

    // Append user message
    const userMsg = document.createElement('div');
    userMsg.className = 'ai-message-bubble user';
    userMsg.textContent = question;
    chatBody.appendChild(userMsg);

    // Append assistant typing indicator
    const assistantMsg = document.createElement('div');
    assistantMsg.className = 'ai-message-bubble assistant';
    assistantMsg.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-teal"></i> <em>Google Gemini AI is synthesizing commercial intelligence...</em>';
    chatBody.appendChild(assistantMsg);
    chatBody.scrollTop = chatBody.scrollHeight;

    const proj = window.oricStore.getActiveProject();

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          projectId: proj ? proj.id : 'SHU-FOP-001'
        })
      });

      const data = await res.json();
      if (data.success && data.reply) {
        assistantMsg.innerHTML = this.formatMarkdown(data.reply);
      } else {
        assistantMsg.innerHTML = '<span style="color: #B91C1C;">AI service temporarily unavailable. Please verify API key in Administration.</span>';
      }
    } catch (err) {
      assistantMsg.innerHTML = `<span style="color: #1E3A8A;"><strong>ORIC Intelligence Note:</strong> ${this.formatMarkdown(this.generateOfflineCopilotReply(question, proj))}</span>`;
    }

    chatBody.scrollTop = chatBody.scrollHeight;
  }

  formatMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/^### (.*$)/gim, '<h4 style="font-family: var(--font-heading); font-size: 0.95rem; font-weight: 700; color: var(--shu-navy); margin: 8px 0 4px 0;">$1</h4>')
      .replace(/^## (.*$)/gim, '<h3 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 700; color: var(--shu-navy); margin: 10px 0 6px 0;">$1</h3>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/^\s*\*\s(.*$)/gim, '<li style="margin-left: 16px; margin-bottom: 4px;">$1</li>')
      .replace(/^\s*-\s(.*$)/gim, '<li style="margin-left: 16px; margin-bottom: 4px;">$1</li>')
      .replace(/\n\n/gim, '<div style="height: 8px;"></div>');
  }

  generateOfflineCopilotReply(question, proj) {
    return `For **${proj ? proj.title : 'this research initiative'}**, our commercial assessment recommends:
* **Target Cluster:** Connect with the Korangi Association of Trade & Industry (KATI) Pharmaceutical Standing Committee.
* **Licensing Partners:** Initiate confidential technical disclosure with leading local formulators (e.g., Getz Pharma, The Searle Company, Martin Dow).
* **Regulatory Compliance:** Submit preliminary safety and ICH Zone IVb stability dossiers under Drug Regulatory Authority of Pakistan (DRAP) Form-6 guidelines.
* **Funding:** Eligible for the Higher Education Commission (HEC) Technology Development Fund (TDF) grant up to PKR 14 Million.`;
  }
}

// Global App Instance
window.oricApp = new OricApp();

// Boot application upon DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.oricApp.init();
});
