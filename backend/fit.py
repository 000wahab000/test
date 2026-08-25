# District-specific threshold percentiles computed from seeded Jalgaon dataset
# ponytail: hardcoded Jalgaon district thresholds; upgrade: compute dynamically per district if multiple districts loaded
JALGAON_IRRIGATED_P25 = 174.1  # 25th percentile (ha)
JALGAON_IRRIGATED_P75 = 550.7  # 75th percentile (ha)


def check_fit(business_category: str, village_data: dict) -> dict:
    raw_cat = (business_category or "Retail").strip()
    cat_type = raw_cat.lower()
    if cat_type not in ("dairy", "agro-processing", "retail"):
        if any(k in cat_type for k in ["dairy", "milk", "cattle", "poultry", "goat", "fish", "livestock", "husbandry"]):
            cat_type = "dairy"
        elif any(k in cat_type for k in ["agro", "mill", "flour", "spice", "oil", "processing", "bakery", "food", "confectionery"]):
            cat_type = "agro-processing"
        else:
            cat_type = "retail"
    
    irrigated = float(village_data.get("irrigated_area", 0) or 0)
    net_sown = float(village_data.get("net_area_sown", 0) or 0)
    
    comm_1 = str(village_data.get("agricultural_commodities_1st", "")).strip()
    comm_2 = str(village_data.get("manufacturers_commodities_1st", "")).strip()
    comm_3 = str(village_data.get("handicrafts_commodities_1st", "")).strip()
    
    valid_comms = [c for c in [comm_1, comm_2, comm_3] if c and c.upper() not in ("NA", "N/A", "NONE", "NULL")]
    primary_commodity = valid_comms[0] if valid_comms else None

    if cat_type in ("dairy", "agro-processing"):
        biz_title = raw_cat
        if irrigated >= JALGAON_IRRIGATED_P75:
            fit = "match"
            headline = f"GOOD FIT - Excellent water resources and farmland in the area to sustain year-round {biz_title.lower()} operations."
            supp = f"Irrigated area: {irrigated} ha (Top 25% in district, threshold >= {JALGAON_IRRIGATED_P75} ha) | Net sown: {net_sown} ha"
            if primary_commodity:
                supp += f" | Key local commodity: {primary_commodity}"
        elif irrigated >= JALGAON_IRRIGATED_P25:
            fit = "partial"
            headline = f"RISKY - Moderate water availability may cause seasonal supply shortages for {biz_title.lower()} operations."
            supp = f"Irrigated area: {irrigated} ha (Middle range 25th-75th percentile, {JALGAON_IRRIGATED_P25}-{JALGAON_IRRIGATED_P75} ha) | Net sown: {net_sown} ha"
            if primary_commodity:
                supp += f" | Key local commodity: {primary_commodity}"
        else:
            fit = "mismatch"
            headline = f"NOT RECOMMENDED - Low irrigated land will make sourcing raw materials difficult during dry months for {biz_title.lower()}."
            supp = f"Irrigated area: {irrigated} ha (Below district 25th percentile of {JALGAON_IRRIGATED_P25} ha) | Net sown: {net_sown} ha"
            if primary_commodity:
                supp += f" | Key local commodity: {primary_commodity}"

        return {
            "fit": fit,
            "headline": headline,
            "supporting_data": supp,
            "reason": f"{headline} {supp}"
        }

    else:
        biz_title = raw_cat
        avail_signals = {"1", "yes", "true", "available"}
        mandi = str(village_data.get("mandis_market_status", "")).strip().lower() in avail_signals
        haat = str(village_data.get("weekly_haat_status", "")).strip().lower() in avail_signals
        pds = str(village_data.get("pds_status", "")).strip().lower() in avail_signals

        if mandi or haat:
            fit = "match"
            headline = f"GOOD FIT - Active regular market and weekly haat provide steady daily customer footfall for {biz_title.lower()}."
            supp = "Infrastructure present: Active Mandi / Weekly Haat"
        elif pds:
            fit = "partial"
            headline = f"RISKY - Customer traffic is limited and mostly dependent on monthly PDS ration distribution for {biz_title.lower()}."
            supp = "Infrastructure present: PDS ration outlet | No active regular market or weekly haat"
        else:
            fit = "mismatch"
            headline = f"NOT RECOMMENDED - No local market or weekly haat in this village to attract daily shoppers for {biz_title.lower()}."
            supp = "Infrastructure missing: No Mandi, Weekly Haat, or PDS ration outlet"

        return {
            "fit": fit,
            "headline": headline,
            "supporting_data": supp,
            "reason": f"{headline} {supp}"
        }


if __name__ == "__main__":
    import sqlite3

    conn = sqlite3.connect("feasibility.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    print("--- REAL VILLAGE VERDICT EXAMPLES ---")
    lasur = cursor.execute("SELECT * FROM villages WHERE village = 'Lasur'").fetchone()
    morchida = cursor.execute("SELECT * FROM villages WHERE village = 'Morchida'").fetchone()

    if lasur:
        print("\n[MATCH EXAMPLE] Lasur (Agro-processing):")
        print(check_fit("agro-processing", dict(lasur)))

    if morchida:
        print("\n[MISMATCH EXAMPLE] Morchida (Dairy):")
        print(check_fit("dairy", dict(morchida)))
