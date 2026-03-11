Phase: phase_1
Session: 4_dashboard-and-projects
Date: 2026-03-10
Owner: orchestrator
Status: planned

# Phase 1 — Dashboard View from Pass-1

## Objectives
Build the dashboard page as a faithful 1:1 reproduction of the pass-1 dashboard section.

## Pass-1 Reference
- index.html lines 93-139: Dashboard section structure
- style.css: stat-card, dashboard-grid, activity-item, chart-card classes
- app.js lines 184-241: Chart.js bar chart configuration

## Tasks
- [ ] Build dashboard page at /dashboard with:
  - View header: "DASHBOARD" title + "System overview and recent activity" subtitle
  - 4 stat cards in a row (stat-card styling from pass-1):
    - TOTAL IDEAS (orange/watermelon left border), ACTIVE PROJECTS (green/malachite),
      TASKS IN PROGRESS (pink/amethyst), COMPLETION RATE (white/cornflower)
    - Each with stat-number, stat-label (uppercase), stat-trend (up/down arrow)
    - Hover: translate(-2px,-2px) rotate(-1deg), shadow increase
  - Dashboard grid (1.5fr 1fr):
    - Chart card: "WEEKLY ACTIVITY" title + Chart.js bar chart (react-chartjs-2)
    - Activity card: "RECENT ACTIVITY" title + activity list
- [ ] Use mock data initially (matching pass-1 exactly)
- [ ] Chart.js config matching pass-1: watermelon bars (Ideas Created) + malachite bars (Tasks Completed)
- [ ] Activity feed items with dot indicator + text + timestamp

## Deliverables
- Dashboard page faithful to pass-1
- Chart.js integration with react-chartjs-2
- Phase review

## Validation Checklist
- [ ] 4 stat cards with colored left borders
- [ ] Chart.js bar chart renders
- [ ] Activity feed displays
- [ ] Hover transforms work on stat cards
- [ ] Phase review created
- [ ] Committed
