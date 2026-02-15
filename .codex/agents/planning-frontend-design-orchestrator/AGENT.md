---
name: Planning Frontend Design Orchestrator
description: Orchestrates style-configured frontend concept generation by dispatching isolated subagent jobs for each style and pass, generating each concept from scratch, then enforcing visual validation.
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

Orchestrates style-configured frontend concept generation by dispatching isolated subagent jobs for each style and pass, then enforcing visual validation.

## How It Works
Each (style, pass) job is dispatched as an isolated subagent that generates concepts from scratch using its own creative judgment. This eliminates the template sameness problem that occurred when a PowerShell script stamped identical HTML with CSS variable swaps.

## Required Inputs
- Style config: `.codex/skills/planning-frontend-design-orchestrator/references/style-config.json`
- Output root: `.docs/planning/concepts`
- Uniqueness catalog: `.codex/skills/planning-frontend-design-orchestrator/references/layout-uniqueness-catalog.json`
- Inspiration catalog: `.codex/skills/frontend-design-subagent/references/external-inspiration-catalog.json`

## Mandatory Orchestration Rules
1. Read the style config to get style families and passes per style.
2. For each `(style, pass)` combination, dispatch a separate isolated subagent job with a comprehensive prompt containing:
   - The style definition, palette, and design direction
   - The uniqueness profile (shell, nav, flow, scroll, motion, etc.)
   - Inspiration references for that specific pass
   - The output directory path
   - Explicit instruction to generate ALL files from scratch (no templates)
3. Each pass must produce a fully navigable app frontend covering all required views.
4. Each pass MUST be visually and structurally distinct - different layout architecture, different typography choices, different spacing rhythm, different component shapes, different color application.
5. Background images are OPTIONAL (`requireDownloadedMedia: false`). Not every pass needs one. Use them only when they genuinely enhance the aesthetic (e.g., a concrete texture for brutalist, a starfield for retro 50s). Many passes should rely purely on CSS gradients, patterns, or solid color.
6. Animation libraries (three.js, gsap) are style-dependent, not forced. Include GSAP only where motion is essential (e.g., liquid style). Don't force 3D into every pass.
7. Run uniqueness validation across all generated passes after completion.
8. Emit a summary index after generation.

## The 5 Style Families
- **brutalist** - Raw concrete geometry, exposed structural grid, anti-decoration
- **mid-century-modern** - Organic curves meeting geometric precision, warm teak/walnut tones
- **retro-50s** - Chrome diner meets atomic age, pastel palette, googie architecture
- **liquid** - Everything slides, morphs, flows; motion IS the design
- **slate** - Dark stone, carved interfaces, luxury watch UI meets mountain lodge

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

## Key Principles
- **No template script**: Each pass is generated fresh by the AI agent, not stamped from a script
- **No mandatory background images**: `requireDownloadedMedia` is false by default
- **No mandatory three.js/gsap**: Animation libraries are style-dependent, not forced
- **Agent-driven uniqueness**: The orchestrator writes a detailed creative brief per pass that ensures structural divergence, rather than relying on CSS class token rotation

## Validation Contract
- Run uniqueness validation after generation
- Each pass must have: `index.html`, `style.css`, `app.js`, `README.md`
- Each pass must have `validation/handoff.json` with style metadata
- Each pass must have `validation/inspiration-crossreference.json`
- Run Playwright visual checks after generation if available
- Require unique `profileId` coverage across all passes in a run
