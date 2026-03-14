# Primary Task List — 8_simple-views

Session: Simple Views (Ideas + Directory Tree + Settings)
Started: 2026-03-10
Design Fidelity: Faithful (pass-1 brutalism-neobrutalism)
Design Source: `.docs/planning/concepts/brutalism-neobrutalism/pass-1/index.html` (ideas, directory-tree, settings views)

---

## Phase 1 — Ideas View from Pass-1

- [x] Read pass-1 ideas section from index.html, style.css, and app.js
- [x] Build ideas page matching pass-1 exactly:
  - 2-column grid of idea cards
  - Filter chips (ALL, FEATURE, BUG FIX, RESEARCH, DESIGN) with active state management
  - Idea cards with priority badges (high=watermelon, medium=lemon, low=cornflower)
  - Title, description, tags, author, timestamp on each card
  - Click filter chips to filter ideas
- [ ] Quick capture form (one-liner add) — button stub present but non-functional
- [ ] Full idea form (title, description, category, priority) — not implemented
- [ ] Idea CRUD (create, edit, delete)
- [ ] Category management
- [ ] Wire to artifact API

## Phase 2 — Directory Tree View from Pass-1

- [x] Read pass-1 directory-tree section from index.html, style.css, and app.js
- [x] Build directory tree page matching pass-1 exactly:
  - Hierarchical nested file tree with expand/collapse
  - Folder toggle arrows (>/v)
  - File/folder icons
  - File preview panel showing code snippets with syntax highlighting
  - Click file to show preview in right panel
- [ ] Wire to artifact API
- [ ] GitHub API integration (connect repo, browse real file tree)
- [ ] Remove mock file tree data

## Phase 3 — Settings View from Pass-1

- [x] Read pass-1 settings section from index.html and style.css
- [x] Build settings page matching pass-1 exactly:
  - Profile card with form fields
  - Preferences card with toggle switches
  - Integrations card with service list
  - Danger Zone card with destructive actions (red bordered)
- [x] Profile email save works
- [x] AI configuration works
- [ ] Persist preferences to DB
- [ ] Wire integrations (GitHub, Slack, Stripe)
- [ ] Implement export data
- [ ] Implement delete account

## Phase 4 — Simple Views Testing

- [x] Playwright screenshots for all 3 views (desktop + mobile)
- [x] Compare against pass-1 validation PNGs
- [ ] User story validation for ideas (add, filter, edit) — filter works, add/edit do not
- [ ] User story validation for directory tree (expand, preview) — works with mock data only
- [ ] User story validation for settings (edit profile, save preferences) — profile works, preferences do not persist
