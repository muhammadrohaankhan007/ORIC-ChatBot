/* ==========================================================================
   ORIC-IOAP View: Dashboard
   Salim Habib University (SHU), Karachi
   ========================================================================== */

const DashboardView = {
  charts: {},

  render(container, store) {
    const stats = store.stats || {};
    const projects = store.projects || [];
    const highPriorityProjects = projects.filter(p => p.commercialization && (p.commercialization ? p.commercialization.priority : 'High Priority') === 'High Priority');
    
    // Calculate total TAM
    const totalTAM = projects.reduce((acc, p) => acc + (p.marketSizing ? p.marketSizing.tamPKR : 0), 0);

    container.innerHTML = `
      <div class="view-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: var(--shu-navy);">
            Executive Intelligence & Opportunity Overview
          </h2>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            Office of Research, Innovation & Commercialization (ORIC) — Salim Habib University (SHU), Karachi
          </p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-primary" onclick="window.oricApp.navigate('upload')">
            <i class="fa-solid fa-cloud-arrow-up"></i> Upload Documents
          </button>
          <button class="btn btn-navy" onclick="window.oricApp.navigate('reports')">
            <i class="fa-solid fa-file-pdf"></i> Generate Portfolio Report
          </button>
        </div>
      </div>

      <!-- Institutional Alert Banner -->
      <div style="background: #F0F9FF; border: 1px solid #BAE6FD; border-radius: var(--radius-md); padding: 14px 18px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 36px; height: 36px; background: #0284C7; color: #FFFFFF; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: 1rem;">
            <i class="fa-solid fa-graduation-cap"></i>
          </div>
          <div>
            <div style="font-weight: 700; color: var(--shu-navy); font-size: 0.92rem;">
              Faculty of Pharmacy (FoP) — Fall 2026 Innovation Exhibition Repository Active
            </div>
            <div style="font-size: 0.78rem; color: var(--text-secondary);">
              Loaded <strong>${projects.length} research projects</strong> across 19 specialized pharmacy and pharmaceutical technology domains mapped to Karachi's industrial estates.
            </div>
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <span class="badge badge-high"><i class="fa-solid fa-circle-check"></i> Verified Data</span>
          <span class="badge badge-standard"><i class="fa-solid fa-building-columns"></i> SHU Academic Portal</span>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="kpi-grid">
        <div class="kpi-card kpi-blue">
          <div class="kpi-header">
            <span class="kpi-label">Research Projects</span>
            <div class="kpi-icon-wrap"><i class="fa-solid fa-file-lines"></i></div>
          </div>
          <div class="kpi-value">${projects.length}</div>
          <div class="kpi-subtext"><i class="fa-solid fa-check-double text-teal"></i> 100% Analyzed from FoP LMS</div>
        </div>

        <div class="kpi-card kpi-teal">
          <div class="kpi-header">
            <span class="kpi-label">Addressable Market</span>
            <div class="kpi-icon-wrap"><i class="fa-solid fa-chart-line"></i></div>
          </div>
          <div class="kpi-value">${store.formatMoney(totalTAM)}</div>
          <div class="kpi-subtext"><i class="fa-solid fa-arrow-trend-up text-emerald"></i> Pakistan & Sindh Healthcare TAM</div>
        </div>

        <div class="kpi-card kpi-emerald">
          <div class="kpi-header">
            <span class="kpi-label">Commercial Products</span>
            <div class="kpi-icon-wrap"><i class="fa-solid fa-box-open"></i></div>
          </div>
          <div class="kpi-value">${projects.reduce((acc, p) => acc + (p.products ? p.products.length : 0), 0)}</div>
          <div class="kpi-subtext"><i class="fa-solid fa-pills"></i> Spun-off dosage & consumer forms</div>
        </div>

        <div class="kpi-card kpi-amber">
          <div class="kpi-header">
            <span class="kpi-label">High-Priority Deals</span>
            <div class="kpi-icon-wrap"><i class="fa-solid fa-star"></i></div>
          </div>
          <div class="kpi-value">${highPriorityProjects.length}</div>
          <div class="kpi-subtext"><i class="fa-solid fa-bolt text-amber"></i> Commercialization score &ge; 4.10</div>
        </div>

        <div class="kpi-card kpi-purple">
          <div class="kpi-header">
            <span class="kpi-label">Industrial Estates</span>
            <div class="kpi-icon-wrap"><i class="fa-solid fa-city"></i></div>
          </div>
          <div class="kpi-value">10 Zones</div>
          <div class="kpi-subtext"><i class="fa-solid fa-location-dot"></i> KATI, LATI, SITE, FBATI & more</div>
        </div>
      </div>

      <!-- Charts 2-Column Row -->
      <div class="charts-grid-2col">
        <div class="oric-card">
          <div class="oric-card-header">
            <div class="card-title-group">
              <div class="card-title-icon"><i class="fa-solid fa-chart-pie"></i></div>
              <div>
                <div class="card-title">Research Domains & Formulations</div>
                <div class="card-subtitle">Distribution of university innovations across pharmaceutical sectors</div>
              </div>
            </div>
            <span class="badge badge-standard">19 Courses</span>
          </div>
          <div class="oric-card-body">
            <div class="chart-container-box">
              <canvas id="chartDomainsDoughnut"></canvas>
            </div>
          </div>
        </div>

        <div class="oric-card">
          <div class="oric-card-header">
            <div class="card-title-group">
              <div class="card-title-icon"><i class="fa-solid fa-industry"></i></div>
              <div>
                <div class="card-title">Karachi Industrial Area Opportunities</div>
                <div class="card-subtitle">Number of matched SHU research projects per industrial zone</div>
              </div>
            </div>
            <span class="badge badge-standard">Karachi Corridor</span>
          </div>
          <div class="oric-card-body">
            <div class="chart-container-box">
              <canvas id="chartKarachiEstatesBar"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- High Priority Innovation Spotlight -->
      <div class="oric-card">
        <div class="oric-card-header">
          <div class="card-title-group">
            <div class="card-title-icon" style="background: #FEF3C7; color: #B45309;"><i class="fa-solid fa-fire"></i></div>
            <div>
              <div class="card-title">Top High-Priority Commercialization Opportunities</div>
              <div class="card-subtitle">Evaluated on technical feasibility, market demand, import substitution & local manufacturer fit</div>
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.oricApp.navigate('library', { priority: 'High Priority' })">
            View All (${highPriorityProjects.length}) <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
        <div class="oric-card-body">
          <div class="spotlight-grid">
            ${highPriorityProjects.slice(0, 4).map(p => `
              <div class="spotlight-card">
                <div class="spotlight-badge-row">
                  <span class="badge badge-high">${(p.commercialization ? p.commercialization.priority : 'High Priority')}</span>
                  <span style="font-size: 0.75rem; font-weight: 700; color: var(--shu-blue-primary);">TRL ${(p.commercialization ? p.commercialization.trlLevel : 3)}</span>
                </div>
                <div class="spotlight-title">${p.title}</div>
                <div class="spotlight-desc">${p.abstract}</div>
                <div style="font-size: 0.78rem; color: var(--text-muted);">
                  <strong>Supervisor:</strong> ${p.facultyPI}
                </div>
                <div class="spotlight-meta-row">
                  <div>
                    <span style="font-weight: 700; color: var(--shu-navy);">${store.formatMoney((p.marketSizing ? p.marketSizing.somPKR : 100))}</span>
                    <span style="font-size: 0.7rem;"> (SOM)</span>
                  </div>
                  <button class="btn btn-sm btn-primary" onclick="window.oricApp.openProjectDossier('${p.id}')">
                    Inspect AI Dossier <i class="fa-solid fa-angle-right"></i>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Quick Action Navigation Bar -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-top: 10px;">
        <div style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 16px; cursor: pointer; display: flex; align-items: center; gap: 14px;" onclick="window.oricApp.navigate('karachi')">
          <div style="width: 42px; height: 42px; border-radius: var(--radius-sm); background: #E0F2FE; color: #0284C7; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
            <i class="fa-solid fa-map-location-dot"></i>
          </div>
          <div>
            <div style="font-weight: 700; color: var(--shu-navy); font-size: 0.92rem;">Karachi Industrial Hub</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">10 verified industrial zones</div>
          </div>
        </div>

        <div style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 16px; cursor: pointer; display: flex; align-items: center; gap: 14px;" onclick="window.oricApp.navigate('forecasting')">
          <div style="width: 42px; height: 42px; border-radius: var(--radius-sm); background: #CCFBF1; color: #0D9488; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
            <i class="fa-solid fa-arrow-trend-up"></i>
          </div>
          <div>
            <div style="font-weight: 700; color: var(--shu-navy); font-size: 0.92rem;">5-Year CAGR Models</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">2026-2031 Growth scenarios</div>
          </div>
        </div>

        <div style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 16px; cursor: pointer; display: flex; align-items: center; gap: 14px;" onclick="window.oricApp.navigate('commercialization')">
          <div style="width: 42px; height: 42px; border-radius: var(--radius-sm); background: #FEF3C7; color: #B45309; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
            <i class="fa-solid fa-award"></i>
          </div>
          <div>
            <div style="font-weight: 700; color: var(--shu-navy); font-size: 0.92rem;">Commercial Scoring</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">8-Criteria multi-factor matrix</div>
          </div>
        </div>

        <div style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 16px; cursor: pointer; display: flex; align-items: center; gap: 14px;" onclick="window.oricApp.navigate('reports')">
          <div style="width: 42px; height: 42px; border-radius: var(--radius-sm); background: #F3E8FF; color: #7E22CE; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
            <i class="fa-solid fa-file-invoice"></i>
          </div>
          <div>
            <div style="font-weight: 700; color: var(--shu-navy); font-size: 0.92rem;">Reports A through H</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Exportable official PDF briefs</div>
          </div>
        </div>
      </div>
    `;

    // Render Chart.js charts
    this.renderCharts(projects, store);
  },

  renderCharts(projects, store) {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded yet');
      return;
    }

    // Destroy existing charts to prevent canvas memory leaks
    if (this.charts.domains) this.charts.domains.destroy();
    if (this.charts.karachi) this.charts.karachi.destroy();

    // 1. Domain breakdown data
    const domainCounts = {};
    projects.forEach(p => {
      const d = p.domain || 'Other';
      domainCounts[d] = (domainCounts[d] || 0) + 1;
    });

    const domainLabels = Object.keys(domainCounts);
    const domainValues = Object.values(domainCounts);

    const ctx1 = document.getElementById('chartDomainsDoughnut')?.getContext('2d');
    if (ctx1) {
      this.charts.domains = new Chart(ctx1, {
        type: 'doughnut',
        data: {
          labels: domainLabels,
          datasets: [{
            data: domainValues,
            backgroundColor: [
              '#0284C7', '#0D9488', '#10B981', '#F59E0B', '#8B5CF6',
              '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#06B6D4'
            ],
            borderWidth: 2,
            borderColor: '#FFFFFF'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                boxWidth: 12,
                font: { size: 10, family: "'Inter', sans-serif" }
              }
            }
          },
          cutout: '65%'
        }
      });
    }

    // 2. Karachi Industrial Area Matching data
    const areaCounts = {
      "Korangi Industrial Area": 0,
      "S.I.T.E. Industrial Area": 0,
      "Landhi Industrial Area": 0,
      "Federal B Area": 0,
      "North Karachi": 0,
      "Port Qasim": 0,
      "KEPZ": 0
    };

    projects.forEach(p => {
      if (p.matchedAreas) {
        p.matchedAreas.forEach(a => {
          if (a.name.includes("Korangi")) areaCounts["Korangi Industrial Area"]++;
          else if (a.name.includes("S.I.T.E.")) areaCounts["S.I.T.E. Industrial Area"]++;
          else if (a.name.includes("Landhi")) areaCounts["Landhi Industrial Area"]++;
          else if (a.name.includes("Federal B")) areaCounts["Federal B Area"]++;
          else if (a.name.includes("North Karachi")) areaCounts["North Karachi"]++;
          else if (a.name.includes("Port Qasim")) areaCounts["Port Qasim"]++;
          else if (a.name.includes("Export Processing")) areaCounts["KEPZ"]++;
        });
      }
    });

    const ctx2 = document.getElementById('chartKarachiEstatesBar')?.getContext('2d');
    if (ctx2) {
      this.charts.karachi = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: Object.keys(areaCounts),
          datasets: [{
            label: 'Matched Research Projects',
            data: Object.values(areaCounts),
            backgroundColor: '#0A2540',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              beginAtZero: true,
              grid: { color: '#F1F5F9' },
              ticks: { font: { size: 10 } }
            },
            y: {
              grid: { display: false },
              ticks: { font: { size: 10, weight: '600' } }
            }
          }
        }
      });
    }
  }
};
