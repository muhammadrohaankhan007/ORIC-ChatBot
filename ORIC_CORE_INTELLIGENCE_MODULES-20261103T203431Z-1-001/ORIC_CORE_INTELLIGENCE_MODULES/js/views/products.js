/* ==========================================================================
   ORIC-IOAP View: Product & Service Commercial Catalog
   Salim Habib University (SHU), Karachi
   ========================================================================== */

const ProductsView = {
  currentCategory: 'all',
  searchQuery: '',
  displayLimit: 48,

  render(container, store) {
    const projects = store.projects || [];
    
    // Collect all products from all projects
    const allProducts = [];
    projects.forEach(p => {
      if (p.products && p.products.length > 0) {
        p.products.forEach(prod => {
          allProducts.push({
            ...prod,
            projectId: p.id,
            projectTitle: p.title,
            courseTitle: p.courseTitle,
            facultyPI: p.facultyPI,
            domain: p.domain,
            priority: p.commercialization?.priority || 'Standard Priority'
          });
        });
      }
    });

    // Apply filtering
    let filtered = allProducts;
    if (this.currentCategory !== 'all') {
      const cat = this.currentCategory.toLowerCase();
      filtered = filtered.filter(pr => (pr.dosageForm || '').toLowerCase().includes(cat));
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(pr =>
        pr.name.toLowerCase().includes(q) ||
        (pr.dosageForm && pr.dosageForm.toLowerCase().includes(q)) ||
        (pr.targetCustomer && pr.targetCustomer.toLowerCase().includes(q)) ||
        (pr.differentiation && pr.differentiation.toLowerCase().includes(q)) ||
        (pr.projectId && pr.projectId.toLowerCase().includes(q))
      );
    }

    const visibleProducts = filtered.slice(0, this.displayLimit);

    container.innerHTML = `
      <div class="view-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: var(--shu-navy);">
            Commercial Products & Services Catalog
          </h2>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            Marketable healthcare formulations, medical devices, cosmeceuticals, functional foods, and laboratory services spun off from SHU research.
          </p>
        </div>
        <div style="display: flex; gap: 8px;">
          <span class="badge badge-high" style="font-size: 0.85rem; padding: 6px 14px;">
            <i class="fa-solid fa-pills"></i> ${allProducts.length} Formulations Cataloged
          </span>
          <span class="badge badge-standard" style="font-size: 0.85rem; padding: 6px 14px;">
            Showing ${visibleProducts.length} of ${filtered.length}
          </span>
        </div>
      </div>

      <!-- Controls: Category Pills & Live Search -->
      <div style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 14px 18px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
        <!-- Filter Pills -->
        <div id="productFilterPills" style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px;">
          <button class="btn btn-sm ${this.currentCategory === 'all' ? 'btn-primary' : 'btn-secondary'}" onclick="ProductsView.filterCategory('all', this)">All Dosage Forms</button>
          <button class="btn btn-sm ${this.currentCategory === 'effervescent' ? 'btn-primary' : 'btn-secondary'}" onclick="ProductsView.filterCategory('effervescent', this)">Effervescent Tablets</button>
          <button class="btn btn-sm ${this.currentCategory === 'film' ? 'btn-primary' : 'btn-secondary'}" onclick="ProductsView.filterCategory('film', this)">Oral Dissolving Films</button>
          <button class="btn btn-sm ${this.currentCategory === 'gummy' ? 'btn-primary' : 'btn-secondary'}" onclick="ProductsView.filterCategory('gummy', this)">Nutra Gummies</button>
          <button class="btn btn-sm ${this.currentCategory === 'wound' ? 'btn-primary' : 'btn-secondary'}" onclick="ProductsView.filterCategory('wound', this)">Wound Biopolymers</button>
          <button class="btn btn-sm ${this.currentCategory === 'topical' ? 'btn-primary' : 'btn-secondary'}" onclick="ProductsView.filterCategory('topical', this)">Cosmeceuticals</button>
          <button class="btn btn-sm ${this.currentCategory === 'software' ? 'btn-primary' : 'btn-secondary'}" onclick="ProductsView.filterCategory('software', this)">Digital Health / AI</button>
        </div>

        <!-- Search Input -->
        <div style="position: relative; width: 240px; max-width: 100%;">
          <input type="text" placeholder="Search product or dosage..." value="${this.searchQuery}" class="form-control" style="font-size: 0.8rem; padding: 6px 12px 6px 30px;" oninput="ProductsView.handleSearch(this.value)">
          <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 0.78rem; color: var(--text-muted);"></i>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="spotlight-grid" id="productsCatalogGrid">
        ${visibleProducts.length === 0 ? `
          <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted); background: #FFFFFF; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
            No formulations match the selected dosage filter or search term.
            <div style="margin-top: 10px;">
              <button class="btn btn-sm btn-secondary" onclick="ProductsView.filterCategory('all', this)">Reset All Filters</button>
            </div>
          </div>
        ` : visibleProducts.map(prod => `
          <div class="oric-card product-item-card" data-dosage="${prod.dosageForm}" style="margin-bottom: 0; display: flex; flex-direction: column; justify-content: space-between;">
            <div class="oric-card-body" style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                  <span class="sector-tag" style="font-size: 0.68rem;">
                    ${prod.dosageForm}
                  </span>
                  <span style="font-family: monospace; font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">
                    ${prod.projectId}
                  </span>
                </div>

                <div style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 700; color: var(--shu-navy); margin-bottom: 6px; line-height: 1.3;">
                  ${prod.name}
                </div>

                <div style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 8px; line-height: 1.4;">
                  <strong>Target:</strong> ${prod.targetCustomer}
                </div>

                <div style="font-size: 0.76rem; color: var(--text-muted); margin-bottom: 12px; background: #F8FAFC; padding: 8px 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-light); line-height: 1.4;">
                  <i class="fa-solid fa-sparkles text-amber"></i> ${prod.differentiation || 'High stability localized excipients'}
                </div>
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; align-items: baseline; border-top: 1px solid var(--border-light); padding-top: 10px; margin-bottom: 12px;">
                  <div>
                    <div style="font-size: 0.7rem; color: var(--text-muted);">Proposed Price</div>
                    <div style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; color: var(--shu-emerald);">
                      ${store.formatPrice(prod.sellingPricePKR)}
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 0.7rem; color: var(--text-muted);">Unit Cost</div>
                    <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">
                      ${store.formatPrice(prod.unitCostPKR)}
                    </div>
                  </div>
                </div>

                <button class="btn btn-sm btn-primary" style="width: 100%;" onclick="window.oricApp.openProjectDossier('${prod.projectId}')">
                  View Full Commercial Dossier <i class="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Load More Button -->
      ${filtered.length > this.displayLimit ? `
        <div style="text-align: center; margin-top: 24px;">
          <button class="btn btn-navy" onclick="ProductsView.loadMore()">
            <i class="fa-solid fa-angles-down"></i> Load More Formulations (${filtered.length - this.displayLimit} remaining)
          </button>
        </div>
      ` : ''}
    `;
  },

  filterCategory(cat, btn) {
    this.currentCategory = cat;
    this.render(document.getElementById('mainContentContainer'), window.oricStore);
  },

  handleSearch(query) {
    this.searchQuery = query;
    this.render(document.getElementById('mainContentContainer'), window.oricStore);
  },

  loadMore() {
    this.displayLimit += 48;
    this.render(document.getElementById('mainContentContainer'), window.oricStore);
  }
};
