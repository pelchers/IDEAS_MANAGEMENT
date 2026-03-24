# Local Development PC — System Specs

## Hardware

| Component | Specification |
|-----------|---------------|
| **CPU** | Intel Core i9-14900KF |
| **Cores/Threads** | 24 cores / 32 threads (8P + 16E) |
| **GPU** | NVIDIA GeForce RTX 4090 |
| **VRAM** | 24 GB GDDR6X |
| **GPU Driver** | 560.94 |
| **RAM** | 64 GB DDR5 |
| **Storage** | Corsair MP600 CORE XT ~2 TB NVMe SSD |
| **Motherboard** | MSI PRO Z790-P WIFI (MS-7E06) |
| **OS** | Windows 11 Pro (Build 10.0.26200) |

## AI Inference Capacity

| Model Size | VRAM Usage (Q4) | Fits? | Speed Estimate |
|------------|----------------|-------|----------------|
| 3B (qwen2.5:3b) | ~2 GB | ✅ | ~60-80 tok/s |
| 7B (qwen2.5:7b) | ~4.5 GB | ✅ | ~40-50 tok/s |
| 14B (qwen2.5:14b) | ~8.5 GB | ✅ | ~25-35 tok/s |
| 32B (qwen2.5:32b) | ~18 GB | ✅ | ~12-18 tok/s |
| 70B (qwen2.5:72b) | ~40 GB | ❌ (24GB VRAM limit) | N/A |

## Current AI Setup

- **Runtime:** Ollama v0.18.1 (installed via winget)
- **Default model:** qwen2.5:3b (to be upgraded to qwen2.5:14b)
- **Models pulled:** qwen2.5:3b, qwen3:4b, qwen3-nothink (custom)
- **Endpoint:** localhost:11434 (OpenAI-compatible at localhost:11434/v1)
- **Integration:** Vercel AI SDK via createOpenAI({ baseURL: localhost:11434/v1 })

## Software Stack

| Tool | Version |
|------|---------|
| Node.js | v22.11.0 |
| pnpm | v10.26.2 |
| Next.js | 16.1.6 (Turbopack) |
| Prisma | 6.19.2 |
| PostgreSQL | (local via Docker or native) |
| Playwright | 1.58.2 |
| Ollama | 0.18.1 |
| Git | (latest) |
| Shell | Bash (via Git Bash on Windows) |

## Production Hosting Options

### Recommended: All-in-One GPU Server

Run Next.js + PostgreSQL + Ollama on a single rented GPU server.
Backend calls Ollama at localhost:11434 — zero latency, zero per-token cost.

| Provider | GPU | Cost | Notes |
|----------|-----|------|-------|
| Vast.ai | RTX 4090 | ~$0.20/hr (~$144/mo) | Cheapest, community GPUs |
| RunPod | A40 | ~$0.39/hr (~$280/mo) | Reliable, good uptime |
| Lambda | A100 | ~$0.50/hr (~$360/mo) | Enterprise-grade |

### Alternative: Split Hosting

| Component | Host | Cost |
|-----------|------|------|
| Frontend | Vercel | Free - $20/mo |
| Backend + DB | Railway | $5 - $50/mo |
| AI Model | RunPod Serverless | $0.0002/sec (pay per use) |

### Per-Token Cost Comparison

| Approach | Cost per 1M tokens |
|----------|-------------------|
| Self-hosted (own GPU) | **$0** |
| Rented GPU server | **$0** (pay for server, not tokens) |
| RunPod Serverless | ~$0.05 - $0.10 |
| Together AI (hosted API) | ~$0.10 - $0.20 |
| OpenAI GPT-4o | ~$2.50 - $10.00 |
| Anthropic Claude | ~$3.00 - $15.00 |
