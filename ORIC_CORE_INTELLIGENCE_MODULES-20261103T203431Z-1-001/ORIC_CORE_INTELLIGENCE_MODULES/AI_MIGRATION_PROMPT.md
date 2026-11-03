# AI Migration & Implementation Instruction Prompt

> **Copy and paste the prompt below into the AI assistant of your new project.**  
> It contains the exact technical specification and execution instructions to integrate the ORIC Core Intelligence & Governance platform into your target project without any missing parts or runtime errors.

---

```markdown
# TASK: Integrate Core Intelligence & Governance Modules into this Project

I have extracted a complete, self-contained module package from our ORIC Platform located in the folder `ORIC_CORE_INTELLIGENCE_MODULES/`.
I need you to integrate the core intelligence and governance functionality from this folder into this codebase.

Please follow these exact requirements to ensure zero runtime errors ("no crumbs left behind"):

---

### 1. SCOPE OF FUNCTIONALITY TO IMPLEMENT
You must implement the following 6 core functional pages with full interactive capabilities:

1. **Executive Dashboard (`views/dashboard.js`)**:
   - Executive KPIs (Total projects, Addressable Market in PKR/USD, Commercial Products, High-Priority Deals count, Industrial Zones count).
   - Chart.js Doughnut Chart for Research Domains & Formulations distribution.
   - Chart.js Horizontal Bar Chart for Karachi Industrial Areas project matching.
   - High-Priority Innovation Spotlight cards with SOM valuation and quick link to the AI Dossier.
   - Reactive currency switcher (PKR / USD at 280 PKR/USD benchmark).

2. **Document Upload & Ingestion Pipeline (`views/upload.js`)**:
   - 6-Stage visual extraction pipeline (Integrity scan -> Text parsing -> OCR -> AI concept extraction -> Industrial cluster fit -> Commercial score).
   - Drag-and-drop file upload zone supporting PDF, DOCX, XLSX, PPTX, TXT, CSV (up to 30MB).
   - Metadata intake form (Title, Department, PI, Domain, TRL, IP Status, Funding, Abstract).
   - Backend upload endpoint `/api/upload` (with Multer and Gemini AI extraction) + automatic fallback to client-side dynamic synthesis if offline.

3. **Document Library & Research Repository (`views/library.js`)**:
   - Real-time multi-filter search: keyword text query, Course dropdown, Research Domain dropdown, Commercial Priority dropdown, and Industrial Area dropdown.
   - 15-item responsive pagination with active page indicators.
   - Native **"Import CSV Data"** button with automated column mapper (accepts any custom CSV with headers like ID, Title, PI, Abstract, Course, Domain, TRL, etc.) and auto-synthesizes missing nested objects.
   - Native **"Export Table (CSV)"** button for downloading current filtered records.

4. **AI Intelligence Dossier (`views/intelligence.js`)**:
   - Deep 6-sub-tab project inspection:
     1. Executive Summary & Clinical Unmet Need
     2. Technology & Scientific Principles (with TRL badge)
     3. Commercial Products (unit cost, selling price, gross margin %, target customer, differentiation)
     4. Industrial Testing Services (protocols and PKR fee schedule)
     5. Karachi Industrial Area Fit & Candidate Enterprise Partners
     6. Validation & Testing Action Checklist
   - Live AI Reanalysis button (`/api/analyze`).
   - Launch AI Copilot button.
   - JSON dossier export button.

5. **Reports & Governance — Reports & Downloads (`views/reports.js`)**:
   - Multi-report catalog covering Reports A through H:
     * Report A: Executive Opportunity Brief
     * Report B: Detailed Commercialization Report (8-criteria scoring matrix)
     * Report C: Industry-Specific Report (DRAP class & competitor benchmark)
     * Report D: Karachi Industrial-Area Report (Cluster alignment & logistics)
     * Report E: Product & Service Valuation (Unit economics table)
     * Report F: Five-Year Growth Forecast (2026–2031 CAGR scenarios & unit sales)
     * Report G: Investor & Industry Partnership Deck (CAPEX ask, royalty, IRR & milestones)
     * Report H: Multi-Project Portfolio Ranking (Comparative institutional ranking of all projects)
   - Live printable sheet preview with university crest, reference number, date stamp, and signature blocks.
   - Direct Print & High-Resolution PDF export button (using `css/print.css`).

6. **Reports & Governance — Data Sources & Citations (`views/sources.js`)**:
   - Verified statutory citations registry (PBS, SBP, DRAP, PPMA, TDAP, KATI, PCSIR, PSX).
   - Transparent economic modeling assumptions table (exchange rate peg, provincial healthcare consumption share, sector CAGR baselines).

---

### 2. CORE ARCHITECTURE & DEPENDENCIES

- **Global Store (`js/data.js`)**:
  - `window.oricStore = new OricDataStore()` manages:
    * `projects`: Array of project objects.
    * `currency`: `'PKR'` or `'USD'`.
    * `exchangeRate`: `280.0`.
    * `filters`: `{ searchQuery, course, domain, priority, trl, area }`.
    * `activeProjectId`: Current active dossier project.
    * Methods: `formatMoney(val)`, `formatPrice(val)`, `setCurrency(c)`, `getFilteredProjects()`, `addProject(p)`, `saveLocalOverrides()`.
  
- **App Controller & Router (`js/app.js`)**:
  - `window.oricApp = new OricApp()` manages view switching:
    * `navigate(viewName, filterParams)`
    * `openProjectDossier(id)`
    * `openReportForProject(id)`
    * `openAiCopilot(id)`
    * `showToast(msg, type)`

- **Client Data Bundle (`data/data_bundle.js`)**:
  - `window.ORIC_INITIAL_DATA = { projects, industrialAreas, sectors, evidence, stats }` guarantees instant zero-latency loading in both http:// and file:// environments.

- **Stylesheets**:
  - `css/main.css`: Theme variables, reset, layout, topbar, sidebar, KPI cards, form controls.
  - `css/views.css`: Component styling for Dashboard, Upload dropzone, Library table, Dossier tabs, and Reports.
  - `css/print.css`: Dedicated media print styles hiding navigation chrome and formatting A4 report sheets.

- **External Libraries**:
  - Chart.js 4.4.2: `<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.min.js"></script>`
  - FontAwesome 6.5.1: `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">`
  - Fonts: Inter & Outfit from Google Fonts.

---

### 3. ANTI-MISFIRE RULES (CRITICAL)
- **Zero Null Property Access**: Always access `project.commercialization?.priority`, `project.marketSizing?.somPKR`, `project.products || []`, `project.services || []`.
- **Dynamic Container Selection**: Do not assume hardcoded container IDs. In view render functions, resolve `container || document.getElementById('mainContentContainer')`.
- **Chart.js Destruction**: Destroy existing chart instances (`this.charts.domains?.destroy()`) before creating new ones on the canvas.
- **Custom CSV Ingestion**: If custom CSV data is supplied, use `LibraryView.parseCsvToProjects(csvText)` or run `node data/csv_importer.js <file.csv>` to ensure all required nested properties are populated.

Please mount and implement these files into this project now.
```

