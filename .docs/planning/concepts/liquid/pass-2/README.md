# Liquid Motion -- Pass 2: Wave Current Flow

## Concept Overview

Pass 2 of the Liquid Motion frontend concept for the Idea Management application. This iteration takes the "wave-current-flow" variant seed, building an interface that flows like a river or ocean current. The deep ocean theme (dark navy to foam white) contrasts sharply with Pass 1's light blue aesthetic.

## Variant Seed

**wave-current-flow**

The entire application metaphor is built around ocean currents, wave dynamics, and depth layers. Navigation is a horizontal stream at the top of the viewport. Content slides in from the side like merging currents. Scrolling creates wave-like motion where elements rise from the seafloor. SVG wave dividers separate all major content sections.

## Key Design Decisions

### Navigation: Horizontal Stream (Top Bar)
Unlike Pass 1's left-side floating blob navigation, Pass 2 uses a **horizontal stream navigation bar** fixed to the top of the viewport. Navigation items float and bob with staggered sine-wave GSAP animations, simulating items carried by a gentle current.

### Layout: River/Current Flow
Content flows horizontally when transitioning between views (sliding in from the right like merging currents, exiting to the left). Within views, content is arranged in depth layers (surface, mid-depth, deep) rather than a bento grid.

### Color: Deep Ocean Dark Theme
- Background: `#0a1628` (deep ocean navy) -- a fully dark theme
- Surface: `#132038` (deep water blue)
- Accent: `#00d4ff` (electric cyan / surface light)
- Accent2: `#6366f1` (deep indigo)
- Foam: `#f0f8ff` (surface foam white for text)

This is a deliberate contrast to Pass 1's light `#f0f4ff` background.

### Shapes: SVG Wave Clip-Paths
All section dividers use SVG wave paths instead of round blob shapes. Cards use standard rounded corners rather than asymmetric blob border-radius.

### Motion: Wave/Current Animations
- **View transitions**: Content slides in from the right (current merging)
- **Nav items**: Staggered vertical bobbing (sine wave)
- **Buttons**: Expanding ripple circles on click (radial gradient + GSAP scale)
- **Cards**: Wave hover distortion (box-shadow expansion + subtle lift)
- **Scroll**: Background waves parallax with horizontal offset
- **Idle**: Vessel cards bob gently; idea bubbles float upward

### Button Effects: Ripple Expanding Circles
Every `.btn-ripple` element spawns an expanding radial gradient circle from the click point, animated with GSAP. This replaces Pass 1's scale+glow button effect.

## 10 Views

| # | View ID | Theme | Description |
|---|---------|-------|-------------|
| 1 | `dashboard` | Ocean Depths | Stats rise from seafloor. Wave-form chart. Activity current. |
| 2 | `projects` | Project Fleet | Vessel cards that bob on the surface. Wave separators. |
| 3 | `project-workspace` | Deep Dive | Split view with coral branch file tree and depth layers. |
| 4 | `kanban` | Ocean Currents | Columns as flowing currents. Cards float between them. |
| 5 | `whiteboard` | Underwater Canvas | Nodes connected by animated SVG current lines. |
| 6 | `schema-planner` | Abyssal Schema | Entity blocks as deep-sea structures. Bioluminescent connections. |
| 7 | `directory-tree` | Coral Reef | Branching file structure styled as coral formations. |
| 8 | `ideas` | Rising Bubbles | Ideas surface from the deep. Input at the ocean floor. |
| 9 | `ai-chat` | Sonar Channel | Messages as sonar pulses. AI from the deep, user from the surface. |
| 10 | `settings` | Submarine Panel | Gauge SVGs, valve toggle switches, depth slider controls. |

## Technical Stack

- **HTML5**: Semantic markup with `data-view` / `data-page` attributes for routing
- **CSS3**: Custom properties, CSS Grid, Flexbox, SVG wave dividers, `@keyframes`
- **JavaScript**: Vanilla JS with GSAP 3.12.5 for all animations
- **Fonts**: Google Fonts CDN (Syne, Manrope, JetBrains Mono)
- **Routing**: Hash-based (`#dashboard`, `#projects`, etc.)

## Differentiation from Pass 1

| Aspect | Pass 1 | Pass 2 |
|--------|--------|--------|
| Nav | Left-side floating blob (80px/220px) | Horizontal top stream bar |
| Layout | Bento grid | River/current flow with depth layers |
| Shapes | Asymmetric blob border-radius | SVG wave clip-paths |
| Color | Light blue `#f0f4ff` bg | Deep ocean `#0a1628` dark bg |
| Motion | Blob morphing, spring easing | Wave undulation, rising content |
| Hero | Gradient morph header | Ocean surface with depth layers |
| Buttons | Scale + glow | Ripple expanding circles |
| Scroll | Vertical momentum parallax | Horizontal current parallax |
| Typography | Same families | Same families (Syne/Manrope) |

## File Structure

```
pass-2/
  index.html                             -- Complete HTML (10 views)
  style.css                              -- Full CSS with custom properties
  app.js                                 -- GSAP navigation + animations
  README.md                              -- This file
  validation/
    handoff.json                         -- Build metadata
    inspiration-crossreference.json      -- Inspiration sources
```

## Running Locally

Open `index.html` in any modern browser. No build step required. All dependencies (GSAP, Google Fonts) are loaded from CDN.

## Responsive Breakpoints

- **Desktop**: 1440px+ (full layout)
- **Tablet**: 768px--1024px (stacked columns, simplified canvas)
- **Mobile**: 375px--768px (hamburger nav, single column)
