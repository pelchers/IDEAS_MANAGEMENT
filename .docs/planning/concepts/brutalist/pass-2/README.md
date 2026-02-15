# Brutalist Pass 2: Stamp-Grid Manifesto

## Concept
A poster/manifesto broadsheet layout for idea management. The application feels like a printed newspaper or political manifesto -- stamps, seals, page numbers, editorial columns, pull-quotes, and classified ad grids. Navigation uses numbered stamp badges in a top bar. Content flows through irregular masonry columns.

## Variant Seed
`stamp-grid-manifesto`

## Layout Profile
`manifesto-masonry`

## How It Differs From Pass 1

| Aspect | Pass 1 (concrete-slab-monolith) | Pass 2 (stamp-grid-manifesto) |
|--------|-------------------------------|-------------------------------|
| Navigation | Fixed left rail sidebar | Top bar with stamp badges |
| Layout | Single-column stack | Irregular masonry (2-3 columns) |
| Content style | Monolithic slab panels | Newspaper/poster editorial |
| Class names | `left-rail`, `stat-card`, `view-*` | `stamp-nav`, `broadsheet-*`, `classified-*` |
| HTML structure | `nav.left-rail` + `main.content-area` | `header.broadsheet-masthead` + `nav.stamp-nav` + `main.broadsheet-content` |
| Typography | Flat section headings | Pull-quotes, oversized index numbers, section markers |
| Special elements | None | Page folios, dispatch items, ink stamps, dot leaders, legal forms |

## Views

1. **Dashboard** (01/DASH) -- Broadsheet front page with headline stats, pull-quotes, and dispatch feed
2. **Projects** (02/PROJ) -- Magazine index with large index numbers and category stamps
3. **Project Workspace** (03/WORK) -- Editorial desk with TOC column and article content
4. **Kanban** (04/KANBAN) -- Classified ad columns with masthead headers
5. **Whiteboard** (05/BOARD) -- Blueprint canvas with stamp-pad toolbar
6. **Schema Planner** (06/SCHEMA) -- Technical entity diagram with monospace field specs
7. **Directory Tree** (07/DIR) -- Table of contents with dot leaders and page references
8. **Ideas** (08/IDEAS) -- Manifesto wall with pinned notices and ink-stamp tags
9. **AI Chat** (09/AI) -- Typewriter correspondence with ruled separators
10. **Settings** (10/SET) -- Government/legal form with article-numbered sections

## Palette

- Background: `#e8e0d0` (aged paper)
- Text: `#1a1a1a`
- Surface: `#f5f0e6`
- Accent: `#ff3b00` (vermillion red)
- Accent2: `#0038ff` (deep blue)
- Border: `#1a1a1a`

## Typography

- Heading: Anton (display/poster)
- Body: Space Grotesk (clean grotesque)
- Mono: IBM Plex Mono (utility/metadata)

## Keyboard Shortcuts

- Keys `1`-`9` and `0` navigate directly to views 1-10
- `Enter` sends a message in AI Chat (Shift+Enter for newline)

## Constraints

- Zero border-radius everywhere
- No background images (raw paper color only)
- No Three.js, no GSAP
- Instant transitions (no animations)
- All navigation via top stamp bar (no sidebar)

## Files

- `index.html` -- Complete single-page application with all 10 views
- `style.css` -- Full stylesheet with manifesto/broadsheet aesthetic
- `app.js` -- Navigation, chat interaction, settings, keyboard shortcuts
- `validation/handoff.json` -- Structural fingerprint and differentiation record
- `validation/inspiration-crossreference.json` -- Traced design elements to inspiration sources

## Inspiration References

- **OFFF Festival** (offf.barcelona) -- Poster language, graphic intensity, stamp aesthetics
- **NTS Radio** (nts.live) -- Data-dense rhythm, utility metadata, compact schedules
- **Awwwards Typography** -- Display-led hierarchy, word-as-interface, editorial conventions
