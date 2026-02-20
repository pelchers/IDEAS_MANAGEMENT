# Network Graph — Pass 1

## Overview
Force-directed network graph visualizing IDEA-MANAGEMENT entity relationships using D3.js v7.9.0. Deep space aesthetic with glowing nodes, pulsing ambient animations, and interactive exploration.

## Entity Types
| Group   | Color   | Hex       | Description                |
|---------|---------|-----------|----------------------------|
| User    | Violet  | `#8B5CF6` | People who own/collaborate |
| Project | Cyan    | `#06B6D4` | Top-level project entities |
| Idea    | Emerald | `#34D399` | Ideas within projects      |
| Kanban  | Amber   | `#FBBF24` | Kanban cards from ideas    |

## Link Types
| Type         | Style           | Meaning                         |
|--------------|-----------------|----------------------------------|
| owns         | Solid violet    | User owns a project              |
| collaborates | Dashed cyan     | User collaborates on a project   |
| contains     | Dotted emerald  | Project contains an idea         |
| promoted     | Thick amber     | Idea promoted to kanban card     |
| board        | Dashed gray     | Card belongs to project board    |

## Interactions
- **Drag** — Reposition any node; simulation re-settles
- **Hover** — Node enlarges, tooltip shows label + group + connection count
- **Click node** — Highlights connected subgraph, dims everything else
- **Click background** — Clears highlight
- **Zoom / pan** — Mouse wheel + drag on canvas
- **Force Strength slider** — Adjusts repulsion between nodes
- **Link Distance slider** — Adjusts ideal spring length between connected nodes
- **Collision Radius slider** — Adjusts minimum spacing between nodes
- **Group filters** — Toggle visibility of each entity group
- **Reset View** — Returns all controls, zoom, and filters to defaults

## Files
```
pass-1/
  index.html       — Page structure, header, controls panel, footer
  style.css        — Deep space theme, control styling, responsive layout
  app.js           — D3 force simulation, rendering, interactions
  README.md        — This file
  validation/
    handoff.json   — Generation metadata and checklist
```

## How to View
Open `index.html` in any modern browser. No build step required. D3.js is loaded from CDN.

## Palette
- Primary: `#8B5CF6` (violet)
- Secondary: `#06B6D4` (cyan)
- Background: `#030712` (near-black)
- Surface: `#111827` (dark gray)
- Text: `#E5E7EB` (light gray)

## Library
D3.js v7.9.0 via CDN: `https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js`
