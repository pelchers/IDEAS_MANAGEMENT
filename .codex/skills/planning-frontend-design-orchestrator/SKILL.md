---
name: planning-frontend-design-orchestrator
description: Orchestrate frontend concept generation across 5 style families with 2 passes each, dispatching isolated Claude Code Task agents per pass, then running uniqueness validation.
---

# Planning Frontend Design Orchestrator

Use this skill to run multi-style frontend concept ideation with strict pass isolation.

## Config Source
- `.codex/skills/planning-frontend-design-orchestrator/references/style-config.json`

## Workflow
1. Read the style config to get all style families and their pass definitions.
2. Read the uniqueness catalog and inspiration catalog.
3. For each `(style, pass)` job:
   a. Select a uniqueness profile (ensuring no two passes share the same profile).
   b. Select inspiration references (rotating Awwwards + external refs).
   c. Build a comprehensive creative brief prompt.
   d. Dispatch as a Claude Code `Task` agent with `subagent_type=general-purpose`.
4. The Task agent generates ALL files from scratch (no template scripts).
5. After each pass completes, run `scripts/validate-concepts-playwright.mjs --style <style> --pass <n>` to capture desktop + mobile screenshots.
6. After all passes complete, run `scripts/validate-design-uniqueness.mjs` for pairwise checks.
7. Write summary index for review.

## Key Difference from Codex
The Codex version used `generate-concept.ps1` which stamped identical HTML structure with CSS variable swaps. This made all 10 passes look structurally identical despite different colors/fonts.

The Claude Code version dispatches each pass to an AI agent that generates fresh HTML/CSS/JS from its creative brief. This produces genuinely different layouts, components, interactions, and visual hierarchies.

## Required Artifacts Per Pass
- `<style>/pass-<n>/index.html`
- `<style>/pass-<n>/style.css`
- `<style>/pass-<n>/app.js`
- `<style>/pass-<n>/README.md`
- `<style>/pass-<n>/validation/handoff.json`
- `<style>/pass-<n>/validation/inspiration-crossreference.json`

## Required Visual Validation Artifacts
- `<style>/pass-<n>/validation/desktop/<view>.png` — 10 desktop screenshots per pass (1536x960)
- `<style>/pass-<n>/validation/mobile/<view>.png` — 10 mobile screenshots per pass (390x844, 2x scale)
- `<style>/pass-<n>/validation/report.playwright.json` — Structured report with viewport info

A pass is NOT considered complete until all 20 screenshots exist. Run the Playwright validation script after each pass finishes generating files.

## Optional Artifacts
- `<style>/pass-<n>/assets/*` - Only when background images/textures genuinely serve the aesthetic

## Scripts
- `scripts/validate-concepts-playwright.mjs` - Desktop + mobile screenshot capture for every view
- `scripts/validate-design-uniqueness.mjs` - Pairwise pass uniqueness checking
- `references/layout-uniqueness-catalog.json` - Structural uniqueness profiles
- `references/style-config.json` - Style family definitions

## Notes
- Background images are OPTIONAL, not required
- Animation libraries (three.js, gsap) are style-dependent, not mandated
- Keep style config editable for easy iteration
