# Retro 50s - Pass 2: Atomic-Age Googie

## Concept Overview

Pass 2 of the Retro 50s aesthetic explores the **Googie / Space-Age** architectural movement of the 1950s-60s. Think Jetsons, LAX Theme Building, and the optimistic futurism of the atomic age. The design language features swooping parabola shapes, boomerang panels, starburst dividers, and orbital decorative elements throughout.

## Variant Seed

`atomic-age-googie`

## Design Direction

- **Navigation**: Swooping top bar with angled/parabola-clipped tabs in space-navy, positioned at the top of the viewport (contrasts with Pass 1's bottom jukebox bar)
- **Layout**: Googie-architecture-inspired with boomerang-shaped panel borders (`border-radius: 0 40px 0 40px`), parabolic curves, and asymmetric compositions
- **Metaphors**: Space-age / Jetsons — mission control dashboards, orbital lanes, space pods, star maps, antenna arrays, and space radio communications
- **Decorative**: Starburst dividers with rotating star polygons, atomic orbit rings with animated electrons, constellation connection lines
- **Color**: Turquoise-dominant (#4ecdc4) as the primary accent with coral (#ff6b6b) as secondary, cream-turquoise backgrounds, space-navy (#1a2a44) for high-contrast panels
- **Motion**: Smooth parabolic arcs (`cubic-bezier(.4, 0, .2, 1)`), orbital easing (`cubic-bezier(.22, .61, .36, 1)`), gentle floating animations, electron pulse effects
- **Containers**: Boomerang-shaped panels with swooping border radii, capsule/pod cards, orbital ring stat displays

## Key Differentiators from Pass 1

| Element | Pass 1 (Diner) | Pass 2 (Googie) |
|---------|----------------|------------------|
| Nav position | Bottom jukebox bar | Swooping top bar |
| Nav style | Flip-card buttons | Angled parabola-clipped tabs |
| Panel shape | Chrome-bezeled rounded rectangles | Boomerang `0 40px 0 40px` radius |
| Metaphor system | Diner (speedometer, vinyl, comics) | Space-age (orbits, pods, constellations) |
| Decorative | Checkerboard, neon glow | Starburst dividers, atomic orbits |
| Motion | Bounce overshoot `cubic-bezier(0.34,1.56,0.64,1)` | Parabolic arcs, orbital easing |
| Color emphasis | Pink/mint | Turquoise/coral |
| Hero element | Neon marquee sign | Orbital stat rings |

## Views

1. **Dashboard** (`#dashboard`) - Mission Control with orbital stat rings, atomic activity chart, mission list, and quick-launch buttons
2. **Projects** (`#projects`) - Launch Bay with space pods in a grid, porthole icons, and progress bars
3. **Project Workspace** (`#project-workspace`) - Cockpit view with instrument panel sidebar (gauges, crew roster) and viewport content area
4. **Kanban** (`#kanban`) - Orbital Lanes with parabola-clipped lane headers, pod cards with priority indicators
5. **Whiteboard** (`#whiteboard`) - Star Map with draggable constellation nodes, SVG connection lines, and toolbar
6. **Schema Planner** (`#schema-planner`) - Space Station Planner with satellite dish entity modules and orbital SVG connections
7. **Directory Tree** (`#directory-tree`) - Antenna Array with collapsible tree branches and code preview pane
8. **Ideas** (`#ideas`) - Shooting Stars with orbital capture input, comet-tail cards with gradient side accents
9. **AI Chat** (`#ai-chat`) - Space Radio with signal wave animation, frequency display, and radio-styled message bubbles
10. **Settings** (`#settings`) - Space Console with pilot profile, rotatable dial knobs, orbital toggle switches, and danger zone

## Technical Details

- **Fonts**: Fredoka (headings), Nunito (body), Fira Code (mono) — all via Google Fonts CDN
- **Dependencies**: None beyond Google Fonts. Pure CSS + vanilla JavaScript.
- **Routing**: Hash-based (`#viewname`) with `pushState` for clean URL updates
- **Responsive**: Fully responsive from 375px mobile to 1440px+ desktop. Mobile nav collapses to hamburger menu.
- **Animations**: CSS-only orbital rotations, starburst pulses, wave dances, constellation line flow, floating pod motion, electron pulsing
- **Accessibility**: `aria-label`, `aria-pressed`, `aria-expanded`, keyboard escape-to-close, `:focus-visible` outlines
- **Starfield**: CSS-only via layered `radial-gradient` — no images used

## File Structure

```
pass-2/
  index.html                              - Complete HTML (10 views)
  style.css                               - Full CSS (custom properties, layout, responsive, animations)
  app.js                                  - Navigation, interactions, hash routing
  README.md                               - This file
  validation/
    handoff.json                          - Structured metadata
    inspiration-crossreference.json       - Inspiration sources & differentiators
```
