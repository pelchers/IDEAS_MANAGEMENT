# Phase 3: Auth Pages

Session: frontend-shell
Phase: 3
Date: 2026-03-07

## Prior Phase Summary
Phase 2 completed: App shell built with (authenticated) route group layout. AppShell component with hamburger drawer, sidebar nav, top bar, signout, user info. 10/10 validation pass. Commit: 3633a8c.

## Objective
Rebuild signin and signup pages to match pass-1 neo-brutalism concept exactly. Wire to live auth endpoints with proper validation and error handling.

## Tasks
1. Rebuild signin page (`apps/web/src/app/signin/page.tsx`):
   - Match pass-1 styling exactly (centered card, brutalist inputs, bold button)
   - Email + password fields with labels
   - 12+ character password requirement shown
   - Submit button with loading state
   - Error display for invalid credentials
   - Link to signup page
   - Link to forgot password (if page exists)
   - On success: redirect to /dashboard (or redirect param)
   - Wire to POST /api/auth/signin
2. Rebuild signup page (`apps/web/src/app/signup/page.tsx`):
   - Match pass-1 styling exactly
   - Email + password + confirm password fields
   - Client-side validation (email format, 12+ char password, passwords match)
   - Server error display (duplicate email, etc.)
   - Link to signin page
   - On success: redirect to /dashboard
   - Wire to POST /api/auth/signup
3. Add neo-brutalism styled alert/error components for auth feedback
4. Ensure auth pages do NOT use the AppShell (they're outside the (authenticated) route group)
5. Test the full flow: signup -> redirected to dashboard with shell -> signout -> redirected to signin

## Validation
- Pages render with correct neo-brutalism styling
- Forms submit to correct endpoints
- Error states display properly
- Redirect flow works end-to-end
- Report: `.docs/validation/frontend-shell/phase_3/user-story-report.md`

## Output
- Updated signin/signup pages
- `.adr/history/frontend-shell/phase_3_review.md`
- `.docs/validation/frontend-shell/phase_3/user-story-report.md`
- Updated primary task list
