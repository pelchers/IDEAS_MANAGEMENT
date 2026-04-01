# AI Model Choice — Built-In Model Selection

**Last updated:** 2026-03-27
**Purpose:** Choose the best AI model for our built-in AI that's compatible with Claude/Codex API key users and our hosted Groq inference.

---

## Why Claude & Codex API Compatibility is the #1 Factor

Our app lets users plug in their own API keys — OpenAI, Anthropic (Claude), Google, or OpenRouter. Our built-in AI uses the same code path. Here's what that means:

**How our SDK works:**
- We use the **Vercel AI SDK** with `tool()` helpers and Zod schemas
- For **Groq and Ollama**, we call `createOpenAI({ baseURL })` — this sends the **OpenAI function calling format**
- For **Anthropic BYOK**, the SDK auto-converts to Claude's `input_schema` format
- For **OpenAI BYOK**, it sends native OpenAI format

**What this means for model choice:**
- Our built-in model receives the **OpenAI tool calling format** (JSON schema with `type: "function"`)
- The model must return `tool_calls` array in the response (not XML text, not markdown)
- Models that don't properly support OpenAI-compat tool calling through Ollama's `/v1/` endpoint are **disqualified**

**Real failure we hit:** `qwen3-coder:30b` generates `<function=update_ideas_artifact>` as XML text instead of making actual tool calls through Ollama's `/v1/chat/completions`. The native `/api/chat` works, but our SDK uses `/v1/`. This model is disqualified.

| Requirement | Why |
|-------------|-----|
| Must produce `tool_calls` JSON array via `/v1/` | Our SDK expects OpenAI response format |
| Must handle multi-step (tool result → text response) | We use `stopWhen: stepCountIs(3)` |
| Must be available on Groq (production) | Our hosted AI provider |
| Permissive license | We charge for built-in AI access |
| Good general + coding knowledge | Users ask about app development, schemas, project planning |

---

## Table 1: Top Open-Source Models (Leaderboard)

Source: [artificialanalysis.ai/leaderboards/models](https://artificialanalysis.ai/leaderboards/models?is_open_weights=open_source)

| Rank | Model | Creator | Intelligence Index | Context | $/1M Tokens | Speed (tok/s) | Latency (s) |
|------|-------|---------|-------------------|---------|-------------|---------------|-------------|
| 1 | GLM-5 (Reasoning) | Z AI | 50 | 200K | $1.55 | 69 | 1.60 |
| 2 | Kimi K2.5 (Reasoning) | Kimi | 47 | 256K | $1.20 | 43 | 2.87 |
| 3 | Qwen3.5 397B A17B | Alibaba | 45 | 262K | $1.35 | 96 | 2.61 |
| 4 | Qwen3.5 27B | Alibaba | 42 | 262K | $0.82 | 85 | 5.61 |
| 5 | DeepSeek V3.2 | DeepSeek | 42 | 128K | $0.32 | 33 | 1.79 |
| 6 | Qwen3.5 122B A10B | Alibaba | 42 | 262K | $1.10 | 121 | 2.33 |
| 7 | MiMo-V2-Flash | Xiaomi | 41 | 256K | $0.15 | 132 | 2.17 |
| 8 | Step 3.5 Flash | StepFun | 38 | 256K | $0.15 | 96 | 3.53 |
| 9 | Qwen3.5 35B A3B | Alibaba | 37 | 262K | $0.69 | 165 | 2.08 |
| 10 | NVIDIA Nemotron 3 Super | NVIDIA | 36 | 1M | $0.41 | 399 | 0.72 |
| 11 | gpt-oss-120B (high) | OpenAI | 33 | 131K | $0.26 | 263 | 0.83 |
| 12 | Qwen3.5 9B | Alibaba | 32 | 262K | $0.11 | 54 | 0.62 |
| 13 | Qwen3 Coder Next | Alibaba | 28 | 256K | $0.60 | 147 | 1.29 |
| 14 | Mistral Small 4 (reasoning) | Mistral | 27 | 256K | $0.26 | — | — |
| 15 | gpt-oss-20B (high) | OpenAI | 24 | 131K | $0.09 | 295 | 0.69 |
| 16 | NVIDIA Nemotron 3 Nano | NVIDIA | 24 | 1M | $0.10 | 121 | 1.82 |
| 17 | Mistral Large 3 | Mistral | 23 | 256K | $0.75 | 49 | 1.09 |
| 18 | gpt-oss-20B (low) | OpenAI | 21 | 131K | $0.09 | 291 | 0.69 |
| 19 | Mistral Small 4 (non-reasoning) | Mistral | 19 | 256K | $0.26 | 134 | 0.62 |
| 20 | Llama Nemotron Super 49B | NVIDIA | 19 | 128K | $0.17 | 50 | 1.00 |
| 21 | Llama 4 Maverick | Meta | 18 | 1M | $0.49 | 122 | 0.99 |
| 22 | Llama 3.1 405B | Meta | 17 | 128K | $3.69 | 29 | 2.15 |
| 23 | Hermes 4 70B | Nous Research | 16 | 128K | $0.20 | 70 | 1.39 |
| 24 | Llama 3.3 70B | Meta | 14 | 128K | $0.64 | 87 | 1.38 |
| 25 | Llama 4 Scout 17B | Meta | 14 | 10M | $0.29 | 128 | 0.77 |
| 26 | Gemma 3 27B | Google | 10 | 128K | — | 29 | 2.20 |
| 27 | Gemma 3 12B | Google | 9 | 128K | — | 28 | 18.62 |

---

## Table 2: Models Available on Groq (Production + Preview)

Source: [console.groq.com/docs/models](https://console.groq.com/docs/models)

| Model ID | Creator | Context | Speed (tok/s) | Input $/1M | Output $/1M | Status | Tool Calling |
|----------|---------|---------|---------------|-----------|------------|--------|-------------|
| `llama-3.3-70b-versatile` | Meta | 128K | 280 | $0.59 | $0.79 | Production ✅ | ✅ Yes |
| `llama-3.1-8b-instant` | Meta | 128K | 560 | $0.05 | $0.08 | Production ✅ | ✅ Yes |
| `openai/gpt-oss-120b` | OpenAI | 128K | 500 | $0.15 | $0.60 | Production ✅ | ✅ Yes |
| `openai/gpt-oss-20b` | OpenAI | 128K | 1000 | $0.075 | $0.30 | Production ✅ | ✅ Yes |
| `qwen/qwen3-32b` | Alibaba | 128K | 400 | $0.29 | $0.59 | Preview ⚠️ | ✅ Yes |
| `meta-llama/llama-4-scout-17b` | Meta | 128K | 750 | $0.11 | $0.34 | Preview ⚠️ | ✅ Yes |

---

## Table 3: Cross-Reference — Leaderboard × Groq Availability

| Model | Leaderboard Score | Groq Status | Groq Speed | Groq Cost (blended) | Tool Calling | License | Fits 24GB VRAM? |
|-------|------------------|-------------|-----------|---------------------|-------------|---------|-----------------|
| **gpt-oss-120B** | **33** | Production ✅ | 500 tok/s | **$0.26/1M** | ✅ | Open | ❌ Too large |
| **gpt-oss-20B** | **24** | Production ✅ | **1000 tok/s** | **$0.09/1M** | ✅ | Open | ✅ ~12 GB Q4 |
| **Llama 3.3 70B** | 14 | Production ✅ | 280 tok/s | $0.64/1M | ✅ | Llama Community | ❌ ~38 GB |
| **Llama 3.1 8B** | <10 | Production ✅ | **560 tok/s** | **$0.05/1M** | ✅ | Llama Community | ✅ ~4.9 GB |
| **Qwen3 32B** | ~37 (3.5 variant) | Preview ⚠️ | 400 tok/s | $0.36/1M | ✅ | Apache 2.0 | ✅ ~19.8 GB (tight) |
| **Llama 4 Scout 17B** | 14 | Preview ⚠️ | **750 tok/s** | $0.18/1M | ✅ | Llama 4 Community | ✅ ~10 GB |

---

## Key Observations

### The Leaderboard vs Our Needs

The leaderboard measures general intelligence (reasoning, math, coding benchmarks). Our primary need is **tool calling reliability** — which is not directly measured by this score. A model scoring 14 (Llama 3.3 70B) can have excellent tool calling while a model scoring 42 (DeepSeek V3.2) might not be available on our provider.

### What's Actually Available on Groq Production

Only **4 models** are in Groq production. Of those:
- **gpt-oss-120B** has the highest leaderboard score (33) and good speed (500 tok/s)
- **gpt-oss-20B** is the cheapest ($0.09/1M) and fastest (1000 tok/s) but lower intelligence (24)
- **Llama 3.3 70B** is battle-tested for tool calling but scores lower (14) and costs more ($0.64/1M)
- **Llama 3.1 8B** is ultra-cheap but too small for reliable complex tool calling

### Token Efficiency Matters

Even cheap models are expensive if they generate unnecessary tokens. A verbose model at $0.09/1M that generates 3x more tokens per response costs the same as a concise model at $0.27/1M. The `gpt-oss` models are trained to be efficient.

---

## Suggestions

### For Groq (Production)

| Choice | Model | Why | Cost | Risk |
|--------|-------|-----|------|------|
| **Recommended** | `openai/gpt-oss-120b` | Highest IQ on Groq (33), fast (500/s), proven tools | $0.26/1M | New model, less battle-tested than Llama |
| **Safe fallback** | `llama-3.3-70b-versatile` | Most battle-tested for function calling, proven | $0.64/1M | Lower leaderboard score (14), costs 2.5x more |
| **Budget** | `openai/gpt-oss-20b` | Cheapest ($0.09), fastest (1000/s) | $0.09/1M | Lower IQ (24), may struggle with complex multi-step |

### For Ollama (Local Development)

| Choice | Model | Size | Why |
|--------|-------|------|-----|
| **Current default** | `qwen3:32b` | 19.8 GB | Tool calling ✅, text ✅ (with /no_think), 32B intelligence, fits RTX 4090 |
| **Fallback** | `qwen2.5:7b` | 4.4 GB | Fast, reliable text + tools, but less intelligent |
| **Avoid** | `qwen3-coder:30b` | 18 GB | Broken — generates XML text instead of tool_calls via `/v1/` |
| **Not needed** | `qwen2.5:14b` | 8.5 GB | Works but qwen3:32b is smarter with /no_think fix |

**qwen3:32b thinking mode fix:** By default, qwen3 models use "thinking mode" which puts output in a `reasoning` field and returns empty `content`. We fixed this by appending `/no_think` to the system prompt — this disables verbose thinking so the model responds with direct text. Tool calling works normally with or without thinking mode. The reasoning field is captured and displayed in a collapsible section under each AI message.

### Locked-In Choices

| Environment | Model | Why |
|-------------|-------|-----|
| **Groq (production)** | `openai/gpt-oss-120b` | Highest intelligence on Groq (33), fast (500/s), tools ✅, text ✅ |
| **Ollama (local dev)** | `qwen3:32b` | 32B intelligence, tool calling ✅, text ✅ (with /no_think), reasoning display, fits 24GB VRAM |

**Next step:** Get Groq API key (`gsk_...` from https://console.groq.com/keys) → add to `.env` → production AI works.
