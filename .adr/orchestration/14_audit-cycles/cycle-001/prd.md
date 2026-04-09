# PRD — Audit Cycle 001

**Date**: 2026-04-08
**Status**: In Progress
**Starting Score**: 60.7 / 100 (Grade C)
**Target Score**: 85+ / 100 (Grade B or better)

## Context

First mega audit cycle. Run on a codebase with recent major feature work (Plans #1-6 completed: client-side Ollama, subscription tiers, whiteboard rotation/tools/marquee, schema planner interactive upgrade, canvas tools, zoom/pan, crow's foot notation, side panel, context menus, undo/redo).

The audit-system-agent ran all 10 non-infra audit types (performance, security, SEO, database, accessibility, code, API, infra-app, UX, data integrity) and produced 77 findings across 4 severity levels.

Additionally, two user-reported bugs need fixing alongside the audit remediation:
- Whiteboard eraser tool broken (not erasing paths/dots)
- Marquee selection currently only supports group drag — needs scale + rotate handles on the group bounding box

## Problem Statement

The codebase is functional and well-architected at the foundation level (strict TypeScript, Prisma schema with cascade deletes, solid auth, brutalist design system) but has accumulated technical debt and several critical security/performance issues during rapid feature development:

### Critical (must fix before production)
1. **Email verification token leak** — every signup API response returns the verification token in production
2. **Zero security headers** — no CSP, HSTS, X-Frame-Options, X-Content-Type-Options, or Referrer-Policy
3. **Monolithic client components** — `whiteboard/page.tsx` (2,336 lines) and `schema/page.tsx` (2,853 lines) ship as single unsplit JS bundles

### High severity (23 findings)
- No rate limiting on any auth endpoint
- 70% of API routes lack Zod validation on request bodies
- Accessibility failures (missing alt text, keyboard nav gaps, color contrast issues)
- Missing SEO meta tags, sitemap, robots.txt
- Performance: no memoization, no code splitting, no next/dynamic usage

### Plus open TODOs
- #42 — Whiteboard eraser tool not working
- #43 — Group resize + rotate from marquee bounding box edges

## Scope

**In scope:**
- All 3 critical findings
- All 22 high-severity findings
- The 2 user-reported TODOs
- Selective medium-severity fixes (those with small effort + large impact)

**Out of scope:**
- Low-severity findings (too many, low ROI — deferred to next cycle)
- Full refactor of monolithic components (partial extraction only)
- Infra audit (excluded from this cycle)
- Design system changes

## Success Criteria

- **Security score** ≥ 85 (currently 48)
- **Performance score** ≥ 75 (currently 55)
- **Accessibility score** ≥ 80 (currently 57)
- **API Contract score** ≥ 85 (currently 58)
- **Average score** ≥ 80 (currently 60.7)
- All 3 critical findings resolved
- At least 18 of 23 high findings resolved
- Both TODOs (#42, #43) completed
- All existing tests still pass
- Playwright validation of new security/performance/accessibility features

## Work Breakdown

See `primary_task_list.md` for the phased execution plan.

## References

- Audit summary: `.docs/planning/audits/001.00-summary-2026-04-08.md`
- Individual reports: `.docs/planning/audits/001.01-*` through `001.10-*`
- Existing remediation plans: `.docs/planning/plans/001-security-critical-remediation.md`, `001-performance-code-splitting.md`, `001-api-validation-hardening.md`
