# Orchestrator Session

Session: app_build_v1
Date: 2026-02-10

## Source Of Truth (Planning)
- `.docs/planning/overview.md`
- `.docs/planning/prd.md`
- `.docs/planning/technical-specification.md`
- `.docs/planning/auth-and-subscriptions.md`
- `.docs/planning/sync-strategy.md`
- `.docs/planning/deployment-and-hosting.md`
- `.docs/planning/milestones.md`

## Build Strategy
- Web-first for the canonical platform foundation (backend APIs, auth, subscriptions/entitlements, AI tools, audit logs, core UI flows).
- Validate desktop constraints early with a thin Electron spine to prove local folder selection, local mirror layout, and sync queue behavior.
- Keep web and desktop 1-to-1 at the domain layer; platform differences live behind adapters.

## Phase Handoff Rules
- Each phase produces:
  - Updated checklist in `primary_task_list.md`
  - Required docs/notes updates
  - A green build/test pass appropriate to the changes
  - A commit

## Required ADR Artifacts Per Phase
- Plan doc in `.adr/current/<phase_name>/phase_<n>.md`
- Review doc in `.adr/history/<phase_name>/phase_<n>_review.md`

Note: We intentionally keep detailed requirements in `.docs/planning/*` and reference them from ADR docs.
