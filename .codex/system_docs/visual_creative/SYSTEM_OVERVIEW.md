# Visual Creative — System Overview

## What This System Does

Generates self-contained HTML showcase pages across three creative domains: data
visualization, animation, and graphic design. An orchestrator dispatches isolated
subagent jobs per `(domain, style, pass)` combination. Each subagent produces a
browser-renderable page with CDN-loaded libraries and Playwright validation screenshots.

## Component Map

| Component | Path | Role |
|-----------|------|------|
| Orchestrator Agent | `.claude/agents/planning-visual-creative-orchestrator/AGENT.md` | Reads config, dispatches subagents |
| Orchestrator Skill | `.claude/skills/planning-visual-creative-orchestrator/SKILL.md` | Loop + brief generation rules |
| Style Config | `.claude/skills/planning-visual-creative-orchestrator/references/style-config.json` | Domains, styles, passes, mock data |
| Subagent Agent | `.claude/agents/visual-creative-subagent/AGENT.md` | Generates one pass |
| Subagent Skill | `.claude/skills/visual-creative-subagent/SKILL.md` | HTML generation + validation rules |
| Library Catalog | `.claude/skills/visual-creative-subagent/references/library-catalog.json` | CDN URLs + versions |
| Validation Script | `.claude/skills/visual-creative-subagent/scripts/validate-visuals-playwright.mjs` | Playwright screenshots |

## Three Creative Domains

| Domain | Focus | Libraries |
|--------|-------|-----------|
| `data-vis` | Charts, dashboards, statistics | D3.js, Chart.js, ECharts, Vega-Lite |
| `animation` | Motion, physics, scenes | GSAP, p5.js, Anime.js, Matter.js |
| `graphic-design` | Generative art, 3D, illustrations | Three.js, p5.js, Paper.js, PixiJS |

## Output Location

```
.docs/design/concepts/
  data-vis/<chart-type>/pass-<n>/
  animation/<animation-style>/pass-<n>/
  graphic-design/<design-style>/pass-<n>/
```

## When to Use

| Scenario | Use |
|----------|-----|
| Generate interactive chart concepts | `"generate data visualization concepts"` |
| Create animation prototypes | `"generate loading animation concepts"` |
| Produce generative art / 3D explores | `"generate generative art concepts for the landing page"` |
| Add passes to an existing style | Orchestrator auto-increments past existing pass numbers |
| Edit an existing pass | Orchestrator re-runs Playwright after modification |

## Integration Points

| System | How It Integrates |
|--------|------------------|
| **playwright_testing** | Subagent uses Playwright for desktop + mobile screenshot validation |
| **production_frontend** | Visual concepts can be referenced as design sources in production builds |
| **frontend_spec** | Concept passes can be used as Type 4 similarity match source |

## Key Rules

- Libraries loaded via CDN only (catalog-verified URLs, no local installs)
- Each pass is fully self-contained — one HTML file renders the entire showcase
- Mock data sourced from `mockDatasets` in `style-config.json`
- 2 passes per style by default (configurable via `passesPerStyle`)
- Existing passes are never overwritten; new runs always increment

## Design Decisions

- **CDN-only libraries**: zero install friction; any browser can open the output
- **Self-contained HTML**: no build step, no server, no dependencies outside the file
- **Subagent isolation per pass**: one job = one agent = one focused output
- **Self-correction loop**: subagents review their own Playwright screenshots and fix issues before signaling done

## Quick Invocation

```
"generate data visualization concepts with 2 passes per style"
"generate interactive chart concepts for enrollment data"
"generate loading animation concepts"
```
