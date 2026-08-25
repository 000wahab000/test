import csv
import json
import os
import sys
from sqlalchemy import text

# Add backend directory to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from db import engine
from nic_mapping import map_nic_code

CSV_PATH = r"d:\wahab stuff\wahab code\test\data\8b68ae56-84cf-4728-a0a6-1be11028dea7_486885273ba513e60f50451d852a8e23.csv"


def clean_pincode(pincode_raw: str) -> str:
    p_str = str(pincode_raw or "").split(".")[0].strip().zfill(6)
    return p_str if len(p_str) == 6 and p_str.isdigit() else ""


def load_msme():
    # ponytail: in-memory streaming dict aggregation; upgrade: DuckDB/Pandas if dataset grows to millions of rows
    print(f"Reading MSME CSV from: {CSV_PATH}")
    
    total_rows = 0
    skipped_rows = 0
    
    # Store counts: (pincode, category) -> integer count of enterprises
    pincode_cat_counts = {}
    
    # Global category distribution counts across all unique enterprise-category occurrences
    global_category_counts = {"dairy": 0, "retail": 0, "agro-processing": 0, "other": 0}
    total_enterprise_category_links = 0

    with open(CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            total_rows += 1
            pincode = clean_pincode(row.get("Pincode", ""))
            act_str = row.get("Activities", "")
            
            if not pincode or not act_str:
                skipped_rows += 1
                continue
                
            try:
                activities = json.loads(act_str)
                if not isinstance(activities, list):
                    skipped_rows += 1
                    continue
                
                # Determine distinct categories for this enterprise row
                row_categories = set()
                for item in activities:
                    if isinstance(item, dict):
                        nic_id = str(item.get("NIC5DigitId", "")).strip()
                        cat = map_nic_code(nic_id)
                        row_categories.add(cat)
                
                if not row_categories:
                    skipped_rows += 1
                    continue

                for cat in row_categories:
                    key = (pincode, cat)
                    pincode_cat_counts[key] = pincode_cat_counts.get(key, 0) + 1
                    global_category_counts[cat] += 1
                    total_enterprise_category_links += 1

            except (json.JSONDecodeError, Exception):
                skipped_rows += 1
                continue

    print(f"\nCompleted CSV Parsing:")
    print(f"  Total Data Rows Processed: {total_rows}")
    print(f"  Skipped / Invalid Rows: {skipped_rows}")
    print(f"  Valid Enterprise Records Aggregated: {total_rows - skipped_rows}")
    print(f"  Unique (Pincode, Category) Pairs: {len(pincode_cat_counts)}")

    # Database Ingestion
    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS pincode_business_counts;"))
        conn.execute(text("""
            CREATE TABLE pincode_business_counts (
                pincode TEXT NOT NULL,
                category TEXT NOT NULL,
                count INTEGER NOT NULL,
                PRIMARY KEY (pincode, category)
            );
        """))
        
        insert_stmt = text("""
            INSERT INTO pincode_business_counts (pincode, category, count)
            VALUES (:pincode, :category, :count);
        """)
        
        insert_data = [
            {"pincode": pin, "category": cat, "count": cnt}
            for (pin, cat), cnt in pincode_cat_counts.items()
        ]
        
        conn.execute(insert_stmt, insert_data)

    print(f"\nSuccessfully loaded {len(insert_data)} rows into table 'pincode_business_counts' in database.")

    # One-time Percentage Breakdown Reporting
    print("\n" + "="*50)
    print("MSME DATASET CATEGORY BREAKDOWN REPORT (JALGAON)")
    print("="*50)
    for cat in ["dairy", "retail", "agro-processing", "other"]:
        cnt = global_category_counts[cat]
        pct = (cnt / total_enterprise_category_links * 100) if total_enterprise_category_links > 0 else 0.0
        print(f"  - {cat.upper():<16}: {cnt:>6} enterprises ({pct:>5.1f}%)")
    print("-" * 50)
    print(f"  Total Enterprise-Category Links: {total_enterprise_category_links}")
    print("="*50 + "\n")


if __name__ == "__main__":
    load_msme()
