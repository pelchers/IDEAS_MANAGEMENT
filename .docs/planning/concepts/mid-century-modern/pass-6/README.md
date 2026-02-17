# Pass 6: Pop Art Warhol Screen Print

## Concept Overview

This pass takes the Mid-Century Modern style family in a radical pop art direction inspired by Andy Warhol's Factory aesthetic. The UI explodes with electric pink (#ff1493), cyan (#00e5ff), and acid green (#76ff03) on a clean white canvas. Ben-Day dot halftone patterns cover surfaces, thick black outlines (4px borders) frame every element like comic panels, and speech bubble tooltips deliver information with attitude.

The content persona is a **magazine/media brand** called "POP! Studio Magazine" - a culture, fashion, and design publication. All data reflects editorial workflows, issue production, photography shoots, contributor management, and social media campaigns.

## Design Decisions

### Layout Architecture
- **Shell Mode**: Collapsible left sidebar with accordion navigation sections (Overview, Workspace, Tools)
- **Content Flow**: Split-panel detail views within thick comic-panel frames
- **Density**: Compact, with tight spacing and hard edges (no border-radius)
- **Alignment**: Left-aligned content within centered panel frames

### Typography
- **Headings**: Bebas Neue - tall condensed sans-serif, perfect for bold comic/magazine headlines
- **Body**: Rubik - geometric sans with enough weight variation for editorial text
- **Mono**: Space Mono - for data labels, timestamps, and code-like content

### Color System
- **Background**: #ffffff (pure white canvas)
- **Text**: #0a0a0a (near-black for maximum contrast)
- **Accent Primary**: #ff1493 (electric deep pink)
- **Accent Secondary**: #00e5ff (bright cyan)
- **Supporting**: #76ff03 (acid green), #ffea00 (bright yellow)
- **Borders**: #0a0a0a (thick black comic outlines)

All text achieves 4.5:1+ contrast ratio against its background. Colored text on colored backgrounds uses dark overlays or white text to maintain readability.

### Interaction Design

| Interaction | Implementation |
|-------------|---------------|
| Button Hover | Ben-Day halftone dot pattern fills via CSS radial-gradient, scaling from 0 to full |
| Button Click | POW! comic starburst explodes from click position using clip-path polygon |
| Card Hover | Color channel shift - title text gets dual text-shadow in cyan/magenta (misregistered print) |
| Page Transition | Comic panel wipe using CSS clip-path animation (inset reveal) |
| Scroll Reveal | Content appears from blurred/low-contrast state to sharp (halftone resolve) |
| Nav Hover | Background shifts to pink tint, text swaps to cyan |
| Nav Active | Solid black background fill with white text and accent left border |
| Input Focus | Halftone-style box-shadow border in accent color |
| Toggle Switch | SMASH! burst animation using clip-path starburst on state change |
| Tooltips | Comic speech bubble with thick outline, pointed tail via CSS triangles |
| Loading State | CMYK color layers building up sequentially (cyan, magenta, yellow, black) |
| Idle Ambient | Background Ben-Day dots slowly drift and scale via CSS animation |
| Micro Feedback | ZAP! starburst flashes in acid green on success actions |

### Inspiration References Applied
1. **Warhol Museum**: Strict 4-step type scale on monochrome scaffold, letting content color pop
2. **Lichtenstein Foundation**: Visible halftone dot textures, primary colors with heavy black outlines
3. **MoMA Design Store**: Uniform grid layout on white, single high-chroma accent for interactive elements

## Views

1. **Dashboard** - Live ticker, 4 stat panels with halftone backgrounds, engagement chart, activity feed
2. **Projects** - Magazine cover grid with bold halftone hero areas and thick borders
3. **Project Workspace** - 4-panel comic strip layout with brief, team, milestones, and notes
4. **Kanban** - 4-column production queue with color-coded headers and halftone card strips
5. **Whiteboard** - Pop art gallery canvas with Warhol-style nodes and thick connector lines
6. **Schema Planner** - Infographic poster with color-blocked entity sections
7. **Directory Tree** - Magazine table of contents with section numbers and rule dividers
8. **Ideas** - Vinyl record shelf with colored sleeves and category dots
9. **AI Chat** - Speech bubble comic exchange with pink AI / cyan user bubbles
10. **Settings** - Magazine masthead settings with toggle groups and team roles

## Libraries Used

No external JavaScript libraries are used in this pass. All interactions are implemented with pure CSS animations and vanilla JavaScript, keeping the build lightweight and dependency-free.

## Content Persona

**Magazine Media Brand**: POP! Studio Magazine, a monthly culture/fashion/design publication. Projects are magazine issues and editorial campaigns. Tasks are production items (photo shoots, copy editing, layout). Team members are editors, photographers, writers, and social strategists. Metrics track impressions, subscribers, engagement, and ad revenue.
