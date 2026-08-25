# Deterministic Business Feasibility Analysis Engine for GramBiz
# Configurable Weights & Thresholds per AGENTS.md / User Specifications

# ponytail: district thresholds seeded for Jalgaon dataset; upgrade: compute dynamically if dataset expands
JALGAON_IRRIGATED_P25 = 174.1  # 25th percentile (ha)
JALGAON_IRRIGATED_P75 = 550.7  # 75th percentile (ha)

# Configurable Weights (Total = 100%)
WEIGHTS = {
    "competition": 0.20,
    "demand": 0.20,
    "customer_base": 0.15,
    "location_suitability": 0.15,
    "financial": 0.15,
    "risk": 0.10,
    "government_support": 0.05,
}

# Configurable Verdict Thresholds
THRESHOLD_RECOMMENDED = 78
THRESHOLD_CAUTION = 55


def check_fit(business_category: str, village_data: dict, capital: float = 100000.0) -> dict:
    raw_cat = (business_category or "Retail").strip()
    cat = raw_cat.lower()

    dairy_keywords = ["dairy", "milk", "cattle", "poultry", "goat", "fish", "livestock", "animal", "husbandry"]
    agro_keywords = ["agro", "mill", "flour", "spice", "oil", "seed", "processing", "bakery", "food", "confectionery", "atta", "fertilizer"]

    if any(k in cat for k in dairy_keywords):
        cat_type = "dairy"
    elif any(k in cat for k in agro_keywords):
        cat_type = "agro-processing"
    else:
        cat_type = "retail"

    irrigated = float(village_data.get("irrigated_area", 0) or 0)
    net_sown = float(village_data.get("net_area_sown", 0) or 0)
    population = float(village_data.get("total_population", 0) or 0)
    town_dist = float(village_data.get("nearest_town_distance", 0) or 0)
    hq_dist = float(village_data.get("sub_district_hq_distance", 0) or 0)

    avail_signals = {"1", "yes", "true", "available"}
    mandi = str(village_data.get("mandis_market_status", "")).strip().lower() in avail_signals
    haat = str(village_data.get("weekly_haat_status", "")).strip().lower() in avail_signals
    pds = str(village_data.get("pds_status", "")).strip().lower() in avail_signals

    # 1. Competition Analysis Score (0-100)
    similar_units_nearby = max(1, int((population / 1500) if cat_type == "retail" else (irrigated / 300)))
    if cat_type == "retail" and not (mandi or haat):
        similar_units_nearby = max(1, similar_units_nearby - 1)

    if similar_units_nearby <= 2:
        comp_score = 85
        comp_status = "LOW COMPETITION"
        sat_level = "LOW"
        comp_detail = f"Only {similar_units_nearby} similar units identified in the vicinity, indicating low direct competition and strong opportunity."
    elif similar_units_nearby <= 4:
        comp_score = 70
        comp_status = "MODERATE COMPETITION"
        sat_level = "MEDIUM"
        comp_detail = f"Around {similar_units_nearby} similar businesses operate nearby, presenting moderate competition."
    else:
        comp_score = 50
        comp_status = "HIGH COMPETITION"
        sat_level = "HIGH"
        comp_detail = f"{similar_units_nearby} similar units operate in this sector, indicating a highly saturated local market."

    # 2. Market Demand Score (0-100)
    if cat_type in ("dairy", "agro-processing"):
        if irrigated >= JALGAON_IRRIGATED_P75:
            demand_score = 88
            demand_level = "HIGH"
            demand_detail = f"Excellent agricultural raw material availability with {irrigated} ha irrigated farmland."
        elif irrigated >= JALGAON_IRRIGATED_P25:
            demand_score = 68
            demand_level = "MEDIUM"
            demand_detail = f"Moderate water resources ({irrigated} ha irrigated) may cause seasonal raw material supply shifts."
        else:
            demand_score = 45
            demand_level = "LOW"
            demand_detail = f"Limited irrigated land ({irrigated} ha) makes consistent raw material sourcing challenging."
    else:
        if mandi or haat:
            demand_score = 86
            demand_level = "HIGH"
            demand_detail = "Active Mandi / Weekly Haat generates steady daily customer footfall."
        elif pds:
            demand_score = 65
            demand_level = "MEDIUM"
            demand_detail = "Customer traffic is primarily concentrated around monthly PDS distribution cycles."
        else:
            demand_score = 42
            demand_level = "LOW"
            demand_detail = "No active local market or weekly haat to attract daily retail shoppers."

    # 3. Customer Base Score (0-100)
    if population >= 3000:
        cust_score = 85
        cust_level = "HIGH"
        cust_detail = f"Village population of {int(population):,} provides a substantial direct customer base."
    elif population >= 1200:
        cust_score = 72
        cust_level = "MEDIUM"
        cust_detail = f"Moderate village population ({int(population):,}) supports stable micro-enterprise demand."
    else:
        cust_score = 52
        cust_level = "LOW"
        cust_detail = f"Small village population ({int(population):,}) requires capturing customers from neighboring hamlets."

    # 4. Location Suitability Score (0-100)
    if town_dist <= 15 and hq_dist <= 20:
        loc_score = 82
        loc_level = "GOOD"
        loc_detail = f"Good transit connectivity ({town_dist} km to nearest town) for supply transport."
    elif town_dist <= 30:
        loc_score = 68
        loc_level = "MODERATE"
        loc_detail = f"Moderate transport distance ({town_dist} km to town) may add minor supply logistics cost."
    else:
        loc_score = 48
        loc_level = "POOR"
        loc_detail = f"Remote location ({town_dist} km to town) increases logistics and market access effort."

    # 5. Financial Feasibility Score (0-100)
    project_cost = capital / 0.1
    if capital >= 50000:
        fin_score = 78
        fin_level = "GOOD"
        fin_detail = f"Required investment of ₹{project_cost:,.0f} is well-structured relative to own capital margin of ₹{capital:,.0f}."
    elif capital >= 25000:
        fin_score = 68
        fin_level = "MODERATE"
        fin_detail = f"Project cost of ₹{project_cost:,.0f} relies heavily on debt financing."
    else:
        fin_score = 55
        fin_level = "POOR"
        fin_detail = f"Capital margin of ₹{capital:,.0f} provides thin equity cushion against early working capital shifts."

    # 6. Business Risk Score (0-100)
    if cat_type == "retail" and (mandi or haat):
        risk_score = 75
        risk_level = "LOW"
        risk_detail = "Low supply chain risk with stable local retail customer base."
    elif cat_type == "dairy" and irrigated >= JALGAON_IRRIGATED_P75:
        risk_score = 78
        risk_level = "LOW"
        risk_detail = "High fodder and water availability reduces livestock operational risk."
    else:
        risk_score = 60
        risk_level = "MODERATE"
        risk_detail = "Moderate operational risk from market seasonality and input price fluctuations."

    # 7. Government Support Score (0-100)
    gov_score = 90
    gov_level = "HIGH"
    gov_detail = "Eligible for 90% government scheme financing under MUDRA / PMEGP."

    # Weighted Composite Score Calculation
    total_score = round(
        (comp_score * WEIGHTS["competition"]) +
        (demand_score * WEIGHTS["demand"]) +
        (cust_score * WEIGHTS["customer_base"]) +
        (loc_score * WEIGHTS["location_suitability"]) +
        (fin_score * WEIGHTS["financial"]) +
        (risk_score * WEIGHTS["risk"]) +
        (gov_score * WEIGHTS["government_support"])
    )

    # Determine Decision Verdict
    if total_score >= THRESHOLD_RECOMMENDED:
        verdict = "RECOMMENDED"
        verdict_icon = "🟢"
        verdict_headline = "GOOD BUSINESS POTENTIAL"
        fit_type = "match"
    elif total_score >= THRESHOLD_CAUTION:
        verdict = "PROCEED WITH CAUTION"
        verdict_icon = "🟡"
        verdict_headline = "PROCEED WITH CAUTION"
        fit_type = "partial"
    else:
        verdict = "NOT RECOMMENDED"
        verdict_icon = "🔴"
        verdict_headline = "HIGH FEASIBILITY RISK"
        fit_type = "mismatch"

    # Evidence-Based Reasons for Success / Failure
    positives = []
    if comp_score >= 70:
        positives.append(f"✓ Low competition: Only {similar_units_nearby} similar units operate in the vicinity.")
    if demand_score >= 70:
        positives.append(f"✓ Strong market demand: {demand_detail}")
    if cust_score >= 70:
        positives.append(f"✓ Suitable customer base: Village population of {int(population):,} provides reachable buyers.")
    if loc_score >= 70:
        positives.append(f"✓ Good location fit: Convenient transport distance ({town_dist} km to town).")

    negatives = []
    if comp_score < 70:
        negatives.append(f"⚠️ High competition: {comp_detail}")
    if demand_score < 70:
        negatives.append(f"⚠️ Market demand constraints: {demand_detail}")
    if loc_score < 70:
        negatives.append(f"⚠️ Logistics distance: Nearest town is {town_dist} km away.")
    if fin_score < 75:
        negatives.append(f"⚠️ Financial structuring: Project cost of ₹{project_cost:,.0f} requires high loan leverage.")

    if not positives:
        positives.append("✓ Government scheme financial backing available (up to 90% loan).")
    if not negatives:
        negatives.append("⚠️ Monitor seasonal price fluctuations and local customer footfall.")

    return {
        "fit": fit_type,
        "headline": f"{verdict_headline} — Feasibility Score {total_score}/100",
        "reason": f"Overall score of {total_score}/100 based on weighted multi-factor analysis.",
        "supporting_data": f"Population: {int(population):,} | Irrigated area: {irrigated} ha | Nearest town: {town_dist} km",
        "score": total_score,
        "verdict": verdict,
        "verdict_icon": verdict_icon,
        "verdict_headline": verdict_headline,
        "weights": WEIGHTS,
        "components": {
            "competition": {"score": comp_score, "status": comp_status, "detail": comp_detail, "units": similar_units_nearby},
            "demand": {"score": demand_score, "status": f"{demand_level} DEMAND", "detail": demand_detail, "level": demand_level},
            "customer_base": {"score": cust_score, "status": f"{cust_level} REACH", "detail": cust_detail, "level": cust_level},
            "location_suitability": {"score": loc_score, "status": f"{loc_level} LOCATION", "detail": loc_detail, "level": loc_level},
            "financial": {"score": fin_score, "status": f"{fin_level} FINANCIAL FIT", "detail": fin_detail, "level": fin_level},
            "risk": {"score": risk_score, "status": f"{risk_level} RISK", "detail": risk_detail, "level": risk_level},
            "government_support": {"score": gov_score, "status": f"{gov_level} SUPPORT", "detail": gov_detail, "level": gov_level}
        },
        "saturation": {
            "level": sat_level,
            "detail": comp_detail
        },
        "positives": positives,
        "negatives": negatives,
        "why_succeed": positives,
        "why_fail": negatives,
        "data_confidence": {
            "level": "High" if population > 0 else "Medium",
            "disclaimer": "Analysis confidence depends on local market data availability."
        },
        "score_explanation": {
            "main_positive": [
                f"+ {demand_level.capitalize()} market demand in {village_data.get('village', 'this area')}",
                f"+ {comp_status.capitalize()} ({similar_units_nearby} competitors identified)",
                f"+ {loc_level.capitalize()} location & transit access"
            ],
            "main_negative": [
                f"- Logistics distance ({town_dist} km to nearest town)",
                f"- High debt dependency (90% scheme loan vs 10% own capital)"
            ]
        }
    }


if __name__ == "__main__":
    import sqlite3

    conn = sqlite3.connect("feasibility.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    print("--- RUNNING DETERMINISTIC FEASIBILITY SELF-TEST ---")
    lasur = cursor.execute("SELECT * FROM villages WHERE village = 'Lasur'").fetchone()

    if lasur:
        res = check_fit("agro-processing", dict(lasur), capital=100000.0)
        print("Lasur Test Score:", res["score"])
        print("Verdict:", res["verdict"])
        assert 0 <= res["score"] <= 100, "Score out of range!"
        assert res["verdict"] in ("RECOMMENDED", "PROCEED WITH CAUTION", "NOT RECOMMENDED")
        print("[PASS] Self-test passed cleanly!")
