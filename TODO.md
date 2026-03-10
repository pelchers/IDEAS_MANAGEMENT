# TODO — IDEA MANAGEMENT

> **For the human.** Quick-glance kanban of what's happening, what's next, what's done, and what's deferred.
> Updated by orchestrator agents and during planning conversations. Skim this before diving into code.

---

## IN PROGRESS

_Nothing active right now._

---

## TODO NEXT

- [ ] Configure AI API key (`OPENAI_API_KEY` or `ANTHROPIC_API_KEY`) and test AI chat end-to-end
- [ ] Configure Stripe test keys (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) and test billing flow
- [ ] Build proper project overview/landing page at `/projects/[id]` with links to all subviews
- [ ] Add email service integration (SendGrid, Resend, etc.) for password reset and email verification
- [ ] Visual QA pass — open every view in browser, compare against pass-1 concept screenshots, fix discrepancies

---

## COMPLETED

### Backend Foundation (5 phases)
- [x] Prisma schema audit — 18 tables verified, admin account seeded
- [x] Auth endpoints — signup, signin, signout, refresh, verify-email, password-reset all working (11/11)
- [x] Project CRUD + members — create, list, get, update, delete, member add/remove/role (7/7). Fixed missing PATCH endpoint for member role changes
- [x] Artifact + Sync + AI endpoints — artifact read/write with revision, sync push/pull/force/resolve, AI session CRUD, chat endpoint (9/9). Fixed AI chat error handling for missing API key
- [x] Billing + Proxy + Health — health endpoint, proxy auth enforcement, billing checkout/portal/webhook (7/7). Fixed billing endpoints crashing on missing Stripe keys

### Frontend Shell (4 phases)
- [x] Design system transfer — pass-1 concept CSS fully transferred to globals.css (391 -> 3045 lines). All tokens, components, layouts, animations, responsive breakpoints
- [x] App shell + navigation — `(authenticated)` route group layout, AppShell component with hamburger drawer, sidebar nav, top bar, signout, user info fetch (10/10)
- [x] Auth pages — signin + signup rebuilt with neo-brutalism styling, client-side validation, error handling, redirect flow (9/9)
- [x] Dashboard page — project grid/list views, create form, search/sort/filter, status badges, responsive layout (13/13)

### Feature Views (7 phases)
- [x] Kanban board — columns, cards, HTML5 drag-and-drop, column/card CRUD, artifact API, debounced save (13/13)
- [x] Ideas capture — idea cards grid, quick-add, full form, categories, priority colors, search/filter (15/15)
- [x] Whiteboard — SVG-based canvas, 6 drawing tools, color palette, pan/zoom, text editing, auto-save (24/24)
- [x] Schema planner — entity cards, field CRUD, type dropdown, required/unique toggles, relationship display (21/21)
- [x] Directory tree — nested tree, expand/collapse, file/folder icons, inline rename, delete confirmation, ASCII preview (14/14)
- [x] AI chat — two-panel layout, session CRUD, neo-brutalist chat bubbles, tool action buttons, streaming, not-configured handling (45/45)
- [x] Settings + conflicts — profile display, billing portal link, conflict list with resolve actions (28/28)

### Integration Hardening (5 phases)
- [x] E2E flow validation — full user journey (signup -> artifacts -> signout), all pages load, auth protection, TypeScript clean (30/30)
- [x] Security audit — auth protection on all routes, session security, CSRF via SameSite, no XSS vectors, Stripe webhook validation (24/24)
- [x] UX polish — loading states, error boundaries, field validation, debounced saves across all views. Fixed 14 UX issues (45/45)
- [x] Playwright E2E test suite — 17 tests across 4 spec files, 20 validation screenshots (desktop + mobile). Fixed kanban cardIds null guard
- [x] Production readiness — health endpoint DB check, error logging on auth/project routes, .env.example updated, deployment checklist (6/6)

### Infrastructure
- [x] ADR restructured into 4 longrunning sessions (backend-foundation, frontend-shell, feature-views, integration-hardening)
- [x] Orchestration system updated with context handoff, startup reading, mandatory validation protocols
- [x] Orchestration files synced to .claude/, .codex/, template repo, and 3 external repos

---

## TODO FUTURE

- [ ] Real-time sync — WebSocket or SSE for live updates between multiple clients
- [ ] Rate limiting — on auth endpoints and API routes (security recommendation)
- [ ] Security headers — `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`
- [ ] Remove `_dev` token exposure from signup/password-reset responses before production
- [ ] Account lockout after repeated failed login attempts
- [ ] Production deployment — real PostgreSQL, `NODE_ENV=production`, `Secure` cookie flag
- [ ] Drag-and-drop for directory tree (move files between folders)
- [ ] Whiteboard undo/redo
- [ ] Kanban card labels/colors customization
- [ ] User avatar upload
- [ ] Project invite by email
- [ ] Notifications system
- [ ] Dark mode toggle
- [ ] Mobile-optimized whiteboard controls







## USER NOTES / SAVED AI CHATS

 Got it. Here's the refined plan with your corrections incorporated.                                                                                              

  ---                                                                                                                                                                Revised Understanding — 5 Core Changes
                                                                                                                                                                   
  1. Frontend-First Build Order (Flexible, Not Rigid Stages)                                                                                                       

  The pipeline is frontend-first, but the stages aren't rigid sequential blocks. Backend + integration + testing can collapse into the same session when they share
   a domain concern:

  Project Init (deps, tooling, config, folder structure)
    → Frontend Conversion (design pass → React/Tailwind)
      → Domain Sessions (backend + integration + testing, scoped by concern)
        → Hardening (security, E2E, production readiness)

  The middle layer — "domain sessions" — is where the real flexibility lives. Each session is scoped by area of concern x complexity:

  ┌────────────┬───────────────────────────────────────────────────────┬───────────────────────────────────────────────────────────────────────────────────────┐   
  │ Complexity │                        Example                        │                                   Session Structure                                   │   
  ├────────────┼───────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────┤   
  │ High       │ Auth (signup, signin, sessions, tokens, guards,       │ Own session. Multiple phases covering backend endpoints, frontend wiring, middleware, │   
  │            │ password reset)                                       │  testing — all in one subfolder.                                                      │   
  ├────────────┼───────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────┤   
  │ High       │ Kanban board (drag-drop, column CRUD, card CRUD,      │ Own session. Backend artifact API + frontend wiring + E2E tests all phases within it. │   
  │            │ persistence, real-time)                               │                                                                                       │   
  ├────────────┼───────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────┤   
  │ Medium     │ AI Chat (streaming, session management, tool actions) │ Own session. Backend AI endpoint + frontend wiring + error states.                    │   
  ├────────────┼───────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────┤   
  │ Low        │ Resume page + About page + Cover Letter page          │ Grouped into one session. Markdown rendering, static content, simple API. A few       │   
  │            │                                                       │ phases cover all of them.                                                             │   
  ├────────────┼───────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────┤   
  │ Low        │ File tree display + settings page                     │ Grouped together. Simple CRUD, straightforward UI.                                    │   
  └────────────┴───────────────────────────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────┘   

  Key insight from your feedback: Backend alignment and integration aren't separate sequential stages — they're folded into each domain session. Auth's session    
  includes building the endpoints AND wiring the frontend AND testing the flow. It's one continuous concern.

  The only things that remain as distinct stages are:
  - Project init (always first — nothing works without deps and config)
  - Frontend conversion (always before domain sessions — the design pass becomes the React app)
  - Hardening (always last — cross-cutting security/perf/E2E across everything)

  Everything between frontend conversion and hardening is domain sessions in whatever order makes sense for dependency flow.

  ---
  2. Design Fidelity (Inferred From User Prompt, Not Flags)

  No explicit designFidelity=faithful parameters. The orchestrator reads the user's natural language and infers the mode:

  ┌───────────────────────────────────────────────────────────────────┬────────────────────────────────────────────────────────────────────────────────────────┐   
  │                             User Says                             │                                  Orchestrator Infers                                   │   
  ├───────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤   
  │ "build the app exactly like pass-1" / "1:1 from the design pass"  │ Faithful — subagents read the pass HTML as primary spec, reproduce every               │   
  │ / "match the concept"                                             │ layout/component/interaction                                                           │   
  ├───────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤   
  │ "use pass-1 as a style guide" / "reference the design" / "follow  │ Reference — subagents use the design tokens (colors, fonts, spacing) but build layouts │   
  │ the design direction"                                             │  from PRD requirements                                                                 │   
  ├───────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤   
  │ "adapt this site's look" / "make it look like [url]" / "use this  │ External — orchestrator captures screenshots/references, subagents adapt that visual   │   
  │ as inspiration"                                                   │ language to the PRD spec                                                               │   
  ├───────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤   
  │ No design mention at all                                          │ From scratch — subagents build from PRD requirements using whatever styling makes      │   
  │                                                                   │ sense                                                                                  │   
  └───────────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────────────────┘   

  The orchestrator documents its inference in the session's notes.md so it's transparent: "Inferred design fidelity: faithful (user said 'build exactly like       
  pass-1')."

  Fix in the agent/skill: Instead of a parameter, add a "Design Fidelity Inference" section to the orchestrator's responsibilities. It parses the user's initial   
  prompt, determines the mode, and threads it through to all subagent context handoffs. The skill documents the inference patterns so future orchestrator instances
   make consistent decisions.

  ---
  3. ADR Sessions Organized by Domain/Concern x Complexity

  This stays as I described it — you confirmed it's correct. The ADR agent/skill gets updated with these conventions:

  Session scoping rules:
  1. Read the project's planning docs (PRD, feature list, design pass views) to identify all features
  2. Score each feature by complexity (how many backend endpoints, how many UI states, how many integration points)
  3. High complexity → own session (auth, kanban, whiteboard, schema planner, AI chat)
  4. Low/medium complexity → group related features into shared sessions (resume+about+cover-letter, settings+profile, file-tree+directory-display)
  5. Frontend conversion phases come before their domain's backend phases within each session
  6. Sessions are numbered in dependency order (init first, hardening last, everything else by what depends on what)

  Session naming: Descriptive of the domain, not the build layer:
  .adr/orchestration/
  ├── 1_project-init/
  ├── 2_design-system-and-shell/
  ├── 3_auth-flow/                    ← backend + frontend + testing, all auth
  ├── 4_dashboard-and-projects/
  ├── 5_kanban-board/                 ← complex, own session
  ├── 6_whiteboard/                   ← complex, own session
  ├── 7_simple-views/                 ← ideas + directory-tree + settings grouped
  ├── 8_schema-planner/               ← complex, own session
  ├── 9_ai-chat/                      ← complex, own session
  ├── 10_billing/                     ← medium complexity, own session (Stripe)
  ├── 11_hardening/                   ← security, E2E, production

  Important: These are examples, not hardcoded. The ADR agent generates sessions dynamically based on whatever features the PRD describes. A game project would    
  have completely different sessions than a portfolio site.

  ---
  4. Orchestrator Prompt Parsing + Subagent Threading

  The orchestrator skill accepts the user's natural language prompt and extracts:

  - What to build — inferred from PRD/planning docs or user description
  - Design fidelity — inferred from language (see #2)
  - Design reference — which pass, which external URL, or none
  - Scope — full app, specific session, specific phase

  Then threads all of this into every subagent's context handoff. Each subagent receives:

  Prior phase summary
  + Current phase scope
  + Design fidelity mode (with specific instructions per mode)
  + Design reference file paths (for faithful: exact HTML sections to convert)
  + Required reading list
  + Validation requirements
  + App state expectations for next phase

  ---
  5. Subagent Context Handoff (Strengthened Per Fidelity Mode)

  The context handoff varies by inferred fidelity:

  Faithful mode handoff includes:
  - Exact file path to pass HTML (index.html lines X-Y for this view)
  - Exact file path to pass CSS (style.css relevant sections)
  - Exact file path to pass JS (app.js relevant functions)
  - Instruction: "Your React component must reproduce this layout. Same elements, same hierarchy, same interactions, same hover effects. Convert CSS classes to    
  Tailwind utilities. Convert vanilla JS to React state/effects."
  - Post-build checklist: "Compare your output against the concept. Every element present? Same layout flow? Same animations? Same responsive behavior?"

  Reference mode handoff includes:
  - Design token summary (colors, fonts, spacing, border style)
  - General direction ("neo-brutalist with thick borders and hard shadows")
  - PRD requirements as the primary spec

  External mode handoff includes:
  - Screenshots or URL of reference site
  - Instruction: "Adapt this visual language to our PRD requirements. Don't clone the site — apply its design sensibility to our features."

  ---
  Revised File Changes

  ┌────────────────────────────────────────────────────────┬────────────────────────────────────────────────────────────────────────────────────────────────────┐  
  │                          File                          │                                               Change                                               │  
  ├────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤  
  │ .claude/agents/longrunning-orchestrator-agent/AGENT.md │ Add design fidelity inference logic, frontend-first convention, domain-session structure,          │  
  │                                                        │ strengthened context handoff per fidelity mode                                                     │  
  ├────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤  
  │ .claude/skills/orchestrator-session/SKILL.md           │ Add prompt parsing for fidelity inference, domain session threading, examples of natural language  │  
  │                                                        │ → mode mapping                                                                                     │  
  ├────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤  
  │ .claude/skills/longrunning-session/SKILL.md            │ Add fidelity-aware subagent handoff templates, domain session awareness                            │  
  ├────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤  
  │ .claude/agents/adr-setup/AGENT.md                      │ Add domain-scoping by concern x complexity, frontend-first ordering, dynamic session generation    │  
  │                                                        │ from PRD                                                                                           │  
  ├────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤  
  │ .claude/skills/adr-setup/SKILL.md                      │ Add session scoping heuristics, complexity scoring, grouping rules, naming conventions             │  
  ├────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤  
  │ .claude/system_docs/session_orchestration/README.md    │ Reflect new conventions                                                                            │  
  ├────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤  
  │ .claude/system_docs/adr_setup/README.md                │ Reflect domain-scoping                                                                             │  
  ├────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤  
  │ + all .codex/ mirrors                                  │ Same changes                                                                                       │  
  ├────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤  
  │ + longrunning-session references/templates             │ Update templates to include fidelity-aware sections                                                │  
  └────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────┘  

  What's NOT Changing

  - Playwright validation system (solid)
  - Phase lifecycle (plan → execute → review → archive)
  - Subagent spawning mechanism (queue + hook)
  - TODO tracker integration
  - Existing planning docs or design passes

  ---
  Does this match your vision? If so I'll start writing the file changes.