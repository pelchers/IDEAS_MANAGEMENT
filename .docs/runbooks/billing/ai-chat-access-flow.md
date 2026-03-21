# AI Chat Access Flow

## Overview

The AI chat feature has a tiered access model that balances free access for BYOK users, paid access for built-in AI, and full bypass for admins.

## Access Decision Tree

```
User sends message to /api/ai/chat
│
├─ Is user an ADMIN?
│  └─ YES → Access granted (admin bypass)
│
├─ Does user have their own API key (BYOK)?
│  ├─ Provider is OPENROUTER_BYOK, OPENAI_BYOK, ANTHROPIC_BYOK, or GOOGLE_BYOK
│  └─ YES → Access granted (user pays their own provider)
│
├─ Does user have ai_chat entitlement?
│  ├─ From active subscription (PRO or TEAM plan)
│  ├─ From admin grant (ADMIN_GRANT source)
│  ├─ From trial grant (TRIAL source)
│  └─ YES → Access granted (user paid for built-in AI)
│
└─ NO entitlement → 403: "Built-in AI requires an active subscription"
```

## Provider Types and Billing

| Provider | Billing | Access Gate |
|----------|---------|-------------|
| OLLAMA_LOCAL | User pays nothing (free local AI) | Requires subscription or admin grant |
| OPENROUTER_BYOK | User pays OpenRouter | No subscription needed (BYOK bypass) |
| OPENAI_BYOK | User pays OpenAI | No subscription needed (BYOK bypass) |
| ANTHROPIC_BYOK | User pays Anthropic | No subscription needed (BYOK bypass) |
| GOOGLE_BYOK | User pays Google | No subscription needed (BYOK bypass) |

### Why BYOK Users Bypass Billing
Users who bring their own API key are paying their AI provider directly. We don't incur any AI costs for these users, so there's no reason to charge them for AI access. The subscription only gates access to our built-in Ollama model, which runs on our infrastructure (or the user's local machine).

### Why Ollama Requires Billing
Even though Ollama runs locally on the user's machine, access to the built-in AI feature (including all 12 tools, context injection, session management) is a premium feature that justifies a subscription.

## Admin Self-Grant Flow

Admins can enable AI access for themselves or other users without going through Stripe:

1. Admin goes to Settings > AI Configuration
2. Sees "ADMIN: ENABLE AI ACCESS" section (only visible to admins without existing entitlement)
3. Clicks "ENABLE AI (ADMIN)"
4. API: POST /api/admin/grant-entitlement → creates entitlement with source=ADMIN_GRANT
5. Admin now has ai_chat access — can use built-in Ollama or any provider

### API: POST /api/admin/grant-entitlement
- Requires admin role
- Body: `{ feature: "ai_chat", targetUserId?: "user_id" }`
- Defaults to granting to the requesting admin's own account
- Creates/upserts Entitlement record with source=ADMIN_GRANT
- Logged in audit trail

## Subscription Plans and AI Access

| Plan | AI Chat Access | AI Features |
|------|---------------|-------------|
| FREE | BYOK only | Chat + tools (user's provider) |
| PRO | Built-in + BYOK | Chat + tools + built-in Ollama |
| TEAM | Built-in + BYOK | Chat + tools + built-in Ollama + collaboration |

## Entitlement Sources

| Source | Description | Created By |
|--------|-------------|------------|
| SUBSCRIPTION | From active Stripe subscription | Stripe webhook handler |
| ADMIN_GRANT | From admin self-grant or admin granting to user | POST /api/admin/grant-entitlement |
| TRIAL | From trial period | Future: trial signup flow |

## Error Messages

| Status | Error | Message |
|--------|-------|---------|
| 401 | unauthorized | Redirects to /signin |
| 403 | ai_subscription_required | "Built-in AI requires an active subscription. Go to Settings to subscribe, or add your own API key to use AI for free." |
| 503 | ai_not_configured | "AI not available. Install Ollama or add an API key in Settings." |

## Files

| File | Purpose |
|------|---------|
| `apps/web/src/app/api/ai/chat/route.ts` | Chat endpoint with access check |
| `apps/web/src/server/billing/entitlements.ts` | Entitlement check logic |
| `apps/web/src/app/api/admin/grant-entitlement/route.ts` | Admin self-grant endpoint |
| `apps/web/src/app/(authenticated)/settings/page.tsx` | Admin UI for enabling AI |
