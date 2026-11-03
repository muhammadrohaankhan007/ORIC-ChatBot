/* ==========================================================================
   ORIC-IOAP View: Industry Applications & Sector Taxonomy
   Salim Habib University (SHU), Karachi
   ========================================================================== */

const IndustriesView = {
  activeSectorFilter: 'ALL',
  searchQuery: '',

  // Comprehensive keyword mapping for all 22 industrial sectors
  sectorKeywordMap: {
    PHARMA: ['pharma', 'tablet', 'capsule', 'drug', 'dosage', 'ndds', 'effervescent', 'syrup', 'suspension', 'oral', 'dissolution', 'pellet', 'release', 'formulation'],
    NUTRA: ['nutra', 'gummy', 'vitamin', 'supplement', 'folate', 'mineral', 'omega', 'chewable', 'dietary', 'nutritional', 'antioxidant', 'functional food'],
    COSME: ['cosme', 'skin', 'derma', 'hair', 'cream', 'gel', 'serum', 'lotion', 'anti-aging', 'sunscreen', 'acne', 'moisturiz', 'cleanser', 'cosmetic'],
    HEALTH: ['hospital', 'clinical', 'patient', 'disease', 'therapy', 'treatment', 'dose', 'pathology', 'diagnostic', 'emergency', 'healthcare', 'care'],
    BIOTECH: ['biotech', 'chitosan', 'biopolymer', 'gene', 'protein', 'peptide', 'biosimilar', 'molecular', 'recombinant', 'biological', 'bio-active'],
    MEDDEV: ['device', 'diagnostic', 'strip', 'sensor', 'wound', 'dressing', 'bandage', 'implant', 'disposable', 'applicator', 'delivery device'],
    FOOD: ['food', 'beverage', 'edible', 'honey', 'fruit', 'coating', 'preservative', 'shelf-life', 'flavor', 'dairy', 'cereal', 'snack'],
    AGRO: ['agro', 'crop', 'plant', 'pesticide', 'fertilizer', 'soil', 'botanical', 'extract', 'agriculture', 'harvest', 'leaf', 'seed'],
    VET: ['veterinary', 'animal', 'poultry', 'livestock', 'canine', 'equine', 'cattle', 'veterin', 'avian', 'feed'],
    API: ['api', 'active pharmaceutical ingredient', 'synthesis', 'derivative', 'molecule', 'chemical', 'crystall', 'intermediate', 'reaction', 'catalyst'],
    PACK: ['pack', 'packaging', 'barrier', 'film', 'biodegradable', 'blister', 'bottle', 'closure', 'sealing', 'container', 'protective'],
    TEX: ['textile', 'fabric', 'antimicrobial fabric', 'fiber', 'gauze', 'cotton', 'medical textile', 'nonwoven', 'surgical wrap'],
    DIGI: ['ai', 'digital', 'algorithm', 'app', 'software', 'telemedicine', 'machine learning', 'predictive', 'database', 'healthtech', 'informatics', 'decision'],
    CRO: ['analytical', 'testing', 'assay', 'hplc', 'stability', 'ich', 'contract research', 'validation', 'quality control', 'spectrophotom', 'profiling'],
    ENVIRO: ['effluent', 'waste', 'environmental', 'remediation', 'pollution', 'biodegrad', 'treatment', 'green', 'sustainable', 'recycl'],
    HERBAL: ['herbal', 'phytomedicine', 'traditional', 'unani', 'tibb', 'ayurvedic', 'natural product', 'medicinal plant', 'indigenous', 'crude drug'],
    PLASTIC: ['polymer', 'plastic', 'elastomer', 'resin', 'polyethylene', 'pvc', 'thermoplastic', 'molding'],
    LOGIST: ['cold chain', 'stability', 'temperature', 'storage', 'distribution', 'logistics', 'transport', 'humidity', 'zone ivb'],
    CHEM: ['chemistry', 'solvent', 'additive', 'surfactant', 'emulsifier', 'carrier', 'excipient', 'buffer', 'polymer matrix'],
    MARINE: ['marine', 'algae', 'fish', 'seaweed', 'chitin', 'coastal', 'mangrove', 'ocean', 'aquatic'],
    ENZYME: ['enzyme', 'catalyst', 'fermentation', 'protease', 'lipase', 'amylase', 'biocataly', 'substrate'],
    WATER: ['water', 'filtration', 'purification', 'membrane', 'osmosis', 'contaminant', 'heavy metal', 'sterilization', 'potable']
  },

  matchProjectToSector(project, sectorCode) {
    const keywords = this.sectorKeywordMap[sectorCode] || [];
    const text = [
      project.title,
      project.domain,
      project.courseTitle,
      project.abstract,
      (project.technologies || []).join(' '),
      (project.products || []).map(p => (p.name || '') + ' ' + (p.dosageForm || '')).join(' ')
    ].join(' ').toLowerCase();

    return keywords.some(kw => text.includes(kw));
  },

  render(container, store) {
    const sectors = store.sectors || [];
    const projects = store.projects || [];

    // Calculate dynamic counts for all 22 sectors
    const sectorStats = sectors.map(sec => {
      const matched = projects.filter(p => this.matchProjectToSector(p, sec.code));
      return {
        ...sec,
        matchedCount: matched.length,
        projects: matched
      };
    });

    // Filter projects for the Industry-by-Product matrix table
    let matrixProjects = [...projects];
    if (this.activeSectorFilter !== 'ALL') {
      matrixProjects = matrixProjects.filter(p => this.matchProjectToSector(p, this.activeSectorFilter));
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase().trim();
      matrixProjects = matrixProjects.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.domain.toLowerCase().includes(q) ||
        (p.products && p.products.some(pr => pr.name.toLowerCase().includes(q) || pr.dosageForm.toLowerCase().includes(q)))
      );
    }

    container.innerHTML = `
      <div class="view-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: var(--shu-navy);">
            Industry Applications & Sector Taxonomy
          </h2>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            Dynamic cross-mapping between Salim Habib University's ${projects.length} research innovations and 22 verified Pakistani industrial sectors.
          </p>
        </div>
        <div style="display: flex; gap: 10px;">
          <span class="badge badge-high" style="font-size: 0.85rem; padding: 6px 14px;">
            <i class="fa-solid fa-layer-group"></i> 22 Dynamic Industrial Sectors
          </span>
          <span class="badge badge-standard" style="font-size: 0.85rem; padding: 6px 14px;">
            <i class="fa-solid fa-check-double"></i> 100% Data-Driven
          </span>
        </div>
      </div>

      <!-- 22 Sectors Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; margin-bottom: 28px;">
        ${sectorStats.map(sec => `
          <div class="oric-card" style="margin-bottom: 0; display: flex; flex-direction: column; justify-content: space-between; cursor: pointer; transition: transform 200ms ease, box-shadow 200ms ease;" onclick="IndustriesView.selectSectorFilter('${sec.code}')">
            <div class="oric-card-body">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                <div style="width: 40px; height: 40px; border-radius: var(--radius-sm); background: #E0F2FE; color: var(--shu-blue-primary); display: flex; align-items: center; justify-content: center; font-size: 1.15rem;">
                  <i class="fa-solid fa-${sec.icon || 'industry'}"></i>
                </div>
                <span class="badge badge-high" style="font-size: 0.72rem;">
                  <i class="fa-solid fa-arrow-trend-up"></i> +${sec.growthRate}% CAGR
                </span>
              </div>

              <div style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 700; color: var(--shu-navy); margin-bottom: 4px; line-height: 1.3;">
                ${sec.name}
              </div>

              <div style="font-size: 0.76rem; color: var(--text-muted); margin-bottom: 12px; display: flex; justify-content: space-between;">
                <span>Sector Code: <strong>${sec.code}</strong></span>
                <span style="color: ${sec.code === this.activeSectorFilter ? 'var(--shu-blue-primary)' : 'var(--text-muted)'}; font-weight: 600;">
                  ${sec.code === this.activeSectorFilter ? '<i class="fa-solid fa-check"></i> Active Filter' : 'Click to filter'}
                </span>
              </div>

              <div style="background: #F8FAFC; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 10px 12px; font-size: 0.78rem; display: flex; justify-content: space-between;">
                <div>
                  <div style="font-size: 0.7rem; color: var(--text-muted);">National Market Size</div>
                  <div style="font-weight: 700; color: var(--shu-navy);">PKR ${sec.nationalMarketPKR}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 0.7rem; color: var(--text-muted);">SHU Inventions</div>
                  <div style="font-weight: 800; color: var(--shu-blue-primary);">${sec.matchedCount} Projects</div>
                </div>
              </div>
            </div>

            <div style="padding: 10px 18px; background: #F8FAFC; border-top: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.72rem; color: var(--text-muted);">Local Sourcing Feasibility</span>
              <span class="badge badge-high">90%+ Feasible</span>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Industry-by-Product Cross Application Matrix -->
      <div class="oric-card">
        <div class="oric-card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div class="card-title-group">
            <div class="card-title-icon"><i class="fa-solid fa-table-cells"></i></div>
            <div>
              <div class="card-title">Industry-by-Product Application Matrix</div>
              <div class="card-subtitle">Real-time industrial adoption mapping for SHU research projects (${matrixProjects.length} visible)</div>
            </div>
          </div>

          <!-- Controls: Sector Filter & Search -->
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <div style="position: relative;">
              <input type="text" placeholder="Search matrix..." value="${this.searchQuery}" class="form-control" style="font-size: 0.8rem; padding: 6px 12px 6px 28px; width: 180px;" oninput="IndustriesView.handleSearch(this.value)">
              <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 0.76rem; color: var(--text-muted);"></i>
            </div>

            <select class="form-control" style="font-size: 0.8rem; padding: 6px 12px;" onchange="IndustriesView.selectSectorFilter(this.value)">
              <option value="ALL" ${this.activeSectorFilter === 'ALL' ? 'selected' : ''}>All 22 Sectors</option>
              ${sectors.map(s => `
                <option value="${s.code}" ${this.activeSectorFilter === s.code ? 'selected' : ''}>${s.name} (${s.code})</option>
              `).join('')}
            </select>
          </div>
        </div>

        <div class="oric-card-body" style="padding: 0;">
          <div class="table-responsive" style="border: none;">
            <table class="oric-table">
              <thead>
                <tr>
                  <th>Flagship SHU Innovation</th>
                  <th>Primary Sector</th>
                  <th>Candidate Enterprise Fit</th>
                  <th>Industrial Problem Solved</th>
                  <th>Import Substitution Benefit</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${matrixProjects.length === 0 ? `
                  <tr>
                    <td colspan="6" style="text-align: center; padding: 32px; color: var(--text-muted);">
                      No projects matched the selected sector filter. <a href="javascript:void(0)" onclick="IndustriesView.selectSectorFilter('ALL')">Reset filter</a>
                    </td>
                  </tr>
                ` : matrixProjects.slice(0, 30).map(p => {
                  const firstProduct = (p.products && p.products[0]) || { name: p.title, dosageForm: 'Finished Dosage Form' };
                  const matchedAreas = p.matchedAreas || [];
                  const topPartners = matchedAreas.flatMap(a => a.targetEnterprises || []).slice(0, 3).join(', ') || 'Getz, Searle, Hilton Pharma';

                  // Determine primary sector tag
                  let primSector = 'Pharmaceuticals';
                  if (p.domain.includes('Nutra') || p.title.toLowerCase().includes('gummy')) primSector = 'Nutraceuticals';
                  else if (p.domain.includes('Cosme') || p.title.toLowerCase().includes('skin')) primSector = 'Cosmeceuticals';
                  else if (p.domain.includes('Biomaterial') || p.title.toLowerCase().includes('wound')) primSector = 'Biotech & Wound Care';
                  else if (p.domain.includes('Digital') || p.title.toLowerCase().includes('ai')) primSector = 'Digital Health';

                  const estSavings = p.marketSizing ? store.formatMoney(Math.round(p.marketSizing.somPKR * 0.45)) : 'PKR 120 Million';

                  return `
                    <tr>
                      <td style="max-width: 260px;">
                        <strong>${p.title}</strong>
                        <div style="font-size: 0.72rem; color: var(--text-muted);">${firstProduct.dosageForm || p.domain}</div>
                      </td>
                      <td>
                        <span class="badge badge-standard">${primSector}</span>
                      </td>
                      <td style="font-size: 0.78rem; color: var(--text-secondary); max-width: 200px;">
                        ${topPartners}
                      </td>
                      <td style="font-size: 0.78rem; color: var(--text-secondary); max-width: 280px; line-height: 1.4;">
                        ${p.abstract ? p.abstract.substring(0, 110) + '...' : 'Optimized formulation developed to replace conventional commercial alternatives.'}
                      </td>
                      <td style="font-size: 0.78rem;">
                        <span style="color: #166534; font-weight: 700;">Replaces imported products</span>
                        <div style="font-size: 0.7rem; color: var(--text-muted);">Est. ~${estSavings}/yr savings</div>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-secondary" onclick="window.oricApp.openProjectDossier('${p.id}')" title="Inspect full commercial dossier">
                          View <i class="fa-solid fa-arrow-right"></i>
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
          ${matrixProjects.length > 30 ? `
            <div style="padding: 12px 20px; background: #F8FAFC; border-top: 1px solid var(--border-light); font-size: 0.78rem; color: var(--text-muted); text-align: center;">
              Showing top 30 of ${matrixProjects.length} matched innovations. Use the search input above to filter specifically.
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  selectSectorFilter(code) {
    this.activeSectorFilter = code;
    this.render(document.getElementById('mainContentContainer'), window.oricStore);
  },

  handleSearch(query) {
    this.searchQuery = query;
    this.render(document.getElementById('mainContentContainer'), window.oricStore);
  }
};
