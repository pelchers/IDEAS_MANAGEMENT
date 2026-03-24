# GPU Cloud Providers Comparison

All prices are for running a single GPU server 24/7 suitable for hosting Ollama with a 14B model. Prices as of early-mid 2025.

## Quick Comparison

| Provider | Best GPU for 14B | VRAM | Hourly | Monthly (24/7) | Docker/Ollama | Reliability |
|----------|-----------------|------|--------|----------------|---------------|-------------|
| **Vast.ai Community** | RTX 3090 | 24 GB | $0.15-0.30 | **$108-216** | ✅ | ⚠️ Low (community) |
| **Vast.ai Community** | RTX 4090 | 24 GB | $0.20-0.40 | **$144-288** | ✅ | ⚠️ Low |
| **RunPod Community** | RTX 4090 | 24 GB | $0.44 | **$317** | ✅ | ✅ Good |
| **RunPod Community** | A6000 | 48 GB | $0.54 | **$389** | ✅ | ✅ Good |
| **Lambda Labs** | A10 | 24 GB | $0.60 | **$432** | ✅ | ✅ Good |
| **GCP Spot** | L4 | 24 GB | $0.21 | **$151** | ✅ | ❌ Can be reclaimed |
| **GCP On-demand** | L4 | 24 GB | $0.70 | **$504** | ✅ | ✅ High |
| **AWS On-demand** | g5.xlarge (A10G) | 24 GB | $1.01 | **$724** | ✅ | ✅ High |
| **AWS Spot** | g5.xlarge (A10G) | 24 GB | ~$0.30 | **~$216** | ✅ | ❌ Can be reclaimed |
| **Fly.io** | A100 40GB | 40 GB | $2.50 | **$1,800** | ✅ | ✅ High |
| **CoreWeave** | A40 | 48 GB | $1.28 | **$922** | ✅ | ✅ Enterprise |
| **Paperspace** | A6000 | 48 GB | $1.89 | **$1,361** | ✅ | ✅ Good |
| **Azure** | NC4as T4 v3 | 16 GB | $0.53 | **$379** | ✅ | ✅ High |

## Detailed Provider Breakdowns

### Vast.ai — Cheapest (Community Marketplace)

Vast.ai is a marketplace where individuals rent out their GPUs. Cheapest option but least reliable.

| GPU | VRAM | $/hr Range | $/mo Range | Best For |
|-----|------|-----------|-----------|----------|
| RTX 3090 | 24 GB | $0.15-0.30 | $108-216 | Budget production |
| RTX 4090 | 24 GB | $0.20-0.40 | $144-288 | Good performance |
| A100 80GB | 80 GB | $0.70-1.20 | $504-864 | Large models |

**Pros:** Cheapest GPU hosting, full Docker support, Ollama works
**Cons:** Community hosts can reclaim machines, no SLA, variable quality
**Best for:** Development, testing, low-budget production

### RunPod — Best Balance (Reliability + Price)

RunPod offers both community and secure cloud options with good reliability.

| Tier | GPU | VRAM | $/hr | $/mo |
|------|-----|------|------|------|
| Community | RTX 4090 | 24 GB | $0.44 | $317 |
| Community | A6000 | 48 GB | $0.54 | $389 |
| Secure | A100 80GB | 80 GB | $1.64 | $1,181 |
| **Serverless** | A100 80GB | 80 GB | **$0.00026/sec** | **Pay per use** |

**Serverless option:** Zero idle cost. You pay only when the model is processing a request. Cold start ~10-30 seconds. Best for apps with intermittent AI usage.

**Pros:** Good reliability, Docker support, serverless option, reasonable pricing
**Cons:** Community tier can have availability issues
**Best for:** Production apps with moderate budget

### Lambda Labs — Developer Friendly

| GPU | VRAM | $/hr | $/mo | Reserved 1yr |
|-----|------|------|------|-------------|
| A10 | 24 GB | $0.60 | $432 | ~$300 |
| A100 80GB | 80 GB | $1.10 | $792 | ~$550 |
| H100 80GB | 80 GB | $2.49 | $1,793 | ~$1,250 |

**Pros:** Clean UX, full root access, good documentation, bare-metal options
**Cons:** Limited availability (waitlists), no serverless, higher than Vast/RunPod
**Best for:** Teams that want simple, reliable GPU access

### GCP / AWS / Azure — Enterprise Grade

Best for companies needing SLAs, compliance certifications, and ecosystem integration.

| Provider | GPU | VRAM | On-demand $/mo | Spot $/mo | Reserved 1yr $/mo |
|----------|-----|------|---------------|----------|------------------|
| GCP | L4 | 24 GB | $504 | ~$151 | ~$317 |
| GCP | A100 40GB | 40 GB | $2,110 | ~$633 | ~$1,329 |
| AWS | g5.xlarge (A10G) | 24 GB | $724 | ~$216 | ~$470 |
| AWS | p4d (A100) | 40 GB | $23,597 | ~$7,079 | ~$15,338 |
| Azure | T4 | 16 GB | $379 | ~$114 | ~$246 |

**Pros:** SLAs, compliance (HIPAA, SOC2), global regions, ecosystem
**Cons:** 2-5x more expensive than GPU-specific providers, complex billing
**Best for:** Enterprise, compliance-heavy, existing cloud customers

## Cost Per Token: Self-Hosted vs API

When you host the model yourself, there is **no per-token cost**. You pay for the server only.

| Approach | Infrastructure Cost | Per-Token Cost | 5M tokens/day cost |
|----------|-------------------|----------------|-------------------|
| Vast.ai RTX 4090 | $200/mo | **$0** | $0 |
| RunPod RTX 4090 | $317/mo | **$0** | $0 |
| Lambda A10 | $432/mo | **$0** | $0 |
| Together AI (API) | $0 | $0.20/1M | $1.00/day ($30/mo) |
| Groq (API) | $0 | $0.18/1M | $0.90/day ($27/mo) |
| OpenAI GPT-4o | $0 | $2.50/1M | $12.50/day ($375/mo) |

**Breakeven point:** If your users consume more than ~1.5M tokens/day, self-hosting on Vast.ai is cheaper than API providers. For lower usage, pay-per-token APIs are more economical.
