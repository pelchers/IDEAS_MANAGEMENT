# Technical Requirements — 10_billing-and-subscriptions

## Libraries
- stripe — already installed

## Key Files
- `apps/web/src/app/(authenticated)/settings/page.tsx` (billing section)
- `apps/web/src/app/api/billing/` (existing routes)

## Stripe Model
- Plans: FREE, PRO, TEAM
- Webhook events: checkout.session.completed, customer.subscription.updated/deleted
- Entitlements stored in PostgreSQL Entitlement table
