# Overview — Automated Job Application System

## Problem
Job seekers face a fundamentally asymmetric volume problem:

- Each application takes 15–45 minutes (custom resume tailoring, cover letter writing, screening-question answers, ATS form-fill).
- Each application has a low individual response rate.
- To beat the funnel math, applicants need volume; to get volume, they sacrifice tailoring quality; sacrificing quality further drops the response rate.

Existing "easy apply" features are crude (single-click but with zero tailoring), and existing AI tools tailor individual applications but don't automate the search → match → tailor → submit pipeline end-to-end. The user is still the bottleneck.

## Solution
**A flag-driven cycle engine** that:

1. Takes the user's search criteria as **flags** (category, location, posting date, salary, remote/hybrid/onsite, seniority, tech-stack keywords, company size, etc.).
2. Discovers jobs across **selected platforms** (LinkedIn, Indeed, ZipRecruiter, Wellfound, Greenhouse, Lever, Workday, others).
3. Runs each cycle in **three tiers with priority and count caps**:
   - **Tier 1 — Exact match**: jobs hitting all flags. Apply first, up to the tier-1 count cap.
   - **Tier 2 — Partial match**: descending criteria match-score. Fill the rest of the cycle budget.
   - **Tier 3 — Corollary area**: bulk-similar pass to adjacent job titles in the same domain.
4. For each application, tailors the user's **master resume** to the job posting (keyword emphasis, skill ordering, project surfacing) and drafts a job-specific cover letter + screening-question answers via AI.
5. Surfaces a **review queue** before submission (or full-auto mode for trusted cycles).
6. Submits via browser automation or ATS API.
7. Logs every application + response tracking.

## Why now
- AI is finally good enough at resume tailoring and cover-letter drafting that the per-application quality matches or exceeds the average human-tailored application — without fabricating experience.
- Playwright and ATS API ecosystems (Greenhouse, Lever, Workday-job-feeds) are mature enough to support reliable form-fill at scale.
- The job market has shifted to high-volume application norms; the asymmetry now favors applicants who can apply broadly with high tailoring fidelity.
- Master-resume version management is a tractable, well-understood problem (single source-of-truth document, derived per-application variants).

## High-level scope (v1)
- **Cycle config wizard**: flag selection, platform selection, per-tier count caps, review-mode (manual approve / full auto).
- **Job discovery engine**: per-platform crawlers/connectors that return job postings matching flags.
- **Match scoring**: per-job criteria match-score that places jobs in Tier 1 / 2 / 3.
- **Resume management**: master resume upload, version history, AI-tailoring per job.
- **Application drafting**: cover letter, screening-question answers, ATS form-fill.
- **Review queue**: approve / edit / skip / reject per draft.
- **Submission engine**: browser automation + ATS APIs.
- **Application log**: sent / pending / replied / rejected statuses; response-rate analytics per tier and per platform.

## Out of scope (v1)
- Direct outreach to recruiters (email/LinkedIn DM campaigns) — separate product surface.
- Mock interview practice — separate product surface.
- Salary negotiation assistance — phase 2.
- Native mobile apps — web-first.
- Multi-language / multi-region — English / US/Canada/UK first; expand later.

## Differentiators
- **Tiered cycle strategy**: the explicit tier 1 / 2 / 3 model is the structural innovation. Most tools either match exactly (low volume) or apply broadly (low quality); this one explicitly does both in order.
- **Master resume as living source of truth**: one document maintained over time, with per-application variants derived from it — instead of a static template.
- **Review-first by default**: full auto is opt-in per cycle; default mode keeps the user in the approval loop.
- **Multi-platform parallel cycles**: a cycle can target multiple platforms simultaneously; results unified in a single dashboard.
