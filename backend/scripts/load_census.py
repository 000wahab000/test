import csv
import glob
import os
import sys
from sqlalchemy import Table, Column, Integer, Float, String, MetaData, select

# Add parent dir to path so backend imports work
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from backend.db import engine

metadata = MetaData()

villages_table = Table(
    "villages",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("state", String, index=True),
    Column("district", String, index=True),
    Column("sub_district", String),
    Column("gram_panchayat", String),
    Column("village", String, index=True),
    Column("pincode", String, index=True),
    Column("total_households", Integer),
    Column("total_population", Integer),
    Column("sub_district_hq_distance", Float),
    Column("district_hq_distance", Float),
    Column("nearest_town_distance", Float),
    Column("all_weather_road", String),
    Column("mandis_market_status", String),
    Column("weekly_haat_status", String),
    Column("pds_status", String),
    Column("commercial_bank_status", String),
    Column("shg_status", String),
    Column("atm_status", String),
    Column("agricultural_commodities_1st", String),
    Column("manufacturers_commodities_1st", String),
    Column("handicrafts_commodities_1st", String),
    Column("net_area_sown", Float),
    Column("irrigated_area", Float),
    Column("mobile_coverage", String),
)

def safe_int(val, default=0):
    try:
        return int(float(str(val).strip()))
    except (ValueError, TypeError):
        return default

def safe_float(val, default=0.0):
    try:
        return float(str(val).strip())
    except (ValueError, TypeError):
        return default

def safe_str(val, default=""):
    return str(val).strip() if val is not None else default

def clean_pincode(val):
    if not val:
        return ""
    p_str = str(val).strip()
    if p_str.endswith(".0"):
        p_str = p_str[:-2]
    p_str = p_str.zfill(6)
    if len(p_str) == 6 and p_str.isdigit():
        return p_str
    return ""

def load_census_data(raw_dir="data/raw"):
    villages_table.drop(engine, checkfirst=True)
    metadata.create_all(engine)
    csv_files = glob.glob(os.path.join(raw_dir, "*.csv"))
    if not csv_files:
        print(f"No CSV files found in {raw_dir}")
        return 0

    inserted_count = 0
    with engine.begin() as conn:
        # Clear existing rows for idempotent loading
        conn.execute(villages_table.delete())
        
        for file_path in csv_files:
            print(f"Processing {file_path}...")
            with open(file_path, mode="r", encoding="utf-8-sig") as f:
                raw_rows = list(csv.DictReader(f))
                
                # Pass 1: Build sub-district -> primary pincode map for missing values
                sub_dist_pincode_counts = {}
                for row in raw_rows:
                    def get_col_p1(col_name):
                        for k, v in row.items():
                            if k and k.strip().lower() == col_name.strip().lower():
                                return v
                        return ""
                    sd = safe_str(get_col_p1("Sub District Name"))
                    pin = clean_pincode(get_col_p1("PIN Code"))
                    if sd and pin:
                        if sd not in sub_dist_pincode_counts:
                            sub_dist_pincode_counts[sd] = {}
                        sub_dist_pincode_counts[sd][pin] = sub_dist_pincode_counts[sd].get(pin, 0) + 1

                sub_dist_fallback_pin = {}
                for sd, pcounts in sub_dist_pincode_counts.items():
                    sorted_pins = sorted(pcounts.items(), key=lambda x: x[1], reverse=True)
                    if sorted_pins:
                        sub_dist_fallback_pin[sd] = sorted_pins[0][0]

                # Pass 2: Construct rows
                rows_to_insert = []
                for row in raw_rows:
                    def get_col(col_name):
                        for k, v in row.items():
                            if k and k.strip().lower() == col_name.strip().lower():
                                return v
                        return ""

                    sd_name = safe_str(get_col("Sub District Name"))
                    pin_code = clean_pincode(get_col("PIN Code"))
                    if not pin_code and sd_name in sub_dist_fallback_pin:
                        pin_code = sub_dist_fallback_pin[sd_name]
                    if not pin_code:
                        pin_code = "no pincode data"

                    data = {
                        "state": safe_str(get_col("State Name")),
                        "district": safe_str(get_col("District Name")),
                        "sub_district": sd_name,
                        "gram_panchayat": safe_str(get_col("Gram Panchayat Name")),
                        "village": safe_str(get_col("Village Name")),
                        "pincode": pin_code,
                        "total_households": safe_int(get_col("Total  Households ")),
                        "total_population": safe_int(get_col("Total Population of Village")),
                        "sub_district_hq_distance": safe_float(get_col("Sub District Head Quarter (Distance in km)")),
                        "district_hq_distance": safe_float(get_col("District Head Quarter (Distance in km)")),
                        "nearest_town_distance": safe_float(get_col("Nearest Statutory Town (Distance in km)")),
                        "all_weather_road": safe_str(get_col("All Weather Road (Status A(1)/NA(2))")),
                        "mandis_market_status": safe_str(get_col("Mandis/Regular Market (Status A(1)/NA(2))")),
                        "weekly_haat_status": safe_str(get_col("Weekly Haat (Status A(1)/NA(2))")),
                        "pds_status": safe_str(get_col("Public Distribution System (PDS) Shop (Status A(1)/NA(2))")),
                        "commercial_bank_status": safe_str(get_col("Commercial Bank (Status A(1)/NA(2))")),
                        "shg_status": safe_str(get_col("Self - Help Group (SHG) (Status A(1)/NA(2))")),
                        "atm_status": safe_str(get_col("ATM (Status A(1)/NA(2))")),
                        "agricultural_commodities_1st": safe_str(get_col("Agricultural Commodities (First)")),
                        "manufacturers_commodities_1st": safe_str(get_col("Manufacturers Commodities (First)")),
                        "handicrafts_commodities_1st": safe_str(get_col("Handicrafts Commodities (First)")),
                        "net_area_sown": safe_float(get_col("Net Area Sown (in Hectares)")),
                        "irrigated_area": safe_float(get_col("Area Irrigated by Source (in Hectares)")),
                        "mobile_coverage": safe_str(get_col("Mobile Phone Coverage (Status A(1)/NA(2))")),
                    }
                    rows_to_insert.append(data)
                
                if rows_to_insert:
                    conn.execute(villages_table.insert(), rows_to_insert)
                    inserted_count += len(rows_to_insert)

    print(f"Successfully loaded {inserted_count} village records into 'villages' table.")
    return inserted_count

if __name__ == "__main__":
    count = load_census_data()
    assert count > 0, "No records loaded!"
    print("Self-check passed!")
