# Retro 50s — Pass 7: Carousel Fairground Ride

## Concept Overview

This concept reimagines the IDEA-MANAGEMENT platform as a joyful fairground carousel experience. The entire application feels like navigating between different carnival attractions, with each view representing a unique "ride" at the fairground. The interface uses cotton-candy pastels, chrome accents, and whimsical card-based interactions to create a nostalgic yet professional experience.

## Variant Seed

**carousel-fairground-ride** — The app is structured around a stacked card carousel navigation pattern. Users navigate between views using a floating pill nav bar at the top that resembles ride tickets. Content is organized in card-based layouts that lift, tilt, and flip with carnival-style animations.

## Design Decisions

### Navigation: Floating Pill Toggle Group
- A centered, pill-shaped navigation bar floats at the top of the viewport
- Each nav item styled as a "ticket" with icon and label
- Active state fills the pill with the accent color (#ff6b9d) and adds a soft glow
- On hover, pills get a subtle scale-up with background fill
- Mobile: transforms to a bottom-anchored expandable drawer triggered by a hamburger button
- This is distinct from all prior passes: not a bottom bar (P1), not a swooping top bar (P2), not a right-rail (P3/P6), not a floating dock (P4), not a command palette (P5)

### Layout: Stacked Card Carousel
- Content flows in a single-panel centered layout
- Cards are the primary content containers — they lift, tilt, and bounce on interaction
- Grid-based card arrangements for projects, ideas, and stats
- The "ride badge" system labels each view as a numbered ride attraction
- Maximum content width of 1200px with generous padding

### Color Palette
- **Background (#fff5f0)**: Warm cotton-candy cream — soft and inviting
- **Text (#2d1810)**: Deep warm brown — professional and readable
- **Surface (#ffe8dd)**: Peach-tinted surface for card backgrounds and activity items
- **Accent (#ff6b9d)**: Cotton-candy pink — primary actions and active states
- **Accent2 (#4ecdc4)**: Mint teal — secondary emphasis and success states
- **Border (#f0c4b0)**: Warm peach border — gentle containment

### Typography
- **Fredoka One** (headings): Round, bubbly, carnival-inspired display font
- **Quicksand** (body): Friendly, geometric sans-serif for readability
- **Space Mono** (code): Clean monospace for technical content and schema fields

### Content Persona: Fairground Barker
- Each view is introduced as a "ride" with enthusiastic copy
- View headers include a ride number badge and barker-style description
- Stats are presented as spinning number wheels
- Actions are presented as exciting opportunities rather than mundane tasks

### Interaction Model
- **Button hover**: Puff up with scale(1.08) and pastel shadow bloom via GSAP
- **Button click**: Squash-and-stretch bounce animation (CSS keyframes)
- **Card hover**: Lift and slight tilt (GSAP translateY + rotation)
- **Page transitions**: Horizontal card flip/slide animation between views
- **Scroll reveal**: Elements bounce in from bottom with staggered timing
- **Nav items**: Pill background fills on hover, fully colored when active
- **Input focus**: Border becomes dashed and colored, element bounces subtly
- **Toggle switch**: Carnival lever animation with mechanical bounce
- **Tooltips**: Rounded speech bubbles with pointing arrow
- **Loading state**: Spinning carnival prize wheel with colored segments
- **Idle ambient**: 3 subtle floating confetti particles (CSS-animated)
- **Micro-feedback**: Star burst emoji on successful button actions

## Technical Implementation

### Libraries Used
- **GSAP 3.12.5**: Card hover lift/tilt, button puff-up, progress bar fills, squash-and-stretch click feedback
- **GSAP ScrollTrigger 3.12.5**: Registered but kept lightweight — scroll reveals handled via JS IntersectionObserver pattern for simplicity
- **Phosphor Icons 2.1.1**: Complete icon system for navigation, content types, and decorative elements

### Architecture
- Single-page application with hash-based routing
- All 10 views exist in the DOM, toggled via `active` class
- CSS custom properties for full theme consistency
- Responsive breakpoints: 1024px (tablet), 768px (mobile), 390px (small mobile)
- IIFE pattern to avoid global scope pollution

### Responsive Strategy
- **Desktop (1536px+)**: Full pill nav with labels, 4-column stats grid, side-by-side panels
- **Tablet (1024px)**: Icon-only pill nav, 2-column stats, stacked dashboard panels
- **Mobile (768px)**: Bottom drawer nav, single-column layouts, stacked kanban columns
- **Small mobile (390px)**: Single-column everything, simplified grids

## Anti-Repeat Compliance

| Aspect | This Pass (7) | Differentiated From |
|--------|---------------|---------------------|
| Nav | Floating top pill toggle group | Bottom jukebox bar (P1), swooping parabolic top bar (P2), right-rail dots (P3/P6), floating bottom dock (P4), top bar + command palette (P5) |
| Palette | Cotton-candy pink #ff6b9d + mint #4ecdc4 on warm cream #fff5f0 | Pink+mint neon on light (P1), turquoise+coral on teal (P2), purple+yellow on dark (P3), cherry+blue on cream (P4), teal+magenta on dark (P5), avocado+gold on cream (P6) |
| Typography | Fredoka One + Quicksand + Space Mono | Fredoka+Nunito (P1/P2), Righteous+Poppins (P3), Cherry Bomb+Lato (P4), Permanent Marker+Cabin (P5), Pacifico+Atkinson (P6) |
| Metaphor | Fairground carousel rides | Diner jukebox (P1), Space-age googie (P2), Drive-in cinema (P3), Soda fountain (P4), Roadside motel (P5), Kitchen appliances (P6) |
| Content flow | Stacked card carousel | Themed panels (P1), Boomerang pods (P2), Timeline alternating (P3/P6), Centered single panel (P4), Centered card stack (P5) |
| Page transition | Horizontal card flip/slide | Bounce slide (P1), View-swoop (P2), Film-reel wipe (P3), Receipt roll-down (P4), Headlight sweep (P5), Recipe-box flip (P6) |
| Chat style | Fortune teller tent with rounded bubbles | Comic speech bubbles (P1/P3), Space radio (P2), Napkin notes (P4), CB radio (P5), Recipe exchange (P6) |
| Loading | Spinning carnival prize wheel | Jukebox spinning (P1), Orbital ring (P2), Film countdown (P3), Straw bubbles (P4), Vacancy sign (P5), Oven timer (P6) |

## File Manifest

| File | Purpose |
|------|---------|
| `index.html` | Complete SPA with 10 views, semantic HTML, data-view/data-page attributes |
| `style.css` | Full responsive CSS with custom properties, animations, mobile breakpoints |
| `app.js` | Navigation, interactions, GSAP enhancements, chat simulation, tree toggles |
| `README.md` | This file — design decisions and documentation |
| `validation/handoff.json` | Structural metadata for automated validation |
| `validation/inspiration-crossreference.json` | Inspiration sources with differentiation notes |
