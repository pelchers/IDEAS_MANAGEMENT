# Brutalist Pass 7 — Punched-Card-Data-Wall

## Variant Seed
`punched-card-data-wall`

## Design Concept

This concept reimagines the IDEA-MANAGEMENT platform as a **mainframe operator console** inspired by 1970s punched card data processing systems. Every piece of information is presented as a discrete data cell — a rectangular "punched card" — on a massive data visualization wall. The interface feels like staring at a floor-to-ceiling readout in a room-sized computer lab.

### Core Metaphor
The punched card serves as the atomic UI component. Each card has a header strip (dark bar with reference number and label), a body area for data fields, and an optional footer with metadata and actions. Cards are arranged in rigid rectangular grids ("data walls") that fill the screen with dense, monospaced information.

### Shell Architecture
- **Top tab strip**: Browser-like tabs across the top edge, styled as a physical tab row on a terminal workstation
- **Brand area**: Left-locked system identifier with online status indicator
- **Clock/operator meta**: Right-side system clock and operator ID
- **Full-width panels**: Each view occupies the entire panel area below the tab strip

### Visual Language
- **Zero border-radius** throughout — every element is a hard rectangle
- **Reference numbers** on all major components (STAT-001, KBN-003, ENT-002, etc.)
- **Monospaced field labels** in accent color to distinguish keys from values
- **Dotted/dashed separators** between data rows for scanline readability
- **4px left border strip** on every punch card for visual anchoring
- **Subtle scanline overlay** across the entire viewport (1px lines at low opacity)

### Typography
- **Headings**: Courier Prime — the authoritative typewriter face for major labels
- **Body**: IBM Plex Mono — readable monospace for dense data presentation
- **Code/refs**: Fira Code — technical reference numbers, field keys, metadata

### Color Palette
| Token   | Value   | Usage                              |
|---------|---------|------------------------------------|
| bg      | #f0ece4 | Page and card background (warm off-white) |
| text    | #0d0d0d | Primary text, tab strip, headers   |
| surface | #ddd6c8 | Card backgrounds, secondary surfaces |
| accent  | #cc4400 | Reference numbers, primary actions, HIGH priority |
| accent2 | #003399 | Links, foreign keys, MEDIUM priority |
| border  | #2a2a2a | All borders, card headers, dark bars |

### Interaction Model
- **Button hover**: Instant color inversion (0ms transition) — black bg, white text
- **Button click**: Border flashes accent color for 100ms
- **Card hover**: 1px rightward shift with hard drop shadow appearing
- **Tab navigation**: Horizontal slide animation between panels (200ms)
- **Input focus**: 3px solid accent border, no easing
- **Toggle switches**: Binary 0/1 display that snaps between states
- **Tooltips**: Monospace boxes with "REF::" prefix
- **Idle ambient**: Subtle CSS scanline effect across the viewport

### Navigation
- Alt+1 through Alt+0 keyboard shortcuts for all 10 tabs
- Click any tab to slide to that panel
- Quick action buttons on dashboard navigate to relevant views
- Breadcrumb navigation in workspace view
- Settings sub-tabs for internal section switching

## Views Implemented (10 of 10)
1. **Dashboard** — Greeting bar, 6 stat cards in data wall grid, activity log, quick actions
2. **Projects** — Search/filter toolbar, 4 project cards with full metadata fields
3. **Project Workspace** — Left folder navigation tree, right-side project.json metadata display
4. **Kanban** — 4 columns (Backlog/In Progress/Review/Done) with 2-3 cards each
5. **Whiteboard** — Toolbar, 5 containers with text blocks, SVG connection lines
6. **Schema Planner** — 5 entity nodes (User, Project, Idea, KanbanCard, AuditLog) with fields and relations
7. **Directory Tree** — Template selector, generated file tree, structure summary
8. **Ideas** — Quick capture form, filterable list with 5 ideas, Promote to Kanban functionality
9. **AI Chat** — 8-message conversation with tool actions (add_idea, update_kanban, generate_tree)
10. **Settings** — 5 sub-sections: Account, Subscription (Free/Pro/Team), Preferences, Integrations, Data

## Responsiveness
- Desktop optimized for 1536px width
- Fully responsive at 390px with:
  - Stacked single-column layouts
  - Horizontal-scrolling tab strip
  - Collapsed whiteboard/schema to vertical card lists
  - Single-column plan cards
  - Horizontal settings sub-tabs

## Libraries Used
- **Google Fonts**: Courier Prime, IBM Plex Mono, Fira Code
- No external CSS frameworks
- No JavaScript libraries — all vanilla JS

## Files
- `index.html` — Complete single-page application with all 10 views
- `style.css` — Full responsive stylesheet (desktop + mobile)
- `app.js` — Navigation, interactions, clock, tooltips, chat simulation
- `validation/handoff.json` — Structured handoff metadata
- `validation/inspiration-crossreference.json` — Design references
