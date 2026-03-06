# Constructivism — Pass 2

## Overview
A magazine-editorial interpretation of constructivism. Instead of the poster-energy of Pass 1, this pass channels Lissitzky's book design — asymmetric but controlled layouts, precise geometric accents, and editorial typography. Navigation uses bottom tabs with geometric icons. The palette shifts to high-contrast complementary colors with teal and orange accents against black.

### Pages
- **Page: Main** (`index.html`) — Single-page app with view switching
  - All 10 views: Dashboard, Projects, Workspace, Kanban, Whiteboard, Schema, Directory Tree, Ideas, AI Chat, Settings

## Design Language

- **Colors**:
  - Primary: `#0D0D0D` — Deep black
  - Secondary: `#008B8B` — Teal/cyan
  - Accent: `#FF6600` — Orange complement
  - Background: `#F2F2F2` — Light gray
  - Surface: `#FFFFFF` — White surfaces
  - Text: `#1A1A1A` — Near-black
  - Geometric: `#008B8B` — Teal for geometric accents

- **Typography**:
  - Headings: Playfair Display (700, 900) — Editorial serif
  - Body: Work Sans (400, 500) — Clean geometric sans
  - Accent: Staatliches (400) — Condensed display for labels

- **Visual Elements**:
  - Asymmetric editorial layouts with controlled white space
  - Geometric accent shapes (circles, lines) as page punctuation
  - Pull-quotes and oversized drop caps
  - Column-based content flow
  - Precise geometric borders and dividers

## References

### Required Inclusions
None — this pass uses only original content.

### Design Inspiration Sources
- **Direction**: "Research editorial/magazine layouts with constructivist geometric accents — asymmetric grids, pull-quotes, precise typography, teal/orange complementary palettes"
  - Look for: editorial column layouts, geometric accent elements, serif/sans pairings
  - Avoid: symmetrical grids, diagonal chaos, poster-style layouts

### Discovered References
- **El Lissitzky — Topology of Typography** (designmanifestos.org) — Asymmetric typographic layouts, limited palettes for impact, grid-structured layouts with geometric accents. Adapted: 2-column editorial spread, geometric punctuation, Staatliches for labels.
- **Visme — Layout Design Types of Grids** — Hierarchical freeform grids, breaking grid for energy, column-based flow. Adapted: sticky headline column, left accent bars on cards, masonry ideas grid.
- **Yes I'm a Designer — Anatomy of a Magazine Layout** — Section labels above headlines, pull-quotes, editorial white space. Adapted: Staatliches kicker labels, italic pull-quotes with accent border, header meta line.

## Technologies
- **Anime.js** v3.2.2 — Page transition choreography with geometric wipe effects
  - CDN: `https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.2/anime.min.js`
- **Chart.js** v4.4.7 — Dashboard line chart with dual teal/orange datasets
  - CDN: `https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js`
- **SortableJS** v1.15.6 — Cross-column kanban card drag-and-drop
  - CDN: `https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.6/Sortable.min.js`
- **Google Fonts** — Playfair Display, Work Sans, Staatliches
  - `https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Work+Sans:wght@400;500&family=Staatliches&display=swap`

## Style

### Style Group: Constructivism
Geometric, angular, propagandistic. This pass takes the editorial/book design interpretation — Lissitzky over Rodchenko. Controlled asymmetry, precise geometry, and editorial sophistication.

### Orchestrator-Assigned Core Flags
| Flag | Value | Rationale |
|------|-------|-----------|
| Layout Archetype | `magazine-editorial` | Asymmetric editorial columns with geometric accents |
| Navigation Model | `bottom-tabs` | Geometric icon tabs at bottom of viewport |
| Information Density | `medium-balanced` | Editorial spacing — room for typography to breathe |
| Animation Philosophy | `page-transition-choreography` | Geometric wipe/reveal transitions between views |
| Color Temperature | `high-contrast-complementary` | Teal/orange on black/white |

### Subagent Uniqueness Flags
| Flag | Value | Rationale |
|------|-------|-----------|
| Editorial Motif | `lissitzky-book-design` | Controlled asymmetry inspired by Lissitzky's editorial work rather than poster propagandism |
| Spread Layout | `headline-column-plus-content-column` | Each view uses a sticky 280px headline column paired with scrollable content column |
| Geometric Punctuation | `circles-lines-rotated-squares` | Three distinct accent shapes rotate per view as page markers |
| Typographic Hierarchy | `serif-heading-sans-body-condensed-labels` | Playfair Display for editorial gravitas, Work Sans for readability, Staatliches for labels |
| Pull-quote Style | `italic-serif-with-accent-border` | Magazine-style pull-quotes with 3px teal/orange left border |
| Card Pattern | `left-accent-bar-with-white-surface` | All cards use colored left borders (6px for projects, 4px for stat/idea cards) on white |
| Transition Style | `sequential-color-wipe` | Teal then orange wipes sweep left-to-right then exit right on view changes |
| Data Visualization | `dual-line-chart-teal-orange` | Chart.js line chart with dual datasets using the teal/orange complementary palette |
| Kanban Interaction | `sortablejs-cross-column-drag` | Full cross-column drag-and-drop with live count updates |

## Core Application Requirements
Full 10-view Idea Management Platform with interactive mock elements, responsive design, and standard mock data sets.
