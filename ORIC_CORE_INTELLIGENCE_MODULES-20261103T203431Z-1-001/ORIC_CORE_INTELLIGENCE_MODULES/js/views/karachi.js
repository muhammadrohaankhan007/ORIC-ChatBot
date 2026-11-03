/* ==========================================================================
   ORIC-IOAP View: Karachi Industrial Intelligence Module
   Salim Habib University (SHU), Karachi
   ========================================================================== */

const KarachiView = {
  activeEstateId: 'KIA-01',

  render(container, store) {
    const estates = store.industrialAreas || [];
    const activeEstate = estates.find(e => e.id === this.activeEstateId) || estates[0];
    const projects = store.projects || [];

    // Filter projects matched with active estate
    const matchedProjects = projects.filter(p =>
      p.matchedAreas && p.matchedAreas.some(a => a.id === activeEstate.id || a.name.includes(activeEstate.name.split(' ')[0]))
    );

    container.innerHTML = `
      <div class="view-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: var(--shu-navy);">
            Karachi Industrial Intelligence & Cluster Mapping
          </h2>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            Deep-dive industrial area profiles, infrastructure diagnostics, supply chain characteristics, and candidate university-industry partner matching.
          </p>
        </div>
        <div>
          <span class="badge badge-high" style="font-size: 0.85rem; padding: 6px 14px;">
            <i class="fa-solid fa-map-location-dot"></i> 10 Industrial Estates Profiled
          </span>
        </div>
      </div>

      <!-- Quick Selector Bar for 10 Industrial Estates -->
      <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 12px; margin-bottom: 22px;">
        ${estates.map(e => `
          <button class="btn btn-sm ${e.id === this.activeEstateId ? 'btn-primary' : 'btn-secondary'}" 
                  style="white-space: nowrap;" 
                  onclick="KarachiView.selectEstate('${e.id}')">
            <i class="fa-solid fa-city" style="margin-right: 4px;"></i> ${e.name.replace(' Industrial Area', '').replace(' Industrial Zone', '')}
          </button>
        `).join('')}
      </div>

      <!-- Active Estate Detailed Dossier -->
      <div class="oric-card" style="margin-bottom: 24px;">
        <div class="dossier-header-card" style="margin-bottom: 0; border-radius: var(--radius-md) var(--radius-md) 0 0;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 12px;">
            <div>
              <span class="badge badge-standard" style="background: rgba(255,255,255,0.2); color: #FFFFFF; border-color: rgba(255,255,255,0.3);">
                ${activeEstate.id} • ${activeEstate.type}
              </span>
              <div class="dossier-title" style="margin-top: 8px; margin-bottom: 4px;">
                ${activeEstate.name}
              </div>
              <div style="font-size: 0.82rem; color: #BAE6FD; font-weight: 600;">
                <i class="fa-solid fa-building-flag"></i> ${activeEstate.association}
              </div>
            </div>

            <div style="text-align: right; background: rgba(0,0,0,0.25); padding: 12px 18px; border-radius: var(--radius-sm);">
              <div style="font-size: 0.72rem; color: #94A3B8;">Estimated Annual Area Turnover</div>
              <div style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800; color: #38BDF8;">
                ${activeEstate.annualTurnoverEst}
              </div>
              <div style="font-size: 0.7rem; color: #CBD5E1;">${activeEstate.unitsCount}</div>
            </div>
          </div>

          <div class="dossier-meta-chips">
            <span><i class="fa-solid fa-calendar-check"></i> Established: ${activeEstate.establishedYear}</span>
            <span><i class="fa-solid fa-ruler-combined"></i> Footprint: ${activeEstate.areaSqKm}</span>
            <span><i class="fa-solid fa-location-crosshairs"></i> GPS: ${activeEstate.coordinates.lat.toFixed(4)}° N, ${activeEstate.coordinates.lng.toFixed(4)}° E</span>
            <span><i class="fa-solid fa-database"></i> Source: ${activeEstate.dataSource}</span>
          </div>
        </div>

        <div class="oric-card-body">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <!-- Verified Sectors & Infrastructure -->
            <div>
              <div style="font-weight: 700; color: var(--shu-navy); font-size: 0.9rem; margin-bottom: 10px;">
                <i class="fa-solid fa-boxes-stacked text-primary"></i> Verified Operating Sectors:
              </div>
              <div class="sector-tags" style="margin-bottom: 18px;">
                ${activeEstate.verifiedSectors.map(sec => `
                  <span class="sector-tag" style="padding: 5px 12px; font-size: 0.78rem;">
                    <i class="fa-solid fa-check"></i> ${sec}
                  </span>
                `).join('')}
              </div>

              <div style="font-weight: 700; color: var(--shu-navy); font-size: 0.9rem; margin-bottom: 6px;">
                <i class="fa-solid fa-bolt text-amber"></i> Available Infrastructure & Utilities:
              </div>
              <div style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.6; background: #F8FAFC; padding: 12px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
                ${activeEstate.infrastructure}
              </div>
            </div>

            <!-- Challenges & Tech Adoption Potential -->
            <div>
              <div style="font-weight: 700; color: var(--shu-navy); font-size: 0.9rem; margin-bottom: 6px;">
                <i class="fa-solid fa-triangle-exclamation text-rose"></i> Logistics Constraints & Environmental Challenges:
              </div>
              <div style="font-size: 0.82rem; color: #7F1D1D; line-height: 1.6; background: #FEF2F2; padding: 12px 14px; border-radius: var(--radius-sm); border: 1px solid #FECACA; margin-bottom: 16px;">
                ${activeEstate.logisticsConstraints}
              </div>

              <div style="font-weight: 700; color: var(--shu-navy); font-size: 0.9rem; margin-bottom: 6px;">
                <i class="fa-solid fa-microchip text-teal"></i> Technology Adoption Opportunities:
              </div>
              <div style="font-size: 0.82rem; color: #14532D; line-height: 1.6; background: #F0FDF4; padding: 12px 14px; border-radius: var(--radius-sm); border: 1px solid #BBF7D0;">
                ${activeEstate.techAdoptionPotential}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Matched University Projects for this Estate -->
      <div class="oric-card">
        <div class="oric-card-header">
          <div class="card-title-group">
            <div class="card-title-icon"><i class="fa-solid fa-handshake"></i></div>
            <div>
              <div class="card-title">Matching Salim Habib University Research Projects (${matchedProjects.length})</div>
              <div class="card-subtitle">Inventions tailored to manufacturers, formulators, and distributors in ${activeEstate.name}</div>
            </div>
          </div>
        </div>
        <div class="oric-card-body" style="padding: 0;">
          <div class="table-responsive" style="border: none;">
            <table class="oric-table">
              <thead>
                <tr>
                  <th>Invention & Project ID</th>
                  <th>Faculty Investigator</th>
                  <th>Domain</th>
                  <th>Candidate Partner Enterprises</th>
                  <th>Alignment Score</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${matchedProjects.slice(0, 10).map(p => {
                  const matchInfo = p.matchedAreas.find(a => a.id === activeEstate.id) || p.matchedAreas[0] || {};
                  return `
                    <tr>
                      <td>
                        <a class="table-project-title" onclick="window.oricApp.openProjectDossier('${p.id}')">
                          ${p.title}
                        </a>
                        <div style="font-size: 0.72rem; color: var(--text-muted); font-family: monospace;">${p.id}</div>
                      </td>
                      <td>
                        <div style="font-size: 0.8rem; font-weight: 600; color: var(--shu-navy);">${p.facultyPI}</div>
                        <div style="font-size: 0.7rem; color: var(--text-muted);">${p.courseCode}</div>
                      </td>
                      <td>
                        <span class="badge badge-standard">${p.domain.split('&')[0]}</span>
                      </td>
                      <td>
                        <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                          ${(matchInfo.targetEnterprises || ["Local KATI/LATI Formulators"]).slice(0, 3).map(comp => `
                            <span style="background: #F1F5F9; border: 1px solid #CBD5E1; font-size: 0.7rem; font-weight: 600; padding: 2px 6px; border-radius: var(--radius-sm);">
                              ${comp}
                            </span>
                          `).join('')}
                        </div>
                      </td>
                      <td>
                        <span class="badge badge-high">${matchInfo.relevanceScore || 90}% Fit</span>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-primary" onclick="window.oricApp.openProjectDossier('${p.id}')">
                          Dossier <i class="fa-solid fa-arrow-right"></i>
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  selectEstate(id) {
    this.activeEstateId = id;
    this.render(document.getElementById('karachiViewContainer'), window.oricStore);
  }
};
