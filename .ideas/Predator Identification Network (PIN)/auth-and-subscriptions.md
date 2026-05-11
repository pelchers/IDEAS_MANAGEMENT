# Auth & Subscriptions — Predator Identification Network (PIN)

## Auth

### Provider
- Clerk (or equivalent OIDC provider with multi-role + organization-style group support).

### Account model
- One canonical `User` per email.
- `User.roles` is an array; one user can hold multiple verified roles.
- Each role has its own verification state stored under `User.verifications[role]`.

### Roles & verification
| Role | Verification depth | Notes |
|---|---|---|
| `general_user` | None | Default on signup |
| `poacher_independent` | Government ID + selfie + (optional) social-history check | Required before any submission can be made |
| `poacher_group_member` | Same as `poacher_independent` | Group membership is a separate `GroupMember` record |
| `expert` | Credential verification + (optional) reference check | Field of expertise stored; review authority weighted in that field |
| `journalist` | Outlet verification + press credential check | Carries weighted corroboration value for the AI gate |
| `legal_representative` | Bar verification | Can apply status transitions like `POST_CONVICTION` |
| `politician` | Public-office verification | Display-only verified badge; no submission authority |
| `content_creator` | None beyond `general_user` | Content monetization without submission authority |
| `law_enforcement_liaison` | Deferred | Phase-2 only with formal framework |

### Identity safety
- Identity-verification documents are stored in private blob storage, never publicly visible.
- Identity proof for disputants (subject-of-listing) is held confidentially during review and not exposed in the public dispute resolution record.

## Subscriptions

### Tiers
1. **Per-Poacher** — monthly fee paid to a specific poacher (individual or group); unlocks that poacher's premium content.
2. **Sitewide** — larger monthly fee; unlocks premium content from every poacher/group that opts into the sitewide pool. Revenue is pooled and distributed monthly.

### Stripe integration
- Stripe Subscriptions for the recurring charge.
- Stripe Connect Express for poacher/group payouts.
- Per-poacher subscription revenue flows directly to the target's Connect account, minus platform fee.
- Sitewide subscription revenue accumulates in the platform's main balance during the period, then distributes monthly via `RevenuePayout` records.

### Sitewide distribution formula (v1, configurable)
- **Inputs per opted-in poacher in the period:**
  - subscriber content views (weighted heavier than non-subscriber views)
  - watch time on video content
  - engagement on comments/discussion (subscriber-authored counted, then filtered for anti-gaming)
  - novel-predator submissions accepted in the period (small fixed bounty)
- **Anti-gaming:**
  - Per-poacher cap of X% of the pool in the first 90 days of participation.
  - Minimum verification level required to be eligible (must be at least `poacher_independent` verified).
  - Engagement sources from accounts younger than N days are discounted.
- **Output:** percentage of the period's sitewide pool, computed from the public formula. Inputs and computed share stored on each `RevenuePayout` row for reproducibility.

### Subscriber experience
- Subscribers see, on every premium content item, which subscription tier unlocks it.
- Subscribers can cancel at any time via the Stripe billing portal; access continues through the end of the billed period.
- Subscribers can see (on their own account) which poachers they support, total spend, and (for sitewide subscribers) which poachers received a payout share from their subscription that period.

### Poacher experience
- Poachers see their monthly payout breakdown with formula inputs.
- Poachers see their subscriber count (per-poacher + sitewide attribution share).
- Poachers can opt out of the sitewide pool — in which case their premium content is only unlocked by per-poacher subscribers.

### Group experience
- Groups have a `revenueSplit` map across members.
- Group revenue (per-poacher subscriptions and sitewide payouts) is distributed to members per that map.
- Members can audit the group's payout history.

### Refunds & disputes
- Refunds for subscription disputes follow Stripe's standard flow.
- If a subscription is refunded, the corresponding sitewide payout (already paid to poachers) is reconciled against the next period's pool.

### ToS surface
- Subscriber ToS explains the sitewide distribution model in plain language and links to the formula docs.
- Poacher onboarding ToS explains the anti-gaming rules and how violations result in strikes or removal.
