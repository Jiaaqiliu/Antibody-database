# Antibody Database Explorer — Phased Progress Report Plan

> This document is for internal reference, used to break the project into 4 progress reports to present the work progression in a structured manner.

---

## Report Overview

| Report | Theme | Key Deliverables | Suggested Interval |
|--------|-------|-----------------|-------------------|
| Report 1 | Requirements Analysis + Tech Stack Selection + Data Exploration | Functional spec document, data dictionary, architecture proposal | — |
| Report 2 | Backend Development + Data Pipeline | Running API service, database, API documentation | 1–2 weeks later |
| Report 3 | Frontend Core Features | Interactive web page (filters, charts, data table) | 1–2 weeks later |
| Report 4 | UI Polish + Documentation Delivery | Final UI, bilingual delivery docs, deployment plan | 1 week later |

---

## Report 1: Requirements Analysis & Technical Proposal

### Key Talking Points

> "During this period, I've been primarily focused on requirements analysis and technical research."

**1. Requirements Interpretation**

- Thoroughly reviewed the `preliminary_query_build_doc` requirements document
- Decomposed the original requirements into 9 functional modules (F0–F9)
- Produced a formal **Functional Specification** (`functional_spec.md`), covering the data model, feature descriptions, UI layout, and business rules

**2. Data Exploration**

- Conducted an in-depth analysis of the raw Excel dataset
- Discovered that the data contains **6 worksheets**, not a single table:
  - CTGOV series: 3 tables (all/serious/other), each with approximately 58,000 rows
  - FDA Label series: 3 tables (Final/BBW/WAP), each with approximately 9,200 rows
- The schemas of the two data types are not entirely consistent (CTGOV includes clinical trial fields such as `nct_id` and `phase`; Label includes label-specific fields such as `bbw`, `wap`, and graded severity data)
- Catalogued the cardinality of all filterable fields (e.g., 289 distinct antibodies, 158 distinct targets, 27 organ systems, etc.)
- Identified data quality issues: some columns contain residual Excel formulas, duplicate column names (`Combo?` vs. `combo`), `"NA"` string values, etc.

**3. Tech Stack Selection**

- Backend: Python FastAPI + SQLite (dataset size is moderate; SQLite is sufficiently performant and eliminates the need for a standalone database server)
- Frontend: React (Vite) + Tailwind CSS + Plotly.js
- Rationale: Python's ecosystem is well-suited for data processing, FastAPI offers high performance with built-in API documentation, and Plotly supports rich interactive charting

**Materials to present:**
- `docs/functional_spec.md` document
- Data field statistics table (row counts, column counts, and filter field cardinalities for all 6 tables)

---

## Report 2: Backend Development & Data Pipeline

### Key Talking Points

> "The backend API and data pipeline are now fully built and operational. All 6 data tables can be queried successfully."

**1. Data Ingestion Pipeline**

- Developed the `ingest.py` script to automate the Excel → SQLite conversion
- Addressed the following data engineering challenges:
  - Column name standardization (spaces, special characters, case normalization)
  - Duplicate column name deduplication (conflict between `Combo?` and `combo` coexisting)
  - Residual Excel formula cleanup
  - Unified conversion of `"NA"` / `"None"` to SQL NULL
- Created SQLite indexes on 7 high-frequency query fields (antibody, organ_system, condition, etc.)
- All 6 tables successfully imported, totaling approximately **250,000 rows** of data

**2. API Development**

- Implemented 8 RESTful endpoints:
  - `/api/tables` — List all data tables
  - `/api/filter-options` — Dynamically retrieve filter option values
  - `/api/query` — Main query (supports multi-criteria AND/OR filtering, pagination, sorting)
  - `/api/chart/distribution` — Distribution chart data
  - `/api/chart/adverse-events` — Adverse event analysis (supports grouping by organ_system or adverse_event_term)
  - `/api/chart/comparative` — Treatment arm vs. comparator arm comparison
  - `/api/studies` — Retrieve the list of studies associated with an antibody
  - `/api/export` — CSV export
- Key business logic implemented:
  - CTGOV and Label data types use different calculation formulas (events_ab/n_ab vs. all_grades%)
  - Comparative analysis strictly compares within a single study — no cross-study aggregation

**3. Testing & Validation**

- All endpoints verified via manual curl testing
- Demonstrated specific query results (e.g., dinutuximab returns 515 records)

**Materials to present:**
- Start the backend and demonstrate several API calls using curl or a browser
- Show the table structure information in `table_meta.json`

---

## Report 3: Frontend Core Feature Development

### Key Talking Points

> "The frontend pages are now largely complete, with full query and visualization capabilities."

**1. Overall Architecture**

- Used React Context + useReducer for global state management (selected dataset, filter criteria, query results, chart data, etc.)
- Component-based design with a total of 12 components, each with a single responsibility
- Vite dev server automatically proxies `/api` to the backend, fully decoupling frontend and backend

**2. Search & Filtering**

- Global search bar: supports fuzzy antibody name search + autocomplete (300ms debounce)
- Filter panel: split into "Molecular Characteristics" and "Clinical & Study" columns
  - 10 multi-select dropdowns, implemented with react-select
  - Automatically shows/hides fields based on dataset type (e.g., Phase and Event Type only appear for CTGOV)
  - Each dropdown displays the count of selected items in real time
- Action bar: Apply Filters / Clear All + active filter count + total result count

**3. Data Visualization**

- **Distribution Dashboard**: 4 donut charts (Record Category, Molecular Category, MOA, Targets)
  - Categories exceeding 10 are automatically consolidated into "Top 9 + Other"
  - Supports click-to-expand for a detailed data table view
- **Adverse Event Analysis**: Horizontal bar chart displaying the Top 20
  - Toggle between "Organ System" and "Adverse Event Term" grouping
- **Treatment Arm Comparison**: Grouped bar chart
  - Requires selecting an antibody first (optionally a specific study), then clicking Compare

**4. Data Table**

- Paginated display (50 rows/page) with sortable column headers
- Export CSV functionality
- Priority columns displayed first, remaining columns in their original order

**Materials to present:**
- Start both frontend and backend, and give a live browser demonstration
- Switch between different datasets to showcase filter and chart interactions
- Demo searching for "dinutuximab" and show the comparative analysis

---

## Report 4: UI Polish + Documentation Delivery

### Key Talking Points

> "Building on the completed features, I performed a major visual overhaul of the entire UI, and also completed the bilingual delivery documentation."

**1. UI Visual Upgrade (Before & After)**

| Aspect | Before | After |
|--------|--------|-------|
| Typography | System default | Inter (Google Fonts), optimized rendering |
| Background | Solid gray-white | Tri-tone gradient + frosted glass cards |
| Header | White with thin border | Dark gradient + brand icon + glow effects |
| Search bar | Plain rectangular | Pill-shaped + search icon + focus glow |
| Filter panel | Always expanded | Collapsible + frosted glass + gradient dividers |
| Charts | Default rainbow colors | Unified color palette (indigo/purple/cyan/emerald) |
| Bar charts | Solid blue bars | Gradient opacity + subtle grid lines |
| Data table | Dense text | Increased row spacing + hover highlight + numbered pagination |
| Layout | AE/Comparative stacked vertically | AE and Comparative charts displayed side by side |
| Animations | None | fadeIn/slideDown animations + hover transitions |

- After a systematic UI review, the final design scored **9/10**

**2. Delivery Documentation**

- Wrote comprehensive bilingual (Chinese & English) delivery documentation, each approximately 500+ lines of Markdown
- Coverage includes:
  - Feature specification (detailed descriptions of all 9 modules)
  - Design documentation (system architecture, frontend component tree, backend API, data pipeline, UI design language)
  - User guide (installation steps, startup commands, 5 typical usage scenarios, interface layout diagrams)
  - API reference (request/response examples for all 8 endpoints)
  - Deployment plan (Nginx configuration, Gunicorn production deployment)
  - FAQ

**3. Data Update Plan**

- Future data updates require only replacing the Excel file + running a single command
- Adding new filter fields requires changes to only 2 files (one backend, one frontend)

**Materials to present:**
- Open the final version of the website and showcase the visual design
- Show before-and-after comparison screenshots
- Present the bilingual documentation

---

## Suggested Talking Points Reference

### Opening Template

> "Since the last update, I've mainly been working on [this report's focus area]. Let me give everyone a quick sync on the progress."

### Mentioning Challenges (for added authenticity)

- Report 1: "The data structure turned out to be more complex than expected — the 6 worksheets have inconsistent schemas, so it took some time to map out the field relationships."
- Report 2: "Data cleaning ran into a few issues — for example, the Excel file contained residual formulas and duplicate column names that required additional handling."
- Report 3: "Tuning the chart interactivity took quite a while, especially the donut charts where labels would overlap when there were too many categories — I eventually solved this with a consolidation strategy."
- Report 4: "The UI polish took longer than expected because I needed to ensure visual consistency across all components while not breaking any existing functionality."

### Closing Template

> "The work for this phase is now complete. The next step will be [preview of next report's content]. Feel free to reach out if there are any questions."

---

## Appendix: Live Demo Recommendations

| Report | Demo Needed? | Demo Content |
|--------|-------------|-------------|
| Report 1 | No — documents only | Functional spec + data field statistics |
| Report 2 | Optional | Demonstrate API calls via curl |
| Report 3 | **Yes — key demo** | Full walkthrough in the browser |
| Report 4 | **Yes — comparison demo** | Show UI before/after + documentation |
