# Primary Task List — 9.5 Universal Stateful AI Expansion

Session: Universal Stateful AI Expansion
Started: 2026-03-20

---

## Phase 1 — Stateful Sessions + Tool Visibility

### 1a. Persist tool calls/results in DB
- [ ] Update `onFinish` in /api/ai/chat to save toolCalls and toolResults to AiChatMessage
- [ ] When streaming completes, create TOOL role messages for each tool call + result pair
- [ ] Verify tool data round-trips through GET /api/ai/sessions/[id]

### 1b. Feed full history on session switch
- [ ] When user switches sessions, load all messages from DB
- [ ] Send full message history (including tool messages) to /api/ai/chat on next send
- [ ] AI should "remember" previous conversation turns and tool results

### 1c. Show tool calls inline in chat UI
- [ ] Parse Vercel AI SDK stream events for tool calls (9: prefix) and tool results (a: prefix)
- [ ] Render tool calls as collapsible action cards in the message thread
- [ ] Show tool name, arguments summary, and result status (success/error)
- [ ] Style with brutalist card (thick border, monospace, green for success, red for error)

### 1d. Remove mock mode
- [ ] Remove AI_CANNED_RESPONSES array and mock response logic from /ai page
- [ ] Remove mock fallback from floating AI helper
- [ ] Change "MOCK MODE" badge to show "LOCAL AI" when Ollama auto-detected, or "NOT CONFIGURED" when nothing available
- [ ] Update "not configured" banner to suggest installing Ollama first, API keys second

## Phase 2 — Session Management

### 2a. Session rename
- [ ] Add PUT /api/ai/sessions/[id] endpoint (rename title, toggle pinned)
- [ ] Add rename button/inline edit on session list items
- [ ] Add pinned/archived fields to AiChatSession (migration)

### 2b. Session search
- [ ] Add search input above session list
- [ ] Filter sessions by title match (client-side for now)
- [ ] Show message preview snippet in session list items

### 2c. Session export
- [ ] Export button on session header
- [ ] Generate markdown: session title, timestamps, messages with role labels, tool call details
- [ ] Download as .md file

## Phase 3 — Context Injection

### 3a. Auto-inject project state
- [ ] When projectId is provided to /api/ai/chat, read key artifacts:
  - ideas/ideas.json → count + recent 5 titles
  - kanban/board.json → column names + card counts
  - schema/schema.graph.json → entity names + field counts
- [ ] Inject as system prompt section: "Current project state: ..."
- [ ] Cap at ~2000 tokens to avoid overwhelming small models

### 3b. Page-specific context in helper
- [ ] Floating helper reads current page's artifact on open
- [ ] Injects current page data into system prompt
- [ ] Example on Schema page: "Current schema has 3 entities: USERS (5 fields), ORDERS (4 fields), PRODUCTS (6 fields)"

## Phase 4 — Slash Commands

- [ ] Client-side slash command parser in chat input
- [ ] `/new` → create new session, clear messages
- [ ] `/clear` → clear messages in current session (with confirmation)
- [ ] `/rename <title>` → rename current session via API
- [ ] `/export` → trigger session export as markdown
- [ ] `/help` → show available commands as an info message
- [ ] `/project` → show current project context
- [ ] Show command autocomplete dropdown when user types /

## Phase 5 — Persistent Helper Sessions

- [ ] Store helper session ID per page path in localStorage
- [ ] On helper open: load existing session messages if session ID exists
- [ ] On helper close: session persists, reopening shows history
- [ ] "Expand to full chat" button → navigate to /ai with session ID
- [ ] "New conversation" button in helper to reset

## Phase 6 — Testing & Validation

### 6a. Tool visibility tests
- [ ] Send message that triggers a tool call, verify tool card appears in chat
- [ ] Verify tool call args and result are displayed correctly
- [ ] Test with multiple tool calls in one response

### 6b. Session continuity tests
- [ ] Create session, send messages, switch away, switch back — verify history loaded
- [ ] Verify AI "remembers" context from earlier in the conversation
- [ ] Test session rename and verify title updates

### 6c. Context injection tests
- [ ] Create project with ideas/kanban/schema data
- [ ] Send message on project page, verify AI knows about project state
- [ ] Test with empty project (no artifacts) — should not error

### 6d. Visual validation
- [ ] Playwright screenshots: tool call cards, session list, rename, search
- [ ] Screenshot: slash command autocomplete
- [ ] Screenshot: helper with persistent session
- [ ] Save to .docs/validation/9.5_stateful-ai/screenshots/

### 6e. Live Ollama integration test
- [ ] With Ollama running, verify tool calls work end-to-end
- [ ] Send "add an idea about X" → verify idea appears in project's ideas artifact
- [ ] Send "list my projects" → verify project list returned
- [ ] Test on multiple pages via floating helper
