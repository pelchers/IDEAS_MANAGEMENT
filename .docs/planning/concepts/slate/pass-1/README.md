# Slate Console — Pass 1

**Variant Seed**: carved-monolith-console
**Style**: Dark slate carved-stone console with recessed navigation and etched content panels
**Generated**: 2026-02-15

## Overview

A premium dark interface that feels etched into stone. The UI uses inset box-shadows to create depth as if panels were carved out of a monolithic slab of dark slate. Navigation lives in a recessed left rail. Typography uses wide letter-spacing and thin weights to evoke engraved lettering. Warm amber accent provides active state highlights — like a glowing ember embedded in stone.

## Design Characteristics

- **Palette**: Charcoal (#1e1e24), graphite (#2a2a32), warm amber (#c89b3c), sage patina (#6b8f71)
- **Typography**: Rajdhani (headings, letter-spaced uppercase), Source Serif 4 (body), IBM Plex Mono (data/meta)
- **Depth**: Inset box-shadows throughout — panels, inputs, cards, nav items all feel recessed
- **Texture**: CSS-only stone-like overlay using repeating linear gradients at multiple angles
- **Motion**: 150ms opacity transitions only — no animation libraries
- **Corners**: 2-4px border-radius (weathered, not sharp)
- **Density**: Compact spacing, dense information display

## Views (10 total)

1. **Dashboard** — Stat grid, bar chart, activity feed, system health
2. **Projects** — Tabular project list with sort headers
3. **Project Workspace** — Split tree + code editor view
4. **Kanban** — Four-column board with carved card slots
5. **Whiteboard** — Grid canvas with positioned nodes and amber connection lines
6. **Schema Planner** — Entity blocks with field lists and relationship lines
7. **Directory** — Hierarchical file tree browser
8. **Ideas** — Compact capture bar + dense idea list with priority indicators
9. **AI Chat** — Conversation view with carved message bubbles
10. **Settings** — Dense form layout with toggle switches

## Tech Stack

- HTML5 / CSS3 / Vanilla JS
- Google Fonts (Rajdhani, Source Serif 4, IBM Plex Mono)
- No external libraries
- No background images
- No animation libraries

## File Structure

```
pass-1/
├── index.html
├── style.css
├── app.js
├── README.md
└── validation/
    ├── handoff.json
    └── inspiration-crossreference.json
```
