# TODO — IDEA MANAGEMENT

> **For the human.** Quick-glance kanban of what's happening, what's next, what's done, and what's deferred.
> Updated by orchestrator agents and during planning conversations.

---

## IN PROGRESS

- [ ] Remaining backend wiring — whiteboard, schema, directory tree, settings persistence
- [ ] Stripe billing UI + wiring (Session 10) — **needs Stripe test keys from user**

---

## TODO NEXT

- [ ] Sync & conflicts UI (Session 11)
- [ ] Hardening — cyclic E2E validation, security audit, UX polish (Session 12)
- [ ] Visual QA pass — compare every view against pass-1 concept screenshots

---

## COMPLETED

### Session 1 — Project Init
- [x] Monorepo verified, pass-1 dependencies installed (Chart.js, SortableJS, Rough.js)
- [x] PostgreSQL database verified, admin account seeded
- [x] Deprecated frontend cleaned, route stubs created

### Session 2 — Design System & Shell (Frontend)
- [x] Tailwind CSS 4 design system with @theme directive (~400 lines globals.css)
- [x] All pass-1 tokens: 11 colors, 6 shadows, 2 font families, 2 animations, 6 component classes
- [x] App shell: hamburger button, 280px drawer with slam animation, 10 numbered nav links
- [x] Top bar: fixed 60px header, route title, search input, notification bell
- [x] Root layout: creamy-milk bg, signal-black text, Space Grotesk font

### Session 3 — Auth Flow (Full Stack)
- [x] Signin page: neo-brutalist form card, wired to POST /api/auth/signin
- [x] Signup page: email + password (12+ chars) + confirm, wired to POST /api/auth/signup
- [x] Auth API verified: all 8 tests pass (signup, signin, me, signout, route protection, session revocation, bad creds, duplicate email)
- [x] proxy.ts route protection confirmed working (307 redirect to /signin)
- [x] Playwright screenshots: 4 PNGs (signin/signup x desktop/mobile)

### Session 4 — Dashboard & Projects (Wired)
- [x] Dashboard: 4 stat cards with colored borders, Chart.js bar chart, 10-item activity feed
- [x] Projects: 6 mock project cards in responsive grid, status badges, progress bars
- [x] Workspace: project detail with Editor/Preview/Notes tabs, toolbar buttons
- [x] Dashboard wired to /api/dashboard (stats from Prisma, audit log activity feed)
- [x] Projects wired to GET /api/projects, create form wired to POST /api/projects
- [x] Workspace loads real project data by ID from GET /api/projects/[id]
- [x] Playwright screenshots: 6 PNGs

### Session 5 — Kanban Board (Wired)
- [x] 4 columns (Backlog/To Do/In Progress/Done) with pass-1 header colors
- [x] 12 mock cards with SortableJS drag-and-drop between columns
- [x] Tag badges (feature/bug/urgent) with color coding
- [x] Board loads from artifact API (GET /api/projects/[id]/artifacts/kanban/board.json)
- [x] Drag state auto-saves via debounced PUT to artifact API
- [x] Playwright screenshots: 2 PNGs

### Session 6 — Whiteboard (Frontend Only)
- [x] HTML5 canvas with 30px grid background, freehand drawing (3px strokes)
- [x] 5 tool buttons (select/draw/rect/text/sticky) with active state
- [x] 4 draggable sticky notes in lemon/watermelon/malachite/amethyst
- [ ] **NOT WIRED**: Drawing and sticky positions don't persist
- [x] Playwright screenshots: 2 PNGs

### Session 7 — Schema Planner (Frontend Only)
- [x] 4 entity cards (Users/Projects/Ideas/Tasks) with field lists
- [x] PK/FK/UQ badges with color coding, IBM Plex Mono field names
- [x] Rough.js hand-drawn relation lines with circle endpoints
- [ ] **NOT WIRED**: Static mock entities, no persistence
- [x] Playwright screenshots: 2 PNGs

### Session 8 — Simple Views (Partially Wired)
- [x] Ideas: 8 mock idea cards, 5 filter chips with working filter logic, priority badges
- [x] Ideas wired to load from artifact API (falls back to mock if empty)
- [x] Directory Tree: expandable file tree with code preview panel
- [x] Settings: Profile form, preference toggles, integrations list, danger zone
- [ ] **NOT WIRED**: Directory tree, settings profile save, preference persistence
- [x] Playwright screenshots: 6 PNGs

### Session 9 — AI Chat (Wired)
- [x] Message thread with user/AI message styling (watermelon/white bubbles)
- [x] Avatar circles (JD for user, AI for bot), auto-scroll
- [x] Text input with Enter to send, Shift+Enter for newline
- [x] OpenRouter AI SDK provider installed
- [x] AI chat wired to real streaming API (POST /api/ai/chat)
- [x] Falls back to mock responses when no AI provider configured (503 fallback)
- [x] AI Configuration card in Settings: OpenRouter OAuth connect + BYOK paste
- [x] AES-256-GCM encrypted API key storage in User model
- [x] OpenRouter OAuth PKCE callback route (/api/ai/openrouter/callback)
- [x] BYOK save/disconnect route (/api/ai/config GET/PUT)
- [x] Playwright screenshots: 2 PNGs

### Infrastructure
- [x] ADR restructured into 12 domain-scoped sessions
- [x] Orchestration system with frontend-first build order, design fidelity inference
- [x] 24 validation screenshots captured across all views
- [x] AI integration decision: OpenRouter OAuth PKCE (primary) + BYOK (fallback)
- [x] Prisma migration: aiProvider enum, encrypted key fields on User model
- [x] Dashboard API route (GET /api/dashboard) for stats + activity

---

## TODO FUTURE

- [ ] Real-time collaboration via WebSockets/SSE
- [ ] Rate limiting on auth and API routes
- [ ] Security headers (X-Content-Type-Options, X-Frame-Options, HSTS)
- [ ] Remove `_dev` token exposure from signup/password-reset before production
- [ ] Account lockout after repeated failed login attempts
- [ ] Production deployment (real PostgreSQL, NODE_ENV=production, Secure cookies)
- [ ] Whiteboard undo/redo
- [ ] Kanban card labels/colors customization
- [ ] User avatar upload
- [ ] Project invite by email
- [ ] Notifications system
- [ ] Dark mode toggle
- [ ] Mobile-optimized whiteboard controls
- [ ] Ollama local AI integration (deferred — adds complexity)

---

## DECISIONS LOG

- **AI Provider**: OpenRouter OAuth PKCE as primary (user connects account, billed to them). BYOK as fallback (paste API key). No mock responses by default — real AI always, simulated only on server errors.
- **Billing**: Stripe for app subscription tiers (Free/Pro/Team). AI costs are separate — handled by OpenRouter on user's own account.
- **Auth**: Custom auth (Prisma + argon2 + session cookies), NOT Clerk. proxy.ts handles route protection.
- **Design Fidelity**: Faithful 1:1 reproduction of pass-1 brutalism-neobrutalism concept.
- **Backend**: Prisma + PostgreSQL with Next.js API routes, NOT Convex.
