# Minimalism — Pass 2

## Overview
A top-anchored, horizontal-flow minimalist take on the Idea Management platform. Where Pass 1 uses a sidebar, this pass centers everything below a slim top bar. Content lives in balanced, centered containers with disciplined typography and a cool-toned palette. Motion is reserved for meaningful page transitions — smooth cross-fades when switching views.

### Pages
- **Page: Main** (`index.html`) — Single-page app with view switching
  - View: Dashboard (`#dashboard`) — Stats row, activity timeline, project health
  - View: Projects (`#projects`) — Card grid with filters
  - View: Workspace (`#workspace`) — Split pane with file tree
  - View: Kanban (`#kanban`) — Column board with cards
  - View: Whiteboard (`#whiteboard`) — Canvas with tools
  - View: Schema (`#schema`) — Entity diagram
  - View: Directory Tree (`#directory-tree`) — Expandable folders
  - View: Ideas (`#ideas`) — Capture + card list
  - View: AI Chat (`#ai-chat`) — Thread + input
  - View: Settings (`#settings`) — Tabbed forms

## Design Language

- **Colors**:
  - Primary: `#1A1A2E` — Deep navy for headers and key text
  - Secondary: `#E8EDF3` — Cool gray-blue backgrounds
  - Accent: `#4A90D9` — Steel blue for interactive elements
  - Background: `#F8FAFB` — Cool white base
  - Surface: `#FFFFFF` — Card surfaces
  - Text: `#2D3748` — Body text
  - Muted: `#A0AEC0` — Secondary text

- **Typography**:
  - Headings: DM Sans (500, 700) — Google Fonts
  - Body: DM Sans (400) — Google Fonts
  - Mono: Fira Code (400) — For code/schema display

- **Visual Elements**:
  - Subtle box-shadow (`0 1px 3px rgba(0,0,0,0.06)`) for card elevation
  - Rounded corners (6px) for a softer minimal feel
  - 4px grid for tight spacing precision
  - Horizontal rules as section dividers

## References

### Required Inclusions
None — this pass uses only original content.

### Design Inspiration Sources
- **Direction**: "Research clean SaaS dashboards with centered top navigation, card-based layouts with moderate density, and cool blue-gray palettes"
  - Look for: centered content containers, tab-based navigation, subtle elevation
  - Avoid: sidebars, heavy borders, warm colors

### Discovered References
- **Linear** (linear.app) — Slim top nav with horizontal tabs, cool blue-gray palette, card-based views with subtle elevation. Adapted: top bar pattern, hover lift effect, tinted status badges.
- **Notion** (notion.so) — Centered content containers, minimal chrome, file tree navigation. Adapted: centered container pattern (1280px), settings sidebar tabs, directory tree interaction.
- **Vercel Dashboard** (vercel.com/dashboard) — Monochrome palette with single accent, stats cards in horizontal row, thin dividers. Adapted: stats row pattern, 1px dividers, restrained typographic scale.

## Technologies
- **Anime.js** v3.2.2 — Page transition cross-fades and staggered card reveals
  - CDN: `https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.2/anime.min.js`
- **Google Fonts** — DM Sans, Fira Code
  - `https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Fira+Code:wght@400&display=swap`

## Files
```
pass-2/
├── index.html
├── style.css
├── app.js
├── README.md
└── validation/
```

## Style

### Style Group: Minimalism
Absolute restraint as an aesthetic principle. Every element is stripped to its functional essence — no decoration, no gradients, no shadows unless they serve a clear UX purpose. The beauty comes from proportion, spacing, and typographic precision. Color is used as a surgical accent, never as fill.

### Orchestrator-Assigned Core Flags
| Flag | Value | Rationale |
|------|-------|-----------|
| Layout Archetype | `top-bar-centered` | Slim horizontal nav, content centered below |
| Navigation Model | `sticky-top-bar` | Fixed top bar with horizontal view tabs |
| Information Density | `medium-balanced` | Moderate spacing — not sparse, not dense |
| Animation Philosophy | `page-transition-choreography` | Smooth cross-fades between views |
| Color Temperature | `cool-dominant` | Steel blues and cool grays throughout |

### Subagent Uniqueness Flags
| Flag | Value | Rationale |
|------|-------|-----------|
| Card Layout | `centered-grid-cards` | Cards arranged in centered grids with consistent sizing across views |
| Typography Scale | `restrained-scale` | Tight scale from 11px to 28px, subtle weight differences for hierarchy |
| Divider Style | `thin-horizontal-rules` | 1px horizontal rules separate content sections cleanly |
| Transition Style | `opacity-crossfade` | Opacity-based crossfade with subtle translateY for view switching |
| Interactive Elements | `subtle-hover-lift` | Cards lift 2px on hover with shadow deepening |
| Mobile Navigation | `slide-out-panel` | Right-sliding panel overlay for mobile nav with 260px width |

## Core Application Requirements

### Target Application
- **App**: Idea Management Platform
- **View/Context**: Full 10-view application
- **Transfer Intent**: Component extraction and aesthetic direction

### Functional Frontend Requirements
- All 10 views with interactive mock elements
- Dashboard stats, project cards, kanban columns, whiteboard canvas, schema entities
- Forms with visible inputs, buttons, toggles
- Responsive at desktop (1536px) and mobile (390px)

### Mock Data Requirements
- Projects: 6 items with name, description, status, date
- Kanban cards: 12 across 4 columns
- Ideas: 8 with tags and priority
- Chat messages: 6 alternating user/AI
- Activity feed: 10 recent actions
