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
3. Dispatch each job independently and concurrently to `frontend-design-subagent` with flags:
- `--style-id`
- `--pass`
- `--output-dir`
- `--variant-seed`
4. Enforce each pass to use a distinct layout archetype and design language.
5. Run uniqueness validation across all generated passes and fail on high similarity.
6. Run Playwright visual validation after generation.
7. Write summary index for review.

## Required Artifacts
- Concepts: `.docs/planning/concepts/<style>/pass-<n>/`
- Validation screenshots: `.docs/planning/concepts/<style>/pass-<n>/validation/screenshots/*.png`
- Validation report: `.docs/planning/concepts/<style>/pass-<n>/validation/report.playwright.json`
- Handoff manifest: `.docs/planning/concepts/<style>/pass-<n>/validation/handoff.json`
- Inspiration cross-reference: `.docs/planning/concepts/<style>/pass-<n>/validation/inspiration-crossreference.json`
- Uniqueness report: `.docs/planning/concepts/uniqueness-report.json`

## Scripts
- `scripts/build-pass-jobs.ps1` builds a job manifest from style config.
- `scripts/run-local-orchestration.ps1` local fallback orchestrator with concurrent isolated job dispatch and validation checks.

## Notes
- Keep style config editable so style families and pass count can be changed without rewriting orchestration logic.
