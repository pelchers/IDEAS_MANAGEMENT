---
name: frontend-design-subagent
description: Generate one isolated frontend concept pass as a full navigable app ideation using plain HTML/CSS/JS. Each pass is written from scratch by the AI agent, not stamped from a template.
---

# Frontend Design Subagent

Use this skill for one pass only. Do not blend with other pass outputs.

## Inputs (via Task agent prompt)
- `styleId` - Which style family
- `pass` - Pass number (1 or 2)
- `outputDir` - Where to write generated files
- `stylePalette` - Colors, fonts, design tokens
- `styleDirection` - Creative brief text
- `uniquenessProfile` - Layout structure flags
- `inspirationReferences` - External site references

## Hard Requirements
1. Generate a fully navigable app frontend (not a landing page).
2. Include views for: dashboard, projects, project workspace, kanban, whiteboard, schema planner, directory tree, ideas, AI chat, settings.
3. Each pass must be wholly distinct from every other pass in layout structure, typography, color, spacing rhythm, and component language.
4. Use plain HTML/CSS/JS for low-friction review.
5. Include responsive behavior for desktop and mobile.
6. Write EVERY line of code from scratch - no shared templates.
7. Background images are OPTIONAL - use only when they genuinely enhance the style.
8. Animations should be style-appropriate, not forced.

## Files
- `index.html`
- `style.css`
- `app.js`
- `README.md`
- `validation/handoff.json`
- `validation/inspiration-crossreference.json`

## Playwright Visual Validation (Required)

After generating all files, the orchestrator MUST run the Playwright validation script to capture screenshots of every view at both desktop and mobile viewports. This is a non-negotiable step.

### Required Screenshots Per Pass
- `validation/desktop/<view>.png` — 10 screenshots at 1536x960
- `validation/mobile/<view>.png` — 10 screenshots at 390x844 (2x scale)
- `validation/report.playwright.json` — Structured report with viewport info and screenshot paths

### Script
```bash
node scripts/validate-concepts-playwright.mjs --concept-root <concept-root> --style <style> --pass <pass>
```

A pass is NOT considered complete until all 20 screenshots (10 desktop + 10 mobile) exist on disk.

## Inspiration
- Draw from the provided external references
- Apply the aesthetic quality bar from the style direction
- Make design choices that feel authentic to the style family, not generic
