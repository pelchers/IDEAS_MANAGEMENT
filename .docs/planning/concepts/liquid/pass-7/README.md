# Liquid Pass 7 — Editorial Ink Flow

## Concept Overview

Pass 7 reimagines the IDEA-MANAGEMENT platform as a high-fashion editorial magazine that has come alive with flowing ink. The interface is built around a **hidden-hamburger navigation** pattern with a **fullscreen overlay menu**, editorial multi-column content layouts, and **cinematic ink-wash page transitions**. Every element breathes with the deliberate pacing and typographic confidence of an avant-garde design publication.

## Design Decisions

### Navigation: Hidden Hamburger + Fullscreen Overlay
- Navigation is completely concealed behind a circular hamburger button in the top-right corner
- When triggered, a full-viewport overlay reveals all 10 views with large Cormorant Garamond serif typography
- Navigation items are numbered 01-10 in monospace, with ink underline draw animations on hover
- The overlay features dual radial ink-wash gradients and an editorial masthead ("Issue VII", "Vol. VII, No. 1")
- This is the first pass in the Liquid series to use a fully hidden navigation pattern

### Layout: Editorial Columns
- Content follows a magazine-spread structure with multi-column layouts
- The dashboard opens with a two-column editorial spread: greeting headline on the left, pullquote on the right
- Each view uses the editorial kicker-headline-standfirst typographic hierarchy
- Generous whitespace (4rem editorial gap) provides magazine-grade breathing room
- This approach differs from all prior passes which used sidebars, top bars, or tab-based navigation

### Page Transitions: Cinematic Ink Wash
- Three CSS layers sweep across the viewport with staggered timing (80ms apart)
- The layers use accent-tinted, surface, and background colors for visual depth
- Transitions feel like cinematic wipes from film title sequences
- All animation is handled in vanilla JavaScript with CSS transforms (no GSAP or other libraries)

### Typography: Cormorant Garamond + Inter
- Headlines use Cormorant Garamond (weight 300, italic for emphasis) for editorial gravitas
- Body text uses Inter at smaller sizes for clean readability
- Monospace (Fira Code) is used for timestamps, tags, code blocks, and navigation numbers
- The combination creates a clear hierarchy: editorial art direction meets technical precision

### Color Palette: Midnight Ink
- Background (#0a0a14): near-black with a subtle blue-purple undertone
- Accent (#7b68ee): medium slate blue for primary interactions and highlights
- Accent2 (#00d4aa): caribbean green for secondary accents and success states
- The purple-green accent pairing on near-black is unique across all Liquid passes

### Ambient Layer: Ink Particle Drift
- A fixed canvas renders subtle floating particles in dual accent colors
- Particles have lifecycle management (spawn, drift, fade, respawn)
- The effect creates a living atmosphere without being distracting (0.4 opacity cap)

### Interactions
- **Button click**: Ink ripple emanating from click point with radial gradient dissolution
- **Card hover**: Border softens to accent glow, subtle upward translation
- **Scroll reveal**: Elements materialize with staggered delays based on their index
- **Toggle switches**: Mercury blob slides with spring easing (cubic-bezier 0.34, 1.56, 0.64, 1)
- **Input focus**: Liquid border glow ring with inset ambient light

## Technical Stack
- Pure HTML/CSS/JS — no external animation or UI libraries
- Google Fonts: Cormorant Garamond, Inter, Fira Code
- Canvas API for ambient particle system
- CSS custom properties for theming
- Hash-based routing for SPA navigation

## Responsive Breakpoints
- **Desktop**: 1200px+ (3-column grids, full editorial spreads)
- **Tablet**: 769-1199px (2-column grids, adapted layouts)
- **Mobile**: 391-768px (single column, stacked kanban, simplified whiteboard)
- **Small Mobile**: 390px and below (reduced typography, minimal card descriptions)

## Differentiation from Prior Passes
| Dimension | Pass 7 | How It Differs |
|-----------|--------|----------------|
| Navigation | Fullscreen overlay menu | First fully hidden nav in the series |
| Content flow | Editorial columns | Magazine-spread layout vs grids/panels/tabs |
| Motion | Cinematic ink wash | Three-layer CSS sweep vs GSAP-driven effects |
| Typography | Cormorant Garamond | First use of this elegant editorial serif |
| Dependencies | Zero external libs | Only pass to use pure vanilla JS with no GSAP |
| Density | Spacious (editorial) | Maximum whitespace of all passes |
| Palette | Midnight + purple/green | Unique dual-accent color pairing |
