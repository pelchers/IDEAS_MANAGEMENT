# VPS & App Hosting Providers (No GPU)

These providers host your frontend, backend, and database — but **cannot run AI models at production speed** because they lack GPUs.

## App Hosting Platforms (PaaS)

Best for hosting Next.js frontend + API routes + PostgreSQL.

| Provider | Type | Cheapest Plan | Production Plan | GPU? | Docker? |
|----------|------|--------------|----------------|------|---------|
| **Vercel** | Frontend PaaS | Free | Pro $20/mo | ❌ | ❌ |
| **Railway** | Full-stack PaaS | $5/mo (usage) | ~$20-50/mo | ❌ | ✅ |
| **Render** | Full-stack PaaS | Free (limited) | $85/mo (4 vCPU) | ❌ | ✅ |
| **Fly.io** | Container PaaS | $5/mo free credit | ~$30-60/mo | ✅ (expensive) | ✅ |
| **Coolify** | Self-hosted PaaS | Free (self-host) | $0 + VPS cost | ❌ | ✅ |

### Railway

Railway is the simplest option for deploying a full-stack Next.js app with PostgreSQL.

| Feature | Detail |
|---------|--------|
| Compute | Usage-based: ~$0.000463/vCPU/min |
| Memory | ~$0.000231/GB/min |
| Database | PostgreSQL included, $5/mo minimum |
| Bandwidth | ~$0.10/GB egress after free allowance |
| Max resources | 32 vCPU, 32GB RAM per service |
| **GPU** | **Not available** |
| Typical monthly cost | $15-50 for a moderate Next.js + Postgres app |

### Render

| Feature | Detail |
|---------|--------|
| Starter | $7/mo (1 vCPU, 512MB) |
| Standard | $25/mo (1 vCPU, 2GB) |
| Pro | $85/mo (4 vCPU, 8GB) |
| Database | PostgreSQL from $7/mo |
| Bandwidth | 100GB/mo included |
| **GPU** | **Not available** |

### Fly.io (Has GPU Option)

Fly.io is unique among PaaS providers — it offers GPU machines alongside regular CPU containers.

| Resource | CPU VMs | GPU VMs |
|----------|---------|---------|
| Smallest | shared-cpu-1x: $1.94/mo | — |
| Mid | dedicated-cpu-4x: $124/mo | — |
| A100 40GB | — | $2.50/hr ($1,800/mo) |
| A100 80GB | — | $3.50/hr ($2,520/mo) |
| L40S | — | $2.00/hr ($1,440/mo) |

Fly.io GPU is expensive compared to RunPod/Vast.ai but convenient if you want everything on one platform.

## Traditional VPS Providers

Full root access Linux servers. Great for self-hosting everything on one box (except AI inference needs GPU).

| Provider | Plan | vCPU | RAM | Storage | Bandwidth | Monthly |
|----------|------|------|-----|---------|-----------|---------|
| **Hetzner** | AX41 | 6c/12t Ryzen 5 | 64 GB | 2x 512GB NVMe | 20 TB | **€39 ($42)** |
| **Hetzner** | AX101 | 16c/32t Ryzen 9 | 128 GB | 2x 1TB NVMe | 20 TB | **€69 ($75)** |
| **Hetzner** | Cloud CX32 | 4 vCPU | 16 GB | 160 GB SSD | 20 TB | **€15 ($16)** |
| **Contabo** | VPS S | 4 vCPU | 8 GB | 200 GB SSD | 32 TB | **$6.99** |
| **Contabo** | VPS L | 8 vCPU | 30 GB | 400 GB SSD | 32 TB | **$16.99** |
| **Contabo** | VPS XL | 12 vCPU | 60 GB | 800 GB SSD | 32 TB | **$32.99** |
| **DigitalOcean** | Droplet | 4 vCPU | 8 GB | 160 GB SSD | 4 TB | **$48** |
| **DigitalOcean** | Premium | 8 vCPU | 32 GB | 400 GB SSD | 8 TB | **$168** |

### Best Value: Hetzner

Hetzner's dedicated servers are the best value for self-hosting. A Hetzner AX41 (€39/mo) can comfortably run Next.js + PostgreSQL + Nginx. The only thing it can't do is GPU inference.

**Best combo:** Hetzner AX41 ($42/mo) for app + DB, plus Vast.ai RTX 4090 ($200/mo) for AI = **$242/mo total** for a full production setup.

### Can You Run AI on CPU VPS?

Technically yes, but it's extremely slow:

| Model | GPU (RTX 4090) | CPU (8 vCPU) | CPU (Hetzner AX101) |
|-------|---------------|-------------|-------------------|
| 3B | 60-80 tok/s | 5-8 tok/s | 8-12 tok/s |
| 7B | 40-50 tok/s | 2-4 tok/s | 4-6 tok/s |
| 14B | 25-35 tok/s | 0.5-2 tok/s | 2-3 tok/s |

A 200-token response at 1 tok/s = **3+ minutes**. Not viable for production.

## Which Provider for What?

| Component | Recommended | Monthly Cost |
|-----------|------------|-------------|
| Frontend (SSR/static) | Vercel Free or Railway | $0-20 |
| Backend API | Railway or Hetzner | $5-42 |
| PostgreSQL | Railway managed or self-hosted | $5-15 |
| AI Inference (14B) | RunPod or Vast.ai GPU | $150-400 |
| **Total (split hosting)** | | **$160-477** |
| **Total (all-in-one GPU)** | Vast.ai with everything | **$150-300** |
