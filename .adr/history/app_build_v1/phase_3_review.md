# Phase 3 Review: Subscriptions + Entitlements (Stripe)

Session: app_build_v1
Phase: phase_3
Date: 2026-03-05
Reviewer: longrunning-worker-subagent
Status: complete

## Summary

Phase 3 integrated Stripe for subscription billing, added entitlement enforcement across web API, web UI, and desktop, and added Prisma models for subscriptions, entitlements, and billing events. All 42 tests pass (including 25 new billing tests), and TypeScript compilation succeeds across all 6 packages.

## What was built

### Prisma Models
- **Subscription**: Links users to Stripe subscriptions with status tracking (ACTIVE, PAST_DUE, CANCELED, TRIALING, UNPAID) and plan levels (FREE, PRO, TEAM).
- **Entitlement**: Feature-level access grants with source tracking (SUBSCRIPTION, ADMIN_GRANT, TRIAL) and optional expiry dates. Unique constraint on (userId, feature).
- **BillingEvent**: Audit log for all Stripe webhook events with idempotency via unique stripeEventId.
- Migration SQL created at `prisma/migrations/20260305_001_add_billing_models/`.

### Stripe Integration
- Stripe client singleton (`server/billing/stripe.ts`) with environment-driven configuration.
- Environment variables: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_PRO, STRIPE_PRICE_TEAM, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.

### API Endpoints
- **POST /api/billing/checkout**: Creates Stripe Checkout session for PRO or TEAM plans. Validates input with Zod, stores userId in session metadata for webhook processing. Reuses existing Stripe customer ID when available.
- **POST /api/billing/portal**: Creates Stripe Customer Portal session for subscription management. Requires existing subscription.
- **POST /api/billing/webhook**: Handles Stripe webhook events with raw body signature verification. Routes events to type-specific handlers.

### Webhook Handler
Processes 4 event types with full idempotency:
1. `checkout.session.completed` -- Creates subscription record and syncs entitlements.
2. `customer.subscription.updated` -- Updates status, period, and entitlements. ACTIVE/TRIALING syncs features; CANCELED revokes them; PAST_DUE maintains grace period.
3. `customer.subscription.deleted` -- Marks subscription as CANCELED and revokes all subscription-sourced entitlements.
4. `invoice.payment_failed` -- Updates subscription status to PAST_DUE.

All events are logged to BillingEvent for audit purposes. Duplicate events are detected and skipped via unique constraint on stripeEventId.

### Entitlement System
- **Feature definitions**: PRO_ACCESS, TEAM_ACCESS, WHITEBOARD, SCHEMA_PLANNER, AI_CHAT.
- **Plan-to-feature mapping**: FREE has no features; PRO includes all except TEAM_ACCESS; TEAM includes all.
- **checkEntitlement()**: Checks admin bypass, explicit entitlements, then active subscriptions.
- **getUserEntitlements()**: Returns complete entitlement summary for a user.
- **syncEntitlementsForPlan()**: Upserts entitlements matching a plan, removes stale ones.
- **revokeSubscriptionEntitlements()**: Removes all SUBSCRIPTION-sourced entitlements.

### Enforcement Layers
1. **Server-side middleware** (`requireEntitlement`): Guards API endpoints by checking entitlements. Returns 403 with feature name when access is denied.
2. **Client-side hook** (`useEntitlements` / `EntitlementProvider`): React context provider that fetches entitlements from `/api/auth/me` and provides `hasFeature()` check.
3. **Desktop IPC handler** (`auth:checkEntitlement`): Queries the web API for entitlement data and checks if a specific feature is available.

### API Updates
- **GET /api/auth/me**: Now returns `entitlements` object alongside user data, including `plan`, `features[]`, and `isAdmin`.

## Test Results

- 42 total tests pass (6 test files).
- 25 new billing tests (16 entitlement + 9 webhook handler).
- All tests use mocked Prisma client for speed and isolation.

### Entitlement tests (16):
- Admin bypass verification
- Explicit entitlement checks (active, expired)
- Subscription-derived entitlement checks (ACTIVE, TRIALING, FREE plan)
- getUserEntitlements with admin, no subscription, PRO, merged grants
- PLAN_FEATURES mapping validation
- syncEntitlementsForPlan upsert/cleanup
- revokeSubscriptionEntitlements

### Webhook handler tests (9):
- Idempotency (duplicate event rejection)
- New event logging
- checkout.session.completed (success + missing metadata)
- subscription.updated (ACTIVE sync + CANCELED revoke)
- subscription.deleted (success + missing subscription)
- invoice.payment_failed

## Type Safety

Stripe SDK v20 uses updated API types (v2026-02-25.clover):
- `current_period_start/end` now on SubscriptionItem, not Subscription.
- Invoice subscription reference moved to `parent.subscription_details.subscription`.
- All type casts properly handled with intermediate `unknown` conversions where needed.

## Files Changed

### New files (14):
- `apps/web/prisma/migrations/20260305_001_add_billing_models/migration.sql`
- `apps/web/src/server/billing/stripe.ts`
- `apps/web/src/server/billing/entitlements.ts`
- `apps/web/src/server/billing/webhook-handler.ts`
- `apps/web/src/server/billing/require-entitlement.ts`
- `apps/web/src/server/billing/index.ts`
- `apps/web/src/server/billing/entitlements.test.ts`
- `apps/web/src/server/billing/webhook-handler.test.ts`
- `apps/web/src/app/api/billing/checkout/route.ts`
- `apps/web/src/app/api/billing/portal/route.ts`
- `apps/web/src/app/api/billing/webhook/route.ts`
- `apps/web/src/hooks/use-entitlements.ts`
- `.docs/validation/phase_3/validation-summary.html`
- `.adr/history/app_build_v1/phase_3_review.md`

### Modified files (4):
- `apps/web/prisma/schema.prisma` -- Added 3 models + 3 enums + User relations
- `apps/web/src/app/api/auth/me/route.ts` -- Added entitlement data to response
- `apps/web/.env.example` -- Added Stripe environment variables
- `apps/desktop/src/main/auth.ts` -- Added checkEntitlement IPC handler + MeResponse type

### Dependencies added:
- `stripe` ^20.4.0 (apps/web)

## Risks and Follow-ups

- Stripe API keys must be configured via `.env` before billing features work.
- Webhook endpoint requires a publicly accessible URL or Stripe CLI for local testing.
- No billing UI components yet (subscription page, upgrade prompts) -- these will be part of a future UI phase.
- Database migration must be run against the production database before deploying.
