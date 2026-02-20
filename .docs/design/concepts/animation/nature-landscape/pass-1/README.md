# Animation Concept — Nature Landscape, Pass 1

## Overview
An animated autumn landscape rendered with p5.js inside an ornate golden CSS picture frame. The scene features rolling hills, deciduous trees with autumn foliage, 30+ falling leaf particles with rotation and drift physics, three layers of clouds at different velocities, swaying grass, and a shimmering stream.

## Files
| File | Purpose |
|------|---------|
| `index.html` | Page structure: header, framed canvas, controls, footer |
| `style.css` | Layout, golden frame styling, responsive breakpoints |
| `app.js` | p5.js sketch: sky, clouds, hills, trees, leaves, grass, stream |
| `validation/handoff.json` | Machine-readable metadata for pipeline validation |

## Palette
| Token | Hex | Usage |
|-------|-----|-------|
| primary | `#22C55E` | Header badge |
| secondary | `#3B82F6` | Accents |
| background | `#0C4A6E` | Page background |
| surface | `#164E63` | Header, controls panel |
| text | `#F0FDFA` | All text |
| accent | `#FBBF24` | Library badge, slider thumbs, value readouts |

## Animation Elements
1. **Sky** — vertical gradient from warm blue to sunset orange
2. **Clouds** — 3 depth layers (13 total clouds), each layer moves at a different speed; wind slider scales velocity
3. **Hills** — 3 rolling Perlin-noise layers with depth haze (back hills more transparent)
4. **Trees** — 7 deciduous trees placed on the middle hill layer; each has randomized canopy blobs in orange/red/gold/amber
5. **Falling Leaves** — 35 particles by default (adjustable 20-60 via slider), each with individual fall speed, sinusoidal horizontal drift, continuous rotation, and color from an autumn palette; leaves wrap when exiting the canvas
6. **Grass** — ~225 blades along the front hill contour, oscillating with sin() and amplified by the wind slider
7. **Stream** — winding ribbon across the lower valley with animated width, alpha shimmer, and sparkle highlights

## Controls
| Control | Effect |
|---------|--------|
| Play/Pause | Freezes or resumes the entire animation loop |
| Wind Speed (0-100%) | Scales leaf drift amplitude, cloud speed, and grass sway |
| Leaf Count (20-60) | Dynamically adds or removes leaf particles |

## Frame Design
The picture frame is pure CSS with no image assets:
- 36px-thick golden gradient border (light gold to dark gold, 145deg)
- Multi-layer inset box-shadows creating ridge and bevel effects
- Four decorative corner rosettes via pseudo-elements
- Deep inner shadow around the canvas edge
- Outer drop shadow grounding the frame on the page

## Responsive Behavior
- **>980px**: 900x600 canvas, 36px frame
- **760-980px**: 700x467 canvas, 28px frame
- **<760px**: 96vw width, proportional height, 20px frame; controls stack vertically

## Library
p5.js v1.11.3 loaded from CDN (`https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.3/p5.min.js`)

## Running
Open `index.html` in any modern browser. No build step or server required.
