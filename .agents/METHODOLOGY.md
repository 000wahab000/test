# METHODOLOGY.md — How We Work on This Project

> This file lives in `.agents/` so every agent session loads it automatically.
> It is NOT a feature spec — that is `antigravity_build_spec.md` at the project root.
> It is NOT a task list — that is `steps.md` at the project root.
> It IS the canonical "how we work" reference.

---

## Project Layout (canonical — do not deviate)

```
project root/
├── antigravity_build_spec.md   ← single source of truth for features
├── implementation.md           ← architecture decisions per phase
├── steps.md                    ← ordered checklist, tick off as you go
├── NOTES.md                    ← questions / out-of-scope ideas (create if needed)
│
├── backend/
│   ├── main.py                 ← FastAPI app + all routes
│   ├── db.py                   ← single Postgres engine, no ORM
│   ├── finance.py              ← Phase 1: pure financial functions
│   ├── fit.py                  ← Phase 3: rule-based fit scoring
│   ├── requirements.txt
│   └── scripts/
│       └── load_census.py      ← Phase 2: one-time offline CSV loader
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── index.css           ← @import "tailwindcss" only
│       ├── App.jsx             ← screen router (Form → Report)
│       ├── Form.jsx            ← Screen 1
│       └── Report.jsx          ← Screen 2
│
├── data/
│   └── raw/                    ← human places census CSV here manually
│       └── *.csv
│
└── .agents/
    ├── AGENTS.md               ← hard constraints (read by agent every session)
    ├── METHODOLOGY.md          ← this file
    └── skills/
        └── build-phases/
            └── SKILL.md        ← phase checklist + STOP gates
```

---

## Phase Gate Protocol

1. **One phase at a time.** Never start Phase N+1 until Phase N checkpoint is confirmed by the user.
2. **Every phase ends with a hard STOP.** Agent shows output, pastes result, and waits. No continuing.
3. **Checkpoint output is mandatory:**
   - Phase 0 → file tree
   - Phase 1 → `python backend/finance.py` assertion output
   - Phase 2 → sample JSON for one real village
   - Phase 3 → two test case outputs (match + mismatch)
   - Phase 4 → user confirms full flow works end-to-end with real data
   - Phase 5 → two example narrative outputs
4. **If in doubt, write to `NOTES.md` and stop.** Do not guess and build.

---

## Ponytail Rules (applied every response)

These enforce YAGNI — the laziest correct solution wins:

| Rule | What it means |
|---|---|
| No unrequested abstractions | No interface with one implementation, no factory for one product |
| No boilerplate "for later" | Later can scaffold for itself |
| Deletion over addition | If something can be removed, remove it |
| Stdlib first | Use what's already installed before adding a new package |
| No new dependency | If a few stdlib lines cover it, use them |
| Shortest working diff | After you understand the problem, not before |
| Mark deliberate shortcuts | `# ponytail: <ceiling>, <upgrade path>` |
| One self-check per non-trivial function | `assert`-based `__main__` or `test_*.py`, no frameworks |

### The Ladder (stop at first rung that holds)

1. Does this need to exist at all? (YAGNI — skip it)
2. Already in this codebase? Reuse it.
3. Stdlib does it? Use it.
4. Native platform feature covers it? Use it.
5. Already-installed dep solves it? Use it.
6. Can it be one line? One line.
7. Only then: the minimum code that works.

---

## Hard Constraints (summary — full list in AGENTS.md)

| Constraint | Rule |
|---|---|
| Data | Only math output or seeded CSV. LLM never outputs a displayed number. |
| Banned tech | No PostGIS, no map libs, no ML, no voice, no cash-flow sim, no score/100 |
| Categories | Exactly 3: dairy, retail, agro-processing |
| Languages | Exactly 2: English, Hindi |
| Census data | 2–3 districts seeded by human into `data/raw/`. No scraper. |
| Screens | Exactly 2: Form + Report. No auth, no history, no dashboard. |
| LLM prompt | Must include verbatim: *"Only use the facts provided below. Do not invent statistics, prices, or counts."* |
| DB | SQLAlchemy core or raw psycopg2 — no full ORM |

---

## When Something Seems Like a Good Idea

If the agent thinks a feature would "improve" the app and it is NOT in `antigravity_build_spec.md`:

1. **Do not build it.**
2. Write it to `NOTES.md` with a one-line reason.
3. Stop and wait.

---

## CSV Data We Have

| File | District | State |
|---|---|---|
| `DCHB_Village_Amenities-ANDHRA_PRADESH-Nizamabad-533.csv` | Nizamabad | Andhra Pradesh |

This is the only seeded data for Phase 2. The loader script must work against this file.
Column names in this CSV must be mapped to the canonical column set in `implementation.md § Phase 2`.

---

## LLM Behaviour Contract

- LLM writes **prose only**: SWOT bullets, narrative sentences.
- LLM **never** outputs a number that gets displayed as a fact.
- All numbers displayed come from `finance.py` (math) or the `villages` table (census).
- The Hindi translation is done in the same LLM call — no separate service.

---

## Definition of Done

A user can:
1. Open the app
2. Pick a village from the seeded Nizamabad district data
3. Pick a business category (dairy / retail / agro-processing)
4. Enter a capital amount
5. See:
   - Correct financial structuring (math-derived, no LLM)
   - Real village context (census-derived)
   - Rule-based fit verdict (no ML)
   - LLM narrative grounded only in those facts
6. See the disclaimer: *"Decision support only. Not a loan guarantee. Eligibility subject to scheme verification."*

Nothing more. If it does more than this, something is wrong.

---

## MSME Dataset

- **File Source:** `data.gov.in` — List of MSME Registered Units under UDYAM (Filtered for Jalgaon District, Maharashtra).
- **File Location:** `data/8b68ae56-84cf-4728-a0a6-1be11028dea7_486885273ba513e60f50451d852a8e23.csv`
- **Total Row Count:** 165,534 data rows (excluding 1 header row).
- **NIC JSON Field Structure (`Activities`):**
  - Stringified JSON array containing objects with keys `NIC5DigitId` (string representing 5-digit NIC code) and `Description` (text description).
  - Example: `[{"NIC5DigitId":"63992","Description":"Activities of cyber café"}]`
- **Format Consistency Findings:**
  - **Valid JSON Array Rows:** ~165,377 rows parse cleanly into JSON lists of 1 or more NIC activity dictionaries.
  - **Missing / Empty Activities:** 143 rows have missing or empty string `Activities` fields.
  - **Malformed JSON:** 14 rows contain malformed JSON strings causing `JSONDecodeError`.
  - **Encoding Artifacts:** Minor special character encoding artifacts (e.g. `caf` instead of `café`).

---

## MSME Pipeline — Ponytail Audit (Phase E)

**Scope Constraint:** Strictly limited to `backend/nic_mapping.py` and `backend/scripts/load_msme.py`.

### 1. Simplification & Over-Engineering Audit Summary
- **No Heavy Data Frameworks:** Replaced potential `pandas` or `polars` dependencies with standard Python library modules (`csv`, `json`, `sys`, `os`).
- **Deterministic Pure Dict Lookup:** Implemented 2-digit NIC prefix dictionary mapping with explicit 3/4/5-digit sub-code overrides in `nic_mapping.py`. Avoided ML/embeddings/LLM classification overhead.
- **In-Memory Streaming Aggregation:** `load_msme.py` processes 165,534 dataset rows in ~1.2s using a Python `dict` key `(pincode, category)`, bypassing complex database staging tables or temporary index files.
- **Minimal Database Schema:** Single flat table `pincode_business_counts(pincode, category, count)` loaded via standard batch SQL execution.

### 2. Ceiling & Upgrade Declarations (`# ponytail:`)
- **`backend/nic_mapping.py`**: `# ponytail: static dict lookup for 4 categories; upgrade: database table mapping if taxonomy expands beyond 3 business categories`
- **`backend/scripts/load_msme.py`**: `# ponytail: in-memory streaming dict aggregation; upgrade: DuckDB/Pandas if dataset grows to millions of rows`


