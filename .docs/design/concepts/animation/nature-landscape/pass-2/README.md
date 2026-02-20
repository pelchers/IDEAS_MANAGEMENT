# Nature Landscape -- Pass 2: Spring Meadow

## Overview
An animated spring meadow landscape rendered entirely with DOM and SVG elements, driven by GSAP v3.12.5 with MotionPathPlugin. The scene is presented inside a clean modern white picture frame.

## Technology
- **Animation Library**: GSAP v3.12.5 (CDN)
- **Plugin**: MotionPathPlugin (CDN)
- **Rendering**: Pure DOM/SVG -- no canvas element is used
- **Styling**: Vanilla CSS with custom properties

## Scene Composition

### Back Layer (Sky)
- CSS gradient sky transitioning from light blue to near-white at the horizon
- 5 SVG cloud formations, each built from overlapping ellipses
- Clouds drift left-to-right at varied speeds via GSAP `.to()` with `repeat:-1`
- 2 bird flocks in V-formation following GSAP motionPath curves across the sky
- Sun with pulsing glow animation

### Mid Layer (Hills + Wildflowers)
- 3 rolling green hills using CSS `clip-path: ellipse()` with depth-graduated greens
- 28 procedurally placed SVG wildflowers (5-petal shapes in pink, yellow, purple, orange)
- Flowers sway gently with staggered GSAP sine animations

### Front Layer (Grass + Butterflies + Petals)
- 35 procedurally generated grass blades as styled divs
- Grass sways with GSAP stagger animation (sine.inOut, yoyo, repeat:-1)
- 5 butterflies (pink, yellow, blue, purple, emerald) with SVG wing-flap animation
- Butterflies follow smooth bezier motionPaths via MotionPathPlugin
- 12 drifting flower petals caught in the wind

## Interactive Controls
1. **Play/Pause** -- Freezes or resumes all GSAP timelines
2. **Wind Intensity** -- Slider (0-100%) adjusts grass sway amplitude and animation speed
3. **Day/Dusk** -- Toggle shifts sky gradient, sun position/color, and hill tones

## Parallax
- Scroll-based parallax: back layer moves slowest, front layer fastest
- Mouse-move parallax within the scene for subtle depth effect

## Palette
| Role       | Hex       | Name          |
|------------|-----------|---------------|
| Primary    | `#6EE7B7` | Emerald light |
| Secondary  | `#93C5FD` | Blue light    |
| Background | `#1E3A5F` | Dark blue     |
| Surface    | `#0F172A` | Darker blue   |
| Text       | `#F8FAFC` | Near-white    |
| Accent     | `#FDE68A` | Warm yellow   |

## Differentiation from Pass 1
| Aspect         | Pass 1             | Pass 2                 |
|----------------|--------------------|------------------------|
| Season         | Autumn             | Spring                 |
| Renderer       | p5.js canvas       | DOM/SVG elements       |
| Frame style    | Golden ornate      | Modern white/silver    |
| Color palette  | Warm autumn golds  | Fresh spring greens    |
| Key elements   | Falling leaves     | Butterflies, wildflowers |
| Motion library | p5.js built-in     | GSAP + MotionPathPlugin |

## Files
- `index.html` -- Page structure and SVG inline elements
- `style.css` -- All styling, layout, frame, responsive rules
- `app.js` -- GSAP animations, procedural generation, controls
- `validation/handoff.json` -- Build validation metadata
