# PRD — Predator Identification Network (PIN)

## Goals (v1)
1. **Single registry of confirmed/listed predators**, with auditable status and supporting evidence.
2. **Hard anti-doxing gate**: nothing gets publicly listed until AI cross-confirmation passes.
3. **Collaborative investigation**: individuals or groups can both contribute and be discoverable.
4. **Sustainable revenue for poachers** via per-poacher and sitewide subscriptions with transparent distribution.
5. **Legally defensible hosting posture** via YouTube-style ToS and clear takedown/appeal flows.

## Core Features

### 1. Multi-Role Identity
- Account creation supports a role assignment with claim verification:
  - `general_user` — default; can view, subscribe, comment.
  - `poacher_independent` — can submit predator records, upload content, accept subscriptions.
  - `poacher_group_member` — same as independent but operating inside a group.
  - `expert` — identity + credential verification; weighted review authority.
  - `journalist` — identity + outlet verification; weighted review authority.
  - `legal_representative` — bar verification; weighted review + can mark legal status updates.
  - `politician` — public-office verification; visibility-only role with verified badge.
  - `content_creator` — content uploads, optional monetization; no submission authority.
  - `law_enforcement_liaison` — phase-2; deferred.
- A single user may hold multiple roles; verification is per-role.

### 2. Predator Registry
- Each predator profile carries:
  - Full name (legal name only, no aliases without source linkage).
  - Status enum: `POST_CONVICTION`, `CURRENTLY_PROSECUTED`, `CONFIRMED_BY_INDEPENDENT_INVESTIGATION`, `CONFIRMED_BY_PLATFORM_AI_REVIEW`, `ALLEGED_PENDING_REVIEW`, `CLEARED`, `DECEASED`.
  - Jurisdiction and last-known-location field (city/state/country granularity only — no street address).
  - Supporting evidence array: court records, news links, independent investigation reports, uploaded documents/videos.
  - Status timeline: every status change is timestamped and attributed to a verified reviewer.
  - Contributors: list of poachers (individuals and groups) who submitted or corroborated evidence.
- Status `ALLEGED_PENDING_REVIEW` is **not publicly listed** — visible only to platform reviewers until AI cross-confirmation passes or reviewer approves.

### 3. AI Cross-Confirmation Gate (anti-doxing)
- Every new predator submission runs an automated cross-confirmation pipeline:
  - Pull supplied source URLs and uploaded documents.
  - Cross-reference name + jurisdiction against public court records (PACER, state court systems where API-available, scraped news).
  - Confirm at least one independent corroborating source for the status claim.
  - Score the submission: `pass`, `needs_human_review`, `reject`.
- `pass` → goes live with `CONFIRMED_BY_PLATFORM_AI_REVIEW` status.
- `needs_human_review` → enters reviewer queue; weighted-role reviewers (`expert` / `journalist` / `legal_representative`) move it forward.
- `reject` → stays private to submitter with rejection reason; never reaches public explore page.
- Failed submissions count toward a strike system against the submitter.

### 4. Predator Explore Page
- Grid/list of publicly listed predators.
- Filters: status, jurisdiction, has-conviction, has-active-prosecution, date listed.
- Search: name, jurisdiction.
- Each card links to a predator profile page.
- No `ALLEGED_PENDING_REVIEW` records appear here.

### 5. Predator Profile Page
- Status badge, jurisdiction, listed date, last-updated date.
- Status timeline (auditable history of status transitions).
- Evidence section: documents, videos, court record links, news links, all attributed to contributors.
- Contributor section: list of poachers (individual and group) who contributed, linked to their profile pages.
- Comments/discussion section (moderated, role-weighted).
- Subscribe-for-updates toggle (general users get notifications on status changes).

### 6. Poacher / Group Explore Page
- Two tabs: **Independent Poachers** and **Groups**.
- Each card: poacher/group name, bio, stats (predators listed, status counts, content output count, subscriber count).
- Each card links to a poacher/group profile page.

### 7. Group Workspace
- A group has: name, description, avatar, public stats, public membership list (members may opt out of public listing).
- Internal workspace: shared document vault, shared case workbench, member roles (lead investigator, contributor, viewer).
- Group can publish content as the group entity; individual members can also publish under their own poacher identity.
- Group subscriptions: subscribers subscribe to the group as a unit; revenue is split among active members per the group's internal split agreement.

### 8. Content Page
- Searchable + filterable content library: documents, videos, evidence packets, written reports.
- Filters: poacher, group, predator, status, content-type, tier (free / premium).
- Premium content requires either a per-poacher subscription matching the content's author or a sitewide subscription.

### 9. Subscription Tiers
- **Per-Poacher Subscription**: monthly fee paid to a single poacher/group; unlocks all premium content from that poacher/group.
- **Sitewide Subscription** (larger fee): unlocks all premium content from every poacher/group that opts into the sitewide pool.
- Sitewide revenue is pooled and distributed monthly by an **engagement-weighted formula** (subscriber-content-views, watch-time, comment engagement, with anti-gaming dampers).
- Distribution formula is transparent — every participating poacher sees their share calculation.
- Stripe is the payment processor; processor-compliance considerations require careful onboarding (some categories trigger enhanced review).

### 10. Legal & ToS
- YouTube-style ToS: every post and uploaded content item is the sole responsibility and publishing of the poster.
- Clear DMCA takedown flow.
- Counter-notice flow.
- Status-dispute / mis-listing dispute flow: a person listed as a predator can submit a verified-identity dispute; weighted reviewers can flip status to `CLEARED` or move to review.
- Independent review board (phase 2) for contested decisions.

### 11. Trust & Safety
- Strike system for submitters with rejected or overturned submissions.
- Role verification at signup (deeper for poachers, experts, legal reps).
- Content moderation queue for media uploads.
- All status transitions are auditable + attributed.

## Non-Functional Requirements
- All status changes auditable with actor, timestamp, reason, and evidence link.
- All submitted documents stored with hash + integrity check.
- AI cross-confirmation pipeline must log its sources and confidence score for every decision (transparency requirement).
- Subscription revenue distribution must be reproducible from monthly logs.

## Success Criteria (v1)
- Successful end-to-end submission flow: submit → AI confirm → publish → status update over time.
- Successful end-to-end subscription flow: subscriber pays → unlocks premium → poacher receives revenue.
- Zero false-positive predator listings (anti-doxing gate is the highest-priority correctness constraint).
- Defensible legal posture demonstrated by a documented takedown + counter-notice flow that has been exercised at least once during private beta.
