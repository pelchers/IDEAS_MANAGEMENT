# Technical Specification — Automated Job Application System

## Stack (proposed)
- **Frontend**: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui.
- **Backend**: Next.js server actions + API routes; Prisma ORM.
- **Database**: PostgreSQL (managed — Neon or equivalent).
- **Auth**: Clerk or NextAuth.
- **Storage**: Vercel Blob (private) for resumes (master + tailored variants), cover letters, screenshots of submission confirmations.
- **Job Discovery**: per-platform connector modules — mix of API (where allowed) and Playwright browser automation (where required).
- **Submission Engine**: Playwright for ATS form-fill; direct API for Greenhouse / Lever public endpoints; queued via a background worker.
- **Queue / Workers**: Vercel Queues (or a persistent worker queue) for cycle execution, discovery, drafting, and submission.
- **AI**: Claude API for resume tailoring, cover-letter drafting, screening-question answering, match scoring.
- **Hosting**: Vercel (Fluid Compute).

## Domain Models (draft)

### `User`
| field | type | notes |
|---|---|---|
| `id` | cuid | |
| `email` | string | unique |
| `displayName` | string | |
| `createdAt` | datetime | |

### `Resume`
Master + version history.
| field | type | notes |
|---|---|---|
| `id` | cuid | |
| `userId` | fk User | |
| `version` | int | monotonic per user |
| `isMaster` | bool | only one master at a time per user; others are historic |
| `sourceFormat` | enum | `pdf`, `docx`, `json` |
| `blobKey` | string | original upload |
| `structured` | json | parsed structured representation |
| `createdAt` | datetime | |

### `Cycle`
A single application run.
| field | type | notes |
|---|---|---|
| `id` | cuid | |
| `userId` | fk User | |
| `name` | string | user-friendly |
| `flags` | json | search criteria |
| `platforms` | string[] | selected platforms |
| `tier1Cap` | int | exact-match count cap |
| `tier2Cap` | int | partial-match count cap |
| `tier3Cap` | int | corollary-area count cap |
| `reviewMode` | enum | `manual`, `auto` |
| `autoConfidenceThreshold` | float | only used when `auto` |
| `pacingPerHourPerPlatform` | int | rate limit |
| `status` | enum | `draft`, `running`, `paused`, `completed`, `canceled` |
| `startedAt` | datetime | |
| `completedAt` | datetime | |
| `createdAt` | datetime | |

### `JobPosting`
Discovered, normalized posting.
| field | type | notes |
|---|---|---|
| `id` | cuid | |
| `cycleId` | fk Cycle | |
| `platform` | string | source |
| `externalId` | string | platform's own ID |
| `dedupeKey` | string | for cross-platform de-dup |
| `title` | string | |
| `company` | string | |
| `location` | string | |
| `remote` | enum | `remote`, `hybrid`, `onsite` |
| `salaryMin` | int | nullable |
| `salaryMax` | int | nullable |
| `currency` | string | |
| `postedAt` | datetime | |
| `description` | text | |
| `applyUrl` | string | |
| `atsType` | enum | `greenhouse`, `lever`, `workday`, `linkedin_easy`, `indeed_easy`, `external_redirect`, `unknown` |
| `formSchema` | json | nullable; cached field schema for form-fill |
| `matchScore` | float | computed |
| `tier` | enum | `tier_1`, `tier_2`, `tier_3` |
| `createdAt` | datetime | |

### `Application`
A single application draft + submission.
| field | type | notes |
|---|---|---|
| `id` | cuid | |
| `userId` | fk User | |
| `cycleId` | fk Cycle | |
| `jobPostingId` | fk JobPosting | |
| `tailoredResumeBlobKey` | string | |
| `tailoredResumeStructured` | json | for diff vs. master |
| `coverLetterText` | text | |
| `screeningAnswers` | json | `[{ question, answer }]` |
| `aiConfidence` | float | drafting confidence score |
| `status` | enum | `drafted`, `awaiting_review`, `approved`, `submitted`, `failed`, `skipped`, `rejected_by_user` |
| `submittedAt` | datetime | nullable |
| `submissionConfirmation` | json | platform's confirmation payload or screenshot ref |
| `responseStatus` | enum | `no_response`, `acknowledged`, `screening`, `interview`, `offer`, `rejected_by_employer` |
| `lastResponseAt` | datetime | nullable |
| `createdAt` | datetime | |

### `PlatformConnector`
Pluggable connector registration (data model, not table necessarily).
- `discover(flags) → JobPosting[]`
- `getFormSchema(applyUrl) → FormSchema`
- `submit(application) → SubmissionResult`
- `auth(user) → AuthState` (handles per-platform login state, 2FA pause)

### `UserPreferenceSignal`
Learned signal from rejected drafts (which job patterns to weight away from).
| field | type | notes |
|---|---|---|
| `id` | cuid | |
| `userId` | fk User | |
| `signalKind` | enum | `keyword`, `company`, `salary_below`, `seniority`, `location`, ... |
| `signalValue` | string | |
| `weight` | float | negative for "don't show me this" |
| `createdAt` | datetime | |

## AI Pipelines

### Resume Tailoring
1. Input: master resume (structured), job posting (description, requirements, keywords).
2. AI prompt: re-order / re-emphasize experience items, skills, summary; **never invent**.
3. Output: tailored structured resume + a diff vs. master.
4. Render tailored resume to PDF and DOCX.
5. Store both rendered files + structured representation.
6. Constraint check: every claim in tailored resume must be present in master resume (validation pass).

### Cover Letter Drafting
1. Input: master resume, job posting, user profile bio, optional user-supplied tone preferences.
2. AI prompt: draft a 250-400 word cover letter, role-specific opening, evidence from master resume, role-specific close.
3. Output: cover letter text + confidence score.

### Screening-Question Answering
1. Input: question, master resume, user profile bio.
2. AI prompt: answer factually from master resume; mark as "needs human input" if the question requires info not in master resume.
3. Output: answer text + confidence score + "needs human input" flag.

### Match Scoring
1. Input: flags + posting.
2. AI prompt: score each criterion match (0-1), output per-criterion scores + overall.
3. Threshold logic (deterministic, not AI): tier placement from criterion scores.

## Platform Connector Strategy

| Platform | API available? | v1 approach |
|---|---|---|
| LinkedIn | No public for "Easy Apply" automation | Playwright with conservative pacing + 2FA pause; explicit user-driven; respect ToS |
| Indeed | Limited | Playwright; rate-limited |
| ZipRecruiter | Limited | Playwright; rate-limited |
| Wellfound (AngelList) | Limited | Playwright; rate-limited |
| Greenhouse | Public job board API + structured ATS endpoints | API-first |
| Lever | Public job board API + structured ATS endpoints | API-first |
| Workday | No general public API | Playwright; complex; lower priority |
| Custom company sites | None | Playwright + per-site recipe |

## Anti-Spam / Pacing Architecture
- Each platform connector exposes a `paceConfig` (max requests per hour, min interval between submissions, jitter range).
- Server-side queue enforces pacing — submissions are scheduled, not bursted.
- Per-user, per-platform cooldown applies across cycles.
- User-facing dashboard shows "next submission window" countdown.

## Security
- Resumes contain PII — stored in private blob, never indexed publicly.
- Per-platform auth state (cookies, tokens) stored encrypted at rest.
- 2FA / captcha events surface as user notifications, never bypassed.
- All submissions are logged with the exact payload sent (for the user's records and dispute trail).

## Build Order (rough)
1. User + auth + master resume upload + parse.
2. Cycle config wizard + schema.
3. Match scoring (deterministic) + tier placement.
4. AI resume tailoring + cover letter drafting + screening-question answering.
5. Review queue UI.
6. Greenhouse + Lever connectors (API-first → easier first).
7. LinkedIn / Indeed connectors (Playwright; harder).
8. Submission engine + pacing queue.
9. Application log + analytics.
10. Workday + custom-site connectors (long-tail).
