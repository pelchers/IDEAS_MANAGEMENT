# Mesa Trail Manager — Sandstone Desert Workspace

## Pass 4 of Slate Style Family

### Concept Overview

This pass channels the warm, sun-baked aesthetic of a sandstone desert mesa. Unlike the previous three passes which explored dark charcoal interiors (Pass 1), dark underground strata (Pass 2), and obsidian volcanic fire (Pass 3), this pass goes entirely outdoor and warm — warm sand backgrounds, terracotta accents, sage vegetation greens, and weathered canyon textures.

The interface is themed as a national park trail management system, with all content using the "national-park-outdoor-brand" persona. Projects are trail initiatives, tasks are field operations, chat is ranger dispatch, and settings follow a trail guide wizard format.

### Design Decisions

**Layout Structure: Split-Pane Workspace**
- Top toolbar with compact toolbar-buttons navigation
- Resizable split panes with independent scroll regions per pane
- Left-aligned, compact density, hard component edges
- No hero treatment — all workspace, all the time

**Palette**
- Background: `#f0e6d6` (warm desert sand)
- Surface: `#f8f0e4` (lighter sandstone)
- Text: `#3a2a1a` (dark earth brown)
- Accent: `#c4622a` (terracotta)
- Accent2: `#7a8a6a` (sage green)
- Border: `#d4c0a0` (dry clay)

**Typography**
- Headings: Bitter (serif, weighty, carved feel)
- Body: Libre Franklin (clean, legible)
- Mono: Source Code Pro (field data, specs)

### Interaction Profile

All 13 interaction categories are implemented:

| Interaction | Implementation |
|-------------|---------------|
| **buttonHover** | Sand texture pattern reveals behind the button via CSS pseudo-element with turbulence SVG filter |
| **buttonClick** | Anime.js-driven dust particle explosion from click position, 6 particles radiating outward |
| **cardHover** | CSS box-shadow deepens with warm rgba tones simulating canyon shadow |
| **pageTransition** | Wind erosion CSS animation: current view blurs and slides away, new view blurs in from opposite side |
| **scrollReveal** | Elements tagged with `.canyon-rise` class, staggered reveal via Anime.js with translateY from below |
| **navItemHover** | Warm sandy background appears (sandstone texture via SVG noise) behind toolbar button |
| **navItemActive** | Terracotta-colored 3px bar indicator under active toolbar button |
| **inputFocus** | Border warms to terracotta color with subtle terracotta box-shadow glow |
| **toggleSwitch** | CSS toggle with thumb slide; `.toggle-dust-trail` element animates width/opacity behind thumb |
| **tooltips** | Tippy.js with weathered plaque styling — sandstone-textured background, warm shadow, park-sign feel |
| **loadingState** | CSS-animated sand hourglass with draining/filling sand blocks and flowing stream |
| **idleAmbient** | Heat shimmer layer using animated gradient background-position shift at very low opacity |
| **microFeedback** | Sage-green SVG checkmark with strokeDashoffset animation via Anime.js, auto-dismiss toast |

### View Architecture

1. **Dashboard** — Mesa formations at varying heights for stat cards, dried-earth dividers, bar chart metrics, event timeline
2. **Projects** — Trail map layout with SVG winding path and waypoint cards positioned along the route
3. **Project Workspace** — Canyon layout with sidebar "cliff" navigation and main "valley" content area, resizable split
4. **Kanban** — Horizontal swimlanes as canyon layers (surface/mid/deep/floor), sandstone block cards with weathered corners
5. **Whiteboard** — Desert canvas with draggable sandstone nodes and SVG dried-riverbed connector paths
6. **Schema Planner** — Geological survey diagram with rock formation entity blocks and fault line relationship connectors
7. **Directory Tree** — Canyon-rim hierarchy with terracotta folder markers and collapsible branches
8. **Ideas** — Pinterest masonry with sandstone-textured cards at varying mesa heights
9. **AI Chat** — Park ranger dispatch format with field notes, location stamps, radio codes, spec blocks
10. **Settings** — Trail guide wizard with numbered waypoint markers and trail connector lines between steps

### Library Usage

| Library | Version | Purpose |
|---------|---------|---------|
| **Anime.js** | 3.2.2 | Dust puff particle animations on button click, bar chart entrance animations, SVG path drawing (trail path, fault lines, riverbed connectors), scroll reveal staggering, toggle dust trail, checkmark stroke animation |
| **SortableJS** | 1.15.6 | Kanban card drag-and-drop between canyon layer lanes with ghost styling |
| **Tippy.js** | 6.3.7 | Weathered plaque-style tooltips on toolbar buttons, whiteboard nodes, and user badge |

### Anti-Repeat Compliance

- No dark charcoal carved interior (warm sand outdoor landscape used)
- No dark layered strata underground (warm sunlit mesa surface used)
- No pure black obsidian with fire/magma (warm sandstone with sage/terracotta used)
- No glass reflections or volcanic cracks (weathered erosion and canyon depth used)
- No forge communication chat (park ranger field notes chat used)

### Responsive Behavior

- **Desktop (>768px):** Full split-pane workspace with resizable dividers, horizontal toolbar navigation, side-by-side panes
- **Mobile (<=768px):** Hamburger menu with slide-down drawer, panes stack vertically, kanban scrolls horizontally, masonry becomes single column, trail map waypoints stack vertically
- **Small mobile (<=480px):** Single-column stat formations, simplified grid layouts
