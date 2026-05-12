# PRD — Automated Job Application System

## Goals (v1)
1. **End-to-end automation** from search criteria to submitted application across multiple platforms.
2. **Tiered cycle execution** (exact → partial → corollary) with explicit count caps per tier.
3. **Per-application resume tailoring** from a master resume, without fabricating experience.
4. **Review-first UX** as the default, with full-auto as an opt-in for trusted cycles.
5. **Defensible ToS posture**: rate-limited, human-paced, disclosed where required.

## Core Features

### 1. Cycle Configuration
- **Flags** (criteria the cycle matches against):
  - Category / job title keywords
  - Location (city / state / country / remote / hybrid / onsite)
  - Posting date window (e.g. last 24h, 7d, 30d)
  - Salary band (min / max / currency)
  - Seniority (intern / junior / mid / senior / staff / principal / lead / director / VP / C-suite)
  - Tech stack / skill keywords (required vs. preferred)
  - Company size (startup / SMB / mid-market / enterprise)
  - Company stage (seed / Series A-D / public)
  - Industry (technology / finance / healthcare / etc.)
  - Excluded keywords (e.g. exclude "sales" in eng-only cycle)
- **Platforms** (which sources to crawl this cycle):
  - LinkedIn, Indeed, ZipRecruiter, Wellfound, Greenhouse, Lever, Workday, custom feeds.
- **Per-tier count caps**:
  - Tier 1 (exact match): cap N₁
  - Tier 2 (partial match): cap N₂
  - Tier 3 (corollary area): cap N₃
- **Review mode**:
  - `manual` (default): every draft enters review queue before send.
  - `auto`: drafts above a configurable confidence threshold auto-send.
- **Pacing**:
  - Per-platform rate limit (default conservative, e.g. 10/hour per platform).
  - Random jitter between sends.
- **Resume profile**:
  - Master resume version to draw from.
  - Optional per-cycle resume-emphasis bias (e.g. "lean into ML/AI experience for this cycle").

### 2. Job Discovery Engine
- Per-platform connector returns job postings matching flags.
- Each posting is normalized to a canonical `JobPosting` record.
- Postings are deduped across platforms (same job often listed in multiple places).
- Postings retain platform-specific submission metadata (apply URL, ATS endpoint, form schema).

### 3. Match Scoring
- Per-job match score across all flags, weighted by user-set priority.
- Match-score thresholds determine tier placement:
  - **Tier 1** — meets ALL required flags + ≥ N% of preferred flags.
  - **Tier 2** — meets ALL required flags + < N% of preferred flags, OR meets ≥ M% of required flags.
  - **Tier 3** — corollary area (job title in adjacent role family) regardless of full criteria match.
- Tier thresholds are user-configurable.
- Each job's match-score and tier are stored for analytics.

### 4. Resume Management
- **Master Resume**:
  - User uploads (PDF, DOCX, or structured-JSON).
  - Parsed into a structured representation: header, summary, experience items, skills, projects, education, certifications.
  - Versioned — every save creates a new version; user can revert.
- **Per-Application Tailoring**:
  - Given a job posting and the master resume, AI produces a tailored variant:
    - Re-orders / re-emphasizes experience items relevant to the posting.
    - Re-orders / surfaces skills that match the posting's keyword set.
    - Reweights the professional summary to align with the role.
  - **Hard constraint: never fabricates experience, dates, employers, titles, or skills not in the master resume.**
  - Output: tailored resume in the same format as the master (PDF and/or DOCX).
- **Tailoring review**:
  - User sees a side-by-side diff (master vs. tailored) in the review queue.
  - Can accept, edit, or revert per section.

### 5. Application Drafting
- **Cover letter**: AI-drafted per job posting, drawing from master resume + posting + user profile bio.
- **Screening-question answers**: AI-drafted per question, sourced strictly from master resume facts.
- **ATS form-fill**: structured form fields auto-populated from master resume.
- **Custom fields**: user-added overrides for fields that recur across applications (e.g. "How did you hear about us?" → "LinkedIn search").

### 6. Review Queue
- Drafts appear in queue with: job posting, match score, tier, tailored resume diff, cover letter, screening answers.
- Actions per draft: **Approve** (send), **Edit** (modify draft), **Skip** (defer), **Reject** (don't send, learn from rejection).
- Bulk actions: approve-all-in-tier, skip-all-below-confidence.
- Rejected drafts feed a per-user preference model (which signals to weight more heavily in next cycle).

### 7. Submission Engine
- Browser automation (Playwright) for sites without API access.
- Direct API integration where available (Greenhouse, Lever public endpoints, etc.).
- 2FA / captcha handling: user notification + pause (no headless bypass attempts).
- Submission confirmation captured and logged.

### 8. Application Log & Analytics
- Per-application: cycle, platform, posting, tier, match score, sent date, status (sent / pending / interview / rejected / no-response), response date.
- Per-cycle summary: tier-level send count, response rate per tier, response rate per platform, time-to-response distribution.
- Per-criterion impact: which flags correlate with higher response rates (analytics surface).

### 9. UI Surface
- **Web app** (primary): cycle wizard, dashboard, review queue, application log, resume manager, analytics.
- **Optional Claude Code component**: slash command for power-users to launch cycles from the terminal.

## Non-Functional Requirements
- Every application's full draft (resume + cover letter + answers) stored for the user's records.
- Submission audit log: timestamp, platform, posting URL, what was submitted.
- Per-platform rate limiting enforced server-side.
- Pause / resume / cancel any in-flight cycle from the UI.

## Success Criteria (v1)
- Launch a cycle, have tier 1 / 2 / 3 jobs discovered, drafts produced, reviewed, and submitted successfully across at least 3 platforms.
- Response rate from tier 1 > tier 2 > tier 3 (validates tiering hypothesis).
- Master resume → tailored variant fidelity validated by user spot-checks: zero fabricated experience claims.
- No platform bans during private beta.
