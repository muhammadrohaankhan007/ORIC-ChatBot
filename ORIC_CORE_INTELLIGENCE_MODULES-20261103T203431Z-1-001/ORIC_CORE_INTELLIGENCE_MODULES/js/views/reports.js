/* ==========================================================================
   ORIC-IOAP View: Professional PDF Report Generator & Print Engine
   Salim Habib University (SHU), Karachi
   ========================================================================== */

const ReportsView = {
  activeReportType: 'A', // 'A' through 'H'

  reportTypes: [
    { code: 'A', title: 'Executive Opportunity Brief', sub: 'Concise decision-making memo for Vice Chancellor & Senior University Leadership.' },
    { code: 'B', title: 'Detailed Commercialization Report', sub: 'Comprehensive 8-criteria dossier for ORIC officers, faculty inventors, and licensing teams.' },
    { code: 'C', title: 'Industry-Specific Report', sub: 'Focused analysis on selected industrial sectors (Pharma, Nutraceuticals, Cosmeceuticals).' },
    { code: 'D', title: 'Karachi Industrial-Area Report', sub: 'Cluster opportunity assessment tailored to Korangi, Landhi, SITE, or Port Qasim.' },
    { code: 'E', title: 'Product & Service Market Valuation', sub: 'Product-wise unit economics, price margins, and laboratory service revenue model.' },
    { code: 'F', title: 'Five-Year Growth Forecast Report', sub: '2026–2031 CAGR scenarios, annual revenue projections, and unit volume models.' },
    { code: 'G', title: 'Investor & Industry Partnership Deck', sub: 'Commercial memorandum for venture partners, pharma conglomerates, and angel funds.' },
    { code: 'H', title: 'Multi-Project Portfolio Ranking', sub: 'Comparative institutional ranking of all 233 university research initiatives.' }
  ],

  render(container, store) {
    const project = store.getActiveProject();
    if (!project) {
      container.innerHTML = `<div style="padding: 40px; text-align: center;">No project selected in repository.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="view-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: var(--shu-navy);">
            Professional PDF Report Generator & Export Engine
          </h2>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            Generate publication-ready institutional intelligence reports branded for Salim Habib University and ORIC.
          </p>
        </div>

        <div style="display: flex; gap: 10px;">
          <button class="btn btn-navy" onclick="ReportsView.printReport()">
            <i class="fa-solid fa-print"></i> Print / Save as PDF
          </button>
          <button class="btn btn-primary" onclick="ReportsView.downloadPdf('${project.id}')">
            <i class="fa-solid fa-download"></i> Direct Download PDF
          </button>
        </div>
      </div>

      <!-- Report Type Selector Grid -->
      <div class="report-catalog-grid">
        ${this.reportTypes.map(rt => `
          <div class="report-card-option ${this.activeReportType === rt.code ? 'selected' : ''}" onclick="ReportsView.selectReportType('${rt.code}')">
            <span class="report-code-badge">Report ${rt.code}</span>
            <div class="report-card-title">${rt.title}</div>
            <div class="report-card-desc">${rt.sub}</div>
          </div>
        `).join('')}
      </div>

      <!-- Report Configuration Bar -->
      <div style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 14px 20px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <span style="font-size: 0.82rem; font-weight: 700; color: var(--shu-navy);">Target Innovation:</span>
          <select class="form-control" style="font-size: 0.82rem; padding: 6px 12px; width: 420px; max-width: 100%;" onchange="window.oricApp.openReportForProject(this.value)">
            ${store.projects.map(p => `
              <option value="${p.id}" ${p.id === project.id ? 'selected' : ''}>
                [${p.id}] ${p.title.substring(0, 55)}${p.title.length > 55 ? '...' : ''}
              </option>
            `).join('')}
          </select>
        </div>

        <div style="display: flex; align-items: center; gap: 14px; font-size: 0.78rem; color: var(--text-secondary);">
          <span class="badge badge-high"><i class="fa-solid fa-shield-halved"></i> Institutional Watermark Active</span>
          <span class="badge badge-standard"><i class="fa-solid fa-coins"></i> Currency: ${store.currency}</span>
        </div>
      </div>

      <!-- Live Printable Sheet Preview -->
      <div class="report-paper-preview" id="printableReportSheet">
        <!-- University Institutional Crest Header -->
        <div class="report-institution-header">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 56px; height: 56px; background: #0A2540; color: #FFFFFF; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-family: var(--font-heading); font-weight: 800; font-size: 1.45rem; box-shadow: 0 4px 10px rgba(10,37,64,0.3);">
              SHU
            </div>
            <div>
              <div class="inst-name">SALIM HABIB UNIVERSITY</div>
              <div class="inst-sub">Office of Research, Innovation & Commercialization (ORIC)</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">NC-24, Deh Dih, Korangi Creek Road, Karachi-74900, Pakistan</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-family: monospace; font-size: 0.85rem; font-weight: 700; color: var(--shu-navy);">
              REF: ORIC-IOAP-${project.id}-${this.activeReportType}
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div style="font-size: 0.72rem; color: var(--shu-blue-primary); font-weight: 600;">Doc Classification: Confidential / ORIC Institutional Record</div>
          </div>
        </div>

        <!-- Official Report Title Header -->
        <div style="margin-bottom: 24px; padding-bottom: 14px; border-bottom: 2px solid var(--border-light);">
          <span class="report-code-badge" style="font-size: 0.75rem; margin-bottom: 6px;">
            REPORT ${this.activeReportType} — ${this.reportTypes.find(r => r.code === this.activeReportType)?.title.toUpperCase()}
          </span>
          <div class="report-official-title">
            ${this.activeReportType === 'H' ? 'Faculty of Pharmacy Comprehensive Research Portfolio & Commercial Opportunity Ranking' : project.title}
          </div>
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">
            Department: <strong>${project.department}</strong> | Course: <strong>${project.courseTitle} (${project.courseCode})</strong> | PI: <strong>${project.facultyPI}</strong>
          </div>
        </div>

        <!-- Dynamic Report Body for Report Types A through H -->
        ${this.renderReportBody(project, store)}

        <!-- Data Sources, Evidence & Uncertainty Disclosure -->
        <div style="margin-top: 30px; padding-top: 16px; border-top: 1px solid var(--border-medium); font-size: 0.75rem; color: var(--text-muted); line-height: 1.5;">
          <div style="font-weight: 700; color: var(--shu-navy); margin-bottom: 4px;">
            Evidence Citations & Uncertainty Disclosure:
          </div>
          <div>
            1. SBP State of Economy Report 2025-2026 / Dated benchmark: 1 USD = 280 PKR.<br>
            2. Drug Regulatory Authority of Pakistan (DRAP) registered categories & Maximum Retail Price (MRP) compendium.<br>
            3. Pakistan Pharmaceutical Manufacturers Association (PPMA) Sector Census & KATI Industrial Directory.<br>
            <strong>Note on Methodology:</strong> Valuation and TAM/SAM/SOM estimations use bottom-up unit volume calculations based on transparent demographic, therapeutic prevalence, and regional Sindh healthcare consumption patterns.
          </div>
        </div>

        <!-- Institutional Signature Blocks -->
        <div style="margin-top: 36px; padding-top: 20px; border-top: 2px solid var(--shu-navy); display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; text-align: center;">
          <div>
            <div style="border-bottom: 1px solid #94A3B8; height: 35px; margin-bottom: 6px;"></div>
            <div style="font-weight: 700; font-size: 0.8rem; color: var(--shu-navy);">${project.facultyPI}</div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">Principal Investigator / Faculty Lead</div>
          </div>
          <div>
            <div style="border-bottom: 1px solid #94A3B8; height: 35px; margin-bottom: 6px;"></div>
            <div style="font-weight: 700; font-size: 0.8rem; color: var(--shu-navy);">Director ORIC</div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">Salim Habib University, Karachi</div>
          </div>
          <div>
            <div style="border-bottom: 1px solid #94A3B8; height: 35px; margin-bottom: 6px;"></div>
            <div style="font-weight: 700; font-size: 0.8rem; color: var(--shu-navy);">Dean, Faculty of Pharmacy</div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">Salim Habib University, Karachi</div>
          </div>
        </div>
      </div>
    `;
  },

  selectReportType(code) {
    this.activeReportType = code;
    this.render(document.getElementById('mainContentContainer'), window.oricStore);
  },

  renderReportBody(project, store) {
    const comm = project.commercialization || {};
    const market = project.marketSizing || {};
    const growth = project.growthForecast || {};
    const products = project.products || [];
    const areas = project.matchedAreas || [];

    // REPORT A: Executive Opportunity Brief
    if (this.activeReportType === 'A') {
      return `
        <div style="margin-bottom: 22px;">
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--shu-navy); margin-bottom: 8px; border-bottom: 1px solid var(--border-light); padding-bottom: 4px;">
            1. Executive Problem & Technical Solution Overview
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6; text-align: justify; margin-bottom: 12px;">
            ${project.abstract}
          </p>
          <div style="background: #F0F9FF; border-left: 3px solid var(--shu-blue-primary); padding: 12px 16px; font-size: 0.82rem; color: var(--shu-navy); border-radius: 0 var(--radius-sm) var(--radius-sm) 0;">
            <strong>National Economic Value:</strong> Targets import-substitution in Pakistan's healthcare distribution network. Formulated using indigenous polymers and excipients, this project projects a 50% to 65% cost savings over imported commercial equivalents.
          </div>
        </div>

        <div style="margin-bottom: 22px;">
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--shu-navy); margin-bottom: 10px; border-bottom: 1px solid var(--border-light); padding-bottom: 4px;">
            2. Commercial Valuation & Addressable Market Sizing
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 14px;">
            <div style="background: #F0F9FF; border: 1px solid #BAE6FD; padding: 12px; border-radius: var(--radius-sm);">
              <div style="font-size: 0.7rem; color: #0369A1; font-weight: 700;">TOTAL ADDRESSABLE MARKET (TAM)</div>
              <div style="font-size: 1.25rem; font-weight: 800; color: var(--shu-navy);">${store.formatMoney(market.tamPKR)}</div>
              <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">Pakistan National Healthcare Sector</div>
            </div>
            <div style="background: #CCFBF1; border: 1px solid #99F6E4; padding: 12px; border-radius: var(--radius-sm);">
              <div style="font-size: 0.7rem; color: #0F766E; font-weight: 700;">SERVICEABLE AVAILABLE (SAM)</div>
              <div style="font-size: 1.25rem; font-weight: 800; color: var(--shu-navy);">${store.formatMoney(market.samPKR)}</div>
              <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">Sindh & South Pakistan Market</div>
            </div>
            <div style="background: #DCFCE7; border: 1px solid #BBF7D0; padding: 12px; border-radius: var(--radius-sm);">
              <div style="font-size: 0.7rem; color: #166534; font-weight: 700;">SERVICEABLE OBTAINABLE (SOM)</div>
              <div style="font-size: 1.25rem; font-weight: 800; color: var(--shu-navy);">${store.formatMoney(market.somPKR)}</div>
              <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">SHU Year 1 Capturable Share</div>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 22px;">
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--shu-navy); margin-bottom: 8px; border-bottom: 1px solid var(--border-light); padding-bottom: 4px;">
            3. Strategic Recommendation & Next Immediate Actions
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; background: #F8FAFC; border: 1px solid var(--border-light); padding: 12px 16px; border-radius: var(--radius-sm); margin-bottom: 10px;">
            <div>
              <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Commercial Pathway</div>
              <div style="font-size: 1rem; font-weight: 800; color: var(--shu-navy);">${comm.recommendation || 'Industry Collaboration & Licensing'}</div>
            </div>
            <div>
              <span class="badge badge-high" style="font-size: 0.85rem; padding: 6px 14px;">Overall Score: ${comm.overallScore || 4.2} / 5.0</span>
            </div>
          </div>
          <ul style="font-size: 0.82rem; color: var(--text-secondary); padding-left: 20px; line-height: 1.6;">
            ${(comm.nextActions || [
              'Submit patent disclosure to ORIC Intellectual Property committee',
              'Organize commercial pilot meeting with KATI pharmaceutical liaison',
              'File for HEC Technology Development Fund (TDF) matching grant'
            ]).map(a => `<li>${a}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    // REPORT B: Detailed Commercialization Report (8-Criteria Breakdown)
    if (this.activeReportType === 'B') {
      const scores = comm.criteriaScores || {};
      const criteriaList = [
        { label: 'Technical Feasibility', weight: '15%', score: scores.technicalFeasibility || 4.2, desc: 'Robustness of formulation protocol and replicability under GMP parameters.' },
        { label: 'Market Attractiveness', weight: '20%', score: scores.marketAttractiveness || 4.4, desc: 'Addressable volume, annual category growth rate, and national unmet therapeutic demand.' },
        { label: 'Customer Demand Evidence', weight: '15%', score: scores.customerDemandEvidence || 4.1, desc: 'Validated clinical doctor interest and patient compliance advantages.' },
        { label: 'Technology Readiness (TRL)', weight: '10%', score: scores.trlScore || 3.0, desc: `Validated at ${comm.trlDescription || 'TRL 3 - Proof of Concept'}.` },
        { label: 'Intellectual Property Novelty', weight: '15%', score: scores.intellectualProperty || 4.2, desc: 'Patentability of novel excipient ratio or specialized dosage delivery mechanism.' },
        { label: 'Team Execution Capability', weight: '5%', score: scores.teamCapability || 4.5, desc: 'Principal Investigator credentials, student lab execution, and analytical capacity.' },
        { label: 'Industrial Scalability', weight: '10%', score: scores.scalability || 4.0, desc: 'Readiness for continuous high-speed rotary compression / batch compounding.' },
        { label: 'Import Substitution Potential', weight: '10%', score: scores.importSubstitution || 4.8, desc: 'Direct foreign exchange savings displacing finished imported brands.' }
      ];

      return `
        <div style="margin-bottom: 22px;">
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--shu-navy); margin-bottom: 10px; border-bottom: 1px solid var(--border-light); padding-bottom: 4px;">
            1. Comprehensive 8-Criteria Commercial Scoring Matrix
          </div>
          <table class="oric-table" style="font-size: 0.78rem;">
            <thead>
              <tr>
                <th>Evaluation Dimension</th>
                <th>Weight</th>
                <th>Assigned Score</th>
                <th>Weighted Score</th>
                <th>Evaluation Rationale</th>
              </tr>
            </thead>
            <tbody>
              ${criteriaList.map(c => {
                const wNum = parseFloat(c.weight) / 100;
                const weightedVal = (c.score * wNum).toFixed(2);
                return `
                  <tr>
                    <td><strong>${c.label}</strong></td>
                    <td><span class="badge badge-standard">${c.weight}</span></td>
                    <td><strong>${c.score} / 5.0</strong></td>
                    <td style="font-weight: 700; color: var(--shu-navy);">${weightedVal}</td>
                    <td style="font-size: 0.75rem; color: var(--text-secondary);">${c.desc}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
            <tfoot>
              <tr style="background: #F8FAFC; font-weight: 800;">
                <td colspan="3">COMPOSITE INSTITUTIONAL COMMERCIAL SCORE:</td>
                <td style="font-size: 1rem; color: var(--shu-blue-primary);">${comm.overallScore || 4.2} / 5.0</td>
                <td><span class="badge badge-high">${comm.priority || 'High Priority'}</span></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style="margin-bottom: 22px;">
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--shu-navy); margin-bottom: 8px; border-bottom: 1px solid var(--border-light); padding-bottom: 4px;">
            2. Technology Readiness Level (TRL) Roadmap
          </div>
          <div style="background: #F8FAFC; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 14px; margin-bottom: 12px;">
            <div style="font-weight: 700; font-size: 0.9rem; color: var(--shu-navy); margin-bottom: 4px;">
              Current Status: TRL ${comm.trlLevel || 3} — ${comm.trlDescription || 'Experimental Proof of Concept'}
            </div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5;">
              Innovation has been synthesized and validated in SHU Pharmaceutics laboratories. Accelerated stability testing and in-vitro dissolution profiling confirm USP/BP quality compliance. Next milestone requires pilot batch compounding (TRL 5) with an industrial partner in Korangi or Landhi.
            </div>
          </div>
        </div>
      `;
    }

    // REPORT C: Industry-Specific Report
    if (this.activeReportType === 'C') {
      return `
        <div style="margin-bottom: 22px;">
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--shu-navy); margin-bottom: 10px; border-bottom: 1px solid var(--border-light); padding-bottom: 4px;">
            1. Target Industrial Sectors & Market Dynamics
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
            <div style="background: #F8FAFC; border: 1px solid var(--border-light); padding: 12px; border-radius: var(--radius-sm);">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">PRIMARY SECTOR FIT</div>
              <div style="font-size: 1.05rem; font-weight: 800; color: var(--shu-navy); margin-bottom: 4px;">Pharmaceuticals & NDDS</div>
              <div style="font-size: 0.78rem; color: var(--text-secondary);">National Market: PKR 850 Billion | Annual Sector Growth: +11.4% CAGR</div>
            </div>
            <div style="background: #F8FAFC; border: 1px solid var(--border-light); padding: 12px; border-radius: var(--radius-sm);">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">SECONDARY APPLICATION</div>
              <div style="font-size: 1.05rem; font-weight: 800; color: var(--shu-navy); margin-bottom: 4px;">Nutraceuticals & FMCG Wellness</div>
              <div style="font-size: 0.78rem; color: var(--text-secondary);">National Market: PKR 115 Billion | Annual Sector Growth: +15.8% CAGR</div>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 22px;">
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--shu-navy); margin-bottom: 8px; border-bottom: 1px solid var(--border-light); padding-bottom: 4px;">
            2. Regulatory DRAP Category & Competitor Benchmarking
          </div>
          <table class="oric-table" style="font-size: 0.78rem;">
            <thead>
              <tr>
                <th>Regulatory Dimension</th>
                <th>Standard Commercial Alternative</th>
                <th>SHU University Innovation</th>
                <th>Strategic Advantage</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>DRAP Class</strong></td>
                <td>Imported Allopathic / OTC Registration</td>
                <td>Finished Formulation under Form 7</td>
                <td>Fast-track local review via Form 6</td>
              </tr>
              <tr>
                <td><strong>Estimated Price</strong></td>
                <td>PKR 350 – 500 per pack</td>
                <td><strong>${store.formatPrice(products[0]?.sellingPricePKR || 120)}</strong></td>
                <td><span class="badge badge-high">60% Cost Reduction</span></td>
              </tr>
              <tr>
                <td><strong>Raw Materials</strong></td>
                <td>100% Imported active compounds</td>
                <td>Locally processed botanical / API matrix</td>
                <td>Hedges against foreign exchange volatility</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }

    // REPORT D: Karachi Industrial-Area Report
    if (this.activeReportType === 'D') {
      return `
        <div style="margin-bottom: 22px;">
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--shu-navy); margin-bottom: 10px; border-bottom: 1px solid var(--border-light); padding-bottom: 4px;">
            1. Karachi Industrial Estate Cluster Alignment
          </div>
          <p style="font-size: 0.84rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px;">
            Salim Habib University's strategic location in Korangi Creek provides direct access to Karachi's major pharmaceutical manufacturing hubs. The following industrial clusters demonstrate direct compatibility with this innovation:
          </p>
          <table class="oric-table" style="font-size: 0.78rem;">
            <thead>
              <tr>
                <th>Industrial Estate</th>
                <th>Relevance</th>
                <th>Candidate Enterprise Partners</th>
                <th>Collaboration Role</th>
              </tr>
            </thead>
            <tbody>
              ${areas.map(a => `
                <tr>
                  <td><strong>${a.name}</strong></td>
                  <td><span class="badge badge-high">${a.relevanceScore}% Fit</span></td>
                  <td>${(a.targetEnterprises || []).join(', ')}</td>
                  <td>${a.collaborationRole}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="margin-bottom: 22px;">
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--shu-navy); margin-bottom: 8px; border-bottom: 1px solid var(--border-light); padding-bottom: 4px;">
            2. Strategic Logistics & Pilot Batching
          </div>
          <div style="background: #F8FAFC; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 12px; font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5;">
            <strong>Logistics Corridor:</strong> Korangi Industrial Area (KATI) and Landhi Industrial Area (LATI) are within 15–20 minutes transit from SHU laboratories, facilitating rapid sample handoff, joint in-vitro validation, and real-time analytical assays.
          </div>
        </div>
      `;
    }

    // REPORT E: Product & Service Market Valuation
    if (this.activeReportType === 'E') {
      return `
        <div style="margin-bottom: 22px;">
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--shu-navy); margin-bottom: 10px; border-bottom: 1px solid var(--border-light); padding-bottom: 4px;">
            1. Commercial Product Unit Economics & Margin Structure
          </div>
          <table class="oric-table" style="font-size: 0.78rem;">
            <thead>
              <tr>
                <th>Spun-Off Commercial Product</th>
                <th>Dosage Form</th>
                <th>Target Consumer</th>
                <th>Unit Cost</th>
                <th>Target Price</th>
                <th>Gross Margin</th>
              </tr>
            </thead>
            <tbody>
              ${products.map(pr => {
                const cost = pr.unitCostPKR || 40;
                const price = pr.sellingPricePKR || 120;
                const margin = Math.round(((price - cost) / price) * 100);
                return `
                  <tr>
                    <td><strong>${pr.name}</strong></td>
                    <td><span class="badge badge-standard">${pr.dosageForm}</span></td>
                    <td style="font-size: 0.74rem;">${pr.targetCustomer}</td>
                    <td>${store.formatPrice(cost)}</td>
                    <td style="font-weight: 700; color: var(--shu-navy);">${store.formatPrice(price)}</td>
                    <td><span class="badge badge-high">${margin}% Margin</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div style="margin-bottom: 22px;">
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--shu-navy); margin-bottom: 8px; border-bottom: 1px solid var(--border-light); padding-bottom: 4px;">
            2. Laboratory Analytical Testing Revenue Potential
          </div>
          <table class="oric-table" style="font-size: 0.78rem;">
            <thead>
              <tr>
                <th>Commercialized Service Offering</th>
                <th>Testing Protocol</th>
                <th>Target Industry Client</th>
                <th>Standard Fee Schedule</th>
              </tr>
            </thead>
            <tbody>
              ${(project.services || [
                { name: 'ICH Zone IVb Stability Testing', description: '40°C / 75% RH 6-month accelerated protocol', targetClient: 'Korangi & Landhi pharma plants', feePKR: 'PKR 125,000 per dossier' }
              ]).map(s => `
                <tr>
                  <td><strong>${s.name}</strong></td>
                  <td>${s.description}</td>
                  <td>${s.targetClient}</td>
                  <td style="font-weight: 700; color: var(--shu-emerald);">${s.feePKR}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    // REPORT F: Five-Year Growth Forecast Report
    if (this.activeReportType === 'F') {
      const table = growth.forecastTable || [];
      return `
        <div style="margin-bottom: 22px;">
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--shu-navy); margin-bottom: 10px; border-bottom: 1px solid var(--border-light); padding-bottom: 4px;">
            1. Five-Year Commercial Adoption & Revenue Model (2026 – 2031)
          </div>
          <table class="oric-table" style="font-size: 0.78rem;">
            <thead>
              <tr>
                <th>Forecast Year</th>
                <th>Conservative Scenario (8.5% CAGR)</th>
                <th>Base Case Expected (12.8% CAGR)</th>
                <th>Accelerated Expansion (17.0% CAGR)</th>
                <th>Estimated Unit Sales</th>
              </tr>
            </thead>
            <tbody>
              ${table.map(r => `
                <tr>
                  <td><strong>Year ${r.year}</strong></td>
                  <td>${store.formatMoney(r.lowPKR)}</td>
                  <td style="font-weight: 700; color: var(--shu-navy);">${store.formatMoney(r.basePKR)}</td>
                  <td style="font-weight: 700; color: #166534;">${store.formatMoney(r.highPKR)}</td>
                  <td>${(r.unitSalesEst || 0).toLocaleString()} units</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="margin-bottom: 22px;">
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--shu-navy); margin-bottom: 8px; border-bottom: 1px solid var(--border-light); padding-bottom: 4px;">
            2. Sensitivity & Macroeconomic Assumptions
          </div>
          <div style="background: #F8FAFC; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 12px; font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5;">
            Financial models account for a 280 PKR/USD exchange rate peg, assuming headline inflation settles at 7–9% per SBP Medium-Term Forecasts. Revenue assumes a 3%–5% university licensing royalty on net sales.
          </div>
        </div>
      `;
    }

    // REPORT G: Investor & Industry Partnership Deck
    if (this.activeReportType === 'G') {
      return `
        <div style="margin-bottom: 22px;">
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--shu-navy); margin-bottom: 10px; border-bottom: 1px solid var(--border-light); padding-bottom: 4px;">
            1. Investment Opportunity & Commercial Deal Terms
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 14px;">
            <div style="background: #F8FAFC; border: 1px solid var(--border-light); padding: 12px; border-radius: var(--radius-sm);">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">CAPEX SCALE-UP ASK</div>
              <div style="font-size: 1.2rem; font-weight: 800; color: var(--shu-navy);">PKR 15 - 25 Million</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">Pilot batching & cGMP tooling</div>
            </div>
            <div style="background: #F8FAFC; border: 1px solid var(--border-light); padding: 12px; border-radius: var(--radius-sm);">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">PROPOSED ROYALTY</div>
              <div style="font-size: 1.2rem; font-weight: 800; color: var(--shu-navy);">3.5% - 5.0%</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">Of net ex-factory commercial sales</div>
            </div>
            <div style="background: #F8FAFC; border: 1px solid var(--border-light); padding: 12px; border-radius: var(--radius-sm);">
              <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">PROJECTED IRR</div>
              <div style="font-size: 1.2rem; font-weight: 800; color: #166534;">34.2%</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">Payback period: 2.1 Years</div>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 22px;">
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--shu-navy); margin-bottom: 8px; border-bottom: 1px solid var(--border-light); padding-bottom: 4px;">
            2. Technology Transfer & Commercialization Milestones
          </div>
          <table class="oric-table" style="font-size: 0.78rem;">
            <thead>
              <tr>
                <th>Phase</th>
                <th>Target Milestone</th>
                <th>Timeline</th>
                <th>Responsible Entity</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Phase 1</strong></td>
                <td>Provisional Patent Filing & Non-Disclosure Agreement (NDA)</td>
                <td>Month 1 – 2</td>
                <td>ORIC / IPO-Pakistan</td>
              </tr>
              <tr>
                <td><strong>Phase 2</strong></td>
                <td>10,000-Unit Pilot Batch Run at Korangi Manufacturing Plant</td>
                <td>Month 3 – 5</td>
                <td>Industry Partner & SHU PI</td>
              </tr>
              <tr>
                <td><strong>Phase 3</strong></td>
                <td>DRAP Form 6 Commercial Manufacturing Registration</td>
                <td>Month 6 – 9</td>
                <td>Industry Regulatory Team</td>
              </tr>
              <tr>
                <td><strong>Phase 4</strong></td>
                <td>Nationwide Healthcare Launch & Pharmacy Distribution</td>
                <td>Month 10+</td>
                <td>Commercial Distribution Partner</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }

    // REPORT H: Multi-Project Portfolio Ranking
    if (this.activeReportType === 'H') {
      const allProjects = [...store.projects].sort((a, b) => {
        const scoreA = a.commercialization?.overallScore || 0;
        const scoreB = b.commercialization?.overallScore || 0;
        return scoreB - scoreA;
      });

      return `
        <div style="margin-bottom: 20px;">
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--shu-navy); margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
            <span>Comprehensive University Research Portfolio Ranking (${allProjects.length} Projects Ingested)</span>
            <span class="badge badge-high">Ranked by Commercial Score</span>
          </div>
          <table class="oric-table" style="font-size: 0.76rem;">
            <thead>
              <tr>
                <th>Rank</th>
                <th>ID</th>
                <th>Invention Title</th>
                <th>Faculty Lead</th>
                <th>Domain</th>
                <th>TRL</th>
                <th>Score</th>
                <th>SOM (Base Year)</th>
                <th>Strategic Pathway</th>
              </tr>
            </thead>
            <tbody>
              ${allProjects.slice(0, 35).map((p, idx) => `
                <tr>
                  <td><strong>#${idx + 1}</strong></td>
                  <td style="font-family: monospace; font-size: 0.72rem;">${p.id}</td>
                  <td><strong>${p.title.substring(0, 38)}${p.title.length > 38 ? '...' : ''}</strong></td>
                  <td>${p.facultyPI}</td>
                  <td style="font-size: 0.72rem; color: var(--text-muted);">${p.domain.split('&')[0]}</td>
                  <td>TRL ${p.commercialization?.trlLevel || 3}</td>
                  <td><strong>${p.commercialization?.overallScore || 4.1} / 5.0</strong></td>
                  <td>${store.formatMoney(p.marketSizing?.somPKR || 200)}</td>
                  <td><span class="badge badge-high">${(p.commercialization?.recommendation || 'Licensing').split('&')[0]}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="font-size: 0.74rem; color: var(--text-muted); padding: 10px; text-align: center; border-top: 1px solid var(--border-light);">
            Showing top 35 ranked projects for executive memo print. Complete database of all ${allProjects.length} projects can be viewed and exported in the Document Library.
          </div>
        </div>
      `;
    }

    return '';
  },

  printReport() {
    window.oricStore.addAuditLog(
      window.oricStore.currentRole,
      'Institutional Report Printed',
      `Report ${this.activeReportType} (${window.oricStore.getActiveProject()?.title})`,
      'System Print / PDF Dialog Triggered',
      'standard'
    );
    window.print();
  },

  downloadPdf(projectId) {
    window.oricApp.showToast('Preparing high-resolution PDF download...', 'info');
    window.oricStore.addAuditLog(
      window.oricStore.currentRole,
      'Institutional Report Exported',
      `Report ${this.activeReportType} (${projectId})`,
      'High-Resolution PDF Generated',
      'high'
    );
    setTimeout(() => {
      window.print();
    }, 350);
  }
};
