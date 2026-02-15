---
name: frontend-design-subagent
description: Generate one isolated frontend concept pass as a full navigable app ideation using plain HTML/CSS/JS with deliberate interaction design, optional media assets, and CDN library integration. Each pass is written from scratch by the AI agent, not stamped from a template.
---

# Frontend Design Subagent

Use this skill for one pass only. Do not blend with other pass outputs.

## Inputs (via Task agent prompt)
- `styleId` - Which style family
- `pass` - Pass number (1-4)
- `outputDir` - Where to write generated files
- `stylePalette` - Colors, fonts, design tokens (with per-pass overrides applied)
- `styleDirection` - Creative brief text
- `uniquenessProfile` - Layout structure flags
- `inspirationReferences` - External site references (specific URLs, not categories)
- `interactionProfile` - Deliberate interaction design choices (see below)
- `contentPersona` - Fake data theme for this pass
- `viewHints` - Per-view component/layout directives
- `antiRepeat` - Explicit list of things NOT to repeat from prior passes
- `librariesCatalog` - Available CDN libraries to choose from
- `assetSources` - Approved media download sources

## Hard Requirements
1. Generate a fully navigable app frontend (not a landing page).
2. Include views for: dashboard, projects, project workspace, kanban, whiteboard, schema planner, directory tree, ideas, AI chat, settings.
3. Each pass must be wholly distinct from every other pass in layout structure, typography, color, spacing rhythm, component language, AND interaction feel.
4. Use plain HTML/CSS/JS with optional CDN libraries for low-friction review.
5. Include responsive behavior for desktop and mobile.
6. Write EVERY line of code from scratch - no shared templates.
7. Background images and media assets are OPTIONAL - use only when they genuinely enhance the style.
8. Animations, transitions, and interactions should be deliberately designed, not generic defaults.

## Interaction Design (Required)

Every pass MUST have deliberately designed interactions across ALL of these categories. The `interactionProfile` input specifies the direction — implement it faithfully.

### Interaction Categories
| Category | What to Design | Examples |
|----------|---------------|----------|
| **buttonHover** | What happens when cursor enters a button | underline-slide-in, background-fill-expand, border-draw, scale-up, glow-pulse, color-invert |
| **buttonClick** | What happens on click/tap | ink-ripple-from-cursor, press-down-spring, flash-feedback, stamp-press, none (instant) |
| **cardHover** | How cards respond to hover | lift-shadow-deepen, 3d-tilt-perspective, border-highlight, scale-slight, glow-edge |
| **pageTransition** | How views switch | crossfade-with-slide, instant-cut, morph-dissolve, flip-card, zoom-through, slide-stack |
| **scrollReveal** | How content appears on scroll | stagger-fade-up, slide-from-left, scale-in, parallax-depth, typewriter-cascade, none |
| **navItemHover** | Nav button hover state | scale-bounce, background-fill, text-weight-shift, icon-wiggle, underline-expand |
| **navItemActive** | Active nav indicator | bold-weight-shift, accent-underline, filled-background, border-left-bar, icon-filled |
| **inputFocus** | Text input focus state | border-glow-pulse, label-float-up, underline-expand, shadow-inset, color-shift |
| **toggleSwitch** | Toggle/switch animation | elastic-thumb-slide, color-flood-fill, flip-3d, snap-with-bounce, slide-smooth |
| **tooltips** | Tooltip/popover entrance | fade-scale-from-origin, slide-from-trigger, instant, typewriter-text |
| **loadingState** | Loading indicators | skeleton-shimmer-sweep, spinner-rotate, progress-bar-fill, pulse-dots, lottie-animation |
| **idleAmbient** | Ambient background motion | floating-particles, breathing-glow, wave-drift, none, subtle-parallax, color-cycle |
| **microFeedback** | Success/error/completion | checkmark-draw, confetti-burst, flash-green, toast-slide-in, shake-on-error |

Each interaction choice must be implemented in CSS and/or JS. Don't just list them — wire them up so they work.

## CDN Libraries (Optional)

Reference: `available-libraries.json` in the references folder.

Pick 0-5 libraries from the catalog based on what genuinely fits the style and interaction profile. Don't use libraries for the sake of using them. Pure CSS is always valid.

When using a library:
- Include the CDN `<script>` or `<link>` tag in `index.html`
- Initialize it in `app.js`
- Document the usage in `README.md`

## Media Assets (Optional)

Reference: `asset-sources.json` in the references folder.

Download assets ONLY when they genuinely enhance the design beyond what CSS can achieve. Rules:
- Store all downloaded files in `assets/` subfolder
- Max 10 assets per pass, max 2MB total
- Prefer transparent PNGs and SVGs over photos
- Prefer SVG illustrations (unDraw, Heroicons) over raster images
- Video backgrounds: at most 1 per pass, hero section only, muted autoplay loop
- Lottie animations: keep each under 50kb
- Never hotlink — download and store locally

## Content Persona

Use the `contentPersona` to theme all fake data. If the persona is "indie-game-studio", then projects should be game titles, tasks should be game dev tasks, metrics should be player counts and build numbers, etc. This makes each pass feel like a different product.

## Anti-Repeat Rules

The `antiRepeat` array lists specific things from prior passes that this pass MUST NOT repeat. Treat these as hard constraints. If a prior pass used a left-rail nav, this pass must not. If a prior pass used stat cards for the dashboard, use a different pattern.

## Files
- `index.html` - Complete HTML with all 10 navigable views
- `style.css` - Full CSS with responsive breakpoints
- `app.js` - Navigation, interactions, library initialization
- `README.md` - Concept overview, design decisions, library usage
- `validation/handoff.json` - Structural metadata
- `validation/inspiration-crossreference.json` - Inspiration mapping
- `assets/` - (Optional) Downloaded media assets

## Playwright Visual Validation (Required)

After generating all files, the orchestrator MUST run the Playwright validation script to capture screenshots of every view at both desktop and mobile viewports. This is a non-negotiable step.

### Required Screenshots Per Pass
- `validation/desktop/<view>.png` — 10 screenshots at 1536x960
- `validation/mobile/<view>.png` — 10 screenshots at 390x844 (2x scale)
- `validation/report.playwright.json` — Structured report with viewport info and screenshot paths

### Script
```bash
node scripts/validate-concepts-playwright.mjs --concept-root <concept-root> --style <style> --pass <pass>
```

A pass is NOT considered complete until all 20 screenshots (10 desktop + 10 mobile) exist on disk.

## Inspiration
- Draw from the provided specific external reference URLs (not generic category pages)
- Apply the aesthetic quality bar from the style direction
- Make design choices that feel authentic to the style family, not generic
- The `takeaway` field on each reference tells you the ONE specific thing to draw from that site
