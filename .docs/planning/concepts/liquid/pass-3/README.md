# MercuryFi - Liquid Metal Fintech Platform

**Style:** Liquid Motion (Pass 3)
**Variant:** Mercury/Metallic Liquid
**Content Persona:** Fintech Platform
**Uniqueness Profile:** command-palette-center

## Concept Overview

MercuryFi is a premium fintech portfolio management platform that channels liquid mercury and chrome metal as its primary design language. The interface is built on a dark charcoal foundation with silver metallic accents and electric violet highlights. Every surface feels like polished chrome catching ambient light, and every interaction carries the weight and fluidity of liquid metal.

The structural layout uses a **minimal top bar** with a **command palette modal** for navigation (Ctrl+K), centering all content in a **card stack** down the middle of the viewport. This creates a focused, distraction-free workspace where content is the hero and navigation is summoned on demand.

## Design Decisions

### Shell & Navigation
- **Minimal Top Bar**: A thin fixed header with logo, command palette trigger, and user controls. No sidebar, no tab bar.
- **Command Palette Modal**: All navigation happens through a Spotlight/Raycast-style modal opened with Ctrl+K or clicking the search trigger. Keyboard-navigable with arrow keys, Enter to select, Escape to close. Number keys (1-0) provide direct access when no input is focused.
- **Mobile**: The hamburger menu opens the same command palette modal, maintaining a consistent navigation paradigm across breakpoints.

### Visual Language
- **Chrome Gradients**: Headings, logos, and gauge bezels use radial/linear gradients that simulate brushed aluminum and chrome surfaces (inspired by Bang & Olufsen's metallic gradient treatments).
- **Mercury Sheen Sweep**: Cards, rows, and interactive elements feature a diagonal chrome highlight that sweeps across on hover, mimicking light reflecting off a liquid metal surface.
- **Electric Violet Accents**: Active states, scores, and emphasis use `#a78bfa` to pop against the silver-on-charcoal palette.
- **Metallic Status Badges**: Translucent colored badges with 1px tinted borders give a glass-on-metal appearance.

### Typography
- **Space Grotesk**: Used for all headings, labels, and UI chrome. Its geometric forms complement the precision-engineered aesthetic.
- **Inter**: Body text for readability.
- **Fira Code**: Monospaced content for financial figures, timestamps, code, and data fields.

### Content Theming (Fintech Platform)
All fake data reflects a professional fund management and fintech investment platform:
- **Projects** are investment funds (Apex Capital, Meridian Ventures, Nordic Growth LP)
- **Kanban** is a deal pipeline with sourcing, due diligence, term sheet, and closed stages
- **Dashboard** shows AUM, account metrics, transactions, and compliance pipeline
- **Ideas** are investment thesis entries with conviction scores
- **AI Chat** simulates a financial analysis AI assistant ("Mercury AI")
- **Schema Planner** models Account, Transaction, Compliance, and Ledger Entry entities
- **Directory Tree** shows a fintech platform codebase structure
- **Settings** include Bloomberg/Refinitiv integrations and financial security controls

## Interaction Profile (All 13 Implemented)

| Interaction | Implementation | Technique |
|---|---|---|
| **buttonHover** (chrome-reflection-slide) | A chrome highlight sweeps left-to-right across the button using a `::before` pseudo-element with translateX transition | CSS |
| **buttonClick** (magnetic-snap-press) | Button scales to 0.94 on mousedown then springs back with elastic easing | GSAP |
| **cardHover** (mercury-sheen-sweep) | `::after` pseudo-element with chrome gradient translates from -110% to +110% on hover | CSS |
| **pageTransition** (mercury-split-reform) | Page sections animate in with scale(0.96), blur(4px), and opacity 0 reforming to clear | CSS @keyframes |
| **scrollReveal** (metal-drop-coalesce) | Elements start translated, scaled, and blurred, then coalesce into position via GSAP ScrollTrigger | GSAP + ScrollTrigger |
| **navItemHover** (chrome-highlight-sweep) | Command palette items have the same chrome sheen sweep as cards | CSS |
| **navItemActive** (violet-glow-indicator) | Active palette item has a 3px violet left border with inset glow shadow | CSS |
| **inputFocus** (metallic-border-shine) | Input borders gain silver color and dual box-shadow (ring + glow) on focus | CSS |
| **toggleSwitch** (mercury-blob-slide) | Toggle thumb widens during drag (deform effect) and slides with cubic-bezier easing; checked state uses violet gradient | CSS |
| **tooltips** (chrome-bubble-popup) | Tippy.js with custom mercury theme: dark surface background, subtle border, backdrop blur, scale animation | Tippy.js + CSS overrides |
| **loadingState** (mercury-flow-fill) | Loading bar fills with chrome gradient that shifts infinitely, paired with percentage-driven width animation | CSS @keyframes |
| **idleAmbient** (chrome-light-drift) | Canvas with 5 slowly drifting radial gradient orbs (silver + violet) creating subtle light reflections | Canvas 2D |
| **microFeedback** (metal-ding-flash) | Toast notification with violet border, metallic flash box-shadow keyframe, and auto-dismiss | CSS + JS |

## Library Usage

| Library | Version | Purpose |
|---|---|---|
| **GSAP** | 3.12.5 | Button magnetic snap animations, card hover micro-lifts, command palette scale-in, elastic easing |
| **GSAP ScrollTrigger** | 3.12.5 | Scroll-driven reveal animations for the metal-drop-coalesce effect |
| **Tippy.js** | 6.3.7 | Chrome bubble tooltips with custom mercury theme, scale animation, and backdrop blur |
| **Popper.js** | 2.11.8 | Tippy.js dependency for tooltip positioning |

No media assets were downloaded. All visual effects are achieved with CSS gradients, canvas rendering, and SVG inline icons.

## Anti-Repeat Compliance

| Rule | Compliance |
|---|---|
| Pass 1 used light blue-purple blobs on white | This pass uses dark charcoal (#18181b) with silver metallic gradients. No white backgrounds, no colored blobs. |
| Pass 1 used organic blob morphing | This pass uses chrome sheen sweeps and metallic gradient shifts. No blob shapes. |
| Pass 2 used deep ocean blue water theme | This pass uses a chrome/mercury metallic theme. No blue, no water metaphors. |
| Pass 2 used wave/current animations | This pass uses magnetic snap, chrome sweep, and scale/blur transitions. No wave animations. |
| Pass 2 used sonar chat format | This pass uses a terminal-sleek chrome format with metallic sender badges and linear message flow. |

## Uniqueness Profile: command-palette-center

- **shellMode**: minimal-top-bar (thin fixed header, no sidebar)
- **navPattern**: command-palette-modal (Ctrl+K Spotlight-style navigation)
- **contentFlow**: centered-card-stack (max-width 960px, centered)
- **scrollMode**: standard-scroll (native scrolling, no custom scroll hijacking)
- **alignment**: center
- **heroTreatment**: search-hero (greeting + portfolio summary as hero)
- **motionLanguage**: modal-scale-in (palette and pages animate with scale)
- **density**: spacious (generous padding throughout)
- **componentTone**: soft (rounded corners, subtle borders, no sharp edges)

## File Structure

```
pass-3/
  index.html          — Complete HTML with all 10 views
  style.css           — Full CSS with responsive breakpoints
  app.js              — Navigation, interactions, library init
  README.md           — This file
  validation/
    handoff.json      — Structural metadata
    inspiration-crossreference.json — Inspiration mapping
```
