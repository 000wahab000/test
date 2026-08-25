# Steps — Execution Order

> Follow phases in order. Do not skip. Do not proceed without user confirmation at each STOP.

---

## Phase 0 — Scaffold

- [ ] Create `frontend/` with React + Vite + Tailwind
- [ ] Create `backend/` with FastAPI + Postgres connection (`db.py`)
- [ ] Add health check `GET /` returning `{"status": "ok"}`
- [ ] **STOP → show file tree → wait for confirmation**

---

## Phase 1 — Financial Engine

- [ ] Write `backend/finance.py` with exactly 4 functions:
  - `project_cost(capital)`
  - `loan_amount(project_cost)`
  - `select_scheme(project_cost)`
  - `repayment_schedule(loan, scheme)`
- [ ] Hardcode both scheme rules (micro finance / term loan) — no config file
- [ ] Write `if __name__ == "__main__"` self-check:
  - input: `capital=100000`
  - assert `project_cost == 1000000`
  - assert scheme == term loan
  - assert loan == 900000
  - print repayment schedule
- [ ] Run `python backend/finance.py` — all assertions pass
- [ ] **STOP → paste output → wait for confirmation**

---

## Phase 2 — Village Data Layer

### Human step (not the agent)
- [ ] Download census village-level CSV (2–3 districts only)
- [ ] Place file in `data/raw/`

### Agent step
- [ ] Write `backend/scripts/load_census.py`:
  - Read CSV
  - Keep only the 20 columns listed in spec
  - Drop all other columns
  - Load into `villages` Postgres table (create table if not exists)
- [ ] Write `GET /village?state=&district=&village=` in `backend/main.py`
- [ ] Run loader script: `python backend/scripts/load_census.py`
- [ ] Call endpoint for one real village — capture JSON response
- [ ] **STOP → paste sample JSON → wait for confirmation**

---

## Phase 3 — Fit Scoring

- [x] Write `backend/fit.py` with `check_fit(business_category, village_data) → dict`
- [x] Implement 3 rules (hardcoded string/number checks, no ML):
  - dairy → keyword match in commodities
  - retail → mandis/haat/PDS available
  - agro-processing → net area sown + irrigated area > 0
- [x] Write `if __name__ == "__main__"` self-check with 2 test cases:
  - one match
  - one mismatch
- [x] Run `python backend/fit.py` — both cases print as expected
- [x] **STOP → paste output → wait for confirmation**

---

## Phase 4 — Frontend + Wiring

- [x] Build `Screen 1` (`Form.jsx`):
  - `GET /village` / `/locations` → populate state/district/village dropdowns (cascading)
  - Business category dropdown (3 fixed options)
  - Capital number input
  - Submit → POST to backend → navigate to Screen 2
- [x] Build `Screen 2` (`Report.jsx`):
  - Card: Financial output (project cost, loan amount, scheme, repayment)
  - Card: Village context (key fields from village row)
  - Card: Fit verdict (fit label + reason string)
  - Empty box labelled **"AI ANALYSIS"**
- [x] Wire frontend to backend end-to-end
- [x] Smoke test full flow with a real village — no AI involved
- [x] **STOP → confirm flow works → wait for confirmation**

> This is the hardest checkpoint. The app must be fully demoable before any LLM code is written.

---

## Phase 5 — LLM Narrative

- [x] Add `POST /narrative` endpoint in `backend/main.py`
- [x] Build prompt template — includes verbatim instruction:
  ```
  Only use the facts provided below. Do not invent statistics, prices,
  numbers, or counts not present in the input. Output SWOT as 4 short
  bullet groups and a 3-4 sentence narrative.
  ```
- [x] Parse LLM response into `{strengths, weaknesses, opportunities, threats, narrative}`
- [x] Populate the "AI ANALYSIS" box in Screen 2
- [x] Hindi toggle: add language param to same LLM call — no new library
- [x] Test with 2 different village/category combinations
- [x] **STOP → paste 2 example outputs → wait for confirmation**

---

## Phase 6 — Polish + Disclaimer

- [x] Add disclaimer text on report screen (mandatory):
  > "Decision support only. Not a loan guarantee. Eligibility subject to scheme verification."
- [x] Tooltips added for 8 key labels with user-provided exact wording
- [x] Verify no banned features got added by accident
- [x] Final walkthrough & build check
- [x] **STOP → report complete prototype → wait for confirmation**

---

## MSME Pipeline — Phase A: Inspection & Documentation

- [x] Report total row count of full Jalgaon MSME CSV
- [x] Spot check embedded NIC json field format consistency across start, middle, and end rows
- [x] List distinct 2-digit NIC code prefixes with row counts
- [x] Document findings in `.agents/METHODOLOGY.md` under "MSME Dataset" section
- [x] **STOP → report Phase A findings → wait for confirmation**

---

## MSME Pipeline — Phase B: Deterministic NIC Mapping

- [x] Build static dict in `backend/nic_mapping.py` mapping 2-digit NIC prefixes to `dairy`, `retail`, `agro-processing`, or `other`
- [x] Write 10 manual test assertions using real CSV rows verified against NIC description text
- [x] Run test assertions (`python backend/nic_mapping.py`)
- [x] **STOP → show mapping table and test results → wait for confirmation**

---

## MSME Pipeline — Phase C: Pipeline Execution & Database Ingestion

- [x] Write one-time offline loader script `backend/scripts/load_msme.py`
- [x] Parse `Activities` JSON, map NIC codes via `backend/nic_mapping.py`, group by pincode & category, load into `pincode_business_counts(pincode, category, count)`
- [x] Run loader script
- [x] Report total row count processed and percentage breakdown across all 4 categories (dairy, retail, agro-processing, other)
- [x] **STOP → show sample query output for 3 real pincodes + category breakdown → wait for confirmation**

---

## MSME Pipeline — Phase D: App Integration & Frontend Display

- [x] Add pincode field to village context if needed
- [x] Extend `/evaluate` endpoint to return registered business count for village pincode + category
- [x] Update frontend to display registered business count clearly labeled as "registered businesses (Udyam/MSME data)"
- [x] **STOP → show full end-to-end example → wait for confirmation**

---

## MSME Pipeline — Phase E: Ponytail Audit

- [x] Run ponytail audit/review/debt pass strictly scoped to MSME pipeline files (`backend/nic_mapping.py`, `backend/scripts/load_msme.py`)
- [x] Append findings to `.agents/METHODOLOGY.md`

---

## Phase F — Pincode Comparison View (Bar Chart)

- [x] Add `GET /pincode-ranking?category=X` endpoint in `backend/main.py`
- [x] Build horizontal bar chart component in `frontend/src/Report.jsx`
- [x] Highlight current village's pincode with distinct styling & badge
- [x] Add clear label: `"[category] business density by pincode across Jalgaon district — your village's pincode: [X], ranked [Nth] of [total]."`
- [x] **STOP → show rendered chart sample output → wait for confirmation**

---

## Phase G — Geographic Heatmap (Requires Coordinates CSV)

- [ ] Wait for human to provide pincode-to-coordinates CSV in `data/raw/` (no LLM/guessed coords)
- [ ] One-time loader script joining pincode coordinates to `pincode_business_counts`
- [ ] Lightweight map view (Leaflet) plotting pincodes sized/colored by business count
- [ ] Click point → show pincode + count + covered village names
- [ ] **STOP → show map screenshot → wait for confirmation**

---

## Completion Check

Before calling this done, verify a user can do the full journey:

1. Open app → see form
2. Select state / district / village (real seeded data)
3. Select business category
4. Enter capital amount
5. Submit → see:
   - Correct financial structuring (math-derived)
   - Real village context (census-derived)
   - Rule-based fit verdict
   - Registered business count for village pincode & category (Udyam/MSME data)
   - LLM narrative grounded only in those facts
6. See disclaimer at bottom

If any step fails, fix that phase before moving on.

