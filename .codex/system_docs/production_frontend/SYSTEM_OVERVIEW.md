# Production Frontend — System Overview

## What This System Does

Generates a production-quality frontend from actual application requirements — real data
models, user stories, and interactivity specs. Unlike general concept generation (which
produces divergent HTML prototypes), this system produces one convergent, fully specified
build with component boundaries, schema-shaped data, and a transfer manifest for framework
migration.

## Component Map

| Component | Path | Role |
|-----------|------|------|
| Orchestrator Agent | `.claude/agents/production-frontend-orchestrator/agent.md` | Repo discovery, spec building, dispatch |
| Orchestrator Skill | `.claude/skills/production-frontend-orchestrator/SKILL.md` | Discovery rules + spec generation |
| Spec Template | `.claude/skills/production-frontend-orchestrator/references/production-spec-template.md` | PRODUCTION-SPEC.md scaffold |
| Subagent Agent | `.claude/agents/production-frontend-subagent/agent.md` | HTML/CSS/JS generation + validation |
| Subagent Skill | `.claude/skills/production-frontend-subagent/SKILL.md` | Generation rules + reconciliation |
| Library Catalog | `.claude/skills/production-frontend-subagent/references/library-catalog.json` | CDN URLs for frontend libraries |
| Validation Script | `.claude/skills/production-frontend-subagent/scripts/validate-production-playwright.mjs` | Playwright visual validation |

## Three Input Modes

| Mode | When | How |
|------|------|-----|
| Style Transfer | Point to an external site | `"generate from https://stripe.com style"` |
| Template Basis | Use an existing concept pass | `"generate from brutalism pass-1"` |
| Custom Direction | Describe the visual direction | `"dark theme, monospace, card-based"` |

## Output Location

```
.docs/production/frontend/        — default output directory
  *.html                          — one page per route, component boundaries marked
  style.css + app.js              — shared across pages
  PRODUCTION-SPEC.md              — spec written by orchestrator
  discovery-report.json
  schema-inference-report.json
  validation/
    transfer-manifest.json        — every component mapped to framework target
    user-story-checklist.json     — user story coverage tracking
    component-reconciliation.json — registry vs actual diff
    desktop/*.png + mobile/*.png  — Playwright screenshots
```

## When to Use

| Scenario | Use |
|----------|-----|
| Ready to build production-quality frontend from app requirements | Full orchestrator run |
| Existing PRODUCTION-SPEC.md, skip discovery | `"build production frontend from PRODUCTION-SPEC.md"` |
| Iterating on a prior output | Provide `previousOutputDir` + `deltaInstructions` |
| Verifying component coverage post-build | Read `component-reconciliation.json` |

## Key Difference from General Frontend Agent

| Aspect | General Agent | Production Agent |
|--------|--------------|-----------------|
| Goal | Many divergent concepts | One convergent production build |
| Discovery | README spec only | Entire repository |
| Data models | Generic mock data | Schema-shaped with confidence levels |
| Components | Monolithic HTML | Boundary-marked for framework extraction |
| Validation | Screenshots only | Screenshots + reconciliation + story coverage |
| Iteration | Not supported | Delta-based with context preservation |

## Integration Points

| System | How It Integrates |
|--------|------------------|
| **frontend_spec** | `require-frontend-spec` hook fires before subagent writes any `.tsx`/`.css` |
| **visual_creative** | Concept passes can be used as template-basis input mode |
| **user_story_testing** | `user-story-checklist.json` maps every story to a component |
| **playwright_testing** | Validation script uses Playwright for desktop + mobile screenshots |
| **adr_setup** | Orchestrator reads `.adr/` for session context and requirements |

## Related Documentation

| File | Content |
|------|---------|
| `architecture.md` | Two-tier component architecture, 8-phase subagent flow, data flow diagram |
| `schema-inference.md` | 5-layer multi-source schema inference pipeline |
| `component-reconciliation.md` | Pre-registration + post-generation verification |
| `input-modes.md` | Three source modes + iteration support |

## Design Decisions

- **Single subagent dispatch**: production quality over parallelism — one focused build
- **Component registry pre-registration**: subagent declares all components before generating, enabling reconciliation
- **Schema-shaped data**: real data models from Drizzle/Zod/TypeScript schemas, not generic mocks
- **Transfer manifest**: every component has a designated framework migration target
