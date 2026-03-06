# Swiss Style — Pass 2

## Overview
A data-dense, sidebar-driven Swiss interpretation. Where Pass 1 is airy and centered, this pass channels the dense information design of Swiss train timetables and Josef Muller-Brockmann's grid compositions. Tight spacing, monochromatic palette with surgical red accent, and a persistent sidebar for navigation. Content is packed into precise grid cells with scroll-revealing data panels.

### Pages
- **Page: Main** (`index.html`) — Single-page app with view switching
  - All 10 views: Dashboard, Projects, Workspace, Kanban, Whiteboard, Schema, Directory Tree, Ideas, AI Chat, Settings

## Design Language

- **Colors**:
  - Primary: `#000000` — Pure black
  - Secondary: `#F0F0F0` — Light gray
  - Accent: `#D72638` — Swiss red (SBB red)
  - Background: `#FAFAFA` — Near-white
  - Surface: `#FFFFFF` — White
  - Text: `#111111` — Dark text
  - Muted: `#888888` — Secondary text

- **Typography**:
  - Headings: Neue Haas Grotesk / Inter (600, 800) — Google Fonts (Inter as web equivalent)
  - Body: Inter (400, 500) — Clean, geometric
  - Mono: JetBrains Mono (400) — Technical content

- **Visual Elements**:
  - Tight 8-column grid with minimal gutters
  - Dense data tables and compact card layouts
  - Red accent used sparingly — only for active states and critical indicators
  - Rule-based hierarchy (horizontal lines separating sections)
  - Monochromatic with red as the only color

## References

### Required Inclusions
None — this pass uses only original content.

### Design Inspiration Sources
- **Direction**: "Research dense information design in Swiss style — train timetables, data-heavy grids, compact Muller-Brockmann compositions with red accent"
  - Look for: compact grids, data-dense layouts, minimal color, red-as-accent
  - Avoid: decorative elements, organic shapes, generous whitespace

## Technologies
- **AOS** v2.3.4 — Scroll-triggered reveals for data panels
  - CDN JS: `https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js`
  - CDN CSS: `https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css`
- **Chart.js** v4.4.7 — Dashboard bar chart and doughnut chart in monochrome Swiss style
  - CDN: `https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js`
- **SortableJS** v1.15.6 — Drag-and-drop for Kanban board columns
  - CDN: `https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.6/Sortable.min.js`
- **Google Fonts** — Inter, JetBrains Mono
  - `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@400&display=swap`

## Style

### Style Group: Swiss Style
Mathematical precision and typographic purity. This pass takes the dense, information-design interpretation — Swiss timetables and Muller-Brockmann data grids.

### Orchestrator-Assigned Core Flags
| Flag | Value | Rationale |
|------|-------|-----------|
| Layout Archetype | `sidebar-driven` | Dense sidebar with compact navigation labels |
| Navigation Model | `sticky-top-bar` | Secondary top bar for view context + breadcrumbs |
| Information Density | `high-data-dense` | Timetable-density — every pixel carries data |
| Animation Philosophy | `scroll-reveal-parallax` | Data panels reveal on scroll with precision timing |
| Color Temperature | `monochromatic` | Black/white/gray with single red accent |

### Subagent Uniqueness Flags
| Flag | Value | Rationale |
|------|-------|-----------|
| Grid System | `1px-gap-border-grid` | Cards and stats share 1px borders like a Swiss timetable grid — no card shadows or rounded corners |
| Typographic Hierarchy | `4-level-strict` | 24px (headings) > 16px (body) > 13px (UI labels/table data) > 11px (captions/meta) — no in-between sizes |
| Data Presentation | `compact-table-first` | Dense data tables as primary content format, JetBrains Mono for all numeric/technical columns |
| Accent Usage | `surgical-red` | #D72638 restricted to: active nav border, priority indicators, review badges, schema highlights — never decorative |
| Sidebar Design | `black-panel-220px` | Solid black sidebar with white text, red left-border accent on active item, user avatar at bottom |
| Card Style | `borderless-within-border-grid` | Cards rendered without individual borders; parent grid container provides the 1px gap-border structure |
| Interaction Model | `hover-reveal` | Subtle background shifts on hover (table rows, tree items), no dramatic animations |
| Chart Style | `monochrome-bars-with-red-hover` | Black bars for data, red highlight on hover — grayscale doughnut with red hover state |

### Discovered Design References
| Source | Key Patterns Adapted |
|--------|---------------------|
| [Ben Morris — Muller-Brockmann Grid Layout](https://www.ben-morris.com/josef-muller-brockmann-grid-based-layout-and-web-design/) | 8-column modular grid, rule-based hierarchy with horizontal dividers, dense information packing within cells |
| [Navbar Gallery — Sidebar Examples](https://www.navbar.gallery/blog/best-side-bar-navigation-menu-design-examples) | 220px sidebar width, icon + label pairing, left-border active indicator stripe |
| [Swiss Themes — Swiss Design for Web](https://swissthemes.design/insights/swiss-design-for-web-designers) | Typography as primary visual element, grid as constraint, whitespace as structure |

## Core Application Requirements
Full 10-view Idea Management Platform with interactive mock elements, responsive design, and standard mock data sets.
