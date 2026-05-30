# V2 Performance Review — 2026-05-30

Scope: query performance + index coverage for the hot read paths added in
Phase 1–4 (explore, profiles, friends, groups, notifications).

## Index Coverage

| Query path | Filter / order | Index | Status |
|------------|----------------|-------|--------|
| Explore projects | `visibility = PUBLIC` order by `createdAt desc` | `@@index([visibility, createdAt])` | **Added this review** |
| Notifications list | `userId`, `read`, order by `createdAt desc` | `@@index([userId, read, createdAt])` | Present |
| Friends list | `requesterId` OR `addresseeId`, `status` | `@@unique([requesterId, addresseeId])` + `@@index([addresseeId])` + `@@index([status])` | Present (both directions) |
| Group "mine" | members where `userId` + `status` | `@@index([userId])` + `@@unique([groupId, userId])` | Present |
| Group detail | members by `groupId` | `@@unique([groupId, userId])` (groupId prefix) | Present |
| Comments | `projectId` + `targetType` + `targetId` | `@@index([projectId, targetType, targetId])` | Present |
| Activity feed | `projectId` order by `createdAt` | `@@index([projectId, createdAt])` | Present |
| User search | `displayName contains` | — (sequential; `contains` can't use btree prefix) | Acceptable at expected scale |

## Pagination Caps (verified)

All list endpoints cap `limit` server-side via `Math.min(50, …)`:
- `/api/projects/explore` — 50
- `/api/users` — 50
- `/api/notifications` — 50
- `/api/groups` — 50
- `/api/projects/[id]/activity` — 50
- `/api/projects/[id]/comments` — bounded by target

Friends list is bounded by the user's friendship count (no unbounded scan;
indexed both directions).

## Notes

- The added `[visibility, createdAt]` composite directly serves the explore
  query (the stated "explore page with 100+ projects" concern) — index-only
  range scan instead of a full-table filter+sort.
- Notification queries (stated "1000+ rows") are covered by the composite
  `[userId, read, createdAt]` — the unread-count and recent-list queries are
  both index-served.
- User search uses `contains` (substring), which is inherently a scan; at the
  current expected user volume this is acceptable. If the user table grows
  large, migrate to a trigram (`pg_trgm`) GIN index or a search service.
