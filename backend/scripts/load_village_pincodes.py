import csv
import os
import sys
from sqlalchemy import text

# Add backend directory to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from db import engine

KAGGLE_CSV_PATH = r"C:\Users\Wahab\.cache\kagglehub\datasets\pranaysuyash\india-locality-and-village-pincode\versions\1\Locality_village_pincode_India_mar-2017.csv"


def load_village_pincodes():
    print("=" * 60)
    print("LOADING INDIA LOCALITY & VILLAGE PINCODE DATASET (JALGAON)")
    print("=" * 60)

    if not os.path.exists(KAGGLE_CSV_PATH):
        print(f"Error: Dataset CSV not found at {KAGGLE_CSV_PATH}")
        return

    records = []
    with open(KAGGLE_CSV_PATH, "r", encoding="utf-8", errors="ignore") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get("Districtname", "").strip().upper() == "JALGAON":
                pincode = row.get("Pincode", "").strip().zfill(6)
                village = row.get("Village/Locality name", "").strip()
                office = row.get("Officename ( BO/SO/HO)", "").strip()
                sub_dist = row.get("Sub-distname", "").strip()
                if pincode and len(pincode) == 6 and pincode.isdigit():
                    records.append({
                        "pincode": pincode,
                        "village_locality": village,
                        "office_name": office,
                        "sub_district": sub_dist
                    })

    print(f"Parsed {len(records)} Jalgaon locality records from CSV.")

    # Create & load table pincode_localities
    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS pincode_localities;"))
        conn.execute(text("""
            CREATE TABLE pincode_localities (
                pincode TEXT NOT NULL,
                village_locality TEXT NOT NULL,
                office_name TEXT,
                sub_district TEXT
            );
        """))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_pincode_loc ON pincode_localities(pincode);"))

        insert_stmt = text("""
            INSERT INTO pincode_localities (pincode, village_locality, office_name, sub_district)
            VALUES (:pincode, :village_locality, :office_name, :sub_district);
        """)
        conn.execute(insert_stmt, records)

    print(f"Loaded {len(records)} records into SQLite table 'pincode_localities'.")

    # Match and enrich DB villages table where pincode is missing or unverified
    with engine.connect() as conn:
        village_rows = conn.execute(text("SELECT id, village FROM villages")).mappings().all()

    # Build lower-case lookup map for exact village matching
    village_map = {}
    for r in records:
        v_key = r["village_locality"].lower()
        if v_key not in village_map:
            village_map[v_key] = (r["pincode"], r["office_name"])

    updated_count = 0
    with engine.begin() as conn:
        for v in village_rows:
            v_name = v["village"].strip().lower()
            if v_name in village_map:
                pin, office = village_map[v_name]
                conn.execute(
                    text("UPDATE villages SET pincode = :pin WHERE id = :id AND (pincode IS NULL OR pincode = '' OR pincode = 'no pincode data')"),
                    {"pin": pin, "id": v["id"]}
                )
                updated_count += 1

    print(f"Enriched/verified {updated_count} villages in database table 'villages'.")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    load_village_pincodes()
