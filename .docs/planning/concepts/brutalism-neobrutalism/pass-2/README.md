# Brutalism & Neobrutalism — Pass 2

## Overview
A split-pane, monochromatic brutalist interpretation. Where Pass 1 is colorful chaos, this pass is disciplined raw concrete — all grays, blacks, and whites with a single red accent. The layout uses a persistent split-pane architecture with exposed structural elements like visible grid lines, numbered sections, and construction-style labeling.

### Pages
- **Page: Main** (`index.html`) — Single-page app with view switching
  - All 10 views: Dashboard, Projects, Workspace, Kanban, Whiteboard, Schema, Directory Tree, Ideas, AI Chat, Settings

## Design Language

- **Colors**:
  - Primary: `#1A1A1A` — Dark concrete
  - Secondary: `#D4D4D4` — Light concrete
  - Accent: `#E63946` — Construction red for accents
  - Background: `#E8E8E8` — Raw concrete gray
  - Surface: `#F5F5F5` — Lighter gray for cards
  - Text: `#0D0D0D` — Near-black
  - Grid: `#C0C0C0` — Visible structural grid lines

- **Typography**:
  - Headings: Archivo Black (400) — Google Fonts — heavy, blocky
  - Body: Archivo (400, 500) — Google Fonts
  - Mono: Roboto Mono (400, 700) — For labels, codes, schema

- **Visual Elements**:
  - 2px solid borders in varying grays
  - Visible grid overlay (subtle)
  - Section numbering (01. 02. 03.)
  - Construction/blueprint labeling aesthetic
  - Monospace labels for structural elements

## References

### Required Inclusions
None — this pass uses only original content.

### Design Inspiration Sources
- **Direction**: "Research brutalist architecture-inspired web design with concrete textures, monochromatic gray palettes, exposed structural grids, and construction labeling"
  - Look for: grid overlays, section numbering, blueprint aesthetics, concrete textures via CSS
  - Avoid: colorful elements, playful elements, rounded corners

### Discovered References
- **Bejamas — Neubrutalism UI Design Trend**: Monochromatic palettes with single accent, thick borders as structure, flat surfaces
- **DesignMantic — Brutalism in Web Design Guide**: Exposed grid systems, section numbering, construction-document labeling
- **Kittl — Brutalist Design Art Style**: Raw concrete texture inspiration, anti-decoration philosophy, exposed inner workings

## Technologies
- **GSAP** v3.12.5 — Continuous ambient animations (rotating grid elements, pulsing accent lines)
  - CDN: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`
- **Google Fonts** — Archivo Black, Archivo, Roboto Mono
  - `https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;500&family=Roboto+Mono:wght@400;700&display=swap`

## Style

### Style Group: Brutalism & Neobrutalism
Anti-design as design philosophy. Thick borders, raw surfaces, aggressive type, clashing colors. This pass takes the monochromatic, architectural interpretation — exposed structure as beauty.

### Orchestrator-Assigned Core Flags
| Flag | Value | Rationale |
|------|-------|-----------|
| Layout Archetype | `split-pane` | Permanent left/right split showing structure |
| Navigation Model | `breadcrumb-trail` | Structural path-based nav with section numbers |
| Information Density | `medium-balanced` | Controlled density with structural breathing room |
| Animation Philosophy | `continuous-ambient` | Slow, rotating grid elements and pulsing lines |
| Color Temperature | `monochromatic` | All grays with single red construction accent |

### Subagent Uniqueness Flags
| Flag | Value | Rationale |
|------|-------|-----------|
| Grid System | `visible-80px-structural-overlay` | Fixed 80px background grid visible through all content, reinforcing concrete-slab modularity |
| Section Labeling | `numbered-construction-style` | 01-10 numbering on both nav items and view headers, blueprint-document aesthetic |
| Typographic Voice | `monospace-industrial-labeling` | Roboto Mono for all metadata, labels, timestamps, and structural indicators |
| Surface Treatment | `flat-concrete-with-border-accents` | Zero border-radius, zero box-shadows; 2px borders and 4px red accent stripes as only surface definition |
| Interaction Model | `state-toggle-with-gsap-entrance` | Click-based state changes (task checks, tool selection, toggles) with GSAP stagger entrance animations |
| Spatial Organization | `persistent-left-nav-with-scrollable-content` | 260px fixed left panel on desktop, slide-in overlay on mobile, scrollable right content area |

## Core Application Requirements
Same as all passes — full 10-view Idea Management Platform with interactive mock elements, responsive design, and standard mock data sets.
