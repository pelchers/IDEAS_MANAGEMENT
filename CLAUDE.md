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

## Key Paths
- Concepts: `.docs/planning/concepts/<style>/pass-<n>/`
- ADR: `.claude/adr/`
- Agents: `.claude/agents/`
- Skills: `.claude/skills/`

## Git Workflow
- Commit after each generation run
- Use HTTPS remotes only
