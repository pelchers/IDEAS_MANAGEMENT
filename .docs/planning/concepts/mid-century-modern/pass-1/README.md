# Mid-Century Modern — Pass 1

**Variant Seed**: eames-lounge-workspace
**Generated**: 2026-02-15

## Style Direction

Furniture-logic layout. The workspace feels like sitting in an Eames lounge chair looking at a teak credenza. Rounded-rectangle panels with subtle wood-grain CSS textures. Navigation is a horizontal mid-century credenza shelf with icon-and-label items. Warm amber and olive accents. Generous whitespace. Organic curves on cards but geometric grid underneath.

## Palette

| Token       | Value     | Description    |
|-------------|-----------|----------------|
| Background  | `#faf6ef` | Warm cream     |
| Text        | `#2c1810` | Dark walnut    |
| Surface     | `#ffffff` | White          |
| Accent      | `#c4652a` | Burnt amber    |
| Accent2     | `#1b6b5a` | Olive green    |
| Border      | `#d4c5a9` | Teak           |

## Typography

- **Heading**: Playfair Display (serif)
- **Body**: DM Sans (sans-serif)
- **Mono**: JetBrains Mono (monospace)

## Layout Profile: credenza-shelf

- Shell: Horizontal shelf navigation (top)
- Nav pattern: Icon-and-label row
- Content flow: Card grid 2 columns
- Scroll: Smooth scroll
- Alignment: Center
- Hero: Warm welcome banner
- Motion: Subtle ease (CSS transitions, 200-280ms)
- Density: Spacious
- Component tone: Soft (rounded corners 14px)

## Inspiration References

- **Herman Miller** (hermanmiller.com) — Furniture-grade layout, warm materiality
- **Cereal Magazine** (readcereal.com) — Editorial warmth, considered whitespace
- **Awwwards Sites Of The Day** — Premium polish, immersive transitions

## Files

| File | Purpose |
|------|---------|
| `index.html` | Full HTML with all 10 navigable views |
| `style.css` | CSS custom properties, responsive layout, wood-grain textures |
| `app.js` | Navigation, hash routing, view transitions |
| `validation/handoff.json` | Style metadata and uniqueness flags |
| `validation/inspiration-crossreference.json` | Inspiration references |

## Views

1. **Dashboard** — Welcome banner, stats cards, activity timeline, project health donuts, deadlines
2. **Projects** — 2-column grid of project cards with thumbnails, descriptions, team avatars
3. **Project Workspace** — File tree sidebar + file content/preview area with breadcrumbs
4. **Kanban** — 4-column board (Backlog, In Progress, Review, Done) with draggable card indicators
5. **Whiteboard** — Dotted-grid canvas with sticky notes, shapes, and SVG connections
6. **Schema Planner** — Entity cards with field definitions + horizontal migration timeline
7. **Directory Tree** — Expandable file table with sizes and modification dates
8. **Ideas** — Capture card + idea cards with priority badges, tags, and project links
9. **AI Chat** — Threaded chat with user/AI bubbles + context side panel
10. **Settings** — Tabbed settings with form inputs, toggles, and dropdowns
