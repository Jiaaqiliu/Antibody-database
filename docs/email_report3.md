# Progress Update Email — Report 3

---

**Subject:** Antibody Database Explorer — Progress Update

---

Hi [Name],

Hope you're doing well. Wanted to give you a quick update on where things stand with the antibody database project.

**Backend (Phase 2) — Demo ready**

I've put together an initial demo of the backend service. Right now it covers the basics:

- Data ingestion pipeline that converts the raw Excel file (all 6 sheets) into a queryable database
- A set of API endpoints for querying, filtering, and pulling chart data
- Basic support for both CTGOV and FDA Label datasets, though the logic for handling differences between the two (e.g., different calculation formulas, field availability) still needs more work

It's functional enough to power the frontend demo, but there's definitely more to do — things like edge case handling, query optimization, and making the data cleaning more robust.

**Frontend (Phase 3) — Core features complete**

This is where most of my recent effort has gone. The web interface now has the main features working end to end:

- **Search & Filtering** — Global search bar with autocomplete for antibody names, plus a filter panel with multi-select dropdowns (target, MOA, condition, phase, etc.). Filters adapt automatically based on dataset type.
- **Data Visualization** — Three chart sections:
  - Distribution dashboard with 4 donut charts (record category, molecular category, MOA, targets)
  - Adverse event analysis bar chart (top 20, toggleable by organ system or AE term)
  - Comparative arm analysis (treatment vs. comparator within a single study)
- **Data Table** — Paginated results (50 rows/page), sortable columns, CSV export
- **Dataset Switching** — All 6 datasets are selectable from the header dropdown

I've attached a few screenshots so you can see the current state:

1. **01_header_search_distribution.png** — Header, search bar, and distribution donut charts
2. **02_ae_comparative_charts.png** — Adverse event chart and comparative arm analysis
3. **03_data_table.png** — Paginated data table with results

**Next steps**

If the frontend direction looks good to you, my plan is to circle back and flesh out the backend more thoroughly — tightening up data validation, refining the calculation logic for different dataset types, and improving overall reliability. That would be the focus for the next phase.

Let me know if you have any feedback or if you'd like a live walkthrough. Happy to jump on a call.

Best,
Jiaqi

---

*Attachments: 3 screenshots from `docs/screenshots/`*
