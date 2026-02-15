# Sweet Counter - Soda Fountain Pharmacy Aesthetic (Pass 4)

## Concept Overview

Sweet Counter channels a 1950s corner drugstore soda fountain, reimagined as a bakery and cafe management tool. The interface uses powder blue and cherry red on a warm cream background, with candy-stripe accents, receipt-paper typography, and chalkboard section headers. The overall atmosphere is cheerful, clean, and wholesome — evoking a Norman Rockwell painting of a soda shop counter.

The content persona is an **artisan bakery and cafe**, with all fake data themed around bread baking, pastry making, recipe development, farm-sourced ingredients, and cafe operations.

## Design Decisions

### Layout Structure (Uniqueness Profile: floating-dock-bar)
- **Shell**: Floating bottom dock navigation, centered single content panel
- **Nav**: Icon-pill dock at the bottom with labeled icons and cherry-dot active marker
- **Content Flow**: Single centered panel (max 960px) for focused, readable content
- **Scroll**: Smooth scroll with staggered slide-in-right reveals

### Color Palette
- Background: `#f5f0e8` (warm cream, like parchment/receipt paper)
- Text: `#2a1f1a` (deep brown, like dark roast coffee)
- Surface: `#ffffff` (clean white counter)
- Accent: `#cc2233` (cherry red — soda fountain, candy stripe)
- Accent2: `#88c8e8` (powder blue — soda glass, sky)
- Border: `#d4cfc5` (tan — countertop, kraft paper)

### Typography
- **Headings**: Cherry Bomb One — bubbly, hand-lettered display font evoking chalkboard menus
- **Body**: Lato — clean, friendly sans-serif for readability
- **Mono**: Courier Prime — receipt paper and ingredient measurement annotations

### View-Specific Design
| View | Design Approach |
|------|----------------|
| Dashboard | Chalkboard header with metric cards as "daily specials", receipt-paper stats section |
| Projects | Menu board grid with striped borders and price-tag status badges |
| Workspace | Counter service layout with stool-tab navigation along the top |
| Kanban | Ingredient shelf columns with recipe cards featuring decorative borders |
| Whiteboard | Chalkboard canvas (dark background) with sticky notes and chalk drawings |
| Schema | Recipe-ingredient-list format with entities as recipes and fields as measurements |
| Directory | Menu hierarchy with section headers and price-dot-leaders to metadata |
| Ideas | Order pad / receipt format with checkboxes and running totals |
| AI Chat | Handwritten notes on napkins — cream background, conversational tone |
| Settings | Soda fountain machine with labeled taps (toggles) and grouped controls |

## Interaction Profile (All Implemented)

| Interaction | Implementation |
|------------|---------------|
| **buttonHover** | Candy-stripe pattern fills the button via CSS `::before` pseudo-element |
| **buttonClick** | Soda fizz particles burst upward from button center using GSAP |
| **cardHover** | Card lifts 4px and rotates 1 degree (coaster pickup) via GSAP spring |
| **pageTransition** | Receipt-roll-down CSS keyframe animation on view change |
| **scrollReveal** | GSAP stagger animation slides items in from the right on view entrance |
| **navItemHover** | Icon spins 360 degrees (counter stool rotation) via CSS transition |
| **navItemActive** | Cherry-red circular dot marker below active icon with pop animation |
| **inputFocus** | Powder-blue tint border with soft glow shadow via CSS focus state |
| **toggleSwitch** | GSAP elastic.out spring on handle (soda tap pull feel) |
| **tooltips** | Recipe card popup with decorative border, positioned below trigger |
| **loadingState** | Straw with bubbles rising animation (CSS keyframes) |
| **idleAmbient** | None (per interaction profile specification) |
| **microFeedback** | Cherry icon pops up on success + canvas-confetti burst on checkboxes |

## Library Usage

### GSAP 3.12.5 + ScrollTrigger
- **Why**: Spring-bounce motion language requires precise easing control. GSAP's `elastic.out` and `back.out` easing functions create the bouncy, playful feel that matches a 1950s soda fountain's optimistic energy.
- **Used for**: Card hover animations (spring lift), scroll reveal stagger, toggle switch elastic bounce, fizz particle trajectories, workspace tab panel entrances, dock item hover scaling.

### Canvas Confetti 1.9.3
- **Why**: Micro-feedback celebrations when completing tasks (checking checkboxes, saving settings). Lightweight confetti bursts in palette colors (cherry red, powder blue, cream).
- **Used for**: Checkbox completion celebrations, save action feedback, cherry-on-top success moments.

### Phosphor Icons (via CSS)
- **Why**: The duotone-capable icon family fits the retro 50s aesthetic with its friendly weight and wide selection. Icons like `ph-cookie`, `ph-bread`, `ph-storefront` match the bakery theme perfectly.
- **Used for**: Navigation dock icons, section headers, entity type indicators, action buttons.

## Anti-Repeat Compliance

- Pass 1 used pink+mint neon diner palette: This pass uses powder blue + cherry red on cream instead
- Pass 1 used jukebox selector navigation: This pass uses floating bottom dock with stool-tab sub-navigation instead
- Pass 2 used space-age googie with boomerang shapes: This pass uses awning stripes and recipe-card shapes instead
- Pass 3 used dark purple nighttime cinema palette: This pass uses light, cheerful soda shop palette instead
- Pass 3 used film-reel transitions: This pass uses receipt-roll-down and fizz-bubble transitions instead
- Pass 3 used comic panel chat: This pass uses handwritten napkin-note chat instead
