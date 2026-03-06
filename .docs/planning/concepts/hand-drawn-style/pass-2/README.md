# Hand-Drawn Style — Pass 2

## Overview
A watercolor-and-ink interpretation of the hand-drawn aesthetic. Where Pass 1 is pencil-and-notebook, this pass uses watercolor washes, ink splatter textures, and artistic brush strokes. Dashboard grid layout with floating action menu for navigation. Continuous ambient animations — ink drips and watercolor bleeding effects. The palette uses analogous gradient washes of purple, teal, and rose.

### Pages
- **Page: Main** (`index.html`) — Single-page app with view switching
  - All 10 views: Dashboard, Projects, Workspace, Kanban, Whiteboard, Schema, Directory Tree, Ideas, AI Chat, Settings

## Design Language

- **Colors**:
  - Primary: `#4A2C6A` — Deep purple ink
  - Secondary: `#2D8B8B` — Teal watercolor
  - Accent: `#C75B7A` — Rose/pink wash
  - Background: `#FDF8F0` — Watercolor paper
  - Surface: `#FFFFFF` — White with watercolor edge stains
  - Text: `#2A2A2A` — Dark ink
  - Wash: `rgba(74, 44, 106, 0.08)` — Subtle purple wash overlay

- **Typography**:
  - Headings: Kalam (700) — Google Fonts — brush script feel
  - Body: Patrick Hand (400) — Casual handwritten
  - Accent: Quicksand (500, 600) — Rounded modern for UI labels

- **Visual Elements**:
  - Watercolor wash backgrounds (CSS gradients with soft edges)
  - Ink splatter decorative elements (SVG)
  - Brush-stroke borders and dividers
  - Watercolor paper texture (subtle CSS pattern)
  - Color bleeding effects at section boundaries
  - Artistic blob shapes as background accents

## References

### Required Inclusions
None — this pass uses only original content.

### Design Inspiration Sources
- **Direction**: "Research watercolor-themed web design — soft washes, ink splatter effects, artistic brush strokes, purple/teal/rose palettes, paper textures"
  - Look for: watercolor gradients, ink effects, brush-style borders, artistic layout
  - Avoid: sharp edges, geometric precision, notebook/lined-paper aesthetics

## Technologies
- **Rough.js** v4.6.6 — Organic hand-drawn shapes and borders
  - CDN: `https://cdn.jsdelivr.net/npm/roughjs@4.6.6/bundled/rough.min.js`
- **Anime.js** v3.2.2 — Continuous ambient watercolor bleed animations
  - CDN: `https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.2/anime.min.js`
- **Google Fonts** — Kalam, Patrick Hand, Quicksand
  - `https://fonts.googleapis.com/css2?family=Kalam:wght@700&family=Patrick+Hand&family=Quicksand:wght@500;600&display=swap`

## Style

### Style Group: Hand-Drawn Style
Watercolor-and-ink interpretation. Artistic, flowing, organic. Every element feels painted rather than drawn — soft washes of color, ink splatters, and brush strokes.

### Orchestrator-Assigned Core Flags
| Flag | Value | Rationale |
|------|-------|-----------|
| Layout Archetype | `dashboard-grid` | Mosaic of watercolor-washed content tiles |
| Navigation Model | `floating-fab-menu` | Artistic floating button that blooms into nav |
| Information Density | `medium-balanced` | Artistic spacing with watercolor room to bleed |
| Animation Philosophy | `continuous-ambient` | Ink drips, watercolor bleeds, slow color shifts |
| Color Temperature | `analogous-gradient` | Purple → teal → rose gradient washes |

### Subagent Uniqueness Flags
_To be completed by the subagent after design execution._

## Core Application Requirements
Full 10-view Idea Management Platform with interactive mock elements, responsive design, and standard mock data sets.
