# Liquid Motion Pass 6 — Ink in Water Calligraphy

## Concept Overview

This pass channels the meditative art of ink dropping into still water. The UI presents a deep navy "water" canvas with white and gold ink strokes that diffuse, curl, and taper through the space. Every interaction feels deliberate and elegant — the moment between control and beautiful chaos as ink meets water.

### Content Persona: Calligraphy & Stationery Brand
All views are populated with content themed around **Inkwell Studio**, a bespoke calligraphy and stationery business managed by master calligrapher Eleanor Mori. Projects are commissions (wedding suites, brand lettering, exhibition labels), materials are inks and nibs, and the workflow follows calligraphic production stages.

## Design Decisions

### Layout Structure: Recessed Left Rail
- Fixed left rail navigation (220px) with engraved/recessed visual treatment
- Compact density with deliberate spacing
- Rail collapses to slide-out drawer on mobile (< 768px)
- Left-aligned content flow with etched panel surfaces

### Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| bg | #0a1628 | Deep navy water background |
| text | #f0ece4 | Cream ink body text |
| surface | #0f1e38 | Slightly lighter navy panels |
| accent | #ffffff | White ink headings and primary emphasis |
| accent2 | #c8a84e | Gold ink accents, ornaments, active states |
| border | #1a3050 | Subtle ink-line borders |

### Typography
- **Headings:** Playfair Display — elegant serif with calligraphic sensibility
- **Body:** Source Sans 3 — clean, readable humanist sans-serif
- **Monospace:** IBM Plex Mono — for code-like fields and timestamps

### Interaction Profile Implementation

| Interaction | Implementation |
|------------|---------------|
| **buttonHover** | Ink-bleed border fill — radial gradient expands from center behind border |
| **buttonClick** | Ink drop splash — radial gradient element spawned at click coordinates, scales out and fades |
| **cardHover** | Ink tendril border curl — gold top border scales in from center on hover, subtle lift |
| **pageTransition** | Ink diffusion dissolve — CSS blur + opacity transition between views |
| **scrollReveal** | Quill-stroke write-in — GSAP-powered left-to-right fade with ScrollTrigger |
| **navItemHover** | Gold ink underline draw — tapered calligraphic underline draws from left via scaleX |
| **navItemActive** | Ink blot indicator — organic morphing dot with gold glow that holds position |
| **inputFocus** | Quill-line border — gold border with tapered bottom radius simulating pen pressure |
| **toggleSwitch** | Ink flow toggle — fluid thumb transition between states with color shift |
| **tooltips** | Parchment scroll tooltip — Tippy.js with custom gold/navy parchment theme |
| **loadingState** | Ink drop diffusion — SVG concentric rings diffusing outward |
| **idleAmbient** | Scroll ink trail ambient — Canvas-drawn wisps drift across navy background |
| **microFeedback** | Gold seal stamp confirm — SVG wax seal with spring animation on actions |

## Libraries Used

| Library | Version | Purpose |
|---------|---------|---------|
| GSAP | 3.12.5 | Timeline animations, scroll-driven reveals, spring physics for seal stamp |
| GSAP ScrollTrigger | 3.12.5 | Scroll-based content reveal triggers |
| Tippy.js | 6.3.7 | Parchment-themed tooltips with scale animation |
| Splitting.js | 1.0.6 | Per-character headline animation for quill-stroke write-in effect |

## Views (10 Total)

1. **Dashboard** — Manuscript dashboard with gold-ink metric cards, quill-stroke dividers, recent activity feed, and deadline timeline
2. **Collections (Projects)** — Sealed letter grid with calligraphic titles, wax seal status indicators, and ink-stroke category tags
3. **Writing Desk (Project Workspace)** — Parchment panels with project brief, task milestone list, and ink-well tools sidebar
4. **Correspondence (Kanban)** — Four-stage letter board (Draft, Addressing, Sealed, Delivered) with wax-seal status cards
5. **Ink Wash Canvas (Whiteboard)** — SVG-connected node graph with ink-blot shapes and calligraphic labels
6. **Manuscript Marginalia (Schema Planner)** — Illuminated manuscript entities with gold-cap headers and calligraphic relationship annotations
7. **Book of Contents (Directory Tree)** — Collapsible chapter hierarchy with ornamental ink flourishes
8. **Inspirations Cabinet (Ideas)** — Index card grid with ink-wash watermarks and calligraphic titles
9. **The Scribe (AI Chat)** — Formal letter exchange UI with ink-blot dividers and cream/navy message styling
10. **Scribe's Preferences (Settings)** — Manuscript notation controls with quill-stroke toggles and gold-accent sliders

## Anti-Repeat Compliance

- Pass 1 (blue-purple blobs on light) — We use deep navy (#0a1628) with white+gold ink diffusion
- Pass 2 (ocean wave current on dark blue) — We use still-water ink calligraphy, not wave motion
- Pass 3 (chrome mercury metallic on charcoal) — We use organic ink tendrils, not metallic surfaces
- Pass 4 (soft watercolor pastel on white) — We use deliberate calligraphic ink on dark water, not pastel wash

## Inspiration References Applied

- **Montblanc:** Deep ink-navy backgrounds with whisper-thin serif headlines; full-height content sections with slow opacity transitions
- **Pilot Pen:** Vertical gradient depth effect in panel surfaces; color-change hover interactions
- **Sumi Ink Club:** Brush-stroke textures as section dividers (CSS clip-path calligraphic shapes); hand-drawn feel mixed with structured layout
