# Notes — 13_v2_expansion

## Decision Log

### 2026-03-17 — ADR Created
- V2 scope defined: profiles, explore, collaboration, social graph, notifications
- 5-phase implementation plan established
- SSE chosen over WebSocket for real-time (simpler, proxy-friendly, sufficient for our use cases)
- PostgreSQL full-text search chosen over external search service (Algolia, Meilisearch) to avoid new infrastructure dependency; can upgrade later if needed

### 2026-03-17 — Profile Fields (W2 Dependency)
- `displayName`, `bio`, `avatarUrl`, `tags` already added to User model (commit 7a993b4)
- Profile page created at `/profile` (commit 411dbdf)
- Sidebar user section is clickable, links to `/profile`
- V2 Phase 1 builds on this foundation — extends to public profiles viewable by other users

## Dependencies on Prior Work

| ADR | Dependency | Status |
|-----|-----------|--------|
| 3_auth-flow | Session management, cookie auth | Complete |
| 11_sync-and-conflicts | Real-time sync / OT infrastructure | Complete |
| 12_hardening | E2E test patterns, security baseline | Complete |
| W2 (this session) | User profile fields on model | Complete |

## Open Questions

1. **Profile privacy granularity**: Should users control visibility per-field (e.g., hide bio but show tags), or is it all-or-nothing public/private? Start with all-or-nothing, iterate if users request granularity.

2. **Group project ownership**: When a project is linked to a group, do all group members automatically become project members? Or is it opt-in per project? Leaning toward: group members get VIEWER by default, must be explicitly added as EDITOR.

3. **Notification bundling**: Should rapid-fire notifications (e.g., 10 comments on same card) be bundled into one? Defer to Phase 4 implementation — start with individual notifications, add bundling if noise becomes an issue.

4. **Explore page personalization**: Should explore results be personalized based on user's tags/interests? Start with simple search + trending, add personalization in a future iteration.

5. **Comment threading**: Flat comments or threaded? Start flat (simpler), add threading later if users want it. Flat comments with @mentions cover most use cases.

6. **Presence scalability**: SSE connections per project could be expensive at scale. For V2 (small user base), SSE is fine. Consider upgrading to a pub/sub system (Redis) if connection count becomes an issue.

## Architecture Notes

- All new API routes follow existing pattern: `requireAuth` → validate → query → respond
- New models follow existing Prisma conventions (cuid IDs, createdAt/updatedAt, cascade deletes)
- UI components follow brutalist design system established in `2_design-system-and-shell`
- Real-time features use SSE (Server-Sent Events) — single direction server→client, reconnect handled by EventSource API
- Search uses PostgreSQL `tsvector` + GIN indexes — no external dependencies
