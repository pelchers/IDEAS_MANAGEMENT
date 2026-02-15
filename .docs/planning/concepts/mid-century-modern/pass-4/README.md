# Mid-Century Modern — Pass 4: Noguchi Sculpture Garden

## Concept Overview

This pass draws from Isamu Noguchi's sculpture garden philosophy — asymmetric balance, enormous negative space, and sculptural simplicity. The UI breathes with the Japanese concept of *ma* (the beauty of empty space). Every element is placed with the deliberation of a stone in a zen garden.

The content persona is **luxury-hotel-spa**, theming the entire application as "Serenova," a fictional luxury hospitality management platform overseeing four destination properties (Kyoto, Santorini, Marrakech, Big Sur).

## Design Decisions

### Layout Structure (uniquenessProfile: magazine-spread)
- **Shell Mode**: Hidden hamburger — no persistent navigation chrome. The screen is pure content.
- **Nav Pattern**: Fullscreen overlay menu — navigation is a deliberate, immersive act. The overlay uses the background color with large serif type, creating a gallery-index feel.
- **Content Flow**: Editorial columns — content is arranged in a single-column editorial flow with generous margins, like a luxury magazine spread.
- **Scroll Mode**: Parallax layers via GSAP ScrollTrigger — content elements drift at different speeds during scroll, creating subtle depth.

### Typography
- **Headings**: Cormorant Garamond (light 300) — an elegant serif with classical proportions
- **Body**: Jost (light 300) — geometric sans-serif with mid-century DNA
- **Monospace**: IBM Plex Mono (light 300) — used for labels, metadata, and system text

### Color Palette
- Background: `#eee9e2` — warm paper/parchment
- Surface: `#f7f4ef` — slightly lighter warm white
- Text: `#2d2a26` — deep warm brown (never pure black)
- Accent: `#7a8b6f` — misty sage green
- Accent2: `#a09080` — warm stone/sandstone
- Border: `#d1cbc2` — light stone gray

### Interaction Profile (all implemented)
| Interaction | Implementation |
|---|---|
| Button Hover | Opacity shifts to 0.8 with slow ease |
| Button Click | Stone-press-sink — translateY(3px) with weighted 0.6s cubic-bezier |
| Card Hover | Shadow becomes softer and more diffuse (floating sculpture effect) |
| Page Transition | Fade through white overlay (0.4s) — like turning a gallery catalog page |
| Scroll Reveal | Slow rise (40px) with opacity fade via GSAP ScrollTrigger |
| Nav Item Hover | Thin sage-colored line extends from center (60% width) |
| Nav Item Active | Small circular sage dot indicator to the left |
| Input Focus | Border fades to sage color over 0.8s |
| Toggle Switch | Smooth slide with 0.6s ease, no bounce |
| Tooltips | Whisper fade-in (600ms) via Tippy.js with dark background |
| Loading State | Concentric ripple rings expanding and fading — stone-in-water effect |
| Idle Ambient | None (intentionally silent — the stillness IS the ambient) |
| Micro Feedback | Sage-colored toast fades in from below and dissolves after 2.2s |

## Anti-Repeat Compliance
- Pass 1 used dense credenza shelf layout: This pass uses extreme negative space and sparse placement
- Pass 2 used radial hub-spoke layout: This pass uses asymmetric offset editorial layout
- Pass 3 used vibrant multicolor collage with patterns: This pass uses monochrome sage/stone with no patterns (only a barely-visible paper texture at 3% opacity)
- Pass 3 used overlapping collage cards: This pass uses isolated elements with maximum whitespace
- Pass 3 used wizard-step settings: This pass uses sparse single-scroll settings

## Library Usage

### GSAP 3.12.5 + ScrollTrigger
- **Purpose**: Parallax scroll layers and cinematic scroll-triggered reveals
- **Why**: The parallax-layers scrollMode requires precise scroll-driven animation. GSAP ScrollTrigger provides scrub-linked parallax and staggered entrance animations that CSS alone cannot achieve with the same precision.
- **Usage**: Elements with `data-parallax` attribute get scrub-linked Y translation. `.reveal-element` elements get staggered fade-rise on viewport entry.

### Lenis 1.1.18
- **Purpose**: Smooth scroll with luxury inertia
- **Why**: The Noguchi/Aman-inspired meditative scroll rhythm requires custom scroll physics. Lenis replaces native scroll with butter-smooth deceleration that matches the contemplative pace.
- **Usage**: Initialized on page load with 1.6s duration and custom easing curve.

### Tippy.js 6.3.7
- **Purpose**: Whisper-fade tooltip placards
- **Why**: The "gallery placard" tooltip style requires controlled entrance timing (600ms fade) and consistent positioning that native title attributes cannot provide.
- **Usage**: All elements with `data-tippy-content` get dark, small-type tooltips with delayed entrance.

### Phosphor Icons (Thin weight)
- **Purpose**: Minimal iconography for directory tree and UI elements
- **Why**: The thin weight matches the 1px line aesthetic and light typography weight used throughout.
- **Usage**: Directory tree file/folder icons and action buttons.

## Views

1. **Dashboard** — Sparse sculptural layout with 4 key metrics in large typography surrounded by generous whitespace
2. **Properties** — Vertical scroll with each property as a full-width section separated by thin rules and negative space
3. **Workspace** — Asymmetric two-panel layout with content offset, leaving the right side sparse
4. **Guest Flow** — Kanban with extreme column spacing, few cards visible at once
5. **Mood Board** — Zen garden canvas with minimal nodes and thin stone-colored connecting lines
6. **Service Map** — Clean diagram with entities in sculptural asymmetric balance
7. **Resources** — Sparse indented tree with generous line-height and thin connecting rules
8. **Journal** — One idea per large row with display serif title and maximum breathing room
9. **Concierge AI** — Gallery catalog format with generous margins and elegant type
10. **Settings** — Single scroll with sections separated by vast whitespace
