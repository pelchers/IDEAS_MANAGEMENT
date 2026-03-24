# Architecture & Recommendations

## Deployment Architectures

### Architecture 1: Split Hosting (Recommended for Starting)

Separate providers for each component. Easiest to set up, scale independently.

```
                    Internet
                       │
              ┌────────┴────────┐
              ▼                 ▼
     ┌──────────────┐  ┌──────────────┐
     │   Vercel      │  │   Railway    │
     │   Frontend    │  │   Backend    │
     │   (SSR/CDN)   │  │   + Postgres │
     │   $0-20/mo    │  │   $15-50/mo  │
     └──────────────┘  └──────┬───────┘
                              │ HTTPS
                       ┌──────▼───────┐
                       │   RunPod /   │
                       │   Vast.ai    │
                       │   GPU Server │
                       │   Ollama     │
                       │  $150-320/mo │
                       └──────────────┘

     Total: $165-390/mo
```

**Pros:** Each component scales independently, familiar tools, easy debugging
**Cons:** Network latency between backend and GPU (50-200ms), three bills

### Architecture 2: All-in-One GPU Server (Recommended for Production)

Everything on one rented GPU machine. Simplest, cheapest, lowest latency.

```
                    Internet
                       │
              ┌────────▼────────────────┐
              │   GPU Server (RunPod)    │
              │                          │
              │  ┌────────┐ ┌─────────┐ │
              │  │Next.js │ │Postgres │ │
              │  │Backend │ │Database │ │
              │  └───┬────┘ └─────────┘ │
              │      │ localhost:11434   │
              │  ┌───▼────────────────┐ │
              │  │   Ollama           │ │
              │  │   qwen2.5:14b      │ │
              │  │   (GPU accelerated)│ │
              │  └────────────────────┘ │
              │                          │
              │   $200-400/mo total      │
              └──────────────────────────┘
```

**Pros:** Zero network latency for AI calls, single bill, simpler ops
**Cons:** Single point of failure, harder to scale frontend independently

### Architecture 3: Hybrid (API + Self-Hosted Fallback)

Use a hosted API (Groq/Together) as primary, with self-hosted Ollama as fallback.

```
                    Internet
                       │
              ┌────────▼────────┐
              │   Railway        │
              │   Backend        │
              │   + Postgres     │
              └────────┬────────┘
                       │
              ┌────────┴────────┐
              ▼                 ▼
     ┌──────────────┐  ┌──────────────┐
     │   Groq API   │  │   RunPod     │
     │   (Primary)  │  │   (Fallback) │
     │   $0.18/1M   │  │   $317/mo    │
     │   tokens     │  │   Ollama     │
     └──────────────┘  └──────────────┘

     Low usage: ~$20-50/mo (API only)
     High usage: ~$320-370/mo (API + fallback)
```

**Pros:** Cheapest at low volume, fallback ensures availability
**Cons:** Two AI providers to manage, inconsistent model behavior

### Architecture 4: Serverless GPU (Best for Bursty Usage)

Pay only when AI is actively processing. Zero cost when idle.

```
                    Internet
                       │
              ┌────────▼────────┐
              │   Railway        │
              │   Backend        │
              └────────┬────────┘
                       │
              ┌────────▼────────┐
              │   RunPod         │
              │   Serverless     │
              │                  │
              │  Active: $0.94/hr│
              │  Idle: $0/hr     │
              │  Cold: ~15 sec   │
              └──────────────────┘

     Light: ~$10-30/mo
     Heavy: ~$200-400/mo
```

**Pros:** Lowest cost at low/medium volume, scales automatically
**Cons:** Cold starts (15-30s first request), requires Docker setup

## Cost Comparison Matrix

| Monthly Users | Messages/Day | Tokens/Month | Groq API | Together API | Vast.ai 24/7 | RunPod 24/7 | RunPod Serverless |
|--------------|-------------|-------------|---------|------------|------------|-----------|-----------------|
| 50 | 500 | 7.5M | **$1** | **$2** | $150 | $317 | ~$5 |
| 200 | 4,000 | 60M | **$11** | **$12** | $150 | $317 | ~$30 |
| 500 | 25,000 | 375M | $68 | $75 | **$150** | $317 | ~$150 |
| 1,000 | 100,000 | 2.4B | $432 | $480 | **$150** | **$317** | ~$400 |
| 5,000 | 500,000 | 12B | $2,160 | $2,400 | **$150** | **$317** | ~$800 |

**Key insight:** Self-hosting becomes cheaper than APIs at ~500+ active users. Below that, APIs are more economical.

## Recommendations

### For Right Now (Development + Early Users)

**Use Groq API as default provider** (cheapest, fastest, free tier) plus Ollama locally for development.

- Cost: ~$0-10/month
- Setup: Add Groq as a provider in `getUserModel`, users get AI immediately
- No GPU server needed

### For Launch (50-200 Users)

**Groq or Together AI** as primary, Railway for backend.

| Component | Provider | Cost |
|-----------|----------|------|
| Frontend | Vercel Free | $0 |
| Backend + DB | Railway | $20 |
| AI | Groq API | $5-15 |
| **Total** | | **$25-35/mo** |

### For Growth (200-1000 Users)

**RunPod Community Cloud** all-in-one, or split with API.

| Component | Provider | Cost |
|-----------|----------|------|
| All-in-one | RunPod RTX 4090 | $317 |
| **Total** | | **$317/mo** |

Or keep using APIs:

| Component | Provider | Cost |
|-----------|----------|------|
| Frontend | Vercel | $20 |
| Backend + DB | Railway | $50 |
| AI | Groq | $30-70 |
| **Total** | | **$100-140/mo** |

### For Scale (1000+ Users)

**Dedicated GPU server** (RunPod Secure or Lambda) + Railway backend.

| Component | Provider | Cost |
|-----------|----------|------|
| Frontend | Vercel Pro | $20 |
| Backend + DB | Railway | $50-100 |
| AI | RunPod Secure A100 | $1,181 |
| **Total** | | **$1,250-1,300/mo** |

At this scale, the unlimited token throughput of self-hosting saves significant money vs API pricing.

## Decision Flowchart

```
Start
  │
  ├─ Less than 200 users?
  │   └─ YES → Use Groq/Together API ($5-30/mo)
  │
  ├─ 200-1000 users?
  │   ├─ Budget-conscious? → Vast.ai Community ($150-200/mo)
  │   └─ Need reliability? → RunPod Community ($317/mo)
  │
  ├─ 1000+ users?
  │   ├─ Need SLA/compliance? → GCP/AWS ($500-2,000/mo)
  │   └─ Cost-optimized? → RunPod Secure ($400-1,200/mo)
  │
  └─ Unpredictable usage?
      └─ RunPod Serverless (pay per second, $0 idle)
```
