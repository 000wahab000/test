import os
import csv
import sqlite3

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "feasibility.db")
CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "lati", "India_Pincode_Boundary_with_LatLong_and_Shape_2022.csv")

def load_pincode_coords():
    print(f"Loading pincode coordinates from: {CSV_PATH}")
    if not os.path.exists(CSV_PATH):
        print(f"ERROR: Coordinate CSV not found at {CSV_PATH}")
        return

    coords = []
    invalid_coords = []
    pincode_seen = set()

    with open(CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            pincode = row.get("pin_code", "").strip()
            if not pincode or pincode in pincode_seen:
                continue

            try:
                lat = float(row.get("latitude", 0.0))
                lng = float(row.get("longitude", 0.0))
            except (ValueError, TypeError):
                print(f"excluded — invalid coordinates: pincode {pincode} has non-numeric lat/long ({row.get('latitude')}, {row.get('longitude')})")
                invalid_coords.append(pincode)
                continue

            # Bounding box for India: latitude 6-38, longitude 68-98
            if not (6.0 <= lat <= 38.0 and 68.0 <= lng <= 98.0):
                print(f"excluded — invalid coordinates: pincode {pincode} out of India bounding box ({lat}, {lng})")
                invalid_coords.append(pincode)
                continue

            pincode_seen.add(pincode)
            coords.append((pincode, lat, lng, "India Post 2022 dataset"))

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pincode_coordinates (
            pincode TEXT PRIMARY KEY,
            latitude REAL,
            longitude REAL,
            source TEXT
        )
    """)

    cursor.execute("DELETE FROM pincode_coordinates")
    cursor.executemany("""
        INSERT OR REPLACE INTO pincode_coordinates (pincode, latitude, longitude, source)
        VALUES (?, ?, ?, ?)
    """, coords)

    conn.commit()
    print(f"Successfully loaded {len(coords)} pincode coordinates into pincode_coordinates table.")

    # Phase G Step 2: Check for pincodes in pincode_business_counts with no coordinate data
    cursor.execute("SELECT DISTINCT pincode FROM pincode_business_counts")
    all_pincodes = [r[0] for r in cursor.fetchall()]

    cursor.execute("SELECT pincode FROM pincode_coordinates")
    coord_pincodes = set(r[0] for r in cursor.fetchall())

    invalid_count = 0
    no_coord_count = 0
    matched_count = 0

    for pin in all_pincodes:
        if pin in invalid_coords:
            invalid_count += 1
        elif pin not in coord_pincodes:
            print(f"excluded — no coordinate data: {pin}")
            no_coord_count += 1
        else:
            matched_count += 1

    print(f"\n--- MAP EXCLUSION SUMMARY ---")
    print(f"Total business pincodes: {len(all_pincodes)}")
    print(f"Matched with valid coordinates: {matched_count}")
    print(f"Excluded — invalid coordinates count: {invalid_count}")
    print(f"Excluded — no coordinate data count: {no_coord_count}")

    conn.close()

if __name__ == "__main__":
    load_pincode_coords()

