/* ==========================================================================
   ORIC-IOAP Data Store & State Management
   Salim Habib University (SHU), Karachi
   ========================================================================== */

class OricDataStore {
  constructor() {
    this.projects = [];
    this.industrialAreas = [];
    this.sectors = [];
    this.evidence = [];
    this.stats = {};
    
    // Application Global State
    this.currency = 'PKR'; // 'PKR' or 'USD'
    this.exchangeRate = 280.0; // 1 USD = 280 PKR (dated SBP benchmark)
    this.currentRole = 'ORIC Director';
    this.activeProjectId = 'SHU-FOP-001';
    this.activeView = 'dashboard';
    
    // Filters State for Library
    this.filters = {
      searchQuery: '',
      course: '',
      domain: '',
      priority: '',
      trl: '',
      area: ''
    };

    // Listeners for state change
    this.subscribers = [];

    // Institutional Activity & Audit Logs
    this.auditLogs = [];
  }

  // Initialize data from window.ORIC_INITIAL_DATA or backend API
  async init() {
    console.log('Initializing ORIC Data Store...');
    
    // 1. Fallback / Baseline from preloaded data bundle
    if (window.ORIC_INITIAL_DATA) {
      this.projects = [...window.ORIC_INITIAL_DATA.projects];
      this.industrialAreas = [...window.ORIC_INITIAL_DATA.industrialAreas];
      this.sectors = [...window.ORIC_INITIAL_DATA.sectors];
      this.evidence = [...window.ORIC_INITIAL_DATA.evidence];
      this.stats = { ...window.ORIC_INITIAL_DATA.stats };
    }

    // 2. Try fetching latest data from backend REST API if available
    try {
      const statsRes = await fetch('/api/stats');
      if (statsRes.ok) {
        this.stats = await statsRes.json();
      }
      const projectsRes = await fetch('/api/projects');
      if (projectsRes.ok) {
        const pData = await projectsRes.json();
        if (pData.projects && pData.projects.length > 0) {
          this.projects = pData.projects;
          console.log(`Synced ${this.projects.length} projects with active backend API.`);
        }
      }
      const areasRes = await fetch('/api/industrial-areas');
      if (areasRes.ok) {
        this.industrialAreas = await areasRes.json();
      }
      const sectorsRes = await fetch('/api/sectors');
      if (sectorsRes.ok) {
        this.sectors = await sectorsRes.json();
      }
      const evidenceRes = await fetch('/api/evidence');
      if (evidenceRes.ok) {
        this.evidence = await evidenceRes.json();
      }
    } catch (err) {
      console.log('Backend API unreachable or running on static file:// protocol. Using preloaded client bundle.', err.message);
    }

    // Load any saved custom edits from localStorage
    this.loadLocalOverrides();
    this.loadAuditLogs();

    // Ensure active project ID is valid
    if (this.projects.length > 0 && !this.projects.some(p => p.id === this.activeProjectId)) {
      this.activeProjectId = this.projects[0].id;
    }

    this.notifySubscribers('init');
    return this;
  }

  // Currency formatting helper
  formatMoney(amountPKR, unitLabel = true) {
    if (amountPKR == null || isNaN(amountPKR)) return 'N/A';
    
    if (this.currency === 'USD') {
      const amountUSD = amountPKR / this.exchangeRate;
      if (amountUSD >= 1000000) {
        return `$${(amountUSD / 1000000).toFixed(2)} Billion USD`;
      } else if (amountUSD >= 1000) {
        return `$${(amountUSD / 1000).toFixed(2)} Million USD`;
      } else {
        return `$${amountUSD.toFixed(1)}K USD`;
      }
    } else {
      // PKR Default
      if (amountPKR >= 1000000) {
        return `PKR ${(amountPKR / 1000000).toFixed(2)} Trillion`;
      } else if (amountPKR >= 1000) {
        return `PKR ${(amountPKR / 1000).toFixed(2)} Billion`;
      } else {
        return `PKR ${amountPKR.toLocaleString()} Million`;
      }
    }
  }

  // Format simple unit price
  formatPrice(pkrVal) {
    if (pkrVal == null || isNaN(pkrVal)) return 'N/A';
    if (this.currency === 'USD') {
      return `$${(pkrVal / this.exchangeRate).toFixed(2)}`;
    }
    return `PKR ${pkrVal.toLocaleString()}`;
  }

  // Set currency and trigger redraw
  setCurrency(curr) {
    if (this.currency !== curr) {
      const old = this.currency;
      this.currency = curr;
      this.addAuditLog(this.currentRole, 'Currency Unit Toggle', 'Global Financial Metrics', `Switched from ${old} to ${curr} (Dated SBP benchmark 280 PKR/USD)`, 'standard');
      this.notifySubscribers('currency');
    }
  }

  // Set active role
  setRole(role) {
    if (this.currentRole !== role) {
      const old = this.currentRole;
      this.currentRole = role;
      this.addAuditLog(old, 'Role Switch', 'Active Institutional Session', `Role changed to ${role}`, 'purple');
      this.notifySubscribers('role');
    }
  }

  // Get current active project
  getActiveProject() {
    return this.projects.find(p => p.id === this.activeProjectId) || this.projects[0];
  }

  // Set active project by ID
  setActiveProject(id) {
    if (this.projects.some(p => p.id === id)) {
      this.activeProjectId = id;
      this.notifySubscribers('activeProject');
    }
  }

  // Filter projects based on current filter state
  getFilteredProjects() {
    const { searchQuery, course, domain, priority, trl, area } = this.filters;
    let list = [...this.projects];

    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.abstract && p.abstract.toLowerCase().includes(q)) ||
        (p.facultyPI && p.facultyPI.toLowerCase().includes(q)) ||
        (p.courseTitle && p.courseTitle.toLowerCase().includes(q)) ||
        (p.id && p.id.toLowerCase().includes(q))
      );
    }

    if (course) {
      list = list.filter(p => p.courseTitle === course || p.courseCode === course);
    }

    if (domain) {
      list = list.filter(p => p.domain === domain);
    }

    if (priority) {
      list = list.filter(p => p.commercialization && p.commercialization.priority === priority);
    }

    if (trl) {
      const trlNum = parseInt(trl, 10);
      list = list.filter(p => p.commercialization && p.commercialization.trlLevel === trlNum);
    }

    if (area) {
      list = list.filter(p => p.matchedAreas && p.matchedAreas.some(a => a.id === area || a.name === area));
    }

    return list;
  }

  // Update commercialization scores for a project
  updateProjectCommercialization(projectId, newScores, reviewerNotes = '', status = '') {
    const proj = this.projects.find(p => p.id === projectId);
    if (!proj) return false;

    if (!proj.commercialization) proj.commercialization = {};
    if (!proj.commercialization.criteriaScores) proj.commercialization.criteriaScores = {};

    Object.assign(proj.commercialization.criteriaScores, newScores);

    // Calculate new weighted score
    const c = proj.commercialization.criteriaScores;
    const weighted = +(
      (c.technicalFeasibility || 3) * 0.15 +
      (c.marketAttractiveness || 3) * 0.20 +
      (c.customerDemandEvidence || 3) * 0.15 +
      (c.trlScore || 3) * 0.10 +
      (c.intellectualProperty || 3) * 0.15 +
      (c.teamCapability || 3) * 0.05 +
      (c.scalability || 3) * 0.10 +
      (c.importSubstitution || 3) * 0.10
    ).toFixed(2);

    proj.commercialization.overallScore = weighted;
    proj.commercialization.priority = weighted >= 4.1 ? 'High Priority' : weighted >= 3.6 ? 'Medium Priority' : 'Standard Priority';

    if (weighted >= 4.2) {
      proj.commercialization.recommendation = 'Immediate Industry Collaboration & Licensing';
    } else if (weighted >= 3.8) {
      proj.commercialization.recommendation = 'Prototype Scale-Up & SHU Incubation';
    } else if (c.intellectualProperty >= 4.0) {
      proj.commercialization.recommendation = 'Patent Filing & Technology Transfer';
    } else {
      proj.commercialization.recommendation = 'Further Lab Validation & Contract Research';
    }

    if (reviewerNotes) {
      if (!proj.commercialization.reviewNotes) proj.commercialization.reviewNotes = [];
      proj.commercialization.reviewNotes.push({
        author: this.currentRole,
        date: new Date().toISOString().split('T')[0],
        notes: reviewerNotes,
        assignedStatus: status || proj.commercialization.recommendation
      });
    }

    this.saveLocalOverrides();
    this.addAuditLog(
      this.currentRole,
      'Commercial Scoring Evaluation',
      `${proj.id} - ${proj.title.substring(0, 32)}...`,
      `Overall Score: ${weighted} / 5.0 (${proj.commercialization.priority})`,
      'high'
    );
    this.notifySubscribers('projectUpdated');

    // Also attempt backend sync if available
    fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proj)
    }).catch(() => {});

    return true;
  }

  // Add new document / project from upload
  addProject(newProj) {
    this.projects.unshift(newProj);
    this.activeProjectId = newProj.id;
    this.saveLocalOverrides();
    this.addAuditLog(
      this.currentRole,
      'Document Ingestion & AI Pipeline',
      `${newProj.id} - ${newProj.title.substring(0, 32)}...`,
      'Analyzed via Google Gemini AI & Synchronized',
      'high'
    );
    this.notifySubscribers('projectAdded');
  }

  // Institutional Activity & Audit Log Manager
  addAuditLog(actor, action, target, result, badgeType = 'high') {
    const entry = {
      id: 'AUDIT-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: actor || this.currentRole || 'System',
      action: action || 'Operation',
      target: target || 'Repository Entity',
      result: result || 'Executed Successfully',
      badgeType: badgeType || 'high'
    };

    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 100) this.auditLogs.pop();
    this.saveAuditLogs();
    return entry;
  }

  loadAuditLogs() {
    try {
      const saved = localStorage.getItem('ORIC_IOAP_AUDIT_LOGS');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.auditLogs = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn('Could not load audit logs from localStorage', e);
    }

    // Default institutional seed logs
    this.auditLogs = [
      {
        id: 'AUDIT-SEED-01',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString().replace('T', ' ').substring(0, 19),
        actor: 'System Daemon',
        action: 'Dataset Repository Ingestion',
        target: '2026-10-21 - FoP LMS Projects and Groups - Fall 26.xlsx',
        result: '327 Records Processed & 233 Projects Clustered',
        badgeType: 'high'
      },
      {
        id: 'AUDIT-SEED-02',
        timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString().replace('T', ' ').substring(0, 19),
        actor: 'ORIC Intelligence Engine',
        action: 'Karachi Industrial Cluster Alignment',
        target: '10 Karachi Industrial Estates (KATI, LATI, SITE, FBATI, PQA...)',
        result: '100% Academic-Industrial Geographic Matching',
        badgeType: 'standard'
      },
      {
        id: 'AUDIT-SEED-03',
        timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString().replace('T', ' ').substring(0, 19),
        actor: 'ORIC Director',
        action: 'Google Gemini AI Model Verification',
        target: 'gemini-flash-lite-latest & gemini-3.5-flash',
        result: 'API Online & Cascade Latency ~0.8s Verified',
        badgeType: 'high'
      },
      {
        id: 'AUDIT-SEED-04',
        timestamp: new Date(Date.now() - 3600000 * 0.5).toISOString().replace('T', ' ').substring(0, 19),
        actor: 'Research Officer',
        action: 'Commercialization Scoring Review',
        target: 'SHU-FOP-001 (Effervescent Formulation)',
        result: 'Score 4.22 / 5.0 (High-Priority Deal)',
        badgeType: 'purple'
      }
    ];
    this.saveAuditLogs();
  }

  saveAuditLogs() {
    try {
      localStorage.setItem('ORIC_IOAP_AUDIT_LOGS', JSON.stringify(this.auditLogs));
    } catch (e) {
      console.warn('LocalStorage limit reached for audit logs', e);
    }
  }

  clearAuditLogs() {
    this.auditLogs = [];
    this.saveAuditLogs();
    this.notifySubscribers('auditCleared');
  }

  // Local storage backup for overrides
  saveLocalOverrides() {
    try {
      localStorage.setItem('ORIC_IOAP_LOCAL_PROJECTS', JSON.stringify(this.projects.slice(0, 50)));
    } catch (e) {
      console.warn('LocalStorage limit reached', e);
    }
  }

  loadLocalOverrides() {
    try {
      const saved = localStorage.getItem('ORIC_IOAP_LOCAL_PROJECTS');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach(p => {
            const idx = this.projects.findIndex(item => item.id === p.id);
            if (idx !== -1) {
              this.projects[idx] = p;
            } else {
              this.projects.unshift(p);
            }
          });
        }
      }
    } catch (e) {
      console.error('Failed to load local overrides', e);
    }
  }

  // Subscription pattern
  subscribe(callback) {
    this.subscribers.push(callback);
  }

  notifySubscribers(eventType) {
    this.subscribers.forEach(cb => {
      try { cb(eventType, this); } catch (e) { console.error('Error in subscriber', e); }
    });
  }
}

// Global singleton instance
window.oricStore = new OricDataStore();
