---
name: planning-frontend-design-orchestrator
description: Orchestrate frontend concept generation across configurable style families and pass counts by dispatching isolated subagent jobs with style/pass flags, then run Playwright visual validation.
---

# Planning Frontend Design Orchestrator

Use this skill to run multi-style frontend concept ideation with strict pass isolation.

## Config Source
- `.codex/skills/planning-frontend-design-orchestrator/references/style-config.json`

## Workflow
1. Read the style config.
2. Build one job per `(style, pass)`.
3. Dispatch each job independently to `frontend-design-subagent` with flags:
- `--style-id`
- `--pass`
- `--output-dir`
- `--variant-seed`
4. Enforce that each pass produces a full app frontend ideation (multi-view navigable experience).
5. Run Playwright visual validation after generation.
6. Write summary index for review.

## Required Artifacts
- Concepts: `.docs/planning/concepts/<style>/pass-<n>/`
- Validation screenshots: `.docs/planning/concepts/<style>/pass-<n>/validation/playwright/`
- Validation report: `.docs/planning/concepts/<style>/pass-<n>/validation/playwright/report.json`

## Scripts
- `scripts/build-pass-jobs.ps1` builds a job manifest from style config.
- `scripts/run-local-orchestration.ps1` local fallback generator for all passes.

## Notes
- Keep style config editable so style families and pass count can be changed without rewriting orchestration logic.
