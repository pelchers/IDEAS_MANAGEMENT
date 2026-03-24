# Hosted AI API Providers (Pay-Per-Token)

These providers host and run the AI model for you. No GPU management needed. You pay per token consumed.

## Quick Comparison

| Provider | 14B Model Price (per 1M tokens) | Speed | Free Tier | Custom Models | Best For |
|----------|-------------------------------|-------|-----------|---------------|----------|
| **Groq** | $0.18 in / $0.18 out | ⚡ Fastest (300+ tok/s) | ✅ 30 req/min | ❌ | Speed-critical apps |
| **Together AI** | $0.20 in / $0.20 out | Fast | ✅ $5 credit | ✅ Fine-tuned | Model variety |
| **Fireworks AI** | $0.20 in / $0.20 out | Very fast | ✅ $1 credit | ✅ | Fast + flexible |
| **Replicate** | ~$0.01-0.05/call | Medium | ✅ Limited | ✅ Docker-based | Custom deployments |
| **RunPod Serverless** | Pay per second | Fast | ❌ | ✅ Full Docker | Zero idle cost |

## Detailed Breakdown

### Groq — Fastest Inference

Groq uses custom LPU (Language Processing Unit) hardware for ultra-fast inference.

| Model Class | Input (per 1M) | Output (per 1M) | Speed |
|-------------|---------------|-----------------|-------|
| 7-14B | $0.18 | $0.18 | 300+ tok/s |
| 70B | $0.59 | $0.79 | 100+ tok/s |

**Pros:** Fastest provider by far, generous free tier (30 req/min), simple API
**Cons:** Limited model selection (only their hosted models), can't deploy custom models
**Integration:** OpenAI-compatible API — works with Vercel AI SDK via `createOpenAI({ baseURL })`

### Together AI — Best Model Selection

| Model Class | Input (per 1M) | Output (per 1M) |
|-------------|---------------|-----------------|
| 7-14B (Qwen, Llama) | $0.18-0.30 | $0.18-0.30 |
| 70B+ | $0.88-1.20 | $0.88-1.20 |

**Pros:** Huge model catalog (Qwen, Llama, Mistral, etc.), fine-tuning support, dedicated endpoints
**Cons:** Slightly slower than Groq
**Integration:** OpenAI-compatible API

### Fireworks AI — Fast + Flexible

| Model Class | Input (per 1M) | Output (per 1M) |
|-------------|---------------|-----------------|
| 7-14B | $0.20 | $0.20 |
| 70B+ | $0.90 | $0.90 |

**Pros:** Very fast (speculative decoding), custom model deployment, good documentation
**Cons:** Smaller free tier
**Integration:** OpenAI-compatible API

### RunPod Serverless — Zero Idle Cost

RunPod Serverless lets you deploy a custom Docker container (including Ollama) that scales to zero when not in use.

| Resource | Cost |
|----------|------|
| A100 80GB | $0.00026/sec (~$0.94/hr active) |
| A40 48GB | $0.00016/sec (~$0.58/hr active) |
| Cold start | ~10-30 seconds |
| Idle | **$0** |

**Pros:** Full control (your own Ollama + model), zero cost when idle, scales up automatically
**Cons:** Cold starts (10-30s for first request), requires Docker setup
**Best for:** Apps with unpredictable or bursty AI usage

## Cost Analysis: Monthly Usage Scenarios

### Scenario 1: Light Usage (50 users, 10 msgs/day each)
- ~500 messages/day × ~500 tokens avg = 250K tokens/day = 7.5M tokens/month

| Provider | Monthly Cost |
|----------|-------------|
| Groq | **$1.35** (mostly free tier) |
| Together AI | **$1.50** |
| Self-hosted Vast.ai | **$150-200** (overkill) |

**Winner:** Groq or Together AI (API is far cheaper at low volume)

### Scenario 2: Moderate Usage (200 users, 20 msgs/day each)
- ~4,000 messages/day × ~500 tokens = 2M tokens/day = 60M tokens/month

| Provider | Monthly Cost |
|----------|-------------|
| Groq | **$10.80** |
| Together AI | **$12.00** |
| Self-hosted Vast.ai | **$150-200** |

**Winner:** Still API providers (self-hosting breakeven is ~100M tokens/month)

### Scenario 3: Heavy Usage (500 users, 50 msgs/day each)
- ~25,000 messages/day × ~500 tokens = 12.5M tokens/day = 375M tokens/month

| Provider | Monthly Cost |
|----------|-------------|
| Groq | **$67.50** |
| Together AI | **$75.00** |
| Self-hosted Vast.ai | **$150-200** |

**Winner:** API is still cheaper, but self-hosting is competitive and gives you full control

### Scenario 4: Very Heavy (1000+ users, frequent tool use)
- ~100,000 messages/day × ~800 tokens (tools are longer) = 80M tokens/day = 2.4B tokens/month

| Provider | Monthly Cost |
|----------|-------------|
| Groq | **$432** |
| Together AI | **$480** |
| Self-hosted RunPod | **$317** (unlimited) |

**Winner:** Self-hosting. At this scale, the flat server cost beats per-token pricing.

## Integration with IDEA-MANAGEMENT

All API providers use OpenAI-compatible APIs. Adding a new provider to our app requires:

1. Add provider to `AiProvider` enum in Prisma schema
2. Add case to `getUserModel` in `get-user-model.ts`
3. Use `createOpenAI({ baseURL: "https://api.provider.com/v1", apiKey })` from `@ai-sdk/openai`
4. Add key format detection in `/api/ai/config` route

The Vercel AI SDK abstracts the provider — same tool schemas, same streaming, same code.
