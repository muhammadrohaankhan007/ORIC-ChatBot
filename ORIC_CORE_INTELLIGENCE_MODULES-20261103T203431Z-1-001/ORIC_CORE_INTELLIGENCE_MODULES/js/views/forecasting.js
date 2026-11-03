/* ==========================================================================
   ORIC-IOAP View: Five-Year Growth Forecasting & Market Sizing
   Salim Habib University (SHU), Karachi
   ========================================================================== */

const ForecastingView = {
  customCagr: 12.5,
  activeScenario: 'base', // 'low', 'base', 'high'
  chartInstance: null,

  render(container, store) {
    const project = store.getActiveProject();
    if (!project) {
      container.innerHTML = `<div style="padding: 40px; text-align: center;">No project selected.</div>`;
      return;
    }

    const market = project.marketSizing || {};
    const forecast = project.growthForecast || {};
    const baseSom = market.somPKR || 250;

    // Recalculate annual tables based on active CAGR
    const cagrDecimal = this.customCagr / 100;
    const lowCagr = +(cagrDecimal * 0.7).toFixed(4);
    const baseCagr = +(cagrDecimal).toFixed(4);
    const highCagr = +(cagrDecimal * 1.35).toFixed(4);

    const years = [2026, 2027, 2028, 2029, 2030, 2031];
    const forecastRows = years.map((yr, idx) => {
      const lowVal = Math.round(baseSom * Math.pow(1 + lowCagr, idx));
      const baseVal = Math.round(baseSom * Math.pow(1 + baseCagr, idx));
      const highVal = Math.round(baseSom * Math.pow(1 + highCagr, idx));
      const unitPrice = (project.products && project.products[0] ? project.products[0].sellingPricePKR : 100);
      const units = Math.round((baseVal * 1000000) / unitPrice);

      return { year: yr, lowVal, baseVal, highVal, units };
    });

    container.innerHTML = `
      <div class="view-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: var(--shu-navy);">
            Five-Year Commercial Growth Forecasting & Market Sizing
          </h2>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            Transparent bottom-up market sizing (TAM/SAM/SOM) and 2026–2031 scenario modeling for <strong>${project.title}</strong>
          </p>
        </div>

        <!-- Currency and Project Switcher -->
        <div style="display: flex; align-items: center; gap: 12px;">
          <select class="form-control" style="font-size: 0.82rem; padding: 6px 12px; max-width: 320px;" onchange="window.oricApp.openForecast(this.value)">
            ${store.projects.map(p => `
              <option value="${p.id}" ${p.id === project.id ? 'selected' : ''}>
                [${p.id}] ${p.title.substring(0, 42)}${p.title.length > 42 ? '...' : ''}
              </option>
            `).join('')}
          </select>
        </div>
      </div>

      <!-- TAM / SAM / SOM Metric Deck -->
      <div class="tam-metric-deck">
        <div class="tam-box tam-primary">
          <div class="tam-tag">Total Addressable Market (TAM)</div>
          <div class="tam-figure">${store.formatMoney(market.tamPKR)}</div>
          <div class="tam-sub">Entire defined Pakistan market demand if fully served</div>
        </div>

        <div class="tam-box sam-secondary">
          <div class="tam-tag">Serviceable Available Market (SAM)</div>
          <div class="tam-figure">${store.formatMoney(market.samPKR)}</div>
          <div class="tam-sub">Portion realistically addressable in Sindh & Karachi metropolitan region</div>
        </div>

        <div class="tam-box som-accent">
          <div class="tam-tag">Serviceable Obtainable Market (SOM)</div>
          <div class="tam-figure">${store.formatMoney(baseSom)}</div>
          <div class="tam-sub">Realistic commercial capture targeted by SHU licensee / spin-off (Year 1)</div>
        </div>
      </div>

      <!-- Mathematical Formula & Methodological Transparency -->
      <div class="formula-banner">
        <div style="font-size: 1.5rem; color: #1E40AF;"><i class="fa-solid fa-square-root-variable"></i></div>
        <div>
          <div style="font-weight: 700; color: #1E3A8A; font-size: 0.88rem; margin-bottom: 2px;">
            Compounded Annual Growth Rate (CAGR) Projection Formula:
          </div>
          <div style="display: flex; align-items: center; gap: 10px; margin-top: 4px; flex-wrap: wrap;">
            <span class="formula-code">Market Size(Year n) = Base_Size × (1 + r)^n</span>
            <span style="font-size: 0.76rem; color: #1E40AF;">Where r = Annual CAGR %, n = Year index from 2026 base year</span>
          </div>
        </div>
      </div>

      <!-- Interactive Scenario Controls & Chart -->
      <div class="oric-card">
        <div class="oric-card-header">
          <div class="card-title-group">
            <div class="card-title-icon"><i class="fa-solid fa-sliders"></i></div>
            <div>
              <div class="card-title">Interactive Five-Year Forecast Modeling (2026 – 2031)</div>
              <div class="card-subtitle">Adjust the expected sector CAGR to recalculate all 5-year financial scenarios in real time</div>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 0.8rem; font-weight: 700; color: var(--shu-navy);">Scenario CAGR:</span>
              <span class="badge badge-high" id="cagrDisplayBadge" style="font-size: 0.82rem; font-family: monospace;">
                ${this.customCagr.toFixed(1)}%
              </span>
            </div>
            <input type="range" min="4.0" max="30.0" step="0.5" value="${this.customCagr}" class="score-range-slider" style="width: 140px;" oninput="ForecastingView.handleSliderChange(this.value)">
          </div>
        </div>

        <div class="oric-card-body">
          <div class="chart-container-box" style="height: 320px;">
            <canvas id="chartFiveYearForecast"></canvas>
          </div>
        </div>
      </div>

      <!-- Forecast Annual Breakdown Table -->
      <div class="oric-card">
        <div class="oric-card-header">
          <div class="card-title-group">
            <div class="card-title-icon"><i class="fa-solid fa-table"></i></div>
            <div>
              <div class="card-title">Annual Scenario Projection Table (PKR Millions & Unit Volume)</div>
              <div class="card-subtitle">Comparison between Conservative (Low), Base Case, and Accelerated (High) growth tracks</div>
            </div>
          </div>
        </div>
        <div class="oric-card-body" style="padding: 0;">
          <div class="table-responsive" style="border: none;">
            <table class="oric-table">
              <thead>
                <tr>
                  <th>Forecast Horizon</th>
                  <th>Conservative Scenario (${(lowCagr * 100).toFixed(1)}%)</th>
                  <th>Base Case Scenario (${(baseCagr * 100).toFixed(1)}%)</th>
                  <th>Accelerated Scenario (${(highCagr * 100).toFixed(1)}%)</th>
                  <th>Estimated Unit Demand (Units)</th>
                  <th>Exchange Benchmark</th>
                </tr>
              </thead>
              <tbody>
                ${forecastRows.map((row, idx) => `
                  <tr style="${idx === 0 ? 'background: #F0F9FF; font-weight: 700;' : ''}">
                    <td>
                      <strong>Year ${idx} (${row.year})</strong>
                      ${idx === 0 ? '<span class="badge badge-standard" style="margin-left: 6px;">Base Year</span>' : ''}
                    </td>
                    <td style="color: #92400E; font-weight: 600;">${store.formatMoney(row.lowVal)}</td>
                    <td style="color: var(--shu-navy); font-weight: 700; font-size: 0.9rem;">${store.formatMoney(row.baseVal)}</td>
                    <td style="color: #166534; font-weight: 700;">${store.formatMoney(row.highVal)}</td>
                    <td><span style="font-family: monospace;">${row.units.toLocaleString()} packs</span></td>
                    <td style="font-size: 0.74rem; color: var(--text-muted);">1 USD = 280 PKR</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Render Chart.js
    this.renderForecastChart(forecastRows, store);
  },

  handleSliderChange(val) {
    this.customCagr = parseFloat(val);
    const badge = document.getElementById('cagrDisplayBadge');
    if (badge) badge.textContent = this.customCagr.toFixed(1) + '%';
    this.render(document.getElementById('forecastingViewContainer'), window.oricStore);
  },

  renderForecastChart(rows, store) {
    if (typeof Chart === 'undefined') return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const ctx = document.getElementById('chartFiveYearForecast')?.getContext('2d');
    if (!ctx) return;

    const labels = rows.map(r => String(r.year));
    const lowData = rows.map(r => r.lowVal);
    const baseData = rows.map(r => r.baseVal);
    const highData = rows.map(r => r.highVal);

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Accelerated Scenario (High)',
            data: highData,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 4
          },
          {
            label: 'Base Case Scenario (Expected)',
            data: baseData,
            borderColor: '#0284C7',
            backgroundColor: 'rgba(2, 132, 199, 0.15)',
            fill: true,
            tension: 0.35,
            borderWidth: 3,
            pointRadius: 5
          },
          {
            label: 'Conservative Scenario (Low)',
            data: lowData,
            borderColor: '#F59E0B',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { size: 11, family: "'Inter', sans-serif" } }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: PKR ${context.parsed.y.toLocaleString()} Million`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: { color: '#F1F5F9' },
            ticks: {
              callback: function(val) {
                return 'PKR ' + val + 'M';
              }
            }
          },
          x: {
            grid: { color: '#F8FAFC' }
          }
        }
      }
    });
  }
};
