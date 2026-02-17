# Slate Pass 7 — Accordion Cavern Archive

## Variant
**accordion-cavern-archive**

## Style Family
Slate — dark stone textures, muted earth tones, carved/etched UI elements.

## Uniqueness Profile
**sidebar-accordion** — A collapsible left sidebar with grouped navigation sections using accordion expand/collapse behavior. Content area uses a split-panel detail layout for most views.

## Persona
**archivist-geologist** — The interface is themed around a geological archivist cataloging mineral specimens. Navigating the app feels like exploring an underground archive or cavern system, with geological vocabulary permeating every label and heading.

## Shell & Navigation

- **Shell Mode:** Collapsible left sidebar (260px expanded, 56px collapsed)
- **Nav Pattern:** Accordion sections — five groups (Overview, Workspace, Design, Capture, System) each with a collapsible trigger that reveals child nav links
- **Content Flow:** Split-panel detail — most views use a two-column grid with a narrower left panel (navigation/filters/metadata) and a wider right panel (primary content)
- **Scroll Mode:** Standard vertical scroll within the main content area
- **Alignment:** Left-aligned content with the fixed sidebar anchoring the layout
- **Density:** Compact — tight spacing, small font sizes, dense information display
- **Component Tone:** Hard — sharp corners (6-8px radius), crisp borders, stone-like surface textures

## Palette

| Role     | Hex       | Description                        |
|----------|-----------|------------------------------------|
| bg       | `#1a1814` | Deep cave darkness                 |
| text     | `#d4c8b0` | Warm sandstone text                |
| surface  | `#252220` | Carved stone panel backgrounds     |
| accent   | `#d4a04a` | Amber / gold ore highlights        |
| accent2  | `#6b8f71` | Mossy green secondary accent       |
| border   | `#3a3530` | Subtle stone edge borders          |

## Typography

| Role      | Family           | Weights Used     | Usage                                       |
|-----------|------------------|------------------|---------------------------------------------|
| Headings  | Cinzel           | 400, 600, 700, 900 | View titles, panel headings, nav labels, buttons |
| Body      | Lora             | 400, 500, 600, 700 | Paragraph text, descriptions, form inputs   |
| Mono      | Source Code Pro   | 400, 500, 600    | Tags, badges, code blocks, file names, status values |

## Views Implemented

1. **Dashboard** ("Chamber of Records") — Four stat cards with animated counters, split panel with recent activity list and quick-action grid, strata distribution bar chart.
2. **Projects** ("Geological Specimens") — Searchable grid of project cards with status badges, tags, and metadata. Includes a dashed "new project" card.
3. **Project Workspace** — Breadcrumb navigation, folder navigation sidebar, specimen status grid, project overview with goals checklist, tech stack tags, and milestone timeline.
4. **Kanban Board** ("Stratification Board") — Four-column board (Backlog, In Progress, Review, Done) with priority-tagged cards, assignee avatars, and category tags.
5. **Whiteboard** ("Cartography Table") — Toolbar with shape/arrow/text tools, canvas with positioned containers and SVG connection lines.
6. **Schema Planner** ("Mineral Taxonomy") — Entity-relationship diagram with positioned entity cards showing field definitions (PK/FK keys, types), connected by SVG lines with arrowheads.
7. **Directory Tree** ("Tunnel Map") — Expandable/collapsible tree structure with folder and file icons, paired with a file details panel showing path, template, creation date, and size.
8. **Ideas** ("Mineral Samples") — Split layout with a capture form (title, description, priority, project, tags) on the left and a scrollable ideas list with promote-to-kanban buttons on the right.
9. **AI Chat** ("Deep Resonance Chamber") — Chat interface with AI and user message bubbles, tool-action blocks showing simulated function calls, auto-resizing text input with send button.
10. **Settings** ("Archive Configuration") — Vertical tab navigation (Account, Subscription, Preferences, Integrations, Data) with tab-specific panels. Includes toggle switches, integration cards, subscription plan display, and danger-zone data management.

## Ambient Effects

- **Dust Motes Canvas:** A full-screen fixed canvas renders floating amber particles that drift upward with sinusoidal horizontal drift, creating a subterranean atmosphere.
- **Loading Overlay:** Crystal-shard animated loader with pulsing amber bars and "Illuminating the archive..." text.
- **Scroll Reveal:** Elements with `data-reveal` attribute fade-in and slide up via IntersectionObserver, with staggered timing.
- **Amber Flash:** Micro-feedback animation on interactive elements (kanban cards, toolbar buttons, idea items) providing a brief amber glow on click.
- **Counter Animation:** Dashboard stat values count up from zero to their target value on view activation.
- **Strata Fill Animation:** Horizontal bar fills animate from 0% to their target width with a cubic-bezier easing on the dashboard.

## Interactions

- Sidebar toggle with smooth width transition and SVG chevron rotation
- Mobile hamburger menu with slide-in sidebar and backdrop overlay
- Accordion section expand/collapse with aria-expanded management
- Hash-based view routing with history.pushState
- Directory tree folder expand/collapse toggling
- AI chat message simulation with random geological-themed responses
- Settings tab switching with panel fade-in
- Project card click navigates to project workspace
- Search box filters project cards by name/description
- Keyboard shortcuts: Escape (close mobile menu), Ctrl+B (toggle sidebar)
- Tooltip system replaces native title attributes with styled amber tooltips

## Background Image
None. The design relies entirely on surface colors, ambient canvas particles, and border treatments for visual depth.
