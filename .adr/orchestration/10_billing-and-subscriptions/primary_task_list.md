# Primary Task List — 10_billing-and-subscriptions

Session: Billing and Subscriptions
Started: 2026-03-10
Design Fidelity: Faithful (pass-1 brutalism-neobrutalism) for UI elements

> **Note:** Stripe billing covers app subscription tiers (Free/Pro/Team). Each tier includes a hosted AI message quota (Groq API). BYOK and Local AI (Ollama) are unlimited and unmetered. AI costs from the hosted tier are subsidized by subscription revenue.

---

## Phase 1 — Billing UI in Settings

- [ ] Add subscription status display to settings page
- [ ] Add plan selection cards (Free/Pro/Team) with neo-brutalist styling
- [ ] Add "Manage Subscription" button linking to Stripe portal
- [ ] Add billing history section
- [ ] Style all billing UI to match pass-1 card/button patterns

## Phase 2 — Billing Backend Verification + Integration

- [ ] Verify existing Stripe API routes (checkout, portal, webhook)
- [ ] Wire plan selection to POST /api/billing/checkout
- [ ] Wire manage button to POST /api/billing/portal
- [ ] Test webhook handling for subscription lifecycle events
- [ ] Handle "billing not configured" state (missing Stripe keys) with error display
- [ ] Verify entitlement model updates on subscription changes

## Phase 3 — Billing Testing

- [ ] Playwright screenshots of billing UI
- [ ] User story validation with Stripe test mode
- [ ] Test free → pro upgrade flow
- [ ] Test subscription cancellation flow

## Phase 4 — AI Token Usage Tracking (2026-04-03)

> Plan: `.docs/planning/plans/4-ai-provider-switcher-subscription-tiers.md`
> Verified pricing: Groq gpt-oss-120b at $0.15/1M input, $0.60/1M output (~$0.00055/message blended)

### Schema
- [ ] Add `AiTokenUsage` model to Prisma schema (userId, periodStart, periodEnd, messagesUsed, tokensInput, tokensOutput)
- [ ] Add `preferredAiProvider` (String, default "NONE") to User model
- [ ] Add `aiFallbackSetting` (String, default "local") to User model
- [ ] Run migration: `prisma migrate dev --name add-token-usage-and-provider-prefs`

### Token Tracking Service
- [ ] Create `server/ai/token-tracking.ts`:
  - `getOrCreatePeriod(userId)` — find or create usage record for current billing period
  - `incrementUsage(userId, messagesCount, inputTokens, outputTokens)` — bump counters atomically
  - `checkLimit(userId, plan)` — return `{ allowed: bool, used, limit, remaining, periodEnd }`
  - `getUsage(userId)` — return current period stats for UI display
- [ ] Add `AI_MESSAGE_LIMITS` to `server/billing/entitlements.ts`:
  - FREE: 50 messages/month
  - PRO: 5,000 messages/month
  - TEAM: 15,000 messages/month

### API Endpoints
- [ ] Create `GET /api/ai/usage` — returns `{ used, limit, remaining, periodEnd, plan }`
- [ ] Update `POST /api/ai/chat` — check limit BEFORE Groq call for hosted AI users; increment AFTER successful response
- [ ] Update `PUT /api/ai/config` — accept and save `preferredAiProvider` + `aiFallbackSetting`
- [ ] Update `GET /api/ai/config` — return preference fields + current usage summary

### Limit Enforcement Rules
- Admins: no limit (bypass)
- BYOK users: no hosted limit (they pay their provider)
- OLLAMA_LOCAL users: no limit (local inference)
- GROQ_BUILTIN / "Hosted AI": enforce AI_MESSAGE_LIMITS based on subscription plan
- When limit reached: return `{ ok: false, error: "ai_limit_reached", used, limit }` with HTTP 429

## Phase 5 — Subscription Tier Definitions (2026-04-03)

> Pricing verified via web research: groq.com, railway.com, clerk.com (April 2026)

### Tier Economics (at 10K users, 80% free / 15% Pro / 5% Team)

| Tier | Price | Hosted msgs | AI cost/user | Infra/user | Total cost/user | Profit/user | ROI |
|------|-------|-------------|-------------|-----------|----------------|------------|-----|
| FREE | $0 | 50/mo | $0.028 | $0.007 | $0.035 | -$0.035 | Loss leader |
| PRO | $7/mo | 5,000/mo | $2.75 | $0.007 | $2.87 | $4.13 | 144% |
| TEAM | $17/seat | 15,000/mo | $8.25 | $0.007 | $8.37 | $8.63 | 103% |

**Overall at 10K users:** Revenue $19,000/mo, Cost $8,543/mo (worst case), ROI 122%

### Stripe Product Setup (for when keys are provided)
- [ ] Document Stripe product/price creation steps for Pro ($7/mo) and Team ($17/mo/seat)
- [ ] Update plan comparison cards in Settings billing section with correct prices
- [ ] Map STRIPE_PRICE_ID_PRO and STRIPE_PRICE_ID_TEAM to these tiers
- [ ] Ensure webhook updates subscription plan → entitlements → AI_MESSAGE_LIMITS cascade

### Usage Meter Component
- [ ] Create `components/ai/usage-meter.tsx`:
  - Progress bar with percentage fill
  - Label: "X / Y messages used this month"
  - Subtitle: "Resets [periodEnd date]"
  - Color coding: green (0-70%), yellow (70-90%), red (90-100%)
  - Optional: "Upgrade" link when on Free tier

### Period Management
- [ ] Align usage periods with Stripe billing cycle (currentPeriodStart/End) for paid users
- [ ] For free users: use calendar month (1st to last day)
- [ ] Auto-create new period record when current period expires
- [ ] Handle mid-cycle plan upgrades: keep existing usage, update limit immediately

## Phase 6 — Billing + AI Limits Testing (2026-04-03)

- [ ] Test: Free user sends 51st message → HTTP 429, fallback triggers
- [ ] Test: Pro user sends 5,001st message → limit enforced
- [ ] Test: Team user at 15,001 → limit enforced
- [ ] Test: Admin user → no limit (bypass)
- [ ] Test: BYOK user → no hosted limit
- [ ] Test: Usage meter updates after each message sent
- [ ] Test: Period reset at billing cycle boundary (new period, counter = 0)
- [ ] Test: Mid-cycle upgrade Free → Pro → limit increases immediately
- [ ] Test: Subscription cancellation → reverts to Free limits
- [ ] Playwright screenshots: usage meter at 0%, 50%, 90%, 100%

## Phase 7 — Free Tier Admin Toggle / Promotion Mode (2026-04-03)

> Plan: `.docs/planning/plans/4-ai-provider-switcher-subscription-tiers.md`
> Purpose: Admin-controlled toggle to enable/disable free tier hosted AI as a promotional tool

### Schema
- [ ] Add `AdminConfig` model to Prisma schema (key String @id, value String, updatedAt DateTime)
- [ ] Run migration: `prisma migrate dev --name add-admin-config`
- [ ] Seed default: `{ key: "free_tier_ai_enabled", value: "false" }`

### Admin Config Service
- [ ] Create `server/admin/config.ts`:
  - `getAdminConfig(key: string): Promise<string | null>` — read from DB
  - `setAdminConfig(key: string, value: string): Promise<void>` — write to DB
  - `isFreeTierEnabled(): Promise<boolean>` — check env var first, then DB, default false
- [ ] Env var override: `FREE_TIER_AI_ENABLED=true` takes precedence over DB value

### API
- [ ] Create `GET /api/admin/config` — admin-only, returns all config key-value pairs
- [ ] Create `PUT /api/admin/config` — admin-only, accepts `{ key, value }`, validates key whitelist

### Entitlement Integration
- [ ] Update `AI_MESSAGE_LIMITS` resolution to be dynamic:
  - `getMessageLimit(plan)` checks `isFreeTierEnabled()` for FREE plan
  - Returns 50 when enabled, 0 when disabled
  - PRO/TEAM limits are static (5,000 / 15,000)
- [ ] Update `checkLimit()` in token-tracking.ts to use `getMessageLimit()` instead of static lookup

### Admin UI (Settings page, admin-only section)
- [ ] Add "ADMIN SETTINGS" card (visible only when `user.role === "ADMIN"`)
- [ ] Free Tier AI toggle:
  - ON/OFF switch
  - Description: "When ON, unsubscribed users get 50 hosted AI messages/month"
  - Shows current state + last changed timestamp
- [ ] AI model override dropdown (optional, for switching default model)
- [ ] Usage stats display (read-only):
  - Total hosted messages this billing period
  - Estimated Groq cost this period
  - Active subscriber count (Pro + Team breakdown)

### Subscribe Page Updates
- [ ] Read `isFreeTierEnabled()` on subscribe/billing card render
- [ ] When ENABLED: show 3 tier cards (Free with "50 AI msgs" / Pro / Team)
- [ ] When DISABLED: show 2 tier cards (Pro / Team) + banner "Free accounts: Local AI & BYOK only"
- [ ] Ensure plan comparison dynamically reflects toggle state

### Gating Updates
- [ ] AI chat route: when free tier disabled + user is FREE + provider is hosted → 403 "Subscribe required"
- [ ] AI chat page: detect 403 → show subscribe prompt (not generic error)
- [ ] Settings AI config: when free tier disabled + user is FREE + selects "Hosted AI" → show "Requires subscription" inline

### Testing
- [ ] Test: Toggle ON → free user gets 50 hosted msgs
- [ ] Test: Toggle OFF → free user gets 0 hosted msgs, sees subscribe prompt
- [ ] Test: Toggle OFF → free user can still use Local AI and BYOK
- [ ] Test: Subscribe page renders 3 cards (ON) vs 2 cards (OFF)
- [ ] Test: Env var override takes precedence over DB toggle
- [ ] Test: Non-admin cannot access /api/admin/config
- [ ] Test: Toggle change takes effect immediately (no redeploy)
- [ ] Playwright screenshots: admin panel, subscribe page both states
