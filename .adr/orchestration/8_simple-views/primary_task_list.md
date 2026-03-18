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

## Phase 2 — Directory Tree: Trinary Source + Export

### 2a. Core Tree CRUD (Manual Mode)
- [ ] Replace mock data with dynamic state backed by artifact API
- [ ] Wire to artifact API (GET/PUT /api/projects/[id]/artifacts/directory-tree/tree.plan.json)
- [ ] Auto-save on changes (debounced PUT)
- [ ] Handle loading/error/empty states
- [ ] Create custom tree from scratch:
  - Add folder button (name input)
  - Add file button inside folders (name input)
  - Rename node: click name to inline-edit
  - Delete node: X button on hover
  - Drag to reorder/reparent nodes (stretch goal — skip if complex)
- [ ] Persist expand/collapse state

### 2b. GitHub Repository Import
- [ ] Import modal with tabs: GitHub / Local / Manual
- [ ] GitHub tab: input for owner/repo or full URL
- [ ] Fetch repo tree via GitHub API (client-side, `GET https://api.github.com/repos/:owner/:repo/git/trees/HEAD?recursive=1`)
- [ ] Convert flat GitHub tree into nested TreeNode[] structure
- [ ] Display fetched tree (replaces or merges with existing)
- [ ] Fetch file contents on click (lazy-load via `GET https://api.github.com/repos/:owner/:repo/contents/:path`)
- [ ] Show file contents in preview panel
- [ ] Save imported tree to artifact API
- [ ] Store import source metadata (githubRepo, importedAt) for re-sync

### 2c. Local Directory Import
- [ ] Local tab in import modal
- [ ] Option A: paste directory tree as text (indented text like `tree` command output)
  - Parse indented lines into TreeNode[] (detect indent level, file vs folder heuristic: trailing `/` or no extension = folder)
- [ ] Option B: upload files via file picker
  - Read file paths from File objects' `webkitRelativePath` (folder upload)
  - Build tree from file paths
  - Read file contents into preview map
- [ ] Merge into current tree or replace

### 2d. Export
- [ ] Export dropdown with options: Text Tree, JSON, Markdown
- [ ] Text tree export: indented ASCII tree (like `tree` command output with `├──`, `└──`)
- [ ] JSON export: raw TreeNode[] as formatted JSON
- [ ] Markdown export: nested bullet list (folders bold, files plain)
- [ ] Preview in modal, copy to clipboard, download as file

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
