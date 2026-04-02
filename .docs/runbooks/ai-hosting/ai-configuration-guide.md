# AI Configuration Guide

**Last updated:** 2026-04-01
**Purpose:** How AI is configured for local development vs production, what each option means, and how end users interact with it.

---

## Architecture Overview

Our AI system has **server-side provider resolution**. When a user sends a message, the backend (`get-user-model.ts`) determines which AI provider to call based on:

1. The user's saved `aiProvider` setting in the database
2. Available server-side environment variables
3. Whether certain services are reachable from the server

**Critical point:** All AI calls happen server-side. The browser never talks to an AI provider directly. This means "local" always means local *to the server*, not to the user's browser.

```
User's Browser  →  Our Server (Railway)  →  AI Provider (Groq/OpenAI/etc.)
                   ↑                         ↑
                   This is where              This is where
                   get-user-model.ts          inference runs
                   runs
```

---

## Provider Resolution Chain

When a user sends a chat message, the server resolves which AI to use in this order:

| Priority | Provider | Condition | Who Pays |
|----------|----------|-----------|----------|
| 1 | **BYOK** (user's own key) | User saved an API key in Settings | User pays their provider |
| 2 | **Groq API** (built-in) | `GROQ_API_KEY` env var is set | We pay Groq |
| 3 | **Ollama Local** | User set provider to Ollama AND `localhost:11434` is reachable from server | Free (our GPU) |
| 4 | **Server OpenAI** | `OPENAI_API_KEY` env var is set | We pay OpenAI |
| 5 | **Ollama Auto-detect** | `localhost:11434` reachable from server (any user) | Free (our GPU) |
| 6 | **None** | Nothing available | AI unavailable |

### Access Gate (before resolution)

Before the provider chain runs, there's an access check:
- **Admin users** → bypass, always allowed
- **BYOK users** → bypass, they pay their own provider
- **All others** → must have active subscription (Stripe entitlement)

---

## Local Development Configuration

### How It Works

When you run `pnpm dev` on your machine, the Next.js server runs on `localhost:3000`. Ollama runs on `localhost:11434`. They're on the same machine, so `isOllamaRunning()` returns `true`.

```
Your Machine (RTX 4090)
├── Next.js dev server (localhost:3000)
├── Ollama (localhost:11434)
│   └── qwen3:32b model loaded
└── PostgreSQL (localhost:5432)

→ AI calls go: Next.js → localhost:11434 → qwen3:32b → response
→ Cost: $0 (your own hardware)
```

### Setup Steps

1. **Install Ollama:** `winget install Ollama.Ollama`
2. **Pull the model:** `ollama pull qwen3:32b`
3. **Start Ollama:** It runs as a service automatically
4. **No env vars needed** — auto-detected at priority 5

### To use Groq locally instead of Ollama

Add to `.env`:
```
GROQ_API_KEY=gsk_...
```
Groq (priority 2) will be used instead of Ollama (priority 5).

### Default Models

| Provider | Default Model | Why |
|----------|--------------|-----|
| Ollama | `qwen3:32b` | Best tool calling + text quality that fits 24GB VRAM |
| Groq | `openai/gpt-oss-120b` | Highest intelligence on Groq, fast, reliable tools |

### qwen3 Thinking Mode Fix

qwen3 models use "thinking mode" by default — they put output in a `reasoning` field and return empty `content`. Our system prompt appends `/no_think` to disable this, so the model returns direct text. Reasoning is still captured and displayed in a collapsible section.

---

## Production Configuration (Railway)

### How It Works

Railway runs our entire Next.js app (frontend SSR + API routes) and PostgreSQL. There is **no GPU on Railway** — it's a standard CPU container.

```
Railway Server (no GPU)
├── Next.js app (handles HTTP, SSR, API routes)
├── PostgreSQL (database)
└── NO Ollama (can't run — no GPU, no model)

→ AI calls go: Next.js → Groq API (HTTPS) → gpt-oss-120b → response
→ Cost: $0.26 per 1M tokens
```

### Required Environment Variables

Set these in Railway dashboard → your service → Variables:

| Variable | Value | Required? |
|----------|-------|-----------|
| `GROQ_API_KEY` | `gsk_...` from console.groq.com | **Yes** (built-in AI) |
| `DATABASE_URL` | Railway auto-provides | Auto |
| `AI_ENCRYPTION_KEY` | Random 32-byte hex | **Yes** (encrypts BYOK keys) |
| `STRIPE_SECRET_KEY` | `sk_live_...` | For billing |
| `STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | For billing |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | For billing |

### Ollama in Production — Client-Side Architecture

**Server-side Ollama does not work in production** (Railway has no GPU). But we support **client-side Ollama** — the user's browser talks directly to Ollama on their machine.

#### How server-side fails (and why we don't use it)

1. Railway containers have no GPU
2. `isOllamaRunning()` hits `localhost:11434` on Railway's server — nothing listening
3. Always returns `false` in production

#### How client-side works (the solution)

Instead of routing through our server, the browser calls the user's local Ollama directly:

```
Server-side path (Groq/BYOK — normal):
  Browser → POST /api/ai/chat → Railway → Groq API → stream back

Client-side path (Local Ollama — new):
  Browser → POST localhost:11434/v1/chat/completions → User's GPU → stream to browser
  Tool calls → POST /api/ai/tools → Railway → DB read/write → result to browser
  Browser feeds result → Ollama → final text response
```

**Inference is local** (user's GPU, zero cost). **Tool execution is server-side** (needs DB access). **Chat history is saved** to our DB after each exchange.

#### The install flow

1. User clicks "Enable Local AI" in Settings
2. Browser checks `localhost:11434` from the browser (not server)
3. If Ollama not found → download installer, user approves Windows UAC (1 click)
4. Browser polls until Ollama is detected
5. Browser auto-pulls `qwen3:32b` via Ollama API (progress bar)
6. Provider saved as `OLLAMA_LOCAL`, all future chats use client-side path

See: `.docs/planning/plans/3-client-side-ollama-production.md` for full architecture.

---

## End User Configuration (Settings Page)

Users configure their AI provider on the Settings page under **AI Configuration**.

### Available Options for End Users

| Option | What It Does | Who Should Use It |
|--------|-------------|-------------------|
| **Built-in AI** | Uses Groq API (our key) | Subscribers — we pay |
| **OpenAI** | User pastes `sk-...` key | Users who prefer GPT-4o |
| **Anthropic** | User pastes `sk-ant-...` key | Users who prefer Claude |
| **Google** | User pastes Google AI key | Users who prefer Gemini |
| **OpenRouter** | OAuth connect or paste key | Users wanting model variety |
| **Local AI (Ollama)** | Browser talks to user's local Ollama | Users with GPUs who want free, private AI |

### Local AI Setup Flow

When a user clicks "Enable Local AI":

1. **Browser** checks `localhost:11434` (from the browser, not server)
2. **If Ollama not found:** Shows setup modal → user runs our preconfigured setup script (installs Ollama + pulls model + sets CORS + creates custom `ideamanagement:latest` model with baked-in system prompt, parameters, and `/no_think` — 2 clicks + 1 OS approval)
3. **If Ollama found but custom model missing:** Auto-creates `ideamanagement:latest` from Modelfile via Ollama API (pulls base `qwen3:32b` first if needed, progress bar)
4. **If ready:** Saves provider, all future AI calls go browser → local Ollama (`ideamanagement:latest`)
5. **Tool calls** still go through our server via `/api/ai/tools` (DB access required)
6. **Chat history** saved to our DB after each exchange
7. **CORS preconfigured:** Setup script sets `OLLAMA_ORIGINS` to our production domain + Railway + localhost — browser can reach local Ollama from our deployed site

### BYOK (Bring Your Own Key) Flow

1. User goes to Settings > AI Configuration
2. Selects a provider (OpenAI, Anthropic, Google, OpenRouter)
3. Pastes their API key
4. Key is encrypted with `AI_ENCRYPTION_KEY` and stored in database
5. All future AI calls use their key and provider
6. **BYOK users bypass subscription checks** — they pay their provider directly

---

## Configuration Summary Table

| Scenario | AI Provider | Model | Cost to Us | Setup |
|----------|------------|-------|-----------|-------|
| **Local dev** | Ollama | qwen3:32b | $0 | Install Ollama + pull model |
| **Local dev + Groq** | Groq API | gpt-oss-120b | $0.26/1M tokens | Add `GROQ_API_KEY` to .env |
| **Production (built-in)** | Groq API | gpt-oss-120b | $0.26/1M tokens | Set `GROQ_API_KEY` on Railway |
| **Production (BYOK)** | User's choice | User's choice | $0 | User adds key in Settings |
| **Production (no key, no sub)** | None | N/A | N/A | User sees "subscribe or add key" |

---

## File Reference

| File | Purpose |
|------|---------|
| `apps/web/src/server/ai/get-user-model.ts` | Provider resolution chain |
| `apps/web/src/app/api/ai/chat/route.ts` | Chat endpoint, system prompt, tool orchestration |
| `apps/web/src/server/ai/crypto.ts` | BYOK key encryption/decryption |
| `apps/web/src/server/ai/tools/artifact-tools.ts` | 8 real artifact-writing tools |
| `apps/web/src/app/(authenticated)/settings/page.tsx` | Settings page with AI config section |
