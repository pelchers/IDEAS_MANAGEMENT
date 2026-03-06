# Bento — Pass 2

## Overview
A warm-toned, editorial bento interpretation. Where Pass 1 is Apple-cool and blue-accented, this pass uses warm gradients (amber to rose) across bento tiles with a magazine-editorial navigation approach. The sticky top bar provides horizontal view switching. Medium information density gives tiles more breathing room. Hover interactions expand tiles to reveal more content with smooth GSAP transitions.

### Pages
- **Page: Main** (`index.html`) — Single-page app with view switching
  - All 10 views: Dashboard, Projects, Workspace, Kanban, Whiteboard, Schema, Directory Tree, Ideas, AI Chat, Settings

## Design Language

- **Colors**:
  - Primary: `#2D2A26` — Warm dark brown
  - Secondary: `#B8860B` — Dark goldenrod
  - Accent: `#E8734A` — Warm coral-orange
  - Background: `#FBF7F2` — Warm off-white
  - Surface: `#FFFFFF` — White tiles
  - Text: `#2D2A26` — Warm dark text
  - Gradient-start: `#FFB347` — Amber gradient
  - Gradient-end: `#E8734A` — Coral gradient end

- **Typography**:
  - Headings: Plus Jakarta Sans (600, 700) — Google Fonts — modern geometric
  - Body: Plus Jakarta Sans (400, 500) — Consistent family
  - Mono: Fira Code (400) — For code and schema content

- **Visual Elements**:
  - Bento tiles with warm gradient headers
  - Rounded corners (12-16px)
  - Warm shadow (`0 4px 12px rgba(45, 42, 38, 0.06)`)
  - Amber-to-coral gradient accents on feature tiles
  - Magazine-style tile headers with large type
  - Tile expansion on hover (content reveal)

## References

### Required Inclusions
None — this pass uses only original content.

### Design Inspiration Sources
- **Direction**: "Research warm-toned bento/modular grid layouts with amber/coral gradients, editorial tile headers, and content-reveal hover interactions"
  - Look for: warm gradient tiles, editorial-style tile headers, content expansion, amber/coral palettes
  - Avoid: cool blue palettes, Apple-style minimalism, dark themes

## Technologies
- **GSAP** v3.12.5 — Tile hover-expand with content reveal transitions
  - CDN: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`
- **Chart.js** v4.4.7 — Warm-styled charts in stat tiles
  - CDN: `https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js`
- **Google Fonts** — Plus Jakarta Sans, Fira Code
  - `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Fira+Code:wght@400&display=swap`

## Style

### Style Group: Bento
Warm editorial bento interpretation. Same modular tile concept but with warm gradients, editorial typography, and content-reveal interactions. The tiles feel like magazine feature cards rather than Apple widgets.

### Orchestrator-Assigned Core Flags
| Flag | Value | Rationale |
|------|-------|-----------|
| Layout Archetype | `magazine-editorial` | Editorial-style tile headers with large type |
| Navigation Model | `sticky-top-bar` | Horizontal tab bar for view switching |
| Information Density | `medium-balanced` | More breathing room per tile |
| Animation Philosophy | `hover-expand-transform` | Tiles expand on hover to reveal content |
| Color Temperature | `analogous-gradient` | Amber → coral warm gradient palette |

### Subagent Uniqueness Flags
| Flag | Value | Rationale |
|------|-------|-----------|
| Tile Interaction | `hover-expand-with-gsap-reveal` | GSAP-driven maxHeight/opacity animation on tile hover reveals hidden content sections |
| Chart Style | `warm-gradient-fills-coral-anchors` | Chart.js line chart with amber-to-transparent gradient fill; donut uses warm palette (coral, amber, goldenrod, green, brown) |
| Nav Indicator | `gradient-underline-active-tab` | Active topbar tab features a centered gradient underline bar (amber-to-coral) that transitions in width |
| Typographic Voice | `editorial-bold-headings-medium-body` | 700-weight headings with gradient text color; 400-500 body text; consistent Plus Jakarta Sans throughout |
| Icon Language | `inline-svg-minimal` | Inline SVG icons at 16-20px, single-color fills matching context, no icon library dependency |
| Mobile Behavior | `hamburger-overlay-single-column` | Mobile nav uses full-width overlay; bento grid collapses to single column; tiles support click-to-expand |
| Gradient Usage | `top-border-accent-on-feature-tiles` | Select tiles get a 4px gradient top-border (::before); buttons and send-btn use full gradient backgrounds |

### Design Inspiration References
- **Bento Grids Gallery** — Adapted modular card grids with gradient top-border accents and medium density spacing
- **Linear App** — Adapted clean top-bar navigation with horizontal tabs and warm neutral backgrounds
- **Notion** — Adapted content-first workspace editor approach with warm off-white background temperature

## Core Application Requirements
Full 10-view Idea Management Platform with interactive mock elements, responsive design, and standard mock data sets.
