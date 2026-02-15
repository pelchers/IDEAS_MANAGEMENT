# IdeaHub Diner - Retro 50s Concept (Pass 1)

## Variant Seed
`chrome-diner-jukebox`

## Direction
Diner-booth layout. The app is a chrome-trimmed diner. Navigation is a jukebox selector with flip-card buttons at the bottom of the screen. Content panels have rounded chrome bezels and checkerboard accents. Pastel mint, pink, and cream. Neon-glow hover effects on interactive elements. Each view has a different retro illustration vibe.

## Palette
| Token      | Value     | Usage              |
|------------|-----------|-------------------|
| Background | `#fef5f0` | Warm cream         |
| Text       | `#2a1f3d` | Deep plum          |
| Surface    | `#ffffff` | Card backgrounds   |
| Accent     | `#ff6b8a` | Cherry pink        |
| Accent2    | `#4ecdc4` | Turquoise          |
| Border     | `#e0d4e8` | Soft lavender      |

## Typography
- **Heading**: Fredoka (Google Fonts)
- **Body**: Nunito (Google Fonts)
- **Mono**: Fira Code (Google Fonts)

## Layout Profile
- **Shell**: Bottom jukebox bar navigation
- **Nav Pattern**: Flip-card selector buttons
- **Content Flow**: Themed panels (each view uniquely themed)
- **Scroll**: Slide horizontal between views
- **Alignment**: Center
- **Hero**: Neon marquee header
- **Motion**: Bounce-playful (bouncy CSS transitions, overshoot easing)
- **Density**: Balanced
- **Component Tone**: Soft (generous rounded corners 16-24px)

## Views (10 navigable)
1. **Dashboard** - Speedometer/gauge metaphor, diner menu stat cards, jukebox playlist activity feed
2. **Projects** - Vinyl record sleeve cards, checkerboard background, chrome-bezel search
3. **Project Workspace** - Filing cabinet sidebar, diner booth table surface, highway breadcrumbs
4. **Kanban** - Drive-in menu board columns, order ticket cards, neon column headers, star ratings
5. **Whiteboard** - Graph paper canvas, diner counter toolbar with chrome knob tools
6. **Schema Planner** - TV-shaped entity screens, phone cord relationship lines, channel listings
7. **Directory Tree** - Jukebox song listing with category letters and track numbers
8. **Ideas** - Coin-drop jukebox interaction, postcard display, stamps and diner stickers
9. **AI Chat** - Comic strip speech bubbles, order pad input, pastel-differentiated messages
10. **Settings** - Retro TV control panel, chrome toggle switches, knob-style sliders

## Files
- `index.html` - Full HTML structure with all 10 views
- `style.css` - CSS custom properties, chrome gradients, checkerboard patterns, neon glows
- `app.js` - Navigation switching, hash routing, interactive elements
- `validation/handoff.json` - Structural handoff metadata
- `validation/inspiration-crossreference.json` - Inspiration pattern mapping

## How to Run
Open `index.html` in any modern browser. No build tools required.
