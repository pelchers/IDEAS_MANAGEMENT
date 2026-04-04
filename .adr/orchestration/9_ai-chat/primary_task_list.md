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

## Phase 7 — Built-In Local AI via Ollama (2026-03-20) ✅ (Server-Side)

Server-side Ollama for local dev. Model changed from Ministral 3B to qwen3:32b after testing.

### Model: qwen3:32b (via Ollama)
- ~20GB download (Q4 quantized)
- Apache 2.0 license
- Tool calling: verified working via /v1/ endpoint
- `/no_think` system prompt suffix disables verbose thinking mode
- Runs locally via Ollama at localhost:11434

### Server-Side Implementation ✅
- [x] Use `createOpenAI({ baseURL: "http://localhost:11434/v1" })` (no extra package needed)
- [x] Add OLLAMA_LOCAL to AiProvider enum + migration
- [x] Update getUserModel to resolve Ollama provider (localhost:11434)
- [x] Add "Connect Ollama" option in Settings AI Configuration
- [x] Auto-detect if Ollama is running on localhost (server-side check)
- [x] Settings UI: Ollama status indicator + model name display
- [x] Test all 8 artifact tools with qwen3:32b via Ollama
- [x] Validate tool calling accuracy (verified working with /no_think)
- [x] Document setup in appdocs (.docs/runbooks/ai-hosting/)

### Architecture Note
Server-side Ollama only works in local dev (server and Ollama on same machine).
In production (Railway), Ollama is unreachable — see Phase 7b for client-side solution.

## Phase 7b — Client-Side Ollama for Production Users (2026-04-02)

Move Ollama inference to the browser so production users with GPUs can run AI locally.
Full plan: `.docs/planning/plans/3-client-side-ollama-production.md`

### Architecture
- Browser calls user's local Ollama directly (localhost:11434/v1/chat/completions)
- Tool calls go to our server via POST /api/ai/tools (DB access required)
- Chat history saved to our DB via POST /api/ai/chat/save
- Custom `ideamanagement:latest` model bakes in system prompt, params, /no_think

### Part 1: Server-Side Tool Execution Endpoint
- [ ] Create `/api/ai/tools/route.ts` — execute single tool call (auth + Prisma)
- [ ] Extract tool execution logic from chat/route.ts into shared helper
- [ ] Add rate limiting on tool endpoint

### Part 2: Client-Side Ollama Detection & Auto-Setup
- [ ] Create `lib/ollama-client.ts` — browser-side detect, model check, pull, create
- [ ] Create `components/ai/ollama-setup-modal.tsx` — step-by-step setup wizard
- [ ] Update Settings AI Configuration with browser-side Ollama detection
- [ ] Detect OS, offer platform-appropriate setup script download

### Part 3: Client-Side Chat Orchestration
- [ ] Create `lib/ollama-chat.ts` — stream from localhost:11434, handle tool_calls
- [ ] Create `hooks/use-ollama-chat.ts` — React hook with tool→server→feed-back loop
- [ ] Update /ai page: detect OLLAMA_LOCAL → use client-side hook
- [ ] Update AI helper widget: same provider detection + hook switching
- [ ] Create `/api/ai/context/[projectId]/route.ts` — serve project context to browser
- [ ] Create shared `getSystemPrompt()` used by both server and client paths

### Part 4: Preconfigured Setup Scripts + Custom Model
- [ ] Create `/api/setup/ollama-script/route.ts` — dynamic script generator (injects domain)
- [ ] Create `public/setup/Modelfile` — FROM qwen3:32b + system prompt + params
- [ ] Windows PowerShell script: install Ollama, set OLLAMA_ORIGINS, pull model, create custom model
- [ ] macOS/Linux bash script: same flow
- [ ] Model version checking (digest comparison, update prompt)

### Part 5: Persistence & Chat History
- [ ] Create `/api/ai/chat/save/route.ts` — save client-side conversations to DB
- [ ] Create `/api/ai/context/[projectId]/route.ts` — serve artifacts for system prompt
- [ ] Add provider badge per message ("via Groq" / "via Local AI" / "via OpenAI")

### Part 6: Testing & Edge Cases
- [ ] Ollama not installed → download → detect → connect flow
- [ ] Model missing → auto-pull → progress → ready
- [ ] Tool calling: browser → Ollama → tool_call → server → result → feed back
- [ ] Multi-step tool flow (3 steps max)
- [ ] Chat persistence (local conversation → DB)
- [ ] Provider switching mid-session (Groq ↔ Local)
- [ ] Ollama crash → graceful error → Groq fallback
- [ ] Low VRAM → model doesn't fit → warning
- [ ] Update runbooks with client-side Ollama docs

## Phase 8 — Settings AI Panel Redesign (2026-04-03)

> Plan: `.docs/planning/plans/4-ai-provider-switcher-subscription-tiers.md`
> Replaces the current 3-section layout with a single dropdown + context panel

### Provider Selector Dropdown
- [ ] Replace 3 separate sections (Ollama / OpenRouter / BYOK) with single `<select>` dropdown
- [ ] Dropdown options:
  - "Hosted AI (Built-in)" — requires Pro/Team, shows lock icon if Free
  - "Local AI (Your GPU)" — triggers OllamaSetupModal if not detected
  - "OpenAI (Your Key)" — shows key input
  - "Anthropic (Your Key)" — shows key input
  - "Google (Your Key)" — shows key input
  - "OpenRouter" — shows OAuth button
- [ ] Save selection to `preferredAiProvider` via PUT /api/ai/config
- [ ] Persist across page reloads (fetched from GET /api/ai/config)

### Context Panel (swaps based on dropdown)
- [ ] Create `components/ai/provider-context-panel.tsx`
- [ ] Hosted AI panel:
  - Subscription badge (FREE / PRO / TEAM)
  - Usage meter component (from 10_billing Phase 5)
  - "Upgrade" CTA if on Free tier
  - Current model display: "gpt-oss-120b via Groq"
- [ ] Local AI panel:
  - Ollama status: "Connected (ideamanagement:latest)" or "Not detected"
  - [SETUP LOCAL AI] button → opens OllamaSetupModal
  - "Free, private, runs on your GPU · Unlimited messages"
- [ ] BYOK panel (OpenAI / Anthropic / Google):
  - Key input with provider auto-detect from prefix
  - "Unlimited — you pay your provider directly"
  - [SAVE KEY] / [DISCONNECT] buttons
- [ ] OpenRouter panel:
  - [CONNECT OPENROUTER] OAuth button or connected status
  - "200+ models, billed to your OpenRouter account"

### Fallback Setting
- [ ] Show fallback dropdown ONLY for Hosted AI users
- [ ] Options: "Auto-switch to Local AI" (default) / "Show upgrade prompt" / "Disable AI"
- [ ] Save to `aiFallbackSetting` via PUT /api/ai/config

### Connection Status Bar
- [ ] Always-visible bar at bottom of AI config card
- [ ] Shows: "Active: [provider name] ([model]) · [usage if hosted]"
- [ ] Green dot for connected, red dot for not configured

### Testing
- [ ] Playwright: dropdown open, each context panel rendered
- [ ] Playwright: provider switch → correct panel appears
- [ ] Playwright: desktop + mobile responsive layout
- [ ] Test: select Hosted AI on Free → shows upgrade CTA
- [ ] Test: select Local AI without Ollama → setup modal opens

## Phase 3 — AI Chat Testing

- [x] Playwright screenshots (desktop + mobile)
- [ ] Test OAuth PKCE flow end-to-end (connect, disconnect, reconnect)
- [ ] Test BYOK fallback flow (paste key, validate, chat)
- [ ] User story validation: create session, send message, receive real AI response, switch sessions
- [ ] Test "no AI configured" state renders prompt card correctly
- [ ] Test error fallback behavior when OpenRouter unavailable
- [ ] Compare against pass-1 ai-chat validation PNGs
