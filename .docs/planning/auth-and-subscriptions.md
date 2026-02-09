# Authentication and Subscriptions Plan

## 1. Requirements
- Roll-your-own authentication.
- Subscription gating for both web and desktop clients.
- One admin account/key with unrestricted access for internal testing.

## 2. Data Model (Initial)
- `users`
- `credentials` (password hash metadata)
- `sessions`
- `refresh_tokens`
- `subscriptions`
- `entitlements`
- `billing_events`
- `admin_accounts`
- `audit_logs`

## 3. Auth Flows
- Sign up: email + password -> verification -> active account.
- Sign in: credential validation -> session + refresh token issuance.
- Refresh: rotate refresh token, invalidate prior token chain segment.
- Password reset: tokenized reset flow with revocation of active sessions.

## 4. Authorization
- Role baseline: `admin`, `user`.
- Feature gates tied to entitlement checks.
- All mutations validated server-side regardless of client state.

## 5. Desktop Enforcement
- Desktop requires login before workspace access.
- Startup checks active entitlement.
- Admin account bypasses paid feature gates.
- Offline grace window configurable for subscribed users.

## 6. Billing Integration
- Stripe Checkout/Customer Portal for lifecycle.
- Webhooks drive subscription state machine updates.
- Reconciliation job ensures DB and Stripe consistency.

## 7. Security Notes
- Argon2id password hashing.
- HttpOnly + Secure cookies for web sessions.
- Device/session revocation support.
- Full audit log for auth and billing state changes.
