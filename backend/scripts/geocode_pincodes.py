import csv
import json
import os
import sys
import time
import urllib.request
import urllib.parse
from sqlalchemy import text

# Add backend directory to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from db import engine

CSV_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "data", "raw", "pincode_coordinates_approx.csv")
)

USER_AGENT = "GramBiz-Feasibility-App/1.0 (contact: admin@grambiz.local)"


def geocode_pincode(pincode: str):
    """
    Query OpenStreetMap Nominatim for Indian pincode coordinates.
    Returns (lat, lon) float tuple or None if match failed.
    """
    url = f"https://nominatim.openstreetmap.org/search?postalcode={urllib.parse.quote(pincode)}&country=India&format=json"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode("utf-8"))
            if isinstance(data, list) and len(data) > 0:
                first = data[0]
                lat = float(first.get("lat"))
                lon = float(first.get("lon"))
                return lat, lon
    except Exception:
        pass
    
    return None


def run_geocoding(limit: int = 50):
    print("=" * 60)
    print("PHASE G: OPENSTREETMAP NOMINATIM PINCODE GEOCODING")
    print("=" * 60)

    # 1. Fetch district pincodes (Jalgaon 425xxx & village pincodes)
    with engine.connect() as conn:
        query = text("""
            SELECT DISTINCT pincode 
            FROM pincode_business_counts 
            WHERE pincode LIKE '425%' OR pincode IN (SELECT DISTINCT pincode FROM villages WHERE pincode IS NOT NULL AND pincode != '')
            ORDER BY pincode;
        """)
        rows = conn.execute(query).fetchall()
        all_pincodes = [r[0] for r in rows if r[0] and r[0] != "no pincode data"]

    if limit:
        all_pincodes = all_pincodes[:limit]

    print(f"Evaluating top {len(all_pincodes)} district pincodes...")

    existing_geocodes = {}
    if os.path.exists(CSV_PATH):
        with open(CSV_PATH, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("#") or not line.strip():
                    continue
                parts = line.strip().split(",")
                if len(parts) >= 4 and parts[0] != "pincode":
                    try:
                        existing_geocodes[parts[0]] = (float(parts[1]), float(parts[2]), parts[3])
                    except ValueError:
                        pass
        print(f"Loaded {len(existing_geocodes)} cached pincodes from CSV.")

    success_count = 0
    excluded_count = 0
    new_fetches = 0
    geocoded_results = dict(existing_geocodes)

    for idx, p in enumerate(all_pincodes, 1):
        if p in existing_geocodes:
            success_count += 1
            print(f"[{idx}/{len(all_pincodes)}] {p} -> Cached (Lat: {existing_geocodes[p][0]}, Lon: {existing_geocodes[p][1]})")
            continue

        res = geocode_pincode(p)
        new_fetches += 1

        if res:
            lat, lon = res
            geocoded_results[p] = (lat, lon, "nominatim_approx")
            success_count += 1
            print(f"[{idx}/{len(all_pincodes)}] [SUCCESS] {p} -> Lat: {lat}, Lon: {lon}")
        else:
            excluded_count += 1
            print(f"[{idx}/{len(all_pincodes)}] [EXCLUDED] {p} — excluded — no geocode match")

        time.sleep(1.1)

    # Save to CSV
    os.makedirs(os.path.dirname(CSV_PATH), exist_ok=True)
    with open(CSV_PATH, "w", encoding="utf-8", newline="") as f:
        f.write("# Approximate pincode coordinates via OpenStreetMap Nominatim - for reference only\n")
        writer = csv.writer(f)
        writer.writerow(["pincode", "latitude", "longitude", "source"])
        for p, (lat, lon, src) in sorted(geocoded_results.items()):
            writer.writerow([p, lat, lon, src])

    # Load into SQLite Database
    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS pincode_coordinates;"))
        conn.execute(text("""
            CREATE TABLE pincode_coordinates (
                pincode TEXT PRIMARY KEY,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                source TEXT NOT NULL
            );
        """))

        insert_stmt = text("""
            INSERT INTO pincode_coordinates (pincode, latitude, longitude, source)
            VALUES (:pincode, :latitude, :longitude, :source);
        """)

        insert_data = [
            {"pincode": p, "latitude": lat, "longitude": lon, "source": src}
            for p, (lat, lon, src) in geocoded_results.items()
        ]

        conn.execute(insert_stmt, insert_data)

    print("\n" + "=" * 60)
    print("GEOCODING SUMMARY REPORT")
    print("=" * 60)
    print(f"  Total District Pincodes Evaluated : {len(all_pincodes)}")
    print(f"  New Nominatim Fetches            : {new_fetches}")
    print(f"  Successfully Geocoded            : {success_count}")
    print(f"  Excluded (No Match)              : {excluded_count}")
    print(f"  Ingested Table Rows              : {len(insert_data)}")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    run_geocoding(limit=50)
