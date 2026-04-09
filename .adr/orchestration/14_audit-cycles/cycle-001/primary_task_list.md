# Primary Task List — Audit Cycle 001

Session: Audit Cycling — Cycle 001
Started: 2026-04-09
Source: `.docs/planning/audits/001.*` + TODOs #42, #43

---

## Phase 1 — Critical Security Fixes (P0 — blockers)

### 1a. Verification token leak (S-01)
- [ ] Wrap `_dev` block in `src/app/api/auth/signup/route.ts:55` with `if (process.env.NODE_ENV !== "production")`
- [ ] Write test that verifies the token is NOT in the response body when `NODE_ENV=production`

### 1b. Security headers (S-02)
- [ ] Add security headers to `next.config.ts` via `async headers()`:
  - `Content-Security-Policy` (reasonable default, allowing self + inline styles)
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` (deny camera, mic, geolocation by default)
- [ ] Verify headers applied via curl / Playwright

### 1c. Rate limiting on auth endpoints (S-04)
- [ ] Create `src/server/rate-limit.ts` — in-memory LRU bucket per IP, 5 req/15min for signin/signup, 3 req/hour for password-reset
- [ ] Apply to `/api/auth/signin`, `/api/auth/signup`, `/api/auth/password-reset/*`
- [ ] Return 429 with Retry-After header on limit
- [ ] Add test for rate limit trigger

---

## Phase 2 — API Contract Hardening (H)

### 2a. Zod validation on all API routes (C-03 / API-04)
- [ ] Audit all 37 route files — identify 26 missing Zod validation
- [ ] Add Zod schema + parse for request body in each
- [ ] Standardize error response format: `{ ok: false, error: "validation_failed", details: zodError.errors }`
- [ ] Return HTTP 400 on validation failure

### 2b. Response format consistency (API-05)
- [ ] Every API route returns `{ ok: true, ...data }` or `{ ok: false, error: string, message?: string }`
- [ ] Document standard in `.docs/api-conventions.md`

### 2c. Missing error handling (API-06)
- [ ] Wrap all route handlers in try/catch with consistent error logging
- [ ] Return 500 with safe error message (no stack traces in production)

---

## Phase 3 — Performance Optimization (P0-P1)

### 3a. Code splitting for monolith pages (P-01 / C-01 / C-02)
- [ ] Wrap heavy child components in `next/dynamic` with SSR disabled
  - Whiteboard: SchemaToolbar, SchemaMinimap, EntityCard lazy-loaded
  - Schema planner: RelationLines, EntitySidePanel lazy-loaded
- [ ] Use React.memo on EntityCard, FieldRow, RelationLines (they render frequently)
- [ ] Use useMemo for expensive computations (path bbox, group selection bbox)
- [ ] Verify bundle size reduction via `next build` output

### 3b. Image optimization (P-02)
- [ ] Replace `<img>` tags with `next/image` in media display components
- [ ] Set `priority` flag on LCP images
- [ ] Verify lazy loading on below-fold images

### 3c. Database query optimization (P-03, D-02)
- [ ] Audit queries with N+1 potential
- [ ] Add `select` clauses to Prisma queries to reduce payload size
- [ ] Add missing indexes identified in audit

---

## Phase 4 — Accessibility Fixes (H)

### 4a. Missing alt text (A-01)
- [ ] Add descriptive alt attributes to all images in app
- [ ] Add `aria-label` to icon-only buttons throughout

### 4b. Keyboard navigation (A-02)
- [ ] Verify tab order on main pages (dashboard, settings, whiteboard, schema)
- [ ] Add focus-visible outlines to interactive elements
- [ ] Ensure modals trap focus when open
- [ ] Ensure Escape closes all modals/panels

### 4c. Color contrast (A-03)
- [ ] Audit text colors on cream/dark backgrounds
- [ ] Fix any pairings below WCAG AA (4.5:1 for normal text, 3:1 for large)

### 4d. ARIA roles + semantic HTML (A-04)
- [ ] Replace generic divs with semantic HTML where appropriate (nav, main, article, aside)
- [ ] Add `role` attributes to custom interactive widgets (marquee selection, zoom controls)

---

## Phase 5 — SEO Fixes (H)

### 5a. Metadata + OpenGraph (SEO-01)
- [ ] Add `generateMetadata` to root layout with default title, description, OG tags
- [ ] Add per-page metadata overrides where relevant

### 5b. Sitemap + robots.txt (SEO-02)
- [ ] Create `src/app/sitemap.ts` (dynamic sitemap from routes + public projects)
- [ ] Create `src/app/robots.ts` (allow all, link to sitemap)

### 5c. Structured data (SEO-03)
- [ ] Add JSON-LD schema to landing pages (Organization, WebSite)

---

## Phase 6 — Database + Data Integrity (M)

### 6a. Missing indexes (D-01)
- [ ] Review audit findings for slow queries
- [ ] Add composite indexes where N+1 patterns exist

### 6b. Soft delete consistency (DI-01)
- [ ] Audit models with `deletedAt` field — ensure all queries filter it out

---

## Phase 7 — User-Reported TODOs

### 7a. Fix whiteboard eraser tool (TODO #42)
- [ ] Diagnose why eraser doesn't remove paths/dots
- [ ] Fix hit detection for paths and dots
- [ ] Test with various stroke types (freehand, line, rect, circle, arrow)
- [ ] Add drag-erase support (erase while dragging, not just click)

### 7b. Group resize + rotate from bbox edges (TODO #43)
- [ ] Add resize handles to group bounding box corners (both whiteboard + schema)
- [ ] Scale all selected items relative to group center on resize drag
- [ ] Add rotation handle outside group bbox bottom-right
- [ ] Rotate all selected items around group center, maintaining relative positions
- [ ] Works for paths, dots, stickies, media (whiteboard) and entities (schema)

---

## Phase 8 — Validation + Testing

- [ ] Run full Playwright suite
- [ ] Security-specific tests: verify headers, rate limit, no token leak
- [ ] Performance baseline: Lighthouse scores on main pages
- [ ] Accessibility audit via axe-core or Playwright a11y checks
- [ ] Re-run audit-system-agent to confirm score improvements
- [ ] Update `14_audit-cycles/cycle-001/report.md` with final scores
