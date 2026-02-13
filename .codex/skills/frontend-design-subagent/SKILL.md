---
name: frontend-design-subagent
description: Generate one isolated frontend concept pass (style + pass) as a full navigable app ideation using plain HTML/CSS/JS and produce Playwright visual validation artifacts.
---

# Frontend Design Subagent

Use this skill for one pass only. Do not blend with other pass outputs.

## Inputs
- `--style-id`
- `--pass`
- `--variant-seed`
- `--output-dir`

## Hard Requirements
1. Generate a fully navigable app frontend ideation (not a landing page).
2. Include views for dashboard, projects, project workspace, kanban, whiteboard, schema planner, directory tree, ideas, AI chat, and settings.
3. Keep each pass visually and structurally distinct from every other pass.
4. Use plain HTML/CSS/JS to keep review friction low.
5. Include responsive behavior for desktop and mobile.
6. Include Playwright visual validation artifacts.

## Files
- `index.html`
- `style.css`
- `app.js`
- `README.md`
- `validation/handoff.json`
- `validation/screenshots/*.png`
- `validation/report.playwright.json`

## Scripts
- `scripts/generate-concept.ps1` creates one concept pass.
- `scripts/validate-concepts-playwright.mjs` captures screenshots for visual review.

## Inspiration
Use inspiration notes from Anthropic frontend design guidance:
- `references/inspiration-notes.md`
