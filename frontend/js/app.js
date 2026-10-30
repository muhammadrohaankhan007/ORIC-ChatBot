/* ==========================================================================
   SHU ORIC AI – Central Application Controller & State Manager
   ========================================================================== */

class OricApplication {
  constructor() {
    this.currentView = 'chat';
    this.activeProjectId = 'SHU-FOP-001';
    this.activeProject = null;
    this.allProjects = [];
    this.stats = {};
    this.chatMode = 'conversational'; // 'conversational' or 'research'
    this.chatHistory = [];
    this.ttsEnabled = true;
    this.isRecordingDiscussion = false;
    this.discussionTranscript = '';
  }

  async init() {
    console.log("Initializing SHU ORIC AI Platform...");

    // 1. Fetch Stats & Projects
    this.stats = await window.OricApi.getStats();
    const pData = await window.OricApi.getProjects(100, 0);
    this.allProjects = pData.projects || [];

    // Set initial project
    if (this.allProjects.length > 0) {
      this.activeProject = this.allProjects[0];
      this.activeProjectId = this.activeProject.id;
    } else {
      this.activeProject = await window.OricApi.getProject(this.activeProjectId);
    }

    // 2. Render initial layout & context panel
    this.updateContextPanel();
    this.navigate('chat');

    // Setup Enter key for chat
    const input = document.getElementById('chatTextInput');
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.sendMessage();
      });
    }

    console.log("SHU ORIC AI Ready.");
  }

  async selectProject(projectId) {
    this.activeProjectId = projectId;
    this.activeProject = await window.OricApi.getProject(projectId);
    this.updateContextPanel();

    // If on ERL or Reports view, re-render
    if (this.currentView === 'erl') {
      const erlData = await window.OricApi.getErl(this.activeProjectId);
      window.Views.renderErl(document.getElementById('centerViewContent'), erlData);
    } else if (this.currentView === 'reports') {
      window.Views.renderReports(document.getElementById('centerViewContent'), this.activeProject);
    }
  }

  updateContextPanel() {
    if (!this.activeProject) return;
    const p = this.activeProject;

    document.getElementById('ctxBadge').textContent = p.id;
    document.getElementById('ctxTitle').textContent = p.title;
    document.getElementById('ctxFaculty').textContent = p.facultyPI || 'Faculty Team';
    document.getElementById('ctxCourse').textContent = `${p.courseCode || ''} - ${p.courseTitle || ''}`;
    document.getElementById('ctxDomain').textContent = p.domain || 'Pharmaceutical Sciences';
    document.getElementById('ctxTrlBadge').textContent = `TRL ${p.commercialization?.trlLevel || 3}`;

    const market = p.marketSizing || {};
    document.getElementById('ctxMarket').textContent = `PKR ${market.tamPKR || '10,000'}M TAM / PKR ${market.somPKR || '300'}M SOM`;

    const matchedArea = p.matchedAreas?.[0]?.name || 'Korangi Industrial Area';
    document.getElementById('ctxArea').textContent = matchedArea;
  }

  setChatMode(mode) {
    this.chatMode = mode;
    document.getElementById('btnModeConv').classList.toggle('active', mode === 'conversational');
    document.getElementById('btnModeRes').classList.toggle('active', mode === 'research');
  }

  toggleTts() {
    this.ttsEnabled = !this.ttsEnabled;
    const btn = document.getElementById('btnToggleTts');
    if (btn) {
      btn.innerHTML = this.ttsEnabled 
        ? '<i class="fa-solid fa-volume-high"></i> Voice Output: ON' 
        : '<i class="fa-solid fa-volume-xmark"></i> Voice Output: OFF';
    }
    if (!this.ttsEnabled) window.VoiceController.stopSpeaking();
  }

  toggleMic() {
    const micBtn = document.getElementById('btnVoiceMic');
    window.VoiceController.toggleListening(
      (transcript) => {
        const input = document.getElementById('chatTextInput');
        if (input && transcript.final) {
          input.value = transcript.final;
          this.sendMessage();
        } else if (input && transcript.interim) {
          input.value = transcript.interim;
        }
      },
      (status) => {
        if (micBtn) {
          micBtn.classList.toggle('recording', status.listening);
        }
      }
    );
  }

  async sendMessage(customText = null) {
    const input = document.getElementById('chatTextInput');
    const text = customText || (input ? input.value.trim() : '');
    if (!text) return;

    if (input) input.value = '';

    // Switch to chat view if not already
    if (this.currentView !== 'chat') {
      this.navigate('chat');
    }

    // Append User Message
    this.appendMessage('user', text);

    // Call Central Orchestrator
    const res = await window.OricApi.sendChatMessage(
      text,
      this.activeProjectId,
      this.chatMode,
      this.chatHistory
    );

    // Append AI Message with Agent Tags & Citations
    this.appendMessage('assistant', res.answer, res.engagedAgents, res.citations);

    // Text-to-Speech playback if enabled
    if (this.ttsEnabled) {
      window.VoiceController.speak(res.answer);
    }
  }

  appendMessage(role, content, agents = [], citations = []) {
    const stream = document.getElementById('chatStreamBox');
    if (!stream) return;

    const row = document.createElement('div');
    row.className = `msg-row ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.innerHTML = role === 'assistant' ? '<i class="fa-solid fa-wand-magic-sparkles"></i>' : '<i class="fa-solid fa-user"></i>';

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';

    // Agent Badges for Assistant
    if (role === 'assistant' && agents && agents.length > 0) {
      const pillRow = document.createElement('div');
      pillRow.className = 'agent-pill-row';
      agents.forEach(a => {
        const tag = document.createElement('span');
        tag.className = 'agent-tag';
        tag.innerHTML = `<i class="fa-solid fa-microchip"></i> ${a}`;
        pillRow.appendChild(tag);
      });
      bubble.appendChild(pillRow);
    }

    // Message Body
    const bodyText = document.createElement('div');
    bodyText.innerHTML = this.formatMarkdown(content);
    bubble.appendChild(bodyText);

    // Citations for Research Mode
    if (citations && citations.length > 0) {
      const citeBox = document.createElement('div');
      citeBox.className = 'citations-box';
      citeBox.innerHTML = `<strong><i class="fa-solid fa-link"></i> Verified Citations & References:</strong><br/>`;
      citations.forEach(c => {
        const link = document.createElement('a');
        link.className = 'citation-chip';
        link.href = c.url || '#';
        link.target = '_blank';
        link.innerHTML = `<i class="fa-solid fa-arrow-up-right-from-square"></i> ${c.title || 'Academic Reference'} (${c.source || 'Journal'})`;
        citeBox.appendChild(link);
      });
      bubble.appendChild(citeBox);
    }

    row.appendChild(avatar);
    row.appendChild(bubble);
    stream.appendChild(row);
    stream.scrollTop = stream.scrollHeight;

    // Save to history
    this.chatHistory.push({ role, content });
  }

  formatMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/### (.*?)\n/g, '<h4 style="color:#0A2540; margin:10px 0 4px 0; font-family:\'Outfit\';">$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background:#E2E8F0; padding:1px 5px; border-radius:4px; font-size:0.85em;">$1</code>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
  }

  async navigate(viewName) {
    this.currentView = viewName;
    const content = document.getElementById('centerViewContent');
    const chatContainer = document.getElementById('chatViewContainer');

    // Update active nav link
    document.querySelectorAll('.nav-link-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    if (viewName === 'chat') {
      content.style.display = 'none';
      chatContainer.style.display = 'flex';
      return;
    }

    chatContainer.style.display = 'none';
    content.style.display = 'flex';

    if (viewName === 'dashboard') {
      window.Views.renderDashboard(content, this.stats, this.allProjects);
    } else if (viewName === 'explorer') {
      window.Views.renderExplorer(content, this.allProjects);
    } else if (viewName === 'erl') {
      const erlData = await window.OricApi.getErl(this.activeProjectId);
      window.Views.renderErl(content, erlData);
    } else if (viewName === 'graph') {
      const graphData = await window.OricApi.getGraphData();
      window.Views.renderGraph(content, graphData);
    } else if (viewName === 'discussions') {
      const dData = await window.OricApi.getDiscussions();
      window.Views.renderDiscussions(content, dData.discussions || []);
    } else if (viewName === 'reports') {
      window.Views.renderReports(content, this.activeProject);
    }
  }

  // Discussion Recording Session
  startRecordingSession() {
    this.isRecordingDiscussion = true;
    this.discussionTranscript = '';
    const box = document.getElementById('liveTranscriptBox');
    const status = document.getElementById('recStatusLabel');
    const btnStart = document.getElementById('btnRecStart');
    const btnStop = document.getElementById('btnRecStop');

    if (btnStart) btnStart.style.display = 'none';
    if (btnStop) btnStop.style.display = 'inline-flex';
    if (status) status.textContent = 'Recording in progress...';
    if (box) box.textContent = 'Listening...';

    window.VoiceController.startListening(
      (transcript) => {
        if (transcript.final) {
          this.discussionTranscript += (this.discussionTranscript ? ' ' : '') + transcript.final;
          if (box) box.textContent = this.discussionTranscript;
        } else if (transcript.interim && box) {
          box.textContent = this.discussionTranscript + ' ' + transcript.interim;
        }
      },
      (st) => {}
    );
  }

  async stopRecordingSession() {
    this.isRecordingDiscussion = false;
    window.VoiceController.stopListening();

    const btnStart = document.getElementById('btnRecStart');
    const btnStop = document.getElementById('btnRecStop');
    const status = document.getElementById('recStatusLabel');
    if (btnStart) btnStart.style.display = 'inline-flex';
    if (btnStop) btnStop.style.display = 'none';
    if (status) status.textContent = 'Generating AI minutes...';

    const title = document.getElementById('discTitleInput')?.value || 'ORIC Meeting';
    const text = this.discussionTranscript || 'Discussion regarding formulation optimization, DRAP filing timeline, and contract pilot batch production at Korangi Industrial Area.';

    // Generate AI Summary and Action Points
    const prompt = `Summarize this meeting and provide 3 key action items:\n\n${text}`;
    const aiRes = await window.OricApi.sendChatMessage(prompt, this.activeProjectId, 'conversational');

    const discId = `DISC-${Date.now().toString().slice(-6)}`;
    await window.OricApi.saveDiscussion({
      id: discId,
      title: title,
      projectId: this.activeProjectId,
      participants: "ORIC Commercialization Committee",
      fullTranscript: text,
      aiSummary: aiRes.answer.slice(0, 300) + '...',
      actionItems: ["File provisional patent with IPO-Pakistan", "Engage KATI Pharmaceutical Committee", "Submit HEC TDF grant application"]
    });

    alert("Discussion recorded, transcribed, and saved to database!");
    this.navigate('discussions');
  }

  downloadReport(format, projectId) {
    const url = window.OricApi.getReportDownloadUrl(format, projectId || this.activeProjectId);
    window.open(url, '_blank');
  }

  filterExplorer() {
    const query = document.getElementById('explorerSearchInput')?.value.toLowerCase() || '';
    const domain = document.getElementById('explorerDomainFilter')?.value || '';

    const filtered = this.allProjects.filter(p => {
      const matchQuery = !query || p.title.toLowerCase().includes(query) || (p.abstract && p.abstract.toLowerCase().includes(query)) || (p.facultyPI && p.facultyPI.toLowerCase().includes(query));
      const matchDomain = !domain || p.domain === domain;
      return matchQuery && matchDomain;
    });

    const container = document.getElementById('explorerGrid');
    if (container) {
      container.innerHTML = filtered.map(p => `
        <div class="context-card" style="cursor: pointer; display: flex; flex-direction: column; justify-content: space-between;" onclick="window.OricApp.selectProject('${p.id}')">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span class="context-id-badge">${p.id}</span>
              <span style="font-size: 0.72rem; font-weight: 700; color: #0D9488; background: #CCFBF1; padding: 2px 7px; border-radius: 10px;">
                TRL ${p.commercialization?.trlLevel || 3}
              </span>
            </div>
            <h4 style="font-family: 'Outfit'; font-size: 0.98rem; font-weight: 700; color: var(--shu-navy); margin-bottom: 6px; line-height: 1.35;">
              ${p.title}
            </h4>
            <p style="font-size: 0.78rem; color: #64748B; margin-bottom: 8px; line-height: 1.45; max-height: 52px; overflow: hidden; text-overflow: ellipsis;">
              ${p.abstract || 'No abstract summary provided.'}
            </p>
          </div>
          <div style="border-top: 1px solid #F1F5F9; padding-top: 10px; margin-top: 8px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.75rem; font-weight: 600; color: #475569;">
              <i class="fa-solid fa-user"></i> ${p.facultyPI || 'Faculty PI'}
            </span>
            <button class="prompt-chip-btn" onclick="event.stopPropagation(); window.OricApp.selectProject('${p.id}'); window.OricApp.navigate('chat');">
              AI Deep Dive <i class="fa-solid fa-sparkles"></i>
            </button>
          </div>
        </div>
      `).join('');
    }
  }
}

window.OricApp = new OricApplication();
window.addEventListener('DOMContentLoaded', () => {
  window.OricApp.init();
});
