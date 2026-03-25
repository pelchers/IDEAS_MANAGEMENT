# Visual Creative — Usage Guide

## Quick Start

### Generate Visual Concepts
```
"generate data visualization concepts with 2 passes per style"
```
The orchestrator dispatches subagents across 3 domains: data-vis, animation, graphic-design.

## Domains

### Data Visualization
Charts, dashboards, statistical graphics using D3.js, Chart.js, ECharts, Vega-Lite.
```
"generate interactive chart concepts for enrollment data"
```

### Animation
Motion graphics, physics simulations, animated scenes using GSAP, p5.js, Anime.js, Matter.js.
```
"generate loading animation concepts"
```

### Graphic Design
Generative art, 3D renders, illustrations using Three.js, p5.js, Paper.js, PixiJS.
```
"generate generative art concepts for the landing page"
```

## Output Structure
```
.docs/design/concepts/<domain>/<style>/pass-<n>/
├── index.html          — self-contained showcase page
├── screenshots/
│   ├── desktop.png     — Playwright desktop capture
│   └── mobile.png      — Playwright mobile capture
└── README.md           — pass description
```

## Key Rules
- Libraries loaded via CDN (from library catalog in style-config.json)
- Each pass is a single self-contained HTML page
- Mock data from `mockDatasets` in style-config.json
- 2 passes per style by default (configurable)
- Playwright validation screenshots required

## Components

| Component | Path |
|---|---|
| Orchestrator | `.claude/skills/planning-visual-creative-orchestrator/SKILL.md` |
| Subagent | `.claude/skills/visual-creative-subagent/SKILL.md` |
| Library Catalog | `.claude/skills/visual-creative-subagent/references/library-catalog.json` |
| Style Config | `.claude/skills/planning-visual-creative-orchestrator/references/style-config.json` |
