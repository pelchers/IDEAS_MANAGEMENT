# Primary Task List — 1_project-init

Session: Project Initialization
Started: 2026-03-10
Design Fidelity: Faithful (pass-1 brutalism-neobrutalism)

---

## Phase 1 — Monorepo and Dependencies ✓ COMPLETE

- [x] Verify pnpm monorepo structure with Turbo
- [x] Verify/update apps/web package.json dependencies (Next.js 16, React 19, Tailwind CSS, Prisma, Stripe, Vercel AI SDK, argon2, zod)
- [x] Install SortableJS, Chart.js, Rough.js (required by pass-1 concept)
- [x] Verify TypeScript and ESLint configuration
- [x] Verify Turbo build pipeline

## Phase 2 — Database and Environment

- [ ] Verify Prisma schema (18 tables: User, Credential, Session, RefreshToken, EmailVerificationToken, PasswordResetToken, AuditLog, Subscription, Entitlement, BillingEvent, AiChatSession, AiChatMessage, AiToolOutput, Project, ProjectMember, ProjectArtifact, SyncOperation, SyncSnapshot)
- [ ] Run prisma migrate to ensure DB is current
- [ ] Verify .env with all required variables (DATABASE_URL, SESSION_SECRET, STRIPE_SECRET_KEY, OPENAI_API_KEY)
- [ ] Seed admin account
- [ ] Verify dev server starts cleanly on port 3000

## Phase 3 — Frontend Cleanup

- [ ] Remove all current page implementations under apps/web/src/app/(authenticated)/ (they will be rebuilt from pass-1)
- [ ] Remove current globals.css (will be regenerated as Tailwind config from pass-1)
- [ ] Remove current app-shell.tsx (will be rebuilt to match pass-1 nav exactly)
- [ ] Remove current signin/signup pages (will be rebuilt from pass-1)
- [ ] Keep all API routes under apps/web/src/app/api/ (backend is correct)
- [ ] Keep Prisma schema, package.json, and config files
- [ ] Verify app still builds and API routes still respond after cleanup
