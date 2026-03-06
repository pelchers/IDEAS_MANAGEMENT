# Phase Plan

Phase: phase_3
Session: app_build_v1
Date: 2026-03-05
Owner: longrunning-worker-subagent
Status: complete

## Objectives
- Integrate Stripe for subscription billing (Checkout, Customer Portal, Webhooks).
- Build entitlement enforcement across web API, web UI, and desktop.
- Add Prisma models for subscriptions, entitlements, and billing events.

## Task checklist
- [x] Add Prisma models: Subscription, Entitlement, BillingEvent (linked to User).
- [x] Run prisma migrate to create new tables.
- [x] Define Stripe product/price tiers (Free, Pro, Team — env-configured).
- [x] Implement Stripe Checkout session creation endpoint (POST /api/billing/checkout).
- [x] Implement Stripe Customer Portal redirect endpoint (POST /api/billing/portal).
- [x] Implement Stripe webhook handler (POST /api/billing/webhook):
  - [x] Signature verification.
  - [x] Idempotency (deduplicate by event ID).
  - [x] Handle: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, invoice.payment_failed.
  - [x] Update subscription + entitlement state in DB.
  - [x] Log all events to BillingEvent.
- [x] Entitlement enforcement:
  - [x] Server-side middleware/helper to check active entitlement for premium endpoints.
  - [x] Client-side hook/context for gating UI features.
  - [x] Desktop entitlement check on startup (IPC handler).
  - [x] Admin account bypasses entitlement gates.
- [x] Add tests for webhook handler logic and entitlement checks.
- [x] Validation screenshots in `.docs/validation/phase_3/`.

## Deliverables
- Stripe integration endpoints (checkout, portal, webhook).
- Prisma schema for subscriptions/entitlements/billing events.
- Entitlement enforcement on server, web client, and desktop.
- Tests passing.
- Validation screenshots.

## Validation checklist
- [x] All tasks complete
- [x] pnpm typecheck passes
- [x] pnpm test passes (web)
- [x] Webhook handler handles all required events
- [x] Entitlement gate blocks unauthorized access
- [x] Admin bypass works
- [x] Phase file ready to move to history
- [x] Phase review file created in history
- [x] Changes committed and pushed

## Risks / blockers
- Stripe API keys needed — use test keys via .env (not committed).
- Webhook testing requires Stripe CLI or mock events.

## Notes
- Requirements source: `.docs/planning/auth-and-subscriptions.md` section 6-7.
- Use Stripe test mode — no real charges.
