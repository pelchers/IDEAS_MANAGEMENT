# Hygge Studio — Pass 5: Danish Hygge Warmth

## Concept Overview

This pass reimagines the idea management app as **Hygge Studio**, a cozy Scandinavian furniture brand workspace. The design radiates the warmth of a candlelit Copenhagen living room — soft blush pinks, warm wood tones, and cream backgrounds create an inviting atmosphere. The UI feels like browsing a curated Scandinavian furniture catalog.

## Style Direction

- **Variant Seed:** danish-hygge-warmth
- **Content Persona:** Scandinavian Furniture Brand
- **Shell Mode:** Floating bottom dock
- **Nav Pattern:** Icon-pill dock
- **Content Flow:** Centered single panel
- **Motion Language:** Spring bounce (GSAP + CSS)
- **Density:** Spacious
- **Component Tone:** Soft

## Palette

| Token   | Value     | Usage                        |
|---------|-----------|------------------------------|
| bg      | `#faf5f0` | Warm off-white page background |
| text    | `#3a2e28` | Deep warm brown text         |
| surface | `#fff8f2` | Card/panel backgrounds       |
| accent  | `#d4927a` | Blush pink primary accent    |
| accent2 | `#a08060` | Warm wood secondary accent   |
| border  | `#e8ddd0` | Soft linen border tone       |

## Typography

- **Headings:** Lora (serif) — warm, literary, intimate
- **Body:** Karla (sans-serif) — friendly, clean, readable
- **Mono:** JetBrains Mono — for schema fields and code

## Design Decisions

### Navigation: Floating Bottom Dock
A pill-shaped floating dock at the bottom center of the viewport. Contains all 10 views as icon+label buttons. On mobile, the dock hides and a floating action button reveals it as a wraparound grid.

### Dashboard: Cozy Weather-Widget Stats
The dashboard opens with a gradient hero card showing key metrics in large serif numbers with candlelight glow. Below, weather-widget-style stat cards show category counts with warm icon backgrounds. Knit-pattern dividers separate sections. Recent activity and upcoming milestones complete the view.

### Projects: Bookshelf Display
Projects appear as book spines on a warm wooden shelf. Each spine has a distinct color, serif title (vertical text), and status indicator. A detailed list view sits below for full browsing.

### Project Workspace: Reading Nook
A two-column layout with the main content area as an "open book" (collection overview, piece cards, timeline) and a sidebar as a "wooden side table" (team, notes, budget).

### Kanban: Production Stages Board
Four columns (Prep, Craft, Finish, Ship) with cards as hand-written-feel step cards on warm cream paper. SortableJS enables drag-and-drop between columns.

### Whiteboard: Yarn Board
Nodes connected by dashed yarn-like SVG lines in warm tones. Knit-pattern backgrounds on node shapes. Nodes are draggable and lines redraw dynamically.

### Schema Planner: Cookbook Index
Entity cards styled as recipe category cards on warm cream backgrounds, with fields listed as "ingredients." Color-coded PK/FK indicators.

### Directory Tree: Wooden Drawer Organizer
Collapsible tree with warm-toned folder icons (Phosphor duotone), soft labels in the body font, and indented levels with border-left connectors.

### Ideas: Index Card Filing Cabinet
Cream-colored index cards with rounded colored tabs, organized in a 3-column masonry-like grid. Each card has a title, description, category tag, heart vote count, and author.

### AI Chat: Letter Writing
Messages styled as handwritten letters on warm cream stationery with blush/wood left borders. Wax-seal-style timestamps. The AI persona is "Studio Companion."

### Settings: Cozy Control Panel
Grouped sections with warm wood-tinted headers. Toggle switches use a wool-stretch animation (thumb elongates before snapping). Generous spacing and rounded controls.

## Interaction Profile

| Category       | Implementation                                                  |
|----------------|----------------------------------------------------------------|
| buttonHover    | Gentle warm candlelight glow (box-shadow radiance)             |
| buttonClick    | Cushion-press soft (scale down + inset shadow, spring easing)  |
| cardHover      | Candlelight shadow dance (animated shadow keyframes)           |
| pageTransition | Soft curtain draw (translateX + opacity, like linen curtain)   |
| scrollReveal   | Warm fade rise (translateY + sepia filter settling)            |
| navItemHover   | Wood-grain highlight (pseudo-element gradient bg)              |
| navItemActive  | Candle flame dot (flickering border-radius dot animation)      |
| inputFocus     | Warm wool border glow (fuzzy box-shadow in blush tone)         |
| toggleSwitch   | Wool stretch toggle (thumb width stretches on active)          |
| tooltips       | Linen card tooltip (Tippy.js with knit-pattern bg)            |
| loadingState   | Coffee cup steam rise (SVG cup + animated CSS steam wisps)     |
| idleAmbient    | Candle flicker ambient (radial gradient overlay + GSAP glow)   |
| microFeedback  | Heart warmth pulse (toast with pulsing heart icon)             |

## Libraries Used

| Library     | Version | Purpose                                              |
|-------------|---------|------------------------------------------------------|
| GSAP        | 3.12.5  | Spring bounce dock entrance, ambient glow animations |
| ScrollTrigger | 3.12.5 | Budget bar fill animation on scroll                 |
| Tippy.js    | 6.3.7   | Linen-card tooltips on dock and action buttons       |
| SortableJS  | 1.15.6  | Kanban card drag-and-drop between columns            |
| Phosphor Icons | 2.1.1 | Duotone icons throughout (nav, tree, schema, etc.)  |

## Differentiation from Prior Passes

| Aspect       | Pass 1                | Pass 2                | Pass 3                | Pass 4                | **Pass 5**               |
|--------------|----------------------|----------------------|----------------------|----------------------|--------------------------|
| Navigation   | Horizontal shelf     | Orbital rings        | Floating pill toggle | Fullscreen overlay   | **Floating bottom dock** |
| Layout       | Card grid 2-col      | Hub-and-spoke radial | Card-stack carousel  | Editorial columns    | **Centered single panel**|
| Palette      | Amber + olive        | Amber + olive + mustard | Red + olive + gold + teal | Sage + stone    | **Blush + wood warm**    |
| Typography   | Playfair + DM Sans   | Playfair + DM Sans   | Fraunces + Outfit    | Cormorant + Jost     | **Lora + Karla**         |
| Texture      | Wood grain           | Atomic starburst     | Textile collage      | Minimal/none         | **Knit pattern + linen** |
| Mood         | Workspace-warm       | Atomic-age precision | Vibrant collage      | Sparse sculpture     | **Cozy hygge intimacy**  |
| Motion       | Subtle CSS ease      | Rotational spring    | Card-flip-slide      | Cinematic fade       | **Spring bounce + glow** |

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive at 390px mobile width
- Reduced motion support via `prefers-reduced-motion`
- Keyboard navigation (number keys 1-0 for quick view switching)

## File Structure

```
pass-5/
  index.html                          - Complete HTML with all 10 views
  style.css                           - Full CSS with responsive breakpoints
  app.js                              - Navigation, interactions, library init
  README.md                           - This file
  validation/
    handoff.json                      - Structural metadata
    inspiration-crossreference.json   - Inspiration mapping
```
