# 14_audit-cycles

Session: Audit Cycling
Started: 2026-04-09

---

## Purpose

This orchestration subfolder tracks **mega audit cycles** — full sweeps of the codebase using the `audit-system-agent` across all 10 non-infra audit types. Each cycle produces:

1. A PRD documenting the state of the codebase at cycle start
2. A task list of remediation work derived from audit findings + any outstanding TODOs
3. Execution of the fixes
4. Validation via Playwright + build checks
5. A post-cycle report with final scores

## Convention

- Each cycle gets its own subfolder: `cycle-NNN/`
- Each cycle contains:
  - `prd.md` — Problem statement, scope, success criteria
  - `primary_task_list.md` — Phased task list grouped by audit type
  - `report.md` — Post-execution summary (created after completion)
- Audit reports themselves live in `.docs/planning/audits/` (unchanged)
- Remediation plan files live in `.docs/planning/plans/` (unchanged)

## Cycle Index

| Cycle | Date Started | Status | Starting Avg Score | Final Avg Score | Fixes Applied |
|-------|-------------|--------|-------------------|----------------|---------------|
| 001 | 2026-04-08 | In Progress | 60.7 / C | TBD | 77 findings + 2 TODOs |
