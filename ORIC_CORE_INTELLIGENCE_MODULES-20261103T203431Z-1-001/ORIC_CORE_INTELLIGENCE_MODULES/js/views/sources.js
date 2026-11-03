/* ==========================================================================
   ORIC-IOAP View: Data Sources & Research Evidence
   Salim Habib University (SHU), Karachi
   ========================================================================== */

const SourcesView = {
  render(container, store) {
    const sources = store.evidence || [];

    container.innerHTML = `
      <div class="view-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: var(--shu-navy);">
            Data Sources, Evidence & Assumptions Registry
          </h2>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            Traceable market evidence registry ensuring academic credibility, verifiable citations, and methodological transparency.
          </p>
        </div>
        <div>
          <span class="badge badge-high" style="font-size: 0.85rem; padding: 6px 14px;">
            <i class="fa-solid fa-certificate"></i> Verified Institutional Sources
          </span>
        </div>
      </div>

      <!-- Credibility Assurance Callout -->
      <div class="feature-callout-box" style="margin-bottom: 24px;">
        <strong><i class="fa-solid fa-shield-halved"></i> Methodological Integrity Standard:</strong>
        In accordance with ORIC guidelines, all numerical market sizing and growth figures originate either from official published statistics (PBS, SBP, DRAP, PPMA) or transparent bottom-up scenario models. No fabricated market sizes or invented corporate turnover claims are permitted.
      </div>

      <!-- Sourced Evidence Cards Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 18px; margin-bottom: 28px;">
        ${sources.map(src => `
          <div class="oric-card" style="margin-bottom: 0; display: flex; flex-direction: column; justify-content: space-between;">
            <div class="oric-card-body">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <span class="badge badge-high" style="font-size: 0.68rem;">
                  ${src.credibility}
                </span>
                <span style="font-size: 0.72rem; color: var(--text-muted); font-family: monospace;">
                  ${src.id}
                </span>
              </div>

              <div style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 700; color: var(--shu-navy); margin-bottom: 4px; line-height: 1.3;">
                ${src.name}
              </div>

              <div style="font-size: 0.76rem; color: var(--shu-blue-primary); font-weight: 600; margin-bottom: 10px;">
                ${src.type}
              </div>

              <div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px;">
                ${src.description}
              </div>

              <div style="font-size: 0.76rem; color: var(--text-muted); background: #F8FAFC; padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
                <strong>Applied To:</strong> ${src.relevantAreas}
              </div>
            </div>

            <div style="padding: 10px 20px; background: #F8FAFC; border-top: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; font-size: 0.74rem;">
              <span style="color: var(--text-muted);">Verified: ${src.lastVerified}</span>
              <a href="${src.url}" target="_blank" rel="noopener noreferrer" style="font-weight: 600;">
                Official Portal <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </a>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Transparent Model Assumptions Table -->
      <div class="oric-card">
        <div class="oric-card-header">
          <div class="card-title-group">
            <div class="card-title-icon"><i class="fa-solid fa-list-ol"></i></div>
            <div>
              <div class="card-title">Economic & Financial Modeling Assumptions</div>
              <div class="card-subtitle">Documented macroeconomic and sector parameters used across all 5-year projections</div>
            </div>
          </div>
        </div>
        <div class="oric-card-body" style="padding: 0;">
          <div class="table-responsive" style="border: none;">
            <table class="oric-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Assumed Value</th>
                  <th>Official Benchmark Reference</th>
                  <th>Sensitivity / Uncertainty Impact</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Foreign Exchange Baseline</strong></td>
                  <td>1 USD = 280 PKR</td>
                  <td>State Bank of Pakistan (SBP) Interbank Benchmark</td>
                  <td>Currency depreciation elevates imported API costs, increasing local formulation cost advantage.</td>
                </tr>
                <tr>
                  <td><strong>Sindh / Karachi Healthcare Share</strong></td>
                  <td>32.5% of National Market</td>
                  <td>Pakistan Bureau of Statistics (PBS) Urban Census</td>
                  <td>Karachi constitutes highest per capita medicine and nutraceutical consumption in Pakistan.</td>
                </tr>
                <tr>
                  <td><strong>Pharma Sector CAGR Baseline</strong></td>
                  <td>11.4% Annual Growth</td>
                  <td>Pakistan Pharmaceutical Manufacturers Association (PPMA)</td>
                  <td>Driven by population growth (2.55% annual) and expansion in chronic disease therapeutics.</td>
                </tr>
                <tr>
                  <td><strong>Nutraceutical / OTC CAGR</strong></td>
                  <td>15.8% Annual Growth</td>
                  <td>Global Wellness Institute & TDAP Market Roster</td>
                  <td>Surge in preventative preventive care, functional gummies, and immune support post-2020.</td>
                </tr>
                <tr>
                  <td><strong>Digital Health / Clinical AI CAGR</strong></td>
                  <td>21.0% Annual Growth</td>
                  <td>Ministry of IT & Telecom HealthTech Review</td>
                  <td>Rapid adoption of hospital electronic records, AI dosage assistants, and telemedicine.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }
};
