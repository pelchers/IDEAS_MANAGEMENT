# RouteKeeper - Pass 5: Motel Neon Roadside

## Concept Overview
A late-night desert highway motel aesthetic for the idea management app. The UI channels buzzing neon signs against dark asphalt backgrounds, flickering vacancy indicators, road-stripe dividers, and the romance of Route 66. Navigation is powered by a central command palette (Ctrl+K) with a minimal top bar shell.

## Style Direction
- **Variant Seed**: motel-neon-roadside
- **Shell**: Minimal top bar with command palette trigger
- **Nav Pattern**: Command palette modal (Ctrl+K)
- **Content Flow**: Centered card stack
- **Density**: Spacious

## Design Decisions

### Layout Architecture
- **Command Palette Navigation**: Instead of traditional sidebar or tab navigation, the app uses a spotlight/command palette modal triggered by Ctrl+K or clicking the search bar. This keeps the interface maximally clean with a minimal top bar occupying only 56px.
- **Centered Card Stack**: All view content flows vertically in a centered column (max 1100px), creating a focused reading experience like scrolling through a roadside attraction guide.
- **Mobile Drawer**: On mobile, a hamburger menu opens a slide-in drawer with neon-accented navigation items.

### Color Palette
- Dark asphalt background (#1a1a1e) provides the "2am highway" foundation
- Cream text (#f5f0e8) against dark backgrounds for high readability
- Teal neon (#00c9b7) as primary accent with CSS text-shadow glow effects
- Hot pink neon (#ff3878) as secondary accent for contrast and variety
- Surface cards (#252528) slightly elevated from the background

### Typography
- **Permanent Marker** for headings - rough, hand-painted motel sign energy
- **Cabin** for body text - clean, geometric, readable at all sizes
- **Source Code Pro** for mono/technical elements - route numbers, timestamps, badges

### Content Persona: Road Trip Travel App
All views are themed as a road trip planning application:
- Dashboard = Motel marquee with neon stat readouts
- Projects = Vintage postcards from different road trips
- Kanban = License plate cards organized by route stops
- Ideas = Polaroid snapshot gallery pinned to corkboard
- AI Chat = CB radio dispatch channel with trucker handles
- Settings = Motel front desk control panel

## Interaction Profile

| Category | Implementation | Description |
|----------|---------------|-------------|
| buttonHover | neon-tube-flicker-on | Border/glow flickers on like a neon tube being powered up |
| buttonClick | neon-buzz-snap | White flash overlay followed by steady glow intensification |
| cardHover | vacancy-sign-glow | Alternating teal/pink border glow animation |
| pageTransition | headlight-sweep-reveal | CSS clip-path sweeps content in from left like headlights |
| scrollReveal | road-sign-zoom-past | Elements scale from 0.88 and settle into place |
| navItemHover | neon-arrow-blink | Blinking neon arrow appears to the left of hovered item |
| navItemActive | vacancy-lit-badge | VACANCY neon badge indicator on active nav item |
| inputFocus | neon-glow-border-teal | Teal glow with pink offset shadow on focused inputs |
| toggleSwitch | light-switch-snap-neon | Snap animation with burst glow on toggle ON |
| tooltips | road-sign-tooltip | Dark green road sign with retroreflective border |
| loadingState | vacancy-sign-animation | V-A-C-A-N-C-Y letters light up sequentially |
| idleAmbient | neon-buzz-flicker | Micro-stutter opacity changes on accent elements |
| microFeedback | check-in-stamp-confirm | CHECKED IN stamp with neon glow halo on navigation |

## Libraries Used
1. **GSAP 3.12.5** - Gauge fill animation, stat counter counting effect
2. **GSAP ScrollTrigger** - Enhanced scroll-driven reveals
3. **Phosphor Icons** (CSS) - Consistent icon set with regular weight

## Inspiration Cross-References
- **Roadtrippers**: Bean-shaped/squiggle decorative elements as neon-sign ornaments around marquee headers
- **Neon Museum Las Vegas**: Deep dark backgrounds with maximum-contrast neon glow text-shadows on all headings
- **El Cosmico Marfa**: Postcard-style content cards with rounded corners, warm borders, and slight rotation

## Views
1. **Dashboard** - Neon stat readouts, road-stripe dividers, vacancy meter, recent road log
2. **Road Trips (Projects)** - Vintage postcard grid with neon-lit names and postage-stamp status badges
3. **Trip Planner (Workspace)** - Route map with city nodes + glove-box sidebar with trip details
4. **Route Board (Kanban)** - License plate cards in DEPARTURE/EN ROUTE/REST STOP/DESTINATION columns
5. **Route Map (Whiteboard)** - Canvas with roadside attraction nodes connected by dashed highway lines
6. **Stop Planner (Schema)** - Gas station map display with town signs and amenity lists
7. **Highway Guide (Directory)** - Interstate highway hierarchy with shield icons at each level
8. **Snapshots (Ideas)** - Polaroid photo gallery with rotation, category markers, and location/date labels
9. **CB Radio (AI Chat)** - Radio dispatch messages with channel numbers, handles, and trucker lingo
10. **Front Desk (Settings)** - Motel control panel with neon toggles, guest profile, and alert controls

## Accessibility
- Body text contrast: #f5f0e8 on #1a1a1e = 14.2:1 (exceeds 4.5:1)
- Body text on surface: #f5f0e8 on #252528 = 11.7:1 (exceeds 4.5:1)
- Teal accent on dark: #00c9b7 on #1a1a1e = 7.8:1 (exceeds 3:1)
- Pink accent on dark: #ff3878 on #1a1a1e = 4.7:1 (exceeds 3:1)
- Mobile touch targets: 44x44px minimum on all interactive elements
- Keyboard navigation: Full Ctrl+K command palette with arrow key support
