# AGENTS.md — hyper-local business feasibility prototype

Source of truth: `antigravity_build_spec.md`. Do not add features not listed there.

---

## Hard Constraints (violating any = failed build)

1. **No invented data.** Every number shown to the user comes from deterministic financial math (Phase 1) or the seeded census CSV (Phase 2). The LLM never outputs a number displayed as fact — LLM writes prose only (SWOT bullets, narrative sentences).
2. **Banned features** (if you think one would "improve" the app, write it in `NOTES.md` and stop, do not build it):
   - PostGIS, geo/map libraries, competitor mapping
   - ML models, feasibility score out of 100, cash-flow simulator
   - Voice input
3. **Business categories**: exactly 3 — dairy, retail, agro-processing. No more.
4. **Languages**: exactly 2 — English, Hindi. No more.
5. **Census data**: 2–3 districts, seeded manually by human into `/data/raw/`. No live scraper, no national dataset.
6. **Screens**: exactly 2 — input form, report screen. No auth, no accounts, no dashboard, no save/history.
7. **Every LLM prompt** must include verbatim: "Only use the facts provided below. Do not invent statistics, prices, or counts."

## Phase Gate Rule

Do not proceed to the next phase until the current phase passes its checkpoint. Each phase ends with STOP + report output + wait for confirmation.

## If Unsure

If uncertain whether something is in scope: **it is not.** Write the question to `NOTES.md`. Stop.

## Ponytail Rules (active every response)

- No unrequested abstractions.
- No boilerplate "for later".
- No new dependency if stdlib or an already-installed package covers it.
- Deletion over addition.
- Shortest working diff wins — after you understand the problem.
- Mark deliberate simplifications: `# ponytail: <ceiling>, <upgrade path>`
- Non-trivial logic gets one runnable self-check (assert-based `__main__` or `test_*.py`). No frameworks unless asked.

## Stack (Phase 0 defines this, do not deviate)

- Frontend: React + Vite + Tailwind (`frontend/`)
- Backend: FastAPI (`backend/`)
- DB: Postgres, SQLAlchemy core or raw psycopg2 — no full ORM

## Definition of Done

A user can: pick a village from 2–3 seeded districts → pick a business category → enter capital → see correct financial structuring + real census-derived village context + rule-based fit verdict + LLM narrative grounded only in those facts. Nothing more.
