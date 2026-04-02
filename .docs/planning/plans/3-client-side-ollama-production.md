# Plan #3 — Client-Side Ollama for Production Users

**Date:** 2026-04-02
**Commit:** ec8bc27
**Status:** Approved
**Author:** Claude + User

---

## Context

### What exists now
- AI inference is **server-side only** — browser sends message to our API, server calls Groq/Ollama/BYOK provider
- Ollama works in local dev because the Next.js server and Ollama run on the same machine
- In production (Railway), Ollama doesn't exist — no GPU, `localhost:11434` returns nothing
- Users with GPUs at home cannot use their own hardware through the deployed app

### What's the gap
- Production users with capable GPUs (RTX 3060+) should be able to run AI locally for free
- The app should auto-detect, auto-download, and auto-configure Ollama with minimal user friction
- Tool calls (DB reads/writes) must still go through our server — only inference moves to client
- This creates a third AI tier: Groq (built-in), BYOK (user's cloud key), **Local (user's GPU)**

---

## Architecture: How It Works

### The Three Paths in Production

```
Path 1 — Built-in AI (subscribers):
  Browser → POST /api/ai/chat → Railway Server → Groq API → stream back
  Cost: We pay Groq ($0.26/1M tokens)

Path 2 — BYOK (user's own cloud key):
  Browser → POST /api/ai/chat → Railway Server → OpenAI/Anthropic/Google → stream back
  Cost: $0 to us, user pays their provider

Path 3 — Local Ollama (user's own GPU):  ← NEW
  Browser → POST localhost:11434/v1/chat/completions → User's GPU → stream to browser
  Tool calls → POST /api/ai/tools → Railway Server → DB → result back to browser
  Browser feeds tool result → Ollama → final response
  Cost: $0 to us, $0 to user
```

### Communication Flow (Path 3 Detail)

```
Step 1: User sends message
  Browser has: system prompt + conversation history + tool definitions (JSON schema)
  Browser sends POST to localhost:11434/v1/chat/completions
  (SSE stream, same format as Groq/OpenAI)

Step 2: Ollama processes on user's GPU
  Model runs inference locally
  Streams tokens back to browser via SSE

Step 3a: If response is plain text
  Browser displays it, saves to our server via POST /api/ai/chat/save
  Done.

Step 3b: If response contains tool_calls
  Browser intercepts the tool_call (e.g. update_ideas_artifact)
  Browser sends POST /api/ai/tools with:
    { toolName: "update_ideas_artifact", args: { ... }, projectId: "..." }
  Our server executes the tool (Prisma DB read/write)
  Server returns tool result JSON
  Browser constructs next message: [{ role: "tool", content: result }]
  Browser sends this back to localhost:11434 for the next inference step
  Repeat until model returns plain text (max 3 steps, same as server-side)

Step 4: Persistence
  Browser sends full conversation (messages + tool calls + results) to:
    POST /api/ai/chat/save { sessionId, messages }
  Our server saves to AiChatMessage table
  Chat history preserved even though inference was local
```

### Why tool calls must go through our server

Tools read and write to PostgreSQL (project artifacts, ideas, kanban boards, etc.). The browser has no direct DB access — nor should it. The server validates auth, checks project access, and executes Prisma queries. This is the same security model as any web app.

```
Browser CAN:  Call Ollama (inference), display responses, manage conversation state
Browser CAN'T:  Access PostgreSQL, write artifacts, check permissions
Server DOES:  Execute tool calls, validate auth, read/write DB, return results
Server DOESN'T:  Run inference (that's on user's GPU now)
```

---

## Auto-Install Flow

### What the browser can and cannot do

| Action | Browser Can? | Why |
|--------|-------------|-----|
| Detect if Ollama is running | ✅ Yes | `fetch('http://localhost:11434/api/tags')` |
| Trigger a file download | ✅ Yes | Programmatic `<a download>` click |
| Run an installer silently | ❌ No | OS security sandbox |
| Pull a model via Ollama API | ✅ Yes | `POST localhost:11434/api/pull` |
| Set CORS/environment vars | ❌ No | OS security sandbox |

### The Two-Click Install Flow

```
User clicks "Enable Local AI" in Settings
│
├─ Browser fetches localhost:11434/api/tags
│
├─ CASE 1: Ollama is running
│   ├─ Check model list for qwen3:32b
│   ├─ Model present → ✅ "Connected! Local AI ready"
│   └─ Model missing → Auto-pull via API
│       ├─ POST localhost:11434/api/pull { name: "qwen3:32b" }
│       ├─ Stream pull progress (show progress bar, ~20GB download)
│       └─ Done → ✅ "Model ready! Local AI enabled"
│
├─ CASE 2: Ollama not running, not installed
│   ├─ Show modal: "Local AI needs Ollama installed (free, open source)"
│   ├─ [Download Ollama] button → triggers OllamaSetup.exe download
│   ├─ User runs installer → Windows UAC prompt (unavoidable, one click)
│   ├─ Ollama starts as system service automatically
│   ├─ Modal shows: "Installation detected! Click to continue"
│   │   (We poll localhost:11434 every 2 seconds until it responds)
│   ├─ Auto-pull qwen3:32b (progress bar)
│   └─ Done → ✅ "Local AI ready"
│
└─ Save provider as OLLAMA_LOCAL in user's DB record
```

**Total user actions:** Click "Enable Local AI" → Click "Download" → Approve Windows UAC → Wait.
That's **2 intentional clicks + 1 OS approval**.

### Preconfigured Ollama Bundle

Instead of installing bare Ollama and letting the user figure out models and settings, our setup script creates a **custom model** that mirrors our exact local dev configuration. Ollama's `Modelfile` system (like Dockerfile for models) lets us bake in the base model, system prompt, and inference parameters.

#### What the user gets after running our script

```
Ollama installed with:
├── Custom model: "ideamanagement:latest"
│   ├── Base: qwen3:32b (auto-pulled, ~20GB)
│   ├── System prompt: Our full AI assistant prompt with /no_think suffix
│   ├── temperature: 0.7
│   ├── top_p: 0.9
│   ├── num_ctx: 8192 (context window)
│   └── num_predict: -1 (no token limit)
├── OLLAMA_ORIGINS: https://ideamanagement.app,https://*.railway.app,http://localhost:3000
└── Service running and ready
```

#### The Modelfile

Our setup script writes this Modelfile and runs `ollama create ideamanagement -f Modelfile`:

```dockerfile
FROM qwen3:32b

SYSTEM """You are the Idea Management AI assistant. You help users manage their projects, ideas, kanban boards, schemas, and whiteboards.

When asked to take actions (create ideas, update boards, modify schemas), use the provided tools. When having a conversation, respond naturally without using tools.

Be concise, helpful, and direct. /no_think"""

PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER num_ctx 8192
PARAMETER num_predict -1
PARAMETER stop <|im_end|>
```

**Why a custom model instead of raw qwen3:32b:**
- System prompt is baked in — browser doesn't need to inject it (simpler client code)
- Parameters are tuned for tool calling reliability
- `/no_think` is embedded — no empty content bug
- We can update the model remotely (push new version, app prompts user to pull)
- User sees "ideamanagement:latest" in their Ollama list — branded, clear purpose

#### Updating the model remotely

When we change the system prompt or switch base models, we push a new Modelfile to our CDN. The app checks the model version on connect and prompts: "A new AI model update is available. Update now?" → triggers re-pull.

### CORS / Domain Configuration

The setup script preconfigures `OLLAMA_ORIGINS` so Ollama accepts requests from our production domain. Without this, the browser's `fetch()` to `localhost:11434` would be blocked by CORS.

#### What the script sets

```bash
# Windows (PowerShell)
[System.Environment]::SetEnvironmentVariable("OLLAMA_ORIGINS", "https://ideamanagement.app,https://*.railway.app,http://localhost:3000", "User")

# macOS/Linux
echo 'OLLAMA_ORIGINS="https://ideamanagement.app,https://*.railway.app,http://localhost:3000"' >> ~/.ollama/env
```

#### Why these specific origins

| Origin | Purpose |
|--------|---------|
| `https://ideamanagement.app` | Production domain (user's browser making requests) |
| `https://*.railway.app` | Railway preview/staging deployments |
| `http://localhost:3000` | Local development |

#### If the domain changes

The app's setup script URL (`/api/setup/ollama-script`) generates the script dynamically with the current `NEXT_PUBLIC_APP_URL`. So if we change domains, new installs get the right origin. Existing users see a "Update CORS settings" prompt in the setup modal.

### Full Install Flow (Revised)

```
User clicks "Enable Local AI" in Settings
│
├─ Browser fetches localhost:11434/api/tags
│
├─ CASE 1: Ollama running + "ideamanagement:latest" model present
│   └─ ✅ "Connected! Local AI ready" (instant, zero setup)
│
├─ CASE 2: Ollama running + model missing
│   ├─ Check if raw qwen3:32b exists
│   ├─ If yes → create custom model from Modelfile via API (fast, no download)
│   ├─ If no → pull qwen3:32b first (progress bar, ~20GB), then create custom model
│   └─ ✅ "Model ready! Local AI enabled"
│
├─ CASE 3: Ollama not running / not installed
│   ├─ Show modal: "Enable free Local AI (requires ~22GB disk + 20GB GPU VRAM)"
│   ├─ Detect OS (Windows/macOS/Linux)
│   ├─ Option A: [Run Setup Script] → downloads platform-specific script
│   │   ├─ Windows: PowerShell script (.ps1)
│   │   ├─ macOS/Linux: Bash script (.sh)
│   │   ├─ Script does EVERYTHING: install Ollama, set OLLAMA_ORIGINS, pull model, create custom model
│   │   ├─ User approves: Windows UAC / macOS sudo prompt (1 click)
│   │   └─ Script prints: "Done! Go back to the app"
│   ├─ Option B: [Download Ollama Manually] → link to ollama.com
│   │   └─ After install, app detects Ollama → auto-creates custom model
│   ├─ Browser polls localhost:11434 every 2 seconds until detected
│   └─ ✅ "Connected! Local AI ready"
│
└─ Save provider as OLLAMA_LOCAL in user's DB record
```

**Total user actions:** Click "Enable Local AI" → Click "Run Setup Script" → Approve OS prompt → Wait → Done.
**That's 2 intentional clicks + 1 OS approval.** Everything else is automatic.

---

## Plan

### Part 1: Server-Side Tool Execution Endpoint

New endpoint that executes a single tool call (extracted from the current chat route).

- [ ] Create `apps/web/src/app/api/ai/tools/route.ts`
  - POST handler accepts `{ toolName, args, projectId, sessionId }`
  - Auth check (same as chat route — admin/BYOK/subscriber)
  - Execute tool from `artifact-tools.ts`
  - Return `{ result: JSON }`
  - Log to AiToolOutput for audit trail
- [ ] Extract tool execution logic from `chat/route.ts` into shared helper
  - Both endpoints use the same tool definitions and execution
- [ ] Add rate limiting (prevent abuse of tool endpoint)

### Part 2: Client-Side Ollama Detection & Setup

Browser-side detection, download trigger, and model pull.

- [ ] Create `apps/web/src/lib/ollama-client.ts`
  - `detectOllama()` — fetch localhost:11434/api/tags from browser
  - `getInstalledModels()` — parse tag list
  - `hasCustomModel()` — check for `ideamanagement:latest` specifically
  - `hasBaseModel()` — check for `qwen3:32b` (can create custom from it without re-download)
  - `pullModel(name, onProgress)` — POST to /api/pull with progress streaming
  - `createCustomModel(modelfileContent)` — POST to /api/create to build ideamanagement:latest
  - `isModelReady(name)` — check if specific model is loaded
  - `getModelDigest(name)` — get hash for version checking
  - `detectOS()` — return windows/mac/linux for script download
  - `getSetupScriptUrl()` — return `/api/setup/ollama-script?os=detected`
- [ ] Create `apps/web/src/components/ai/ollama-setup-modal.tsx`
  - Step 1: "Checking for Ollama..." (auto-detect)
  - Step 2a: "Ollama found! Checking model..." → auto-pull if missing → progress bar
  - Step 2b: "Ollama not found" → Download button + instructions
  - Step 3: Polling loop (check every 2s after download triggered)
  - Step 4: "Connected!" confirmation
- [ ] Update Settings page AI Configuration section
  - Replace current server-side Ollama connect with browser-side detection
  - Show GPU info if available (navigator.gpu)
  - Show model size warning for low-VRAM systems

### Part 3: Client-Side Chat Orchestration

The core feature — browser talks to Ollama directly, server handles tools.

- [ ] Create `apps/web/src/lib/ollama-chat.ts`
  - `streamOllamaChat(messages, tools, onToken, onToolCall)`
  - Sends to localhost:11434/v1/chat/completions with streaming
  - Parses SSE stream (same format as our existing parser)
  - Detects tool_calls in response, fires onToolCall callback
  - Handles multi-step: tool_call → execute → feed result → continue (max 3 steps)
- [ ] Create `apps/web/src/hooks/use-ollama-chat.ts`
  - React hook wrapping ollama-chat.ts
  - Manages conversation state, loading, error
  - On tool_call: POST to /api/ai/tools, feed result back to Ollama
  - On complete: POST to /api/ai/chat/save for persistence
  - Exposes same interface as current useChat (messages, isLoading, send)
- [ ] Update AI chat page (`apps/web/src/app/(authenticated)/ai/page.tsx`)
  - Detect if user's provider is OLLAMA_LOCAL
  - If yes: use useOllamaChat hook (browser → Ollama → browser)
  - If no: use existing server-side flow (browser → server → Groq)
  - Same UI either way — user doesn't see the difference
- [ ] Update AI helper widget (`apps/web/src/components/ai/ai-helper.tsx`)
  - Same provider detection and hook switching
- [ ] System prompt injection
  - Browser must include the same system prompt as server-side
  - Create shared `getSystemPrompt(project, artifacts)` used by both paths
  - Browser fetches project context via GET /api/ai/context/{projectId}

### Part 4: Preconfigured Setup Scripts + Custom Model

Companion scripts that install Ollama, configure CORS for our domain, and create our branded custom model.

- [ ] Create `apps/web/src/app/api/setup/ollama-script/route.ts`
  - GET endpoint that dynamically generates the setup script
  - Injects current `NEXT_PUBLIC_APP_URL` into OLLAMA_ORIGINS
  - Returns `.ps1` or `.sh` based on `?os=windows|mac|linux` query param
  - Embeds the Modelfile content inline in the script
- [ ] Create `public/setup/Modelfile`
  - `FROM qwen3:32b`
  - `SYSTEM` with our full AI assistant prompt + `/no_think`
  - `PARAMETER temperature 0.7`, `top_p 0.9`, `num_ctx 8192`, `num_predict -1`
- [ ] Windows setup script (generated by API, served as .ps1):
  - Check if Ollama is already installed (`ollama --version`)
  - If not: download OllamaSetup.exe from official URL, run it (triggers UAC)
  - Wait for Ollama service to start (poll `localhost:11434` with retry)
  - Set `OLLAMA_ORIGINS` env var with our production domain + Railway + localhost
  - Restart Ollama service to pick up new ORIGINS
  - `ollama pull qwen3:32b` (progress shown in terminal)
  - Write Modelfile to temp dir
  - `ollama create ideamanagement -f Modelfile`
  - Print "Setup complete! Return to the app and click Connect"
- [ ] macOS/Linux setup script (generated by API, served as .sh):
  - `curl -fsSL https://ollama.com/install.sh | sh`
  - Write OLLAMA_ORIGINS to `~/.ollama/env`
  - Restart Ollama
  - `ollama pull qwen3:32b`
  - Write Modelfile, `ollama create ideamanagement -f Modelfile`
- [ ] Update ollama-setup-modal to detect OS via `navigator.userAgent`
  - Show platform-appropriate instructions
  - "Run Setup Script" button downloads from `/api/setup/ollama-script?os=detected`
  - Show terminal command preview so user knows what they're running
- [ ] Model version checking
  - Store current Modelfile hash in app config
  - On connect, compare local model digest vs expected
  - If mismatch: "AI model update available" prompt → re-create from new Modelfile
- [ ] Update `ollama-client.ts` to use `ideamanagement:latest` as default model name
  - Falls back to raw `qwen3:32b` if custom model not found

### Part 5: Persistence & Chat History

Ensure local Ollama conversations are saved to our DB like server-side ones.

- [ ] Create `apps/web/src/app/api/ai/chat/save/route.ts`
  - POST accepts `{ sessionId, messages: [...] }`
  - Validates auth, saves to AiChatMessage table
  - Handles tool call records (AiToolOutput)
- [ ] Create `apps/web/src/app/api/ai/context/[projectId]/route.ts`
  - GET returns project artifacts needed for system prompt
  - Ideas, kanban, schema, whiteboard content
  - Browser injects these into system prompt for Ollama
- [ ] Update chat history to show provider badge
  - "via Groq" / "via Local AI" / "via OpenAI" per message
  - Helps user understand which AI processed each message

### Part 6: Testing & Edge Cases

- [ ] Test: Ollama not installed → download flow → detect after install
- [ ] Test: Ollama installed, model missing → auto-pull → progress → ready
- [ ] Test: Ollama installed, model ready → instant connect
- [ ] Test: Tool calling flow → browser calls Ollama → tool_call → server executes → result fed back
- [ ] Test: Multi-step tool flow (3 steps max)
- [ ] Test: Chat persistence → local conversation saved to DB
- [ ] Test: Provider switching → user switches between Groq and Local mid-session
- [ ] Test: Ollama crashes mid-conversation → graceful error → offer Groq fallback
- [ ] Test: CORS issues → helpful error message with fix instructions
- [ ] Test: Low VRAM system → model doesn't fit → show warning
- [ ] Update runbook: ai-configuration-guide.md with client-side Ollama docs
- [ ] Update architecture-and-recommendations.md with third path diagram

---

## Questions

1. **Model choice for end users:** Should we default to qwen3:32b (needs 20GB VRAM) or offer qwen3:4b as a fallback for users with 8GB GPUs? Or detect VRAM and auto-select?
2. **Fallback behavior:** If Ollama dies mid-conversation, should we auto-switch to Groq (if available) or show an error?
3. **Model updates:** When we release a newer default model, should the app prompt users to pull the new one?
