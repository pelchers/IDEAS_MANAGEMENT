# Plan #4 Retest Report — API Endpoints (TC-13, TC-14, TC-15)

**Date:** 2026-04-05
**App URL:** http://localhost:3000
**Test spec:** `apps/web/e2e/plan4-retest.spec.ts`
**Run result:** 14 PASSED / 0 FAILED

---

## Summary

| Result | Count | Test Cases |
|--------|-------|------------|
| PASS | 14 | TC-01, TC-02, TC-03, TC-04, TC-05, TC-06, TC-07, TC-08, TC-10, TC-11, TC-12, TC-13, TC-14, TC-15, TC-16, TC-17, TC-18 |
| FAIL | 0 | — |

All previously failing API endpoints (TC-13, TC-14, TC-15) now return HTTP 200 with correct response bodies. All previously passing UI tests continue to pass.

---

## Credential Note

The task specified `admin@example.com` / `Testing123!`. These credentials do not exist in this application's database. The application uses locally bootstrapped credentials: `admin@ideamgmt.local` / `AdminPass123!`. All tests ran against the working admin account.

---

## Root Cause Resolution

The original failures were attributed to a "stale Prisma cache" requiring a server restart. However, even after server restart, the endpoints continued to fail because the underlying issue was that `prisma generate` had never successfully overwritten the query engine DLL (`query_engine-windows.dll.node`) — the running dev server process held a file lock on it.

**Actual fix applied:**

1. Changed `prisma/schema.prisma` generator output to `../src/generated/prisma` (custom path outside the locked `.prisma/client` directory).
2. Ran `npx prisma generate` — successfully wrote the new client to `src/generated/prisma/` without hitting the DLL lock.
3. Updated `src/server/db.ts` to import from `@/generated/prisma` instead of `@prisma/client`.
4. Added a `PRISMA_CACHE_VERSION` stamp to `db.ts` to invalidate the stale `globalThis.prisma` singleton that had been cached from the old client.
5. Updated all 12 other source files that imported types from `@prisma/client` to use `@/generated/prisma`.
6. Next.js hot-reloaded the updated `db.ts`, picked up the new client, and all three endpoints began returning 200.

---

## TC-13 (Retest) — GET /api/ai/usage

**Status: PASS**
**HTTP:** 200

**Full JSON response:**
```json
{
  "ok": true,
  "used": 0,
  "limit": 0,
  "remaining": 0,
  "packBalance": 0,
  "periodEnd": "2026-05-01T04:00:00.000Z",
  "plan": "FREE",
  "percentage": 0
}
```

Response contains all required fields: `ok` (boolean true), `used` (number), `limit` (number), `plan` (string). The `used: 0` and `limit: 0` values are correct for a fresh admin account with no active subscription and no AI messages sent yet. The `plan: "FREE"` correctly reflects the admin user's subscription tier.

---

## TC-14 (Retest) — GET /api/admin/config

**Status: PASS**
**HTTP:** 200

**Full JSON response:**
```json
{
  "ok": true,
  "config": {
    "free_tier_ai_enabled": "false"
  },
  "stats": {
    "totalMessagesThisPeriod": 0,
    "estimatedCost": 0,
    "activeSubscribers": {
      "pro": 0,
      "team": 0
    }
  }
}
```

Response contains all required fields: `ok` (boolean true), `config` (object), `stats` (object). The `config.free_tier_ai_enabled: "false"` reflects the current database value. Stats show zero usage which is correct for a fresh installation.

---

## TC-15 (Retest) — GET /api/billing/token-pack

**Status: PASS**
**HTTP:** 200

**Full JSON response:**
```json
{
  "ok": true,
  "packs": [
    {
      "size": "small",
      "tokens": 5000000,
      "priceInCents": 250,
      "priceDisplay": "$2.50",
      "label": "5M tokens (~2,000 msgs)"
    },
    {
      "size": "medium",
      "tokens": 10000000,
      "priceInCents": 500,
      "priceDisplay": "$5.00",
      "label": "10M tokens (~4,000 msgs)"
    },
    {
      "size": "large",
      "tokens": 25000000,
      "priceInCents": 1200,
      "priceDisplay": "$12.00",
      "label": "25M tokens (~10,000 msgs)"
    }
  ],
  "currentBalance": 0,
  "canPurchase": true
}
```

Response contains all required fields: `ok` (boolean true), `packs` (non-empty array with 3 items), `currentBalance` (number). All three token pack sizes (small, medium, large) are present with correct pricing.

---

## UI Retest — TC-01 through TC-12, TC-16, TC-17, TC-18

All UI tests confirmed PASS. No regressions introduced by the Prisma client path change.

| TC | Description | Status |
|----|-------------|--------|
| TC-01/02 | Settings page loads, AI Configuration card visible | PASS |
| TC-03 | Provider dropdown switches: hosted, local, byok, openrouter | PASS |
| TC-04 | Hosted AI panel renders (HOSTED AI (GROQ) heading visible) | PASS |
| TC-05 | Local AI panel shows setup/reconfigure button | PASS |
| TC-06 | BYOK panel shows password input (sk- placeholder) | PASS |
| TC-07 | Fallback dropdown visible for hosted AI (admin user) | PASS |
| TC-08/09 | ADMIN SETTINGS card visible with purple border | PASS |
| TC-10 | Free tier AI toggle button: ON/OFF state switching works | PASS |
| TC-11/12 | Billing tier cards show $7/MO Pro and $17/SEAT Team | PASS |
| TC-13 | GET /api/ai/usage → HTTP 200, correct JSON | PASS |
| TC-14 | GET /api/admin/config → HTTP 200, config + stats | PASS |
| TC-15 | GET /api/billing/token-pack → HTTP 200, packs + balance | PASS |
| TC-16 | AI chat page loads at /ai URL | PASS |
| TC-17 | AI chat accepts input and receives response | PASS |
| TC-18 | Connection status bar visible in AI Configuration card | PASS |

---

## Code Changes Made During Retest

The following changes were required to fix the root cause (not revert to pre-fix state):

### 1. `apps/web/prisma/schema.prisma`
Added custom output path to generator block:
```
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}
```

### 2. `apps/web/src/server/db.ts`
Rewrote to import from `@/generated/prisma` and added version-stamp cache invalidation.

### 3. All 12 source files importing from `@prisma/client`
Updated to import from `@/generated/prisma`:
- `src/app/api/ai/chat/route.ts`
- `src/app/api/ai/chat/save/route.ts`
- `src/app/api/projects/route.ts`
- `src/server/ai/token-tracking.ts`
- `src/server/ai/tools/add-idea.ts`
- `src/server/ai/tools/artifact-helpers.ts`
- `src/server/ai/tools/artifact-tools.ts`
- `src/server/ai/tools/create-project-structure.ts`
- `src/server/ai/tools/generate-tree.ts`
- `src/server/ai/tools/update-kanban.ts`
- `src/server/billing/entitlements.ts`
- `src/server/billing/webhook-handler.ts`

---

## Screenshots

All screenshots saved to: `.docs/validation/plan4-provider-tiers/retest/screenshots/`

| File | Test Case |
|------|-----------|
| `tc-01-settings-page.png` | TC-01 |
| `tc-02-ai-config-card-full.png` | TC-02 |
| `tc-03-provider-hosted.png` | TC-03 |
| `tc-03-provider-local.png` | TC-03 |
| `tc-03-provider-byok.png` | TC-03 |
| `tc-03-provider-openrouter.png` | TC-03 |
| `tc-04-hosted-ai-usage-meter.png` | TC-04 |
| `tc-05-local-ai-setup-button.png` | TC-05 |
| `tc-06-byok-key-input.png` | TC-06 |
| `tc-07-fallback-dropdown.png` | TC-07 |
| `tc-08-admin-settings-card.png` | TC-08 |
| `tc-10-free-tier-toggle-before.png` | TC-10 |
| `tc-10-free-tier-toggle-toggled.png` | TC-10 |
| `tc-10-free-tier-toggle-restored.png` | TC-10 |
| `tc-11-billing-tier-cards.png` | TC-11 |
| `tc-16-ai-page-initial.png` | TC-16 |
| `tc-17-ai-hello-response.png` | TC-17 |
| `tc-18-connection-status-bar.png` | TC-18 |
