# Legal & ToS — Predator Identification Network (PIN)

## Hosting Posture

The platform operates as a **hosted-content service**, analogous to YouTube, Reddit, or other UGC platforms. The platform itself is not the author of any predator listing, content item, comment, or document upload. Every public claim is attributed to a specific poacher, group, or evidence source.

### Section 230 (US) framing
- The platform does not direct or originate user speech.
- The platform applies algorithmic and human moderation to prevent harm, but moderation activity itself is protected.
- The AI cross-confirmation gate is a safety control, not editorial authorship — it filters obviously unsupported submissions; it does not write or shape claims.
- The ToS makes the poster's role explicit ("You are the publisher of every post, document, video, and comment you submit. You are solely responsible for the legal status of that content.").

### International posture
- Per-jurisdiction legal review required before public availability in:
  - United States (Section 230 + state defamation law)
  - United Kingdom (Online Safety Act compliance + UK defamation law)
  - Canada (provincial defamation + Charter considerations)
  - Australia (defamation + eSafety Commissioner regime)
- Geofencing may be necessary in jurisdictions where the posture cannot be made defensible.

## ToS Outline

### Acceptance
- Affirmative checkbox at signup linking to the full ToS and Privacy Policy.
- Major ToS revisions require re-acceptance.

### Poster responsibility (core clause)
- "Every post, document upload, video, comment, predator submission, or other content item ('Content') you submit to the platform is published by you and is your sole responsibility. The platform hosts your Content. The platform is not the author or speaker of your Content. By submitting Content, you represent that you have the legal right to publish it and that publishing it does not violate any law or third-party right."

### Prohibited conduct
- Submitting false or fabricated evidence.
- Doxxing innocent parties.
- Coordinating real-world action against listed persons.
- Using the platform to harass any individual (listed or otherwise).
- Gaming the engagement-weighted distribution formula.
- Operating sock-puppet accounts to corroborate one's own submissions.

### Strike system
- First strike: warning.
- Second strike: temporary submission suspension (30 days).
- Third strike: permanent account closure for submission/poacher roles.
- Strikes for engagement-gaming: revenue claw-back for the implicated period + warning, then escalation per the same scale.

### Listed-person rights
- Anyone listed on the platform has a right to file a dispute with verified identity.
- Disputes are reviewed by weighted-role reviewers; contested decisions escalate to an external review board.
- A successful dispute results in status transition to `CLEARED` and the predator is removed from the public explore page.
- A successful dispute also results in strike(s) against the original submitter(s) if bad faith is found.

## DMCA Flow
- DMCA agent registered with the US Copyright Office.
- Public takedown form accepts: identification of the copyrighted work, identification of the infringing material on the platform, good-faith statement, perjury statement, contact info.
- Content removed within an SLA after a valid notice.
- Notice forwarded to the original poster.
- Counter-notice flow available to the poster; if filed, the material may be restored after the statutory waiting period unless the claimant has filed suit.

## Privacy Policy (sketch)
- Data collected: account info, identity-verification documents, payment info via Stripe, content submissions, engagement metrics.
- Data retention: identity-verification documents retained for the lifetime of the account + N years for legal hold; revocable on account closure subject to legal-hold exceptions.
- Data sharing: never sold; shared with processors (Stripe, hosting, AI APIs) under DPAs; shared with law enforcement on valid legal process.
- User rights: access, correction, deletion (subject to legal-hold), portability, processor restriction.

## Operational requirements
- Designated DMCA agent registered.
- Designated trust-and-safety contact.
- Annual transparency report (takedowns received, disputes filed, status transitions, strikes issued, payouts).
- Logged audit trail for every status transition, every payout, every dispute decision.

## Open legal questions
- US state-level defamation variation — does a uniform-posture ToS hold up in every state, or do per-state addenda need to apply?
- Stripe / processor sign-off — what platform safety controls do they want before accepting the category?
- UK Online Safety Act — does the platform's content qualify as "illegal harms" under that regime, and what reporting obligations attach?
- Right-to-be-forgotten requests in EU / UK — how do those reconcile with a public registry?
