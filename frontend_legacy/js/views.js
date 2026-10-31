/* ==========================================================================
   SHU ORIC AI – View Components & Interactive Renderers
   ========================================================================== */

const Views = {
  // 1. DASHBOARD VIEW
  renderDashboard(container, stats, projects) {
    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <h1 style="font-family: 'Outfit', sans-serif; font-size: 1.6rem; font-weight: 700; color: var(--shu-navy); margin-bottom: 4px;">
          Institutional Innovation & Commercialization Dashboard
        </h1>
        <p style="color: var(--shu-text-secondary); font-size: 0.88rem;">
          Salim Habib University (SHU), Karachi | Office of Research, Innovation & Commercialization (ORIC)
        </p>
      </div>

      <!-- KPI Stat Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div class="context-card" style="border-left: 4px solid #0284C7;">
          <div style="font-size: 0.75rem; text-transform: uppercase; color: #64748B; font-weight: 700;">Total Projects</div>
          <div style="font-family: 'Outfit'; font-size: 1.8rem; font-weight: 800; color: #0A2540; margin: 4px 0;">${stats.totalProjects || 233}</div>
          <div style="font-size: 0.75rem; color: #0284C7; font-weight: 600;"><i class="fa-solid fa-database"></i> Verified Academic Innovations</div>
        </div>

        <div class="context-card" style="border-left: 4px solid #0D9488;">
          <div style="font-size: 0.75rem; text-transform: uppercase; color: #64748B; font-weight: 700;">Research Domains</div>
          <div style="font-family: 'Outfit'; font-size: 1.8rem; font-weight: 800; color: #0A2540; margin: 4px 0;">${stats.totalDomains || 11}</div>
          <div style="font-size: 0.75rem; color: #0D9488; font-weight: 600;"><i class="fa-solid fa-flask"></i> NDDS, Phytomedicine, Biotech</div>
        </div>

        <div class="context-card" style="border-left: 4px solid #F59E0B;">
          <div style="font-size: 0.75rem; text-transform: uppercase; color: #64748B; font-weight: 700;">Karachi Industrial Areas</div>
          <div style="font-family: 'Outfit'; font-size: 1.8rem; font-weight: 800; color: #0A2540; margin: 4px 0;">${stats.totalIndustrialAreas || 10}</div>
          <div style="font-size: 0.75rem; color: #F59E0B; font-weight: 600;"><i class="fa-solid fa-city"></i> Korangi, Landhi, SITE, Port Qasim</div>
        </div>

        <div class="context-card" style="border-left: 4px solid #10B981;">
          <div style="font-size: 0.75rem; text-transform: uppercase; color: #64748B; font-weight: 700;">Faculty PIs & Mentors</div>
          <div style="font-family: 'Outfit'; font-size: 1.8rem; font-weight: 800; color: #0A2540; margin: 4px 0;">${stats.totalFaculty || 22}</div>
          <div style="font-size: 0.75rem; color: #10B981; font-weight: 600;"><i class="fa-solid fa-user-graduate"></i> Multi-Disciplinary Leads</div>
        </div>
      </div>

      <!-- High Priority Candidates Table -->
      <div class="context-card" style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <h3 style="font-family: 'Outfit'; font-size: 1.15rem; font-weight: 700; color: var(--shu-navy);">
              Top Commercialization & Industry Candidates
            </h3>
            <p style="font-size: 0.78rem; color: #64748B;">Projects with verified market sizing and matched enterprise targets.</p>
          </div>
          <button class="send-msg-btn" onclick="window.OricApp.navigate('explorer')">
            View All ${stats.totalProjects || 233} Projects <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>

        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.84rem;">
            <thead>
              <tr style="background-color: #F8FAFC; border-bottom: 2px solid #E2E8F0; text-align: left;">
                <th style="padding: 10px 12px; color: #475569;">ID</th>
                <th style="padding: 10px 12px; color: #475569;">Project Title</th>
                <th style="padding: 10px 12px; color: #475569;">Domain</th>
                <th style="padding: 10px 12px; color: #475569;">TRL</th>
                <th style="padding: 10px 12px; color: #475569;">SOM (PKR M)</th>
                <th style="padding: 10px 12px; color: #475569;">Matched Area</th>
                <th style="padding: 10px 12px; color: #475569; text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${projects.slice(0, 6).map(p => `
                <tr style="border-bottom: 1px solid #E2E8F0; cursor: pointer;" onclick="window.OricApp.selectProject('${p.id}')">
                  <td style="padding: 12px; font-weight: 700; color: #0284C7;">${p.id}</td>
                  <td style="padding: 12px; font-weight: 600; color: #0F172A; max-width: 320px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.title}</td>
                  <td style="padding: 12px; color: #475569;">${p.domain}</td>
                  <td style="padding: 12px;"><span style="background: #E0F2FE; color: #0369A1; padding: 2px 8px; border-radius: 12px; font-weight: 700; font-size: 0.72rem;">TRL ${p.commercialization?.trlLevel || 3}</span></td>
                  <td style="padding: 12px; font-weight: 700; color: #0D9488;">PKR ${p.marketSizing?.somPKR || '300'}M</td>
                  <td style="padding: 12px; color: #334155;">${p.matchedAreas?.[0]?.name || 'Korangi Industrial Area'}</td>
                  <td style="padding: 12px; text-align: right;">
                    <button class="prompt-chip-btn" onclick="event.stopPropagation(); window.OricApp.selectProject('${p.id}'); window.OricApp.navigate('chat');">
                      Analyze <i class="fa-solid fa-wand-magic-sparkles"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // 2. PROJECT EXPLORER VIEW
  renderExplorer(container, projects) {
    container.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h1 style="font-family: 'Outfit'; font-size: 1.5rem; font-weight: 700; color: var(--shu-navy); margin-bottom: 4px;">
          SHU ORIC Project Knowledge Repository
        </h1>
        <p style="color: var(--shu-text-secondary); font-size: 0.85rem;">
          Comprehensive repository of all 233 university research projects, clinical formulations, and technology assets.
        </p>
      </div>

      <div style="display: flex; gap: 12px; margin-bottom: 18px;">
        <input type="text" id="explorerSearchInput" placeholder="Search by title, formulation, faculty PI, or course code..." style="flex: 1; padding: 10px 14px; border: 1px solid var(--shu-border); border-radius: 8px; font-size: 0.88rem;">
        <select id="explorerDomainFilter" style="padding: 10px 14px; border: 1px solid var(--shu-border); border-radius: 8px; font-size: 0.85rem; background: #fff;">
          <option value="">All Domains</option>
          <option value="Novel Drug Delivery Systems (NDDS)">Novel Drug Delivery Systems (NDDS)</option>
          <option value="Phytomedicine & Natural Product Valorization">Phytomedicine & Natural Products</option>
          <option value="Cosmeceuticals & Dermatological Science">Cosmeceuticals & Dermatological</option>
          <option value="Biomaterials & Advanced Wound Therapeutics">Biomaterials & Wound Care</option>
          <option value="Pharmaceutical Quality Control & Analytical Methods">Quality Control & Analytical</option>
        </select>
        <button class="send-msg-btn" onclick="window.OricApp.filterExplorer()"><i class="fa-solid fa-filter"></i> Apply Filter</button>
      </div>

      <div id="explorerGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px;">
        ${projects.map(p => `
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
        `).join('')}
      </div>
    `;
  },

  // 3. ERL 8-DIMENSION VIEW
  renderErl(container, erlData) {
    container.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h1 style="font-family: 'Outfit'; font-size: 1.5rem; font-weight: 700; color: var(--shu-navy); margin-bottom: 4px;">
          Entrepreneurship Readiness Level (ERL) Assessment
        </h1>
        <p style="color: var(--shu-text-secondary); font-size: 0.85rem;">
          Rigorous 8-dimension evaluation benchmarking university research against commercial deployment standards.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <!-- Left: Overall Score & Radar Matrix -->
        <div class="context-card" style="padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <div>
              <span class="context-id-badge">${erlData.projectId}</span>
              <h3 style="font-family: 'Outfit'; font-size: 1.1rem; font-weight: 700; color: var(--shu-navy);">
                ${erlData.projectTitle}
              </h3>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 0.72rem; color: #64748B; font-weight: 700;">COMPOSITE ERL</div>
              <div style="font-family: 'Outfit'; font-size: 2.2rem; font-weight: 800; color: #0284C7; line-height: 1;">
                ${erlData.overallErl} <span style="font-size: 1rem; color: #94A3B8;">/ 9.0</span>
              </div>
            </div>
          </div>

          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px 14px; margin-bottom: 16px;">
            <div style="font-size: 0.78rem; font-weight: 700; color: #0A2540;">CURRENT STAGE: ${erlData.stageName}</div>
            <div style="font-size: 0.75rem; color: #0D9488; font-weight: 600;">Status: ${erlData.actionStatus}</div>
          </div>

          <!-- Dimension Score Progress Bars -->
          <div>
            ${erlData.dimensions.map(d => `
              <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 600; margin-bottom: 4px;">
                  <span>${d.name}</span>
                  <span style="color: #0284C7;">${d.score} / 9.0</span>
                </div>
                <div style="height: 7px; background: #E2E8F0; border-radius: 4px; overflow: hidden;">
                  <div style="width: ${(d.score / 9.0) * 100}%; height: 100%; background: linear-gradient(90deg, #0284C7, #0D9488); border-radius: 4px;"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Right: Bottlenecks & Strategic Interventions -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div class="context-card" style="border-left: 4px solid #EF4444; padding: 18px;">
            <div style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: #DC2626; margin-bottom: 10px;">
              <i class="fa-solid fa-triangle-exclamation"></i> Identified Commercialization Bottlenecks
            </div>
            <ul style="padding-left: 20px; font-size: 0.82rem; color: #334155; line-height: 1.6;">
              ${erlData.bottlenecks.map(b => `<li>${b}</li>`).join('')}
            </ul>
          </div>

          <div class="context-card" style="border-left: 4px solid #10B981; padding: 18px;">
            <div style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: #059669; margin-bottom: 10px;">
              <i class="fa-solid fa-list-check"></i> Recommended Interventions to Advance to ERL 6+
            </div>
            <ul style="padding-left: 20px; font-size: 0.82rem; color: #334155; line-height: 1.6;">
              ${erlData.interventions.map(i => `<li>${i}</li>`).join('')}
            </ul>
          </div>

          <button class="send-msg-btn" style="padding: 12px; justify-content: center; font-size: 0.9rem;" onclick="window.OricApp.downloadReport('pdf', '${erlData.projectId}')">
            <i class="fa-solid fa-file-pdf"></i> Download Official ERL Assessment Dossier (PDF)
          </button>
        </div>
      </div>
    `;
  },

  // 4. KNOWLEDGE GRAPH VIEW
  renderGraph(container, graphData) {
    container.innerHTML = `
      <div style="margin-bottom: 18px;">
        <h1 style="font-family: 'Outfit'; font-size: 1.5rem; font-weight: 700; color: var(--shu-navy); margin-bottom: 4px;">
          Multi-Disciplinary Knowledge Graph & Synergies
        </h1>
        <p style="color: var(--shu-text-secondary); font-size: 0.85rem;">
          Relational mapping between SHU academic research, formulations, Karachi industrial clusters, and enterprise targets.
        </p>
      </div>

      <div class="context-card" style="padding: 16px;">
        <div style="display: flex; gap: 16px; margin-bottom: 12px; font-size: 0.78rem; font-weight: 600;">
          <span style="display: flex; align-items: center; gap: 6px;"><span style="width: 12px; height: 12px; border-radius: 50%; background: #0284C7; display: inline-block;"></span> Projects</span>
          <span style="display: flex; align-items: center; gap: 6px;"><span style="width: 12px; height: 12px; border-radius: 50%; background: #0D9488; display: inline-block;"></span> Technologies</span>
          <span style="display: flex; align-items: center; gap: 6px;"><span style="width: 12px; height: 12px; border-radius: 50%; background: #F59E0B; display: inline-block;"></span> Industrial Areas</span>
          <span style="display: flex; align-items: center; gap: 6px;"><span style="width: 12px; height: 12px; border-radius: 50%; background: #10B981; display: inline-block;"></span> Target Enterprises</span>
        </div>
        <canvas id="kgCanvas" width="900" height="520" style="width: 100%; height: 520px; background: #061727; border-radius: 8px;"></canvas>
      </div>
    `;

    // Draw interactive graph nodes & links on canvas
    setTimeout(() => {
      const canvas = document.getElementById('kgCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Center Node: SHU ORIC
      const centerX = w / 2;
      const centerY = h / 2;

      // Draw connections & nodes
      const nodes = [
        { label: "SHU ORIC Ecosystem", x: centerX, y: centerY, color: "#38BDF8", r: 24 },
        { label: "Novel Drug Delivery (NDDS)", x: centerX - 240, y: centerY - 120, color: "#0D9488", r: 16 },
        { label: "Phytomedicine & Botanicals", x: centerX + 240, y: centerY - 120, color: "#0D9488", r: 16 },
        { label: "Biomaterials & Wound Care", x: centerX - 260, y: centerY + 100, color: "#0D9488", r: 16 },
        { label: "Cosmeceuticals Science", x: centerX + 260, y: centerY + 100, color: "#0D9488", r: 16 },
        { label: "Korangi Industrial Area", x: centerX - 360, y: centerY - 40, color: "#F59E0B", r: 18 },
        { label: "S.I.T.E. Industrial Estate", x: centerX + 360, y: centerY - 40, color: "#F59E0B", r: 18 },
        { label: "The Searle Company Ltd", x: centerX - 380, y: centerY - 180, color: "#10B981", r: 14 },
        { label: "Getz Pharma Pvt Ltd", x: centerX - 180, y: centerY - 200, color: "#10B981", r: 14 },
        { label: "Martin Dow Ltd", x: centerX + 380, y: centerY - 180, color: "#10B981", r: 14 },
        { label: "Engro Polymers / Port Qasim", x: centerX, y: centerY + 200, color: "#F59E0B", r: 16 }
      ];

      // Draw edges
      ctx.lineWidth = 1.5;
      for (let i = 1; i < nodes.length; i++) {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(nodes[i].x, nodes[i].y);
        ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
        ctx.stroke();
      }

      // Draw nodes
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "11px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(n.label, n.x, n.y + n.r + 15);
      });
    }, 100);
  },

  // 5. DISCUSSION HUB & MEETING RECORDER VIEW
  renderDiscussions(container, discussions) {
    container.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h1 style="font-family: 'Outfit'; font-size: 1.5rem; font-weight: 700; color: var(--shu-navy); margin-bottom: 4px;">
          Discussion Recording, Live Transcription & AI Minutes
        </h1>
        <p style="color: var(--shu-text-secondary); font-size: 0.85rem;">
          Record commercialization consultations, faculty meetings, and industrial dialogues with real-time speech transcription and action point extraction.
        </p>
      </div>

      <!-- Live Recorder Panel -->
      <div class="recorder-box">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 0.75rem; text-transform: uppercase; color: #38BDF8; font-weight: 700; letter-spacing: 0.05em;">
              ORIC LIVE CONSULTATION RECORDER
            </div>
            <div style="font-family: 'Outfit'; font-size: 1.3rem; font-weight: 700;">
              Meeting Audio Session
            </div>
          </div>
          <div style="display: flex; gap: 10px;">
            <button id="btnRecStart" class="send-msg-btn" style="background: #10B981;" onclick="window.OricApp.startRecordingSession()">
              <i class="fa-solid fa-microphone"></i> Start Recording
            </button>
            <button id="btnRecStop" class="send-msg-btn" style="background: #EF4444; display: none;" onclick="window.OricApp.stopRecordingSession()">
              <i class="fa-solid fa-stop"></i> Stop & Generate Minutes
            </button>
          </div>
        </div>

        <div style="margin-top: 16px;">
          <label style="font-size: 0.75rem; color: #94A3B8;">Consultation Title</label>
          <input type="text" id="discTitleInput" value="ORIC Commercialization Committee - Project Review" style="width: 100%; padding: 8px 12px; margin-top: 4px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: #fff; font-size: 0.88rem;">
        </div>

        <div style="margin-top: 14px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: #94A3B8; margin-bottom: 4px;">
            <span>Live Audio Stream Transcription</span>
            <span id="recStatusLabel" style="color: #10B981;">Ready</span>
          </div>
          <div id="liveTranscriptBox" style="min-height: 90px; max-height: 180px; overflow-y: auto; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 12px; font-size: 0.88rem; line-height: 1.5; color: #F1F5F9;">
            Click "Start Recording" and speak into your microphone in English or Urdu. The speech-to-text engine will transcribe your meeting in real-time.
          </div>
        </div>
      </div>

      <!-- Past Discussions List -->
      <div class="context-card" style="padding: 20px;">
        <h3 style="font-family: 'Outfit'; font-size: 1.15rem; font-weight: 700; color: var(--shu-navy); margin-bottom: 14px;">
          Saved Discussions & Institutional Transcripts
        </h3>
        <div id="discussionsListContainer">
          ${discussions && discussions.length > 0 ? discussions.map(d => `
            <div style="border-bottom: 1px solid #E2E8F0; padding: 12px 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <h4 style="font-size: 0.92rem; font-weight: 700; color: #0A2540;">${d.title}</h4>
                <span style="font-size: 0.72rem; color: #64748B;">${new Date(d.createdAt).toLocaleDateString()}</span>
              </div>
              <p style="font-size: 0.8rem; color: #475569; margin-bottom: 6px;">${d.aiSummary}</p>
              <div style="display: flex; gap: 8px;">
                <span style="font-size: 0.7rem; background: #E0F2FE; color: #0284C7; padding: 2px 6px; border-radius: 4px; font-weight: 600;">
                  ${d.actionItems?.length || 0} Action Items
                </span>
              </div>
            </div>
          `).join('') : '<p style="font-size: 0.84rem; color: #64748B;">No recorded discussions saved yet. Use the recorder above to record your first session.</p>'}
        </div>
      </div>
    `;
  },

  // 6. REPORTS & EXPORTS VIEW
  renderReports(container, project) {
    const pid = project?.id || 'SHU-FOP-001';
    container.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h1 style="font-family: 'Outfit'; font-size: 1.5rem; font-weight: 700; color: var(--shu-navy); margin-bottom: 4px;">
          Production Report Generation & Downloads
        </h1>
        <p style="color: var(--shu-text-secondary); font-size: 0.85rem;">
          Export publication-grade research, financial forecasting, and commercialization assessment dossiers.
        </p>
      </div>

      <div class="context-card" style="margin-bottom: 20px; padding: 20px;">
        <span class="context-id-badge">${pid}</span>
        <h3 style="font-family: 'Outfit'; font-size: 1.15rem; font-weight: 700; color: var(--shu-navy); margin-bottom: 6px;">
          ${project?.title || 'Selected Research Innovation'}
        </h3>
        <p style="font-size: 0.82rem; color: #64748B;">Faculty PI: ${project?.facultyPI || 'Faculty Team'}</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
        <!-- PDF Report -->
        <div class="context-card" style="border-top: 4px solid #EF4444; padding: 20px;">
          <div style="font-size: 2rem; color: #EF4444; margin-bottom: 8px;"><i class="fa-solid fa-file-pdf"></i></div>
          <h4 style="font-family: 'Outfit'; font-size: 1.1rem; font-weight: 700; color: #0A2540;">Executive Assessment (PDF)</h4>
          <p style="font-size: 0.8rem; color: #64748B; margin: 8px 0 16px 0;">Official institutional dossier with DRAP regulatory roadmap, TRL score, and partner targets.</p>
          <a class="action-quick-btn" style="text-decoration: none; justify-content: center; background: #EF4444; color: #fff; border: none;" href="${window.OricApi.getReportDownloadUrl('pdf', pid)}" target="_blank">
            <i class="fa-solid fa-download"></i> Download PDF
          </a>
        </div>

        <!-- Word Report -->
        <div class="context-card" style="border-top: 4px solid #0284C7; padding: 20px;">
          <div style="font-size: 2rem; color: #0284C7; margin-bottom: 8px;"><i class="fa-solid fa-file-word"></i></div>
          <h4 style="font-family: 'Outfit'; font-size: 1.1rem; font-weight: 700; color: #0A2540;">Full Assessment (DOCX)</h4>
          <p style="font-size: 0.8rem; color: #64748B; margin: 8px 0 16px 0;">Editable Microsoft Word report with full research abstract, methodology, and commercial terms.</p>
          <a class="action-quick-btn" style="text-decoration: none; justify-content: center; background: #0284C7; color: #fff; border: none;" href="${window.OricApi.getReportDownloadUrl('docx', pid)}" target="_blank">
            <i class="fa-solid fa-download"></i> Download Word (.docx)
          </a>
        </div>

        <!-- Excel Report -->
        <div class="context-card" style="border-top: 4px solid #10B981; padding: 20px;">
          <div style="font-size: 2rem; color: #10B981; margin-bottom: 8px;"><i class="fa-solid fa-file-excel"></i></div>
          <h4 style="font-family: 'Outfit'; font-size: 1.1rem; font-weight: 700; color: #0A2540;">Financial Model (XLSX)</h4>
          <p style="font-size: 0.8rem; color: #64748B; margin: 8px 0 16px 0;">5-year quantitative multi-scenario forecasting model with TAM/SAM/SOM and unit sales.</p>
          <a class="action-quick-btn" style="text-decoration: none; justify-content: center; background: #10B981; color: #fff; border: none;" href="${window.OricApi.getReportDownloadUrl('xlsx', pid)}" target="_blank">
            <i class="fa-solid fa-download"></i> Download Excel (.xlsx)
          </a>
        </div>
      </div>
    `;
  }
};

window.Views = Views;
