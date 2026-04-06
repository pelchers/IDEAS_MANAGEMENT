# IDEA-MANAGEMENT Project Guide

## Project Overview
Idea management application with dashboard, projects, kanban, whiteboard, schema planner, directory tree, ideas capture, AI chat, and settings views.

## Architecture
- Frontend: Next.js (App Router) + TypeScript
- Backend: Convex (database + backend + real-time)
- Auth: Clerk
- Payments: Stripe
- UI: shadcn/ui + Tailwind CSS + Radix UI primitives
- State: Zustand + React Query
- Validation: Zod
- Testing: Playwright (E2E)

## Frontend Concept Generation
This repo uses a multi-style frontend concept ideation system.
- Orchestrator: `.claude/agents/planning-frontend-design-orchestrator/`
- Subagent: `.claude/agents/frontend-design-subagent/`
- Config: `.claude/skills/planning-frontend-design-orchestrator/references/style-config.json`
- Output: `.docs/planning/concepts/`

### Style Families (Current)
1. **Brutalist** - Raw concrete geometry, exposed structure, anti-decoration
2. **Mid-Century Modern** - Organic curves, warm wood tones, Eames-era furniture logic
3. **Retro 50s** - Chrome diners, atomic age patterns, pastel palette, googie architecture
4. **Liquid** - Fluid motion, sliding transitions, morphing shapes, water-like UX
5. **Slate** - Dark stone textures, muted earth tones, carved/etched UI elements

### Generation Rules
- 2 passes per style = 10 total concept passes
- Each pass must be wholly distinct in layout, typography, color, spacing, and interaction
- Background images are OPTIONAL - do not force them into every pass
- Plain HTML/CSS/JS for low-friction review
- Each pass covers all 10 app views (dashboard through settings)
- Claude Code agents generate concepts directly (no template scripts)

## Visual/Creative Concept Generation
This repo also includes a visual/creative concept system for data visualization, animation, and graphic design.
- Orchestrator: `.claude/agents/planning-visual-creative-orchestrator/`
- Subagent: `.claude/agents/visual-creative-subagent/`
- Config: `.claude/skills/planning-visual-creative-orchestrator/references/style-config.json`
- Library Catalog: `.claude/skills/visual-creative-subagent/references/library-catalog.json`
- Output: `.docs/design/concepts/`

### Domains
1. **Data Visualization** — Interactive charts, dashboards, statistical graphics (D3.js, Chart.js, ECharts, Vega-Lite)
2. **Animation** — Motion graphics, physics simulations, animated scenes (GSAP, p5.js, Anime.js, Matter.js)
3. **Graphic Design** — Generative art, 3D renders, illustrations (Three.js, p5.js, Paper.js, PixiJS)

### Generation Rules
- 2 passes per style (configurable via `passesPerStyle`)
- Each pass produces a single self-contained HTML showcase page
- Libraries loaded via CDN from the library catalog
- Each pass includes Playwright validation screenshots (desktop + mobile)
- Mock data for data-vis from `mockDatasets` in style-config.json

### Output Structure
- Data-vis: `.docs/design/concepts/data-vis/<chart-type>/pass-<n>/`
- Animation: `.docs/design/concepts/animation/<animation-style>/pass-<n>/`
- Graphic Design: `.docs/design/concepts/graphic-design/<design-style>/pass-<n>/`

## Key Paths
- Frontend Concepts: `.docs/planning/concepts/<style>/pass-<n>/`
- Visual/Creative Concepts: `.docs/design/concepts/<domain>/<style>/pass-<n>/`
- ADR: `.adr/`
- Agents: `.claude/agents/`
- Skills: `.claude/skills/`

## Git Workflow
- Commit incrementally at key milestones during work (e.g., after completing a feature, fixing a bug, or finishing a phase) — do not wait until the end to batch everything
- At the end of each chat session, commit any uncommitted work and push if a remote exists
- Use HTTPS remotes only
- Create savepoint branches after major work is completed (e.g., full feature, tier of work, phase completion). Name them descriptively so they serve as rollback points (e.g., `savepoint/tier1-kanban-crud`, `savepoint/phase-a-accuracy-audit`). Include the main branch commit hash in the savepoint commit message so you know what it synced with. Savepoint branches can also be created on user request at any time

## Dev Server Cleanup
- When done working, stop any dev servers that were started during the session (only the specific server used for testing, not all running servers)
- Do not stop servers the user was already running before the session began
- Exception: if the user explicitly asks to leave the server running, leave it

## Confirm Before Acting Convention
- When the user says "confirm request", "confirm reasoning", "confirm before proceeding", or similar phrasing, it means: **present your understanding of the request in chat and wait for explicit approval before taking any action.**
- This is a per-instance instruction — it applies only to that specific interaction, not permanently. Once the user approves, proceed normally.
- Do NOT change any settings, modes, or permissions. Simply pause, explain what you plan to do, and wait for a "yes", "proceed", "approved", or similar confirmation.
- If the user says "reconfirm request", repeat your understanding again for a second review before acting.

## Completion Convention
- When tasked with implementing features, plans, or scoped work — complete ALL items in the defined scope. Do not defer remaining tasks to "next session" unless the user explicitly asks to stop or split the work.
- Go out of the way to perform additional testing, research, and validation to assure best practices are met and exceeded. Validation (build checks, Playwright tests, screenshots) is part of completing work, not a separate optional step.
- This applies to agent-defined scopes of work as well — agents must finish what they start, not leave partial implementations.
- Exception: If a dependency is missing (e.g., API keys not yet provided), or a blocking issue requires user input, document what's blocked and why — but complete everything that can be completed.
