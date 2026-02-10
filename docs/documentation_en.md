# Antibody Database Explorer — Project Delivery Documentation

> **Version**: 1.0  
> **Date**: February 1, 2026  
> **Tech Stack**: Python FastAPI + React (Vite) + Tailwind CSS + Plotly.js + SQLite

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Feature Specification](#2-feature-specification)
3. [Design Documentation](#3-design-documentation)
4. [User Guide](#4-user-guide)
5. [API Reference](#5-api-reference)
6. [Project Structure](#6-project-structure)
7. [Deployment & Operations](#7-deployment--operations)
8. [FAQ](#8-faq)

---

## 1. Project Overview

### 1.1 Purpose

This project provides an interactive web interface for querying a monoclonal antibody (mAb) safety and clinical development database. It supports multi-dimensional filtering, data visualization, adverse event analytics, and treatment arm comparisons.

### 1.2 Data Sources

The system ingests **6 worksheets** from `Full_mab_datasets.xlsx`:

| Dataset | Table Name | Rows | Source | Description |
|---------|-----------|------|--------|-------------|
| CTGOV – All Events | `ctgov_all` | 58,076 | ClinicalTrials.gov | All adverse event records |
| CTGOV – Serious Events | `ctgov_serious` | 58,076 | ClinicalTrials.gov | Serious adverse events subset |
| CTGOV – Other Events | `ctgov_other` | 58,076 | ClinicalTrials.gov | Other adverse events subset |
| FDA Label – Final | `label_final` | 9,261 | FDA Drug Labels | Complete label data with grading |
| FDA Label – BBW | `label_bbw` | 9,261 | FDA Drug Labels | Black Box Warning subset |
| FDA Label – WAP | `label_wap` | 9,261 | FDA Drug Labels | Warnings & Precautions subset |

### 1.3 Coverage

- CTGOV datasets: **289** distinct antibodies
- FDA Label datasets: **139** distinct antibodies

---

## 2. Feature Specification

### 2.1 Dataset Selector (F0)

Located in the header bar. Users can switch between all 6 data tables via a dropdown menu.

**Behavior on switch:**
- Clears all active filters and search text
- Reloads filter option values for the selected table
- Re-queries and refreshes all charts and the data table

### 2.2 Global Search (F1)

A full-width search bar at the top of the page for searching by antibody/molecule name.

**Features:**
- Fuzzy matching via SQL `LIKE` query
- Autocomplete suggestions appear after 2 characters (up to 10 matches)
- 300ms debounce to prevent excessive API calls
- Click a suggestion to select and populate the search field

**Search target column:** `antibody`

### 2.3 Filter Panel (F2–F4)

A two-column, collapsible filter panel supporting multi-criteria filtering across molecular and clinical dimensions.

#### Left Column — Molecular Characteristics

| Filter | Database Column | Type | Distinct Values |
|--------|----------------|------|----------------|
| Molecular Category | `general_molecular_category` | Multi-select | 12 (CTGOV) / 10 (Label) |
| Target Antigen | `target_1` | Searchable multi-select | 158 (CTGOV) / 78 (Label) |
| Format | `format_general_category` | Multi-select | 7 (CTGOV) / 8 (Label) |
| Isotype (Fc) | `isotype_fc` | Multi-select | 8 (CTGOV) / 5 (Label) |

#### Right Column — Clinical & Study

| Filter | Database Column | Type | Distinct Values | Notes |
|--------|----------------|------|----------------|-------|
| Phase | `phase` | Multi-select | 6 | CTGOV only |
| Event Type | `event_type` | Multi-select | 2 | CTGOV only |
| MOA | `moa_new` | Multi-select | 16 / 15 | |
| Condition | `condition` | Searchable multi-select | 155 / 115 | |
| Record Category | `record_category` | Multi-select | 18 / 4 | |
| Source | `source` | Multi-select | varies | |

**Filter logic:**
- Across different filters: **AND** (intersection)
- Within a single multi-select filter: **OR** (union)
- The panel is collapsible via the top chevron button
- Each dropdown shows a count badge for selected items

### 2.4 Filter Action Bar (F5)

| Action | Description |
|--------|-------------|
| **Apply Filters** | Submit all filter criteria; refreshes charts and data table |
| **Clear All** | Resets all filters and search text (does not auto-requery) |
| **Active filter indicator** | Pulsing badge showing count of active filters |
| **Result count** | Right-aligned display of total matching rows |

### 2.5 Distribution Dashboard (F6)

Four donut charts displayed in a 2×2 grid, summarizing data distributions.

| Chart | Column | Description |
|-------|--------|-------------|
| Record Category | `record_category` | Distribution of record types |
| General Molecular Category | `general_molecular_category` | Distribution of molecule types |
| Mechanism of Action | `moa_new` | Distribution of MOA categories |
| Targets | `target_1` | Distribution of target antigens |

**Interactions:**
- Hover to see category name, count, and percentage
- Charts with >10 categories automatically consolidate into "Top 9 + Other"
- "Expand ↗" button (visible on hover) opens a modal with a larger chart and a detailed data table showing category, count, and share percentage

### 2.6 Adverse Event Analytics (F7)

A horizontal bar chart displaying the top 20 adverse event categories by proportion.

**Grouping modes** (togglable):
- **Organ System**: Groups by organ system (e.g., "Blood and lymphatic system disorders")
- **AE Term**: Groups by specific adverse event term (e.g., "Anemia", "Nausea")

**Calculation logic:**
- CTGOV datasets: `proportion = SUM(events_ab) / SUM(n_ab) × 100%`
- Label datasets: `proportion = AVG(all_grades%)`

**Visual features:**
- Gradient-colored bars (light to dark indicating increasing proportion)
- Subtle grid lines for alignment
- Detailed hover tooltips

### 2.7 Comparative Arm Analysis (F8)

When comparator arm data is available, this section displays a grouped bar chart comparing treatment vs. comparator arm adverse event proportions.

**Workflow:**
1. Select an antibody from the "Antibody" dropdown
2. (Optional) Select a specific study via the "Study (NCT ID)" dropdown
3. Choose grouping: Organ System or AE Term
4. Click **Compare**

**Critical business rule:** When a specific NCT ID is selected, the comparison is performed **within that single study only** — no cross-study aggregation.

**Color coding:**
- Blue bars: Treatment Arm
- Orange bars: Comparator Arm

**Calculation logic:**
- CTGOV: Treatment = `events_ab / n_ab × 100%`, Comparator = `events_comp / n_comp × 100%`
- Label: Treatment = `all_grades%`, Comparator = `comp_all_grades%`

### 2.8 Data Table (F9)

A paginated, sortable table displaying the raw filtered data.

**Features:**
- 50 rows per page with numbered page navigation
- Click any column header to sort (toggles ascending/descending)
- Active sort column shows ↑/↓ indicator; other columns show ↕ on hover
- Priority columns displayed first: antibody, condition, organ_system, adverse_event_term, general_molecular_category, target_1, record_category, source
- Null values shown as *null* in gray italic
- **Export CSV** button downloads all matching rows (not just the current page)

---

## 3. Design Documentation

### 3.1 System Architecture

```
┌─────────────────────────────────────┐
│      User Browser (React SPA)       │
│  Vite Dev Server (port 5173)        │
│  ├── Tailwind CSS (styling)         │
│  ├── Plotly.js (charts)             │
│  └── react-select (dropdowns)       │
└──────────┬──────────────────────────┘
           │  HTTP /api/*
           │  (Vite proxy)
┌──────────▼──────────────────────────┐
│      FastAPI Backend (port 8000)     │
│  ├── 8 RESTful API endpoints        │
│  └── SQLite query engine            │
└──────────┬──────────────────────────┘
           │
┌──────────▼──────────────────────────┐
│      SQLite Database                 │
│  mab_database.sqlite                │
│  6 tables + indexes                 │
└─────────────────────────────────────┘
```

### 3.2 Frontend Architecture

**State management:** React Context + useReducer (no Redux dependency)

```
FilterContext (global state)
├── table            Currently selected dataset
├── filters          {column: [values]} filter criteria
├── search           Search keyword
├── filterOptions    Available values per column (loaded from API)
├── results          Query result {data, total, page, page_size}
├── distributions    Array of 4 donut chart datasets
├── aeData           Adverse event chart data
├── sortBy / sortDir Sort state
└── loading          Loading indicator
```

**Component hierarchy:**

```
App
├── Header               Dataset selector + branding
├── SearchBar            Global antibody search
├── FilterPanel          Collapsible filter panel
│   └── FilterSelect     Reusable multi-select dropdown
├── FilterBar            Action buttons + result count
├── DistributionDashboard  2×2 chart grid
│   └── DonutChart        Individual donut chart + expand modal
│       └── ChartModal    Fullscreen modal container
├── AdverseEventChart    AE bar chart with toggle
├── ComparativeChart     Comparative analysis chart
└── DataTable            Paginated sortable table
```

### 3.3 Backend Architecture

**API endpoint summary:**

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/tables` | List all tables with row counts |
| GET | `/api/filter-options?table=` | Get distinct filter values for a table |
| POST | `/api/query` | Main query (filter + paginate + sort) |
| GET | `/api/chart/distribution` | Get distribution chart data |
| POST | `/api/chart/adverse-events` | Get AE analysis data |
| POST | `/api/chart/comparative` | Get comparative analysis data |
| GET | `/api/studies` | Get NCT IDs for an antibody |
| GET | `/api/export` | Export filtered data as CSV |

**Database indexes** on frequently filtered columns:
`antibody`, `organ_system`, `adverse_event_term`, `condition`, `general_molecular_category`, `record_category`, `source`

### 3.4 Data Pipeline

**Excel → SQLite conversion** (`ingest.py`):

1. Reads all 6 Excel worksheets
2. Normalizes column names (lowercase, underscores replace spaces/special characters)
3. Deduplicates column names (e.g., Label sheets have both `Combo?` → `combo` and `combo` → `combo_1`)
4. Strips Excel formula remnants (strings starting with `=` are set to NULL)
5. Converts `"NA"` / `"None"` / `""` to SQL NULL
6. Writes to SQLite and creates indexes

### 3.5 UI Design Language

| Element | Implementation |
|---------|---------------|
| Typography | Inter (Google Fonts), weights 300–800 |
| Background | Tri-tone gradient `#f0f4ff → #faf5ff → #f0fdf4` |
| Header | Dark gradient `slate-900/indigo-950` with radial glow accents |
| Cards | Glassmorphism `bg-white/70 backdrop-blur-sm` |
| Border radius | Uniform `rounded-2xl` (1rem) |
| Shadows | Soft colored shadows `shadow-sm shadow-slate-200/50` |
| Primary color | Indigo (`#6366f1`) |
| Chart palette | Indigo → Purple → Cyan → Emerald → Amber (cohesive scheme) |
| Animations | fadeIn / slideDown transitions, hover state changes |
| Section icons | Color-coded gradient icons per section (indigo for filters, cyan for distribution, rose for AE, emerald for comparative, violet for table) |

---

## 4. User Guide

### 4.1 Prerequisites

| Dependency | Minimum Version |
|-----------|----------------|
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 9+ |
| Browser | Chrome / Firefox / Safari (latest) |

### 4.2 Initial Setup

```bash
# 1. Navigate to the project root
cd Website_Database

# 2. Install Python dependencies
pip install -r backend/requirements.txt

# 3. Run data ingestion (Excel → SQLite, takes ~1-2 minutes)
python backend/ingest.py

# 4. Install frontend dependencies
cd frontend
npm install
cd ..
```

### 4.3 Starting the Application

```bash
# Terminal 1: Start the backend API server
cd backend
uvicorn main:app --port 8000
# Console output: Uvicorn running on http://127.0.0.1:8000

# Terminal 2: Start the frontend development server
cd frontend
npm run dev
# Console output: Local: http://localhost:5173/
```

Open your browser and navigate to **http://localhost:5173**

### 4.4 Typical Usage Scenarios

#### Scenario 1: View adverse event profile for a specific antibody

1. Type the antibody name in the search bar (e.g., `dinutuximab`)
2. Select from the autocomplete suggestions
3. Click **Apply Filters**
4. Review the distribution charts and adverse event bar chart below
5. Toggle between "Organ System" and "AE Term" in the AE chart for different perspectives

#### Scenario 2: Filter by molecular characteristics

1. Expand the filter panel (if collapsed)
2. In the left column, select "ADC" under "Molecular Category"
3. Select "IgG1" under "Isotype (Fc)"
4. Click **Apply Filters**
5. All charts and the data table update to show only ADC + IgG1 molecules

#### Scenario 3: Compare treatment arm vs. comparator arm

1. Ensure you are viewing a CTGOV dataset
2. Scroll to the "Comparative Arm Analysis" section
3. Select an antibody from the "Antibody" dropdown
4. (Recommended) Select a specific study via the "Study (NCT ID)" dropdown to avoid cross-study aggregation
5. Click **Compare**
6. Blue bars = Treatment Arm, Orange bars = Comparator Arm

#### Scenario 4: Switch to FDA Label data

1. Click the dataset selector in the top-right corner of the header
2. Select "FDA Label – Final" (or BBW / WAP)
3. The filter panel automatically adapts (hides Phase, Event Type, and other CTGOV-specific fields)
4. All data and charts refresh to display FDA Label data

#### Scenario 5: Export data

1. Set your desired filter criteria and click Apply Filters
2. Scroll to the data table section
3. Click the **Export CSV** button in the top-right corner of the table
4. Your browser will download a CSV file containing all rows matching the current filters (not just the visible page)

### 4.5 Interface Layout Reference

```
┌────────────────────────────────────────────────┐
│ ① Header: Brand title + Dataset selector       │
├────────────────────────────────────────────────┤
│ ② Search Bar: Antibody name search (autocomplete)│
├────────────────────────────────────────────────┤
│ ③ Filter Panel: Left (Molecular) | Right (Clinical)│
│    Collapsible via top chevron button            │
├────────────────────────────────────────────────┤
│ ④ Action Bar: Apply Filters / Clear All / Count  │
├───────────┬───────────┬───────────┬────────────┤
│ ⑤ Donut   │ ⑤ Donut   │ ⑤ Donut   │ ⑤ Donut    │
│ Record    │ Molecular │ MOA       │ Targets    │
│ Category  │ Category  │           │            │
├───────────┴─────┬─────┴───────────┴────────────┤
│ ⑥ AE Bar Chart  │ ⑦ Comparative Chart          │
│ (Top 20)        │ (Activated after selection)   │
├─────────────────┴──────────────────────────────┤
│ ⑧ Data Table (paginated, sortable, exportable) │
├────────────────────────────────────────────────┤
│ ⑨ Footer                                       │
└────────────────────────────────────────────────┘
```

---

## 5. API Reference

### 5.1 GET `/api/tables`

Returns all available data tables with their row counts.

**Response:**
```json
{
  "tables": [
    {"name": "ctgov_all", "rows": 58076},
    {"name": "ctgov_serious", "rows": 58076},
    {"name": "ctgov_other", "rows": 58076},
    {"name": "label_final", "rows": 9261},
    {"name": "label_bbw", "rows": 9261},
    {"name": "label_wap", "rows": 9261}
  ]
}
```

### 5.2 GET `/api/filter-options?table={table}`

Returns distinct values for all filterable columns in the specified table.

**Parameters:** `table` — Table name (e.g., `ctgov_all`)

**Response (excerpt):**
```json
{
  "antibody": ["abciximab", "adalimumab", "dinutuximab", ...],
  "general_molecular_category": ["ADC", "Bispecific", "Naked monospecific", ...],
  "phase": ["PHASE1", "PHASE2", "PHASE3", ...]
}
```

### 5.3 POST `/api/query`

Main query endpoint supporting filtering, pagination, and sorting.

**Request body:**
```json
{
  "table": "ctgov_all",
  "filters": {
    "antibody": ["dinutuximab"],
    "general_molecular_category": ["Naked monospecific"]
  },
  "search": null,
  "page": 1,
  "page_size": 50,
  "sort_by": "antibody",
  "sort_dir": "asc"
}
```

**Response:**
```json
{
  "data": [{"antibody": "dinutuximab", "condition": "Neuroblastoma", ...}, ...],
  "total": 515,
  "page": 1,
  "page_size": 50
}
```

### 5.4 GET `/api/chart/distribution`

Returns value counts for a specific column (used for donut charts).

**Parameters:**
- `table` — Table name
- `column` — Column to aggregate
- `filters` — JSON-encoded filter criteria (optional)
- `search` — Search keyword (optional)

**Response:**
```json
{
  "labels": ["Naked monospecific", "ADC", "Bispecific", ...],
  "values": [7027, 1200, 534, ...]
}
```

### 5.5 POST `/api/chart/adverse-events`

Returns adverse event analysis data.

**Request body:**
```json
{
  "table": "ctgov_all",
  "group_by": "organ_system",
  "filters": {},
  "search": null,
  "top_n": 20
}
```

**Response:**
```json
{
  "categories": ["Blood and lymphatic system disorders", ...],
  "proportions": [40.47, 37.09, ...],
  "counts": [567, 1321, ...]
}
```

### 5.6 POST `/api/chart/comparative`

Returns treatment arm vs. comparator arm comparison data.

**Request body:**
```json
{
  "table": "ctgov_all",
  "antibody": "dinutuximab",
  "nct_id": "NCT00026312",
  "group_by": "organ_system",
  "top_n": 15
}
```

**Response:**
```json
{
  "ab_arm": {
    "categories": ["Metabolism and nutrition disorders", ...],
    "proportions": [113.93, 73.49, ...]
  },
  "comp_arm": {
    "categories": ["Metabolism and nutrition disorders", ...],
    "proportions": [22.32, 100.0, ...]
  }
}
```

### 5.7 GET `/api/studies`

Returns all NCT IDs associated with a specific antibody.

**Parameters:** `table`, `antibody`

**Response:**
```json
{
  "studies": ["NCT00026312", "NCT00743496", ...]
}
```

### 5.8 GET `/api/export`

Downloads all matching data as a CSV file.

**Parameters:** `table`, `filters` (JSON-encoded), `search`

**Response:** `Content-Disposition: attachment; filename={table}_export.csv`

---

## 6. Project Structure

```
Website_Database/
├── data/
│   ├── Full_mab_datasets.xlsx          # Source Excel file (6 worksheets)
│   └── preliminary_query_build_doc.pdf # Original requirements document
├── docs/
│   ├── functional_spec.md              # Functional specification
│   ├── documentation_zh.md             # Chinese delivery documentation
│   └── documentation_en.md             # English delivery documentation (this file)
├── backend/
│   ├── ingest.py                       # Data ingestion script (Excel → SQLite)
│   ├── main.py                         # FastAPI backend application
│   ├── mab_database.sqlite             # SQLite database (auto-generated)
│   ├── table_meta.json                 # Table metadata (auto-generated)
│   └── requirements.txt                # Python dependencies
├── frontend/
│   ├── vite.config.js                  # Vite config (includes API proxy)
│   ├── package.json                    # Node.js dependencies
│   ├── src/
│   │   ├── main.jsx                    # React entry point
│   │   ├── index.css                   # Global styles + Tailwind
│   │   ├── App.jsx                     # Main layout
│   │   ├── api.js                      # API call wrappers
│   │   ├── context/
│   │   │   └── FilterContext.jsx       # Global state management
│   │   └── components/
│   │       ├── Header.jsx              # Header + dataset selector
│   │       ├── SearchBar.jsx           # Global search with autocomplete
│   │       ├── FilterPanel.jsx         # Collapsible filter panel
│   │       ├── FilterBar.jsx           # Action buttons
│   │       ├── DistributionDashboard.jsx # Distribution chart grid
│   │       ├── DonutChart.jsx          # Donut chart component
│   │       ├── ChartModal.jsx          # Chart expand modal
│   │       ├── AdverseEventChart.jsx   # Adverse event analysis
│   │       ├── ComparativeChart.jsx    # Comparative analysis
│   │       └── DataTable.jsx           # Data table with pagination
│   └── dist/                           # Build output (auto-generated)
```

---

## 7. Deployment & Operations

### 7.1 Production Deployment

```bash
# Build frontend static files
cd frontend && npm run build

# Run backend with Gunicorn (production)
cd backend
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000

# Serve frontend/dist/ via Nginx or another static file server
# Reverse proxy /api/* to localhost:8000
```

**Example Nginx configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/Website_Database/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 7.2 Updating Data

When new data is available:

1. Replace the `data/Full_mab_datasets.xlsx` file
2. Re-run: `python backend/ingest.py`
3. Restart the backend service

The database will be fully rebuilt automatically. No configuration changes required.

### 7.3 Adding New Filter Fields

1. Add the column name to the `FILTERABLE_COLUMNS` dictionary in `backend/main.py`
2. Add a corresponding `<FilterSelect>` component in `frontend/src/components/FilterPanel.jsx`
3. No other files need modification — the filtering logic adapts automatically

### 7.4 Modifying Chart Configurations

To change which columns are displayed as donut charts, edit the `DISTRIBUTION_CHARTS` array in `frontend/src/context/FilterContext.jsx`:

```javascript
const DISTRIBUTION_CHARTS = [
  { column: 'record_category', title: 'Record Category' },
  { column: 'general_molecular_category', title: 'General Molecular Category' },
  { column: 'moa_new', title: 'Mechanism of Action' },
  { column: 'target_1', title: 'Targets' },
];
```

---

## 8. FAQ

**Q: Backend fails with "Database not found"**  
A: Run `python backend/ingest.py` first to generate the SQLite database from the Excel file.

**Q: Frontend shows blank page or API returns 404**  
A: Ensure the backend is running on port 8000. The Vite development server proxies `/api` requests to the backend.

**Q: Charts don't update after switching datasets**  
A: The system automatically re-queries on dataset switch. If the network is slow, wait for the loading indicators to finish.

**Q: CSV export seems incomplete**  
A: The Export CSV function downloads **all** rows matching the current filter criteria, not just the visible page. Verify your filters are set correctly.

**Q: Some numeric columns in Label datasets show as null**  
A: The original Excel contains `"NA"` strings and formula references in some Label data rows. The ingestion pipeline normalizes these to SQL NULL values.

**Q: How to add a new dataset/worksheet?**  
A: Add the worksheet to the Excel file, then add a new entry in the `sheets` dictionary within `backend/ingest.py` and re-run ingestion. Add the table name to `VALID_TABLES` in `backend/main.py` and `TABLE_LABELS` in `frontend/src/context/FilterContext.jsx`.

---

*This document is delivered alongside the project. Please contact the development team for any questions.*
