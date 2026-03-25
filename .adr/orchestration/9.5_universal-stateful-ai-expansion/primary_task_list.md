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

## Phase 7 — Post-Tool Response + Live Reactivity + Clarifying Questions

### 7a. AI responds after tool execution
- [ ] After tool completes, feed result back to model for a second call to generate a confirmation response
- [ ] Use two-step flow: step 1 = model decides tool call, step 2 = model generates text with tool result in context
- [ ] Fallback: if second call fails (Ollama compat), show tool result message as the response
- [ ] System prompt instructs AI: "After using a tool, always tell the user what you did and confirm the result"

### 7b. Live reactive content (no page refresh needed)
- [ ] After AI tool writes to an artifact, trigger a client-side refetch of that artifact's data
- [ ] Use a custom event or callback: when tool-output-available arrives in stream, dispatch a window event like `artifact-updated` with the artifact path
- [ ] Each page (Ideas, Kanban, Schema, etc.) listens for `artifact-updated` and refetches its data
- [ ] Alternative: use a polling interval (every 5s) on pages to check for updates — simpler but less immediate
- [ ] The AI helper widget should also show "Content updated — data refreshed" after tool execution

### 7c. AI asks clarifying questions
- [ ] System prompt instructs: "When the user's request is ambiguous or missing required info, ask a clarifying question before acting. Examples: which project? what priority? what category?"
- [ ] When projectId is not provided and user says 'add an idea', AI should ask which project
- [ ] When creating ideas without priority/category specified, AI should ask or use sensible defaults and mention what it chose
- [ ] For destructive actions (delete), AI should confirm before executing

## Phase 8 — Groq Provider + Tool Calling Reliability + Hardening

### 8a. Add Groq as built-in provider
- [ ] Add GROQ_BUILTIN to AiProvider enum + Prisma migration
- [ ] Add Groq case to getUserModel (createOpenAI with baseURL: https://api.groq.com/openai/v1)
- [ ] Set Groq as default built-in provider (replaces Ollama for production)
- [ ] Add GROQ_API_KEY server env var
- [ ] Update Settings UI: show "Built-in AI (Groq)" for subscribers
- [ ] Keep Ollama as local dev option (auto-detect fallback)

### 8b. Fix tool calling behavior
- [ ] Remove follow-up API call that masks tool failures with fake confirmation text
- [ ] Add tool-call validation: if user asked for action but no tool-output-available in stream, show warning
- [ ] Show tool result message directly when tool succeeds (no second model call needed)
- [ ] Detect text-only responses for action requests and warn user
- [ ] Show tool cards even when model generates no text alongside

### 8c. Live reactivity on all pages
- [ ] Add useArtifactRefresh to Kanban page (update_kanban_artifact)
- [ ] Add useArtifactRefresh to Schema page (update_schema_artifact)
- [ ] Add useArtifactRefresh to Whiteboard page (update_whiteboard_artifact)
- [ ] Add useArtifactRefresh to Directory Tree page (update_directory_tree_artifact)
- [ ] Dispatch artifact-updated from both chat page and helper after every tool execution

### 8d. Hardening
- [ ] Timeout: 30 second max for AI response, show error if exceeded
- [ ] Rate limiting: max 60 messages/min per user in chat API
- [ ] Token budget: cap system prompt + history context injection at ~4000 tokens
- [ ] Error boundaries: clean error display if stream errors mid-way
- [ ] Validate tool result: after tool writes artifact, quick read-back to confirm

### 8e. Testing
- [ ] Test Groq tool calling with all 8 artifact tools
- [ ] Playwright: send action request → verify tool card → verify artifact written
- [ ] Test BYOK flow: paste key → send message → verify response
- [ ] Test fallback chain: Groq → BYOK → Ollama → error
- [ ] Test live reactivity: AI adds idea → Ideas page updates without refresh

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
