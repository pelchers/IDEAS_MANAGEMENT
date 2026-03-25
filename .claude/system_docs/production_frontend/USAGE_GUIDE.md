# Production Frontend — Usage Guide

## Quick Start

### Generate a Production Frontend
```
"generate production frontend from the brutalism pass-1 prototype"
```
The orchestrator discovers the repo, builds a PRODUCTION-SPEC.md, and dispatches the subagent.

### Using an Existing Spec
```
"build production frontend from PRODUCTION-SPEC.md"
```
Skips discovery — goes straight to the subagent with the existing spec.

## Workflow
1. **Orchestrator** scans repo: app docs, user stories, schemas, design pass
2. **Orchestrator** builds PRODUCTION-SPEC.md with component boundaries, data shapes, user story mapping
3. **Subagent** generates production Next.js/React/Tailwind from the spec
4. **Subagent** validates with Playwright screenshots
5. **Subagent** produces transfer manifest for framework migration

## Key Difference from Design Pass Generation
- Design passes produce **prototypes** (HTML/CSS/JS, no framework)
- Production frontend produces **framework code** (Next.js, React components, real data shapes)
- Production frontend maps to user stories and has component boundaries

## Components

| Component | Path |
|---|---|
| Orchestrator Skill | `.claude/skills/production-frontend-orchestrator/SKILL.md` |
| Subagent Skill | `.claude/skills/production-frontend-subagent/SKILL.md` |

## Troubleshooting
**Subagent ignores design spec:** Ensure `frontend_spec.md` exists with correct prototype references. The `require-frontend-spec` hook auto-creates one if missing.
**Output doesn't match user stories:** Check PRODUCTION-SPEC.md user story mapping section.
