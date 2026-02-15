# Starlight Pictures — Production Hub

## Concept Overview

**Style**: Retro 50s — Drive-In Movie Theater at Night (Pass 3)
**Content Persona**: Indie Movie Studio
**Shell**: Right-rail navigation with vertical dots timeline
**Uniqueness Profile**: `vertical-timeline`

This concept transforms a project management app into a 1950s drive-in cinema experience. The UI evokes the magic of an outdoor movie theater at night — deep purple sky backgrounds, neon yellow marquee lettering with chaser lights, warm projection glow on content panels, film strip dividers, and ticket-stub shaped stat cards.

Every surface feels like it's bathed in the warm light of a film projector cutting through the dark. The navigation uses a vertical dots timeline along the right rail, with a "NOW SHOWING" badge marking the active view.

## Design Decisions

### Palette
- **Background** `#1a1030` — Deep nighttime purple, like the sky at a drive-in
- **Surface** `#251a40` — Slightly lighter purple for cards and panels
- **Accent** `#ffe014` — Neon yellow for marquee lettering and highlights
- **Accent2** `#ff4488` — Hot pink for secondary accents and user messages
- **Text** `#f5f0e8` — Warm cream, like a projection screen

### Typography
- **Headings**: Righteous — Rounded, retro display font with marquee energy
- **Body**: Poppins — Clean, modern readability with a friendly weight
- **Monospace**: Source Code Pro — For catalog numbers, timestamps, and technical content

### Layout Structure
- **Shell**: Right-rail navigation (content flows left, nav fixed right)
- **Nav Pattern**: Vertical dots timeline with connecting line
- **Content Flow**: Timeline-alternating on dashboard, cinematic widescreen on workspace
- **Scroll Mode**: Scroll-snap proximity with spotlight reveals

### Content Persona: Indie Movie Studio
All fake data is themed around an indie film production company called "Starlight Pictures." Projects are films (The Neon Paradox, Echoes of Mercury, Velvet Ruin), tasks are production tasks (location scouting, ADR sessions, VFX plates), team members are crew (directors, DPs, editors), and metrics are production statistics (films in production, crew count, budget usage).

## Interaction Profile

| Category | Implementation | Description |
|----------|---------------|-------------|
| **buttonHover** | `marquee-light-chase` | Dashed border animates around button perimeter like marquee lights |
| **buttonClick** | `projection-flash` | Bright flash with brightness filter and glow, like a projector lamp |
| **cardHover** | `projection-glow-brighten` | Cards brighten and lift as if a projector beam focuses on them |
| **pageTransition** | `film-reel-wipe` | Full-screen wipe with sprocket-hole borders expanding/collapsing |
| **scrollReveal** | `fade-in-spotlight` | Content fades in with upward translate, staggered like a spotlight sweep |
| **navItemHover** | `marquee-underline-chase` | Animated dashed underline chases beneath nav items |
| **navItemActive** | `now-showing-badge` | Active nav item gets a pulsing "NOW SHOWING" badge |
| **inputFocus** | `neon-yellow-glow` | Input border glows neon yellow with layered box-shadows |
| **toggleSwitch** | `film-switch-click` | Toggle compresses briefly like a mechanical projector switch |
| **tooltips** | `ticket-stub-popup` | Tooltip with perforated left border, like a torn ticket stub |
| **loadingState** | `film-countdown-leader` | Classic 5-4-3-2-1 film countdown with rotating circle |
| **idleAmbient** | `projector-dust-particles` | 30 floating dust particles drifting upward in a projector beam |
| **microFeedback** | `star-rating-pop` | Yellow star pops and sparkles, plus confetti burst on success |

## View Highlights

1. **Dashboard**: Marquee header with chaser lights, ticket-stub stat cards, Now Showing hero with catalog number and countdown badge, alternating timeline for recent activity
2. **Projects**: Now Showing / Coming Soon split with horizontal film-strip scroll for current projects, poster grid for upcoming
3. **Project Workspace**: Cinematic widescreen layout with dark gradient "curtains" framing a bright content screen, production milestone strip
4. **Kanban**: Four columns styled as theater aisles (Pre-Production, Shooting, Post-Production, Wrapped) with marquee column headers
5. **Whiteboard**: Storyboard canvas with film-frame cells showing SVG sketch placeholders, organized by cinematic sequences
6. **Schema Planner**: Film credits format with dotted-line connections between roles and names, plus an SVG relationship diagram
7. **Directory Tree**: Movie credits scroll format with hierarchical file tree organized by production departments
8. **Ideas**: Pinterest masonry of movie poster cards, each with a gradient poster art, title, tagline, genre badge, and star rating
9. **AI Chat**: Comic panel layout with speech bubbles (pink for user, yellow for AI), film grain texture overlay, character avatars
10. **Settings**: Projection room control panel with grouped equipment sections, toggle switches, select dropdowns, and text inputs

## Library Usage

### GSAP 3.12.5 + ScrollTrigger
- **Purpose**: Animate marquee chaser lights rotation, stagger storyboard cell reveals, cascade credit entries on scroll
- **CDN**: `cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`
- **Why**: The chaser light rotation around the marquee border requires precise angle animation that CSS `@property` doesn't support in all browsers. ScrollTrigger provides reliable scroll-driven reveal orchestration.

### Canvas Confetti 1.9.3
- **Purpose**: Micro-feedback star pop confetti burst on button clicks
- **CDN**: `cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js`
- **Why**: Lightweight, targeted confetti bursts from click position. Enhances the celebratory retro-50s energy without adding weight.

### Splitting.js 1.0.6
- **Purpose**: Per-character animation on marquee title text
- **CDN**: `unpkg.com/splitting@1.0.6/dist/splitting.min.js`
- **Why**: Each letter in "STARLIGHT PICTURES" gets its own glow pulse animation at a staggered delay, creating a chaser-light effect on the text itself.

## Anti-Repeat Compliance

- Pass 1 used light pastels (pink/mint) — this pass uses dark purple + neon yellow nighttime palette
- Pass 1 used diner jukebox transitions — this pass uses film reel/projector transitions
- Pass 2 used space-age googie with turquoise/coral — this pass uses cinematic marquee with purple/yellow
- Pass 2 used atomic orbit animations — this pass uses marquee chaser lights and projector effects
- Pass 1 used diner speech bubble chat, Pass 2 used space-radio chat — this pass uses comic panel chat with film grain
