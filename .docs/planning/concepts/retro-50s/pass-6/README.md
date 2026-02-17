# Pass 6 — Kitchen Appliance Pastel

## Concept Overview
This pass channels a 1950s dream kitchen aesthetic — avocado green appliances, harvest gold countertops, copper accents on cream tile walls. The UI uses kitchen metaphors throughout: recipe cards, appliance dials, fridge magnets, pantry shelves, and cutting board workspaces. Navigation uses a right-rail vertical dots timeline that evokes the familiar look of a kitchen wall-mounted recipe holder.

## Variant Seed
`kitchen-appliance-pastel`

## Content Persona
**Home Recipe Cooking App** — All content is themed around family recipes, kitchen organization, cooking techniques, and meal planning. Projects are recipe collections, tasks are cooking steps, ideas are recipe brainstorms pinned as fridge magnets.

## Design Decisions

### Layout & Navigation
- **Right-rail navigation** with vertical dots timeline pattern (uniqueness profile: `vertical-timeline`)
- Timeline connecting line runs through navigation dots, evoking a recipe step progression
- Active nav items have a "fridge magnet stuck" effect with raised shadow
- Nav hover uses playful magnet wiggle micro-animation
- Mobile: nav slides in from right as drawer with overlay

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| bg | `#faf5e8` | Warm cream base (kitchen wall) |
| text | `#2a2420` | Dark warm brown (readable on cream) |
| surface | `#fff8ee` | Slightly lighter cream (card surfaces) |
| accent | `#6b8a3e` | Avocado green (primary actions, active states) |
| accent2 | `#c4962a` | Harvest gold (secondary highlights, timers) |
| border | `#d4c8a8` | Warm beige (dividers, borders) |

Additional: Copper `#b87333` used for focus rings, pin accents, and decorative headers.

### Typography
- **Headings**: Pacifico (cursive, hand-lettered feel like kitchen chalkboard writing)
- **Body**: Atkinson Hyperlegible (excellent readability, clean and warm)
- **Monospace**: Courier Prime (timer digits, file sizes, recipe measurements)

### Interaction Profile
| Interaction | Implementation |
|-------------|---------------|
| Button Hover | Warm backlit avocado green glow (appliance indicator light) |
| Button Click | Scale-down press with copper flash (oven knob click) |
| Card Hover | Top-edge tilt lift with deepening shadow (recipe card thumb-lift) |
| Page Transition | Perspective rotateY flip (recipe box card flip) |
| Scroll Reveal | Slide-from-left with settle bounce (shelf slide-in) |
| Nav Hover | Playful micro-rotation (magnet wiggle) |
| Nav Active | Raised 3D effect with cast shadow (fridge magnet stuck) |
| Input Focus | Warm copper ring border (copper pot rim) |
| Toggle Switch | Rotational knob with bounce ease (appliance dial turn) |
| Tooltips | Cream paper note with copper pin icon |
| Loading | Vintage oven timer SVG countdown dial |
| Idle Ambient | Warm golden radial gradient pulse (afternoon sunlight) |
| Micro Feedback | Oven timer DING badge with copper flash |

### View Metaphors
1. **Dashboard** → Kitchen Counter with gauge/dial stat displays
2. **Projects** → Recipe Box with tabbed filing cards
3. **Project Workspace** → Cutting Board with spice rack sidebar
4. **Kanban** → Cooking stages (Mise en Place / Prep / Cook / Plate)
5. **Whiteboard** → Meal Planner with checkered tablecloth background
6. **Schema Planner** → Cookbook Index with copper-foil entity headers
7. **Directory Tree** → Pantry Shelves with collapsible hierarchy
8. **Ideas** → Fridge Magnet Board with copper pin accents
9. **AI Chat** → Recipe Exchange with avocado/gold card differentiation
10. **Settings** → Appliance Control Panel with dial knobs and rocker switches

## Libraries Used

| Library | Version | CDN | Purpose |
|---------|---------|-----|---------|
| GSAP | 3.12.5 | cdnjs | Dashboard stat entrance animations, gauge fill |
| ScrollTrigger | 3.12.5 | cdnjs | GSAP plugin for scroll-driven animation registration |
| Canvas Confetti | 1.9.3 | jsDelivr | Micro-feedback celebration on task completion and idea pinning |
| Phosphor Icons | 2.1.1 | unpkg | Icon system throughout navigation and content elements |

## Anti-Repeat Compliance
- Uses avocado green + harvest gold + copper on cream (NOT pink + mint neon from Pass 1)
- Uses right-rail vertical dots timeline nav (NOT bottom jukebox bar from Pass 1, NOT swooping top bar from Pass 2, NOT floating dock from Pass 4)
- Uses kitchen appliance metaphors (NOT diner/jukebox from Pass 1, NOT space-age from Pass 2, NOT cinema from Pass 3, NOT soda fountain from Pass 4)
- Uses warm domestic palette (NOT turquoise/coral from Pass 2, NOT dark purple/yellow from Pass 3, NOT cherry red/blue from Pass 4)
- Uses recipe card flip page transitions (NOT horizontal slide from Pass 1, NOT view-swoop from Pass 2, NOT film-reel from Pass 3, NOT receipt-roll from Pass 4)

## Responsive Design
- Desktop: right-rail navigation with full labels, multi-column grids
- Tablet (768px): nav collapses to slide-out drawer, 2-column grids
- Mobile (390px): single-column stacking, 44px+ touch targets, 14px+ text
