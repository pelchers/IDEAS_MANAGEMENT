# Mid-Century Modern - Pass 2: Saarinen Tulip Dashboard

## Concept Overview

This is **Pass 2** of the Mid-Century Modern frontend concept for the Idea Management application. The design direction is inspired by Eero Saarinen's iconic tulip table and chair series, translating the pedestal/hub-and-spoke form language into a digital interface.

**Variant Seed**: `saarinen-tulip-dashboard`

## Design Philosophy

Where Pass 1 used a horizontal credenza-shelf navigation metaphor with a 2-column card grid, Pass 2 takes a fundamentally different approach:

- **Radial/Orbital Navigation**: Navigation items orbit around a central hub logo, organized in concentric rings rather than a horizontal bar. This reflects the tulip table's central pedestal supporting a wider top.
- **Pedestal Page Headers**: Each view opens with a centered pedestal element -- a vertical stem leading up to the page title -- evoking the single-stem furniture silhouette.
- **Tapered Borders**: Content panels feature CSS borders that taper from thick at the top to thin (or transparent) at the bottom, mimicking the tulip pedestal's tapered column.
- **Starburst/Atomic Dividers**: Section breaks use rotating starburst icons with radiating gradient lines, replacing Pass 1's wood-grain textures with atomic-age decorative motifs.
- **Hub-and-Spoke Content Flow**: Stats, cards, and interactive elements radiate outward from center points rather than aligning in flat grids.
- **Rotational/Orbital Motion**: View transitions use scale + rotation transforms. Elements float, spin, and orbit rather than simply fading in linearly.

## Color Palette

| Token     | Value     | Usage                    |
|-----------|-----------|--------------------------|
| bg        | `#faf6ef` | Warm cream background    |
| text      | `#2c1810` | Rich brown text          |
| surface   | `#ffffff` | Card/panel backgrounds   |
| accent    | `#c4652a` | Burnt orange primary     |
| accent2   | `#1b6b5a` | Olive/teal secondary     |
| mustard   | `#c9982e` | Mustard accent           |
| border    | `#d4c5a9` | Warm border color        |

## Typography

- **Headings**: Playfair Display (serif) -- 400/500/600/700
- **Body**: DM Sans (sans-serif) -- 300/400/500/600/700
- **Monospace**: JetBrains Mono -- 400/500

All loaded from Google Fonts CDN.

## 10 Navigable Views

1. **Dashboard** (`#dashboard`) -- Central hub with floating stat pedestals, sunburst activity chart, timeline
2. **Projects** (`#projects`) -- Project cards in a showcase grid with tulip stem borders and orbital entrance animations
3. **Project Workspace** (`#project-workspace`) -- Split panels with tapered borders, atomic starburst breadcrumbs, tasks and notes
4. **Kanban** (`#kanban`) -- Four lanes styled as tulip pedestals (top plate + stem + card tray)
5. **Whiteboard** (`#whiteboard`) -- Canvas with starburst grid markers, atomic-shaped nodes (diamond, ellipse, atom, starburst), draggable
6. **Schema Planner** (`#schema-planner`) -- Entity blocks as architectural pedestals with tapered connection stems
7. **Directory Tree** (`#directory-tree`) -- File tree with starburst expand/collapse icons and orbital connector dots
8. **Ideas** (`#ideas`) -- Central capture input hub with idea cards in an orbital field arrangement
9. **AI Chat** (`#ai-chat`) -- Conversation with tulip-shaped message containers (rounded top, stem at bottom)
10. **Settings** (`#settings`) -- Mid-century toggle switches, starburst section dividers, range sliders

## Technical Details

- **Routing**: Hash-based (`#view-name`) with `pushState` for clean history
- **Transitions**: Rotational scale transforms (scale + rotate) for view changes, ~500ms duration
- **Animations**: CSS keyframes for orbital floating, starburst spinning, card entrance sequences, progress bar fills
- **Interactivity**: Draggable whiteboard nodes, tree collapse/expand, live chat simulation, idea capture, settings controls
- **Keyboard Navigation**: Alt+1 through Alt+0 for quick view switching, Escape to close mobile nav
- **Responsive**: Three breakpoints (1024px tablet, 768px mobile, 480px small mobile) with progressive layout adaptation
- **Performance**: IntersectionObserver pauses off-screen animations; no external JS/CSS dependencies beyond Google Fonts
- **Accessibility**: `prefers-reduced-motion` support, focus-visible outlines, semantic HTML structure

## Differentiation from Pass 1

| Aspect         | Pass 1 (Credenza Shelf)        | Pass 2 (Saarinen Tulip)            |
|----------------|--------------------------------|-------------------------------------|
| Navigation     | Horizontal top bar             | Radial orbital rings                |
| Layout         | 2-column card grid             | Hub-and-spoke / radial              |
| Decorative     | Wood-grain CSS textures        | Starburst/atomic dividers           |
| Content Flow   | Linear top-to-bottom           | Center-outward radiation            |
| Motion         | Linear fades (200-280ms)       | Rotational orbits (420-500ms)       |
| Hero           | Warm banner at top             | Central pedestal hub element        |
| Card Shape     | Rounded 14px corners           | Tapered borders (thick-to-thin)     |
| Typography     | Same families, different usage | Same families, centered composition |

## File Structure

```
pass-2/
  index.html                              -- Complete HTML with all 10 views
  style.css                               -- Full CSS with custom properties, animations, responsive
  app.js                                  -- Hash routing, interactions, chat, drag, tree toggle
  README.md                               -- This documentation
  validation/
    handoff.json                          -- Pass metadata and configuration
    inspiration-crossreference.json       -- Design inspiration sources and differentiators
```

## Running

Open `index.html` in any modern browser. No build step or server required. All resources load from CDN (Google Fonts only).
