# Pass 8 -- Command-Palette Automat

## Concept Overview
This pass is inspired by Horn & Hardart Automats -- the coin-operated vending wall restaurants of 1950s New York. The main interface is a minimal 56px top bar with a command palette as the primary navigation mechanism. Users type what they want and the automat opens the right "window" to reveal it. Content is displayed in centered card stacks (max-width 1100px), evoking the feeling of looking through little glass doors of an automat. Each view is a different section of the automat wall. Colors are mint green and cream with chrome trim details.

## Variant Seed
`command-palette-automat`

## Content Persona
**Automat Attendant** -- You are the friendly attendant at a gleaming 1950s automat. Everything is behind little glass windows, neatly organized. Each project is a "dish behind glass," each idea is a "coin in the slot." Clean, orderly, cheerful.

## Design Decisions

### Layout & Navigation
- **Minimal top bar** (56px) with logo, command palette trigger, notification button, and avatar
- **Command palette modal** is the primary navigation method, triggered by clicking the search bar or pressing Ctrl+K
- **Centered card stack** content flow at max-width 1100px for a focused, clean reading experience
- **Search hero** at the top of Dashboard, Projects, and Ideas views reinforces the command palette paradigm
- **Mobile**: hamburger button opens a left-side drawer with all 10 navigation items
- No sidebar, no bottom bar, no floating dock -- the command palette is the navigation

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| bg | `#f5f0e8` | Warm cream base (automat wall tile) |
| text | `#1a1a2e` | Deep navy-charcoal (high contrast readable) |
| surface | `#e8f5e8` | Mint green (automat sections, card backgrounds) |
| accent | `#00897b` | Teal-green (primary actions, active states, chrome accents) |
| accent2 | `#ff7043` | Deep coral-orange (secondary highlights, alerts) |
| border | `#b0bec5` | Chrome silver (dividers, card borders, trim) |

### Typography
- **Headings**: Righteous (bold, clean, retro display face)
- **Body**: Nunito (rounded, friendly, highly readable)
- **Monospace**: Courier Prime (timestamps, file sizes, code snippets)

### Interaction Profile
| Interaction | Implementation |
|-------------|---------------|
| Button Hover | Chrome-like shine sweep from left to right (linear gradient overlay) |
| Button Click | Coin-drop depress -- brief translateY(2px) + scale(0.97) |
| Card Hover | Glass door opens slightly -- card lifts with radial-gradient backlight |
| Page Transition | Modal scale-in from center (0.94 to 1.0 with cubic-bezier overshoot) |
| Scroll Reveal | Cards slide up from behind counter (translateY 30px with staggered delays) |
| Nav Item Hover | Chrome highlight sweep via border-color transition |
| Nav Item Active | Mint green background fill with white text |
| Input Focus | Command palette opens with scale-in animation, search icon pulses |
| Toggle Switch | Mechanical flip with scale bounce (0.92 snap then return) |
| Tooltips | Rounded cream tooltip with mint green accent border |
| Loading State | Coin spinning animation (rotateY 360deg infinite) |
| Idle Ambient | Very subtle chrome reflection shimmer line across top bar |
| Micro Feedback | Ding flash toast: checkmark + message in accent-colored pill |

### View Architecture
1. **Dashboard** -- Search hero, 4 stat cards, quick-action buttons, activity feed + goals with progress bars
2. **Projects** -- Search hero, filter tags, card grid with project metadata and collaborator avatars, Create New placeholder
3. **Project Workspace** -- Folder navigation sidebar + metadata grid + goals checklist + tags
4. **Kanban** -- 4-column grid (Backlog/In Progress/Review/Done) with draggable cards, priority badges, assignee avatars
5. **Whiteboard** -- Canvas container with floating toolbar, draggable node containers with connectors
6. **Schema Planner** -- Entity nodes with PK/FK field tables positioned absolutely, relationship arrows
7. **Directory Tree** -- Expandable/collapsible file tree with folder icons, file type colors, size labels
8. **Ideas** -- Capture form (title, description, priority, tags) + filterable idea list with promote/edit actions
9. **AI Chat** -- Centered chat container, alternating user/assistant bubbles, tool action blocks with code formatting, input bar
10. **Settings** -- Tab navigation (Account, Subscription, Preferences, Integrations, Data) with toggle switches, form inputs, integration cards

## Libraries Used

| Library | Version | CDN | Purpose |
|---------|---------|-----|---------|
| Phosphor Icons | 2.1.1 | unpkg | Icon system throughout all views |

No external JS animation libraries used. All interactions are pure CSS transitions and vanilla JS.

## Anti-Repeat Compliance
- Uses command palette modal navigation (NOT diner booth, jukebox, googie swoosh, marquee neon, carousel, pill nav)
- Uses minimal top bar shell (NOT parabolic header, angled tabs, boomerang nav, speaker-box)
- Uses centered card stack layout (NOT drive-in, ranch house, butterfly roof, rocket dashboard)
- Uses mint green + cream + chrome palette (NOT vinyl, tiki, bamboo, fairground pastels)
- Uses automat/vending wall metaphor (NOT diner, carousel, motel, kitchen, cinema)
- Zero background images used

## Responsive Design
- Desktop (1536px): Full command palette trigger in top bar, multi-column grids, absolute-positioned schema/whiteboard
- Tablet (1024px): 2-column stat grid, 2-column kanban, hidden workspace sidebar, horizontal settings tabs
- Mobile (390px): Hidden command trigger (hamburger drawer instead), single-column layouts, stacked kanban columns, relative-positioned schema nodes, 44px+ touch targets
