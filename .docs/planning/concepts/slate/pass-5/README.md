# Slate Pass 5 — Marble Luxury Banking

## Concept Overview

This concept channels the hushed opulence of a private bank's marble-clad lobby. The UI employs white Carrara marble surfaces with dark green accent panels, brass gold trim on every edge, and the visual weight of old money. Typography is classically elegant with engraved serif headings (Cinzel). Cards appear as marble tiles with gold-foil borders. Navigation floats as a centered pill-toggle group, and every interaction feels deliberate, heavy, and reassuringly expensive — like operating the mechanisms of a vault door.

## Design Decisions

### Layout & Navigation
- **Floating Pill Nav** centered at the top of the viewport with a pill-shaped toggle group. Icons-only on desktop with full labels on hover/mobile expansion. Active state uses a dark green pill with a brass gold bar indicator below.
- **Stacked Card Carousel** on the dashboard with horizontal swiping for metric cards.
- **Center-aligned** content with spacious density and generous negative space (70%+ on hero sections, inspired by Bottega Veneta's ultra-minimal grid).

### Color Palette
| Token    | Value    | Usage                          |
|----------|----------|--------------------------------|
| bg       | #f2ece6  | Page background (warm cream)   |
| text     | #1a2a1a  | Primary text (dark forest)     |
| surface  | #faf7f2  | Card/panel backgrounds         |
| accent   | #1a4a2a  | Headings, nav active, CTAs     |
| accent2  | #b8963a  | Brass gold trim, highlights    |
| border   | #d4cdc0  | Dividers, card edges           |

### Typography
- **Cinzel** (headings) — classically elegant with an engraved quality
- **Libre Baskerville** (body) — refined serif for long-form text
- **IBM Plex Mono** (data) — for reference numbers, badges, and metadata

### Interaction Profile
| Category        | Implementation                                   |
|-----------------|--------------------------------------------------|
| buttonHover     | Gold foil edge reveal — brass border appears with metallic sheen |
| buttonClick     | Vault door press — slow compression with brass flash |
| cardHover       | Marble vein shimmer — polished stone catching light |
| pageTransition  | Vault door swing — rotational pivot revealing new view |
| scrollReveal    | Marble slab slide-in — heavy, slow, weighty momentum |
| navItemHover    | Brass plate engrave — gold-toned background plate |
| navItemActive   | Gold bar indicator — solid brass bar below pill |
| inputFocus      | Brass frame border — gold bevel with crafted metalwork |
| toggleSwitch    | Brass lever heavy toggle — deliberate slide with gold flash |
| tooltips        | Engraved plaque — brass plaque with serif text |
| loadingState    | Weighing scale balance — pans tipping to equilibrium |
| idleAmbient     | Marble light drift — chandelier reflections drifting |
| microFeedback   | Gold seal emboss — VERIFIED stamp in engraved serif |

## Content Persona: Private Banking Finance

All views are populated with realistic private wealth management data:
- Dashboard shows portfolio NAV ($847M), allocation metrics, and recent transactions
- Ledger displays 6 fund entries with AUM, returns, and status
- Partner's Office details the Global Equity Fund with holdings and team
- Vault (Kanban) tracks investment pipeline through Screening/Due Diligence/Approved/Deployed
- Boardroom Canvas maps strategic investment thesis relationships
- Schema shows fund entity structure with notarized certificate sections
- Card Catalog organizes documents in mahogany drawer categories
- Gallery exhibits investment theses as framed artworks
- Correspondence features formal AI advisory dialogue
- Vault Controls configures security, notifications, and preferences

## Libraries Used

| Library   | Version | Purpose                                                |
|-----------|---------|--------------------------------------------------------|
| Anime.js  | 3.2.2   | Staggered card reveals, toggle animations, node hovers |

## Views (10)

1. **Dashboard** — Portfolio overview with hero card, carousel metrics, activity feed
2. **Projects (Ledger)** — Gilt-edged register table with fund entries
3. **Project Workspace (Office)** — Partner's desk with sidebar drawers
4. **Kanban (Vault)** — Safe deposit box grid with brass latches
5. **Whiteboard (Boardroom)** — Strategy nodes connected by brass rails
6. **Schema Planner** — Notarized certificate sections with gold seals
7. **Directory Tree (Catalog)** — Mahogany drawer card catalog
8. **Ideas (Gallery)** — Framed investment theses on marble wall
9. **AI Chat (Letters)** — Formal correspondence with wax seal terminators
10. **Settings (Controls)** — Brass dial controls and marble toggle housings

## Anti-Repeat Compliance

- Pass 1: Dark charcoal carved slate with amber -- This pass uses white marble with dark green and brass gold
- Pass 2: Dark layered strata with gold veins -- This pass uses polished marble surface with brass trim
- Pass 3: Black obsidian with molten red fire -- This pass uses white marble with dark green and gold
- Pass 4: Warm sandstone desert mesa -- This pass uses cool marble luxury banking aesthetic

## Responsive Behavior

- Pill nav collapses to hamburger menu on mobile with full-width dropdown
- All card grids stack to single column below 768px
- Kanban columns stack vertically on mobile
- Touch targets are minimum 44x44px
- Text minimum 14px on mobile
- Sidebar collapses below main content on mobile
- Horizontal scroll enabled for whiteboard canvas on mobile
