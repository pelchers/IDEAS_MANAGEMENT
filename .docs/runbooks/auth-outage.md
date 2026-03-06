# Runbook: Auth Outage

## Symptoms
- Users cannot sign in or sign up
- API endpoints return 401 for authenticated users
- Session validation fails for all users
- Refresh token rotation fails

## Diagnosis Steps

1. **Check application logs** for auth-related errors:
   - Look for database connection errors from `session.ts` or `tokens.ts`
   - Check for Argon2 errors in `password.ts`

2. **Verify database connectivity:**
   ```sql
   SELECT COUNT(*) FROM "Session" WHERE "revokedAt" IS NULL AND "expiresAt" > NOW();
   ```

3. **Check environment variables:**
   - `DATABASE_URL` is set and valid
   - `SESSION_SECRET` is set
   - `AUTH_COOKIE_SECURE` matches the deployment (HTTPS = `true`)

4. **Verify session table health:**
   ```sql
   SELECT COUNT(*), MIN("createdAt"), MAX("createdAt") FROM "Session";
   ```

## Resolution Steps

1. **Database connection failure:**
   - Check Neon dashboard for service status
   - Verify connection pooling limits are not exhausted
   - Restart the application to reset connection pool

2. **Mass session invalidation (accidental):**
   - Check audit logs: `SELECT * FROM "AuditLog" WHERE action LIKE 'auth%' ORDER BY "createdAt" DESC LIMIT 20;`
   - If sessions were bulk-revoked, affected users need to re-sign in

3. **Cookie issues:**
   - Verify domain matches `NEXT_PUBLIC_APP_URL`
   - Check HTTPS is enforced when `AUTH_COOKIE_SECURE=true`

## Emergency: Admin Account Recovery

If the admin account is locked out:

1. Use the bootstrap procedure with `ADMIN_EMAIL` and `ADMIN_BOOTSTRAP_KEY` env vars
2. Set these in environment and restart the application
3. The admin bootstrap runs on startup and creates/resets the admin credential

## Emergency: Session Table Cleanup

If the sessions table is corrupted or causing performance issues:

```sql
-- Revoke all expired sessions (safe cleanup)
UPDATE "Session" SET "revokedAt" = NOW()
WHERE "expiresAt" < NOW() AND "revokedAt" IS NULL;

-- Revoke all refresh tokens that are expired
UPDATE "RefreshToken" SET "revokedAt" = NOW()
WHERE "expiresAt" < NOW() AND "revokedAt" IS NULL;
```

**Warning:** Do NOT delete session rows directly. Revoking is safer and preserves audit trail.
