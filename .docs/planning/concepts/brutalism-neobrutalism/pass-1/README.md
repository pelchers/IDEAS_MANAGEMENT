# Brutalism & Neobrutalism — Pass 1

## Overview
Raw, confrontational, unapologetic. This pass channels the spirit of exposed concrete and visible infrastructure. Thick black borders, aggressive typography, intentionally "ugly" color clashes, and deliberately broken grid layouts. The UI feels like a construction site — functional, honest, anti-polish. Neobrutalist touches add playful absurdity through oversized elements and unexpected color bursts.

### Pages
- **Page: Main** (`index.html`) — Single-page app with view switching via hash routing
  - View: Dashboard (`#dashboard`), Projects (`#projects`), Workspace (`#workspace`), Kanban (`#kanban`), Whiteboard (`#whiteboard`), Schema (`#schema`), Directory Tree (`#directory-tree`), Ideas (`#ideas`), AI Chat (`#ai-chat`), Settings (`#settings`)

## Design Language

- **Colors** (Neo Brutalism Reference Palette):
  - Primary: `#282828` — Signal Black — borders, text, shadows
  - Secondary: `#FF5E54` — Watermelon with Carrot — warm accent pop
  - Accent: `#2BBF5D` — Light Malachite — active/success states
  - Background: `#F8F3EC` — Creamy Milk — warm off-white canvas
  - Surface: `#FFFFFF` — White card surfaces with thick borders
  - Text: `#282828` — Signal Black
  - Blue: `#1283EB` — Azure Cornflower — info/link accent
  - Yellow: `#FFE459` — Lemon and Banana — highlights/badges
  - Purple: `#7B61FF` — Amethyst Bellflower — special/decorative accent

- **Typography**:
  - Headings: Space Grotesk (700) — Google Fonts — blocky, geometric
  - Body: Space Grotesk (400, 500) — Consistent with heading family
  - Mono: IBM Plex Mono (600) — For schema fields and code

- **Visual Elements**:
  - 3-4px solid black borders on everything
  - Hard drop shadows (4px offset, no blur, black)
  - Deliberately misaligned elements and broken grid
  - Oversized buttons and navigation targets
  - Raw, exposed scrollbars (styled thick)

## References

### Required Inclusions
None — this pass uses only original content.

### Design Inspiration Sources
- **Direction**: "Research neobrutalist web design with thick borders, drop shadows, clashing colors, and intentionally raw layouts"
  - Look for: chunky borders, offset shadows, playful color combos, oversized UI
  - Avoid: rounded corners, subtle gradients, polished finishes

### Reference Discoveries
- **Bejamas — Neubrutalism Web Design Trend** (`https://bejamas.com/blog/neubrutalism-web-design-trend`)
  - Adapted: 4px solid black borders, hard no-blur drop shadows, flat design with function-first approach, zero border-radius
- **NN/g — Neobrutalism: Definition and Best Practices** (`https://www.nngroup.com/articles/neobrutalism/`)
  - Adapted: 2-3 bold high-contrast colors, 24-32px padding on cards, chunky sans-serif headlines, press feedback via shadow reduction

## Technologies
- **Rough.js** v4.6.6 — Hand-drawn border effects on workspace preview and schema relation lines
  - CDN: `https://cdn.jsdelivr.net/npm/roughjs@4.6.6/bundled/rough.min.js`
- **SortableJS** v1.15.6 — Drag-and-drop for kanban cards between columns
  - CDN: `https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.6/Sortable.min.js`
- **Chart.js** v4.4.7 — Dashboard weekly activity bar chart
  - CDN: `https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js`
- **Google Fonts** — Space Grotesk (400/500/700), IBM Plex Mono (400/600)
  - `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=IBM+Plex+Mono:wght@400;600&display=swap`

## Files
```
pass-1/
├── index.html
├── style.css
├── app.js
├── README.md
└── validation/
```

## Style

### Style Group: Brutalism & Neobrutalism
Anti-design as design philosophy. Thick borders, raw surfaces, aggressive type, clashing colors. The UI deliberately rejects polish and refinement. Neobrutalist elements add humor and playfulness to the confrontational foundation — oversized buttons, unexpected color pops, deliberately broken grids.

### Orchestrator-Assigned Core Flags
| Flag | Value | Rationale |
|------|-------|-----------|
| Layout Archetype | `full-bleed-immersive` | Edge-to-edge raw blocks, no margin safety |
| Navigation Model | `hamburger-drawer` | Heavy drawer that slams open with thick borders |
| Information Density | `high-data-dense` | Pack content aggressively — brutalism doesn't waste space |
| Animation Philosophy | `hover-expand-transform` | Elements scale/rotate aggressively on hover |
| Color Temperature | `high-contrast-complementary` | 7-color neo-brutalist palette: watermelon/malachite/cornflower/lemon/amethyst on creamy milk |

### Subagent Uniqueness Flags
| Flag | Value | Description |
|------|-------|-------------|
| Border Language | `thick-solid-black-4px` | 4px solid black borders on all cards, buttons, inputs, containers |
| Shadow Style | `hard-offset-no-blur` | 4px/4px/0px black offset shadows with 6px on hover, 2px on active |
| Hover Behavior | `translate-rotate-scale` | Cards translate + rotate (-2deg to 2deg) + slight scale on hover |
| Grid Strategy | `deliberately-varied-per-view` | Each view uses a different grid approach (4-col stats, 3-col projects, 4-col kanban, 2-col ideas) |
| Typographic Tone | `all-caps-monospace-labels` | All labels/status badges use IBM Plex Mono uppercase with wide letter-spacing |
| Interactive Libraries | `sortablejs-chartjs-roughjs` | SortableJS for kanban drag-drop, Chart.js for dashboard bar chart, Rough.js for hand-drawn decorations |
| Color Clash Intensity | `aggressive-7-color-neo-brutalist` | Watermelon/Malachite/Cornflower/Lemon/Amethyst — full neo-brutalist palette on creamy milk/white/signal black |
| Scrollbar Treatment | `thick-styled-visible` | 14px wide scrollbars with signal-black thumbs on cream tracks, watermelon on hover |
| Drawer Animation | `slam-cubic-bezier` | Navigation drawer uses cubic-bezier(0.2, 0, 0, 1) for a heavy slamming feel |
| Button Press Feedback | `translate-shadow-reduction` | Buttons translate +2px on press with shadow reducing from 4px to 2px |

## Core Application Requirements

### Target Application
- **App**: Idea Management Platform
- **View/Context**: Full 10-view application (Dashboard, Projects, Workspace, Kanban, Whiteboard, Schema, Directory Tree, Ideas, AI Chat, Settings)
- **Transfer Intent**: Aesthetic inspiration and interaction pattern extraction

### Functional Frontend Requirements
- All 10 views with interactive mock elements, forms, buttons, toggles
- Dashboard stats, project cards, kanban columns, whiteboard canvas, schema entities
- Responsive at desktop (1536px) and mobile (390px)

### Mock Data Requirements
- Projects: 6 items | Kanban cards: 12 across 4 columns | Ideas: 8 | Chat: 6 messages | Activity: 10 items
