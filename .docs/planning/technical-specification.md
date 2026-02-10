# Technical Specification

## 1. Recommended Stack
- Monorepo: `pnpm` + `turbo`
- Web client: Next.js (App Router) + React + TypeScript
- Desktop client: Electron + shared React app shell
- Backend/API: Next.js server routes + worker processes
- ORM: Prisma
- Primary database: PostgreSQL (Neon)
- Cache/queues/rate limiting: Redis (Upstash)
- Billing: Stripe
- Object storage for uploaded binary assets: Cloudflare R2 (or S3-compatible)

## 2. Architecture Overview

### 2.3 Build Strategy (Web-First + Early Desktop Spine)
- Web-first for the canonical platform foundation: backend APIs, auth, subscriptions/entitlements, AI tools, audit logs, and core UI flows.
- Desktop is validated early with a thin Electron spine (week 1-2) to prove: local folder selection, local mirror layout, sync queue plumbing, and AI sidebar calling the same server tools.
- Both clients share domain logic and UI packages; differences are isolated behind storage/sync adapters.
### 2.1 Applications
- `apps/web`: hosted web interface
- `apps/desktop`: Electron shell with shared UI packages
- `apps/api` (or Next.js API routes): auth, subscription, sync, AI tool endpoints

### 2.2 Shared Packages
- `packages/ui`: reusable components
- `packages/domain`: project/board/schema business logic
- `packages/schemas`: zod/json schema contracts
- `packages/sdk`: typed API clients for web/desktop

## 3. Authentication and Authorization
- Roll-your-own auth service with secure primitives:
  - Password hashing: Argon2id
  - Signed session tokens (short TTL) + refresh token rotation
  - Revocation list and device/session tracking
- RBAC baseline roles:
  - `admin` (unrestricted)
  - `user`
- Desktop gate:
  - App startup requires authenticated session validation
  - Entitlement check blocks premium features when subscription invalid
  - Admin account bypasses entitlement gates for internal testing

## 4. Subscription Model
- Stripe customer + subscription lifecycle integration.
- Webhooks update entitlements in PostgreSQL.
- Entitlement checks enforced server-side and mirrored client-side for UX.

## 5. Project Data Model and File Contract
Each project keeps a local folder contract while being cloud-linked.

Minimum local contract:
- `project.json`
- `planning/`
- `kanban/board.json`
- `whiteboard/board.json`
- `schema/schema.graph.json`
- `directory-tree/tree.plan.json`
- `ideas/ideas.json`
- `ai/chats/default.ndjson`
- `.meta/sync.json`

## 6. Local vs Hosted Filesystem Strategy
### 6.1 Precedence
- Cloud data is the canonical source for account-bound project state.
- Desktop keeps a local mirror for performance and offline use.

### 6.2 Write Path
- Local-first write to project files.
- Append operation to local sync queue.
- Background sync pushes operation to cloud when connected.

### 6.3 Conflict Handling
- Versioned artifacts with per-file revision IDs.
- Automatic merge for append-safe structures (idea lists, logs).
- Manual conflict resolution UI for simultaneous structural edits.
- Recovery controls: `force pull`, `force push`, and snapshot restore.

## 7. AI Architecture
- Dedicated AI page (`/ai`) plus workspace sidebar.
- AI actions use typed server tools (not raw unrestricted shell access).
- Required confirmation for destructive operations.
- All file-changing tool actions are audit logged.

## 8. Hosting Plan (Production)
- Frontend + API edge/node hosting: Vercel
- PostgreSQL: Neon
- Redis and rate limits: Upstash
- File/object storage: Cloudflare R2
- Error monitoring: Sentry
- Product analytics: PostHog (or equivalent)

## 9. Performance and Scale Targets
- 1,000+ active users with headroom.
- P95 API response for common reads < 250ms.
- Dashboard first paint < 1.5s for moderate project counts.
- Smooth 60fps interactions for common board/canvas actions.

## 10. Security Baseline
- Strict server-side authorization on all data mutations.
- Encryption in transit (TLS) and at rest (provider-managed + key rotation policy).
- Audit logs for auth events, billing changes, and AI file actions.
- Secrets managed per environment with rotation runbooks.

## 11. Release Quality Gates
- Unit/integration/end-to-end test suites required for protected domains.
- Pre-release security checks (auth/session/subscription regressions).
- Backup/restore drills for project and account data.

