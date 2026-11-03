# ORIC Core Intelligence & Governance Modules — Migration Package

> **Production Extraction Kit for Seamless Cross-Project Implementation**  
> Extracted from ORIC-IOAP (Office of Research, Innovation & Commercialization Platform)  
> Designed for 100% plug-and-play migration with **zero misfire errors**, robust defensive coding, and full data CSV compatibility.

---

## 📦 What is in this Migration Package?

This package encapsulates the distinguished functionality requested:

```
ORIC_CORE_INTELLIGENCE_MODULES/
├── index.html                           # Self-contained runnable SPA test harness
├── server.js                            # Production Express backend (Multer, CORS, Gemini AI)
├── package.json                         # Node dependencies (express, cors, multer)
├── .env.example                         # Environment variables template
├── README_MIGRATION_GUIDE.md            # Comprehensive developer manual (this file)
├── AI_MIGRATION_PROMPT.md               # Prompt to give to the AI assistant in the new project
│
├── css/                                 # Complete visual styling system
│   ├── main.css                         # Institutional variables, layout, typography, buttons, KPIs
│   ├── views.css                        # Views CSS (Dashboard, Dropzone, Library, Dossier, Reports)
│   └── print.css                        # High-resolution print/PDF rendering stylesheet
│
├── js/                                  # Core application logic & reactive state
│   ├── data.js                          # OricDataStore: currency toggle (PKR/USD), project state, audit logs
│   ├── app.js                           # OricApp: View router, toast notifications, AI Copilot drawer
│   └── views/                           # Modular view components
│       ├── dashboard.js                 # 1. CORE INTELLIGENCE: Executive Overview (Charts, KPIs, Spotlight)
│       ├── upload.js                    # 2. DOCUMENT INGESTION: 6-Stage Pipeline & Drag-and-Drop Ingestion
│       ├── library.js                   # 3. DOCUMENT LIBRARY: Search, Filter, Pagination, CSV Import & Export
│       ├── intelligence.js              # 4. AI INTELLIGENCE DOSSIER: 6 Sub-Tabs, Live Gemini Analysis, Copilot
│       ├── reports.js                   # 5. REPORTS & GOVERNANCE: Reports A through H + PDF Export Engine
│       ├── sources.js                   # 6. DATA SOURCES & CITATIONS: Sourced Evidence Registry & Assumptions
│       ├── products.js                  # Linked catalog: Commercial products & dosage forms
│       ├── industries.js                # Linked catalog: Industry applications & sectors
│       ├── karachi.js                   # Linked catalog: Karachi industrial clusters
│       ├── forecasting.js               # Linked catalog: 5-Year CAGR financial models
│       ├── commercialization.js         # Linked catalog: 8-Criteria commercial evaluation matrix
│       └── admin.js                     # Linked catalog: System administration & API key manager
│
└── data/                                # Data layer & CSV tooling
    ├── data_bundle.js                   # Preloaded client bundle (guarantees instant offline/file:// load)
    ├── oric_projects_db.json            # 233 full research project dossiers
    ├── dashboard_stats.json             # Aggregated KPI metrics for dashboard
    ├── evidence_sources.json            # Verified national & regulatory citations (PBS, SBP, DRAP, PPMA)
    ├── industrial_sectors.json          # Sector taxonomy & market sizing
    ├── karachi_industrial_areas.json    # 10 Karachi industrial estates & enterprise directories
    ├── sample_documents.csv             # Reference CSV template for importing research data
    └── csv_importer.js                  # Node CLI utility to parse, map, and bundle any custom CSV
```

---

## 🎯 The 6 Core Modules Implemented

### 1. Dashboard Page (`js/views/dashboard.js`)
* **KPI Metrics Grid**: Live counts for total research projects, addressable market (TAM), commercial products, high-priority deals ($\ge 4.10$), and mapped industrial zones.
* **Interactive Chart.js Visualizations**:
  - Doughnut chart showing distribution of research across specialized pharmaceutical/technical domains.
  - Horizontal bar chart showing project matching across Karachi's 10 major industrial estates.
* **High-Priority Innovation Spotlight**: Curated cards highlighting top-scoring projects with SOM valuation and quick link to the AI Analytical Dossier.
* **Currency Reactive**: Instantly switches between PKR and USD (using the dated State Bank benchmark of 280 PKR/USD).

### 2. Upload Documents Page (`js/views/upload.js`)
* **6-Stage Automated AI Extraction Pipeline**:
  1. Integrity & virus inspection
  2. Text & table parsing
  3. Scanned PDF & OCR processing
  4. Google Gemini concept & API extraction
  5. Karachi cluster fit alignment
  6. Commercial 8-criteria scoring
* **Drag-and-Drop Ingestion Dropzone**: Accepts PDF, DOCX, XLSX, PPTX, TXT, and CSV (up to 30MB).
* **Metadata Intake Form**: Captures project title, department, principal investigator, research domain, TRL (1–9), IP status, funding source, and abstract.
* **Dual Execution Mode**: Attempts live backend upload (`/api/upload`) with fallback to local client-side synthesis if backend is offline.

### 3. Document Library Page (`js/views/library.js`)
* **Multi-Filter Live Search**: Instant filtering by search keyword (title, abstract, PI, or ID), pharmacy courses, research domains, commercial priority (High, Medium, Standard), and industrial area.
* **Pagination Engine**: Smooth 15-item pagination with active page indicators.
* **Native CSV Import Feature**:
  - Click **"Import CSV Data"** to load any CSV file directly in the browser!
  - Includes an intelligent column mapper that auto-detects column names (`id`, `title`, `abstract`, `pi`, `course`, `domain`, `trl`, `priority`, `tam`, `som`, `area`).
  - Automatically synthesizes any missing nested structures (`products`, `services`, `marketSizing`, `commercialization`) so no undefined exceptions ever occur!
* **Native CSV Export**: Exports filtered table rows to standard CSV with one click.

### 4. AI Intelligence Dossier (`js/views/intelligence.js`)
* **Deep Project Inspection across 6 Sub-Tabs**:
  - *Executive Summary*: Clinical unmet need, formulation mechanism, and national import substitution value.
  - *Technology & Scientific Principles*: Mechanistic principles and TRL evaluation.
  - *Commercial Products*: Unit cost, selling price, gross margin %, target customer, and differentiation.
  - *Industrial Services*: Analytical testing protocols (e.g. ICH Zone IVb stability testing, HPLC assays) with commercial fee schedules.
  - *Karachi Industrial Fit*: Matched estates (KATI, LATI, SITE, FBATI, etc.), relevance %, and verified candidate enterprise partners.
  - *Validation Checklist*: Actionable next steps for ORIC before investor presentation.
* **Live Gemini Re-analysis**: Runs `/api/analyze` to re-extract structured intelligence from project abstract.
* **Interactive AI Copilot**: Direct drawer button to ask questions about the active project.
* **JSON Export**: Downloads the complete structured dossier as `.json`.

### 5. Reports & Governance — Reports & Downloads (`js/views/reports.js`)
* **Full Multi-Report Suite (Reports A through H)**:
  - **Report A**: Executive Opportunity Brief (for Vice Chancellor & University Leadership)
  - **Report B**: Detailed Commercialization Report (Full 8-criteria matrix breakdown)
  - **Report C**: Industry-Specific Report (DRAP regulatory category & competitor benchmark)
  - **Report D**: Karachi Industrial-Area Report (Cluster alignment & logistics corridors)
  - **Report E**: Product & Service Valuation (Unit economics & testing fee schedule)
  - **Report F**: Five-Year Growth Forecast Report (2026–2031 CAGR scenarios & unit sales)
  - **Report G**: Investor & Industry Partnership Deck (CAPEX ask, royalty, IRR & transfer milestones)
  - **Report H**: Multi-Project Portfolio Ranking (Comparative institutional ranking of all projects)
* **High-Fidelity PDF Export**:
  - Institutional crest header with reference code and date stamp.
  - Evidence citations and uncertainty disclosure notes.
  - Institutional signature blocks (PI, Director ORIC, Dean).
  - Print stylesheet (`css/print.css`) hides UI chrome and generates clean A4 pages.

### 6. Reports & Governance — Data Sources & Citations (`js/views/sources.js`)
* **Verified Evidence Registry**: Cards for primary statutory authorities:
  - Pakistan Bureau of Statistics (PBS) — National Census of Manufacturing
  - State Bank of Pakistan (SBP) — Economic reports & exchange rate benchmarks
  - Drug Regulatory Authority of Pakistan (DRAP) — Registration compendia & MRP formulas
  - Pakistan Pharmaceutical Manufacturers Association (PPMA) — Industry market census
  - Trade Development Authority of Pakistan (TDAP) — Export destination studies
  - Korangi Association of Trade & Industry (KATI) — Enterprise directory
  - Pakistan Council of Scientific & Industrial Research (PCSIR) — Analytical standards
  - Pakistan Stock Exchange (PSX) — Audited listed pharma filings
* **Transparent Modeling Assumptions Table**: Fully documented macroeconomic parameters (280 PKR/USD, 32.5% Sindh share, 11.4% pharma CAGR, 15.8% nutraceutical CAGR, 21% digital health CAGR).

---

## 🛡️ Anti-Misfire Protections Built In

1. **Defensive Object Initialization**: All view components check `project.commercialization`, `project.marketSizing`, `project.technologies`, `project.products`, and `project.services` with fallback defaults. Even if a project record from a custom CSV is missing nested objects, it will never throw `Cannot read properties of undefined`.
2. **Dynamic Container Resolution**: `LibraryView` and other views resolve containers via `container || document.getElementById('mainContentContainer') || document.getElementById('libraryViewContainer')`. No more `null.innerHTML` errors.
3. **Canvas Cleanup**: `DashboardView.renderCharts()` cleanly destroys existing Chart.js instances before rendering to prevent memory leaks and "Canvas is already in use" errors.
4. **Number Formatting Safety**: `formatMoney()` and `formatPrice()` handle `null`, `undefined`, and `NaN` without breaking the UI.
5. **Zero Backend Dependency Requirement**: If the Node/Express backend is not running, the platform continues working flawlessly using `data/data_bundle.js` and `localStorage`.

---

## 📊 How to Supply Your Custom CSV Data

You can provide your own CSV data through **either of two ways**:

### Option 1: In the Browser UI (Zero Setup)
1. Open the platform in any browser (`index.html`).
2. Navigate to **Document Library**.
3. Click the **"Import CSV Data"** button at the top right.
4. Select your `.csv` file. The platform will parse the rows, format the records, update the counts, and refresh the library instantly.

### Option 2: Command-Line Rebundler (Permanent Update)
Run the bundled Node CLI utility to update the database files and rebundle `data_bundle.js`:

```powershell
node data/csv_importer.js path/to/your_file.csv
```

*By default, this merges new projects with the existing database. To completely overwrite the database with only your CSV, add `--replace`:*

```powershell
node data/csv_importer.js path/to/your_file.csv --replace
```

### Supported CSV Column Headers (Flexible Aliases)
The importer recognizes standard variations of column headers:

| Field | Recognized CSV Headers | Default Fallback |
|---|---|---|
| **ID** | `Project ID`, `ID`, `Code`, `Serial`, `Doc ID` | `PRJ-IMP-001` |
| **Title** | `Title`, `Project Title`, `Document Title`, `Name`, `Topic` | `Research Project N` |
| **Abstract** | `Abstract`, `Description`, `Summary`, `Objectives`, `Detail` | Auto-generated summary |
| **Faculty PI** | `Faculty PI`, `PI`, `Supervisor`, `Lead`, `Investigator`, `Author` | `Faculty Investigator` |
| **Department** | `Department`, `Dept`, `Faculty Name`, `School` | `Faculty of Pharmacy (FoP)` |
| **Course** | `Course Title`, `Course`, `Subject`, `Module` | `University Research Portfolio` |
| **Domain** | `Domain`, `Category`, `Sector`, `Field` | `Pharmaceutical Technology & Formulation` |
| **TRL** | `TRL`, `Readiness`, `Level`, `Stage` | `3` |
| **Priority** | `Priority`, `Commercial Priority`, `Status` | `Standard Priority` |
| **TAM PKR** | `TAM PKR (M)`, `TAM`, `Total Addressable` | `10000` |
| **SOM PKR** | `SOM PKR (M)`, `SOM`, `Serviceable Obtainable` | `350` |
| **Area** | `Top Karachi Area`, `Area`, `Cluster`, `Zone` | `Korangi Industrial Area` |

*(A sample reference file is provided at `data/sample_documents.csv`)*

---

## 🚀 Running the Platform

### Option A: Direct Static (No Node.js Required)
Simply double-click `index.html` in any browser. All 6 modules work immediately using the preloaded `data_bundle.js`.

### Option B: Node.js Express Server (With Live AI)
1. Install dependencies:
   ```powershell
   npm install
   ```
2. Set your Gemini API key in `.env` (optional, for live AI Copilot):
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   PORT=3000
   ```
3. Start the server:
   ```powershell
   npm start
   ```
4. Open `http://localhost:3000` in your browser.

---

## 🛠️ Step-by-Step Target Project Integration Guide

If you are implementing this into another codebase:

1. **Copy Assets & Styles**:
   - Copy `css/main.css`, `css/views.css`, `css/print.css` to your project's stylesheet folder.
   - Include Google Fonts (Inter & Outfit) and FontAwesome in your HTML `<head>`:
     ```html
     <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet">
     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
     <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.min.js"></script>
     ```
2. **Copy Data Layer**:
   - Copy `data/data_bundle.js` and `js/data.js`.
   - Ensure `window.oricStore` is instantiated before views are rendered.
3. **Mount View Components**:
   - Load the views in this order:
     ```html
     <script src="js/views/dashboard.js"></script>
     <script src="js/views/upload.js"></script>
     <script src="js/views/library.js"></script>
     <script src="js/views/intelligence.js"></script>
     <script src="js/views/reports.js"></script>
     <script src="js/views/sources.js"></script>
     ```
4. **Initialize App Router**:
   - Load `js/app.js` and run `window.oricApp.init()`.
5. **Backend Endpoints (Optional for live AI)**:
   - If using live Gemini AI, copy `/api/analyze`, `/api/ai/chat`, and `/api/upload` from `server.js` into your backend router.

