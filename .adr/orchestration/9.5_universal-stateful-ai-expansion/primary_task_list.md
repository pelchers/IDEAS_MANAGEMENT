# Primary Task List — 9.5 Universal Stateful AI Expansion

Session: Universal Stateful AI Expansion
Started: 2026-03-20

---

## Phase 1 — Stateful Sessions + Tool Visibility

### 1a. Persist tool calls/results in DB
- [x] Update `onFinish` in /api/ai/chat to save toolCalls and toolResults to AiChatMessage
- [x] When streaming completes, create TOOL role messages for each tool call + result pair
- [x] Verify tool data round-trips through GET /api/ai/sessions/[id]

### 1b. Feed full history on session switch
- [x] When user switches sessions, load all messages from DB
- [x] Send full message history (including tool messages) to /api/ai/chat on next send
- [x] AI should "remember" previous conversation turns and tool results

### 1c. Show tool calls inline in chat UI
- [x] Parse Vercel AI SDK stream events for tool calls (9: prefix) and tool results (a: prefix)
- [x] Render tool calls as collapsible action cards in the message thread
- [x] Show tool name, arguments summary, and result status (success/error)
- [x] Style with brutalist card (thick border, monospace, green for success, red for error)

### 1d. Remove mock mode
- [x] Remove AI_CANNED_RESPONSES array and mock response logic from /ai page
- [x] Remove mock fallback from floating AI helper
- [x] Change "MOCK MODE" badge to show "LOCAL AI" when Ollama auto-detected, or "NOT CONFIGURED" when nothing available
- [x] Update "not configured" banner to suggest installing Ollama first, API keys second

## Phase 2 — Session Management

### 2a. Session rename
- [x] Add PUT /api/ai/sessions/[id] endpoint (rename title, toggle pinned)
- [x] Add rename button/inline edit on session list items
- [x] Add pinned/archived fields to AiChatSession (migration)

### 2b. Session search
- [x] Add search input above session list
- [x] Filter sessions by title match (client-side for now)
- [x] Show message preview snippet in session list items

### 2c. Session export
- [x] Export button on session header
- [x] Generate markdown: session title, timestamps, messages with role labels, tool call details
- [x] Download as .md file

## Phase 3 — Context Injection

### 3a. Auto-inject project state
- [x] When projectId is provided to /api/ai/chat, read key artifacts:
  - ideas/ideas.json → count + recent 5 titles
  - kanban/board.json → column names + card counts
  - schema/schema.graph.json → entity names + field counts
- [x] Inject as system prompt section: "Current project state: ..."
- [x] Cap at ~2000 tokens to avoid overwhelming small models

### 3b. Page-specific context in helper
- [x] Floating helper reads current page's artifact on open
- [x] Injects current page data into system prompt
- [x] Example on Schema page: "Current schema has 3 entities: USERS (5 fields), ORDERS (4 fields), PRODUCTS (6 fields)"

## Phase 4 — Slash Commands

- [x] Client-side slash command parser in chat input
- [x] `/new` → create new session, clear messages
- [x] `/clear` → clear messages in current session (with confirmation)
- [x] `/rename <title>` → rename current session via API
- [x] `/export` → trigger session export as markdown
- [x] `/help` → show available commands as an info message
- [x] `/project` → show current project context
- [x] Show command autocomplete dropdown when user types /

## Phase 5 — Persistent Helper Sessions

- [x] Store helper session ID per page path in localStorage
- [x] On helper open: load existing session messages if session ID exists
- [x] On helper close: session persists, reopening shows history
- [x] "Expand to full chat" button → navigate to /ai with session ID
- [x] "New conversation" button in helper to reset

## Phase 7 — Post-Tool Response + Live Reactivity + Clarifying Questions ✅

### 7a. AI responds after tool execution ✅
- [x] After tool completes, feed result back to model for a second call to generate a confirmation response
- [x] Use `stopWhen: stepCountIs(3)` — step 1 = tool call, step 2 = text with result in context
- [x] stepComplete flag prevents double-write on simple responses
- [x] System prompt instructs AI: "After using a tool, always tell the user what you did and confirm the result"

### 7b. Live reactive content (no page refresh needed) ✅
- [x] After AI tool writes to an artifact, dispatch `artifact-updated` window event with artifact path
- [x] `useArtifactRefresh` hook: targeted (by tool name) or any-artifact listener
- [x] Ideas page: targeted refresh on update_ideas_artifact
- [x] Kanban, Schema, Whiteboard, Directory Tree: reload on any artifact update
- [x] AI helper widget dispatches artifact-updated events after tool execution

### 7c. AI asks clarifying questions ✅
- [x] System prompt instructs: conversation vs action rules — only use tools on explicit action requests
- [x] When projectId not provided, AI asks which project
- [x] Interpretive field filling: AI generates descriptions, tags, priority from context
- [x] For destructive actions, AI confirms before executing

## Phase 8.5 — AI Reasoning Display + Multi-Step Tool Flow (2026-03-28) ✅

See Plan #1: `.docs/planning/plans/1-ai-chat-reasoning-display.md`

### Model Switch ✅
- [x] Switch local default to qwen3:32b (tool calling verified, 32B = much smarter)
- [x] Capture reasoning field from stream events (data: SSE format)

### Chat UI: Live Reasoning + Tool Display ✅
- [x] Gray reasoning area below AI messages (collapsible `<details>`, default collapsed)
- [x] Tool calls shown with status indicators in reasoning area
- [x] Area collapsed by default, click to expand

### Multi-Step Flow (Text → Tool → Text) ✅
- [x] Step 1: AI generates tool call
- [x] Step 2: Tool executes, result fed back to model
- [x] Step 3: AI generates confirmation text
- [x] Use `stopWhen: stepCountIs(3)` for the chain
- [x] stepComplete flag prevents double-write on simple responses

### "Show Reasoning" Toggle ✅
- [x] Checkbox in /ai page header (default checked, renamed from "Log Reasoning")
- [x] When checked: reasoning section visible (still collapsed, click to expand)
- [x] Persist in localStorage

### Testing ✅
- [x] qwen3:32b: reasoning display + tool call + text response verified
- [x] gpt-oss-120b on Groq: reasoning + tool call + text verified
- [x] Live reactivity: artifact-updated events fire correctly

## Phase 8.6 — Session Management Enhancements (2026-03-29) ✅

See Plan #2: `.docs/planning/plans/2-ai-session-management.md`

### Full Page ✅
- [x] "CLR" (Delete All Sessions) button in sidebar header (with confirmation)
- [x] /clear slash command to clear messages in current session
- [x] Session rename via inline edit and /rename command

### Popup Session List ✅
- [x] Session list in AI helper popup (last 5 sessions)
- [x] Click to switch, delete, "View All" → /ai
- [x] EXPAND/NEW buttons in helper header

## Phase 8 — Groq Provider + Tool Calling Reliability + Hardening ✅

### 8a. Add Groq as built-in provider ✅
- [x] Groq resolved via `createOpenAI({ baseURL: "https://api.groq.com/openai/v1" })`
- [x] Default model: `openai/gpt-oss-120b` (highest intelligence on Groq, 500 tok/s)
- [x] GROQ_API_KEY server env var (verified working 2026-04-01)
- [x] Settings UI shows "Built-in AI (Groq)" for subscribers
- [x] Ollama kept as local dev auto-detect fallback

### 8b. Fix tool calling behavior ✅
- [x] Conversation vs action rules in system prompt (only use tools on explicit requests)
- [x] stepComplete flag: stops after first step if no tools called (prevents double-write)
- [x] Interpretive field filling: Zod schema descriptions guide AI to generate rich content
- [x] Removed legacy tools (add_idea, update_kanban) — only artifact-writing tools remain

### 8c. Live reactivity on all pages ✅
- [x] useArtifactRefresh on Ideas (targeted), Kanban, Schema, Whiteboard, Directory Tree
- [x] Dispatch artifact-updated from both chat page and helper

### 8d. Hardening ✅
- [x] Error boundary + loading skeleton on authenticated layout
- [x] TypeScript errors fixed across codebase
- [x] Session expiry → redirect to /signin (not infinite loading)
- [x] Access gate: admin bypass → BYOK bypass → entitlement check

### 8e. Testing ✅
- [x] Groq tool calling verified with all 8 artifact tools
- [x] BYOK flow tested (key paste → chat → response)
- [x] Provider resolution chain: Groq → BYOK → Ollama → error
- [x] Live reactivity: AI adds idea → Ideas page updates

## Phase 9 — Client-Side Ollama for Production (2026-04-02)

> Full plan: `.docs/planning/plans/3-client-side-ollama-production.md`
> Builds on: Phase 7 (server-side Ollama) + Phase 8 (Groq production)
> Purpose: Let production users with GPUs run AI locally via browser → Ollama

See 9_ai-chat Phase 7b for detailed task breakdown. Summary:

- [ ] Part 1: /api/ai/tools endpoint (server-side tool execution for client-side orchestration)
- [ ] Part 2: Browser-side Ollama detection, setup modal, auto-install flow
- [ ] Part 3: Client-side chat orchestration (useOllamaChat hook, tool→server loop)
- [ ] Part 4: Preconfigured setup scripts + custom `ideamanagement:latest` Modelfile
- [ ] Part 5: Chat persistence (/api/ai/chat/save) + project context API
- [ ] Part 6: Testing all flows (install, connect, tool calls, persistence, fallback)

## Phase 6 — Testing & Validation

### 6a. Tool visibility tests
- [x] Send message that triggers a tool call, verify tool card appears in chat
- [x] Verify tool call args and result are displayed correctly
- [x] Test with multiple tool calls in one response

### 6b. Session continuity tests
- [x] Create session, send messages, switch away, switch back — verify history loaded
- [x] Verify AI "remembers" context from earlier in the conversation
- [x] Test session rename and verify title updates

### 6c. Context injection tests
- [x] Create project with ideas/kanban/schema data
- [x] Send message on project page, verify AI knows about project state
- [x] Test with empty project (no artifacts) — should not error

### 6d. Visual validation
- [x] Playwright screenshots: tool call cards, session list, rename, search
- [x] Screenshot: slash command autocomplete
- [x] Screenshot: helper with persistent session
- [x] Save to .docs/validation/9.5_stateful-ai/screenshots/

### 6e. Live Ollama integration test
- [x] With Ollama running, verify tool calls work end-to-end
- [x] Send "add an idea about X" → verify idea appears in project's ideas artifact
- [x] Send "list my projects" → verify project list returned
- [x] Test on multiple pages via floating helper
