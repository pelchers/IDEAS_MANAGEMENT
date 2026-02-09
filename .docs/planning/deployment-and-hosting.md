# Deployment and Hosting Plan

## 1. Providers
- Web frontend: Vercel (Next.js)
- API runtime: Vercel (Node/Edge where appropriate)
- Database: Neon PostgreSQL
- Cache/rate limit/queues: Upstash Redis
- Object storage: Cloudflare R2
- Billing: Stripe
- Observability: Sentry + structured logging provider

## 2. Environment Strategy
- `dev`, `staging`, `production` environments with isolated resources.
- Strict environment variable separation and key rotation policy.
- Migrations applied via controlled CI/CD workflow.

## 3. Scale Planning (1,000+ Users)
- Indexed PostgreSQL query patterns for dashboard/project access.
- Redis-backed rate limits for auth and AI endpoints.
- Async job processing for sync reconciliation and billing reconciliation.
- CDN-backed asset delivery for whiteboard images and generated artifacts.

## 4. Reliability and Operations
- Automated backups and tested restore procedures.
- Health checks and uptime monitors.
- Incident runbooks for auth outages, billing webhook failures, and sync backlogs.

## 5. Security and Compliance Baseline
- TLS everywhere.
- Least-privilege service credentials.
- Audit logging for privileged actions and file-changing AI actions.
