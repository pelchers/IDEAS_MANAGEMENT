# Brutalist Pass 8 — grid-tile-surveillance

## Variant Overview

**Style:** Brutalist pass 8
**Variant Seed:** grid-tile-surveillance
**Persona:** surveillance-controller

A dense auto-fit tile grid inspired by CCTV surveillance dashboards. Every piece of content is treated as a discrete monitoring cell, creating an information-dense layout that echoes the relentless observation aesthetic of security control rooms.

## Uniqueness Profile

- **Profile:** dashboard-grid-tiles
- **Shell Mode:** top-bar-minimal
- **Nav Pattern:** icon-only-row
- **Content Flow:** auto-fit-tile-grid
- **Density:** dense
- **Component Tone:** hard

## Palette

| Role     | Value     |
|----------|-----------|
| bg       | `#e2ddd4` |
| text     | `#111111` |
| surface  | `#d0c9bc` |
| accent   | `#ee2200` |
| accent2  | `#1155cc` |
| border   | `#333333` |

## Typography

- **Headings:** Anton
- **Body:** Roboto Mono
- **Mono:** Fira Code

## Views Implemented

1. Dashboard
2. Projects
3. Project Workspace
4. Kanban
5. Whiteboard
6. Schema Planner
7. Directory Tree
8. Ideas
9. AI Chat
10. Settings

## Design Decisions

- **Auto-fit tile grid:** CSS `grid-template-columns: repeat(auto-fit, minmax(...))` drives the layout so tiles reflow naturally across viewport sizes, mimicking the adaptive nature of multi-monitor surveillance setups.
- **Icon-only top bar navigation:** The nav strip uses only icons, inspired by industrial control panel button strips. Each icon has a subtle recording-light indicator (small red dot) for the active view.
- **Zero border-radius everywhere:** All elements are sharp rectangles with no decorative rounding, maintaining raw structural honesty consistent with brutalist principles.
- **Dense information display:** Minimal padding and tight margins maximize visible content per screen, reinforcing the surveillance-controller persona where every pixel of screen real-estate matters.
- **No background images:** The design relies entirely on color contrast, grid structure, and typographic weight for visual impact.
- **No external libraries beyond Google Fonts:** Pure HTML/CSS/JS implementation for low-friction review.
- **Recording light indicators:** Small colored dots next to navigation icons and tile headers signal active/live states, borrowing directly from CCTV hardware UI conventions.
- **Grid-reflow transitions:** When switching views, tiles reflow with a staggered CSS transition rather than a full page swap, keeping the surveillance-dashboard feel continuous.
