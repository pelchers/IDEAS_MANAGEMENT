# Risks & Decisions — Automated Job Application System

## Risks

### R1 — Platform ToS bans / account suspension
- **Risk:** LinkedIn especially aggressively bans automation; Indeed and others enforce ToS that prohibit automated submission.
- **Mitigation:**
  - Conservative pacing (human-rate, jitter, per-platform cooldowns).
  - User-credential model (we never act as a non-user; the user's own session is what submits).
  - 2FA / captcha events surface as user notifications, never bypassed.
  - Optional disclosed user-agent / "applied via assistant" disclaimer where ToS allows.
  - Per-platform connector kill-switches if a platform shifts policy.
- **Severity:** Highest. Existential for the LinkedIn and Indeed paths.

### R2 — Resume tailoring fabrication
- **Risk:** AI tailoring invents experience, dates, or skills not in the master resume.
- **Mitigation:**
  - Hard constraint: tailored resume can only contain facts present in master.
  - Validation pass post-generation: every claim in tailored must match master.
  - Side-by-side diff in review queue forces user verification.
  - Confidence score threshold gates auto-mode.
- **Severity:** Highest. Single fabrication incident = lawsuit potential + user reputation damage.

### R3 — Quality drift at scale
- **Risk:** As cycle volume grows, draft quality degrades and response rates fall.
- **Mitigation:**
  - Tier structure isolates the highest-quality drafts at the top of the queue.
  - User edits feed back into a per-user style/quality signal.
  - Per-cycle and per-tier response rate analytics let users see drift early.
- **Severity:** Medium.

### R4 — Captcha / 2FA gates blocking automation
- **Risk:** Platforms add friction that breaks automated submission.
- **Mitigation:**
  - Plan for these as part of v1, not an afterthought.
  - User-notification pause flow.
  - No captcha-bypass attempts (banned by ToS and ethically dubious).
- **Severity:** Medium. More a slowdown than a stopper.

### R5 — ATS black-listing for repetitive patterns
- **Risk:** ATS systems (e.g. Workday) flag accounts that submit suspiciously similar resumes across many companies.
- **Mitigation:**
  - Per-application resume tailoring breaks template fingerprints.
  - Pacing per ATS, not just per platform.
- **Severity:** Medium.

### R6 — Recruiter / employer perception
- **Risk:** "I applied via an AI bot" becomes a negative signal in the market.
- **Mitigation:**
  - Default to manual review mode (the user is the author of every submission).
  - Quality-first messaging: this is a "tailor every application" tool, not a "spam apply" tool.
  - Conservative defaults on cycle counts.
- **Severity:** Medium.

### R7 — Privacy / data security
- **Risk:** Master resumes are PII; leak would be catastrophic.
- **Mitigation:**
  - Private blob storage with encryption at rest.
  - Per-platform credentials encrypted at rest.
  - Strict access controls; no third-party AI training on user data.
  - Clear deletion policy.
- **Severity:** High.

### R8 — AI cost at scale
- **Risk:** Per-application AI drafting (tailoring + cover letter + screening answers) is expensive; high-cycle users could be unprofitable on the free tier.
- **Mitigation:**
  - Tier 1 / 2 / 3 caps inherently limit per-user cost.
  - Caching of partial drafts where templates repeat (cover letter shells, common screening questions).
  - Pricing tiers reflect per-cycle AI cost.
- **Severity:** Medium.

### R9 — Match-scoring miscalibration
- **Risk:** Tier placement is wrong — exact matches get placed in tier 2, or weak matches sneak into tier 1.
- **Mitigation:**
  - User-configurable tier thresholds.
  - Spot-check tier placement in private beta.
  - Per-criterion impact analytics reveal calibration issues.
- **Severity:** Medium.

### R10 — Corollary-area mapping quality
- **Risk:** Tier 3 "adjacent job title" mapping is wrong (e.g. it puts "data scientist" jobs in front of a backend engineer who has no DS background).
- **Mitigation:**
  - Curated role-family mappings, not just embedding-based.
  - User can disable tier 3 entirely for a cycle.
  - Rejection signals feed back into mapping over time.
- **Severity:** Medium.

## Decisions (initial)

### D1 — Tiered cycle as the core structure
- **Decision:** Every cycle runs in three explicit tiers (exact → partial → corollary) with per-tier count caps.
- **Why:** This is the structural innovation; without it, the product is just another auto-applier.
- **Status:** Confirmed.

### D2 — Master resume + per-job tailoring, no fabrication
- **Decision:** Master resume is the single source of truth; per-application tailoring can re-emphasize but never invent.
- **Why:** Legal, ethical, and brand-protective. One fabrication incident kills the product.
- **Status:** Hard constraint.

### D3 — Review-first by default
- **Decision:** Manual review mode is the default; full-auto is opt-in per cycle and gated by a confidence threshold.
- **Why:** Trust must be earned cycle by cycle; users won't tolerate surprises.
- **Status:** Confirmed.

### D4 — User-credential model only
- **Decision:** The system uses the user's own platform credentials (LinkedIn login, Indeed login, etc.); it never acts on behalf of a non-user.
- **Why:** Ethical, ToS-defensible, and aligns the per-platform pacing limits with the actual user.
- **Status:** Hard constraint.

### D5 — Human-paced submission
- **Decision:** All submissions go through a pacing queue with per-platform rate limits and random jitter; no bursting.
- **Why:** ToS compliance + ATS black-list avoidance + better submission outcomes than burst spam.
- **Status:** Hard constraint.

### D6 — API-first connector strategy
- **Decision:** Greenhouse + Lever (API) ship first; Playwright connectors (LinkedIn etc.) ship second.
- **Why:** API connectors are more reliable, less ToS-fraught, and easier to validate before tackling the harder browser-automation surfaces.
- **Status:** Confirmed.

### D7 — Web-first, no native mobile in v1
- **Decision:** Web UI only; native apps deferred.
- **Why:** Job application workflows are desktop-heavy; native gives little leverage at this stage.
- **Status:** Confirmed for v1.

### D8 — Domain not selected
- **Status:** Open. Trademark + domain availability check required before brand-lock.
