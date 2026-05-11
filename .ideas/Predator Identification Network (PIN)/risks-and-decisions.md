# Risks & Decisions — Predator Identification Network (PIN)

## Risks

### R1 — Legal exposure (defamation / privacy / harassment)
- **Risk:** A listed person sues for defamation; a regulator pursues privacy claims; a jurisdiction holds the platform liable as publisher rather than host.
- **Mitigation:**
  - YouTube-style poster-responsibility ToS.
  - Documented DMCA + counter-notice flow.
  - Mis-listing dispute flow with verified-identity check and an external review board path.
  - No platform-authored claims — every claim is attributed to a poacher, group, or evidence source.
  - Legal review per launch jurisdiction (US, UK, CA, AU) before public exposure in each.
- **Severity:** High. Required to address before public launch.

### R2 — Weaponization by bad actors
- **Risk:** Bad actors submit fake or malicious predator records to harm innocent parties.
- **Mitigation:**
  - AI cross-confirmation gate (hard requirement — no public listing without it).
  - Multi-source corroboration check.
  - Strike system for rejected/overturned submissions.
  - Mis-listing dispute flow.
  - Role-weighted human review for borderline submissions.
- **Severity:** Highest. This is the single most important correctness constraint of the platform.

### R3 — Payment processor refusal
- **Risk:** Stripe or another processor declines the platform's category due to content sensitivity.
- **Mitigation:**
  - Pre-build risk review with Stripe — confirm category eligibility before building Connect flows.
  - Have a secondary processor identified as fallback (Adyen, Paddle, or a high-risk processor) but only if Stripe declines.
  - Clear platform safety controls, moderation, and dispute mechanisms in the application packet.
- **Severity:** High. Could block the revenue model entirely.

### R4 — Operational moderation load
- **Risk:** Submission and content volume outpaces the platform's ability to review, leading to bad listings staying up or good listings being delayed.
- **Mitigation:**
  - Heavy automation in the AI gate so only `needs_human_review` items hit reviewers.
  - Tiered review: weighted-role reviewers handle the queue, with the external board reserved for contested decisions only.
  - Capacity-based throttling on submission rate per user to avoid burst-flooding.
- **Severity:** Medium.

### R5 — Brigading / harassment of listed persons
- **Risk:** Listed predators (or even cleared individuals) attract harassment from the platform's audience.
- **Mitigation:**
  - Profile pages do not encourage contact (no addresses, no phone numbers, no real-time location).
  - Comments moderated; rate-limited; reportable.
  - Clear posture: platform is a registry, not a vigilante coordination tool.
  - v1 has no functionality that enables real-world coordination.
- **Severity:** High.

### R6 — Revenue distribution gaming
- **Risk:** Poachers game the engagement-weighted distribution formula via view-farms, sock-puppet engagement, etc.
- **Mitigation:**
  - Anti-gaming dampers (caps per period, minimum verification level, cohort-aware engagement scoring).
  - Distribution formula is transparent — manipulation patterns visible in monthly logs.
  - Strike system applies to engagement-gaming, not just submission-quality.
- **Severity:** Medium.

### R7 — Vigilantism off-platform
- **Risk:** Users coordinate real-world action against listed persons via off-platform channels they organized through the platform.
- **Mitigation:**
  - ToS explicitly prohibits using the platform to organize real-world action.
  - No DM system in v1 (deferred).
  - No real-world location data on profile pages.
- **Severity:** High.

### R8 — Brand / reputation
- **Risk:** Single high-profile mis-listing or harassment incident damages the brand's credibility permanently.
- **Mitigation:**
  - Hard anti-doxing gate.
  - Rapid takedown SLA.
  - Public transparency reports.
  - Conservative private-beta launch with hand-picked poachers + experts.
- **Severity:** High.

### R9 — Verification cost
- **Risk:** Role verification (especially expert / legal / journalist) is expensive or slow, limiting platform growth.
- **Mitigation:**
  - Tiered verification: low-friction general-user signup, deeper checks scaled to role authority.
  - Reuse existing verification rails where possible (credential authorities, bar associations, press IDs).
- **Severity:** Medium.

### R10 — AI gate false negatives
- **Risk:** AI rejects a legitimate submission, blocking it from publication.
- **Mitigation:**
  - `needs_human_review` is the safety valve — borderline cases go to weighted-role reviewers.
  - Submitter can resubmit with additional evidence.
  - AI run is fully logged so reviewers can audit the decision.
- **Severity:** Medium.

## Decisions (initial)

### D1 — Hosted-content posture (YouTube-style)
- **Decision:** The platform hosts user-published claims; the poster is the publisher and carries legal responsibility.
- **Why:** Aligns with Section 230 framing in the US and equivalent safe-harbor regimes elsewhere. Lets the platform scale without becoming the speaker.
- **Status:** Provisional. Requires per-jurisdiction legal sign-off.

### D2 — AI gate is non-bypassable
- **Decision:** No predator submission goes public without passing the AI cross-confirmation pipeline (auto-pass) or via a weighted-reviewer approval after the pipeline flags `needs_human_review`. There is no path to publish via raw user authority.
- **Why:** Anti-doxing is the platform's central correctness constraint; without this, the platform is just a weaponizable accusation board.
- **Status:** Hard constraint.

### D3 — Distribution formula is transparent and reproducible
- **Decision:** Every monthly sitewide-pool payout stores the full formula inputs and computed share. Poachers can audit their own payout.
- **Why:** Trust is the foundation of the revenue model; opaque distribution will lose poachers fast.
- **Status:** Hard constraint.

### D4 — No real-world coordination features in v1
- **Decision:** No DMs, no event planning, no location-sharing, no real-time alerts that include contact info.
- **Why:** Vigilantism risk; reputational risk; legal risk.
- **Status:** Hard constraint for v1; phase-2 reconsideration only with formal law-enforcement liaison framework.

### D5 — Multi-role identity
- **Decision:** A single user account can hold multiple verified roles; verification is per-role.
- **Why:** A real-world contributor may simultaneously be a journalist and an expert; modeling that as separate accounts creates fragmentation.
- **Status:** Confirmed.

### D6 — Stripe-first payments
- **Decision:** Stripe Subscriptions + Stripe Connect Express as the primary stack; secondary processor identified only if Stripe declines.
- **Why:** Best developer experience and platform-tier features (Connect for split payouts) at our scale.
- **Status:** Provisional pending processor risk-review.

### D7 — Web-first, no native mobile in v1
- **Decision:** Mobile-friendly responsive web only. Native iOS/Android deferred.
- **Why:** Native introduces app-store category gatekeeping (Apple, Google may reject the category), and the platform is reading- and document-heavy — web is the right substrate.
- **Status:** Confirmed for v1.

### D8 — Open / planned: domain
- **Decision:** No domain selected yet. Placeholder during planning. Trademark search and domain availability check must run before brand-lock.
- **Status:** Open.
