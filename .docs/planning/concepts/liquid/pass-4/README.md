# Bloom — Watercolor Wash Wellness Studio

**Style:** Liquid Motion — Pass 4
**Variant:** Watercolor Wash Blend
**Content Persona:** Wellness Lifestyle Brand
**Layout Profile:** sidebar-accordion (collapsible left sidebar, accordion nav sections, split-panel-detail content)

## Concept Overview

Bloom is a wellness practice management studio rendered in a soft watercolor aesthetic. The entire interface feels hand-painted — pastel washes of blush pink, sage green, and lavender bleed into each other across a warm white canvas. Every surface has the quality of watercolor on textured paper: soft edges, imperfect gradients, and gentle color diffusion.

The design is deeply organic and artistic. Hard lines are replaced by paintbrush-stroke dividers. Cards float with extra-soft shadows (inspired by Squarespace's paper-on-water effect). Backgrounds feature radial gradient washes that fade from tinted pastel centers to white edges (drawing from Glossier's watercolor bleed aesthetic). Content sections subtly overlap and bleed beyond rigid grids (influenced by Goop's editorial asymmetry).

## Design Decisions

### Layout Structure
- **Shell Mode:** Collapsible left sidebar that collapses to a slim icon rail on desktop, slides as overlay on mobile
- **Nav Pattern:** Accordion sections grouping related views (Overview, Projects, Planning, Creative, System)
- **Content Flow:** Split-panel-detail — dashboard uses inline stats row + two-column detail panels; workspace uses canvas with split sub-sections
- **Scroll Mode:** Standard scroll with GSAP ScrollTrigger for paint-stroke reveal animations
- **Density:** Compact with intentional whitespace — small type sizes, tight padding, but generous margins between sections

### Typography
- **Headings:** Cormorant — an elegant serif that evokes hand-lettered calligraphy, used for all titles, card headers, and chat messages (the "handwritten letter" quality)
- **Body:** Nunito Sans — a soft, rounded sans-serif that complements the organic aesthetic without competing with the serif headings
- **Monospace:** IBM Plex Mono — used sparingly in the schema planner for field names and data types

### Color Palette
- **Background (#fefcfa):** Warm white — like slightly aged watercolor paper
- **Text (#3a3535):** Warm dark brown, never harsh black
- **Surface (#ffffff):** Pure white for elevated cards and panels
- **Accent (#d4889a):** Blush pink — the primary watercolor pigment, used for active states, primary buttons, and the main wash
- **Accent2 (#8baa8b):** Sage green — the complementary pigment, used for success states, secondary washes, and nature-themed elements
- **Border (#e8dde8):** Soft lavender-gray, like the faint edge of a dried watercolor stroke
- **Lavender (#c7a4cc):** Tertiary pigment for variety in washes and accents
- **Peach (#e8c4a0):** Warm accent for fourth-column kanban headers and occasional warmth

### Interaction Profile

| Interaction | Implementation | Detail |
|---|---|---|
| **buttonHover** | watercolor-bleed-fill | Radial gradient follows cursor position, creating a wash that bleeds slightly beyond borders via CSS `::before` pseudo-element |
| **buttonClick** | paint-splatter-micro | JS creates a small circular element at click point with splatter burst animation |
| **cardHover** | wash-border-bleed | CSS `::after` with gradient mask creates a watercolor border bleed effect on hover |
| **pageTransition** | watercolor-wash-wipe | Full-screen overlay with radial pastel gradients sweeps left-to-right |
| **scrollReveal** | paint-stroke-reveal | GSAP ScrollTrigger fades and slides content up as it enters viewport |
| **navItemHover** | wash-highlight-appear | CSS radial gradient background appears behind nav item |
| **navItemActive** | paint-dot-indicator | 6px watercolor dot with glow shadow beside active item |
| **inputFocus** | soft-blush-border-glow | Border color transitions to accent with 4px spread box-shadow and gaussian blur |
| **toggleSwitch** | smooth-slide-soft | GSAP-enhanced thumb slide with slow easing and pastel color change |
| **tooltips** | soft-cloud-popup | Tippy.js with custom cloud-like styling — rounded corners, soft shadow, blurred edge glow |
| **loadingState** | paint-drip-fill | Three colored drips that scale vertically in sequence, like watercolor filling from above |
| **idleAmbient** | color-wash-drift | Canvas-based slow-drifting radial gradient blobs in pastel colors |
| **microFeedback** | petal-float-away | Small petal shapes that float upward and fade on success actions |

### Content Persona: Wellness Lifestyle Brand

All fake data is themed around a wellness practice:
- **Projects:** Morning Ritual Redesign, Sound Healing Workshop, Herbal Tincture Guide, Meditation App Beta, Spring Retreat Planning, Aromatherapy Collection
- **Tasks:** Breathwork sequences, journaling prompts, nature soundscapes, guided meditations, welcome kit packaging
- **Team:** Sage Whitfield, Luna Rivers, River Stone, Willow Chen — names that evoke nature and calm
- **Metrics:** Sessions booked, programs active, ideas in flow
- **Kanban columns:** Seeds, Sprouting, Blooming, Harvested — plant growth metaphors
- **AI Chat:** Named "Muse" with a reflective, poetic voice discussing retreat planning

## Libraries Used

1. **GSAP 3.12.5** + ScrollTrigger — Core animation engine for scroll-driven reveals, accordion collapse/expand animations, card hover lift, whiteboard connector drawing, and chat message entrances. Essential for the liquid motion feel.
2. **Tippy.js 6.3.7** — Tooltip library customized with soft-cloud styling (rounded borders, gaussian blur glow, paper-white background). Used for stat panel tooltips and action hints.
3. **Splitting.js 1.0.6** — Text splitting for per-character cascade reveal animation on view titles. Each character fades and slides up with staggered delay, creating a gentle watercolor-drip text entrance.

## Anti-Repeat Compliance

- Pass 1 used blue-purple blob morphing on white → This pass uses soft pastel watercolor washes (pink, sage, lavender, peach) with no blob morphing
- Pass 2 used deep ocean dark theme with waves → This pass uses a light watercolor white canvas (#fefcfa) background
- Pass 3 used dark chrome/mercury metallic → This pass uses soft pastel painterly aesthetic with warm organic tones
- Pass 3 used magnetic snap interactions → This pass uses soft bleed, paint-stroke, and petal-float interactions
- Pass 3 used terminal-sleek chrome chat → This pass uses handwritten letter watercolor chat with elegant serif typography

## Views

1. **Dashboard** — Watercolor-washed stat panels (inline row) with split-panel activity feed and milestones
2. **Projects** — Gallery grid with unique pastel watercolor header washes per card
3. **Project Workspace** — Canvas layout with brushstroke dividers and pastel section backgrounds
4. **Kanban** — Vertical columns with watercolor-wash headers (Seeds/Sprouting/Blooming/Harvested)
5. **Whiteboard** — Watercolor canvas with paint-splatter nodes and dashed brushstroke connectors
6. **Schema Planner** — Soft diagram with watercolor-washed entity panels and thin painted connection lines
7. **Directory Tree** — Painted tree with gradient branch lines and watercolor-dot leaf nodes
8. **Ideas** — Masonry grid with two-color watercolor blend cards
9. **AI Chat** — Handwritten letter format with watercolor paper messages and brushstroke dividers
10. **Settings** — Single scroll with watercolor section backgrounds transitioning between hues
