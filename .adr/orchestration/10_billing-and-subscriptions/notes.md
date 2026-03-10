# Notes — 10_billing-and-subscriptions

## Decisions
- D1: Own session — medium complexity (Stripe integration, webhook handling, entitlement logic)
- D2: Billing UI lives in settings page (not a separate page)
- D3: Test with Stripe test mode keys

## Constraints
- C1: Requires STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in .env
- C2: User provides test keys during hardening phase if not available now
