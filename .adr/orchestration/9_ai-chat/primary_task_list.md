# Primary Task List — 9_ai-chat

Session: AI Chat
Started: 2026-03-10
Design Fidelity: Faithful (pass-1 brutalism-neobrutalism)
Design Source: `.docs/planning/concepts/brutalism-neobrutalism/pass-1/index.html` (ai-chat view)

---

## Phase 1 — AI Chat Frontend from Pass-1 (FRONTEND ONLY — Completed)

> **Note:** This phase is frontend-only. Chat uses mock/hardcoded messages and simulated AI responses. No real AI provider is wired.

- [x] Read pass-1 ai-chat section from index.html, style.css, and app.js
- [x] Build AI chat page matching pass-1 exactly:
  - Message thread with alternating user/AI styling
  - User messages: right-aligned, watermelon background, white text
  - AI messages: left-aligned, white background, signal-black border with hard shadow
  - Avatar squares ("JD" for user, "AI" for bot) matching pass-1 styling
  - Text input with neo-brutalist styling (thick border, monospace placeholder)
  - Send button with hard shadow, hover/active transforms
  - Enter key to send (Shift+Enter for newline)
  - Auto-scroll to latest message
  - Connected status badge in malachite
  - Typing indicator during simulated AI response
- [x] Mock messages from pass-1 pre-populated
- [x] Simulated AI response after 800ms delay

## Phase 2 — OpenRouter AI Integration

Primary approach: **OpenRouter OAuth PKCE flow** — users connect their own OpenRouter account. All AI usage billed to the user's OpenRouter account. Supports 200+ models (OpenAI, Claude, open-source) through one API.

- [ ] Install Vercel AI SDK with OpenRouter provider (`@openrouter/ai-sdk-provider` or direct REST)
- [ ] Build OpenRouter OAuth PKCE flow:
  - Redirect user to OpenRouter authorization endpoint
  - Handle OAuth callback, exchange code for access token
  - Store user-scoped OpenRouter token securely (encrypted in DB, per-user)
  - Token refresh handling
- [ ] Add AI Configuration section in Settings view:
  - "Connect OpenRouter Account" button (primary) — initiates OAuth PKCE flow
  - "Use API Key" option (secondary/BYOK fallback) — paste OpenRouter or direct provider key
  - Display connected account status, selected model
  - Model selector (pull available models from OpenRouter API)
  - Disconnect/revoke option
- [ ] Wire chat to OpenRouter API using user's scoped token/key:
  - Streaming responses via Vercel AI SDK `useChat` hook
  - Model selection per conversation
  - Token/cost display from OpenRouter usage metadata
- [ ] Handle "no AI configured" state:
  - Show neo-brutalist prompt card directing user to Settings -> AI Configuration
  - No mock/simulated responses as default behavior
- [ ] Simulated responses ONLY as error fallback when OpenRouter API is temporarily unavailable
- [ ] Wire session list to Prisma (create, switch, delete chat sessions) — **not Convex**
- [ ] Persist messages to DB per session
- [ ] Session list UI (create, switch, delete sessions in sidebar)

## Phase 2b — Session List UI ✅

- [x] Session list sidebar on AI chat page
- [x] Load sessions from GET /api/ai/sessions
- [x] Show session title, message count
- [x] Click to switch sessions (load messages from DB)
- [x] New chat button creates fresh session
- [x] Delete session button

## Phase 4 — Contextual AI Helper (All Pages) ✅

### Floating AI Widget
- [x] Reusable AiHelper component (bottom-right floating bubble, 56px)
- [x] Click to expand into mini chat panel (380x520px)
- [x] Integrate into AppShell (appears on all authenticated pages except /ai)
- [x] Collapsible/dismissible
- [x] Brutalist styling matching app design
- [x] Pass current page context (pageName, projectId) to API

### Page-Specific AI Context
- [x] System prompt enhanced with page-specific hints per page
- [x] Schema page: schema design, normalization, relationships
- [x] Ideas page: brainstorming, prioritization, expansion (uses add_idea tool)
- [x] Kanban page: task management, categorization (uses update_kanban tool)
- [x] Whiteboard page: visual brainstorming, sticky note suggestions
- [x] Directory tree: project structure, conventions (uses generate_tree tool)
- [x] Dashboard: project status, next actions

### Quick Action Buttons
- [x] Each page shows context-aware quick action buttons in the AI helper header
- [x] Schema: "Suggest entities", "Normalize schema", "Explain relations"
- [x] Ideas: "Brainstorm ideas", "Prioritize", "Expand idea"
- [x] Kanban: "Suggest tasks", "Categorize", "Summarize board"
- [x] Whiteboard: "Suggest stickies", "Organize layout"
- [x] Directory tree: "Suggest structure", "Explain conventions"
- [x] Dashboard: "Summarize", "Next actions"
- [x] Clicking quick action sends the pre-filled prompt immediately

## Phase 5 — Comprehensive Cross-Page AI Tools

Current tools only write to AiToolOutput (a log table). This phase rewrites all tools to read/write real project artifacts so the AI can actually modify project data — same as a user doing it manually.

### Tool Inventory
| Tool | Description | Reads | Writes |
|------|-------------|-------|--------|
| read_artifact | Read any project artifact by path | ProjectArtifact | — |
| list_projects | List user's projects | ProjectMember + Project | — |
| manage_project | Create, update, or delete a project | Project | Project |
| update_ideas | Add, edit, or delete ideas in a project | ideas artifact | ideas artifact |
| update_kanban | Add, move, update, or delete kanban cards | kanban artifact | kanban artifact |
| update_schema | Add entities, fields, relations, enums to schema | schema artifact | schema artifact |
| update_whiteboard | Add sticky notes, media to whiteboard | whiteboard artifact | whiteboard artifact |
| update_directory_tree | Add, rename, delete nodes in directory tree | tree artifact | tree artifact |

### Key Design Decisions
- All tools available on every page (cross-page by design)
- Tools read current artifact state before modifying (merge, not overwrite)
- Tools use Prisma upsert on ProjectArtifact (same pattern as UI auto-save)
- Each tool logs to AiToolOutput for audit trail (in addition to real writes)
- Tool descriptions are detailed so the AI model knows exactly when to use each

### Implementation ✅
- [x] read_artifact tool: read any artifact by projectId + path
- [x] list_projects tool: list user's projects with basic info
- [x] manage_project tool: create/update project (with auto-slug, auto-OWNER membership)
- [x] update_ideas_artifact: read/merge/write ideas.json (add, edit, delete ideas)
- [x] update_kanban_artifact: read/merge/write kanban/board.json (add/move/update/delete cards, add columns)
- [x] update_schema_artifact: read/merge/write schema.graph.json (add entities, fields, relations, enums)
- [x] update_whiteboard_artifact: add stickies to whiteboard/board.json (with color, position)
- [x] update_directory_tree_artifact: read/merge/write tree.plan.json (add/remove nodes with parent path)
- [x] All 12 tools registered in /api/ai/chat (available regardless of pageContext)
- [x] Detailed tool descriptions so AI model knows when to use each
- [x] artifact-helpers.ts: shared readArtifact/writeArtifact (Prisma upsert with revision increment)

## Phase 6 — Multi-Provider Support (2026-03-19) ✅

- [x] Install @ai-sdk/anthropic and @ai-sdk/google providers
- [x] Add OPENAI_BYOK, ANTHROPIC_BYOK, GOOGLE_BYOK to AiProvider enum + migration
- [x] Update getUserModel to resolve all 5 providers with correct SDK:
  - OpenRouter (OAuth/BYOK) → createOpenRouter → default: claude-sonnet-4
  - OpenAI (BYOK) → openai.withApiKey → default: gpt-4o
  - Anthropic (BYOK) → anthropic.withApiKey → default: claude-sonnet-4
  - Google (BYOK) → google.withApiKey → default: gemini-2.0-flash
  - Fallback: server OPENAI_API_KEY env var
- [x] Auto-detect provider from key prefix (sk-ant → Anthropic, sk- → OpenAI, AIza → Google, sk-or → OpenRouter)
- [x] Update Settings UI to show all supported providers with key format hints
- [x] Display detected provider name in connected status

### Tool Calling Compatibility
All default models support tool/function calling:
- GPT-4o, GPT-4-turbo ✅
- Claude 3+, Claude 4 ✅
- Gemini 1.5+, Gemini 2.0 ✅
- OpenRouter: depends on model (all defaults support tools)
- Vercel AI SDK handles gracefully if model doesn't support tools

## Phase 7 — Built-In Local AI via Ollama (2026-03-20)

Bundle a local AI model so users can use the AI features without any API key. Chargeable as a "built-in AI" tier.

### Model: Ministral 3B (via Ollama)
- ~2GB download (Q4 GGUF quantized)
- Apache 2.0 license (can bundle and charge)
- Tool calling: native support (works with all 12 tools)
- Vision: YES (0.4B vision encoder — can see page screenshots)
- Runs locally via Ollama at localhost:11434

### Implementation
- [ ] Install `ollama-ai-provider` for Vercel AI SDK
- [ ] Add OLLAMA_LOCAL to AiProvider enum + migration
- [ ] Update getUserModel to resolve Ollama provider (localhost:11434)
- [ ] Add "Use Built-In AI" option in Settings (no API key needed)
- [ ] Auto-detect if Ollama is running on localhost
- [ ] Show Ollama setup instructions if not running
- [ ] Settings UI: Ollama status indicator + model name display
- [ ] Test all 12 tools with Ministral 3B via Ollama
- [ ] Validate tool calling accuracy with local model
- [ ] Document setup in appdocs

### Architecture
- Web app: user installs Ollama separately, app connects to localhost:11434
- Desktop app (future): bundle Ollama via electron-ollama, auto-download model on first launch
- Fallback chain: User's API key → Ollama local → server fallback → mock responses

## Phase 3 — AI Chat Testing

- [x] Playwright screenshots (desktop + mobile)
- [ ] Test OAuth PKCE flow end-to-end (connect, disconnect, reconnect)
- [ ] Test BYOK fallback flow (paste key, validate, chat)
- [ ] User story validation: create session, send message, receive real AI response, switch sessions
- [ ] Test "no AI configured" state renders prompt card correctly
- [ ] Test error fallback behavior when OpenRouter unavailable
- [ ] Compare against pass-1 ai-chat validation PNGs
