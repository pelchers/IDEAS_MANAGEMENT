# Phase Plan

Phase: phase_4
Session: app_build_v1
Date: 2026-03-05
Owner: longrunning-worker-subagent
Status: complete

## Objectives
- Build AI chat full-page (`/ai`) with project context selector and streaming conversation.
- Build AI sidebar component for in-context quick actions.
- Implement typed server tool actions (add_idea, update_kanban, generate_tree, create_project_structure).
- Add chat transcript persistence via Prisma model.
- Audit log all AI-driven file mutations.
- Gate AI features behind `AI_CHAT` entitlement.

## Task checklist
- [x] Install AI SDK dependencies (`ai`, `@ai-sdk/openai`, `@ai-sdk/react`).
- [x] Add Prisma models: AiChatSession, AiChatMessage, AiToolOutput (linked to User).
- [x] Run prisma migrate to create new tables.
- [x] Implement AI chat API endpoint (POST /api/ai/chat):
  - [x] Streaming response via Vercel AI SDK.
  - [x] Entitlement check (`requireEntitlement` with `AI_CHAT`).
  - [x] Auth check (`requireAuth`).
  - [x] Project context injection (selected project ID passed from client).
  - [x] Message persistence (save user + assistant messages to DB).
- [x] Implement typed server tool definitions:
  - [x] `add_idea` — validates and appends to ideas list (DB-backed).
  - [x] `update_kanban` — validates and modifies kanban board state (DB-backed).
  - [x] `generate_tree` — creates/updates directory tree plan (DB-backed).
  - [x] `create_project_structure` — scaffolds default project folders/files (DB-backed).
- [x] Tool execution with confirmation:
  - [x] Server-side tool handler that executes tool calls from AI responses.
  - [x] Tool results returned to AI for follow-up responses.
  - [x] Client-side confirmation UI for destructive tool actions.
- [x] Audit logging:
  - [x] Every AI tool mutation logged via `auditLog()` with action type, target, diff metadata, and actor identity.
- [x] Build `/ai` full-page chat UI:
  - [x] Chat message list with user/assistant message rendering.
  - [x] Message input with send button.
  - [x] Project picker / context selector dropdown.
  - [x] Tool invocation display (show tool calls and results inline).
  - [x] Chat session list (sidebar or header) for multiple conversations.
  - [x] Streaming response display.
  - [x] Entitlement gate — show upgrade prompt for FREE users.
- [x] Build AI sidebar component:
  - [x] Collapsible sidebar panel available on project pages.
  - [x] Context from current project + route injected automatically.
  - [x] Quick action buttons (add idea, update board, etc.).
  - [x] Compact chat interface within sidebar.
- [x] Add tests for:
  - [x] AI chat endpoint (auth, entitlement, message persistence).
  - [x] Tool action handlers (add_idea, update_kanban validation).
  - [x] Audit logging for tool mutations.
- [x] Validation screenshots in `.docs/validation/phase_4/`.

## Deliverables
- AI chat API endpoint with streaming and tool calling.
- Typed tool action implementations (4 tools).
- Full-page `/ai` chat UI with project context selector.
- AI sidebar component for project workspaces.
- Chat transcript persistence (Prisma).
- Audit logging for all AI mutations.
- Tests passing.
- Validation screenshots.

## Validation checklist
- [x] All tasks complete
- [x] pnpm typecheck passes
- [x] pnpm test passes (web)
- [x] AI chat endpoint handles auth + entitlement gates
- [x] Tool actions execute and are audit logged
- [x] Chat messages persist to DB
- [x] Admin bypass works for AI features
- [x] Phase file ready to move to history
- [x] Phase review file created in history
- [ ] Changes committed and pushed

## Risks / blockers
- AI API keys needed — use env vars (OPENAI_API_KEY) via .env (not committed).
- Tool actions currently DB-backed (no real file system writes until Phase 5 sync).
- Vercel AI SDK v6 has breaking changes from v3/v4 (transport-based useChat, inputSchema instead of parameters, stepCountIs instead of maxSteps).

## Notes
- Requirements source: `.docs/planning/prd.md` section 5.11, `.docs/planning/technical-specification.md` section 7.
- Existing infrastructure: `FEATURES.AI_CHAT` entitlement, `requireEntitlement()`, `auditLog()`, `requireAuth()`.
- Use Vercel AI SDK v6 (`ai` package) for streaming and tool calling — integrates with Next.js App Router.
- Tool actions operate on DB records (not filesystem) since sync layer is Phase 5.
- Phase review at `.adr/history/app_build_v1/phase_4_review.md`.
