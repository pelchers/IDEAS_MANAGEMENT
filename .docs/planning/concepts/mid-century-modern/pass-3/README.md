# Girard Gallery — Mid-Century Modern Pass 3

## Concept Overview

This pass draws from Alexander Girard's textile design language to create a vibrant, collage-driven interface for a contemporary art gallery management application. Unlike the restrained warmth of Pass 1 or the hub-spoke radial layouts of Pass 2, this design embraces polychromatic exuberance — coral, olive, gold, and teal all compete for attention on an ivory canvas, just as they do in Girard's original textile swatches.

The structural metaphor is a **floating pill navigation** with a **stacked card carousel** content flow, centered on the page with spacious density. Each view is a self-contained card that enters and exits with collage-shuffle transitions, reinforcing the textile-patchwork aesthetic.

## Design Decisions

### Layout Structure (Uniqueness Profile: card-stack-carousel)
- **Shell**: Floating pill navigation bar fixed at the bottom of the viewport
- **Navigation**: Pill-toggle group where items sit in a horizontal scrollable track with rounded-pill styling
- **Content flow**: Stacked card carousel — each view is a full-width card page that shuffles in/out
- **Scroll mode**: Horizontal swipe metaphor (pages transition left/right conceptually)
- **Alignment**: Center — all content is symmetrically centered on the canvas
- **Density**: Spacious — generous padding and whitespace between elements

### Palette & Typography
- **Background**: #faf5eb (ivory canvas — warm, not cold white)
- **Accent colors**: Coral (#e05a4f), Olive (#6b8e23), Gold (#d4a843), Teal (#2a9d8f) used simultaneously
- **Headings**: Fraunces — a variable serif with optical size axis that gives warmth at display sizes
- **Body**: Outfit — geometric sans-serif that pairs well with Fraunces
- **Monospace**: JetBrains Mono — for code/schema fields

### Content Persona: Contemporary Art Gallery
All fake data is themed as a contemporary art gallery managing exhibitions, artworks, loan agreements, conservation tasks, and curatorial workflows. Project names are exhibition titles, tasks are installation activities, metrics track visitor counts and acquisition budgets.

### Interaction Profile (All 13 Categories Implemented)

| Interaction | Implementation |
|---|---|
| **buttonHover** | Geometric pattern fills the button background on hover (CSS repeating SVG pattern with opacity transition) |
| **buttonClick** | Canvas-based confetti burst of geometric shapes (triangles, circles, diamonds, squares) in accent colors |
| **cardHover** | Border cycles through coral-olive-gold-teal via JS setInterval (350ms per color) |
| **pageTransition** | Collage-shuffle animation: exit with scale-down + rotation, enter with scale-up + slight overshoot |
| **scrollReveal** | Stagger-scale-rotate: items start scaled down with random slight rotation, stagger in with 80ms delay |
| **navItemHover** | Colored geometric shape (circle/triangle/diamond) scales in beside the nav item |
| **navItemActive** | Bold weight shift + decorative geometric border bottom (repeating coral-olive-gold segments) |
| **inputFocus** | Focus border becomes a repeating geometric pattern at the bottom edge + coral glow ring |
| **toggleSwitch** | Thumb morphs from circle to triangle via clip-path on checked state |
| **tooltips** | Tippy.js tooltips with dark background, gold border, and geometric triangle pattern fill |
| **loadingState** | Kaleidoscope spinner: 6 geometric pieces (triangles, diamonds, squares) in accent colors rotating |
| **idleAmbient** | Background geometric shapes drift very slowly (GSAP + CSS animation, opacity 0.06) |
| **microFeedback** | Gold geometric star pops to center of screen and dissolves on success actions |

### Anti-Repeat Compliance
- Pass 1 used restrained warm palette with amber/olive -> This pass uses **vibrant multicolor** (4 competing accents)
- Pass 1 used shelf-like dashboard -> This pass uses **overlapping collage layout** with angled stat cards
- Pass 2 used hub-spoke radial layouts -> This pass uses **irregular collage grid** throughout
- Pass 2 used bubble chart for ideas -> This pass uses **patterned card grid** with unique pattern headers
- Pass 2 used comic panel chat -> This pass uses **illustrated letter format** with ornamental dividers

## Library Usage

### GSAP 3.12.5 + Flip Plugin
- **Purpose**: Complex ambient animation choreography, schema line animation, enhanced scroll reveals
- **Usage**: Ambient shape drift with randomized parameters, background pattern position drift, schema planner dashed-line animation, input focus box-shadow animation
- **CDN**: `cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js` + Flip plugin

### Tippy.js 6.3.7
- **Purpose**: Patterned tooltips on navigation items
- **Usage**: Custom `girard` theme with dark background, gold border, and geometric triangle pattern background
- **CDN**: `unpkg.com/tippy.js@6.3.7/dist/tippy-bundle.umd.min.js`

### SortableJS 1.15.6
- **Purpose**: Drag-and-drop kanban card reordering
- **Usage**: All four kanban columns share a drag group; cards can be moved between columns; count badges update on drop
- **CDN**: `cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.6/Sortable.min.js`

### Phosphor Icons (Duotone)
- **Purpose**: Navigation and UI icons with mid-century-appropriate duotone weight
- **CDN**: `unpkg.com/@phosphor-icons/web@2.1.1/src/duotone/style.css`

## View Descriptions

1. **Dashboard** — Collage layout with overlapping stat cards at slight angles, each with a different geometric pattern border and accent color. Featured card hero for the primary exhibition.
2. **Projects** — Gallery wall layout with project cards displayed like framed artworks in an irregular salon-style hanging (variable column spans).
3. **Project Workspace** — Patchwork quilt layout with content sections as textile patches with decorative seam borders.
4. **Kanban** — Card grid with color-coded category backgrounds and geometric shape status markers (circle, triangle, square, pentagon).
5. **Whiteboard** — Mood board with overlapping pinned notes, textile pattern swatches, and folk-art decorative connectors.
6. **Schema Planner** — Colorful diagram with each entity in a different accent color and geometric shape for its type badge.
7. **Directory Tree** — Illustrated tree with decorative folk-art leaf and branch motifs (geometric shapes as folder icons) alongside functional labels.
8. **Ideas** — Card grid with each card featuring a unique geometric pattern header strip and bold serif title.
9. **AI Chat** — Illustrated letter format with decorative patterned borders, colored initials at the start of each message, and ornamental SVG dividers.
10. **Settings** — Wizard steps presented as a train of connected geometric carriages, each stop a decorated panel with a unique shape marker.

## File Structure
```
pass-3/
  index.html                              — Complete HTML with all 10 views
  style.css                               — Full CSS with responsive breakpoints
  app.js                                  — Navigation, interactions, library init
  README.md                               — This file
  validation/
    handoff.json                          — Structural metadata
    inspiration-crossreference.json       — Inspiration mapping
```
