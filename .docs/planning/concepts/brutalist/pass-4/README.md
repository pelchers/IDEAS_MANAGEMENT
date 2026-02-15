# Brutalist Pass 4 — Construction-Zone Blueprint

## Concept Overview

This pass reimagines the idea management platform as a **civil engineering project command center**, specifically channeling the aesthetic of architectural blueprints and construction site signage. The entire interface sits on a dark navy (#0c1a2e) blueprint background with subtle grid lines that pulse as an ambient animation, creating the feeling of an active technical drawing surface.

Safety orange (#ff6600) serves as the primary accent — used for callouts, dimension annotations, active states, and warning-level emphasis — while white (#ffffff) and light blue-gray (#e8edf3) carry body text and structural elements. The overall tone is harsh, structural, and unapologetically utilitarian: zero border-radius, stencil-style typography, dashed measurement outlines on hover, and caution-stripe patterns throughout.

## Content Persona: Civil Engineering Firm

All fake data is themed around **Meridian Civil**, a fictional civil engineering firm managing large infrastructure projects:

- **Projects**: Bridge construction, tunnel boring, seawall retrofits, runway extensions, water mains, levee reinforcement
- **Tasks**: Concrete pours, rebar installation, soil compaction tests, crane lift plans, survey alignments
- **Metrics**: Cubic meters of concrete, crew counts, safety incidents (YTD), budget utilization
- **People**: Engineers (R. Vasquez, K. Nakamura), field crew (M. Chen, A. Okafor, T. Brennan)
- **Documents**: DWG drawings, geotechnical reports, method statements, risk matrices

## Uniqueness Profile

| Property | Value | Implementation |
|----------|-------|----------------|
| shellMode | top-bar-minimal | Fixed 52px top bar with brand, nav, and site metadata |
| navPattern | icon-only-row | 10 SVG icon buttons in a horizontal row, centered in the top bar |
| contentFlow | auto-fit-tile-grid | CSS Grid with `auto-fit` and `minmax(220px, 1fr)` for dashboard tiles |
| scrollMode | standard-scroll | Native scrolling with IntersectionObserver-triggered reveals |
| alignment | center | Nav centered in topbar, content centered in viewport |
| density | dense | Tight 12px gaps, compact padding, measurement-style layouts |
| componentTone | hard | No border-radius, sharp edges, industrial aesthetic |

## Interaction Design

Every interaction specified in the profile has been implemented:

| Interaction | Implementation |
|-------------|---------------|
| **buttonHover** (background-fill-expand) | CSS `::before` pseudo-element with `scaleX(0)` to `scaleX(1)` transition, white fill expanding from center |
| **buttonClick** (press-down-shadow-remove) | `:active` removes box-shadow and translates button 3px down/right, simulating a press into the surface |
| **cardHover** (dashed-outline-appear) | CSS `::before` at `inset: -6px` with dashed border transitioning from transparent to orange |
| **pageTransition** (blueprint-unfold) | CSS `@keyframes unfold` using `perspective(800px) rotateX(-8deg)` origin top, simulating a blueprint being unrolled |
| **scrollReveal** (fade-in-with-grid-snap) | Anime.js staggered opacity + translateY animation (80ms stagger), elements snap into grid position |
| **navItemHover** (caution-stripe-underline) | CSS `::after` pseudo with diagonal repeating-linear-gradient in orange/navy expanding from center |
| **navItemActive** (orange-badge-marker) | CSS `::before` pseudo as 8px orange circle at top-right + solid orange underline |
| **inputFocus** (dimension-annotation-border) | Orange border with background-image lines at top and bottom edges simulating dimension arrows, plus `<-->` annotation in label |
| **toggleSwitch** (lever-pull-horizontal) | 48x22px box with 14x14px lever sliding from left to right with cubic-bezier easing, orange fill on active |
| **tooltips** (callout-annotation-line) | Fixed-position tooltip with annotation text box + 12px vertical line connecting to trigger element |
| **loadingState** (construction-barrier-pulse) | Three caution-stripe bars pulsing in sequence (0.2s stagger) with "INITIALIZING SITE COMMAND" label |
| **idleAmbient** (grid-subtle-pulse) | CSS `@keyframes gridPulse` on body background-size oscillating between 24px and 25px over 8s |
| **microFeedback** (checkmark-stamp-orange) | SVG checkmark with stroke-dashoffset draw animation + "APPROVED" stamp text, scales in and fades out |

## View-Specific Design

1. **Dashboard** — Stat tiles with stencil-type values, unit annotations, and mini-gantt phase schedule. Blueprint data table for dispatches.
2. **Projects** — Gantt-chart timeline strips with month columns and colored phase bars on a gridded background.
3. **Project Workspace** — Blueprint drafting table with SVG technical drawings (pier cap, abutment) and a dimension/materials sidebar.
4. **Kanban** — Drag-sortable cards on blueprint graph paper with zone markers (A/B/C/D) as column headers.
5. **Whiteboard** — Technical drawing canvas with ruler edges, Rough.js hand-drawn connector lines, and snap-to-grid nodes.
6. **Schema Planner** — Wiring-diagram layout with terminal blocks (tables) connected by Rough.js traced wire paths with pin connectors.
7. **Directory Tree** — Site-plan hierarchy with indented entries, reference numbers, and document type annotations.
8. **Ideas** — Bubble chart with circles sized by importance on a grid with IMPACT/FEASIBILITY axes.
9. **AI Chat** — Radio-dispatch format with callsign headers (CMD-BASE, FIELD-07), timestamps, channel frequency labels, and monospace message blocks.
10. **Settings** — Step-through wizard with 5 numbered construction phases, each as a blueprint section with completion status.

## Library Usage

| Library | Version | Purpose |
|---------|---------|---------|
| **Anime.js** | 3.2.2 | Staggered scroll-reveal animations for tile grids and list items. Provides precise control over grid-snap timing. |
| **Rough.js** | 4.6.6 | Hand-drawn connector lines on the whiteboard canvas and wire paths in the schema planner. Creates organic imperfection that contrasts with the rigid blueprint grid. |
| **SortableJS** | 1.15.6 | Drag-and-drop reordering for kanban cards across zone columns. Updates zone counts on drop. |
| **Splitting.js** | 1.0.6 | Character-level text splitting on page titles for per-character entrance animations (snap-in from below). |

## Anti-Repeat Compliance

- Pass 1 used light paper bg with red accent: this pass uses dark navy (#0c1a2e) with orange (#ff6600)
- Pass 2 used newspaper manifesto columns: this pass uses auto-fit tile grid with blueprint aesthetics
- Pass 3 used black terminal with green text: this pass uses navy blueprint with white grid
- Pass 3 used ASCII charts and CLI formatting: this pass uses blueprint annotations, dimension lines, and SVG drawings
- Pass 2 used memo-format chat, Pass 3 used REPL chat: this pass uses radio-dispatch format with callsigns and channel frequencies

## Inspiration Cross-References

- **Figma**: Dot-grid / graph-paper background for entire viewport; content blocks with visible dimension labels like objects on a design canvas
- **Miro**: Whiteboard view with spatial node arrangement and Rough.js connector lines between related blocks
- **ArchDaily**: Architectural-drawing annotations (dimension lines, material callouts, leader-line labels) on workspace view and throughout spec-sheet-style metadata grids
