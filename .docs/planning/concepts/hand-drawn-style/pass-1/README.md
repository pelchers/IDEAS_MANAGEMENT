# Hand-Drawn Style — Pass 1

## Overview
A warm, sketchbook-inspired interface that feels hand-crafted. Rough borders, wobbly lines, notebook paper textures, and handwritten-style fonts create an approachable, playful workspace. The split-pane layout has a sketch-notebook left panel and a canvas-like right panel. Bottom tab navigation uses hand-drawn icons. Warm earthy palette with pencil-gray accents.

### Pages
- **Page: Main** (`index.html`) — Single-page app with view switching
  - All 10 views: Dashboard, Projects, Workspace, Kanban, Whiteboard, Schema, Directory Tree, Ideas, AI Chat, Settings

## Design Language

- **Colors**:
  - Primary: `#3D3D3D` — Pencil gray
  - Secondary: `#F4E9D8` — Aged paper
  - Accent: `#E07B39` — Warm orange (colored pencil)
  - Background: `#FBF6EF` — Light parchment
  - Surface: `#FFFFFF` — White sketchbook page
  - Text: `#2D2D2D` — Dark pencil
  - Highlight: `#5B8C5A` — Forest green for success/active

- **Typography**:
  - Headings: Caveat (700) — Google Fonts — handwritten style
  - Body: Nunito (400, 600) — Rounded, friendly sans
  - Mono: Courier Prime (400) — Typewriter feel for code

- **Visual Elements**:
  - Rough.js hand-drawn borders on cards and containers
  - Notebook paper line texture (CSS background)
  - Doodle-style icons and decorative elements
  - Wobbly, imperfect element edges
  - Pencil-sketch style shadows (scribble effect)
  - Tape/pin/clip decorative accents on cards

## References

### Required Inclusions
None — this pass uses only original content.

### Design Inspiration Sources
- **Direction**: "Research hand-drawn/sketch-style web interfaces — notebook textures, Rough.js borders, handwritten fonts, warm earthy palettes, doodle decorations"
  - Look for: wobbly borders, notebook paper backgrounds, hand-drawn icons, warm earth tones
  - Avoid: sharp geometric precision, cold palettes, corporate aesthetics

## Technologies
- **Rough.js** v4.6.6 — Hand-drawn/sketchy borders and shapes
  - CDN: `https://cdn.jsdelivr.net/npm/roughjs@4.6.6/bundled/rough.min.js`
- **GSAP** v3.12.5 — Hover expand effects (cards wobble/grow on hover)
  - CDN: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`
- **Google Fonts** — Caveat, Nunito, Courier Prime
  - `https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Nunito:wght@400;600&family=Courier+Prime&display=swap`

## Style

### Style Group: Hand-Drawn Style
Organic, imperfect, human. Every element looks hand-crafted — wobbly borders, sketch textures, handwritten type. The interface feels like opening a creative person's notebook. Warm and approachable, never clinical.

### Orchestrator-Assigned Core Flags
| Flag | Value | Rationale |
|------|-------|-----------|
| Layout Archetype | `split-pane` | Notebook left panel + canvas right panel |
| Navigation Model | `bottom-tabs` | Hand-drawn icon tabs at bottom |
| Information Density | `low-whitespace-generous` | Sketchbook breathing room |
| Animation Philosophy | `hover-expand-transform` | Cards wobble and grow on hover |
| Color Temperature | `warm-dominant` | Pencil grays, warm paper, orange/green accents |

### Subagent Uniqueness Flags
_To be completed by the subagent after design execution._

## Core Application Requirements
Full 10-view Idea Management Platform with interactive mock elements, responsive design, and standard mock data sets.
