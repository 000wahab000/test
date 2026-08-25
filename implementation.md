# Implementation Plan — Hyper-Local Business Feasibility Prototype

> Single source of truth: `antigravity_build_spec.md`
> Do not add anything not listed there.

---

## Overview

A two-screen web app: the user picks a village, picks a business category, enters capital → gets financial structuring + census-derived village context + rule-based fit verdict + LLM narrative (grounded only in provided facts).

## Architecture

```
frontend/          React + Vite + Tailwind
  src/
    App.jsx        router: Screen 1 → Screen 2
    Form.jsx       Screen 1 — inputs
    Report.jsx     Screen 2 — results

backend/
  main.py          FastAPI app, routes only
  finance.py       Phase 1 — pure financial functions
  fit.py           Phase 3 — rule-based fit scoring
  db.py            Postgres connection (psycopg2 or SQLAlchemy core)
  scripts/
    load_census.py Phase 2 — one-time CSV loader (offline, run by human)

data/
  raw/             Human places census CSV here manually
```

---

## Phase 0 — Scaffold

**Goal:** Working skeleton, no business logic.

### Backend
- FastAPI app in `backend/main.py`
- Single Postgres connection in `backend/db.py`
  - `# ponytail: one global connection, use a pool if load warrants`
- No routes yet beyond a health check `GET /`

### Frontend
- `npx create-vite frontend --template react`
- Install Tailwind per Vite guide (3 config lines)
- Placeholder `App.jsx` — two empty screen stubs

**Checkpoint:** `tree` output showing both folders. Wait for confirmation.

---

## Phase 1 — Financial Engine

**File:** `backend/finance.py`
**No frontend, no LLM, no DB.**

### Functions

| Function | Signature | Rule |
|---|---|---|
| `project_cost` | `(capital: float) → float` | `capital / 0.10` |
| `loan_amount` | `(project_cost: float) → float` | `min(project_cost * 0.90, scheme_cap)` |
| `select_scheme` | `(project_cost: float) → dict` | see scheme table below |
| `repayment_schedule` | `(loan: float, scheme: dict) → list` | quarterly instalments over tenure |

### Scheme Rules (hardcoded, immutable)

| Condition | Scheme | Max Loan | Interest | Tenure | Moratorium |
|---|---|---|---|---|---|
| project_cost ≤ 1,40,000 | Micro Finance | 1,25,000 | 6.5% | 3 yrs | 3 months |
| 1,40,000 < project_cost ≤ 50,00,000 | Term Loan | 45,00,000 | 8% | 7 yrs | 6 months |

### Self-check (in `if __name__ == "__main__"`)

```
capital=100000 → project_cost=1000000 → loan=900000 → term loan scheme
assert all four function outputs match expected values
```

**Checkpoint:** `python backend/finance.py` shows passing assertions. Wait.

---

## Phase 2 — Village Data Layer

**No frontend, no LLM.**

### Census CSV (human step)
- Human downloads census village-level CSV and places in `data/raw/`
- Agent does NOT fetch this file

### `backend/scripts/load_census.py`
- One-time offline script
- Reads CSV, keeps only these columns (drops everything else):
  - state name, district name, village name, gram panchayat name
  - total households, total population
  - distances: sub-district HQ, district HQ, nearest town
  - road type fields
  - mandis/haat/PDS status
  - bank/SHG/ATM status
  - agricultural/manufacturers/handicrafts commodities (1st/2nd/3rd)
  - net area sown, irrigated area
  - mobile coverage
- Loads cleaned rows into one Postgres table: `villages`

### Endpoint
```
GET /village?state=&district=&village=
→ returns cleaned fields as JSON
```

**Checkpoint:** Sample JSON output for one real village. Wait.

---

## Phase 3 — Local Fit Scoring

**File:** `backend/fit.py`
**No LLM, no ML, string/number matching only.**

```python
def check_fit(business_category: str, village_data: dict) -> dict:
    # returns {"fit": "match"|"partial"|"mismatch", "reason": str}
```

### Rules (hardcoded)

| Category | Match condition |
|---|---|
| dairy | commodities fields contain milk/livestock/dairy keywords |
| retail | mandis/haat/PDS status = available |
| agro-processing | net area sown + irrigated area > 0 |

**Checkpoint:** Two test cases (one match, one mismatch) printed. Wait.

---

## Phase 4 — Frontend Form + Report Skeleton

**No LLM.**

### Screen 1 — Form
- Dropdowns: state → district → village (populated from `villages` table)
- Dropdown: business category (3 options: dairy, retail, agro-processing)
- Input: capital (number, ₹)
- Submit → navigate to Screen 2

### Screen 2 — Report
- Card: Financial structuring (Phase 1 output)
- Card: Village context (Phase 2 output)
- Card: Fit verdict (Phase 3 output) — "match / partial / mismatch" + reason
- Box: **AI ANALYSIS** — empty placeholder, clearly labelled

**Checkpoint:** Full end-to-end flow with real data, no AI. Wait. This is the most important checkpoint.

---

## Phase 5 — LLM Narrative

**Smallest surface area. Last.**

### Endpoint
```
POST /narrative
body: { financial_output, village_data, fit_result }
→ { strengths, weaknesses, opportunities, threats, narrative }
```

### Prompt template (verbatim instruction required)

```
Only use the facts provided below. Do not invent statistics, prices,
numbers, or counts not present in the input. Output SWOT as 4 short
bullet groups and a 3-4 sentence narrative.

[facts injected here]
```

### Hindi
- If hindi requested: same LLM call, translate in the same prompt
- No separate translation service or library

**Checkpoint:** Two example outputs for different villages/categories. Wait.

---

## Phase 6 — Polish

- Disclaimer rendered on Screen 2:
  > "Decision support only. Not a loan guarantee. Eligibility subject to scheme verification."
- Basic Tailwind styling pass
- Nothing else

---

## MSME Data Pipeline

### Phase A — Inspection & Documentation
- Inspect full Jalgaon MSME CSV (`data/8b68ae56-84cf-4728-a0a6-1be11028dea7_486885273ba513e60f50451d852a8e23.csv`).
- Report row count, spot check NIC JSON format consistency across start/middle/end rows.
- List distinct 2-digit NIC prefixes and row counts.
- Document findings in `.agents/METHODOLOGY.md`.
- **STOP gate.**

### Phase B — Deterministic NIC Mapping
- Static dictionary in `backend/nic_mapping.py` mapping 2-digit NIC prefixes to `dairy`, `retail`, `agro-processing`, or `other`.
- 10 manual test assertions using real CSV rows verified against NIC descriptions.
- **STOP gate.**

### Phase C — Pipeline Execution & Aggregation
- One-time offline loader script `backend/scripts/load_msme.py`.
- Parse `Activities` JSON, apply NIC mapping from `backend/nic_mapping.py`, group by pincode & category, store in `pincode_business_counts(pincode, category, count)`.
- Report total rows processed and percentage breakdown across all 4 categories (dairy, retail, agro-processing, other) for the dataset.
- **STOP gate.**

### Phase D — App Join & Frontend Display
- Extend village context and `/evaluate` endpoint with registered business count for the village's pincode and selected business category.
- Frontend display labeled "registered businesses (Udyam/MSME data)".
- **STOP gate.**

### Phase E — Ponytail Audit
- Code review, debt audit, and simplification pass on `backend/nic_mapping.py` and `backend/scripts/load_msme.py`.

---

## What is Explicitly Out of Scope

| Banned | Reason |
|---|---|
| PostGIS / map libraries | spec §2 |
| ML models | spec §2 |
| Feasibility score out of 100 | spec §2 |
| Cash-flow simulator | spec §2 |
| Voice input | spec §2 |
| 4th+ business category | spec §3 |
| 3rd+ language | spec §3 |
| National census dataset / live scraper | spec §4 |
| Auth, accounts, dashboard, history | spec §5 |
| Full ORM (SQLAlchemy models, etc.) | spec §0 |

