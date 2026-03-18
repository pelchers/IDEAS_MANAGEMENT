# Primary Task List — 8_simple-views

Session: Simple Views (Ideas + Directory Tree + Settings)
Started: 2026-03-10
Design Fidelity: Faithful (pass-1 brutalism-neobrutalism)
Design Source: `.docs/planning/concepts/brutalism-neobrutalism/pass-1/index.html` (ideas, directory-tree, settings views)

---

## Phase 1 — Ideas View from Pass-1 ✅

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

## Phase 2 — Directory Tree: Trinary Source + Export ✅

### 2a. Core Tree CRUD (Manual Mode)
- [x] Replace mock data with dynamic state backed by artifact API
- [x] Wire to artifact API (GET/PUT /api/projects/[id]/artifacts/directory-tree/tree.plan.json)
- [x] Auto-save on changes (debounced 800ms PUT)
- [x] Handle loading/error/empty states
- [x] Create custom tree from scratch:
  - Add folder/file button (name + type input, optional parent selector)
  - Add child button (+ on folder hover)
  - Rename node: R button on hover → inline edit
  - Delete node: X button on hover
- [x] Expand/collapse toggle state

### 2b. GitHub Repository Import
- [x] Import modal with tabs: GitHub / Local / Paste Tree
- [x] GitHub tab: input for owner/repo or full URL
- [x] Fetch repo tree via GitHub API (client-side)
- [x] Convert flat GitHub tree into nested TreeNode[] structure
- [x] Display fetched tree (replaces existing)
- [x] Fetch file contents on click (lazy-load from GitHub API)
- [x] Show file contents in preview panel
- [x] Save imported tree to artifact API
- [x] Store import source metadata (githubRepo, importedAt), source badge displayed

### 2c. Local Directory Import
- [x] Local tab in import modal (folder upload with webkitdirectory)
- [x] Paste Tree tab: parse indented text / `tree` command output into TreeNode[]
  - Indent-level heuristic, trailing `/` or no extension = folder
- [x] File upload reads file paths and contents
- [x] Replaces current tree

### 2d. Export
- [x] Export buttons: TXT, MD, JSON
- [x] Text tree export: ASCII tree with `├──`, `└──`, `│` connectors
- [x] JSON export: raw DirectoryTreeData as formatted JSON
- [x] Markdown export: nested bullet list (folders bold, files plain)
- [x] Preview in modal, copy to clipboard, download as file

## Phase 3 — Settings View from Pass-1 ✅ (partial)

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
- [ ] User story validation for directory tree (expand, preview, import, export)
- [ ] User story validation for settings (edit profile, save preferences) — profile works, preferences do not persist
