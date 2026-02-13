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

## Mandatory Orchestration Rules
1. Generate exactly 5 unique style families unless the config is edited.
2. Generate exactly 2 passes per style by default unless the config is edited.
3. Dispatch each `(style, pass)` as an isolated subagent job so no pass has access to another pass context.
4. Pass flags into every subagent job:
- `--style-id`
- `--pass`
- `--output-dir`
- `--variant-seed`
5. Require each pass to output a full, navigable frontend ideation for the app pages (not a landing-page-only mock).
6. Require Playwright visual validation for each pass and capture artifacts.
7. Emit a summary index after generation with style and pass links.

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
- Run Playwright visual checks after generation.
- Require screenshots per pass under `validation/playwright/`.
- Fail orchestration if validation artifacts are missing.
