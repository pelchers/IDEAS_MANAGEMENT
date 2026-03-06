# Editorial Style — Pass 2

## Overview
Dark editorial — a moody, immersive magazine interpretation. Where Pass 1 is warm and cream, this pass channels late-night reading with dark backgrounds, light serif text, and cinematic full-bleed sections. The hamburger drawer navigation slides out as a dark panel. Page transitions use choreographed cross-fades. The palette is cool gradient blues and silvers against near-black.

### Pages
- **Page: Main** (`index.html`) — Single-page app with view switching
  - All 10 views: Dashboard, Projects, Workspace, Kanban, Whiteboard, Schema, Directory Tree, Ideas, AI Chat, Settings

## Design Language

- **Colors**:
  - Primary: `#F5F0E8` — Cream text on dark
  - Secondary: `#1A1B2E` — Deep midnight blue
  - Accent: `#6C8EBF` — Steel blue accent
  - Background: `#0D0E1A` — Near-black dark base
  - Surface: `#181A2E` — Dark card surfaces
  - Text: `#E8E4DC` — Warm cream text
  - Highlight: `#8BA8D9` — Light blue for highlights

- **Typography**:
  - Headings: Libre Baskerville (700) — Classic editorial serif
  - Body: Libre Baskerville (400) — Matching serif body
  - Accent: Outfit (400, 600) — Modern sans for UI elements

- **Visual Elements**:
  - Dark backgrounds with light serif text
  - Full-bleed section headers with subtle gradient overlays
  - Thin silver/blue decorative rules
  - Cinematic section transitions
  - Pull-quotes in italics with oversized quotation marks

## References

### Required Inclusions
None — this pass uses only original content.

### Design Inspiration Sources
- **Direction**: "Research dark-mode editorial and magazine design — moody dark backgrounds, light serif text, cinematic section reveals, silver/blue accent palettes"
  - Look for: dark editorial layouts, cinematic hero sections, serif-on-dark, gradient overlays
  - Avoid: warm palettes, light backgrounds, sans-serif-only designs

## Technologies
- **Anime.js** v3.2.2 — Choreographed page transitions and staggered reveals
  - CDN: `https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.2/anime.min.js`
- **Lenis** v1.1.18 — Premium smooth scrolling
  - CDN: `https://unpkg.com/lenis@1.1.18/dist/lenis.min.js`
- **Google Fonts** — Libre Baskerville, Outfit
  - `https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Outfit:wght@400;600&display=swap`

## Style

### Style Group: Editorial Style
Dark editorial interpretation — cinematic, moody, immersive. Typography remains the star but now on dark backgrounds. The design feels like a premium digital publication read at night.

### Orchestrator-Assigned Core Flags
| Flag | Value | Rationale |
|------|-------|-----------|
| Layout Archetype | `full-bleed-immersive` | Edge-to-edge dark sections with cinematic feel |
| Navigation Model | `hamburger-drawer` | Dark panel drawer that slides elegantly |
| Information Density | `medium-balanced` | Moderate density with editorial spacing |
| Animation Philosophy | `page-transition-choreography` | Cinematic cross-fades between views |
| Color Temperature | `analogous-gradient` | Blue-silver gradient on near-black |

### Subagent Uniqueness Flags
_To be completed by the subagent after design execution._

## Core Application Requirements
Full 10-view Idea Management Platform with interactive mock elements, responsive design, and standard mock data sets.
