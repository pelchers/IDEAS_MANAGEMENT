# Technical Specification — Predator Identification Network (PIN)

## Stack (proposed)
- **Frontend**: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui. Web-first responsive; no native mobile in v1.
- **Backend**: Same Next.js app server actions + API routes; Prisma ORM.
- **Database**: PostgreSQL (Neon or equivalent managed provider).
- **Auth**: Clerk (multi-role + organization-style group support) or a similar OIDC-based provider.
- **Storage**: Vercel Blob (private + public storage tiers) for documents, videos, evidence packets.
- **Payments**: Stripe (Subscriptions + Connect for poacher payouts; Connect Express for groups acting as multi-member recipients).
- **AI Cross-Confirmation**: Claude API (Anthropic SDK) for source evaluation, with the heavy public-record-fetching layer running as background jobs via Vercel Queues or a worker queue.
- **Hosting**: Vercel (Fluid Compute default).

## Domain Models (draft)

### `User`
| field | type | notes |
|---|---|---|
| `id` | cuid | |
| `email` | string | unique |
| `displayName` | string | |
| `bio` | text | optional |
| `avatarUrl` | string | optional |
| `roles` | enum[] | one or more of `general_user`, `poacher_independent`, `poacher_group_member`, `expert`, `journalist`, `legal_representative`, `politician`, `content_creator` |
| `verifications` | json | per-role verification status (e.g. `{ expert: { verified: true, credentialUrl, verifiedAt } }`) |
| `strikes` | int | counter for rejected/overturned submissions |
| `createdAt` | datetime | |

### `Group`
| field | type | notes |
|---|---|---|
| `id` | cuid | |
| `name` | string | |
| `slug` | string | unique |
| `description` | text | |
| `avatarUrl` | string | |
| `visibility` | enum | `public`, `private` |
| `revenueSplit` | json | per-member percentage map for sitewide-pool payouts |
| `createdAt` | datetime | |

### `GroupMember`
| field | type | notes |
|---|---|---|
| `id` | cuid | |
| `groupId` | fk Group | |
| `userId` | fk User | |
| `role` | enum | `lead_investigator`, `contributor`, `viewer` |
| `publiclyListed` | bool | member can opt out of public listing |
| `joinedAt` | datetime | |

### `Predator`
| field | type | notes |
|---|---|---|
| `id` | cuid | |
| `legalName` | string | |
| `aliases` | string[] | with source linkage required |
| `jurisdiction` | string | city/state/country only |
| `status` | enum | `POST_CONVICTION`, `CURRENTLY_PROSECUTED`, `CONFIRMED_BY_INDEPENDENT_INVESTIGATION`, `CONFIRMED_BY_PLATFORM_AI_REVIEW`, `ALLEGED_PENDING_REVIEW`, `CLEARED`, `DECEASED` |
| `publiclyListed` | bool | computed: true iff status is not `ALLEGED_PENDING_REVIEW` and not `CLEARED` |
| `firstSubmittedAt` | datetime | |
| `lastUpdatedAt` | datetime | |

### `PredatorStatusEvent`
Auditable history of status transitions.
| field | type | notes |
|---|---|---|
| `id` | cuid | |
| `predatorId` | fk Predator | |
| `previousStatus` | enum | nullable on first event |
| `newStatus` | enum | |
| `actorUserId` | fk User | reviewer who applied the transition |
| `reason` | text | required |
| `evidenceRefs` | json | array of evidence record ids |
| `createdAt` | datetime | |

### `EvidenceItem`
| field | type | notes |
|---|---|---|
| `id` | cuid | |
| `predatorId` | fk Predator | |
| `submitterUserId` | fk User | |
| `submitterGroupId` | fk Group | nullable |
| `kind` | enum | `court_record`, `news_link`, `independent_investigation`, `document_upload`, `video_upload`, `other` |
| `url` | string | nullable for uploaded files |
| `blobKey` | string | nullable; refers to Vercel Blob private/public store |
| `hash` | string | SHA-256 integrity hash for uploaded files |
| `aiConfirmation` | json | `{ score, sources, confidence, reasoning, runAt }` |
| `createdAt` | datetime | |

### `Submission`
A new-or-updating-predator submission. Stays as `Submission` until accepted into the `Predator` table.
| field | type | notes |
|---|---|---|
| `id` | cuid | |
| `submitterUserId` | fk User | |
| `submitterGroupId` | fk Group | nullable |
| `proposedPredator` | json | full Predator + EvidenceItem shape |
| `aiVerdict` | enum | `pass`, `needs_human_review`, `reject` |
| `aiSummary` | json | full AI run output |
| `reviewerUserId` | fk User | nullable; set when human review applied |
| `status` | enum | `pending`, `approved`, `rejected` |
| `createdAt` | datetime | |
| `decidedAt` | datetime | nullable |

### `ContentItem`
| field | type | notes |
|---|---|---|
| `id` | cuid | |
| `authorUserId` | fk User | |
| `authorGroupId` | fk Group | nullable |
| `predatorId` | fk Predator | nullable; some content is non-predator-specific |
| `title` | string | |
| `description` | text | |
| `kind` | enum | `document`, `video`, `evidence_packet`, `report`, `article` |
| `tier` | enum | `free`, `premium` |
| `blobKey` | string | nullable |
| `optsIntoSitewide` | bool | if true, this content is included in the sitewide-subscription pool |
| `publishedAt` | datetime | |

### `Subscription`
| field | type | notes |
|---|---|---|
| `id` | cuid | |
| `subscriberUserId` | fk User | |
| `tier` | enum | `per_poacher`, `sitewide` |
| `targetUserId` | fk User | for `per_poacher`, the poacher subscribed to (nullable for sitewide) |
| `targetGroupId` | fk Group | for `per_poacher`, the group subscribed to (nullable) |
| `stripeSubscriptionId` | string | |
| `status` | enum | `active`, `canceled`, `past_due` |
| `createdAt` | datetime | |

### `RevenuePayout`
Monthly distribution log; reproducible.
| field | type | notes |
|---|---|---|
| `id` | cuid | |
| `periodStart` | datetime | |
| `periodEnd` | datetime | |
| `recipientUserId` | fk User | |
| `recipientGroupId` | fk Group | nullable |
| `amountCents` | int | |
| `source` | enum | `per_poacher`, `sitewide_pool` |
| `formulaSnapshot` | json | distribution-formula inputs + computed share |
| `stripeTransferId` | string | |
| `createdAt` | datetime | |

### `Strike`
| field | type | notes |
|---|---|---|
| `id` | cuid | |
| `userId` | fk User | |
| `kind` | enum | `submission_rejected`, `submission_overturned`, `tos_violation` |
| `reason` | text | |
| `evidenceRefs` | json | |
| `createdAt` | datetime | |

### `Dispute`
A subject-of-listing dispute (someone claiming they were mis-listed).
| field | type | notes |
|---|---|---|
| `id` | cuid | |
| `predatorId` | fk Predator | |
| `claimantIdentityProof` | json | verification documents |
| `claim` | text | |
| `status` | enum | `pending`, `accepted`, `rejected`, `escalated_to_board` |
| `decisionReason` | text | |
| `decidedAt` | datetime | nullable |
| `createdAt` | datetime | |

## AI Cross-Confirmation Pipeline

1. **Source intake.** Take the submission payload (claims + URLs + uploaded files).
2. **Fetch step.** Pull each URL; OCR each uploaded document; extract structured fields (name, jurisdiction, dates, case numbers).
3. **Cross-reference step.** Query public sources (PACER, state court APIs where available, scraped news pages, government registries) for the claimed name + jurisdiction. Capture excerpts.
4. **Corroboration check.** Require at least one independent source corroborating the status claim. "Independent" means a source the submitter did not provide.
5. **AI evaluation.** Submit the bundle to Claude with a structured rubric: claim, supplied sources, fetched corroborations, jurisdiction match, name match, case-number match.
6. **Verdict.** Output one of `pass` / `needs_human_review` / `reject`, with confidence score, reasoning, and per-source citations.
7. **Logging.** Persist the full run (inputs, fetched bodies, AI output) to the `Submission.aiSummary` field for audit.
8. **Outcome routing.** `pass` auto-publishes with `CONFIRMED_BY_PLATFORM_AI_REVIEW`; `needs_human_review` enters reviewer queue; `reject` stays private to submitter and counts toward their strike score.

## Subscription & Payout

- Stripe Subscriptions for the recurring charge.
- Stripe Connect (Express) for per-poacher payouts and per-group payouts.
- Per-poacher subscription revenue flows directly to the target poacher minus platform fee.
- Sitewide subscription revenue is held in the platform's main balance for the period, then distributed monthly via `RevenuePayout` records based on the engagement-weighted formula.
- Distribution formula (v1, configurable):
  - Inputs per opted-in poacher: subscriber-content-views, watch-time, comment engagement, novel-predator-submissions in period.
  - Anti-gaming: cap any single poacher's share at X% of the pool in the first 90 days; require minimum verification level to be eligible.
  - Output: percentage of the period's sitewide pool, computed from a public formula stored alongside each payout for reproducibility.

## Public API Surfaces
- `GET /api/predators` — paginated public registry (excludes `ALLEGED_PENDING_REVIEW`, excludes `CLEARED`).
- `GET /api/predators/[id]` — single predator profile.
- `GET /api/poachers` — paginated list of independent poachers.
- `GET /api/groups` — paginated list of groups.
- `GET /api/content` — paginated content library (premium items return metadata only without subscription).
- `POST /api/submissions` — submit a new predator record (auth-required).
- `POST /api/disputes` — file a mis-listing dispute (auth-required).

## Build Order (rough)
1. Auth + role system + verification flows.
2. Submission flow + AI cross-confirmation pipeline (the gate must work end-to-end first).
3. Predator registry + explore page + profile pages.
4. Poacher/group explore pages + group workspace.
5. Content library + free/premium tiers.
6. Stripe subscriptions + Connect payouts + sitewide pool distribution.
7. Trust & safety (strikes, disputes, takedown, counter-notice).
