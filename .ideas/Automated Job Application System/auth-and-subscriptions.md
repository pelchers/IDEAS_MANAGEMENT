# Auth & Subscriptions — Automated Job Application System

## Auth

### Platform auth (our app)
- One account per user via Clerk or NextAuth.
- Email-verified.
- Standard OAuth providers (Google, GitHub) acceptable for v1.

### Per-platform auth (LinkedIn, Indeed, etc.)
- The system uses the **user's own credentials** to interact with each external platform.
- Login flow per platform:
  - User clicks "Connect LinkedIn" → opens a Playwright-controlled login window inside our domain → user logs in normally (including 2FA) → session cookies captured + encrypted at rest.
  - Session refresh handled silently when possible; re-login prompted when the session expires.
- 2FA / captcha events surface as user notifications — the cycle pauses, the user steps in, the cycle resumes.
- Per-platform credentials are NEVER shared with AI or third parties; they exist only on our infra encrypted at rest.

## Subscription Tiers (proposed for v1)

### Free Tier
- Master resume management + 1 version retained.
- 1 cycle per month.
- Tier 1 only (exact match), cap 5 applications per cycle.
- Manual review only (no auto mode).
- 1 platform per cycle.

### Pro Tier — $X/mo
- Unlimited resume versions.
- 4 cycles per month.
- All tiers (exact + partial + corollary), per-tier caps up to 25 / 50 / 25.
- Manual + auto review modes.
- Up to 3 platforms per cycle.
- Full analytics.

### Power Tier — $Y/mo
- Unlimited cycles.
- Per-tier caps up to 50 / 100 / 50.
- All platforms.
- API access for power users (slash command, scripting).
- Priority queue processing.
- Premium support.

### Pricing Strategy
- AI cost scales with cycle volume; pricing tiers must cover per-cycle AI cost.
- Free tier exists to demonstrate value; the master resume + 1 cycle should be enough to feel the value.
- Power tier targets active job-search users (typically 3-month engagement bursts).

## Payment Processor
- Stripe Subscriptions.
- Standard Stripe Billing Portal for self-service tier changes, cancellation.

## Refunds & Disputes
- Standard Stripe-handled refunds.
- "Last cycle didn't deliver responses" is NOT a refund condition (response rates depend on market, resume, criteria — outside our direct control).
- "AI tailored my resume with fabricated experience" IS a refund + apology + free-tier-credit response (and should never happen given the no-fabrication constraint).

## Data Retention
- Master resume + tailored variants retained for the account lifetime.
- Application drafts retained for the account lifetime (the user's own records).
- Application audit log (what was submitted, when, to whom) retained for the account lifetime.
- Per-platform credentials retained encrypted while the connection is active; deleted on disconnect or account closure.

## User Rights
- Account deletion: full data wipe (subject to any legal-hold exceptions for active disputes).
- Data export: all drafts, applications, master resume versions, application audit log.
- Connection revocation: per-platform disconnect button removes our access immediately.
