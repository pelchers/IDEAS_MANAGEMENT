# 3D Globe -- Pass 1

**Domain:** Graphic Design
**Style:** Globe 3D
**Pass:** 1
**Library:** Three.js v0.170.0

## Overview

Interactive wireframe Earth globe rendered with Three.js WebGL. Visualizes IDEA-MANAGEMENT global user connections with glowing city dots and animated arc paths between 15 major cities.

## Palette

| Token      | Hex       | Role         |
|------------|-----------|--------------|
| primary    | `#3B82F6` | Blue         |
| secondary  | `#10B981` | Emerald      |
| background | `#030712` | Near-black   |
| surface    | `#111827` | Dark gray    |
| text       | `#F9FAFB` | Near-white   |

## Scene Features

- **Wireframe Globe** -- Low-opacity blue wireframe sphere (radius 200) with latitude rings at 30-degree intervals
- **15 City Dots** -- Glowing spheres placed at real lat/lng coordinates; pulse animation on idle, highlight on hover
- **25 Connection Arcs** -- Quadratic Bezier curves between city pairs with animated opacity flow; density controlled by slider
- **Star Field** -- 2000 randomly distributed points on a background shell for spatial depth
- **Atmosphere Glow** -- Subtle blue sprite behind the globe simulating atmospheric haze
- **Hover Tooltips** -- City name and user count shown on pointer intersection via raycasting

## Interactivity

| Control              | Behavior                                      |
|----------------------|-----------------------------------------------|
| Auto-Rotate toggle   | Starts/stops continuous Y-axis rotation        |
| Connection Density   | Slider (0-100%) filters visible arc count      |
| Reset Camera         | Returns to default camera position and target  |
| Drag                 | OrbitControls for manual globe spin             |
| Scroll               | Zoom in/out (clamped 280-900 distance)         |
| Hover city dot       | Tooltip with city name and active user count    |

## Files

```
pass-1/
  index.html         HTML shell with importmap for Three.js ES modules
  style.css          Layout, controls, tooltip, loading overlay styles
  app.js             Three.js scene: globe, cities, arcs, stars, animation loop
  README.md          This file
  validation/
    handoff.json     Validation metadata
```

## Running Locally

Open `index.html` in any modern browser. Requires internet access for the Three.js CDN import. No build step needed.

```bash
# Quick-serve from this directory
npx serve .
```

## Performance Notes

- Render loop targets 60fps via `requestAnimationFrame`
- Pixel ratio capped at 2x to prevent GPU overload on HiDPI screens
- Raycasting runs per-frame against 15 city meshes (negligible cost)
- Arc dash animation uses opacity modulation rather than geometry reconstruction
