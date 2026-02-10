"""
Data ingestion: Convert all 6 Excel sheets into SQLite for fast querying.
Sheets:
  CTGOV_all, CTGOV_serious, CTGOV_other  (source=CTGOV)
  Label_Final, Label_BBW, Label_WAP       (source=FDA)
"""
import sqlite3
import pandas as pd
import os
import json

EXCEL_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "Full_mab_datasets.xlsx")
DB_PATH = os.path.join(os.path.dirname(__file__), "mab_database.sqlite")


def normalize_col_name(name: str) -> str:
    return (name.strip().lower()
            .replace(" ", "_").replace(",_", "_")
            .replace("(", "").replace(")", "")
            .replace("/", "_").replace(".", "_")
            .replace("?", ""))


def clean_df(df: pd.DataFrame) -> pd.DataFrame:
    new_cols = []
    seen = {}
    for c in df.columns:
        normalized = normalize_col_name(c)
        if normalized in seen:
            seen[normalized] += 1
            normalized = f"{normalized}_{seen[normalized]}"
        else:
            seen[normalized] = 0
        new_cols.append(normalized)
    df.columns = new_cols
    df = df.replace({"NA": None, "None": None, "": None})
    return df


def ingest():
    print(f"Reading Excel: {EXCEL_PATH}")
    sheets = {
        "ctgov_all": "CTGOV_all",
        "ctgov_serious": "CTGOV_serious",
        "ctgov_other": "CTGOV_other",
        "label_final": "Label_Final",
        "label_bbw": "Label_BBW",
        "label_wap": "Label_WAP",
    }

    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    conn = sqlite3.connect(DB_PATH)

    all_table_info = {}

    for table_name, sheet_name in sheets.items():
        print(f"  Loading sheet: {sheet_name} -> table: {table_name}")
        df = pd.read_excel(EXCEL_PATH, sheet_name=sheet_name, engine="openpyxl")
        df = clean_df(df)

        # Drop formula columns (they show up as strings starting with '=')
        for idx, col in enumerate(df.columns):
            series = df.iloc[:, idx]
            if series.dtype == object:
                sample = series.dropna().head(10)
                if len(sample) > 0 and sample.astype(str).str.startswith("=").any():
                    print(f"    Dropping formula column: {col}")
                    df.iloc[:, idx] = None

        df.to_sql(table_name, conn, if_exists="replace", index=False)
        all_table_info[table_name] = {
            "rows": len(df),
            "columns": list(df.columns),
        }
        print(f"    -> {len(df)} rows, {len(df.columns)} columns")

    # Create indexes for common filter columns
    common_indexes = [
        ("antibody", ["ctgov_all", "ctgov_serious", "ctgov_other", "label_final", "label_bbw", "label_wap"]),
        ("organ_system", ["ctgov_all", "ctgov_serious", "ctgov_other", "label_final", "label_bbw", "label_wap"]),
        ("adverse_event_term", ["ctgov_all", "ctgov_serious", "ctgov_other", "label_final", "label_bbw", "label_wap"]),
        ("condition", ["ctgov_all", "ctgov_serious", "ctgov_other", "label_final", "label_bbw", "label_wap"]),
        ("general_molecular_category", ["ctgov_all", "ctgov_serious", "ctgov_other", "label_final", "label_bbw", "label_wap"]),
        ("record_category", ["ctgov_all", "ctgov_serious", "ctgov_other", "label_final", "label_bbw", "label_wap"]),
        ("source", ["ctgov_all", "ctgov_serious", "ctgov_other"]),
    ]
    for col, tables in common_indexes:
        for t in tables:
            try:
                conn.execute(f"CREATE INDEX IF NOT EXISTS idx_{t}_{col} ON {t}({col})")
            except Exception as e:
                print(f"    Index skip {t}.{col}: {e}")

    conn.commit()

    # Save metadata
    meta_path = os.path.join(os.path.dirname(__file__), "table_meta.json")
    with open(meta_path, "w") as f:
        json.dump(all_table_info, f, indent=2)
    print(f"\nMetadata saved to {meta_path}")

    # Print unique value counts for key filter fields
    print("\n--- Filter field cardinality ---")
    for col in ["antibody", "general_molecular_category", "format_general_category",
                 "isotype_fc", "record_category", "target_1", "moa_new",
                 "organ_system", "condition", "phase"]:
        try:
            cur = conn.execute(f"SELECT COUNT(DISTINCT {col}) FROM ctgov_all WHERE {col} IS NOT NULL")
            count = cur.fetchone()[0]
            print(f"  ctgov_all.{col}: {count} distinct values")
        except Exception:
            pass

    conn.close()
    print(f"\nDatabase saved to {DB_PATH}")


if __name__ == "__main__":
    ingest()
