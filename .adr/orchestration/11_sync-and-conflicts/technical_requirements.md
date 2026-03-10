# Technical Requirements — 11_sync-and-conflicts

## Key Files
- `apps/web/src/app/(authenticated)/projects/[id]/conflicts/page.tsx`
- `apps/web/src/components/sync-status-indicator.tsx`
- `apps/web/src/lib/sync-queue.ts` (existing)
- `apps/web/src/app/api/sync/` (existing routes)

## Sync Model
- SyncOperation: pending → applied | conflicted
- SyncSnapshot: pre-merge state for rollback
- Version tracking per artifact
