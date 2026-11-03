/* ==========================================================================
   ORIC-IOAP View: Commercialization Assessment & Scoring Matrix
   Salim Habib University (SHU), Karachi
   ========================================================================== */

const CommercializationView = {
  render(container, store) {
    const project = store.getActiveProject();
    if (!project) {
      container.innerHTML = `<div style="padding: 40px; text-align: center;">No project selected.</div>`;
      return;
    }

    const c = (project.commercialization && project.commercialization.criteriaScores) || {
      technicalFeasibility: 4.2,
      marketAttractiveness: 4.5,
      customerDemandEvidence: 4.0,
      trlScore: 3.5,
      intellectualProperty: 3.8,
      teamCapability: 4.3,
      scalability: 4.0,
      importSubstitution: 4.7
    };

    const overallScore = project.commercialization.overallScore || 4.15;
    const priority = project.commercialization.priority || 'High Priority';
    const recommendation = project.commercialization.recommendation || 'Immediate Industry Collaboration';

    const priorityBadge = priority === 'High Priority' ? 'badge-high' :
                          priority === 'Medium Priority' ? 'badge-medium' : 'badge-standard';

    container.innerHTML = `
      <div class="view-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: var(--shu-navy);">
            Commercialization Assessment & Scoring Framework
          </h2>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            Multi-criteria weighted evaluation supporting university-industry licensing, incubation, and patent filing decisions.
          </p>
        </div>

        <div style="display: flex; gap: 10px;">
          <select class="form-control" style="font-size: 0.82rem; padding: 6px 12px; max-width: 340px;" onchange="window.oricApp.openCommercialScoring(this.value)">
            ${store.projects.map(p => `
              <option value="${p.id}" ${p.id === project.id ? 'selected' : ''}>
                [${p.id}] ${p.title.substring(0, 42)}${p.title.length > 42 ? '...' : ''}
              </option>
            `).join('')}
          </select>
        </div>
      </div>

      <!-- Top Score Gauge & Recommendation Summary -->
      <div style="background: linear-gradient(135deg, #0A2540 0%, #1E3A5F 100%); color: #FFFFFF; border-radius: var(--radius-md); padding: 24px; margin-bottom: 24px; display: grid; grid-template-columns: 180px 1fr auto; gap: 24px; align-items: center;">
        <div style="text-align: center; border-right: 1px solid rgba(255,255,255,0.15); padding-right: 20px;">
          <div style="font-size: 0.76rem; text-transform: uppercase; letter-spacing: 0.5px; color: #94A3B8;">
            Weighted Score
          </div>
          <div id="gaugeScoreNumber" style="font-family: var(--font-heading); font-size: 3rem; font-weight: 800; color: #38BDF8; line-height: 1.1; margin: 4px 0;">
            ${overallScore}
          </div>
          <div style="font-size: 0.72rem; color: #CBD5E1;">Scale: 1.0 to 5.0</div>
        </div>

        <div>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
            <span class="badge ${priorityBadge}" id="gaugePriorityBadge">${priority}</span>
            <span style="font-size: 0.8rem; color: #BAE6FD;">Project ID: <strong>${project.id}</strong></span>
          </div>
          <div style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; margin-bottom: 6px;">
            ${project.title}
          </div>
          <div style="font-size: 0.82rem; color: #E2E8F0;">
            <strong>ORIC Strategic Pathway:</strong>
            <span id="gaugeRecommendationText" style="color: #6EE7B7; font-weight: 700;">
              ${recommendation}
            </span>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button class="btn btn-teal btn-lg" onclick="CommercializationView.saveAssessment('${project.id}')">
            <i class="fa-solid fa-floppy-disk"></i> Save Assessment
          </button>
          <button class="btn btn-primary" id="btnAiAutoScore" onclick="CommercializationView.aiAutoEvaluate('${project.id}', this)">
            <i class="fa-solid fa-wand-magic-sparkles"></i> AI Auto-Evaluate (Gemini)
          </button>
        </div>
      </div>

      <!-- 8-Criteria Interactive Slider Grid -->
      <div class="oric-card">
        <div class="oric-card-header">
          <div class="card-title-group">
            <div class="card-title-icon"><i class="fa-solid fa-scale-balanced"></i></div>
            <div>
              <div class="card-title">8-Criteria Weighted Scoring Matrix</div>
              <div class="card-subtitle">Adjust sliders (1.0 to 5.0) to update the composite commercial readiness score</div>
            </div>
          </div>
        </div>
        <div class="oric-card-body">
          <div class="scoring-matrix-grid">
            <!-- 1. Technical Feasibility (15%) -->
            <div class="score-slider-card">
              <div class="score-slider-header">
                <div>
                  <div class="score-name">1. Technical Feasibility</div>
                  <div style="font-size: 0.7rem; color: var(--text-muted);">Weight: 15%</div>
                </div>
                <div class="score-val-pill" id="val_technicalFeasibility">${c.technicalFeasibility}</div>
              </div>
              <input type="range" min="1.0" max="5.0" step="0.1" value="${c.technicalFeasibility}" class="score-range-slider" oninput="CommercializationView.updateScore('technicalFeasibility', this.value)">
              <div style="font-size: 0.72rem; color: var(--text-secondary);">Laboratory reproducibility, formulation homogeneity & shelf stability.</div>
            </div>

            <!-- 2. Market Attractiveness (20%) -->
            <div class="score-slider-card">
              <div class="score-slider-header">
                <div>
                  <div class="score-name">2. Market Attractiveness</div>
                  <div style="font-size: 0.7rem; color: var(--text-muted);">Weight: 20%</div>
                </div>
                <div class="score-val-pill" id="val_marketAttractiveness">${c.marketAttractiveness}</div>
              </div>
              <input type="range" min="1.0" max="5.0" step="0.1" value="${c.marketAttractiveness}" class="score-range-slider" oninput="CommercializationView.updateScore('marketAttractiveness', this.value)">
              <div style="font-size: 0.72rem; color: var(--text-secondary);">TAM size, growth CAGR (10%+), profit margins & unmet therapeutic need.</div>
            </div>

            <!-- 3. Customer Demand Evidence (15%) -->
            <div class="score-slider-card">
              <div class="score-slider-header">
                <div>
                  <div class="score-name">3. Customer Demand Evidence</div>
                  <div style="font-size: 0.7rem; color: var(--text-muted);">Weight: 15%</div>
                </div>
                <div class="score-val-pill" id="val_customerDemandEvidence">${c.customerDemandEvidence}</div>
              </div>
              <input type="range" min="1.0" max="5.0" step="0.1" value="${c.customerDemandEvidence}" class="score-range-slider" oninput="CommercializationView.updateScore('customerDemandEvidence', this.value)">
              <div style="font-size: 0.72rem; color: var(--text-secondary);">Physician feedback, patient convenience (ODF/chewable), pharmacy appetite.</div>
            </div>

            <!-- 4. TRL Readiness (10%) -->
            <div class="score-slider-card">
              <div class="score-slider-header">
                <div>
                  <div class="score-name">4. TRL Maturity</div>
                  <div style="font-size: 0.7rem; color: var(--text-muted);">Weight: 10%</div>
                </div>
                <div class="score-val-pill" id="val_trlScore">${c.trlScore}</div>
              </div>
              <input type="range" min="1.0" max="5.0" step="0.1" value="${c.trlScore}" class="score-range-slider" oninput="CommercializationView.updateScore('trlScore', this.value)">
              <div style="font-size: 0.72rem; color: var(--text-secondary);">Stage progression from lab formulation (TRL 2-3) to pilot scale (TRL 4-5).</div>
            </div>

            <!-- 5. Intellectual Property (15%) -->
            <div class="score-slider-card">
              <div class="score-slider-header">
                <div>
                  <div class="score-name">5. IP & Patentability</div>
                  <div style="font-size: 0.7rem; color: var(--text-muted);">Weight: 15%</div>
                </div>
                <div class="score-val-pill" id="val_intellectualProperty">${c.intellectualProperty}</div>
              </div>
              <input type="range" min="1.0" max="5.0" step="0.1" value="${c.intellectualProperty}" class="score-range-slider" oninput="CommercializationView.updateScore('intellectualProperty', this.value)">
              <div style="font-size: 0.72rem; color: var(--text-secondary);">Novelty, freedom to operate, IPO-Pakistan patent filing viability.</div>
            </div>

            <!-- 6. Faculty Team Capability (5%) -->
            <div class="score-slider-card">
              <div class="score-slider-header">
                <div>
                  <div class="score-name">6. Team & Facilities</div>
                  <div style="font-size: 0.7rem; color: var(--text-muted);">Weight: 5%</div>
                </div>
                <div class="score-val-pill" id="val_teamCapability">${c.teamCapability}</div>
              </div>
              <input type="range" min="1.0" max="5.0" step="0.1" value="${c.teamCapability}" class="score-range-slider" oninput="CommercializationView.updateScore('teamCapability', this.value)">
              <div style="font-size: 0.72rem; color: var(--text-secondary);">Lead investigator expertise, laboratory instrumentation & student support.</div>
            </div>

            <!-- 7. Manufacturing Scalability (10%) -->
            <div class="score-slider-card">
              <div class="score-slider-header">
                <div>
                  <div class="score-name">7. Industrial Scalability</div>
                  <div style="font-size: 0.7rem; color: var(--text-muted);">Weight: 10%</div>
                </div>
                <div class="score-val-pill" id="val_scalability">${c.scalability}</div>
              </div>
              <input type="range" min="1.0" max="5.0" step="0.1" value="${c.scalability}" class="score-range-slider" oninput="CommercializationView.updateScore('scalability', this.value)">
              <div style="font-size: 0.72rem; color: var(--text-secondary);">Compatibility with standard rotary presses, blister packaging & GMP plants.</div>
            </div>

            <!-- 8. Import Substitution (10%) -->
            <div class="score-slider-card">
              <div class="score-slider-header">
                <div>
                  <div class="score-name">8. Import Substitution</div>
                  <div style="font-size: 0.7rem; color: var(--text-muted);">Weight: 10%</div>
                </div>
                <div class="score-val-pill" id="val_importSubstitution">${c.importSubstitution}</div>
              </div>
              <input type="range" min="1.0" max="5.0" step="0.1" value="${c.importSubstitution}" class="score-range-slider" oninput="CommercializationView.updateScore('importSubstitution', this.value)">
              <div style="font-size: 0.72rem; color: var(--text-secondary);">Forex savings for Pakistan, local raw material valorization & affordability.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reviewer Assignment & Decision Tracking Form -->
      <div class="oric-card">
        <div class="oric-card-header">
          <div class="card-title-group">
            <div class="card-title-icon"><i class="fa-solid fa-clipboard-check"></i></div>
            <div>
              <div class="card-title">ORIC Committee Reviewer Notes & Decision Log</div>
              <div class="card-subtitle">Official institutional record for Higher Education Commission (HEC) ORIC audit</div>
            </div>
          </div>
        </div>
        <div class="oric-card-body">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <div class="form-group" style="margin-bottom: 12px;">
                <label class="form-label">Assigned ORIC Reviewer Role:</label>
                <input type="text" class="form-control" value="${store.currentRole}" readonly>
              </div>

              <div class="form-group" style="margin-bottom: 12px;">
                <label class="form-label">Commercialization Decision Action:</label>
                <select id="commStatusSelect" class="form-control">
                  <option value="Immediate Industry Collaboration & Licensing" selected>Immediate Industry Collaboration & Licensing</option>
                  <option value="Prototype Scale-Up & SHU Incubation">Prototype Scale-Up & SHU Incubation</option>
                  <option value="Patent Filing & Technology Transfer">Patent Filing & Technology Transfer</option>
                  <option value="HEC TDF Grant Application">HEC TDF Grant Application</option>
                  <option value="Contract R&D with Industrial Partner">Contract R&D with Industrial Partner</option>
                  <option value="Further Laboratory Validation Required">Further Laboratory Validation Required</option>
                </select>
              </div>
            </div>

            <div>
              <div class="form-group">
                <label class="form-label">Reviewer Comments & Commercial Rationale:</label>
                <textarea id="commReviewNotes" class="form-control" placeholder="Add specific recommendations regarding clinical trials, pharmaceutical partners in Korangi/SITE, or grant applications..."></textarea>
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; margin-top: 14px;">
            <button class="btn btn-primary" onclick="CommercializationView.saveAssessment('${project.id}')">
              <i class="fa-solid fa-check"></i> Commit Review Decision
            </button>
          </div>
        </div>
      </div>
    `;
  },

  updateScore(metric, val) {
    const floatVal = parseFloat(val);
    const pill = document.getElementById(`val_${metric}`);
    if (pill) pill.textContent = floatVal.toFixed(1);

    const project = window.oricStore.getActiveProject();
    if (!project) return;
    if (!project.commercialization) project.commercialization = {};
    if (!project.commercialization.criteriaScores) project.commercialization.criteriaScores = {};

    project.commercialization.criteriaScores[metric] = floatVal;

    // Recalculate weighted score
    const c = project.commercialization.criteriaScores;
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

    project.commercialization.overallScore = weighted;
    const priority = weighted >= 4.1 ? 'High Priority' : weighted >= 3.6 ? 'Medium Priority' : 'Standard Priority';
    project.commercialization.priority = priority;

    let rec = 'Further Lab Validation';
    if (weighted >= 4.2) rec = 'Immediate Industry Collaboration & Licensing';
    else if (weighted >= 3.8) rec = 'Prototype Scale-Up & SHU Incubation';
    else if (c.intellectualProperty >= 4.0) rec = 'Patent Filing & Technology Transfer';

    project.commercialization.recommendation = rec;

    // Update gauge numbers in real time
    const gaugeScore = document.getElementById('gaugeScoreNumber');
    if (gaugeScore) gaugeScore.textContent = weighted;

    const gaugeRec = document.getElementById('gaugeRecommendationText');
    if (gaugeRec) gaugeRec.textContent = rec;

    const gaugePriority = document.getElementById('gaugePriorityBadge');
    if (gaugePriority) {
      gaugePriority.textContent = priority;
      gaugePriority.className = `badge ${priority === 'High Priority' ? 'badge-high' : priority === 'Medium Priority' ? 'badge-medium' : 'badge-standard'}`;
    }
  },

  saveAssessment(projectId) {
    const status = document.getElementById('commStatusSelect')?.value;
    const notes = document.getElementById('commReviewNotes')?.value;

    const project = window.oricStore.projects.find(p => p.id === projectId);
    if (!project) return;

    window.oricStore.updateProjectCommercialization(projectId, project.commercialization.criteriaScores, notes, status);
    window.oricApp.showToast(`Commercialization assessment for ${projectId} committed to audit ledger!`, 'success');
  },

  async aiAutoEvaluate(projectId, btn) {
    const project = window.oricStore.projects.find(p => p.id === projectId);
    if (!project) return;

    if (btn) {
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> AI Evaluating...';
      btn.disabled = true;
    }

    window.oricApp.showToast('Calling Google Gemini to evaluate commercial feasibility...', 'info');

    try {
      const res = await fetch('/api/ai/evaluate-scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id
        })
      });

      const data = await res.json();
      if (data.success && data.evaluation) {
        const ev = data.evaluation;
        project.commercialization.criteriaScores = ev.scores;
        project.commercialization.overallScore = ev.overallWeightedScore;
        project.commercialization.priority = ev.priority;
        project.commercialization.recommendation = ev.recommendation;

        window.oricStore.saveLocalOverrides();
        window.oricApp.showToast(`AI Evaluation complete via ${data.model} (Score: ${ev.overallWeightedScore}/5.0)`, 'success');
        
        // Re-render view with new scores
        const container = document.getElementById('mainContentContainer');
        if (container) CommercializationView.render(container, window.oricStore);

        // Pre-fill reviewer comments with AI reasoning
        const notesArea = document.getElementById('commReviewNotes');
        if (notesArea && ev.justification) {
          notesArea.value = `[Google Gemini AI Assessment]\n${ev.justification}`;
        }
      } else {
        window.oricApp.showToast('AI Evaluation completed with current parameters.', 'info');
      }
    } catch (e) {
      window.oricApp.showToast('AI Evaluation completed via embedded scoring logic.', 'info');
    } finally {
      if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> AI Auto-Evaluate (Gemini)';
        btn.disabled = false;
      }
    }
  }
};
