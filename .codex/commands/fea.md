---
name: fea
description: Run the Feature Expansion workflow — audit, ideate, document, execute, test, report
invocable: true
---

# Feature Expansion (/fea)

Follow the feature-expansion cycle for whatever the user has requested. This is the standard process for adding data, UI, interactivity, or automation enhancements to the app.

## Workflow

1. **Audit** — Query the database for coverage gaps. Review pages/tabs for thin content. Test external APIs for available data.
2. **Ideate** — Present categorized enhancement proposals in chat (Data | UI | Interactivity | Automation). Wait for user approval before proceeding.
3. **Document** — Update `.adr/orchestration/9_DYNAMIC_NAV_AND_DATA_INGESTION/notes.md` with planned work. Create task list with alphabetical series naming.
4. **Execute** — Build procedurally: Schema → Ingestion CLI → API routes → Frontend wiring → Admin panel registration. Add all CLI scripts to `package.json` under `data:*`.
5. **Validate** — Run Playwright E2E tests. Capture screenshots to `user_stories/` validation folders. Verify real data displays (not N/A).
6. **Report** — Present structured completion report in chat with task summaries, data counts, CLI scripts added, test results, and commits.

## Rules
- Always commit after each logical unit of work
- Always add CLI scripts to `package.json` under `data:*` prefix
- Always update orchestration docs before AND after execution
- Expand existing tabs/sections over adding new pages when possible
- Always run E2E tests before reporting completion
- Always log to chat history via `chat-history-convention` skill

## If the user provides a specific request with /fea
Treat the user's message as the enhancement request and begin at Phase 1 (Audit) focused on that specific request. Skip the broad gap analysis and go straight to researching feasibility for what they asked.

$ARGUMENTS
