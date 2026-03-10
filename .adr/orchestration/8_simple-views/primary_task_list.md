# Primary Task List — 8_simple-views

Session: Simple Views (Ideas + Directory Tree + Settings)
Started: 2026-03-10
Design Fidelity: Faithful (pass-1 brutalism-neobrutalism)
Design Source: `.docs/planning/concepts/brutalism-neobrutalism/pass-1/index.html` (ideas, directory-tree, settings views)

---

## Phase 1 — Ideas View from Pass-1

- [ ] Read pass-1 ideas section from index.html, style.css, and app.js
- [ ] Build ideas page matching pass-1 exactly:
  - 2-column grid of idea cards
  - Filter chips (ALL, FEATURE, BUG FIX, RESEARCH, DESIGN) with active state management
  - Idea cards with priority badges (high=watermelon, medium=lemon, low=malachite)
  - Title, description, tags, author, timestamp on each card
  - Click filter chips to filter ideas
- [ ] Quick capture form (one-liner add)
- [ ] Full idea form (title, description, category, priority)
- [ ] Wire to artifact API

## Phase 2 — Directory Tree View from Pass-1

- [ ] Read pass-1 directory-tree section from index.html, style.css, and app.js
- [ ] Build directory tree page matching pass-1 exactly:
  - Hierarchical nested file tree with expand/collapse
  - Folder toggle arrows (▶/▼)
  - File/folder icons
  - File preview panel showing code snippets with syntax highlighting
  - Click file to show preview in right panel
- [ ] Wire to artifact API

## Phase 3 — Settings View from Pass-1

- [ ] Read pass-1 settings section from index.html and style.css
- [ ] Build settings page matching pass-1 exactly:
  - Profile card with form fields
  - Preferences card with toggle switches
  - Integrations card with service list
  - Danger Zone card with destructive actions (red bordered)
- [ ] Wire profile section to /api/auth/me
- [ ] Wire billing section to /api/billing/portal

## Phase 4 — Simple Views Testing

- [ ] Playwright screenshots for all 3 views (desktop + mobile)
- [ ] User story validation for ideas (add, filter, edit), directory tree (expand, preview), settings (edit profile)
- [ ] Compare against pass-1 validation PNGs
