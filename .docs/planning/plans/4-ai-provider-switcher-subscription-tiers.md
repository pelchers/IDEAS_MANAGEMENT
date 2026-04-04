# Plan #4 — AI Provider Switcher + Subscription Tiers + Token Limits

**Date:** 2026-04-03
**Commit:** 0a9dcca
**Status:** Draft
**Author:** Claude + User

---

## Context

### What exists now
- AI chat works with 6 providers: Groq (built-in), Ollama (local), OpenAI/Anthropic/Google/OpenRouter (BYOK)
- Settings page has 3 separate sections: Ollama connect, OpenRouter OAuth, BYOK paste key
- Entitlement system gates AI_CHAT feature behind Pro/Team subscription
- No token/message tracking — no usage limits enforced
- No "Hosted AI" option visible in Settings — Groq exists in code but isn't user-selectable
- No auto-fallback when limits are reached
- No usage visibility for users

### What's the gap
- Users can't see or select "Hosted AI (Groq)" as a provider option
- Settings AI panel is confusing (3 disconnected sections)
- No message counting per billing period
- No tier-based limits
- No graceful fallback when hosted AI quota is exhausted
- No usage meter showing consumption vs limit
- Subscription pricing not tied to actual cost analysis

---

## Verified Pricing Research (April 2026)

> Sources: groq.com/pricing, railway.com/pricing, clerk.com/pricing, artificialanalysis.ai

### Groq API — gpt-oss-120b (our production model)

| Metric | Price | Source |
|--------|-------|--------|
| Input (uncached) | $0.15 / 1M tokens | groq.com/pricing |
| Input (cached) | $0.075 / 1M tokens | Groq prompt caching |
| Output | $0.60 / 1M tokens | groq.com/pricing |
| Speed | ~500 tok/s | console.groq.com/docs/models |
| Context window | 131,072 tokens | Groq docs |

#### Alternative Groq models (if we want a budget tier later)

| Model | Input $/1M | Output $/1M | Speed | Tool calling |
|-------|-----------|------------|-------|-------------|
| gpt-oss-120b | $0.15 | $0.60 | 500 t/s | Yes |
| gpt-oss-20b | $0.075 | $0.30 | 1000 t/s | Yes |
| llama-3.3-70b-versatile | $0.59 | $0.79 | 280 t/s | Yes |
| llama-3.1-8b-instant | $0.05 | $0.08 | 560 t/s | Yes |

### Cost Per AI Message (gpt-oss-120b)

| Component | Tokens | Rate | Cost |
|-----------|--------|------|------|
| System prompt + context (input) | 1,500 | $0.15/1M | $0.000225 |
| User message + history (input) | 500 | $0.15/1M | $0.000075 |
| AI response (output) | 400 | $0.60/1M | $0.000240 |
| Tool call overhead avg (output) | 100 | $0.60/1M | $0.000060 |
| **Total per message (uncached)** | **2,500** | | **$0.000600** |
| **With prompt caching (~80% hit)** | | | **$0.000528** |
| **Conservative blended estimate** | | | **$0.00055** |

### Railway Hosting (Next.js + PostgreSQL)

| Resource | Rate | Source |
|----------|------|--------|
| CPU | $20/vCPU/month | railway.com/pricing |
| RAM | $10/GB/month | railway.com/pricing |
| Network egress | $0.05/GB | railway.com/pricing |
| Pro plan subscription | $20/mo (includes $20 credit) | railway.com/pricing |

**At 10K users:**

| Component | Spec | Cost/mo |
|-----------|------|---------|
| App CPU | ~1.5 vCPU | $30.00 |
| App RAM | 2 GB | $20.00 |
| Postgres CPU | ~0.5 vCPU | $10.00 |
| Postgres RAM | 1 GB | $10.00 |
| Egress | ~30 GB | $1.50 |
| Pro subscription | flat | $20.00 |
| Less included credit | | -$20.00 |
| **Total Railway** | | **$71.50** |

### Clerk Auth

| Tier | Cost | Source |
|------|------|--------|
| Hobby (free) | $0 for up to 50,000 MRU | clerk.com/pricing |
| 10K users | **$0/mo** | Well under free tier |
| 50K+ users | $0.02/MRU overage on Pro ($25/mo) | clerk.com/pricing |

### Domain + SSL

| Item | Cost |
|------|------|
| .app domain | ~$18/year = $1.50/mo |
| SSL certificate | $0 (Railway auto-provisions Let's Encrypt) |

---

## Total Fixed Infrastructure at 10K Users

| Service | Monthly | Per User | Source |
|---------|---------|----------|--------|
| Railway (app + DB) | $71.50 | $0.00715 | railway.com |
| Clerk (auth) | $0.00 | $0.00000 | clerk.com (under 50K free) |
| Domain + SSL | $1.50 | $0.00015 | Standard pricing |
| **Total infra** | **$73.00** | **$0.0073** | |

---

## User Distribution Model

| Tier | Users | % | Rationale |
|------|-------|---|-----------|
| Free | 8,000 | 80% | Industry standard for freemium SaaS |
| Pro | 1,500 | 15% | Power users, solo developers |
| Team | 500 | 5% | Small teams, agencies |
| **Total** | **10,000** | **100%** | |

---

## Subscription Tiers

### Design Constraint
**100% ROI overall:** Total revenue from paid users = 2x total costs (including free tier subsidy).

### Tier Definition

| | **FREE** | **PRO** | **TEAM** |
|---|---|---|---|
| **Price** | $0/mo | $7/mo | $17/mo per seat |
| **Hosted AI (Groq)** | 50 msgs/mo | 5,000 msgs/mo | 15,000 msgs/mo |
| **Token equivalent** | ~125K | ~12.5M | ~37.5M |
| **Local AI (Ollama)** | Unlimited | Unlimited | Unlimited |
| **BYOK (own API key)** | Unlimited | Unlimited | Unlimited |
| **Projects** | 3 | Unlimited | Unlimited |
| **Schema planner** | Basic | Full | Full |
| **Whiteboard** | View only | Full | Full |
| **Team collaboration** | No | No | Yes |
| **Priority support** | No | Yes | Yes |
| **AI model** | gpt-oss-120b | gpt-oss-120b | gpt-oss-120b |

### Per-User Economics (Worst Case — 100% utilization of limits)

| | Free | Pro | Team |
|---|---|---|---|
| Revenue | $0.00 | $7.00 | $17.00 |
| AI cost (max msgs × $0.00055) | $0.028 | $2.75 | $8.25 |
| Infra share ($73/10K) | $0.007 | $0.007 | $0.007 |
| Free tier subsidy share ($220/2K paid) | — | $0.11 | $0.11 |
| **Total cost** | **$0.035** | **$2.87** | **$8.37** |
| **Profit** | -$0.035 | **$4.13** | **$8.63** |
| **ROI per user** | Loss leader | 144% | 103% |

### Aggregate Economics — Worst Case (100% utilization)

| Item | Calculation | Monthly |
|------|-------------|---------|
| Infrastructure (fixed) | Railway + Clerk + domain | $73.00 |
| Free tier AI | 8,000 × 50 × $0.00055 | $220.00 |
| Pro tier AI | 1,500 × 5,000 × $0.00055 | $4,125.00 |
| Team tier AI | 500 × 15,000 × $0.00055 | $4,125.00 |
| **Total cost** | | **$8,543.00** |
| **Revenue** | 1,500 × $7 + 500 × $17 | **$19,000.00** |
| **Profit** | | **$10,457.00** |
| **Overall ROI** | | **122%** |

### Aggregate Economics — Realistic (60% utilization)

| Item | Calculation | Monthly |
|------|-------------|---------|
| Infrastructure (fixed) | | $73.00 |
| Free tier AI (40% active, avg 30 msgs) | 3,200 × 30 × $0.00055 | $52.80 |
| Pro tier AI (70% active, 60% of limit) | 1,050 × 3,000 × $0.00055 | $1,732.50 |
| Team tier AI (70% active, 60% of limit) | 350 × 9,000 × $0.00055 | $1,732.50 |
| **Total cost** | | **$3,590.80** |
| **Revenue** | | **$19,000.00** |
| **Profit** | | **$15,409.20** |
| **Overall ROI** | | **429%** |

### Annual Projections at 10K Users

| Scenario | Annual Revenue | Annual Cost | Annual Profit |
|----------|---------------|-------------|---------------|
| Worst case (100% usage) | $228,000 | $102,516 | $125,484 |
| Realistic (60% usage) | $228,000 | $43,090 | $184,910 |

---

## Settings Panel Redesign

### Current Layout (Problems)

```
AI CONFIGURATION
├─ Status badge (connected/not configured)
├─ LOCAL AI section → ENABLE LOCAL AI button [confusing placement]
├─ OPTION 1: CONNECT OPENROUTER [unclear why this is #1]
└─ OPTION 2: PASTE API KEY [4 providers crammed together]

Problems:
- No "Hosted AI" option visible
- Must disconnect before switching (no dropdown)
- No usage display
- No tier/subscription context
- "ENABLE LOCAL AI" button disabled when any provider is connected
```

### New Layout (Proposed)

```
AI CONFIGURATION
│
├─ [Provider Selector Dropdown] ← single dropdown, always visible
│   ├─ "Hosted AI (Built-in)" — shows PRO badge or "Upgrade" lock
│   ├─ "Local AI (Your GPU)" — triggers setup if Ollama not detected
│   ├─ "OpenAI (Your Key)"
│   ├─ "Anthropic (Your Key)"
│   ├─ "Google (Your Key)"
│   └─ "OpenRouter"
│
├─ [Context Panel] ← changes based on dropdown selection
│   │
│   ├─ If "Hosted AI":
│   │   ├─ Subscription badge: "PRO — 5,000 msgs/mo" or "FREE — 50 msgs/mo"
│   │   ├─ Usage meter: ████████░░░░ 1,247 / 5,000 (25%)
│   │   ├─ "Resets April 30"
│   │   └─ [UPGRADE] button if on Free
│   │
│   ├─ If "Local AI":
│   │   ├─ Ollama status: "● Connected (qwen3:32b)" or "● Not detected"
│   │   ├─ [SETUP LOCAL AI] button if not connected
│   │   └─ "Free, private, runs on your GPU"
│   │
│   ├─ If BYOK (OpenAI/Anthropic/Google):
│   │   ├─ Key input field with provider auto-detect
│   │   ├─ "Unlimited — you pay your provider directly"
│   │   └─ [SAVE KEY] button
│   │
│   └─ If "OpenRouter":
│       ├─ [CONNECT OPENROUTER] OAuth button
│       └─ "200+ models, billed to your OpenRouter account"
│
├─ [Fallback Setting] ← only shown for Hosted AI users
│   └─ "When limit reached: [Auto-switch to Local AI ▼]"
│       Options: Local AI / Show upgrade prompt / Disable AI
│
└─ [Current Connection] ← always visible at bottom
    └─ "Active: Hosted AI (gpt-oss-120b) · 1,247 msgs used · Resets Apr 30"
```

---

## Auto-Fallback Logic

### Flow when user sends a message

```
User sends AI message
│
├─ Provider = "Hosted AI (Groq)"
│   ├─ Query AiTokenUsage for current billing period
│   ├─ messagesUsed < limit?
│   │   ├─ YES → Route to Groq API, increment counter
│   │   └─ NO → Fallback:
│   │       ├─ fallbackSetting = "local" AND Ollama detected?
│   │       │   └─ Auto-switch to client-side Ollama
│   │       │      Show banner: "Monthly limit reached. Using Local AI."
│   │       ├─ fallbackSetting = "local" BUT Ollama NOT detected?
│   │       │   └─ Show modal: "Limit reached. Install Ollama or upgrade."
│   │       ├─ fallbackSetting = "upgrade"?
│   │       │   └─ Show modal: "Upgrade to Pro for 5,000 msgs/mo"
│   │       └─ fallbackSetting = "disable"?
│   │           └─ Show error: "Monthly AI limit reached."
│   │
├─ Provider = "Local AI (Ollama)"
│   ├─ Check browser-side Ollama detection
│   ├─ Running? → Client-side orchestration (existing flow)
│   └─ Not running? → Show "Ollama not detected" + setup button
│
├─ Provider = "BYOK" (OpenAI/Anthropic/Google/OpenRouter)
│   └─ Route to server → user's provider (unlimited, they pay)
│
└─ Provider = "NONE"
    └─ Show "Select an AI provider in Settings"
```

### Token limit enforcement location

```
Server-side (for Hosted AI):
  /api/ai/chat/route.ts → check AiTokenUsage BEFORE calling Groq

Client-side (for Local AI fallback):
  AI page detects limit reached from /api/ai/usage response
  Auto-switches to client-side Ollama path
```

---

## Schema Changes

### New model: AiTokenUsage

```prisma
model AiTokenUsage {
  id           String   @id @default(cuid())
  userId       String
  periodStart  DateTime
  periodEnd    DateTime
  messagesUsed Int      @default(0)
  tokensInput  Int      @default(0)
  tokensOutput Int      @default(0)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, periodStart])
  @@index([userId])
}
```

### User model addition

```prisma
// Add to User model:
preferredAiProvider  String    @default("NONE")  // Dropdown selection
aiFallbackSetting    String    @default("local") // "local" | "upgrade" | "disable"
```

### Entitlements addition

```typescript
// In server/billing/entitlements.ts:
export const AI_MESSAGE_LIMITS: Record<SubscriptionPlan, number> = {
  FREE: 50,
  PRO: 5_000,
  TEAM: 15_000,
};
```

---

## Plan — Implementation Phases

### Part 1: Schema + Token Tracking Service
- [ ] Add `AiTokenUsage` model to Prisma schema
- [ ] Add `preferredAiProvider` and `aiFallbackSetting` to User model
- [ ] Run `prisma migrate dev --name add-token-usage-and-provider-prefs`
- [ ] Create `server/ai/token-tracking.ts`:
  - `getOrCreatePeriod(userId)` — find/create usage record for current billing period
  - `incrementUsage(userId, inputTokens, outputTokens)` — bump counters
  - `checkLimit(userId, plan)` — return { allowed, used, limit, remaining }
  - `getUsage(userId)` — return current period stats for UI display
- [ ] Add `AI_MESSAGE_LIMITS` to `server/billing/entitlements.ts`

### Part 2: Usage API + Chat Route Update
- [ ] Create `GET /api/ai/usage` — returns { used, limit, periodEnd, plan }
- [ ] Update `POST /api/ai/chat` — check limit before Groq call, increment after
- [ ] Update `PUT /api/ai/config` — save `preferredAiProvider` + `aiFallbackSetting`
- [ ] Update `GET /api/ai/config` — return preference + current usage summary

### Part 3: Usage Meter Component
- [ ] Create `components/ai/usage-meter.tsx`
  - Progress bar with percentage
  - "X / Y messages" label
  - "Resets [date]" subtitle
  - Color: green (0-70%), yellow (70-90%), red (90%+)
- [ ] Create `components/ai/provider-context-panel.tsx`
  - Renders different content based on selected provider
  - Hosted AI: subscription badge + usage meter + upgrade CTA
  - Local AI: Ollama status + setup button
  - BYOK: key input + auto-detect
  - OpenRouter: OAuth button

### Part 4: Settings Page Redesign
- [ ] Replace current 3-section layout with single dropdown + context panel
- [ ] Provider selector dropdown (always visible, saves to `preferredAiProvider`)
- [ ] Context panel that swaps content based on selection
- [ ] Fallback setting dropdown (only for Hosted AI)
- [ ] Connection status bar at bottom
- [ ] Wire all to updated `/api/ai/config`

### Part 5: Auto-Fallback in AI Page + Helper
- [ ] Update AI page `sendMessage`:
  - If hosted AI and over limit → check fallback setting
  - If fallback = "local" and Ollama available → switch to client-side path
  - Show banner: "Monthly limit reached. Using Local AI."
  - If no fallback available → show upgrade modal
- [ ] Update AI helper widget with same fallback logic
- [ ] Add limit-reached banner component
- [ ] Fetch usage on AI page mount, refresh after each message

### Part 6: Testing
- [ ] Test: Free user hits 50-message limit → fallback triggers
- [ ] Test: Pro user sends 5,001st message → limit enforced
- [ ] Test: Provider switching via dropdown → correct path used
- [ ] Test: Usage meter updates after each message
- [ ] Test: Fallback to Local AI when limit reached + Ollama running
- [ ] Test: Upgrade prompt when limit reached + no Ollama
- [ ] Test: Period reset at billing cycle boundary
- [ ] Test: BYOK users have no limit (unlimited)
- [ ] Playwright screenshots of new Settings panel

---

## ADR Orchestration Mapping

This work does NOT create a new ADR subfolder. It adds phases to 3 existing subfolders:

### `10_billing-and-subscriptions` — 3 new phases

**Phase 4 — AI Token Usage Tracking**
- AiTokenUsage Prisma model + migration
- token-tracking.ts service (getOrCreatePeriod, incrementUsage, checkLimit, getUsage)
- AI_MESSAGE_LIMITS per plan in entitlements.ts
- GET /api/ai/usage endpoint
- Limit enforcement in POST /api/ai/chat (check before Groq call, increment after)

**Phase 5 — Subscription Tier Integration with AI**
- Tier definitions: Free 50 msgs, Pro 5,000 msgs, Team 15,000 msgs
- Usage meter component (progress bar, color-coded, reset date)
- Period management (align with Stripe billing cycle or calendar month)
- preferredAiProvider + aiFallbackSetting on User model

**Phase 6 — Billing + AI Limits Testing**
- Free user hits 50-message limit → fallback triggers
- Pro user at 5,001 messages → limit enforced
- Period reset at billing cycle boundary
- Usage meter accuracy after each message
- BYOK users have no hosted limit

### `9_ai-chat` — 1 new phase

**Phase 8 — Settings AI Panel Redesign**
- Provider selector dropdown replacing 3-section layout
- Context panels per provider (Hosted AI / Local AI / BYOK / OpenRouter)
- Fallback setting dropdown (only for Hosted AI users)
- Connection status bar
- Wire to updated /api/ai/config (preferredAiProvider + fallbackSetting)
- OllamaSetupModal auto-triggered when "Local AI" selected + not detected

### `9.5_universal-stateful-ai-expansion` — 1 new phase

**Phase 10 — Auto-Fallback + Provider Switching**
- AI page: detect hosted limit reached → check fallback setting → auto-switch
- Limit-reached banner: "Monthly limit reached. Using Local AI."
- Upgrade modal when limit reached + no Local AI available
- AI helper widget: same fallback logic
- Fetch usage on mount, refresh after each message
- Provider badge per message ("via Groq" / "via Local AI" / "via OpenAI")

### Why no new subfolder?

Token limits = billing (10). Provider switching = AI chat (9). Auto-fallback = stateful AI (9.5). A new `14_ai-provider-tiers` folder would fragment work that logically belongs in these existing domains.

---

## Questions

1. **Pricing confirmation:** $7/mo Pro and $17/mo Team — acceptable? Or adjust?
2. **Free tier messages:** 50 messages/month enough as a trial? Or lower to 25 to reduce subsidy cost?
3. **Fallback default:** Should "Auto-switch to Local AI" be the default, or "Show upgrade prompt"?
4. **Model per tier:** Same model (gpt-oss-120b) for all tiers? Or gpt-oss-20b for Free to save cost?
5. **Overage option:** Should Pro/Team users be able to pay for extra messages beyond their limit ($0.001/msg)? Or hard cap?
