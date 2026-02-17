# Brutalist Pass 5 — Protest Poster Collage

## Concept Overview

**Style:** Brutalist
**Variant Seed:** Protest Poster Collage
**Content Persona:** Activist Nonprofit Organization
**Theme:** DIY punk zine aesthetic channeling grassroots activism energy — torn-edge paper layers, wheat-paste textures, hand-stamped typography, and urgent rally poster energy.

## Visual Direction

The UI channels the raw, urgent energy of a street protest. Cards look ripped from larger posters, navigation uses bold icon-only row with hand-drawn marker highlights, and every surface carries the rough texture of photocopied flyers stapled to a telephone pole. Hot magenta (#ff0066) and electric yellow (#e6ff00) scream against a near-black (#0d0d0d) background.

## Palette

| Token   | Value   | Usage                        |
|---------|---------|------------------------------|
| bg      | #0d0d0d | Page background              |
| text    | #f5f0e0 | Body text (cream-white)      |
| surface | #1a1a1a | Card/panel backgrounds       |
| accent  | #ff0066 | Primary accent (hot magenta) |
| accent2 | #e6ff00 | Secondary accent (electric yellow) |
| border  | #333333 | Borders and dividers         |

## Typography

- **Headings:** Impact (system font, no import needed)
- **Body:** Archivo Narrow (Google Fonts)
- **Mono:** IBM Plex Mono (Google Fonts)

## Layout Structure (Uniqueness Profile)

- **Shell:** Top bar minimal — fixed header with brand and icon nav
- **Nav:** Icon-only row — Phosphor Icons in a centered horizontal strip
- **Content Flow:** Auto-fit tile grid — CSS Grid with auto-fit columns
- **Scroll:** Standard scroll with wheat-paste scroll reveals
- **Density:** Dense — compact stat tiles, tight card spacing
- **Component Tone:** Hard — zero border-radius, solid borders, no soft shadows

## Views (10 total)

1. **Dashboard** — Rally HQ with 6 stat tiles (signatures, campaigns, volunteers, funds, approval, rallies), activity feed, and urgent actions
2. **Projects** — Bulletin board of campaign flyers at random angles with torn-edge clip-paths, status stamps, and progress bars
3. **Project Workspace** — Zine layout with cut-and-paste panels: mission brief, action timeline, crew roster, resources
4. **Kanban** — Corkboard with hand-scrawled cards pinned with pushpins, spray-paint column headers, drag-and-drop via SortableJS
5. **Whiteboard** — Protest sign workshop with picket signs as nodes, string/tape connectors drawn with Rough.js
6. **Schema Planner** — Conspiracy board with pinned documents, red string connections, pushpin markers
7. **Directory Tree** — Stacked flyer piles with expandable folder structures, spray-paint directory headers
8. **Ideas** — Corkboard with pinned index cards at rotation, stamp category marks, upvote system
9. **AI Chat** — Post-it note exchange (yellow for user, magenta for AI) with tape marks and angles
10. **Settings** — Zine control panel with spray-paint dividers, fist-punch toggle switches, marker-scrawled labels

## Interaction Design

| Category | Implementation |
|----------|---------------|
| buttonHover | Stamp-press ink-spread — edges bleed outward via blurred pseudo-element |
| buttonClick | Slam-down stamp mark — translateY + scale with ink splatter ring animation |
| cardHover | Torn-edge lift curl — slight rotation + box-shadow revealing wheat-paste underneath |
| pageTransition | Tear-away rip — diagonal clip-path animation revealing new view |
| scrollReveal | Wheat-paste slap-on — slight rotation + translateY entrance via Anime.js stagger |
| navItemHover | Highlight marker streak — skewed yellow pseudo-element scales in from left |
| navItemActive | Circled marker ring — dashed border-radius circle around active icon |
| inputFocus | Scribble underline — wavy SVG underline via background-image on focus |
| toggleSwitch | Fist-punch toggle — fist emoji slides with scale punch impact |
| tooltips | Speech-bubble shout — jagged clip-path bubble with Impact text |
| loadingState | Megaphone pulse spin — rotating megaphone SVG with emanating sound waves |
| idleAmbient | Poster flutter micro — subtle CSS rotation animation on project flyers |
| microFeedback | Megaphone shake confirm — toast with shaking megaphone icon and "HEARD!" stamp |

## Libraries Used

| Library | Version | CDN | Purpose |
|---------|---------|-----|---------|
| Anime.js | 3.2.2 | cdnjs | Staggered scroll reveals, stat bar fills, vote bounces, toggle impacts |
| Rough.js | 4.6.6 | jsdelivr | Hand-drawn connector lines on whiteboard and conspiracy board |
| SortableJS | 1.15.6 | cdnjs | Kanban card drag-and-drop across columns |
| Splitting.js | 1.0.6 | unpkg | Character-level animation for slogan banner |

## Anti-Repeat Compliance

- **vs Pass 1:** Black background with magenta+yellow, not light paper+red monolithic slabs
- **vs Pass 2:** Protest zine with torn edges and wheat-paste, not newspaper manifesto with blue+red stamps
- **vs Pass 3:** DIY punk poster aesthetic, not terminal CLI with green phosphor
- **vs Pass 4:** Chaotic collage with torn paper textures, not blueprint grid with navy+orange
- Distinct heading font (Impact vs Anton/Playfair/monospace/Barlow Condensed)
- Post-it note chat format vs memo/REPL/radio dispatch from prior passes

## Responsive Breakpoints

- **Desktop:** 1025px+ — full icon nav row, multi-column grids
- **Tablet:** 768-1024px — 2-column kanban, stacked dashboard sections
- **Mobile:** <768px — hamburger menu with slide-down drawer, single-column layout, touch-optimized (44px+ targets)
- **Small Mobile:** <480px — single-column stats, reduced typography scale

## Accessibility

- Contrast ratios: #f5f0e0 on #0d0d0d = 17.3:1 (body text), #ff0066 on #0d0d0d = 5.6:1 (accent), #e6ff00 on #0d0d0d = 16.8:1 (accent2)
- All interactive elements have aria-labels
- Touch targets minimum 44x44px
- Mobile text minimum 14px
- Reduced motion: poster flutter animation respects prefers-reduced-motion via animation-duration
