# Server Types Explained

## The Two Ways to Run AI

There are exactly two ways to make AI work in your app. You pick one.

### Option 1: Call Someone Else's AI (API Provider)

You send text to a company that owns GPUs (like Groq, OpenAI, Anthropic). They run the AI model on their hardware and send back the response. You pay per use.

```mermaid
sequenceDiagram
    participant User as User's Browser
    participant App as Your App (Railway)
    participant API as Groq / OpenAI (Their GPUs)

    User->>App: "Add an idea about login"
    App->>API: POST /chat { messages, tools }
    Note over API: Runs Llama 70B on<br/>their GPU farm
    API-->>App: Tool call: update_ideas_artifact
    App-->>User: "Done! Idea added."

    Note over App: Your server has NO GPU.<br/>Railway = CPU only.<br/>That's fine — the GPU is at Groq.
```

**You don't need a GPU.** Railway ($20/mo) hosts your app. Groq ($0.18/1M tokens) runs the AI. Two separate bills but total cost is low.

**This is like:** Using Stripe for payments. You don't run a payment processor — you call their API. Same concept for AI.

### Option 2: Run Your Own AI (Self-Hosted GPU)

You rent a server that has a GPU, install Ollama + the AI model on it, and your app calls it directly. No external API.

```mermaid
sequenceDiagram
    participant User as User's Browser
    participant Server as GPU Server (RunPod/Vast.ai)

    User->>Server: "Add an idea about login"
    Note over Server: Next.js App +<br/>PostgreSQL +<br/>Ollama + Model<br/>ALL on one machine
    Server->>Server: Ollama processes on GPU<br/>(localhost:11434)
    Server-->>User: "Done! Idea added."

    Note over Server: YOU rent the GPU.<br/>$200-400/mo flat rate.<br/>$0 per token.
```

**You DO need a GPU.** You can't use Railway for this — Railway has no GPUs. You rent a GPU server from RunPod ($317/mo) or Vast.ai ($150-288/mo) and run everything on it.

**This is like:** Buying your own payment processing hardware instead of using Stripe. More control, but you manage it.

## Why Can't Railway Run the AI Model?

```mermaid
graph LR
    subgraph Railway["Railway Server (CPU only)"]
        CPU["Intel/AMD CPU<br/>No GPU"]
    end

    subgraph GPU_Server["GPU Server (RunPod etc.)"]
        GPU["NVIDIA A100/4090<br/>24-80GB VRAM"]
    end

    CPU -->|"14B model: 1-3 tok/s<br/>60-200 sec per response<br/>❌ NOT VIABLE"| SLOW["Too Slow"]
    GPU -->|"14B model: 25-35 tok/s<br/>2-5 sec per response<br/>✅ Production ready"| FAST["Fast"]

    style SLOW fill:#ffebee,stroke:#c62828
    style FAST fill:#e8f5e9,stroke:#2e7d32
```

AI models need GPUs for the parallel math that neural networks require. Railway/Render/Vercel are CPU-only hosting platforms. Running a 14B model on CPU takes minutes per response — unusable for a real app.

## The Three Environments

```mermaid
graph TB
    subgraph DEV["🖥️ Development (Your PC)"]
        DEV_APP["Next.js App<br/>(npm run dev)"]
        DEV_DB[("PostgreSQL<br/>(local)")]
        DEV_AI["Ollama<br/>qwen2.5:14b<br/>Your RTX 4090"]
        DEV_APP --> DEV_DB
        DEV_APP -->|"localhost:11434<br/>FREE"| DEV_AI
    end

    subgraph PROD_API["☁️ Production — API Approach (RECOMMENDED)"]
        PROD_APP["Next.js App<br/>(Railway)"]
        PROD_DB[("PostgreSQL<br/>(Railway)")]
        PROD_GROQ["Groq API<br/>Llama 70B<br/>Their GPUs"]
        PROD_APP --> PROD_DB
        PROD_APP -->|"HTTPS<br/>$0.18/1M tokens"| PROD_GROQ
    end

    subgraph PROD_GPU["🖥️ Production — Self-Hosted GPU"]
        GPU_APP["Next.js App"]
        GPU_DB[("PostgreSQL")]
        GPU_AI["Ollama<br/>qwen2.5:14b<br/>Rented GPU"]
        GPU_APP --> GPU_DB
        GPU_APP -->|"localhost:11434<br/>$0/token"| GPU_AI
    end

    style DEV fill:#f5f5f5,stroke:#9e9e9e,stroke-dasharray: 5 5
    style PROD_API fill:#e8f5e9,stroke:#2e7d32,stroke-width:3px
    style PROD_GPU fill:#e3f2fd,stroke:#1565c0
```

**Development:** Ollama runs on your RTX 4090. Free. Fast. Works great for testing.

**Production (recommended):** App on Railway, AI via Groq API. No GPU server needed. Pay per token.

**Production (alternative):** Everything on one GPU server. Pay flat monthly rate. Only makes sense when token costs exceed server rent (~1000+ daily active users).

## What is a GPU Server?

A GPU server is a computer with specialized graphics cards (GPUs) designed for AI computation. You rent one from a cloud provider:

| GPU | VRAM | Best For | Speed (14B model) | Rental Cost |
|-----|------|----------|-------------------|-------------|
| RTX 3090 | 24 GB | Budget AI | ~25 tok/s | $108-216/mo |
| RTX 4090 | 24 GB | Best consumer | ~35 tok/s | $144-317/mo |
| A10 / A10G | 24 GB | Cloud standard | ~25 tok/s | $432-724/mo |
| A100 | 40-80 GB | Enterprise | ~50 tok/s | $792-2,642/mo |

**For our 14B model**, any GPU with 24GB+ VRAM works. The cheapest option is an RTX 3090 on Vast.ai (~$150/mo).

## What is an API Provider?

An API provider runs AI models on their own GPU farms and lets you call them via HTTP. You never touch a GPU.

| Provider | How It Works | Cost | Model Quality |
|----------|-------------|------|---------------|
| **Groq** | Send HTTP request → get AI response | $0.18/1M tokens | Excellent (70B+) |
| Together AI | Same | $0.20/1M tokens | Good |
| OpenAI | Same | $2.50/1M tokens | Excellent |
| Anthropic | Same | $3.00/1M tokens | Excellent |

**Groq is recommended** because it's the cheapest API provider with 99.9% uptime and the fastest inference (300+ tokens/second).

## Summary: What We're Using

```
DEVELOPMENT                          PRODUCTION
┌─────────────────────┐              ┌─────────────────────┐
│ Your PC              │              │ Railway              │
│ ├─ Next.js (dev)     │              │ ├─ Next.js App       │
│ ├─ PostgreSQL        │              │ ├─ PostgreSQL        │
│ └─ Ollama (RTX 4090) │              │ └─ Calls Groq API ──┼──▶ Groq (their GPUs)
│    FREE               │              │    $15-50/mo         │     $0.18/1M tokens
└─────────────────────┘              └─────────────────────┘
```
