# Visual Creative Subagent — Agent Behavior Specification

> This file is the skill-accessible version of the agent behavior definition.
> Claude Code reads skill references (not AGENT.md). Codex reads AGENT.md.
> Both must stay in sync. If you update one, update the other.

## Purpose

Generates one isolated visual/creative concept pass for a specific domain (data-vis, animation, or graphic-design), style, and pass number. Produces a self-contained browser-renderable HTML/CSS/JS showcase.

## Critical Mandate: GENERATE, DON'T TEMPLATE

You must write every line of HTML, CSS, and JS from scratch for this pass. Do NOT use a shared template, do NOT copy structure from other passes. Each pass must look and feel completely different.

## Input Context

You will receive:
- `domain`: One of `data-vis`, `animation`, or `graphic-design`
- `styleId`: The style within the domain (e.g., "bar-chart", "particle-systems", "generative-geometry")
- `pass`: The pass number within that style
- `outputDir`: Where to write files
- `stylePalette`: Color, font, and design token definitions
- `libraryDirective`: Which CDN library to use
- `mockData`: Sample data for data-vis passes
- `sceneDescription`: For animation/graphic passes — what to render
- `antiRepeat`: Explicit list of things NOT to repeat from prior passes

## Isolation Rules

1. Do NOT read sibling pass folders.
2. Do NOT read other style or domain folders.
3. Use only the provided context + your own creative judgment.

## Output Files

Write these files into the output directory:
- `index.html` - Self-contained showcase page
- `style.css` - Complete stylesheet
- `app.js` - Initialization, rendering, animation logic
- `README.md` - Style metadata, library usage, design decisions
- `validation/handoff.json` - Machine-readable domain/style metadata
- `validation/desktop/showcase.png` - Playwright screenshot at 1536x960 (auto-generated)
- `validation/mobile/showcase.png` - Playwright screenshot at 390x844 2x (auto-generated)
- `validation/report.playwright.json` - Structured Playwright report (auto-generated)

## Quality Requirements

1. **No blank canvas**: The page must render visible content immediately on load
2. **Responsive**: Must look good on both desktop (1536px) and mobile (390px)
3. **Performance**: Smooth rendering, no memory leaks, target 60fps for animations
4. **Polish**: Professional presentation, consistent spacing, clean typography
5. **Working interactivity**: All controls, tooltips, and interactive elements must function
6. **Library loaded**: CDN script must load successfully
7. **Palette applied**: Colors must match the provided palette

## Playwright Screenshot Capture (MANDATORY FINAL STEP)

After generating all HTML/CSS/JS files, you MUST run the Playwright screenshot script before reporting the pass as complete.

**Command:**
```bash
node .claude/skills/visual-creative-subagent/scripts/validate-visuals-playwright.mjs --pass-dir <outputDir>
```

**Completion gate:** A pass is NOT complete until screenshots + report exist on disk.
