# Session Orchestration — System Improvements

> Ratified: 2026-03-10. These conventions replace prior implicit behavior and are binding on all orchestrator agents and subagents.

---

## 1. Frontend-First Build Order (Flexible, Not Rigid Stages)

The build pipeline follows the design process: **Planning docs → Design passes → Build**.

```
Project Init (deps, tooling, config, folder structure)
  → Frontend Conversion (design pass → React/Tailwind)
    → Domain Sessions (backend + integration + testing, scoped by concern)
      → Hardening (security, E2E, production readiness) ← CYCLIC
```

### Domain Sessions (the flexible middle layer)

Backend alignment and integration are NOT separate sequential stages. They fold into **domain sessions** scoped by area of concern x complexity:

| Complexity | Example | Session Structure |
|------------|---------|-------------------|
| **High** | Auth (signup, signin, sessions, tokens, guards, password reset) | Own session. Multiple phases covering backend endpoints, frontend wiring, middleware, testing — all in one subfolder. |
| **High** | Kanban board (drag-drop, column CRUD, card CRUD, persistence, real-time) | Own session. Backend artifact API + frontend wiring + E2E tests as phases within it. |
| **Medium** | AI Chat (streaming, session management, tool actions) | Own session. Backend AI endpoint + frontend wiring + error states. |
| **Low** | Resume page + About page + Cover Letter page | Grouped into one session. Markdown rendering, static content, simple API. A few phases cover all of them. |
| **Low** | File tree display + settings page | Grouped together. Simple CRUD, straightforward UI. |

### What remains as distinct stages

- **Project init** — always first. Nothing works without deps and config.
- **Frontend conversion** — always before domain sessions. The design pass becomes the React app.
- **Hardening** — always last. Cross-cutting security, performance, and E2E across everything.

Everything between frontend conversion and hardening is domain sessions in whatever order makes sense for dependency flow.

### Hardening is cyclic

The hardening phase is NOT a one-shot pass. It is a **cyclic feedback loop**:

1. Run full Playwright E2E tests and user-story-based validation across all features
2. Run standard test suites (unit, integration)
3. Collect environment variables and production config from the human in the loop
4. Present results and edge-case failures to the user
5. Accept user feedback on modifications, fixes, and adjustments
6. Agent applies fixes based on feedback
7. Re-run validation → return to step 4
8. Cycle continues until the user confirms production readiness

This means the hardening session's phases are not pre-planned to a fixed count. New phases are created as feedback cycles occur.

---

## 2. Design Fidelity (Inferred From User Prompt, Not Flags)

The orchestrator does NOT require explicit flags like `designFidelity=faithful`. It infers the mode from the user's natural language:

| User Says | Orchestrator Infers |
|-----------|-------------------|
| "build the app exactly like pass-1" / "1:1 from the design pass" / "match the concept" | **Faithful** — subagents read the pass HTML as primary spec, reproduce every layout, component, and interaction |
| "use pass-1 as a style guide" / "reference the design" / "follow the design direction" | **Reference** — subagents use design tokens (colors, fonts, spacing) but build layouts from PRD requirements |
| "adapt this site's look" / "make it look like [url]" / "use this as inspiration" | **External** — orchestrator captures screenshots/references, subagents adapt that visual language to the PRD spec |
| No design mention at all | **From scratch** — subagents build from PRD requirements using whatever styling makes sense |

The orchestrator documents its inference in the session's `notes.md` so it's transparent: "Inferred design fidelity: faithful (user said 'build exactly like pass-1')."

### Context handoff varies by fidelity

**Faithful mode handoff includes:**
- Exact file path to pass HTML (`index.html` lines X-Y for this view)
- Exact file path to pass CSS (`style.css` relevant sections)
- Exact file path to pass JS (`app.js` relevant functions)
- Instruction: "Your React component must reproduce this layout. Same elements, same hierarchy, same interactions, same hover effects. Convert CSS classes to Tailwind utilities. Convert vanilla JS to React state/effects."
- Post-build checklist: "Compare your output against the concept. Every element present? Same layout flow? Same animations? Same responsive behavior?"

**Reference mode handoff includes:**
- Design token summary (colors, fonts, spacing, border style)
- General direction (e.g., "neo-brutalist with thick borders and hard shadows")
- PRD requirements as the primary spec

**External mode handoff includes:**
- Screenshots or URL of reference site
- Instruction: "Adapt this visual language to our PRD requirements. Don't clone the site — apply its design sensibility to our features."

---

## 3. ADR Sessions Organized by Domain/Concern x Complexity

See `system-improvements.md` in `.claude/system_docs/adr_setup/` for the full ADR-specific conventions.

Summary: ADR sessions are scoped by domain, not by build layer. Complex features (auth, kanban, whiteboard) get their own session. Simple features (resume, about, settings) are grouped. Frontend phases come before backend phases within each domain session.

---

## 4. Orchestrator Prompt Parsing

The orchestrator parses the user's initial prompt and extracts:

- **What to build** — inferred from PRD/planning docs or user description
- **Design fidelity** — inferred from language (see above)
- **Design reference** — which pass, which external URL, or none
- **Scope** — full app, specific session, specific phase

Then threads all of this into every subagent's context handoff.

---

## 5. Subagent Context Handoff (Strengthened)

Every subagent receives:

1. Prior phase summary (what was built, files changed, test count, deferred items)
2. Current phase scope (tasks from primary task list)
3. Design fidelity mode with specific instructions per mode
4. Design reference file paths (for faithful: exact HTML sections to convert)
5. Required reading list (CLAUDE.md, PRD, tech spec, task list, prior review)
6. Validation requirements (Playwright PNGs, user stories, report file)
7. App state expectations for next phase

The handoff is NOT advisory. In faithful mode, the design pass is a **primary input**, not a secondary reference. The subagent's required reading list includes the specific HTML section for its view.
