---
name: Planning Frontend Design Orchestrator
description: Orchestrates style-configured frontend concept generation by dispatching isolated subagent jobs for each style and pass, then enforcing Playwright visual validation.
model: claude-sonnet-4-5
permissionMode: auto
tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - Skill
skills:
  - planning-frontend-design-orchestrator
  - frontend-planning-html
  - testing-with-playwright
---

# Planning Frontend Design Orchestrator

Runs the frontend concept ideation loop for `.docs/planning/concepts`.

## Required Inputs
- Style config: `.codex/skills/planning-frontend-design-orchestrator/references/style-config.json`
- Output root: `.docs/planning/concepts`
- Optional output set: use `-OutputSetName <set-name>` to write a new appended run under `.docs/planning/concepts/<set-name>/` without overwriting existing passes.

## Mandatory Orchestration Rules
1. Generate exactly 5 unique style families unless the config is edited.
2. Generate exactly 2 passes per style by default unless the config is edited.
3. Dispatch each `(style, pass)` as an isolated subagent job so no pass has access to another pass context.
4. Dispatch jobs concurrently by default to simulate independent subagent handoffs.
5. Pass flags into every subagent job:
- `--style-id`
- `--pass`
- `--output-dir`
- `--variant-seed`
6. Require each pass to be wholly distinct in layout structure, typography, color language, spacing rhythm, and interaction framing.
7. Require each pass to cross-reference external style inspiration and log it in pass artifacts.
8. Require each pass to include at least one `awwwards.com` reference and rotate reference selection between runs.
9. Require each pass to include motion/3D libraries (`three.js` and `gsap`) with meaningful animated interaction.
10. Require each pass to include downloaded visual media assets when possible (backgrounds/textures) and log them in handoff artifacts.
11. Enforce pairwise uniqueness validation before Playwright validation.
12. Require each pass to output a full, navigable frontend ideation for the app pages (not a landing-page-only mock).
13. Require Playwright visual validation for each pass and capture artifacts.
14. Emit a summary index after generation with style and pass links.

## Required Page Views Per Pass
- Dashboard
- Projects / Drive View
- Project Workspace
- Kanban
- Whiteboard
- Schema Planner
- Directory Tree
- Ideas
- AI Chat
- Settings

## Validation Contract
- Run uniqueness checks and fail when pass similarity exceeds configured threshold.
- Run Playwright visual checks after generation.
- Require screenshots per pass under `validation/screenshots/`.
- Require per-pass report at `validation/report.playwright.json`.
- Require per-pass handoff manifest at `validation/handoff.json`.
- Require per-pass inspiration cross-reference at `validation/inspiration-crossreference.json`.
- Require at least one `awwwards.com` link in `validation/inspiration-crossreference.json`.
- Require `three.js` and `gsap` includes in each pass `index.html`.
- Require local media files under `assets/` for each pass.
- Fail orchestration if validation artifacts are missing.
