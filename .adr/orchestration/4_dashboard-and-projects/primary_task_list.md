# Primary Task List — 4_dashboard-and-projects

Session: Dashboard and Projects
Started: 2026-03-10
Design Fidelity: Faithful (pass-1 brutalism-neobrutalism)
Design Source: `.docs/planning/concepts/brutalism-neobrutalism/pass-1/index.html` (dashboard + projects views)

---

## Phase 1 — Dashboard View from Pass-1 ✅

- [x] 4 stat cards with colored left borders (watermelon/malachite/amethyst/cornflower)
- [x] Hover transforms: translate(-2px,-2px) rotate(-1deg) + shadow increase
- [x] Chart.js bar chart (react-chartjs-2): Ideas Created (watermelon) + Tasks Completed (malachite)
- [x] Recent Activity feed with 10 items, dashed separators, type icons
- [ ] Mock data matching pass-1 exactly — **chart data is hardcoded, needs real DB aggregates**

## Phase 2 — Projects View from Pass-1 ✅

- [x] Responsive grid of 6 project cards (auto-fill, minmax 320px)
- [x] Status badges (active/review/planning/paused) with color coding
- [x] Progress bars with watermelon fill
- [x] Hover transforms: translate(-3px,-3px) rotate(0.5deg) + shadow-nb-xl
- [x] Cards link to /projects/{id}
- [x] "+ NEW PROJECT" button — functional (creates project)

## Phase 3 — Project Detail + Screenshots

- [x] Project workspace page at /projects/[id] with Editor/Preview/Notes tabs
- [ ] Editor non-functional — static display only (not a real editor)
- [ ] Notes non-functional — hardcoded mock data
- [x] Toolbar buttons, editable content area, notes list
- [x] Playwright screenshots: 6 PNGs (dashboard/projects/workspace x desktop/mobile)
- [x] Session 4 completion review
