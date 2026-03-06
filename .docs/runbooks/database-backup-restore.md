# Runbook: Database Backup & Restore

## Neon Backup Procedures

Neon PostgreSQL provides built-in backup capabilities:

1. **Automatic backups:** Neon retains point-in-time recovery (PITR) for up to 7 days (Pro plan) or 30 days (Enterprise). No manual action needed.

2. **Manual snapshot:** Create a branch from the current state:
   ```bash
   neonctl branches create --name backup-$(date +%Y%m%d-%H%M%S) --project-id <project-id>
   ```

3. **Export via pg_dump:**
   ```bash
   pg_dump "$DATABASE_URL" --no-owner --no-acl --format=custom -f backup-$(date +%Y%m%d).dump
   ```

## Point-in-Time Recovery

Neon supports PITR through branching:

1. Go to Neon Console > Project > Branches
2. Click "Create Branch"
3. Select "From a specific point in time"
4. Choose the timestamp before the incident
5. A new branch is created with the database state at that time
6. Update `DATABASE_URL` to point to the new branch
7. Verify data integrity before switching production traffic

## Migration Rollback Steps

If a Prisma migration caused issues:

1. **Identify the bad migration:**
   ```sql
   SELECT * FROM "_prisma_migrations"
   ORDER BY "finished_at" DESC
   LIMIT 5;
   ```

2. **Create a PITR branch** from before the migration timestamp

3. **Apply corrective migration:**
   ```bash
   cd apps/web
   npx prisma migrate dev --name fix_<description>
   ```

4. **Deploy the corrective migration:**
   ```bash
   npx prisma migrate deploy
   ```

Note: Prisma does not support `migrate down`. Use PITR + corrective migrations instead.

## Data Verification Queries

After any restore operation, verify data integrity:

```sql
-- Check table row counts
SELECT
  (SELECT COUNT(*) FROM "User") AS users,
  (SELECT COUNT(*) FROM "Session") AS sessions,
  (SELECT COUNT(*) FROM "Project") AS projects,
  (SELECT COUNT(*) FROM "ProjectArtifact") AS artifacts,
  (SELECT COUNT(*) FROM "Subscription") AS subscriptions,
  (SELECT COUNT(*) FROM "AuditLog") AS audit_logs;

-- Check for orphaned records
SELECT p.id FROM "Project" p
LEFT JOIN "ProjectMember" pm ON pm."projectId" = p.id
WHERE pm.id IS NULL;

-- Verify foreign key integrity
SELECT pa."projectId" FROM "ProjectArtifact" pa
LEFT JOIN "Project" p ON p.id = pa."projectId"
WHERE p.id IS NULL;

-- Check subscription consistency
SELECT s."userId", s.plan, s.status
FROM "Subscription" s
WHERE s.status = 'ACTIVE'
ORDER BY s."createdAt" DESC;
```

## Emergency Restore Procedure

1. Create PITR branch in Neon Console
2. Update `DATABASE_URL` and `DIRECT_URL` environment variables
3. Redeploy the application
4. Verify health endpoint: `curl https://yourdomain.com/api/health`
5. Run verification queries above
6. Monitor application logs for errors
7. Once stable, consider renaming the branch to `main` in Neon Console
