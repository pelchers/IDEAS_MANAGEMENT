# Strata Console — Pass 2

**Variant Seed**: layered-bedrock-strata
**Style**: Geological strata layout with protruding stone layers at varying visual depths
**Generated**: 2026-02-15

## Overview

A dense, information-rich interface built on the concept of geological strata. Content layers sit at different visual elevations, casting downward box-shadows onto the layers beneath. Navigation lives in a top bar as protruding stone tablet tabs. The color gradient flows from lighter slate at the top to deeper charcoal at the bottom, evoking layered sedimentary rock. A single warm amber accent marks active states and focus.

## Structural Differences from Pass 1

| Aspect | Pass 1 (carved-monolith) | Pass 2 (layered-strata) |
|---|---|---|
| Navigation | Left rail (recessed sidebar) | Top bar with stone tablet tabs |
| Depth model | Inset/recessed (carved into stone) | Elevated/protruding (stacked layers casting shadows down) |
| Layout | Compact single-column content | Dense multi-column grids (3-4 columns) |
| Content metaphor | Panels carved INTO a monolith | Stone slabs STACKED at different heights |
| Shell | Sidebar + main split | Full-width with centered max-width content |
| Motion | 150ms opacity fade | 400ms ease-out emerge (translateY + opacity) |

## Design Characteristics

- **Palette**: Deep charcoal (#1a1a20), purple-shifted graphite (#252530), warm gold (#d4a843), dark sage (#5a7f6b)
- **Typography**: Rajdhani (headings, letter-spaced uppercase), Source Serif 4 (body), IBM Plex Mono (data/meta)
- **Depth**: External box-shadows at 3 elevation levels casting downward (protruding, not recessed)
- **Gradient**: CSS linear-gradient from lighter at top to darker at bottom (geological strata)
- **Motion**: 300-400ms ease-out transitions for strata reveal effect
- **Corners**: 3-5px border-radius (slightly rounded)
- **Density**: Dense, small type, tight grid, multi-column layouts

## Views (10 total)

1. **Dashboard** -- Dense 4-column KPI grid with sparkline bars, 3-column panel layer, summary strip
2. **Projects** -- 3-column card grid with progress bars, status indicators, team counts
3. **Project Workspace** -- Horizontal split: file explorer strip (top), tabbed code content (bottom)
4. **Kanban** -- 4 geological swim lane columns with stone chip cards, amber hover glow
5. **Whiteboard** -- Protruding toolbar ledge above deep canvas with positioned elements
6. **Schema Planner** -- 3x2 entity tile grid with amber connector lines
7. **Directory** -- Centered compact column with depth-based indentation and shadow variation
8. **Ideas** -- 3-column idea tile grid, elevation varies by priority (higher priority = bigger shadow)
9. **AI Chat** -- Stacked message slabs at alternating depths, conversation rhythm through elevation
10. **Settings** -- Tab panels as stacked strata, active tab is highest layer

## Tech Stack

- HTML5 / CSS3 / Vanilla JS
- Google Fonts (Rajdhani, Source Serif 4, IBM Plex Mono)
- No external libraries
- No background images
- No animation libraries (CSS transitions only)

## File Structure

```
pass-2/
  index.html
  style.css
  app.js
  README.md
  validation/
    handoff.json
    inspiration-crossreference.json
```
