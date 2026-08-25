from typing import Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from backend.db import engine

app = FastAPI(title="Hyper-Local Business Feasibility API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "ok"}

@app.get("/village")
def get_village(
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    village: Optional[str] = Query(None)
):
    with engine.connect() as conn:
        query = "SELECT * FROM villages WHERE 1=1"
        params = {}
        if isinstance(state, str) and state:
            query += " AND LOWER(state) = LOWER(:state)"
            params["state"] = state
        if isinstance(district, str) and district:
            query += " AND LOWER(district) = LOWER(:district)"
            params["district"] = district
        if isinstance(village, str) and village:
            query += " AND LOWER(village) = LOWER(:village)"
            params["village"] = village

        row = conn.execute(text(query + " LIMIT 1"), params).mappings().fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Village not found")
        return dict(row)

from pydantic import BaseModel
from backend.finance import project_cost, select_scheme, loan_amount, repayment_schedule
from backend.fit import check_fit
from backend.narrative import generate_narrative
from backend.category_mapping import map_category

class EvaluateRequest(BaseModel):
    state: str
    district: str
    village: str
    business_category: str
    capital: float
    government_scheme: Optional[str] = None

class NarrativeRequest(BaseModel):
    financial_summary: dict
    village_context: dict
    fit_result: dict
    language: Optional[str] = "en"

@app.get("/locations")
def get_locations():
    with engine.connect() as conn:
        states = conn.execute(text("SELECT DISTINCT state FROM villages ORDER BY state")).scalars().all()
        districts = conn.execute(text("SELECT DISTINCT state, district FROM villages ORDER BY district")).mappings().all()
        villages = conn.execute(text("SELECT id, state, district, village FROM villages ORDER BY village")).mappings().all()
        return {
            "states": list(states),
            "districts": [dict(r) for r in districts],
            "villages": [dict(r) for r in villages]
        }

@app.post("/evaluate")
def evaluate_feasibility(req: EvaluateRequest):
    if req.capital < 10000:
        raise HTTPException(status_code=400, detail="Minimum margin capital amount is ₹10,000.")
        
    with engine.connect() as conn:
        query = "SELECT * FROM villages WHERE LOWER(state) = LOWER(:state) AND LOWER(district) = LOWER(:district) AND LOWER(village) = LOWER(:village) LIMIT 1"
        row = conn.execute(text(query), {"state": req.state, "district": req.district, "village": req.village}).mappings().fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Selected village not found in census database.")
        
        village_data = dict(row)
        mapped_cat = map_category(req.business_category)
        village_data["business_category"] = req.business_category
        
        # Ensure pincode is explicitly non-empty
        pincode = village_data.get("pincode", "")
        if not pincode or pincode.strip() == "":
            pincode = "no pincode data"
            village_data["pincode"] = pincode

        # MSME Data Lookup
        msme_count = 0
        if pincode and pincode != "no pincode data":
            msme_row = conn.execute(
                text("SELECT count FROM pincode_business_counts WHERE pincode = :pincode AND category = :category"),
                {"pincode": pincode, "category": mapped_cat}
            ).fetchone()
            if msme_row:
                msme_count = msme_row[0]
        
        village_data["registered_business_count"] = msme_count

        # Financial Engine
        pc = project_cost(req.capital)
        scheme = select_scheme(pc)
        loan = loan_amount(pc)
        schedule = repayment_schedule(loan, scheme)
        
        # Fit Scoring (uses user business_category title & capital margin)
        fit_res = check_fit(req.business_category, village_data, capital=req.capital)
        
        return {
            "input": {
                "state": req.state,
                "district": req.district,
                "village": req.village,
                "business_category": req.business_category,
                "capital": req.capital,
                "government_scheme": req.government_scheme
            },
            "financial_summary": {
                "capital": req.capital,
                "project_cost": pc,
                "loan_amount": loan,
                "scheme": scheme
            },
            "repayment_schedule": schedule,
            "village_context": village_data,
            "fit_result": fit_res
        }

@app.post("/narrative")
def get_ai_narrative(req: NarrativeRequest):
    return generate_narrative(
        financial_summary=req.financial_summary,
        village_context=req.village_context,
        fit_result=req.fit_result,
        language=req.language or "en"
    )

@app.get("/pincode-ranking")
def get_pincode_ranking(category: str = Query(...)):
    mapped_cat = map_category(category)
    with engine.connect() as conn:
        query = text("""
            SELECT pincode, count 
            FROM pincode_business_counts 
            WHERE LOWER(category) = LOWER(:category) 
            ORDER BY count DESC
        """)
        rows = conn.execute(query, {"category": mapped_cat}).mappings().all()
        return [dict(r) for r in rows]


