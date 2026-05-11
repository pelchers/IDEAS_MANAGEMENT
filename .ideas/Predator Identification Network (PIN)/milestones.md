# Milestones — Predator Identification Network (PIN)

## Pre-build: Legal & Brand
- [ ] Legal review of hosting posture across target jurisdictions (US first, then UK / CA / AU). Defamation, privacy, harassment, and Section-230-equivalent positions documented.
- [ ] ToS draft (YouTube-style poster-responsibility framing) reviewed by counsel.
- [ ] DMCA agent registration.
- [ ] Trademark search (USPTO TESS for PIN + "Predator Identification Network" in classes 35 / 41 / 42; international classes as needed).
- [ ] Domain selection + acquisition. (Not started — placeholder during planning.)
- [ ] Payment processor risk-review with Stripe — confirm category eligibility before building Connect flows.

## Milestone 1 — Identity & Roles
- [ ] Auth integration (Clerk or equivalent).
- [ ] Role assignment + per-role verification flows (experts, journalists, legal reps, poachers).
- [ ] Strike system data model + reviewer surface.

## Milestone 2 — Submission & AI Gate
- [ ] Submission form + draft persistence.
- [ ] AI cross-confirmation pipeline: source intake → fetch → corroboration → AI evaluation → verdict.
- [ ] Reviewer queue for `needs_human_review` submissions, prioritized by AI confidence.
- [ ] Submission rejection feedback loop with reason and resubmission path.
- [ ] Audit log: every status transition stored as a `PredatorStatusEvent`.

## Milestone 3 — Public Registry
- [ ] Predator explore page with filters + search.
- [ ] Predator profile page with status timeline, evidence, contributors, subscribe-for-updates.
- [ ] Subject-of-listing dispute flow.

## Milestone 4 — Poachers & Groups
- [ ] Independent poacher profile pages + stats.
- [ ] Group creation + member roles + revenue split agreement.
- [ ] Group workspace: document vault, shared case workbench.
- [ ] Group explore page with stats.

## Milestone 5 — Content Library
- [ ] Content publishing flow with free/premium tier choice.
- [ ] Searchable + filterable content page.
- [ ] Sitewide-pool opt-in for premium content.

## Milestone 6 — Subscriptions & Payouts
- [ ] Stripe Subscriptions integration for per-poacher + sitewide tiers.
- [ ] Stripe Connect Express onboarding for poachers + groups.
- [ ] Monthly distribution job for sitewide pool with engagement-weighted formula.
- [ ] Public payout breakdown view for each participating poacher.

## Milestone 7 — Trust & Safety
- [ ] DMCA takedown + counter-notice flow.
- [ ] Moderation queue for media uploads.
- [ ] External review board framework (advisory, not internal staff).

## Milestone 8 — Private Beta → Public Launch
- [ ] Closed beta with hand-picked poachers + experts.
- [ ] Exercise takedown flow at least once during beta to validate.
- [ ] Public launch gate: legal sign-off + processor sign-off + at least one exercised dispute resolution on record.

## Deferred / Phase 2
- [ ] Anonymous tip lines with law-enforcement liaison framework.
- [ ] Native mobile apps.
- [ ] International expansion beyond initial four-country footprint.
- [ ] In-platform civil-suit assistance.
