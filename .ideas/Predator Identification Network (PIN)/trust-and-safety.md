# Trust & Safety — Predator Identification Network (PIN)

## Guiding principles
1. **Zero tolerance for doxing innocent parties.** The AI cross-confirmation gate is the single highest-priority correctness control. False positives in listings are the most damaging failure mode of the entire platform.
2. **Auditable everything.** Every status transition, every payout, every moderation action stores actor, timestamp, reason, and evidence references.
3. **No real-world coordination.** v1 has no DMs, no event planning, no contact info on profile pages. Phase-2 only with formal law-enforcement liaison framework.
4. **Transparent over discretionary.** Where possible, T&S rules are codified in formula, automation, or explicit policy — not in case-by-case staff discretion.

## Pre-Publish Controls

### AI cross-confirmation pipeline
- All submissions pass through the AI gate.
- Verdicts: `pass` / `needs_human_review` / `reject`.
- Logged: fetched sources, citations, confidence score, AI reasoning, run timestamp.
- Reviewers cannot override a `reject` verdict without supplying additional independent corroborating evidence — the system requires the new evidence be re-evaluated by the pipeline before re-considering.

### Reviewer queue
- `needs_human_review` items are routed to weighted-role reviewers.
- Reviewers see the full AI pipeline output and can request additional evidence from the submitter before deciding.
- Reviewer decisions are logged with reason and timestamp.

### Source quality controls
- Court records, government registries, and major-outlet news articles weigh higher than personal blogs or social media.
- AI pipeline tags each source with a quality tier.
- A submission cannot reach `pass` on social-media sources alone — there must be at least one Tier-1 source (court, government registry, or major outlet).

## Post-Publish Controls

### Status transition controls
- Status `POST_CONVICTION` requires a `legal_representative` or `expert` actor or a court-record evidence item with conviction date and case number.
- Status `CLEARED` is final unless overturned by a new submission that re-runs the full pipeline.
- All status transitions create a `PredatorStatusEvent` audit row.

### Dispute flow
- Subject of listing can file a dispute with verified identity proof.
- Dispute is reviewed by weighted-role reviewers, not the original submitter.
- If review is contested, escalation to external review board.
- During review, no commenting or new evidence can be added to the public profile (frozen state).
- Decision outcomes: `accepted` (status → `CLEARED`), `rejected` (status unchanged), or `escalated_to_board`.

### DMCA takedown flow
- Public form for DMCA notices.
- Content removed within SLA on valid notice.
- Notice forwarded to original poster.
- Counter-notice flow restores content after statutory waiting period if no suit filed.

### Mis-attribution control
- A poacher can only claim contributor credit on submissions they actually submitted.
- A group can only claim group-level credit on submissions made through the group workspace.
- The audit log enforces this at write-time, not by trust.

## Anti-Gaming Controls

### Submission gaming
- Strike system: rejected or overturned submissions count against the submitter.
- Repeated bad submissions escalate to suspension and account closure.
- Submitters cannot stuff the corroboration step with their own sock-puppet sources — "independent" in the AI pipeline means a source the submitter did not provide.

### Engagement gaming
- Sitewide distribution formula caps per-poacher share in the first 90 days.
- Engagement from young accounts (under N days old) is discounted.
- Statistical anomaly detection on view/comment patterns; flagged for review.
- Revenue claw-back applies for the implicated period.

### Comment / brigading gaming
- Comments rate-limited per user.
- Comments on predator profiles moderated.
- Brigading patterns (sudden volume spikes from disconnected accounts) flagged and reviewed.

## User Reporting
- Every public surface has a report flow:
  - Reporting a predator profile (mis-listing claim → enters dispute flow if from the subject).
  - Reporting a comment (harassment, threats, doxing → moderation queue).
  - Reporting a content item (DMCA, ToS violation → respective queue).
  - Reporting a poacher / group (bad-faith pattern → strike review queue).
- Reports themselves are tracked; abusive reporting (mass-flagging) is also a strike-able offense.

## Moderation Org

### Roles
- Platform moderators (paid staff): triage queue, enforce ToS, issue strikes, process disputes.
- Weighted-role reviewers (community): handle `needs_human_review` submissions in their domain.
- External review board (advisory, contractor): handles escalated disputes, issues binding recommendations.

### Staffing scale gates
- v1 private beta: 1-2 moderators.
- Public launch: 3-5 moderators + the weighted-role reviewer community + advisory board.
- Scale beyond: capacity-based hiring; submission throughput dictates moderator headcount.

## Transparency

### Public transparency report (annual or more frequent)
- Submissions received / approved / rejected.
- Disputes received / resolved by outcome.
- Strikes issued.
- DMCA takedowns received / processed.
- Distribution pool totals + (aggregated, non-identifying) payout distribution.
- Government / law-enforcement requests received and how they were handled.

### Per-user audit log
- Every user can see their own submission history, strike history, dispute history, and (for poachers) payout history with formula inputs.

## Safety Red Lines

### Things the platform will refuse to do
- List a person on the basis of social-media sources alone.
- Provide contact information for any listed person.
- Facilitate DMs or other off-platform contact between any two users in v1.
- Operate without a clearly-published dispute and takedown mechanism.
- Allow a person who was successfully `CLEARED` to be re-listed without a new pipeline run on new evidence.

### Things the platform will refuse to enable
- Real-world coordination or vigilante action.
- Bounty / contract systems for catching predators.
- Crowdsourced harassment campaigns.
