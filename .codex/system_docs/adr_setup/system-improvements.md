# ADR Setup — System Improvements

> Ratified: 2026-03-10. These conventions replace prior implicit behavior and are binding on the ADR setup agent and any orchestrator that creates ADR sessions.

---

## 1. Sessions Scoped by Domain/Concern x Complexity

ADR orchestration sessions are scoped by **domain** (area of concern), not by build layer (backend/frontend). Each session handles its domain end-to-end: frontend conversion, backend endpoints, integration wiring, and testing — all as phases within a single session.

### Complexity-based grouping rules

1. Read the project's planning docs (PRD, feature list, design pass views) to identify all features
2. Score each feature by complexity:
   - How many backend endpoints does it need?
   - How many UI states/interactions does it have?
   - How many integration points (APIs, third-party services)?
   - Does it have its own data model or share with other features?
3. **High complexity** → own session (auth, kanban, whiteboard, schema planner, AI chat, billing)
4. **Low/medium complexity** → group related features into shared sessions (resume+about+cover-letter, settings+profile, file-tree+directory-display)
5. The grouping is dynamic — determined from the project's actual features, never hardcoded

### Example session structure (idea management app)

```
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
└── 11_hardening/                   ← security, E2E, production
```

### Example session structure (portfolio site)

```
.adr/orchestration/
├── 1_project-init/
├── 2_design-system-and-shell/
├── 3_content-pages/                ← resume + about + experience + education grouped
├── 4_projects-showcase/            ← project gallery, downloads, file storage
├── 5_blog/                         ← medium complexity, own session
├── 6_support-payments/             ← Stripe donations, own session
├── 7_admin-dashboard/              ← complex, own session
├── 8_auth-and-contact/             ← Google OAuth + contact form grouped
└── 9_hardening/
```

These are **examples, not templates**. The ADR agent generates sessions dynamically based on whatever features the PRD describes.

---

## 2. Frontend-First Ordering

Within the overall session structure:

1. **Project init** is always session 1 (deps, tooling, folder structure, DB setup)
2. **Design system and shell** is always session 2 (CSS variables, app layout, navigation — from the design pass)
3. **Domain sessions** follow, ordered by dependency:
   - Auth before anything that requires auth
   - Dashboard/projects before feature views that live under projects
   - Independent features in any order
4. **Hardening** is always the last session

Within each domain session, phases follow frontend-first order:
- Phase 1: Convert the design pass view(s) to React/Tailwind (with mock data)
- Phase 2+: Build backend endpoints to serve the frontend
- Phase N-1: Wire frontend to real API, replace mock data
- Phase N: Domain-specific testing and validation

---

## 3. Hardening Session is Cyclic

The hardening session is NOT a one-shot pass. It operates as a **cyclic feedback loop** between the agent and the human developer:

1. Run full Playwright E2E tests and user-story-based validation across all features
2. Run standard test suites (unit, integration)
3. Collect environment variables and production config from the human in the loop
4. Present results and edge-case failures to the user
5. Accept user feedback on modifications, fixes, and adjustments
6. Agent applies fixes based on feedback
7. Re-run validation → return to step 4
8. Cycle continues until the user confirms production readiness

Hardening phases are not pre-planned to a fixed count. New phases are created dynamically as feedback cycles occur. Each cycle produces a phase review documenting what was tested, what failed, what was fixed, and what the user requested.

---

## 4. Session Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Session folder | `<N>_descriptive-domain-name` (lowercase-kebab with numeric prefix) | `3_auth-flow` |
| Phase plan | `phase_<N>.md` | `phase_1.md` |
| Phase review | `phase_<N>_review.md` | `phase_1_review.md` |
| Orchestration files | `primary_task_list.md`, `prd.md`, `technical_requirements.md`, `notes.md` | — |

Session names describe the **domain**, not the build layer:
- `3_auth-flow` (domain) vs. ~~`3_backend-auth`~~ (layer)
- `5_kanban-board` (domain) vs. ~~`5_feature-views`~~ (grab-bag)

---

## 5. Per-Session Files (unchanged)

Each session still requires the same 4 orchestration files:

| File | Purpose |
|------|---------|
| `primary_task_list.md` | Master checklist of all phases in this session |
| `prd.md` | Product requirements scoped to this session's domain |
| `technical_requirements.md` | Technical constraints for this domain |
| `notes.md` | Decisions, constraints, open questions, design fidelity inference |
