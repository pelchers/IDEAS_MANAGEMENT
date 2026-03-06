# Runbook: Sync Queue Backlog

## Symptoms
- Sync queue growing: desktop clients report "pending sync" that never completes
- Conflict count increasing without resolution
- `SyncOperation` table has many records with status `conflict`
- Users report seeing stale data across devices

## Diagnosis Steps

1. **Check sync operation status distribution:**
   ```sql
   SELECT status, COUNT(*)
   FROM "SyncOperation"
   GROUP BY status
   ORDER BY COUNT(*) DESC;
   ```

2. **Find stuck operations:**
   ```sql
   SELECT "operationId", "projectId", "artifactPath", "baseRevision", status, "createdAt"
   FROM "SyncOperation"
   WHERE status = 'conflict'
   ORDER BY "createdAt" ASC
   LIMIT 20;
   ```

3. **Check artifact revision gaps:**
   ```sql
   SELECT "projectId", "artifactPath", revision, "updatedAt"
   FROM "ProjectArtifact"
   ORDER BY "updatedAt" DESC
   LIMIT 20;
   ```

4. **Verify API health:**
   ```bash
   curl https://yourdomain.com/api/health
   # Should return { "ok": true, "status": "healthy" }
   ```

## Resolution Steps

1. **Clear stale conflicts (safe for append-only artifacts):**
   Append-only artifacts (ideas, chat logs) can be auto-merged. If conflicts exist for these:
   ```sql
   -- Identify auto-mergeable conflicts
   SELECT * FROM "SyncOperation"
   WHERE status = 'conflict'
   AND ("artifactPath" = 'ideas/ideas.json' OR "artifactPath" LIKE 'ai/chats/%');
   ```
   These should have been auto-merged. If they were not, the merge logic may have a bug.

2. **Force resolution for a specific conflict:**
   Use the API endpoint:
   ```bash
   curl -X POST https://yourdomain.com/api/sync/resolve/<operationId> \
     -H "Authorization: Bearer <session-token>" \
     -H "Content-Type: application/json" \
     -d '{"resolution": "accept_remote"}'
   ```

3. **Force-push server state (override client):**
   ```bash
   curl -X POST https://yourdomain.com/api/sync/force \
     -H "Authorization: Bearer <session-token>" \
     -H "Content-Type: application/json" \
     -d '{"projectId": "<project-id>", "artifactPath": "<path>", "content": {...}, "revision": <new-rev>}'
   ```

4. **Cleanup old sync operations:**
   ```sql
   -- Archive old applied operations (older than 30 days)
   DELETE FROM "SyncOperation"
   WHERE status = 'applied'
   AND "createdAt" < NOW() - INTERVAL '30 days';
   ```

## Prevention
- Monitor `SyncOperation` conflict count with alerting
- Desktop clients should prompt users to resolve conflicts within 24 hours
- Consider adding a background job to auto-resolve old conflicts with "server wins" policy
