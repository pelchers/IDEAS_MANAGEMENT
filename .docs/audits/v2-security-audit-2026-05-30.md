# V2 Social/Notification Endpoint Security Audit — 2026-05-30

Scope: access control on all Phase 1–4 endpoints (profiles, explore, friends,
groups, notifications). Method: adversarial per-endpoint review (IDOR, missing
auth, missing ownership/role checks, privacy leaks).

## Findings & Resolutions

| # | Severity | Endpoint | Issue | Resolution |
|---|----------|----------|-------|------------|
| 1 | CRITICAL | `GET /api/users` | No `requireAuth` (anonymous access); search filtered on `email` enabling enumeration despite private email visibility | Added `requireAuth`; search now matches `displayName` only — never queries `email` |
| 2 | HIGH | `POST /api/notifications/digest` | `CRON_SECRET` check skipped when env var unset (fail-open); response enumerated recipient emails/ids | Fail closed (503 when secret unset); response returns only `sentCount` |
| 3 | MEDIUM | `GET /api/groups/[id]` | Member roster incl. emails + pending join requests readable by any authenticated non-member | Emails redacted for non-members; pending list + private group projects hidden from non-members |

## Verified Correct (no changes needed)

- `GET /api/users/[id]` — respects `profileVisibility`; only PUBLIC projects returned; no emails in embedded project data.
- `GET /api/projects/explore` — top-level `visibility: "PUBLIC"` is ANDed with search `OR`; no private projects leak.
- `GET /api/friends` — own friendships only; BLOCKED rows shown only to blocker.
- `POST /api/friends/request` — auth + rate limit; self-friend blocked; correct notification targets.
- `PUT/DELETE /api/friends/[id]` — accept/decline addressee-only + PENDING-only; delete participant-only; BLOCKED rows protected.
- `POST /api/friends/block` — self-block blocked; unblock enforces blocker ownership.
- `GET/POST /api/groups` — auth required; creator becomes OWNER; rate-limited.
- `PATCH/DELETE /api/groups/[id]` — PATCH requires ADMIN, DELETE requires OWNER.
- `POST /api/groups/[id]/members` — join is self-only; invite requires ADMIN.
- `PATCH/DELETE /api/groups/[id]/members/[memberId]` — ADMIN required; OWNER grant requires OWNER; last-owner protection; cross-group memberId IDOR blocked via `groupId` cross-check.
- `GET/DELETE /api/notifications` — scoped to `userId`.
- `PUT /api/notifications/[id]/read` — ownership enforced; returns 404 (not 403) to avoid existence disclosure.
- `POST /api/notifications/read-all` — scoped to own unread.
- `GET /api/notifications/unsubscribe` — unauthenticated by design; gated by opaque random `unsubscribeToken` (32-byte); limited blast radius (sets digest OFF).

## Notes / Accepted Risk

- `/api/projects/explore` and `/api/users` are now authenticated (app is fully behind auth). Profile/project privacy is enforced server-side regardless.
- Rate limiting (Phase 5) added to friend requests, invites, group create/join, comments (20/min/user).
