# Slate Pass 3 — Obsidian Forge

## Concept Overview

**Obsidian Volcanic Glass** aesthetic: pure black surfaces with glass-like reflections, volcanic crack patterns revealing molten red and ember orange beneath. The UI resembles polished obsidian with magma visible through fissures. Active states glow with ember heat. Mirror-like reflections slide across glass surfaces.

## Design Decisions

### Layout Structure
- **Shell**: Top tab strip (browser-tab-row) — 10 tabs across the top of the viewport, mimicking browser tabs
- **Navigation**: Horizontal tab row with icon + label per tab, molten-red underline glow on active tab
- **Content**: Full-width panels that slide left/right with volcanic-crack-shatter transitions
- **Density**: Dense — minimal padding, compact controls, information-heavy screens
- **Mobile**: Hamburger toggle with full-screen overlay navigation

### Palette
| Token | Value | Usage |
|-------|-------|-------|
| bg | `#0a0a0a` | Pure black background (not dark grey — true black per Rolex inspiration) |
| surface | `#141414` | Card and panel backgrounds |
| accent | `#cc2200` | Molten red — primary interactive accent |
| accent2 | `#ff6600` | Ember orange — secondary accent, hover states |
| border | `#2a1a1a` | Volcanic border tint |
| text | `#e8e0d8` | Warm off-white body text |

### Typography
- **Headings**: Archivo Black — heavy, blocky, monolithic
- **Body**: Work Sans — clean, readable at dense sizes
- **Mono**: Fira Code — used for timestamps, reference codes, technical values
- **Engraved text**: Headings use a top-to-bottom gradient (white to 70% grey) simulating light on engraved obsidian (Rolex-inspired metallic text)

### Content Persona — Luxury Watchmaker
All fake data themed around a luxury watch atelier:
- Projects are timepiece commissions (Tourbillon Ref. 7042, Grand Complication Perpetuelle)
- Tasks involve movement assembly, bridge polishing, escapement regulation
- Metrics are horological (amplitude degrees, power reserve hours, CHF revenue)
- Team roles: Master Watchmaker, Movement Finisher, Engraver, QC Inspector
- Ideas: silicon escapement, meteorite dials, carbon composite bridges

## Interaction Implementation

| Interaction | Style | Implementation |
|-------------|-------|----------------|
| buttonHover | ember-glow-from-cracks | CSS gradient overlay with volcanic crack pattern glows on hover |
| buttonClick | magma-pulse-burst | CSS radial-gradient animation emanates from button center on click |
| cardHover | obsidian-reflection-shift | CSS `.card-reflection` element slides across card surface on hover |
| pageTransition | volcanic-crack-shatter | JS-driven slide-left/right with opacity fade and scale reduction |
| scrollReveal | ember-rise-from-below | Anime.js staggered translateY + opacity entrance on view switch |
| navItemHover | crack-glow-reveal | CSS ::after pseudo-element grows with ember-orange glow + box-shadow |
| navItemActive | molten-underline-glow | CSS gradient underline with red-orange-red glow and box-shadow |
| inputFocus | ember-border-glow | CSS border-color + box-shadow transition to ember orange on focus |
| toggleSwitch | lava-flow-slide | CSS lava trail element fills behind the toggle thumb |
| tooltips | obsidian-shard-popup | Custom tooltip with clip-path shard shape and glass reflection line |
| loadingState | magma-flow-fill | CSS animated gradient bar with flowing magma background-position |
| idleAmbient | ember-crack-pulse | CSS + Anime.js volcanic crack overlay with pulsing opacity |
| microFeedback | ember-flare-success | Toast notification with ember glow border and box-shadow |

## Library Usage

### Anime.js (v3.2.2)
- Staggered entrance animations for cards, list items, and entities on view transition
- Ambient volcanic crack opacity pulse loop
- Directory tree expand/collapse item entrance stagger
- Magma vein stroke animation on whiteboard/schema SVG lines
- Progress bar width animation

### SortableJS (v1.15.6)
- Kanban card drag-and-drop between columns
- Shared `group: 'kanban'` for cross-column movement
- Ghost class for drag preview styling
- Column count updates on drop

## Anti-Repeat Compliance
- Pass 1 used charcoal+amber carved console — this pass uses pure black+molten red obsidian glass
- Pass 1 used inner-shadow carved aesthetic — this pass uses glass-reflection and volcanic-crack aesthetic
- Pass 2 used layered strata with gold veins — this pass uses obsidian glass with magma cracks
- Pass 2 used geological strata depth — this pass uses volcanic glass mirror surfaces
- Pass 2 used timeline strip ideas — this pass uses obsidian tile card grid for ideas
