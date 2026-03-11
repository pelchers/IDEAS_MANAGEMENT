Phase: phase_1
Session: 3_auth-flow
Date: 2026-03-10
Owner: orchestrator
Status: planned

# Phase 1 — Auth Pages (Signin + Signup)

## Objectives
Build signin and signup pages in the neo-brutalist style using pass-1 form conventions
(thick borders, hard shadows, uppercase labels, Space Grotesk headings, IBM Plex Mono inputs).
Wire them to the existing custom auth API routes.

## Pass-1 Form Reference (style.css lines 1555-1594)
- `.settings-form`: flex column, gap 16px
- `.form-group`: flex column, gap 4px
- `.form-label`: font-heading, 700 weight, 0.8rem, uppercase, letter-spacing 0.1em
- `.form-input`: font-body, 1rem, padding 8px 16px, 3px solid black border, brutal shadow on focus
- Focus: outline none, shadow-brutal, border-color secondary (cornflower blue)
- Colors: watermelon for errors, malachite for success

## Tasks
- [ ] Build signin page at /signin with neo-brutalist form card:
  - Centered card on creamy-milk background with 4px black border + hard shadow
  - "SIGN IN" heading in uppercase Space Grotesk 700
  - Email + password inputs with 3px black borders
  - Submit button with watermelon background, hover transform, hard shadow
  - Error message display with watermelon styling
  - Link to /signup
  - Wire to POST /api/auth/signin
  - Handle redirect query param (from proxy.ts)
- [ ] Build signup page at /signup with matching style:
  - Same card styling as signin
  - Email, password, confirm password fields
  - Client-side Zod validation (email format, 12+ char password, match confirmation)
  - Inline error messages per field
  - Wire to POST /api/auth/signup
  - Link to /signin
- [ ] Verify both pages render correctly with design tokens
- [ ] Test signin flow: form submit → API call → redirect to dashboard
- [ ] Test signup flow: form submit → API call → redirect to signin

## Deliverables
- Signin page matching pass-1 form styling
- Signup page matching pass-1 form styling
- Both wired to existing auth API routes
- Phase review with validation results

## Validation Checklist
- [ ] Signin page uses neo-brutalist form styling (thick borders, hard shadows, uppercase labels)
- [ ] Signup page has client-side validation with inline errors
- [ ] API integration works (signin sets session cookie)
- [ ] Redirect after signin goes to dashboard (or original URL from redirect param)
- [ ] Phase review created
- [ ] Committed
