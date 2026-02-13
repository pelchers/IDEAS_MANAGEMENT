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
- `--handoff-path`

## Hard Requirements
1. Generate a fully navigable app frontend ideation (not a landing page).
2. Include views for dashboard, projects, project workspace, kanban, whiteboard, schema planner, directory tree, ideas, AI chat, and settings.
3. Keep each pass wholly distinct from every other pass in layout, type, color language, spacing rhythm, and component shape language.
4. Use plain HTML/CSS/JS to keep review friction low.
5. Include responsive behavior for desktop and mobile.
6. Cross-reference external style inspiration from the catalog and record applied traits.
7. Apply uniqueness flags from handoff payload (`shellMode`, `navPattern`, `contentFlow`, `scrollMode`, `alignment`, `heroTreatment`, `motionLanguage`, `density`, `componentTone`).
8. Include at least one `awwwards.com` reference in the pass inspiration output.
9. Include `three.js` and `gsap` with meaningful 3D/motion behavior.
10. Download/use local visual media assets in `assets/` for atmospheric richness when possible.
11. Include Playwright visual validation artifacts.

## Files
- `index.html`
- `style.css`
- `app.js`
- `README.md`
- `assets/*`
- `validation/handoff.json`
- `validation/inspiration-crossreference.json`
- `validation/screenshots/*.png`
- `validation/report.playwright.json`

## Scripts
- `scripts/generate-concept.ps1` creates one concept pass.
- `scripts/validate-design-uniqueness.mjs` enforces pairwise pass distinction.
- `scripts/validate-concepts-playwright.mjs` captures screenshots for visual review.

## Inspiration
Use inspiration notes from Anthropic frontend design guidance:
- `references/inspiration-notes.md`

## Handoff Contract
- The generator must persist the consumed handoff source path in output artifacts.
- The generator must fail if handoff-provided references do not include at least one Awwwards URL.
