/* ==========================================================================
   SHU ORIC AI – Client API Gateway Layer
   ========================================================================== */

const API_BASE = window.location.origin;

const OricApi = {
  async getStats() {
    try {
      const res = await fetch(`${API_BASE}/api/stats`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API error, using cached stats:', e);
    }
    return {
      totalProjects: 233,
      totalDomains: 11,
      totalFaculty: 22,
      totalIndustrialAreas: 10,
      totalDiscussions: 0,
      institution: "Salim Habib University (SHU), Karachi",
      department: "Office of Research, Innovation & Commercialization (ORIC)"
    };
  },

  async getProjects(limit = 100, offset = 0, domain = '', search = '') {
    try {
      const q = new URLSearchParams({ limit, offset });
      if (domain) q.append('domain', domain);
      if (search) q.append('search', search);
      const res = await fetch(`${API_BASE}/api/projects?${q.toString()}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API error fetching projects:', e);
    }
    return { total: 0, projects: [] };
  },

  async getProject(projectId) {
    try {
      const res = await fetch(`${API_BASE}/api/projects/${encodeURIComponent(projectId)}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn(`API error fetching project ${projectId}:`, e);
    }
    return null;
  },

  async sendChatMessage(message, projectId, mode = 'conversational', history = []) {
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, projectId, mode, history })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('Chat API request failed:', e);
    }
    return {
      answer: "Communication error connecting to backend intelligence server. Please ensure FastAPI is running.",
      engagedAgents: ["Central Orchestrator"],
      citations: []
    };
  },

  async getErl(projectId) {
    const res = await fetch(`${API_BASE}/api/erl/${encodeURIComponent(projectId)}`);
    return await res.json();
  },

  async getForecast(projectId, horizon = 5) {
    const res = await fetch(`${API_BASE}/api/forecast/${encodeURIComponent(projectId)}?horizon=${horizon}`);
    return await res.json();
  },

  async getGraphData() {
    const res = await fetch(`${API_BASE}/api/graph/data`);
    return await res.json();
  },

  async getSynergies(projectId) {
    const res = await fetch(`${API_BASE}/api/graph/synergies/${encodeURIComponent(projectId)}`);
    return await res.json();
  },

  async getIndustrialAreas() {
    const res = await fetch(`${API_BASE}/api/industrial-areas`);
    return await res.json();
  },

  async saveDiscussion(payload) {
    const res = await fetch(`${API_BASE}/api/discussions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async getDiscussions() {
    const res = await fetch(`${API_BASE}/api/discussions`);
    return await res.json();
  },

  getReportDownloadUrl(format, projectId, type = 'assessment') {
    return `${API_BASE}/api/reports/download/${format}/${encodeURIComponent(projectId)}?report_type=${type}`;
  }
};

window.OricApi = OricApi;
