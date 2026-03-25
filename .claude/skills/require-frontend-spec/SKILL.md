---
name: require-frontend-spec
description: Ensure frontend_spec.md exists before frontend work. Auto-creates from project design system if missing. Parses natural language for design references.
---

## Purpose
Safety net that guarantees a `frontend_spec.md` exists before any frontend code is written. Works as a PreToolUse hook (automatic) and a manually invocable skill with natural language parsing.

## When It Fires (Automatic — Hook)
The `require-frontend-spec.sh` PreToolUse hook fires before any `Write` or `Edit` to:
- `apps/web/src/**/*.tsx`
- `apps/web/src/**/*.ts`
- `apps/web/src/**/*.css`
- `packages/ui-tokens/**`

## What the Hook Does
1. Checks for `frontend_spec.md` (session-level → root-level)
2. If found → allows the write
3. If missing → auto-creates from the project:
   - Reads design tokens for colors
   - Scans prototype directory for HTML files
   - Detects project context files (CLAUDE.md, PRD, tech spec, task list, ADR status)
   - If design system detected → creates complete spec (Type 1)
   - If nothing detected → creates incomplete spec with ACTION REQUIRED marker
4. Always allows the write (non-blocking)

## Manual Invocation
```
/require-frontend-spec
```

## Natural Language Parsing (Skill — Not Hook)

When invoked manually or when the user's message contains design references, parse the intent:

### Type Detection Rules
```
URL detected (https://, http://, figma.com, etc.)
  → Type 2: External Reference
  → Extract URL
  → Infer match level: "exactly like" / "1-1" = exact, "inspired by" / "similar to" = loose
  → Create spec immediately — NO QUESTIONS

Style keywords (round buttons, gradient, serif, dark theme, neon, etc.)
  → Type 3: Chat-Prompted
  → Capture ALL style descriptions verbatim
  → Create spec immediately — NO QUESTIONS

Design pass referenced (pass-1, brutalism, liquid, retro, etc.)
  → Type 4: Similarity Match
  → Extract pass name
  → Parse divergence: "but with X" = diverge on X, "keep Y" = keep Y
  → Create spec immediately — NO QUESTIONS

No design language + design system exists in project
  → Type 1: Internal Prototype
  → Auto-detect from filesystem
  → Create spec immediately — NO QUESTIONS

No design language + no design system
  → Ask batch questions (see below)
```

### Batch Question Rule
When questions are needed, ask ALL at once in ONE prompt:
```
"No design system detected. To create a frontend spec, I need:
1. Reference site or image? (URL, path, or 'none')
2. Color preferences? (dark/light, specific hex codes, or 'any')
3. Typography? (serif, sans-serif, monospace, or 'any')
4. Interaction style? (minimal, animated, brutalist, corporate, playful)
Answer all at once — I'll create the spec from your answers."
```

**NEVER** ask questions intermittently during the build. All questions upfront, one batch, then create the spec and proceed.

### One-Shot Rule
If the user provides enough info in their message, create the spec immediately with ZERO questions. Examples:
- "build it like https://stripe.com" → spec created, no questions
- "dark theme, monospace, 4px borders" → spec created, no questions
- "use pass-1 but with top navbar" → spec created, no questions

## Project Context Detection
The hook and skill detect and populate:
- `CLAUDE.md` location (project root or .claude/)
- PRD path (any session's prd.md)
- Technical requirements path
- Task list path
- ADR orchestration status (exists with N subfolders, or not set up)
- Design tokens file
- Prototype directory

This context is written into the spec's `## Project Context` section so any agent reading the spec knows where to find project docs — even if ADR hasn't been set up yet.

## Self-Describing Header
Every generated `frontend_spec.md` starts with an HTML comment explaining:
- What the file is
- Where to find project context files
- How to use the spec
- What to do if it says "ACTION REQUIRED"

This ensures any agent — chain, longrunning, manual, or brand new — immediately understands the file's purpose.

## Integration Points
- **PreToolUse hook** — fires before every frontend file write
- **Agent chain** — chain-session-init.sh outputs mandatory reading list including spec
- **FEA process** — hook fires during Execute phase
- **Longrunning orchestrator** — subagents read spec per skill instructions
- **ADR setup** — Step 0 verifies spec for frontend sessions
- **Orchestrated mode** — orchestrator validates output against spec post-phase
