# Mid-Century Modern — Pass 8: Timeline Exhibit Walkthrough

## Design Concept

This concept reimagines the IDEA-MANAGEMENT platform as a **mid-century modern museum retrospective** where the user walks through chronologically arranged exhibit rooms. Each of the 10 application views is presented as a distinct "room" in the museum, numbered with Roman numerals and introduced by a museum docent who provides context and description.

### Variant Seed: `timeline-exhibit-walkthrough`

The core metaphor is **walking through a museum exhibition in sequence**. A right-rail vertical timeline navigation allows the visitor to move between rooms, with each dot on the timeline representing one exhibit space.

## Layout Architecture

### Shell: Right-Rail Navigation
- The main content occupies the left ~95% of the viewport
- A 72px right rail contains the vertical timeline navigation
- A sticky top header bar provides branding, search, and user avatar
- On mobile, the timeline rail converts to a slide-in drawer

### Navigation: Vertical Dots Timeline
- 10 dots connected by a vertical spine line
- Active dot fills with the accent color (#b8632e)
- Hover reveals a tooltip with the room name (e.g., "IV. Kanban")
- Keyboard arrow keys navigate between rooms
- Each dot represents one of the 10 application views

### Content Flow: Timeline-Alternating
- The workspace view uses a central timeline spine with content nodes alternating left and right
- Other views use appropriate layouts (card grids, kanban columns, chat threads)
- All views share the "exhibit room" header pattern with era tag, title, and description

## Typography

| Role | Family | Usage |
|------|--------|-------|
| Heading | DM Serif Display | View titles, card headings, exhibit room names |
| Body | Lato | Body text, descriptions, form labels |
| Mono | IBM Plex Mono | Era tags, classification labels, code references |

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| bg | #f8f3ea | Page background, warm museum-gallery cream |
| text | #2c1e0f | Primary text, deep warm brown |
| surface | #ede4d3 | Card backgrounds, sidebar tints |
| accent | #b8632e | Primary actions, active states, exhibit labels |
| accent2 | #3a7c5f | Success states, secondary indicators |
| border | #c8b898 | Borders, dividers, inactive timeline elements |

## Interaction Design

- **Page transitions**: Content slides up in a cascade pattern, with each child element staggered by 60ms
- **Card hover**: Cards lift 3px with expanding warm shadow
- **Timeline dots**: Grow from 14px to 18px on hover with a warm glow
- **Input focus**: A golden underline draws from left to right using a CSS pseudo-element
- **Toggle switches**: Smooth 280ms slide with amber accent indicator
- **Scroll reveal**: Timeline nodes animate in from alternating sides (left, then right)
- **Loading state**: Three dots pulse in warm amber sequence

## Content Persona: Museum Docent

Each view is introduced as if by a knowledgeable museum guide. The language is:
- Educational and informative
- Warm and unhurried
- Using museum terminology ("exhibit," "collection," "gallery," "archive")
- Referencing the creative process and design history

## Responsive Strategy

| Breakpoint | Behavior |
|------------|----------|
| 1536px+ | Expanded padding, wider timeline rail (80px) |
| 1024px | 2-column kanban, timeline nodes collapse to single side |
| 640px | Timeline rail hidden, mobile hamburger drawer, single-column grids |

## Views Implemented

1. **Dashboard** (Room I — The Overview Gallery): 4 stat placards, activity feed, quick actions, milestones
2. **Projects** (Room II — The Project Pavilion): 5 project cards + create card, search, filters
3. **Workspace** (Room III — The Working Studio): Sidebar nav, project details, goals, project timeline
4. **Kanban** (Room IV — The Progress Gallery): 4 columns (Backlog/In Progress/Review/Done), 10 cards
5. **Whiteboard** (Room V — The Drawing Room): Toolbar, 5 containers, SVG connectors
6. **Schema Planner** (Room VI — The Blueprint Chamber): 5 entity nodes, relationship lines
7. **Directory Tree** (Room VII — The Archive): Expandable tree, file details, template config
8. **Ideas** (Room VIII — The Idea Atelier): Capture form, 6 ideas with promote actions
9. **AI Chat** (Room IX — The Conversation Salon): 6 exchanges, 3 tool actions, input bar
10. **Settings** (Room X — The Curator's Office): 5 tabs (Account, Subscription, Preferences, Integrations, Data)

## Anti-Repeat Compliance

This pass explicitly avoids all patterns listed in the anti-repeat directive:
- No horizontal shelf, credenza, walnut panels, or hairpin legs
- No radial center hub, tulip geometry, or orbital ring
- No leather-and-rosewood, Eames lounge, or editorial columns
- No Nelson clock or starburst accents
- No glass house or exposed steel beams
- No Nordic pine, hygge warmth, or candlelight
- No floating dock bar, bottom dock, pill icons, or spring bounce

## File Manifest

- `index.html` — Complete SPA with all 10 views using data-view/data-page attributes
- `style.css` — Full responsive stylesheet (1536px, 1024px, 640px breakpoints)
- `app.js` — Navigation, interactions, chat simulation, directory tree toggle
- `README.md` — This file
- `validation/handoff.json` — Structural metadata and compliance record
- `validation/inspiration-crossreference.json` — Cross-reference with all previous passes
