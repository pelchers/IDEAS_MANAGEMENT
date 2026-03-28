# AI Model Comparison for Tool/Function Calling

**Last updated:** 2026-03-27
**Purpose:** Production AI model selection for IDEA-MANAGEMENT app (Vercel AI SDK + OpenAI-compatible providers)

---

## Table of Contents

1. [API Format Comparison](#1-api-format-comparison)
2. [Vercel AI SDK Abstraction](#2-vercel-ai-sdk-abstraction)
3. [Open-Source Models Trained on OpenAI Format](#3-open-source-models-trained-on-openai-format)
4. [Model Comparison Matrix](#4-model-comparison-matrix)
5. [Provider Availability Matrix](#5-provider-availability-matrix)
6. [Recommendations](#6-recommendations)

---

## 1. API Format Comparison

### OpenAI Function Calling Format

The OpenAI API uses a `tools` array in the request body. Each tool is defined with `type: "function"` and a nested `function` object containing the JSON Schema for parameters.

```json
{
  "model": "gpt-4o",
  "messages": [{"role": "user", "content": "What's the weather?"}],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "Get weather for a location",
        "parameters": {
          "type": "object",
          "properties": {
            "location": { "type": "string", "description": "City name" }
          },
          "required": ["location"],
          "additionalProperties": false
        },
        "strict": true
      }
    }
  ]
}
```

**Response** returns `tool_calls` array with `id`, `function.name`, and `function.arguments` (JSON string). The `id` is used when submitting tool results back as a `tool` role message.

**Key features:**
- `strict: true` enables Structured Outputs (model guaranteed to match schema exactly)
- Supports parallel tool calls (multiple tools in one response)
- Parameters use standard JSON Schema with types, enums, nested objects, arrays

### Anthropic Claude Tool Use Format

Claude uses a `tools` array with `name`, `description`, and `input_schema` (not nested under `function`).

```json
{
  "model": "claude-sonnet-4-20250514",
  "messages": [{"role": "user", "content": "What's the weather?"}],
  "tools": [
    {
      "name": "get_weather",
      "description": "Get weather for a location",
      "input_schema": {
        "type": "object",
        "properties": {
          "location": { "type": "string", "description": "City name" }
        },
        "required": ["location"]
      }
    }
  ]
}
```

**Key differences from OpenAI:**
- Uses `input_schema` instead of `parameters` nested under `function`
- No `type: "function"` wrapper -- tools are flat objects
- Response uses `content` blocks with `type: "tool_use"` containing `id`, `name`, `input`
- Tool results sent as `type: "tool_result"` content blocks
- Supports `strict: true` for exact schema adherence
- Supports `input_examples` for few-shot tool calling demonstrations
- Server-side tools (web_search, code_execution) run on Anthropic infrastructure

### Format Translation Table

| Feature              | OpenAI                        | Anthropic                      |
|----------------------|-------------------------------|--------------------------------|
| Tool definition key  | `tools[].function.parameters` | `tools[].input_schema`         |
| Tool type wrapper    | `type: "function"`            | None (flat)                    |
| Tool call in response| `tool_calls[].function`       | `content[].type: "tool_use"`   |
| Tool result role     | `role: "tool"`                | `role: "user"` with `tool_result` block |
| Parallel calls       | Yes                           | Yes                            |
| Strict mode          | `strict: true`                | `strict: true`                 |

---

## 2. Vercel AI SDK Abstraction

The Vercel AI SDK (v5/v6) provides a **unified tool interface** that abstracts away provider differences entirely. Our codebase uses this.

### How it works

Tools are defined using Zod schemas via the `tool()` helper:

```typescript
import { tool } from "ai";
import { z } from "zod";

const myTool = tool({
  description: "Get weather for a location",
  inputSchema: z.object({
    location: z.string().describe("City name"),
  }),
  execute: async ({ location }) => {
    return { temperature: 72 };
  },
});
```

**Under the hood:**
1. The SDK converts Zod schemas to JSON Schema via `zodSchema()`
2. When calling OpenAI-compatible providers (including Ollama via `/v1/chat/completions`), it sends the **OpenAI function calling format** (tools array with `type: "function"`)
3. When calling Anthropic, it translates to `input_schema` format
4. When calling Google, it uses their native format
5. Tool call responses are normalized back into a unified format

### Provider packages used in our codebase

| Provider    | Package                   | Format sent to API         |
|-------------|---------------------------|----------------------------|
| OpenAI      | `@ai-sdk/openai`         | OpenAI native              |
| Anthropic   | `@ai-sdk/anthropic`      | Anthropic native           |
| Google      | `@ai-sdk/google`         | Google native              |
| Groq        | `@ai-sdk/openai` (custom baseURL) | OpenAI-compatible |
| Ollama      | `@ai-sdk/openai` (custom baseURL) | OpenAI-compatible |
| OpenRouter  | `@openrouter/ai-sdk-provider`     | OpenAI-compatible |

**Critical insight:** For Groq and Ollama, we use `createOpenAI()` with a custom `baseURL`. This means the SDK sends the **exact OpenAI function calling format**. Therefore, **any model we use through Ollama or Groq must understand the OpenAI tool calling format**.

---

## 3. Open-Source Models Trained on OpenAI Format

These models have been specifically fine-tuned on or natively support the OpenAI function calling format:

### Natively Trained (by the model developer)

| Model Family     | Tool Call Format                        | Notes                                  |
|------------------|-----------------------------------------|----------------------------------------|
| **Llama 3.1/3.3** | Native Llama tool format (OpenAI-compatible via template) | Meta trained with tool-use data; Ollama maps to OpenAI format via chat template |
| **Qwen 2.5/3**   | Hermes-style + native Qwen format       | Qwen uses Hermes-compatible tool format; works with OpenAI-compat endpoints |
| **Mistral/Mixtral** | Native Mistral tool format             | Mistral models have native function calling; mapped by Ollama |
| **Command R/R+** | Native Cohere tool format               | Designed for tool use; Ollama provides OpenAI-compat mapping |
| **DeepSeek V3.x** | Native DeepSeek format                 | V3.1+ improved tool use; V3.2 has reasoning-in-tool-use |
| **Gemma 2/3**    | Community tool templates                | Not natively trained; community Ollama templates add support |

### Fine-Tuned Variants (third-party)

| Model                          | Base         | Notes                                      |
|--------------------------------|--------------|--------------------------------------------|
| **Hermes 3 (NousResearch)**    | Llama 3.1 8B | Fine-tuned on Hermes Function Calling V1 dataset; OpenAI-compatible format |
| **Llama-3-Groq-Tool-Use 8B/70B** | Llama 3    | Groq's fine-tune specifically for tool calling; top BFCL scores |
| **Functionary**                | Various      | meetkai's models fine-tuned for OpenAI function calling |
| **FunctionGemma**              | Gemma        | Google's lightweight model specifically for function calling |
| **Firefunction v2**            | Llama 3      | Fireworks AI fine-tune for function calling |

---

## 4. Model Comparison Matrix

### Tier 1: Best Tool Calling (Recommended for Production)

| Model | Params | Q4_K_M Size | Context | BFCL Score | License | Known Issues |
|-------|--------|-------------|---------|------------|---------|--------------|
| **Qwen3-32B** | 32B dense | ~19.8 GB | 32K (128K via YaRN) | 68.2 (BFCL v3) | Apache 2.0 | Excellent stability; rarely hallucinates tool calls |
| **Llama 3.3 70B** | 70B dense | ~38 GB | 128K | 77.3 (BFCL v2, 0-shot) | Llama 3.3 Community | Large VRAM requirement; otherwise very reliable |
| **Qwen3-Coder 30B-A3B** | 30.5B total / 3.3B active (MoE) | ~18 GB | 262K native | Strong (designed for agentic) | Apache 2.0 | MoE = fast inference; excels at tool calling; **current default in our app** |
| **Llama 3.1 70B** | 70B dense | ~38 GB | 128K | 77.5 (BFCL v2, 0-shot) | Llama 3.1 Community | Proven; slightly better than 3.3 on BFCL |

### Tier 2: Good Tool Calling (Viable Alternatives)

| Model | Params | Q4_K_M Size | Context | BFCL Score | License | Known Issues |
|-------|--------|-------------|---------|------------|---------|--------------|
| **Qwen 2.5 72B** | 72B dense | ~43 GB | 128K | N/A (pre-BFCL v3) | Apache 2.0 | Very capable but superseded by Qwen3 |
| **Qwen 2.5 32B** | 32B dense | ~19 GB | 128K | N/A | Apache 2.0 | Good balance of size and capability |
| **Qwen 2.5 14B** | 14B dense | ~8.5 GB | 128K | N/A | Apache 2.0 | Outperforms Gemma2-27B on many tasks |
| **Mistral Nemo 12B** | 12B dense | ~7.5 GB | 128K | N/A | Apache 2.0 | Trained on function calling; good multilingual |
| **Mistral Small 22B** | 22B dense | ~13 GB | 32K | N/A | Apache 2.0 | Improved function calling over Nemo |
| **DeepSeek V3.2** | 671B MoE / ~37B active | Very large | 128K+ | ~81.5% (custom eval) | DeepSeek License | First model with reasoning-in-tool-use; too large for local |
| **Command R+ 104B** | 104B dense | ~60 GB | 128K | N/A | CC-BY-NC | Excellent tool use but non-commercial license |

### Tier 3: Lightweight / Edge (Resource-Constrained)

| Model | Params | Q4_K_M Size | Context | License | Known Issues |
|-------|--------|-------------|---------|---------|--------------|
| **Llama 3.1 8B** | 8B dense | ~4.9 GB | 128K | Llama 3.1 Community | Good for basic tool calls; struggles with complex multi-tool |
| **Qwen 2.5 7B** | 7B dense | ~4.4 GB | 128K | Apache 2.0 | Decent tool calling; Together AI uses for FC examples |
| **Mistral 7B** | 7B dense | ~4.4 GB | 32K | Apache 2.0 | Basic tool support; resource-efficient |
| **Gemma 2 9B** | 9B dense | ~5.5 GB | 8K | Gemma License | Requires community tool template on Ollama; short context |
| **Phi-3.5 Medium 14B** | 14B dense | ~8 GB | 128K | MIT | Limited BFCL data; Microsoft model |

### Newer Models (Emerging, Q1-Q2 2026)

| Model | Params | Q4_K_M Size | Context | BFCL Score | License | Notes |
|-------|--------|-------------|---------|------------|---------|-------|
| **Qwen3.5 122B-A10B** | 122B MoE / 10B active | ~70 GB | 262K+ | 72.2 (BFCL v4) | Apache 2.0 | Highest open-source BFCL v4 score; outperforms GPT-5 mini (55.5) by 30% |
| **Qwen3.5 35B-A3B** | 35B MoE / 3B active | ~20 GB | 262K (1M extensible) | N/A | Apache 2.0 | Very efficient; long context |
| **DeepSeek V3.1** | 671B MoE | Very large | 128K+ | N/A | DeepSeek License | Improved tool use post-training |
| **Llama 4 Scout 17B** | 17B MoE | ~10 GB | 10M (claimed) | N/A | Llama 4 Community | New; limited tool calling data |

---

## 5. Provider Availability Matrix

| Model | Ollama | Groq | Together AI | OpenRouter |
|-------|--------|------|-------------|------------|
| Llama 3.1 8B | Yes | Yes (`llama-3.1-8b-instant`) | Yes | Yes |
| Llama 3.1 70B | Yes | Yes (deprecated, use 3.3) | Yes | Yes |
| **Llama 3.3 70B** | Yes | **Yes** (`llama-3.3-70b-versatile`) | Yes | Yes |
| Llama 4 Scout 17B | Yes | Yes | Yes | Yes |
| **Qwen3 32B** | Yes | **Yes** (`qwen-3-32b`) | Yes | Yes |
| Qwen 2.5 7B | Yes | No (deprecated) | Yes (Turbo) | Yes |
| Qwen 2.5 32B | Yes | Yes | Yes | Yes |
| Qwen 2.5 72B | Yes | No | Yes | Yes |
| **Qwen3-Coder 30B-A3B** | **Yes** | No | TBD | Yes |
| Qwen3.5 35B-A3B | Yes | TBD | TBD | Yes |
| Mistral Nemo 12B | Yes | No (deprecated) | Yes | Yes |
| Mistral Small 22B | Yes | No (deprecated) | Yes | Yes |
| Mixtral 8x7B | Yes | No (deprecated) | Yes | Yes |
| Mixtral 8x22B | Yes | No | Yes | Yes |
| DeepSeek V3.x | Yes (huge) | No | Yes | Yes |
| DeepSeek R1 Distill 70B | Yes | Yes | Yes | Yes |
| Command R 35B | Yes | No | No | Yes |
| Command R+ 104B | Yes | No | No | Yes |
| Gemma 2 9B | Yes (community template) | No (deprecated) | Yes | Yes |
| Gemma 2 27B | Yes (community template) | No | Yes | Yes |
| Phi-3.5 Medium 14B | Yes | No | Yes | Yes |

**Legend:** Bold = recommended configurations in our app

---

## 6. Recommendations

### For Our App Architecture

Our app uses `createOpenAI({ baseURL })` for both Groq and Ollama, which sends the **OpenAI function calling format**. This constrains us to models that handle this format well.

### Primary Recommendations

#### Groq (Built-in for Subscribers) -- Current: `llama-3.1-70b-versatile`

**Recommended change:** `llama-3.3-70b-versatile` or `qwen-3-32b`

- Llama 3.3 70B is the natural successor (same family, newer, 128K context)
- Qwen3 32B is the alternative with Apache 2.0 license and strong BFCL scores
- Both have proven tool calling on Groq

#### Ollama (Local) -- Current: `qwen3-coder:30b`

**Keep current choice.** Qwen3-Coder 30B-A3B is excellent because:
- MoE architecture: only 3.3B params active = fast inference on consumer GPU
- 262K native context window
- Designed for agentic/tool calling workloads
- Apache 2.0 license
- ~18 GB Q4 fits in 24GB VRAM

**Fallback for low-VRAM:** `qwen2.5:14b` or `llama3.1:8b`

#### OpenRouter / BYOK

No changes needed -- users choose their own model through the provider.

### Model Selection Decision Tree

```
Need tool calling?
  |
  +-- Hosted API (Groq/Together)?
  |     +-- Budget-friendly → Qwen3 32B (Groq) or Qwen 2.5 7B Turbo (Together)
  |     +-- Best quality → Llama 3.3 70B (Groq) or DeepSeek V3.2 (Together/OpenRouter)
  |
  +-- Local (Ollama)?
        +-- 24GB+ VRAM → Qwen3-Coder 30B-A3B (current default, recommended)
        +-- 16GB VRAM → Qwen 2.5 14B or Mistral Nemo 12B
        +-- 8GB VRAM → Llama 3.1 8B or Qwen 2.5 7B
        +-- 48GB+ VRAM → Llama 3.3 70B or Qwen3 32B
```

### Known Gotchas

1. **Mixtral 8x7B:** Ollama lists "TOOLS" as capability but users report errors; unreliable
2. **DeepSeek R1:** Official Ollama registry returns "does not support tools" errors despite official support; use community `MFDoom/deepseek-r1-tool-calling` variant
3. **Gemma 2:** No native tool template in Ollama; requires community-maintained templates (`cow/gemma2_tools`)
4. **DeepSeek V3:** Tool calling only works in non-thinking mode for V3.1; V3.2 integrates reasoning into tool calls
5. **Qwen models:** Use Hermes-style tool format internally; OpenAI-compat endpoint works but complex nested schemas may need testing
6. **Command R+:** CC-BY-NC license prohibits commercial use
7. **Context window vs tool calling:** Models with 128K context can hold more tool definitions but tool calling quality doesn't necessarily scale with context length

### BFCL Score Summary (Where Available)

| Model | BFCL Version | Score | Rank Context |
|-------|-------------|-------|--------------|
| Qwen3.5 122B-A10B | V4 | 72.2% | #1 open-source |
| Claude Opus 4.1 | V4 | 70.36% | #2 overall |
| Claude Sonnet 4 | V4 | 70.29% | #3 overall |
| Qwen3-235B | V3 | 70.8% | Top-tier |
| Qwen3-32B | V3 | 68.2% | Best open-source at 32B |
| DeepSeek V3 | Custom | 81.5% | (non-standard eval) |
| Llama 3.1 70B | V2 | 77.5% | Strong |
| Llama 3.3 70B | V2 | 77.3% | Comparable to 3.1 |
| Llama 3.1 405B | V2 | 81.1% | (too large for local) |

---

## Sources

- [OpenAI Function Calling Guide](https://developers.openai.com/api/docs/guides/function-calling)
- [Anthropic Tool Use Overview](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)
- [Anthropic Tool Use Implementation](https://platform.claude.com/docs/en/agents-and-tools/tool-use/implement-tool-use)
- [Vercel AI SDK Tools & Tool Calling](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling)
- [Vercel AI SDK Foundations: Tools](https://ai-sdk.dev/docs/foundations/tools)
- [Vercel AI SDK zodSchema](https://ai-sdk.dev/docs/reference/ai-sdk-core/zod-schema)
- [Vercel AI SDK Providers](https://ai-sdk.dev/docs/foundations/providers-and-models)
- [Berkeley Function Calling Leaderboard V4](https://gorilla.cs.berkeley.edu/leaderboard.html)
- [BFCL Leaderboard (llm-stats.com)](https://llm-stats.com/benchmarks/bfcl)
- [Ollama Tool Calling Docs](https://docs.ollama.com/capabilities/tool-calling)
- [Best Ollama Models for Function Calling (2025)](https://collabnix.com/best-ollama-models-for-function-calling-tools-complete-guide-2025/)
- [Groq Supported Models](https://console.groq.com/docs/models)
- [Groq Tool Use Overview](https://console.groq.com/docs/tool-use)
- [Together AI Function Calling Docs](https://docs.together.ai/docs/function-calling)
- [Together AI Models](https://www.together.ai/models)
- [Qwen3 GitHub](https://github.com/QwenLM/Qwen3)
- [Qwen3-32B GGUF (Hugging Face)](https://huggingface.co/Qwen/Qwen3-32B-GGUF)
- [Llama 3.3 70B GGUF (Hugging Face)](https://huggingface.co/bartowski/Llama-3.3-70B-Instruct-GGUF)
- [NousResearch Hermes Function Calling](https://github.com/NousResearch/Hermes-Function-Calling)
- [Groq Llama-3-Tool-Use Models](https://groq.com/blog/introducing-llama-3-groq-tool-use-models)
- [llama.cpp Function Calling Docs](https://github.com/ggml-org/llama.cpp/blob/master/docs/function-calling.md)
- [Qwen3-Coder 30B-A3B (Ollama)](https://ollama.com/library/qwen3-coder:30b)
- [Qwen3-Coder Local Setup (Unsloth)](https://unsloth.ai/docs/models/qwen3-coder-how-to-run-locally)
- [Function Calling and Agentic AI 2025 Benchmarks](https://www.klavis.ai/blog/function-calling-and-agentic-ai-in-2025-what-the-latest-benchmarks-tell-us-about-model-performance)
- [Qwen3.5 Guide & Benchmarks](https://techie007.substack.com/p/qwen-35-the-complete-guide-benchmarks)
- [DeepSeek V3 Function Calling Evaluation](https://github.com/deepseek-ai/DeepSeek-V3/issues/1108)
