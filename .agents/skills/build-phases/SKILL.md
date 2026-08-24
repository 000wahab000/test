---
name: build-phases
description: >
  Phase-gated build guide for the hyper-local business feasibility prototype.
  Use when executing any phase (0-6) of antigravity_build_spec.md.
  Enforces STOP gates, hard constraints, and ponytail/YAGNI rules at every step.
---

# Build Phases — Feasibility Prototype

Read `antigravity_build_spec.md` as the single source of truth.
Read `AGENTS.md` for hard constraints before touching any phase.

## Before starting any phase

1. Confirm the previous phase checkpoint passed (user confirmed output).
2. Identify what the current phase produces — build only that.
3. Apply ponytail ladder: does this function/file need to exist at all?

## Phase execution rules

- **STOP** at the end of each phase. Show the required output. Wait.
- Any uncertainty → `NOTES.md`, not code.
- Each backend function that has non-trivial logic gets one `assert`-based
  self-check in `if __name__ == "__main__"` or a `test_*.py`. No pytest
  fixtures, no test frameworks unless asked.

## Phase 0 checklist
- [ ] `frontend/` — React + Vite + Tailwind scaffolded
- [ ] `backend/` — FastAPI app scaffolded, Postgres connection only
- [ ] No business logic
- [ ] STOP: show file tree

## Phase 1 checklist
- [ ] `backend/finance.py` — 4 pure functions, scheme rules hardcoded
- [ ] Self-check: `python backend/finance.py` prints worked example results
- [ ] STOP: show test output

## Phase 2 checklist
- [ ] `backend/scripts/load_census.py` — one-time offline script, reads CSV,
      keeps only the columns listed in spec, loads to `villages` table
- [ ] `GET /village` endpoint — returns cleaned fields as JSON
- [ ] STOP: show sample JSON for one real village

## Phase 3 checklist
- [ ] `backend/fit.py` — `check_fit()`, rule-based string/number matching only
- [ ] Self-check: two test cases (one match, one mismatch)
- [ ] STOP: show output

## Phase 4 checklist
- [ ] Screen 1: state/district/village dropdowns + category + capital input
- [ ] Screen 2: financial output + village context + fit result in plain cards
      + empty "AI ANALYSIS" placeholder box
- [ ] End-to-end wired, no LLM
- [ ] STOP: confirm full flow works with real data

## Phase 5 checklist
- [ ] `POST /narrative` endpoint — takes financial output + village data + fit result
- [ ] Prompt includes verbatim instruction (see AGENTS.md constraint #7)
- [ ] Response parsed into strengths/weaknesses/opportunities/threats/narrative
- [ ] Hindi: same LLM call, no extra translation service
- [ ] STOP: show 2 example outputs

## Phase 6 checklist
- [ ] Disclaimer line rendered: "Decision support only. Not a loan guarantee.
      Eligibility subject to scheme verification."
- [ ] Basic styling pass
- [ ] Nothing else

## ponytail: deliberate constraints

These are spec constraints, not laziness — do not "upgrade" them:
- Raw psycopg2/SQLAlchemy core (no ORM) — spec says so
- 3 categories hardcoded — spec says so
- Rule-based fit scoring (no ML) — spec says so
