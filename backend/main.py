import sqlite3
import csv
import io
import os
import math
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

DB_PATH = os.path.join(os.path.dirname(__file__), "mab_database.sqlite")
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
VALID_TABLES = ["ctgov_all", "ctgov_serious", "ctgov_other", "label_final", "label_bbw", "label_wap"]

FILTERABLE_COLUMNS = {
    "ctgov": [
        "antibody", "general_molecular_category", "format_general_category",
        "isotype_fc", "record_category", "target_1", "condition",
        "organ_system", "phase", "moa_new", "event_type", "source",
        "target_harmonized_new", "target_supercluster", "mesh_class",
        "has_comparator", "is_single_arm",
    ],
    "label": [
        "antibody", "general_molecular_category", "format_general_category",
        "isotype_fc", "record_category", "target_1", "condition",
        "organ_system", "moa_new", "source", "bbw", "wap",
    ],
}

app = FastAPI(title="MAb Database API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


def get_conn():
    if not os.path.exists(DB_PATH):
        raise HTTPException(500, "Database not found. Run ingest.py first.")
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def validate_table(table: str):
    if table not in VALID_TABLES:
        raise HTTPException(400, f"Invalid table: {table}. Must be one of {VALID_TABLES}")


def quote_col(col: str) -> str:
    return f'"{col}"'


def table_type(table: str) -> str:
    return "ctgov" if table.startswith("ctgov") else "label"


def build_where(table: str, filters: dict, search: Optional[str] = None):
    clauses = []
    params = []
    for col, values in filters.items():
        if not values:
            continue
        placeholders = ",".join(["?"] * len(values))
        clauses.append(f'{quote_col(col)} IN ({placeholders})')
        params.extend(values)
    if search:
        clauses.append(f'{quote_col("antibody")} LIKE ?')
        params.append(f"%{search}%")
    where = " WHERE " + " AND ".join(clauses) if clauses else ""
    return where, params


class QueryRequest(BaseModel):
    table: str = "ctgov_all"
    filters: dict = {}
    search: Optional[str] = None
    page: int = 1
    page_size: int = 50
    sort_by: Optional[str] = None
    sort_dir: str = "asc"


class AEChartRequest(BaseModel):
    table: str = "ctgov_all"
    group_by: str = "organ_system"
    filters: dict = {}
    search: Optional[str] = None
    top_n: int = 20


class ComparativeRequest(BaseModel):
    table: str = "ctgov_all"
    antibody: str
    nct_id: Optional[str] = None
    group_by: str = "organ_system"
    top_n: int = 15


class CrossDatasetRequest(BaseModel):
    antibody: str
    group_by: str = "organ_system"
    top_n: int = 15


class TargetAggregationRequest(BaseModel):
    table: str = "ctgov_all"
    target: str
    group_by: str = "organ_system"
    top_n: int = 15


def calc_relative_risk(ab_events, ab_n, comp_events, comp_n):
    """Calculate Relative Risk and 95% CI"""
    if not ab_n or not comp_n or ab_n == 0 or comp_n == 0:
        return None, None, None
    
    ab_rate = ab_events / ab_n
    comp_rate = comp_events / comp_n
    
    if comp_rate == 0:
        return None, None, None
    
    rr = ab_rate / comp_rate
    
    if ab_events <= 0 or comp_events <= 0:
        return round(rr, 3), None, None
    
    try:
        ln_rr = math.log(rr)
        se = math.sqrt(1/ab_events - 1/ab_n + 1/comp_events - 1/comp_n)
        ci_lower = math.exp(ln_rr - 1.96 * se)
        ci_upper = math.exp(ln_rr + 1.96 * se)
        return round(rr, 3), round(ci_lower, 3), round(ci_upper, 3)
    except (ValueError, ZeroDivisionError):
        return round(rr, 3), None, None


@app.get("/api/tables")
def list_tables():
    conn = get_conn()
    result = []
    for t in VALID_TABLES:
        row = conn.execute(f"SELECT COUNT(*) as cnt FROM {t}").fetchone()
        result.append({"name": t, "rows": row["cnt"]})
    conn.close()
    return {"tables": result}


@app.get("/api/filter-options")
def filter_options(table: str = "ctgov_all"):
    validate_table(table)
    conn = get_conn()
    tt = table_type(table)
    cols = FILTERABLE_COLUMNS[tt]
    result = {}
    for col in cols:
        try:
            rows = conn.execute(
                f'SELECT DISTINCT {quote_col(col)} FROM {table} WHERE {quote_col(col)} IS NOT NULL ORDER BY {quote_col(col)}'
            ).fetchall()
            result[col] = [r[0] for r in rows]
        except Exception:
            result[col] = []
    conn.close()
    return result


@app.post("/api/query")
def query_data(req: QueryRequest):
    validate_table(req.table)
    conn = get_conn()
    where, params = build_where(req.table, req.filters, req.search)

    count_row = conn.execute(f"SELECT COUNT(*) as cnt FROM {req.table}{where}", params).fetchone()
    total = count_row["cnt"]

    order = ""
    if req.sort_by:
        direction = "DESC" if req.sort_dir.lower() == "desc" else "ASC"
        order = f" ORDER BY {quote_col(req.sort_by)} {direction}"

    offset = (req.page - 1) * req.page_size
    sql = f"SELECT * FROM {req.table}{where}{order} LIMIT ? OFFSET ?"
    rows = conn.execute(sql, params + [req.page_size, offset]).fetchall()
    data = [dict(r) for r in rows]
    conn.close()
    return {"data": data, "total": total, "page": req.page, "page_size": req.page_size}


@app.get("/api/chart/distribution")
def chart_distribution(table: str = "ctgov_all", column: str = "general_molecular_category",
                       filters: Optional[str] = None, search: Optional[str] = None):
    validate_table(table)
    conn = get_conn()

    filter_dict = {}
    if filters:
        import json
        try:
            filter_dict = json.loads(filters)
        except Exception:
            pass

    where, params = build_where(table, filter_dict, search)
    sql = f'SELECT {quote_col(column)} as label, COUNT(*) as cnt FROM {table}{where} AND {quote_col(column)} IS NOT NULL GROUP BY {quote_col(column)} ORDER BY cnt DESC'
    if not where:
        sql = f'SELECT {quote_col(column)} as label, COUNT(*) as cnt FROM {table} WHERE {quote_col(column)} IS NOT NULL GROUP BY {quote_col(column)} ORDER BY cnt DESC'

    rows = conn.execute(sql, params).fetchall()
    conn.close()
    return {"labels": [r["label"] for r in rows], "values": [r["cnt"] for r in rows]}


@app.post("/api/chart/adverse-events")
def chart_adverse_events(req: AEChartRequest):
    validate_table(req.table)
    conn = get_conn()
    where, params = build_where(req.table, req.filters, req.search)
    tt = table_type(req.table)
    gcol = quote_col(req.group_by)

    if tt == "ctgov":
        base_where = where if where else " WHERE 1=1"
        sql = f'''
            SELECT {gcol} as category,
                   SUM(CAST(events_ab AS REAL)) as total_events,
                   SUM(CAST(n_ab AS REAL)) as total_n
            FROM {req.table}{base_where} AND {gcol} IS NOT NULL AND events_ab IS NOT NULL AND n_ab IS NOT NULL AND n_ab > 0
            GROUP BY {gcol}
            ORDER BY total_events DESC
            LIMIT ?
        '''
        rows = conn.execute(sql, params + [req.top_n]).fetchall()
        categories = [r["category"] for r in rows]
        proportions = [round(r["total_events"] / r["total_n"] * 100, 2) if r["total_n"] else 0 for r in rows]
        counts = [r["total_events"] for r in rows]
    else:
        base_where = where if where else " WHERE 1=1"
        pct_col = quote_col("all_grades%")
        sql = f'''
            SELECT {gcol} as category,
                   AVG(CAST({pct_col} AS REAL)) as avg_pct,
                   COUNT(*) as cnt
            FROM {req.table}{base_where} AND {gcol} IS NOT NULL AND {pct_col} IS NOT NULL
            GROUP BY {gcol}
            ORDER BY avg_pct DESC
            LIMIT ?
        '''
        rows = conn.execute(sql, params + [req.top_n]).fetchall()
        categories = [r["category"] for r in rows]
        proportions = [round(r["avg_pct"], 2) if r["avg_pct"] else 0 for r in rows]
        counts = [r["cnt"] for r in rows]

    conn.close()
    return {"categories": categories, "proportions": proportions, "counts": counts}


@app.post("/api/chart/comparative")
def chart_comparative(req: ComparativeRequest):
    validate_table(req.table)
    conn = get_conn()
    tt = table_type(req.table)
    gcol = quote_col(req.group_by)

    if tt == "ctgov":
        where_parts = [f'{quote_col("antibody")} = ?', f'{gcol} IS NOT NULL']
        params = [req.antibody]
        if req.nct_id:
            where_parts.append(f'{quote_col("nct_id")} = ?')
            params.append(req.nct_id)
        where_parts.append("n_ab IS NOT NULL AND n_ab > 0")
        where = " WHERE " + " AND ".join(where_parts)

        sql = f'''
            SELECT {gcol} as category,
                   SUM(CAST(events_ab AS REAL)) as ab_events,
                   MAX(CAST(n_ab AS REAL)) as ab_n,
                   SUM(CAST(events_comp AS REAL)) as comp_events,
                   MAX(CAST(n_comp AS REAL)) as comp_n
            FROM {req.table}{where}
            GROUP BY {gcol}
            ORDER BY ab_events DESC
            LIMIT ?
        '''
        rows = conn.execute(sql, params + [req.top_n]).fetchall()
        categories = [r["category"] for r in rows]
        ab_proportions = [round(r["ab_events"] / r["ab_n"] * 100, 2) if r["ab_n"] else 0 for r in rows]
        comp_proportions = [round(r["comp_events"] / r["comp_n"] * 100, 2) if r["comp_n"] else 0 for r in rows]
    else:
        pct_col = quote_col("all_grades%")
        comp_pct_col = quote_col("comp_all_grades%")
        where = f' WHERE {quote_col("antibody")} = ? AND {gcol} IS NOT NULL'
        params = [req.antibody]

        sql = f'''
            SELECT {gcol} as category,
                   AVG(CAST({pct_col} AS REAL)) as ab_pct,
                   AVG(CAST({comp_pct_col} AS REAL)) as comp_pct
            FROM {req.table}{where}
            GROUP BY {gcol}
            ORDER BY ab_pct DESC
            LIMIT ?
        '''
        rows = conn.execute(sql, params + [req.top_n]).fetchall()
        categories = [r["category"] for r in rows]
        ab_proportions = [round(r["ab_pct"], 2) if r["ab_pct"] else 0 for r in rows]
        comp_proportions = [round(r["comp_pct"], 2) if r["comp_pct"] else 0 for r in rows]

    rr_values = []
    rr_ci_lower = []
    rr_ci_upper = []
    
    if tt == "ctgov":
        for r in rows:
            rr, ci_l, ci_u = calc_relative_risk(
                r["ab_events"], r["ab_n"], r["comp_events"], r["comp_n"]
            )
            rr_values.append(rr)
            rr_ci_lower.append(ci_l)
            rr_ci_upper.append(ci_u)
    else:
        rr_values = [None] * len(categories)
        rr_ci_lower = [None] * len(categories)
        rr_ci_upper = [None] * len(categories)

    conn.close()
    return {
        "ab_arm": {"categories": categories, "proportions": ab_proportions},
        "comp_arm": {"categories": categories, "proportions": comp_proportions},
        "relative_risk": {"values": rr_values, "ci_lower": rr_ci_lower, "ci_upper": rr_ci_upper},
    }


@app.post("/api/chart/cross-dataset")
def chart_cross_dataset(req: CrossDatasetRequest):
    conn = get_conn()
    gcol = quote_col(req.group_by)
    
    ctgov_sql = f'''
        SELECT {gcol} as category,
               SUM(CAST(events_ab AS REAL)) as total_events,
               MAX(CAST(n_ab AS REAL)) as total_n
        FROM ctgov_all
        WHERE {quote_col("antibody")} = ? AND {gcol} IS NOT NULL 
              AND events_ab IS NOT NULL AND n_ab IS NOT NULL AND n_ab > 0
        GROUP BY {gcol}
    '''
    ctgov_rows = conn.execute(ctgov_sql, [req.antibody]).fetchall()
    ctgov_data = {r["category"]: round(r["total_events"] / r["total_n"] * 100, 2) if r["total_n"] else 0 for r in ctgov_rows}
    
    pct_col = quote_col("all_grades%")
    label_sql = f'''
        SELECT {gcol} as category,
               AVG(CAST({pct_col} AS REAL)) as avg_pct
        FROM label_final
        WHERE {quote_col("antibody")} = ? AND {gcol} IS NOT NULL AND {pct_col} IS NOT NULL
        GROUP BY {gcol}
    '''
    label_rows = conn.execute(label_sql, [req.antibody]).fetchall()
    label_data = {r["category"]: round(r["avg_pct"], 2) if r["avg_pct"] else 0 for r in label_rows}
    
    all_categories = sorted(set(ctgov_data.keys()) | set(label_data.keys()))
    
    if req.top_n and len(all_categories) > req.top_n:
        category_max = [(c, max(ctgov_data.get(c, 0), label_data.get(c, 0))) for c in all_categories]
        category_max.sort(key=lambda x: x[1], reverse=True)
        all_categories = [c[0] for c in category_max[:req.top_n]]
    
    conn.close()
    return {
        "categories": all_categories,
        "ctgov": {"values": [ctgov_data.get(c, None) for c in all_categories]},
        "label": {"values": [label_data.get(c, None) for c in all_categories]},
        "antibody": req.antibody,
    }


@app.post("/api/chart/target-aggregation")
def chart_target_aggregation(req: TargetAggregationRequest):
    validate_table(req.table)
    conn = get_conn()
    tt = table_type(req.table)
    gcol = quote_col(req.group_by)
    
    if tt == "ctgov":
        sql = f'''
            SELECT {gcol} as category,
                   antibody,
                   SUM(CAST(events_ab AS REAL)) as total_events,
                   MAX(CAST(n_ab AS REAL)) as total_n
            FROM {req.table}
            WHERE {quote_col("target_1")} = ? AND {gcol} IS NOT NULL 
                  AND events_ab IS NOT NULL AND n_ab IS NOT NULL AND n_ab > 0
            GROUP BY {gcol}, antibody
        '''
        rows = conn.execute(sql, [req.target]).fetchall()
        
        category_stats = {}
        for r in rows:
            cat = r["category"]
            pct = round(r["total_events"] / r["total_n"] * 100, 2) if r["total_n"] else 0
            if cat not in category_stats:
                category_stats[cat] = []
            category_stats[cat].append(pct)
    else:
        pct_col = quote_col("all_grades%")
        sql = f'''
            SELECT {gcol} as category,
                   antibody,
                   AVG(CAST({pct_col} AS REAL)) as avg_pct
            FROM {req.table}
            WHERE {quote_col("target_1")} = ? AND {gcol} IS NOT NULL AND {pct_col} IS NOT NULL
            GROUP BY {gcol}, antibody
        '''
        rows = conn.execute(sql, [req.target]).fetchall()
        
        category_stats = {}
        for r in rows:
            cat = r["category"]
            pct = round(r["avg_pct"], 2) if r["avg_pct"] else 0
            if cat not in category_stats:
                category_stats[cat] = []
            category_stats[cat].append(pct)
    
    result = []
    for cat, values in category_stats.items():
        if values:
            result.append({
                "category": cat,
                "mean": round(sum(values) / len(values), 2),
                "min": round(min(values), 2),
                "max": round(max(values), 2),
                "count": len(values),
            })
    
    result.sort(key=lambda x: x["mean"], reverse=True)
    if req.top_n:
        result = result[:req.top_n]
    
    conn.close()
    return {
        "target": req.target,
        "data": result,
    }


@app.get("/api/overlapping-antibodies")
def get_overlapping_antibodies():
    conn = get_conn()
    ctgov_abs = set(r[0].lower().strip() for r in conn.execute(
        "SELECT DISTINCT antibody FROM ctgov_all WHERE antibody IS NOT NULL AND antibody != ''"
    ).fetchall())
    label_abs = set(r[0].lower().strip() for r in conn.execute(
        "SELECT DISTINCT antibody FROM label_final WHERE antibody IS NOT NULL AND antibody != ''"
    ).fetchall())
    overlap = sorted(ctgov_abs & label_abs)
    conn.close()
    return {"antibodies": overlap, "count": len(overlap)}


@app.get("/api/targets")
def get_targets(table: str = "ctgov_all"):
    validate_table(table)
    conn = get_conn()
    rows = conn.execute(
        f'SELECT DISTINCT {quote_col("target_1")} FROM {table} WHERE {quote_col("target_1")} IS NOT NULL ORDER BY {quote_col("target_1")}'
    ).fetchall()
    conn.close()
    return {"targets": [r[0] for r in rows]}


@app.get("/api/studies")
def list_studies(table: str = "ctgov_all", antibody: str = ""):
    validate_table(table)
    if table_type(table) != "ctgov":
        return {"studies": []}
    conn = get_conn()
    where = f' WHERE {quote_col("antibody")} LIKE ?' if antibody else ""
    params = [f"%{antibody}%"] if antibody else []
    rows = conn.execute(
        f'SELECT DISTINCT nct_id FROM {table}{where} ORDER BY nct_id', params
    ).fetchall()
    conn.close()
    return {"studies": [r["nct_id"] for r in rows]}


@app.get("/api/export")
def export_csv(table: str = "ctgov_all", filters: Optional[str] = None, search: Optional[str] = None):
    validate_table(table)
    conn = get_conn()

    filter_dict = {}
    if filters:
        import json
        try:
            filter_dict = json.loads(filters)
        except Exception:
            pass

    where, params = build_where(table, filter_dict, search)
    rows = conn.execute(f"SELECT * FROM {table}{where}", params).fetchall()
    if not rows:
        conn.close()
        raise HTTPException(404, "No data matching filters")

    columns = rows[0].keys()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(columns)
    for r in rows:
        writer.writerow([r[c] for c in columns])
    conn.close()

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={table}_export.csv"},
    )


# Serve static frontend files in production
if os.path.exists(STATIC_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve the SPA for any non-API routes"""
        file_path = os.path.join(STATIC_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
