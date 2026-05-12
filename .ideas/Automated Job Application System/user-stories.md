# User Stories — Automated Job Application System

## Job Seeker (primary user)
- As a job seeker, I want to upload my master resume once and have the system version-manage it so I can refine over time without losing prior versions.
- As a job seeker, I want a cycle wizard that walks me through flags (category, location, salary, seniority, etc.) so I can configure a search without writing a query string.
- As a job seeker, I want to pick which platforms a cycle targets so I can scope effort to where I trust the response rate.
- As a job seeker, I want to set per-tier count caps (e.g. 10 exact-match, 30 partial-match, 20 corollary) so I control the total cycle budget.
- As a job seeker, I want the system to surface tier 1 jobs first so my best-match drafts get my attention first.
- As a job seeker, I want a side-by-side diff of master vs. tailored resume so I can confirm nothing was fabricated.
- As a job seeker, I want to approve / edit / skip / reject each draft before submission so I stay in the loop.
- As a job seeker, I want full-auto mode for cycles where I've already validated the draft quality and want to scale up.
- As a job seeker, I want to pause a running cycle if I need to reconfigure or if I've gotten enough responses.
- As a job seeker, I want to see per-tier and per-platform response rates so I can optimize future cycles.
- As a job seeker, I want to update my master resume mid-cycle and have subsequent drafts use the new version.

## Power User / Claude Code User
- As a power user, I want a `/job-cycle` slash command to launch cycles from the terminal so I don't have to leave my editor.
- As a power user, I want to define cycle templates I can re-run later with one command.

## Reviewer (the user, in review-queue mode)
- As a reviewer, I want bulk-approve actions (e.g. "approve all tier-1 with confidence > 0.8") so I can move through high-confidence drafts efficiently.
- As a reviewer, I want to skip-and-defer drafts for a later session without losing them.
- As a reviewer, I want to reject drafts in a way that tells the system "don't show me jobs like this again" (rejection signals).

## Analytics consumer (the user, post-cycle)
- As an analytics user, I want to see which flags correlate with higher response rates so I can refine my criteria.
- As an analytics user, I want to see which platforms have the best ROI of my cycle budget.
- As an analytics user, I want to compare cycles over time to see if my master-resume revisions are working.

## ToS / Anti-Spam Concerns (the user, as platform citizen)
- As a user, I want pacing controls so I don't trigger platform spam detection.
- As a user, I want clear notification when a platform needs 2FA / captcha so I can step in manually.
- As a user, I want to know exactly what was submitted on my behalf so if a platform asks, I have a record.

## Anti-personas (people the system must NOT serve well)
- Users who want to fabricate experience to match a job — system constraint: tailored resume can only re-emphasize what's in master; never invent.
- Users who want to spam-apply at superhuman pace — pacing layer enforces human-rate limits.
- Users who want to impersonate someone else — auth flow + per-platform login = user's own credentials only.
