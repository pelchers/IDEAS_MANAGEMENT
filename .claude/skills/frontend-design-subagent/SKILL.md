---
name: frontend-design-subagent
description: Generate one isolated frontend concept pass as a full navigable app ideation using plain HTML/CSS/JS with deliberate interaction design, optional media assets, and CDN library integration. Each pass is written from scratch by the AI agent, not stamped from a template.
---

# Frontend Design Subagent

Use this skill for one pass only. Do not blend with other pass outputs.

## Inputs (via Task agent prompt)
- `styleId` - Which style family
- `pass` - Pass number
- `outputDir` - Where to write generated files
- `stylePalette` - Colors, fonts, design tokens (with per-pass overrides applied)
- `styleDirection` - Creative brief text
- `uniquenessProfile` - Layout structure flags
- `inspirationReferences` - External site references (specific URLs, not categories)
- `interactionProfile` - Deliberate interaction design choices (see below)
- `contentPersona` - Visual/tonal flavor for the pass (controls how it looks and feels)
- `productContext` - Product data models, terminology, and feature vocabulary (controls what content says)
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
9. Meet ALL Professional Quality Standards (see below) — the orchestrator will visually review screenshots and reject passes that fail.

## Professional Quality Standards (CRITICAL)

Your output will be visually reviewed by examining screenshots. Treat this as a design portfolio piece being reviewed by a senior frontend designer. The following are hard requirements — violations will cause the pass to be rejected and you will need to fix and regenerate.

### 1. No Blank or Empty Views
- **Every single one of the 10 views** must render visible, meaningful content when navigated to.
- A view that shows only a title/heading with an empty content area below is a FAIL.
- Each view must have at minimum: a heading, 3+ content elements (cards, rows, items, panels), and interactive elements.
- Test this mentally: if you navigate to "kanban" and there are no columns or cards visible, that's a blank page.

### 2. Text-to-Background Contrast
- All body text must have a contrast ratio of at least 4.5:1 against its immediate background.
- All heading text must have a contrast ratio of at least 3:1.
- DO NOT place light-colored text on light backgrounds or dark text on dark backgrounds.
- If using background images, patterns, or gradients, ensure text has a solid backing or text-shadow for readability.
- Common mistakes to avoid:
  - Gray text (#999) on white background — too low contrast
  - White text on light pastel backgrounds — unreadable
  - Text over busy patterns without a solid color backing
  - Accent-colored text on similarly-saturated backgrounds

### 3. Mobile Responsive Design
- At 390px width, the layout must be genuinely usable, not just a scaled-down desktop view.
- Navigation must be accessible on mobile (hamburger menu, bottom tab bar, or equivalent).
- No horizontal scrolling should be required to see content.
- Text must be at least 14px on mobile (no microscopic text).
- Touch targets (buttons, links, nav items) must be at least 44x44px.
- Content cards/panels must stack vertically on mobile, not overflow.
- Sidebar navigation must collapse or transform on mobile — a 250px sidebar on a 390px screen is a FAIL.

### 4. Content Population
- Use the `contentPersona` to populate EVERY view with realistic, themed data.
- Dashboard: at least 4 metric/stat elements + a recent activity section.
- Projects: at least 4-6 project items with names, descriptions, status.
- Kanban: at least 3 columns with 2-3 cards each.
- AI Chat: at least 4-6 message exchanges (not just an empty chat input).
- Settings: at least 3 settings groups with real toggle/input controls.
- All other views: meaningful content, not just a heading and a paragraph.

### 5. Layout Integrity
- No elements should visually overlap in a way that makes content unreadable.
- CSS Grid/Flexbox layouts must not break or collapse unexpectedly.
- Fixed/sticky elements (nav bars, headers) must not cover content without proper spacing.
- All views must have proper vertical spacing — content should not be crammed against the top.

### 6. Visual Polish
- Google Fonts must be imported correctly in the `<head>` — verify font names match exactly.
- Incorrect: `font-family: 'Playfair Display'` without the corresponding Google Fonts `<link>` tag.
- All CDN library scripts must load (use valid CDN URLs from the libraries catalog).
- Color values must match the paletteOverrides — don't use default/fallback colors.
- Border-radius, shadows, and spacing should feel intentional and consistent, not random.

### Self-Check Before Completing
Before reporting the pass as complete, mentally walk through each view and ask:
1. Does this view have real content, or is it an empty shell?
2. Can I read all the text clearly against its background?
3. Would this layout work on a phone screen?
4. Does the navigation clearly show which view I'm on?
5. Would a professional designer consider this polished enough for a portfolio?

If ANY answer is "no", fix the issue before completing.

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

## Product Context & Content Persona (Two Independent Layers)

**Product context** defines WHAT content says — the real app's data models, terminology, feature names, view content, column names, metrics, and sample data. Read `references/product-context.md` before generating. All mock content MUST use the app's real data models and feature vocabulary.

**Content persona** defines HOW the pass looks and feels — the visual tone, metaphor, and stylistic flavor. A brutalist pass still feels raw and industrial. A retro-50s pass still feels chrome-diner-atomic. But the kanban board says "Backlog → In Progress → Review → Done" with real task cards, not arbitrary themed content.

The persona shapes the design language; the product context shapes the information displayed.

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
- `validation/desktop/<view>.png` — Full-page screenshot for each of the 10 views at 1536x960
- `validation/desktop/<view>_segment-N.png` — Viewport-height scroll segments for tall pages (auto-generated)
- `validation/mobile/<view>.png` — Full-page screenshot for each of the 10 views at 390x844 (2x scale)
- `validation/mobile/<view>_segment-N.png` — Viewport-height scroll segments for tall pages (auto-generated)
- `validation/report.playwright.json` — Structured report with viewport info, screenshot paths, and segment counts

The script uses smart waiting (networkidle + DOM stability checks + loading overlay dismissal) to ensure all content is fully rendered before capture. Scroll segments break tall pages into viewport-height slices for detailed review.

### Script
```bash
node scripts/validate-concepts-playwright.mjs --concept-root <concept-root> --style <style> --pass <pass>
```

A pass is NOT considered complete until all view screenshots exist on disk. The total count is dynamic — at minimum 20 (10 desktop + 10 mobile full-page), plus additional scroll segments for tall pages.

## Inspiration
- Draw from the provided specific external reference URLs (not generic category pages)
- Apply the aesthetic quality bar from the style direction
- Make design choices that feel authentic to the style family, not generic
- The `takeaway` field on each reference tells you the ONE specific thing to draw from that site
