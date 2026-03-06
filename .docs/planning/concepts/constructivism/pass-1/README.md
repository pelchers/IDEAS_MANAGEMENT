# Constructivism — Pass 1

## Overview
Soviet-era constructivist propaganda meets modern UI. Bold diagonal compositions, red/black/white palette with warm gold accents, geometric shapes as structural elements, and typography as visual architecture. Navigation uses a floating action menu inspired by constructivist poster composition — elements placed at dynamic angles with strong directional energy.

### Pages
- **Page: Main** (`index.html`) — Single-page app with view switching
  - All 10 views: Dashboard, Projects, Workspace, Kanban, Whiteboard, Schema, Directory Tree, Ideas, AI Chat, Settings

## Design Language

- **Colors**:
  - Primary: `#CC0000` — Revolutionary red
  - Secondary: `#1A1A1A` — Deep black
  - Accent: `#D4A017` — Warm gold/ochre
  - Background: `#F5F0E8` — Aged paper/parchment
  - Surface: `#FFFFFF` — White blocks
  - Text: `#1A1A1A` — Black text
  - Highlight: `#CC0000` — Red highlights for active states

- **Typography**:
  - Headings: Oswald (600, 700) — Condensed, poster-style
  - Body: Source Sans 3 (400, 600) — Clean, functional
  - Accent: Bebas Neue (400) — For decorative labels and section markers

- **Visual Elements**:
  - Diagonal lines and angular compositions (15-45 degree rotations)
  - Geometric shapes (circles, triangles, rectangles) as decorative elements
  - Typography used as visual architecture — oversized, rotated text
  - Red/black/white color blocks as compositional anchors
  - Constructivist poster-style headers with dynamic angle

## References

### Required Inclusions
None — this pass uses only original content.

### Design Inspiration Sources
- **Direction**: "Research constructivist and avant-garde graphic design applied to web interfaces — diagonal compositions, bold geometric shapes, propaganda poster typography"
  - Look for: angular layouts, red/black palettes, oversized type, geometric overlays
  - Avoid: organic curves, soft pastels, photographic imagery

### Discovered References
- **Keboto** (keboto.org) — Constructivism legacy in graphic design: adapted stark color contrasts, angular geometric forms, diagonal text placement
- **DesignModo** (designmodo.com) — Diagonal lines in web design: adapted CSS skewX transforms for banner, angular hover effects, decorative triangle overlays
- **CreativePro** (creativepro.com) — Russian Constructivism and graphic design: adapted condensed typography as visual architecture, functional layered composition

## Technologies
- **GSAP** v3.12.5 + ScrollTrigger — Scroll-driven parallax reveals with diagonal motion
  - CDN: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`
  - Plugin: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js`
- **Google Fonts** — Oswald, Source Sans 3, Bebas Neue
  - `https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&family=Source+Sans+3:wght@400;600&family=Bebas+Neue&display=swap`

## Style

### Style Group: Constructivism
Geometric, angular, propagandistic. Bold diagonal compositions, stark red/black/white palettes, typography as visual architecture. Inspired by Rodchenko, Lissitzky, and Soviet-era graphic design — applied to modern interface paradigms. Every element serves both function and compositional energy.

### Orchestrator-Assigned Core Flags
| Flag | Value | Rationale |
|------|-------|-----------|
| Layout Archetype | `dashboard-grid` | Geometric grid of angular content blocks |
| Navigation Model | `floating-fab-menu` | Constructivist-inspired floating geometric nav |
| Information Density | `high-data-dense` | Dense information blocks with bold headers |
| Animation Philosophy | `scroll-reveal-parallax` | Elements slide in at diagonal angles |
| Color Temperature | `warm-dominant` | Red and gold on parchment/white/black |

### Subagent Uniqueness Flags
| Flag | Value | Rationale |
|------|-------|-----------|
| Corner Style | `sharp-zero-radius` | Zero border-radius on all elements for constructivist angular feel |
| Shadow Style | `offset-block-shadow` | Hard-offset box shadows (no blur) on hover states for graphic weight |
| Decorative Motif | `diagonal-stripes-and-geometric-overlays` | Fixed-position triangles, angled lines, and skewed banner blocks |
| Typography Treatment | `rotated-accent-labels` | Bebas Neue labels with wide letter-spacing, banner tag rotated -3deg |
| Interaction Feedback | `angular-translate-rotate` | Cards translate + rotate slightly on hover for dynamic tension |
| Card Composition | `accent-stripe-border` | Colored left stripes (6px) on stat cards, top banners on project cards |

## Core Application Requirements
Full 10-view Idea Management Platform with interactive mock elements, responsive design, and standard mock data (6 projects, 12 kanban cards, 8 ideas, 6 chat messages, 10 activity items).
