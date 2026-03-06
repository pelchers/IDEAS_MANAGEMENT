# Editorial Style — Pass 1

## Overview
Magazine-inspired editorial design for a productivity tool. Large-format typography, generous margins, pull-quote aesthetics, and an art-directed content hierarchy. Each view feels like a beautifully typeset page spread. Warm, sophisticated palette with cream backgrounds and serif headings. Scroll-driven parallax reveals content like turning magazine pages.

### Pages
- **Page: Main** (`index.html`) — Single-page app with view switching
  - All 10 views: Dashboard, Projects, Workspace, Kanban, Whiteboard, Schema, Directory Tree, Ideas, AI Chat, Settings

## Design Language

- **Colors**:
  - Primary: `#2C1810` — Rich dark brown
  - Secondary: `#D4A574` — Warm tan
  - Accent: `#8B4513` — Saddle brown for accents
  - Background: `#FAF5EE` — Warm cream
  - Surface: `#FFFFFF` — White for cards
  - Text: `#2C1810` — Dark brown text
  - Highlight: `#C17817` — Gold for highlights and links

- **Typography**:
  - Headings: Cormorant Garamond (600, 700) — Elegant editorial serif
  - Body: Lora (400, 500) — Readable serif for body
  - Accent: Montserrat (400, 600) — Sans-serif for labels and metadata

- **Visual Elements**:
  - Large-format typography (h1 at 48-72px)
  - Drop caps on content sections
  - Pull-quote styling for highlighted data
  - Wide margins with asymmetric content placement
  - Thin decorative rules and ornamental dividers
  - Full-width section headers with oversized type

## References

### Required Inclusions
None — this pass uses only original content.

### Design Inspiration Sources
- **Direction**: "Research editorial magazine web design — large serif typography, cream/warm palettes, pull-quotes, art-directed content hierarchy with generous whitespace"
  - Look for: magazine-style typography, drop caps, pull-quotes, art-directed layouts
  - Avoid: geometric/sans-only type, cold palettes, dense data layouts

## Technologies
- **GSAP** v3.12.5 + ScrollTrigger — Magazine-page parallax reveals
  - CDN: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`
  - Plugin: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js`
- **Splitting.js** v1.0.6 — Per-character text animation for headings
  - CDN: `https://unpkg.com/splitting@1.0.6/dist/splitting.min.js`
  - CSS: `https://unpkg.com/splitting@1.0.6/dist/splitting.css`
- **Google Fonts** — Cormorant Garamond, Lora, Montserrat
  - `https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Lora:wght@400;500&family=Montserrat:wght@400;600&display=swap`

## Style

### Style Group: Editorial Style
Magazine-grade art direction applied to software. Typography is the star — large serifs, drop caps, pull-quotes, and editorial spacing. Content is composed like page spreads, not stacked widgets. The design communicates sophistication and editorial authority.

### Orchestrator-Assigned Core Flags
| Flag | Value | Rationale |
|------|-------|-----------|
| Layout Archetype | `magazine-editorial` | Art-directed page spreads with wide margins |
| Navigation Model | `sticky-top-bar` | Slim editorial masthead nav |
| Information Density | `low-whitespace-generous` | Magazine-level breathing room |
| Animation Philosophy | `scroll-reveal-parallax` | Content reveals like turning pages |
| Color Temperature | `warm-dominant` | Cream, brown, gold — warm, sophisticated |

### Subagent Uniqueness Flags
_To be completed by the subagent after design execution._

## Core Application Requirements
Full 10-view Idea Management Platform with interactive mock elements, responsive design, and standard mock data sets.
