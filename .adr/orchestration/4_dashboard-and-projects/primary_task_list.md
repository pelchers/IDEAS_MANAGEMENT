# Primary Task List — 4_dashboard-and-projects

Session: Dashboard and Projects
Started: 2026-03-10
Design Fidelity: Faithful (pass-1 brutalism-neobrutalism)
Design Source: `.docs/planning/concepts/brutalism-neobrutalism/pass-1/index.html` (dashboard + projects views)

---

## Phase 1 — Dashboard View from Pass-1

- [ ] Read pass-1 dashboard section from index.html and app.js
- [ ] Build dashboard page matching pass-1 exactly:
  - 4 stat cards (Total Projects/Active Tasks/Ideas Captured/Team Members) with colored left borders (watermelon/malachite/cornflower/amethyst)
  - Aggressive hover transforms on stat cards (translate, rotate -2deg to +2deg, scale 1.02)
  - Weekly Activity bar chart using Chart.js (Mon-Sun, dual datasets: Ideas Created + Tasks Completed)
  - Recent Activity feed with timestamps, colored dot indicators, activity descriptions
- [ ] Wire stat cards to real project/task counts from API
- [ ] Wire activity feed to real audit log data

## Phase 2 — Projects View from Pass-1

- [ ] Read pass-1 projects section from index.html and app.js
- [ ] Build projects page matching pass-1 exactly:
  - 3-column grid of project cards
  - Each card: status badge (active/review/planning/paused), title, description, task count, due date, progress bar
  - Project card hover transforms matching pass-1
  - Create project button/form
  - Search, sort, filter controls
- [ ] Wire to existing project CRUD API

## Phase 3 — Project Detail + Integration

- [ ] Build project overview page at /projects/[id] with links to all subviews
- [ ] Wire project cards to navigate to /projects/[id]
- [ ] Playwright screenshots of dashboard and projects (desktop + mobile)
- [ ] User story validation
