# Primary Task List — 10_billing-and-subscriptions

Session: Billing and Subscriptions
Started: 2026-03-10
Design Fidelity: Faithful (pass-1 brutalism-neobrutalism) for UI elements

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
