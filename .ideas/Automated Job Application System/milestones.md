# Milestones — Automated Job Application System

## Pre-build: Legal & Platform Posture
- [ ] Review platform ToS for each target platform (LinkedIn, Indeed, ZipRecruiter, Wellfound, Greenhouse, Lever, Workday). Document automation restrictions, user-agent disclosure requirements, and rate limits.
- [ ] Draft user ToS: clarify the platform applies on the user's behalf using the user's credentials; the user is responsible for what's submitted.
- [ ] Privacy review: master resume is PII; storage, encryption, retention, deletion.
- [ ] Domain selection (deferred — not blocking v0).

## Milestone 1 — Master Resume & Auth
- [ ] Auth integration.
- [ ] Master resume upload (PDF / DOCX / JSON).
- [ ] Resume parser → structured representation.
- [ ] Version history.
- [ ] Resume management UI (view, edit, version, set master).

## Milestone 2 — Cycle Config Wizard
- [ ] Flag definitions (category, location, posting date, salary, seniority, tech keywords, company size, etc.).
- [ ] Platform selector.
- [ ] Per-tier count caps.
- [ ] Review-mode selector (manual / auto).
- [ ] Pacing config (default conservative).
- [ ] Cycle status dashboard.

## Milestone 3 — Match Scoring & Tier Placement
- [ ] Deterministic match scoring algorithm.
- [ ] Tier thresholds (exact / partial / corollary).
- [ ] Corollary-area mapping (adjacent job titles per role family).
- [ ] Unit tests for tier placement edge cases.

## Milestone 4 — AI Drafting
- [ ] Resume tailoring pipeline (with no-fabrication validator).
- [ ] Cover letter drafting.
- [ ] Screening-question answering.
- [ ] Confidence scoring per draft.
- [ ] Diff renderer (master vs. tailored).

## Milestone 5 — Review Queue UI
- [ ] Draft list with tier / match / confidence.
- [ ] Per-draft approve / edit / skip / reject.
- [ ] Bulk actions.
- [ ] Rejection signal capture.

## Milestone 6 — API-First Connectors (Greenhouse, Lever)
- [ ] Greenhouse discovery + form-schema + submission.
- [ ] Lever discovery + form-schema + submission.
- [ ] Per-platform rate limiting in queue.

## Milestone 7 — Submission Engine & Pacing Queue
- [ ] Persistent worker queue with per-platform rate limits.
- [ ] Submission scheduler with random jitter.
- [ ] Submission audit log (full payload capture).
- [ ] Confirmation capture.

## Milestone 8 — Playwright Connectors (LinkedIn, Indeed, ZipRecruiter, Wellfound)
- [ ] Per-platform login state management (encrypted at rest).
- [ ] 2FA / captcha user-notification flow.
- [ ] LinkedIn Easy Apply connector.
- [ ] Indeed connector.
- [ ] ZipRecruiter connector.
- [ ] Wellfound connector.

## Milestone 9 — Analytics
- [ ] Per-cycle summary (tier-level send + response rates).
- [ ] Per-platform performance comparison.
- [ ] Per-criterion impact analysis.
- [ ] Time-to-response distribution.

## Milestone 10 — Private Beta → Public Launch
- [ ] Private beta with hand-picked job seekers.
- [ ] Validate response-rate hypothesis (tier 1 > tier 2 > tier 3).
- [ ] Zero fabricated-experience incidents in beta (hard gate).
- [ ] Zero platform bans.
- [ ] Public launch.

## Deferred / Phase 2
- [ ] Recruiter outreach (cold DM/email campaigns).
- [ ] Mock interview practice.
- [ ] Salary negotiation assistant.
- [ ] Workday connector (complex).
- [ ] Long-tail custom company-site connectors.
- [ ] Multi-language / international expansion.
- [ ] Native mobile apps.
