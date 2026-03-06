# Swiss Style — Pass 1

## Overview
International Typographic Style applied to software. Mathematical grid precision, Helvetica-lineage typography, asymmetric balance, and information hierarchy through size/weight/color alone. No decoration — structure IS the design. Clean, rational, and authoritative. Navigation through a persistent left rail with type-only labels.

### Pages
- **Page: Main** (`index.html`) — Single-page app with view switching
  - All 10 views: Dashboard, Projects, Workspace, Kanban, Whiteboard, Schema, Directory Tree, Ideas, AI Chat, Settings

## Design Language

- **Colors**:
  - Primary: `#0A0A0A` — Near-black
  - Secondary: `#E8E8E8` — Light gray
  - Accent: `#0057B7` — Swiss blue
  - Background: `#FFFFFF` — White
  - Surface: `#F7F7F7` — Off-white surfaces
  - Text: `#1A1A1A` — Dark text
  - Grid: `#E0E0E0` — Visible grid lines (optional toggle)

- **Typography**:
  - Headings: Helvetica Neue / system-ui (300, 700) — The Swiss standard
  - Body: Helvetica Neue / system-ui (400) — Consistent family
  - Mono: Source Code Pro (400) — For technical content

- **Visual Elements**:
  - Mathematical 12-column grid with visible grid option
  - Asymmetric layouts with intentional weight balance
  - Typography as the primary visual element
  - Minimal color — hierarchy through size and weight
  - Clean horizontal/vertical rules as structural dividers

## References

### Required Inclusions
None — this pass uses only original content.

### Design Inspiration Sources
- **Direction**: "Research Swiss/International Typographic Style in web design — mathematical grids, Helvetica typography, asymmetric balance, minimal color"
  - Look for: grid-based layouts, type-driven hierarchy, rational spacing systems
  - Avoid: decorative elements, organic shapes, serif fonts

### Adapted Reference Patterns
- **Swissted**: Uppercase small-caps labels, single accent color on neutral base, asymmetric left-heavy layouts
- **Helvetica Documentary**: Light-weight (300) display headings, bold micro-labels at 0.75rem, horizontal rules as dividers
- **Type-focused design**: Border-only cards (no shadows), monospace for technical metadata, 8px mathematical spacing unit

## Technologies
- **GSAP** v3.12.5 — Precise micro-interactions (exact pixel transitions, no easing bounce)
  - CDN: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`
- **Chart.js** v4.4.7 — Dashboard bar and doughnut charts with Swiss-styled axes
  - CDN: `https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js`
- **SortableJS** v1.15.6 — Kanban drag-and-drop between columns
  - CDN: `https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.6/Sortable.min.js`
- **System fonts** — Helvetica Neue, system-ui fallback (no Google Fonts needed)

## Style

### Style Group: Swiss Style
Mathematical precision and typographic purity. The International Typographic Style treats the grid as gospel and typography as the primary design material. No ornament, no decoration — only structure, proportion, and hierarchy.

### Orchestrator-Assigned Core Flags
| Flag | Value | Rationale |
|------|-------|-----------|
| Layout Archetype | `top-bar-centered` | Clean horizontal bar, centered content grid below |
| Navigation Model | `persistent-left-rail` | Type-only vertical nav, no icons — Swiss purity |
| Information Density | `medium-balanced` | Rational grid spacing — neither cramped nor wasteful |
| Animation Philosophy | `subtle-micro-interactions` | Precise, mathematical transitions — no flourish |
| Color Temperature | `cool-dominant` | Swiss blue accent on white/gray base |

### Subagent Uniqueness Flags
| Flag | Value | Rationale |
|------|-------|-----------|
| Grid Visibility | `toggleable-overlay` | 12-column grid can be toggled via nav footer button or Settings |
| Type Scale | `extreme-contrast` | 3rem/300wt display vs 0.75rem/700wt uppercase labels |
| Accent Usage | `surgical-minimal` | Swiss blue only on interactive elements, keys, and chart data |
| Whitespace | `generous-asymmetric` | Large left padding (64px), tight right alignment |
| Dividers | `horizontal-rules` | 1-2px horizontal lines as sole structural separators |

## Core Application Requirements
Full 10-view Idea Management Platform with interactive mock elements, responsive design, and standard mock data sets (6 projects, 12 kanban cards, 8 ideas, 6 chat messages, 10 activity items).
