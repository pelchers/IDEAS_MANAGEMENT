# Liquid Motion — Pass 1: Morphing Blob Surfaces

## Concept Overview
A fluid, organic UI for idea management built around blob-shaped surfaces, morphing border-radius, and GSAP-powered liquid animations. The entire interface breathes with subtle motion — navigation items morph on hover, content panels slide in with spring easing, and idle elements pulse gently.

## Design System

### Typography
- **Heading**: Syne (800/700/600)
- **Body**: Manrope (300-700)
- **Monospace**: JetBrains Mono (400/500)

### Color Palette
| Token      | Value     | Usage                    |
|------------|-----------|--------------------------|
| Background | `#f0f4ff` | Ice blue page background |
| Text       | `#0a1628` | Deep navy body text      |
| Surface    | `#ffffff` | Card/panel backgrounds   |
| Accent     | `#3b82f6` | Primary blue             |
| Accent2    | `#8b5cf6` | Purple secondary         |
| Border     | `#c7d2fe` | Soft indigo borders      |

### Layout
- Floating blob navigation on the left (80px collapsed, 220px on hover)
- Fluid bento grid for dashboard content
- Organic border-radius throughout (30% 70% 70% 30% / 30% 30% 70% 70%)
- All surfaces: 24px soft radius, backdrop-filter blur

### Animation Library
- **GSAP 3.12.5** (CDN) — Core animation engine
  - Spring easing for nav morphs and toggle switches
  - Staggered reveals on view transition
  - Smooth parallax on mouse move

### Motion Principles
1. Every interaction feels liquid — buttons scale+glow, panels slide with spring easing
2. Blob shapes morph continuously via CSS keyframes
3. Idle elements breathe (subtle scale/opacity oscillation)
4. View transitions: fade + slide + scale with stagger
5. Momentum-based scroll parallax on header

## Views (10 Total)
1. **Dashboard** — Bento grid stats, animated progress rings, chart bars, activity feed
2. **Projects** — Organic-shaped project cards, progress bars, search with morphing input
3. **Workspace** — Split panel file explorer + code editor, liquid breadcrumbs
4. **Kanban** — Wave-header columns, floating bob-animated cards, drag hints
5. **Whiteboard** — Floating pill toolbar, blob-shaped nodes, bezier connections
6. **Schema Planner** — Entity blobs with gradient headers, dashed relationship lines
7. **Directory Tree** — Flowing indentation lines, expand/collapse with GSAP spring
8. **Ideas** — Breathing capture form, floating bubble cards with priority gradients
9. **AI Chat** — Blob-shaped messages, ripple send button, action shortcuts
10. **Settings** — Morphing tabs, liquid toggle switches, wave separators

## Files
- `index.html` — Full markup with all 10 views
- `style.css` — Custom properties, blob shapes, breathing animations, responsive
- `app.js` — GSAP view transitions, parallax, hover interactions, hash routing

## Running
Open `index.html` in a browser. No build step required. GSAP loads from CDN.
