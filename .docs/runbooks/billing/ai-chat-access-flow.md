# AI Chat Access Flow

## Overview

The AI chat feature has a tiered access model that balances free access for BYOK users, paid access for built-in AI, and full bypass for admins.

## Access Decision Tree

```mermaid
flowchart TD
    MSG["📨 User sends message<br/>to /api/ai/chat"] --> AUTH{"Authenticated?"}
    AUTH -->|"No (401)"| SIGNIN["↩️ Redirect to /signin"]
    AUTH -->|"Yes"| ADMIN{"Is user ADMIN?"}

    ADMIN -->|"Yes"| GRANTED_ADMIN["✅ Access Granted<br/><i>Admin bypass — all features free</i>"]
    ADMIN -->|"No"| BYOK{"Has own API key?<br/>(OPENAI/ANTHROPIC/<br/>GOOGLE/OPENROUTER)"}

    BYOK -->|"Yes"| GRANTED_BYOK["✅ Access Granted<br/><i>User pays their provider directly</i>"]
    BYOK -->|"No"| ENT{"Has ai_chat<br/>entitlement?"}

    ENT -->|"Subscription (PRO/TEAM)"| GRANTED_SUB["✅ Access Granted<br/><i>Paid subscription — uses Groq API</i>"]
    ENT -->|"Admin Grant"| GRANTED_GRANT["✅ Access Granted<br/><i>Admin-granted entitlement</i>"]
    ENT -->|"Trial"| GRANTED_TRIAL["✅ Access Granted<br/><i>Trial period active</i>"]
    ENT -->|"No entitlement"| DENIED["❌ 403 Denied<br/><i>Subscribe or add own API key</i>"]

    style GRANTED_ADMIN fill:#e8f5e9,stroke:#2e7d32
    style GRANTED_BYOK fill:#fff3e0,stroke:#ef6c00
    style GRANTED_SUB fill:#e8f5e9,stroke:#2e7d32
    style GRANTED_GRANT fill:#e8f5e9,stroke:#2e7d32
    style GRANTED_TRIAL fill:#e8f5e9,stroke:#2e7d32
    style DENIED fill:#ffebee,stroke:#c62828
    style SIGNIN fill:#ffebee,stroke:#c62828
```

## Who Pays for What

```mermaid
graph LR
    subgraph "We Pay (Our Groq Bill)"
        SUB["Subscribed Users<br/>PRO/TEAM plan"]
        ADM["Admin Users"]
        TRIAL["Trial Users"]
    end

    subgraph "User Pays (Their Provider)"
        BYOK_OAI["OpenAI BYOK"]
        BYOK_ANT["Anthropic BYOK"]
        BYOK_GOO["Google BYOK"]
        BYOK_OR["OpenRouter BYOK"]
    end

    subgraph "Nobody Pays"
        LOCAL["Ollama Local<br/>(dev only)"]
    end

    SUB --> GROQ["Groq API<br/>$0.18/1M tokens"]
    ADM --> GROQ
    TRIAL --> GROQ

    BYOK_OAI --> OAI_API["OpenAI API"]
    BYOK_ANT --> ANT_API["Anthropic API"]
    BYOK_GOO --> GOO_API["Google AI API"]
    BYOK_OR --> OR_API["OpenRouter API"]

    LOCAL --> OLLAMA["localhost:11434"]

    style GROQ fill:#e8f5e9,stroke:#2e7d32
    style OAI_API fill:#fff3e0,stroke:#ef6c00
    style ANT_API fill:#fff3e0,stroke:#ef6c00
    style GOO_API fill:#fff3e0,stroke:#ef6c00
    style OR_API fill:#fff3e0,stroke:#ef6c00
    style OLLAMA fill:#f5f5f5,stroke:#9e9e9e,stroke-dasharray: 5 5
```

## Provider Types and Billing

| Provider | Who Pays | Access Gate | Used In |
|----------|----------|-------------|---------|
| GROQ (built-in) | Us (our API bill) | Requires subscription or admin grant | Production |
| OPENROUTER_BYOK | User pays OpenRouter | No subscription needed | Production |
| OPENAI_BYOK | User pays OpenAI | No subscription needed | Production |
| ANTHROPIC_BYOK | User pays Anthropic | No subscription needed | Production |
| GOOGLE_BYOK | User pays Google | No subscription needed | Production |
| OLLAMA_LOCAL | Nobody (free, local) | Requires subscription or admin grant | Development |

### Why BYOK Users Bypass Billing
Users who bring their own API key are paying their AI provider directly. We don't incur any AI costs for these users, so there's no reason to charge them for AI access. The subscription only gates access to our built-in AI (Groq), where we pay the per-token cost.

### Why Built-In AI Requires Billing
When users use the built-in AI, every token costs us $0.18 per 1M tokens via Groq. The subscription covers this cost plus margin. Without billing, heavy users could generate significant API bills that we absorb.

## Subscription Plans and AI Access

```mermaid
graph TD
    subgraph FREE["FREE Plan — $0/mo"]
        F1["✅ All app features"]
        F2["✅ BYOK AI (user pays provider)"]
        F3["❌ Built-in AI"]
    end

    subgraph PRO["PRO Plan — $X/mo"]
        P1["✅ All app features"]
        P2["✅ BYOK AI"]
        P3["✅ Built-in AI (Groq)"]
        P4["✅ Schema planner"]
        P5["✅ Whiteboard"]
    end

    subgraph TEAM["TEAM Plan — $X/mo"]
        T1["✅ Everything in PRO"]
        T2["✅ Collaboration"]
        T3["✅ Shared workspaces"]
        T4["✅ Team management"]
    end

    style FREE fill:#f5f5f5,stroke:#9e9e9e
    style PRO fill:#e8f5e9,stroke:#2e7d32
    style TEAM fill:#e3f2fd,stroke:#1565c0
```

| Plan | AI Chat Access | AI Features |
|------|---------------|-------------|
| FREE | BYOK only | Chat + tools (user's own provider) |
| PRO | Built-in + BYOK | Chat + tools + Groq-powered AI |
| TEAM | Built-in + BYOK | Chat + tools + Groq-powered AI + collaboration |

## Admin Self-Grant Flow

```mermaid
sequenceDiagram
    actor Admin
    participant Settings as Settings Page
    participant API as /api/admin/grant-entitlement
    participant DB as PostgreSQL
    participant Audit as Audit Log

    Admin->>Settings: Sees "AI access active (admin)" badge
    Note over Admin,Settings: Admins bypass entitlement check<br/>automatically via role check

    Admin->>Settings: Optionally clicks "Enable AI"
    Settings->>API: POST { feature: "ai_chat" }
    API->>DB: UPSERT Entitlement<br/>source: ADMIN_GRANT
    API->>Audit: Log admin.grant_entitlement
    API->>Settings: { ok: true }
    Settings->>Admin: "AI access enabled!"
```

### API: POST /api/admin/grant-entitlement
- Requires admin role
- Body: `{ feature: "ai_chat", targetUserId?: "user_id" }`
- Defaults to granting to the requesting admin's own account
- Creates/upserts Entitlement record with source=ADMIN_GRANT
- Logged in audit trail

## Entitlement Sources

| Source | Description | Created By |
|--------|-------------|------------|
| SUBSCRIPTION | From active Stripe subscription | Stripe webhook handler |
| ADMIN_GRANT | From admin self-grant or admin granting to user | POST /api/admin/grant-entitlement |
| TRIAL | From trial period | Future: trial signup flow |

## Error Messages

| Status | Error | User Sees | Action |
|--------|-------|-----------|--------|
| 401 | unauthorized | Redirect to /signin | Session expired |
| 403 | ai_subscription_required | "Subscribe or add your own API key" | No entitlement |
| 503 | ai_not_configured | "Install Ollama or add API key" | No provider configured |

## Request Flow (Full Sequence)

```mermaid
sequenceDiagram
    actor User
    participant Chat as AI Chat Page
    participant API as /api/ai/chat
    participant Auth as Auth Check
    participant Gate as Access Gate
    participant Groq as Groq API
    participant DB as PostgreSQL

    User->>Chat: Types message, clicks Send
    Chat->>API: POST { messages, projectId, sessionId }
    API->>Auth: requireAuth(req)
    Auth-->>API: user (or 401)

    API->>Gate: Check: admin? BYOK? entitlement?
    Gate-->>API: Access granted (or 403)

    API->>DB: Read project artifacts for context
    API->>DB: Persist user message

    API->>Groq: streamText({ model, system, messages, tools })

    alt Tool Call
        Groq-->>API: tool-call: update_ideas_artifact
        API->>DB: Write to ProjectArtifact
        API-->>Chat: Stream: tool-output-available
        Chat->>Chat: Show tool card + dispatch artifact-updated
    end

    Groq-->>API: text-delta tokens
    API-->>Chat: Stream: text chunks
    API->>DB: Persist assistant response

    Chat->>User: Display response + tool results
```

## Files

| File | Purpose |
|------|---------|
| `apps/web/src/app/api/ai/chat/route.ts` | Chat endpoint with access check |
| `apps/web/src/server/billing/entitlements.ts` | Entitlement check logic |
| `apps/web/src/server/ai/get-user-model.ts` | Provider resolution (Groq, BYOK, Ollama) |
| `apps/web/src/app/api/admin/grant-entitlement/route.ts` | Admin self-grant endpoint |
| `apps/web/src/app/(authenticated)/settings/page.tsx` | AI config UI + admin badge |
| `apps/web/src/server/ai/tools/artifact-tools.ts` | 8 tools the AI can call |
