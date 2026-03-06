# Phase 4 Review: AI (Full Page + Sidebar) With Tool Actions

Session: app_build_v1
Date: 2026-03-05
Reviewer: longrunning-worker-subagent

## Summary

Phase 4 delivers the AI chat system for the IDEA-MANAGEMENT app, including a full-page `/ai` chat interface, a collapsible AI sidebar component, four typed tool actions with audit logging, chat session persistence via Prisma, and entitlement gating for AI features.

## What Was Built

### 1. Dependencies
- Installed `ai@6.0.116` (Vercel AI SDK v6), `@ai-sdk/openai@3.0.41`, and `@ai-sdk/react@3.0.118`
- Added `OPENAI_API_KEY` to `.env.example`

### 2. Prisma Models
- `AiChatSession` — user-scoped chat sessions with optional project context
- `AiChatMessage` — individual messages with role enum (USER, ASSISTANT, SYSTEM, TOOL) and optional tool call/result JSON
- `AiToolOutput` — stores AI tool execution results (stub for project tables not yet built)
- `AiMessageRole` enum added
- Migration SQL created at `prisma/migrations/20260305_002_add_ai_chat_models/migration.sql`

### 3. AI Chat API (POST /api/ai/chat)
- Streaming endpoint using Vercel AI SDK's `streamText()` + `toUIMessageStreamResponse()`
- Auth gate via `requireEntitlement(req, FEATURES.AI_CHAT)` — admin bypasses
- Accepts `{ messages, sessionId?, projectId? }` in request body
- Auto-creates chat sessions when sessionId is not provided
- Persists user messages on receive and assistant messages on completion
- System prompt includes project context when projectId is provided
- Four typed tools defined with Zod schemas
- Uses `stepCountIs(5)` for tool loop limit

### 4. Chat Session Management APIs
- `GET /api/ai/sessions` — list user's chat sessions with message counts
- `POST /api/ai/sessions` — create new session
- `GET /api/ai/sessions/[id]` — get session with all messages
- `DELETE /api/ai/sessions/[id]` — delete session (ownership verified)

### 5. Tool Action Implementations
Located in `apps/web/src/server/ai/tools/`:
- `add-idea.ts` — validates and persists new ideas via AiToolOutput
- `update-kanban.ts` — validates kanban actions (add/move/update/delete) with cardId enforcement
- `generate-tree.ts` — validates recursive tree structures and counts nodes
- `create-project-structure.ts` — scaffolds from templates (blank, web-app, mobile-app, api, library)
- Each tool: validates input with Zod, creates AiToolOutput record, calls `auditLog()`, returns structured result

### 6. Full-Page /ai Chat UI
Located at `apps/web/src/app/ai/page.tsx` with components in `apps/web/src/components/ai/`:
- `ChatMessageList` — renders user/assistant messages with text and tool call parts
- `ChatInput` — text input with Enter-to-send, Shift+Enter for newline
- `ProjectSelector` — project context input (text input for project ID)
- `ToolCallDisplay` — inline rendering of tool calls with collapsible parameters/results
- `SessionList` — sidebar list of chat sessions with create/select/delete
- `UpgradePrompt` — shown when user lacks AI_CHAT entitlement
- Uses AI SDK v6's `useChat()` hook with `DefaultChatTransport`

### 7. AI Sidebar Component
Located at `apps/web/src/components/ai-sidebar.tsx`:
- Collapsible right-side panel (360px wide)
- Toggle button (floating "AI" circle) and keyboard shortcut (Ctrl+Shift+A)
- Context bar showing current route and project
- Quick action buttons: Add Idea, Update Board, Generate Tree
- Compact chat interface using same `useChat()` hook
- Entitlement gate with upgrade link for non-entitled users

### 8. Tests
- `add-idea.test.ts` — 8 tests: schema validation, execution, audit logging, edge cases
- `update-kanban.test.ts` — 8 tests: schema validation, cardId enforcement, audit logging
- `chat-endpoint.test.ts` — 7 tests: auth gate (401), entitlement gate (403), invalid body (400), admin bypass, message persistence, session management

## File Tree (New/Modified Files)

```
apps/web/
  .env.example                                         (modified)
  package.json                                         (modified)
  prisma/
    schema.prisma                                      (modified)
    migrations/
      20260305_002_add_ai_chat_models/
        migration.sql                                  (new)
  src/
    app/
      ai/
        page.tsx                                       (new)
      api/
        ai/
          chat/
            route.ts                                   (new)
          sessions/
            route.ts                                   (new)
            [id]/
              route.ts                                 (new)
    components/
      ai/
        chat-input.tsx                                 (new)
        chat-message-list.tsx                           (new)
        project-selector.tsx                            (new)
        session-list.tsx                                (new)
        tool-call-display.tsx                           (new)
        upgrade-prompt.tsx                              (new)
      ai-sidebar.tsx                                   (new)
    server/
      ai/
        tools/
          add-idea.ts                                  (new)
          add-idea.test.ts                             (new)
          create-project-structure.ts                   (new)
          generate-tree.ts                             (new)
          index.ts                                     (new)
          update-kanban.ts                             (new)
          update-kanban.test.ts                        (new)
        chat-endpoint.test.ts                          (new)
.docs/
  validation/
    phase_4/
      ai-chat-desktop.html                             (new)
      ai-chat-mobile.html                              (new)
      ai-sidebar-open.html                             (new)
      tool-call-display.html                           (new)
      upgrade-prompt.html                              (new)
```

## Test Results

```
 Test Files  9 passed (9)
       Tests  65 passed (65)
    Start at  21:55:04
    Duration  840ms
```

All 65 tests pass including:
- 23 new AI tests (3 test files)
- 42 existing tests from Phase 2/3 (unchanged)

## TypeScript Typecheck

```
$ npx tsc --noEmit
(no errors)
```

## Validation Screenshots

- `.docs/validation/phase_4/ai-chat-desktop.html` — Full-page AI chat at desktop viewport
- `.docs/validation/phase_4/ai-chat-mobile.html` — Full-page AI chat at mobile viewport (375px)
- `.docs/validation/phase_4/ai-sidebar-open.html` — AI sidebar open state overlaying app content
- `.docs/validation/phase_4/tool-call-display.html` — Tool call display states (completed, running) for all 4 tools
- `.docs/validation/phase_4/upgrade-prompt.html` — Entitlement gate / upgrade prompt for FREE users

## Technical Notes

- AI SDK v6 breaking changes from v3/v4: `useChat()` now uses `transport: new DefaultChatTransport({ api })` instead of `api` prop directly; `tool()` uses `inputSchema` instead of `parameters`; `streamText()` uses `stopWhen: stepCountIs(n)` instead of `maxSteps`; streaming response uses `toUIMessageStreamResponse()` instead of `toDataStreamResponse()`
- Tool outputs are stored in `AiToolOutput` table as a temporary measure until proper project tables are created in Phase 5/6
- All tool mutations are audit-logged via `auditLog()` with actor identity, action type, target, and metadata
- Admin users (role=ADMIN) bypass all entitlement checks for AI features via `checkEntitlement()` logic
- The `@ai-sdk/openai` provider is configured but requires `OPENAI_API_KEY` env var for actual API calls
