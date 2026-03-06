# Minimalism — Pass 1

## Overview
A stripped-back, breath-of-air take on the Idea Management platform. Every pixel earns its place through purposeful restraint. Generous whitespace, a single accent color, and ultra-clean type create a calm, focused workspace. The design channels Dieter Rams — "less, but better" — applied to a productivity tool.

### Pages
- **Page: Main** (`index.html`) — Single-page app with view switching
  - View: Dashboard (`#dashboard`) — Project stats, activity timeline, health indicators
  - View: Projects (`#projects`) — Grid of project cards, search/filter bar
  - View: Workspace (`#workspace`) — Split pane: file tree left, content right
  - View: Kanban (`#kanban`) — Multi-column board with draggable cards
  - View: Whiteboard (`#whiteboard`) — Infinite canvas with toolbar
  - View: Schema (`#schema`) — Entity relationship diagram
  - View: Directory Tree (`#directory-tree`) — Expandable folder structure
  - View: Ideas (`#ideas`) — Capture form + idea cards
  - View: AI Chat (`#ai-chat`) — Message thread with input area
  - View: Settings (`#settings`) — Tabbed settings panels

## Design Language

- **Colors**:
  - Primary: `#111111` — Near-black for text and primary surfaces
  - Secondary: `#F5F5F5` — Off-white backgrounds
  - Accent: `#0066FF` — Single blue accent for CTAs and active states
  - Background: `#FFFFFF` — Pure white base
  - Surface: `#FAFAFA` — Subtle card surfaces
  - Text: `#333333` — Body text
  - Muted: `#999999` — Secondary text and borders

- **Typography**:
  - Headings: Inter (600, 700) — Google Fonts
  - Body: Inter (400, 500) — Google Fonts
  - Mono: JetBrains Mono (400) — Code blocks and schema fields

- **Visual Elements**:
  - Hairline borders (1px, `#E5E5E5`) for separation
  - No shadows — flat, borderless cards
  - 8px grid system throughout
  - Single-pixel focus rings for accessibility

## References

### Required Inclusions
None — this pass uses only original content.

### Design Inspiration Sources
- **Direction**: "Research ultra-minimal dashboard interfaces with persistent sidebar navigation, monochromatic palettes, and generous negative space"
  - Look for: clean data cards, subtle hover states, quiet typography
  - Avoid: gradients, decorative elements, busy backgrounds

### Reference Discoveries
- **Linear** (linear.app) — Persistent sidebar with icon+label nav, monochromatic palette, hairline borders for separation, single accent color for active states. Adapted: sidebar layout structure, border-only card containers, nav link active indicator.
- **Vercel Dashboard** (vercel.com/dashboard) — Near-black on white, stat cards with single metrics and trends, minimalist form inputs. Adapted: stat card layout, input focus states, toggle switch design.
- **Notion** (notion.so) — Workspace split pane with tree nav, breadcrumbs, clean editor interface, expandable trees. Adapted: file tree expand/collapse, breadcrumb component, editor body hierarchy.

## Technologies
- **GSAP** v3.12.5 — Subtle micro-interaction animations (card hover lift, view fade-in, message appearance)
  - CDN: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`
- **Chart.js** v4.4.7 — Dashboard activity line chart
  - CDN: `https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js`
- **SortableJS** v1.15.6 — Kanban card drag-and-drop between columns
  - CDN: `https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.6/Sortable.min.js`
- **Google Fonts** — Inter, JetBrains Mono
  - `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap`

## Files
```
pass-1/
├── index.html
├── style.css
├── app.js
├── README.md
└── validation/
    ├── handoff.json
    ├── inspiration-crossreference.json
    ├── report.playwright.json
    ├── desktop/
    └── mobile/
```

## Style

### Style Group: Minimalism
Absolute restraint as an aesthetic principle. Every element is stripped to its functional essence — no decoration, no gradients, no shadows unless they serve a clear UX purpose. The beauty comes from proportion, spacing, and typographic precision. Color is used as a surgical accent, never as fill.

### Orchestrator-Assigned Core Flags
| Flag | Value | Rationale |
|------|-------|-----------|
| Layout Archetype | `sidebar-driven` | Persistent left rail provides quiet, always-visible navigation |
| Navigation Model | `persistent-left-rail` | Thin vertical nav with icon + label, never collapsed |
| Information Density | `low-whitespace-generous` | Minimalism demands breathing room |
| Animation Philosophy | `subtle-micro-interactions` | Tiny, precise transitions (opacity, translate) — never flashy |
| Color Temperature | `monochromatic` | Near-black + white + single blue accent |

### Subagent Uniqueness Flags
| Flag | Value | Rationale |
|------|-------|-----------|
| Grid System | `8px-spatial-grid` | All spacing follows 8px multiples for mathematical precision |
| Card Style | `borderless-hairline-separators` | 1px #E5E5E5 borders, zero box-shadows, flat surfaces |
| Interaction Pattern | `hover-reveal-lift` | Cards lift 2px on hover via GSAP translateY, border turns accent blue |
| Icon Approach | `svg-line-icons-1-5px-stroke` | Hand-crafted SVG icons with 1.5px strokes, no icon library |
| Data Density | `sparse-one-metric-per-card` | Each stat card shows one number with label and trend |
| Nav Width | `220px-persistent` | Fixed sidebar at 220px, never collapses on desktop |
| Chart Library | `chart-js-line-chart` | Chart.js for activity line chart with subtle fill |
| Drag Library | `sortablejs-kanban` | SortableJS for cross-column card dragging |

## Core Application Requirements

### Target Application
- **App**: Idea Management Platform
- **View/Context**: Full 10-view application (Dashboard, Projects, Workspace, Kanban, Whiteboard, Schema, Directory Tree, Ideas, AI Chat, Settings)
- **Transfer Intent**: Component extraction and aesthetic direction for production implementation

### Functional Frontend Requirements
- Dashboard: stat cards with project counts, activity feed with timestamps, chart placeholder
- Projects: grid/list toggle, search bar, sort dropdown, project cards with name/status/date
- Workspace: resizable split pane, file tree with expand/collapse, breadcrumbs
- Kanban: columns (Backlog, In Progress, Review, Done), cards with title/assignee/priority
- Whiteboard: canvas with toolbar (select, draw, text, shape), zoom controls
- Schema: entity boxes with field lists, relationship lines, add entity button
- Directory Tree: nested folder/file icons, expandable nodes, path breadcrumb
- Ideas: text input + submit button, idea cards with tags/priority/link-to-project
- AI Chat: message bubbles, typing indicator, context panel, send button
- Settings: tabs (Profile, Billing, Preferences, Integrations), form inputs, toggle switches

### Mock Data Requirements
- Projects: 6 items with name, description, status (active/archived), last updated date
- Kanban cards: 12 cards across 4 columns with title, assignee, priority label
- Ideas: 8 items with title, description, tags, priority, linked project
- Chat messages: 6 messages alternating user/AI with timestamps
- Activity feed: 10 recent actions with type, user, timestamp
