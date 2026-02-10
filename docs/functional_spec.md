# Antibody Database Website — Functional Specification

## 1. Overview

A web-based interface for querying, filtering, and visualizing an antibody/molecule clinical development database. The system supports multi-criteria search, dynamic charting, adverse event analytics, and comparative arm analysis.

---

## 2. Data Model

### 2.1 Core Data Fields

| Category | Field | Column (Dataset) | Type |
|----------|-------|-------------------|------|
| **Molecule ID** | Molecule name | INN / drug code | Text |
| **Molecular Characteristics** | General Molecular Category | `general_molecular_category` | Categorical |
| | Target antigen(s) | `target` | Text / Multi-value |
| | Format (general category) | `format` | Categorical |
| | Isotype (Fc) | `fc_isotype` | Categorical |
| **Clinical Development** | General development status category | `general_development_status_category` | Categorical |
| | Most advanced stage of development (global) | `most_advanced_stage` | Categorical |
| | Primary therapeutic area | `primary_therapeutic_area` | Categorical |
| | Date column (selectable) | Multiple date columns | Year (1980–2026) |
| **Safety / Adverse Events** | Subject/antibody count | `n_ab` | Numeric |
| | Adverse event counts | `adverse_event_counts` | Numeric |
| | Organ system | `organ_system` | Categorical (Level 1) |
| | Adverse event term | `adverse_event_term` | Categorical (Level 2) |
| **Study Design** | Comparative arm | `comp_arm` | Text / Categorical |
| **Metadata** | Condition | `condition` | Categorical |
| | Antibody | `antibody` | Text |
| | Record category | `record_category` | Categorical |
| | Source | `source` | Enum: FDA, CTGOV |

> **Note:** Exact column names will be confirmed once the dataset is provided. The names above are inferred from the requirements document.

---

## 3. Feature Breakdown

### F1 — Global Molecule Search

| Attribute | Detail |
|-----------|--------|
| **Description** | Free-text search bar at the top of the page |
| **Input** | Molecule name (INN or drug code) |
| **Behavior** | Autocomplete / typeahead against known molecule names; filters all downstream views |
| **UI Component** | Single text input with placeholder "Search molecule name..." |

---

### F2 — Filter Panel: Molecular Characteristics

| Filter | UI Component | Behavior |
|--------|-------------|----------|
| General Molecular Category | Multi-select dropdown | Select one or more categories |
| Target antigen(s) | Searchable text input | Typeahead; includes "Click here to view the target list" link opening a full list |
| Format (general category) | Multi-select dropdown | Select one or more formats |
| Isotype (Fc) | Multi-select dropdown | Select one or more isotypes |

---

### F3 — Filter Panel: Clinical Development

| Filter | UI Component | Behavior |
|--------|-------------|----------|
| Development status | Radio button toggle | Switch between "General development status category" and "Most advanced stage of development (global)" |
| Status value | Multi-select dropdown | Options change based on radio selection above |
| Date range | Dropdown (column selector) + Range slider | Choose which date column to filter on; slider spans 1980–2026 |
| Primary therapeutic area | Multi-select dropdown | Select one or more areas |

---

### F4 — Additional Filters

| Filter | UI Component |
|--------|-------------|
| Condition | Multi-select dropdown |
| Antibody | Searchable input |
| Record category | Multi-select dropdown |
| Source (FDA vs. CTGOV) | Toggle / checkbox / dropdown |

---

### F5 — Filter Action

| Attribute | Detail |
|-----------|--------|
| **Trigger** | "Filter" button with magnifying glass icon |
| **Behavior** | Applies all selected filter criteria simultaneously; updates the dashboard (F6) and data table |
| **Reset** | "Clear Filters" button to reset all criteria |

---

### F6 — Distribution Dashboard (Donut/Sunburst Charts)

Four dynamic summary charts, each with an "Expand" button for detail view:

| Chart | Data Source | Visualization |
|-------|------------|---------------|
| Distribution of General Development Status Category | `general_development_status_category` | Donut chart |
| Distribution of General Molecular Category | `general_molecular_category` | Donut chart |
| Distribution of Primary Therapeutic Area | `primary_therapeutic_area` | Donut chart |
| Distribution of Targets | `target` | Donut chart (multi-segment) |

**Behavior:**
- Charts update dynamically when filters are applied.
- Each chart has an "Expand" button that opens a larger detail view (modal or dedicated page).
- Chart segments are clickable for drill-down filtering.

---

### F7 — Adverse Event Analytics

| Attribute | Detail |
|-----------|--------|
| **Data** | `n_ab`, adverse event counts per row |
| **Grouping Level 1** | By `organ_system` |
| **Grouping Level 2** | By `adverse_event_term` (within organ system) |
| **Visualization** | Bar plots showing proportions of different adverse event types |
| **Interaction** | Toggle between organ system level and adverse event term level |

---

### F8 — Comparative Arm Analysis (Side-by-Side)

| Attribute | Detail |
|-----------|--------|
| **Condition** | Only displayed when `comp_arm` data is available for the selected combination |
| **Behavior** | Show side-by-side comparison of treatment arm vs. comparative arm |
| **Constraint** | Do NOT aggregate multiple studies with different arms; compare within a single study/combination |
| **Fallback** | If user explicitly chooses to aggregate across studies, show a distribution view |
| **Visualization** | Paired bar charts or grouped bar plots |

---

### F9 — Data Table / Results View

| Attribute | Detail |
|-----------|--------|
| **Description** | Tabular display of filtered records |
| **Features** | Sortable columns, pagination, export (CSV) |
| **Fields displayed** | All core data fields from Section 2.1 |
| **Behavior** | Updates in sync with filter criteria |

---

## 4. UI Layout

```
┌─────────────────────────────────────────────────────────┐
│  [F1] Global Search: Molecule Name                      │
├────────────────────────┬────────────────────────────────┤
│  [F2] Molecular Chars  │  [F3] Clinical Development     │
│  • Molecular Category  │  • Status radio toggle         │
│  • Target antigen(s)   │  • Status dropdown             │
│  • Format              │  • Date column + range slider  │
│  • Isotype (Fc)        │  • Therapeutic area            │
├────────────────────────┴────────────────────────────────┤
│  [F4] Additional Filters (Condition, Source, etc.)      │
├─────────────────────────────────────────────────────────┤
│  [F5] [ 🔍 Filter ]  [ Clear Filters ]                 │
├──────────────┬──────────────┬──────────────┬────────────┤
│  [F6] Donut  │  [F6] Donut  │  [F6] Donut  │ [F6] Donut│
│  Dev Status  │  Mol Category│  Therapy Area│  Targets   │
│  [Expand]    │  [Expand]    │  [Expand]    │  [Expand]  │
├──────────────┴──────────────┴──────────────┴────────────┤
│  [F7] Adverse Event Bar Charts                          │
│  (organ_system / adverse_event_term level toggle)       │
├─────────────────────────────────────────────────────────┤
│  [F8] Comparative Arm Side-by-Side (if comp_arm exists) │
├─────────────────────────────────────────────────────────┤
│  [F9] Data Table (sortable, paginated, exportable)      │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Business Logic Rules

| Rule | Description |
|------|-------------|
| **BL-1** | All filter criteria are applied with AND logic (intersection). |
| **BL-2** | Multi-select within a single filter uses OR logic (union). |
| **BL-3** | When `comp_arm` is present, never auto-aggregate across studies with different arms. |
| **BL-4** | Aggregation across studies is only allowed via explicit user action with a distribution view. |
| **BL-5** | Charts and dropdowns populate dynamically from actual dataset values (not hardcoded). |
| **BL-6** | Date range filter applies to a user-selected date column (dataset may have multiple date fields). |

---

## 6. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Responsive layout | Desktop-first; functional on tablet |
| Performance | Filter + chart update < 2s for datasets up to 100k rows |
| Browser support | Chrome, Firefox, Safari (latest 2 versions) |
| Accessibility | Keyboard-navigable filters; chart color-blind safe palette |

---

## 7. Open Questions (To Confirm with Dataset)

1. Exact column header names in the dataset.
2. How many distinct date columns exist and their names.
3. Whether `n_ab` is per-row or needs aggregation.
4. Full list of possible `source` values (beyond FDA and CTGOV).
5. Whether molecule search should be exact match or fuzzy.
6. Export format requirements beyond CSV.

---

*Document version: 1.0 — Generated from `preliminary_query_build_doc.pdf`*
