# Mid-Century Modern Pass 7 — "Floating Dock Lounge"

## Concept Overview

**Variant Seed**: floating-dock-lounge
**Content Persona**: Showroom Curator
**Generated**: February 16, 2026

A design showroom experience where every view is treated as a museum exhibit. The interface centers around a floating dock bar at the bottom of the screen — like a mid-century credenza hovering just above the floor — while content occupies a single centered panel above it. Each view is introduced with an exhibit label (A through J) and presented with museum-quality specimen cards.

## Design Philosophy

The "showroom-curator" persona guides every decision. Cards are specimen displays. Data uses museum-quality labeling with monospaced uppercase category headers. The palette derives from warm amber lighting paired with forest green accents — the two signature colors of a curated furniture showroom. Typography pairs Playfair Display (authoritative, editorial) with Source Serif 4 (warm, readable) for a high-end catalog feel.

## Architecture

- **Shell**: Floating bottom dock with pill-shaped icon buttons
- **Content Flow**: Centered single panel (max-width 960px) with vertical scroll
- **Transitions**: Spring bounce from bottom (content rises into view)
- **Reveal**: Staggered fade-up with 80ms delay per element

## Palette

| Token     | Value     | Usage                              |
|-----------|-----------|-------------------------------------|
| bg        | `#faf5eb` | Page background (warm cream)       |
| text      | `#3d2b1f` | Primary text (dark brown)          |
| surface   | `#f0e6d3` | Card backgrounds, secondary surfaces|
| accent    | `#c46b2e` | Primary interactive color (amber)  |
| accent2   | `#2d6b4f` | Secondary accent (forest green)    |
| border    | `#c4b49a` | Borders, dividers (warm tan)       |

## Typography

- **Headings**: Playfair Display (500-700 weight) — editorial authority
- **Body**: Source Serif 4 (300-600 weight) — warm readability
- **Mono**: JetBrains Mono (400-500 weight) — specimen labels and metadata

## Views (All 10)

### 1. Dashboard (Exhibit A)
Gradient hero card with amber-to-green sweep holding 4 key stats. Below: 2-column grid with activity timeline (5 items) and quick action buttons, followed by a full-width project progress card with percentage bars.

### 2. Projects (Exhibit B)
Toolbar with pill search bar, filter pills (All/Active/Archived), and Create New Project button. 2-column grid of 6 project cards showing status dots, descriptions, tech stack tags, collaborator counts, and update timestamps.

### 3. Project Workspace (Exhibit C)
Sidebar-main layout. Left: sticky folder navigation panel. Right: metadata grid card (name, slug, status, description, tech stack, tags, collaborators, goals) plus task checklist with priority badges and checkable items.

### 4. Kanban (Exhibit D)
4-column board: Backlog (3 cards), In Progress (2), Review (2), Done (3). Cards have label badges, descriptions, priority indicators, assignees, and due dates. Full drag-and-drop support with column count updates and toast feedback.

### 5. Whiteboard (Exhibit E)
Centered pill toolbar with select/container/text/line/zoom tools. White canvas with 5 positioned nodes connected by SVG dashed lines. Nodes are draggable with mouse events.

### 6. Schema Planner (Exhibit F)
6 entity cards (User, Project, Idea, KanbanCard, KanbanColumn, AuditLog) positioned on a canvas with SVG curved connection paths. Each entity has typed field lists with PK/FK badges.

### 7. Directory Tree (Exhibit G)
Generate/Preview/Export toolbar. Expandable folder tree for a wavz-fm project structure with nested folders (src, components, hooks, convex, public) and individual files. Toggle arrows for open/close with CSS transitions.

### 8. Ideas (Exhibit H)
Quick-capture form at top with text input, priority select, tag input, and capture button. Below: 6 idea cards in a vertical list with title, description, tags, priority badge, and Promote to Kanban button. Promoted cards get dashed borders and a promoted badge.

### 9. AI Chat (Exhibit I)
6-message conversation (3 user, 3 AI) in a scrollable container. AI messages include tool action blocks (add_idea, update_kanban, generate_tree) with monospace detail fields. One message includes a dark-themed code block showing a generated directory structure. Bottom input bar with pill text field and circular send button.

### 10. Settings (Exhibit J)
5 grouped panels: Account (name, email, avatar), Subscription (Free/Pro/Team comparison cards with current badge), Preferences (4 toggle switches), Integrations (GitHub/Slack/Figma with connection status), Data & Privacy (export and danger zone).

## Interaction Profile

| Interaction       | Behavior                                                  |
|-------------------|----------------------------------------------------------|
| Button Hover      | Warm glow shadow expands, color deepens                  |
| Button Click      | Scale 0.97 -> 1.02 -> 1.0 spring sequence               |
| Card Hover        | Lift with warm shadow bloom, subtle 0.5deg rotation      |
| Page Transition   | Spring bounce from bottom (translateY 30px -> 0)         |
| Scroll Reveal     | Fade up with staggered 80ms delay per item               |
| Nav Item Hover    | Pill background fades in with warm tint                  |
| Nav Item Active   | Pill filled with accent color, icon turns white          |
| Input Focus       | Warm golden border + 3px amber glow ring                 |
| Toggle Switch     | Smooth slide with spring overshoot on thumb              |
| Loading State     | Three bouncing dots in organic rhythm                    |
| Idle Ambient      | Subtle warm light flicker via opacity variation          |
| Micro Feedback    | Toast notification with warm pulse                       |

## Differentiation from Previous Passes

### vs Pass 1 (Credenza Shelf)
Pass 1 used a horizontal shelf navigation with walnut panel textures. Pass 7 uses a floating bottom dock with pill icons, no wood textures, and a museum specimen aesthetic.

### vs Pass 2 (Saarinen Tulip)
Pass 2 featured radial hub-spoke layout with orbital ring navigation and atomic starburst decorations. Pass 7 uses a simple dock-and-centered-panel model.

### vs Pass 3 (Girard Textile)
Pass 3 used overlapping collage cards with textile patterns and carousel animations. Pass 7 uses clean non-overlapping panels with generous whitespace.

### vs Pass 4 (Noguchi Sculpture)
Pass 4 employed extreme negative space with hidden hamburger nav. Pass 7 shows always-visible dock navigation and fills space with warm gradient cards.

### vs Pass 5 (Danish Hygge) — Same structural profile
Both passes share the floating-bottom-dock shell mode. Key differentiators:
- **Typography**: Playfair Display + Source Serif 4 (editorial quality) vs Lora + Karla (casual warmth)
- **Palette**: Amber `#c46b2e` + Green `#2d6b4f` vs Blush `#d4927a` + Tan `#a08060`
- **Persona**: Museum showroom curator vs Danish hygge cozy studio
- **Chat**: Avatar-bubble format with tool action blocks vs letter-writing format with wax-seal timestamps
- **Projects**: Card grid with search toolbar vs bookshelf spine display
- **Motion**: Clean spring bounce (precision) vs soft curtain draw (textile warmth)

### vs Pass 6 (Pop Art Warhol)
Pass 6 used a collapsible left sidebar with accordion sections and electric pink/cyan pop art. Pass 7 returns to centered organic warmth.

## Technical Notes

- **No external JS libraries** — Pure vanilla JS with IntersectionObserver for reveals
- **CSS-only animations** — Spring curves via cubic-bezier, no GSAP dependency
- **Drag-and-drop** — Native HTML5 drag API for kanban, custom mousedown/move for whiteboard
- **Responsive breakpoints**: 1024px (tablet), 480px (mobile at 390px target)
- **Accessibility**: focus-visible outlines, reduced-motion support, ARIA labels on nav
- **Keyboard navigation**: Alt+1-9 for quick view switching, Alt+0 for Settings
