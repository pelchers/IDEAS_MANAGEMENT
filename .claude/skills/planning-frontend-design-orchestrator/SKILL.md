---
name: planning-frontend-design-orchestrator
description: Orchestrate frontend concept generation across 5 style families with up to 4 passes each, dispatching isolated Claude Code Task agents per pass with deliberate interaction design, optional media assets, and CDN libraries, then running uniqueness and visual validation.
---

# Planning Frontend Design Orchestrator

Use this skill to run multi-style frontend concept ideation with strict pass isolation and maximum variety.

## Config Source
- `.claude/skills/planning-frontend-design-orchestrator/references/style-config.json`

## Reference Catalogs
- `references/layout-uniqueness-catalog.json` - 20 structural layout profiles
- `references/style-config.json` - Style families with per-pass overrides
- `.claude/skills/frontend-design-subagent/references/available-libraries.json` - CDN library catalog
- `.claude/skills/frontend-design-subagent/references/asset-sources.json` - Approved media download sources
- `.claude/skills/frontend-design-subagent/references/external-inspiration-catalog.json` - Per-pass specific inspiration URLs

## Workflow
1. Read the style config to get all style families and their pass definitions.
2. Read the uniqueness catalog, inspiration catalog, library catalog, and asset sources.
3. For each `(style, pass)` job, build a comprehensive creative brief that includes:
   a. Select a uniqueness profile (ensuring no two passes share the same profile).
   b. Apply per-pass `paletteOverrides` and `typographyOverrides` from the config.
   c. Include the pass's `interactionProfile` with all category selections and prompts.
   d. Include the pass's `contentPersona` for themed fake data.
   e. Include the pass's `viewHints` for per-view component directives.
   f. Include the pass's `antiRepeat` list as hard constraints.
   g. Include the specific inspiration references (not generic Awwwards categories).
   h. Include the available libraries catalog so the agent can choose 0-5 libraries.
   i. Include the asset sources catalog so the agent can optionally download media.
   j. Dispatch as a Claude Code `Task` agent with `subagent_type=general-purpose`.
4. The Task agent generates ALL files from scratch (no template scripts).
5. After each pass completes, run `scripts/validate-concepts-playwright.mjs --style <style> --pass <n>` to capture desktop + mobile screenshots.
6. After all passes complete, run `scripts/validate-design-uniqueness.mjs` for pairwise checks.
7. Write summary index for review.

## IMPORTANT: New Generations vs Edits

When the user asks for NEW generations:
- Create NEW pass folders (pass-3, pass-4, etc.) — do NOT modify existing passes
- Existing passes are preserved as-is
- New passes must be distinct from ALL existing passes (checked by uniqueness validation)

When the user asks for EDITS:
- Modify the specific pass folder they reference
- Re-run Playwright screenshots after editing

## Per-Pass Variety System

Each pass variant in the style config includes these differentiation tools:

### paletteOverrides
Different color palette per pass. Same style DNA, different color expression. A brutalist pass can be warm paper+red OR cool gray+electric blue — both are brutalist.

### typographyOverrides
Different font families per pass within the style's typographic family. Mid-century pass-1 might use Playfair Display, pass-3 might use Fraunces. Both are serif-warm but visually distinct.

### interactionProfile
Deliberate interaction design choices for every touchpoint — buttons, cards, page transitions, scroll reveals, hover states, toggles, tooltips, loading states, ambient motion, and micro-feedback. Each category can have multiple selections and an optional prompt guiding the feel. No two passes should share the same interaction profile.

### contentPersona
Different fake data theme per pass. Pass-1 might be an indie game studio, pass-2 a news agency, pass-3 a biotech startup. Changes project names, metric labels, task descriptions, and overall content flavor.

### viewHints
Per-view component/layout directives that force different patterns. Dashboard might use stat cards in one pass, radial charts in another. Kanban might use vertical columns in one, horizontal swimlanes in another.

### antiRepeat
Explicit ban list from prior passes. If pass-1 used a left-rail nav and stat cards, pass-2's antiRepeat says "DO NOT use: left-rail nav, stat cards".

## Required Artifacts Per Pass
- `<style>/pass-<n>/index.html` - Complete HTML with all 10 views
- `<style>/pass-<n>/style.css` - Full CSS with responsive breakpoints
- `<style>/pass-<n>/app.js` - Navigation, interactions, library init
- `<style>/pass-<n>/README.md` - Concept docs, library usage, design decisions
- `<style>/pass-<n>/validation/handoff.json` - Structural metadata
- `<style>/pass-<n>/validation/inspiration-crossreference.json` - Inspiration mapping

## Required Visual Validation Artifacts
- `<style>/pass-<n>/validation/desktop/<view>.png` — 10 desktop screenshots per pass (1536x960)
- `<style>/pass-<n>/validation/mobile/<view>.png` — 10 mobile screenshots per pass (390x844, 2x scale)
- `<style>/pass-<n>/validation/report.playwright.json` — Structured report with viewport info

A pass is NOT considered complete until all 20 screenshots exist. Run the Playwright validation script after each pass finishes generating files.

## Optional Artifacts
- `<style>/pass-<n>/assets/*` - Downloaded media assets (SVGs, PNGs, Lottie JSON, video)

## Scripts
- `scripts/validate-concepts-playwright.mjs` - Desktop + mobile screenshot capture for every view
- `scripts/validate-design-uniqueness.mjs` - Pairwise pass uniqueness checking

## Notes
- Background images and media assets are OPTIONAL, not required
- CDN libraries are OPTIONAL — pure CSS is always valid
- Animation libraries are style-dependent, not mandated
- The agent picks libraries based on interaction profile fit, not by default
- Keep style config editable for easy iteration
- `passesPerStyle` in config determines how many passes to generate (default: 4)
