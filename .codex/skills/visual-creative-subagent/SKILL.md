---
name: visual-creative-subagent
description: Generate one isolated visual/creative concept pass as a self-contained browser-renderable showcase using HTML/CSS/JS with domain-appropriate libraries. Domains: data-vis (charts/graphs), animation (motion/physics), graphic-design (generative art/3D/illustration). Each pass is written from scratch by the AI agent, not stamped from a template.
---

# Visual Creative Subagent

Use this skill for one pass only. Do not blend with other pass outputs.

## Inputs (via Task agent prompt)
- `domain` - One of: `data-vis`, `animation`, `graphic-design`
- `styleId` - Style within the domain (e.g., "bar-chart", "particle-systems", "globe-3d")
- `pass` - Pass number
- `outputDir` - Where to write generated files
- `stylePalette` - Colors, fonts, design tokens
- `styleDirection` - Creative brief text
- `libraryDirective` - Which CDN library to use (from library-catalog.json)
- `mockData` - Sample data (for data-vis passes)
- `sceneDescription` - What to render (for animation/graphic-design passes)
- `antiRepeat` - Explicit list of things NOT to repeat from prior passes

## Hard Requirements
1. Generate a self-contained HTML showcase page (not an app with navigation).
2. The visualization/animation/graphic must render immediately on page load.
3. Each pass must be visually distinct from every other pass in the same style.
4. Use plain HTML/CSS/JS with the specified CDN library.
5. Include responsive behavior for desktop and mobile.
6. Write EVERY line of code from scratch — no shared templates.
7. The showcase must be interactive where appropriate (tooltips, controls, hover effects).

## Page Structure
Every pass produces a single showcase page with these regions:

### Header Bar
- Domain badge (e.g., "DATA VIS", "ANIMATION", "GRAPHIC DESIGN")
- Style name and pass number
- Library badge showing which library powers this pass

### Main Showcase Area
- Fills 80%+ of the viewport
- The visualization, animation, or graphic renders here
- Must be responsive — scales/adapts to viewport size

### Controls Panel
- **Data-vis**: Filter dropdowns, sort toggles, dataset switcher
- **Animation**: Play/pause button, speed slider, reset button
- **Graphic-design**: Regenerate/randomize button, parameter sliders

### Info Footer
- Technical details: library name, version, render method (Canvas/SVG/WebGL)
- Data source description (for data-vis)
- Brief technique description

## Domain-Specific Guidelines

### Data Visualization
- Use the provided `mockData` faithfully — do not invent different data
- Chart colors must use `stylePalette`, not library defaults
- Include axis labels, legend, title, and tooltips
- Show at least 2 views of the data (e.g., chart + summary table, or chart + sparklines)
- Animated entrance for chart elements
- Responsive: chart reflows on mobile, labels don't overflow

### Animation
- Animation must loop continuously or play indefinitely
- Use `requestAnimationFrame` or library animation loops
- Target 60fps — no jank or frame drops
- Include visible play/pause controls
- The animation fills the showcase area
- For physics: add click/drag interactivity

### Graphic Design
- Render a complete composition — not a sketch or placeholder
- For generative art: include a "Regenerate" button with new random seed
- For 3D: include orbit controls or auto-rotation
- For illustrations: render at high resolution
- Display the random seed or generation parameters

## Quality Standards
1. **No blank canvas**: Visible content must render immediately on load
2. **Responsive**: Works on desktop (1536px) and mobile (390px)
3. **Performance**: Smooth rendering, no memory leaks, no console errors
4. **Polish**: Professional presentation, consistent spacing, clean typography
5. **Working interactivity**: All controls and hover states must function
6. **Library loaded**: CDN script must load successfully (use valid URLs from catalog)
7. **Palette applied**: Colors must match the provided palette, not library defaults

## Files
- `index.html` - Complete HTML with CDN library tags and showcase structure
- `style.css` - Full CSS with responsive breakpoints
- `app.js` - Library initialization, rendering, interaction logic
- `README.md` - Concept overview, library usage, technique description
- `validation/handoff.json` - Domain/style/library metadata

## Playwright Visual Validation (Required)

After generating all files, the orchestrator runs the Playwright validation script:
```bash
node .claude/skills/visual-creative-subagent/scripts/validate-visuals-playwright.mjs --pass-dir <outputDir>
```

### Required Screenshots Per Pass
- `validation/desktop/showcase.png` — Full-page screenshot at 1536x960
- `validation/mobile/showcase.png` — Full-page screenshot at 390x844 (2x scale)
- `validation/report.playwright.json` — Structured report

A pass is NOT considered complete until screenshots exist on disk.
