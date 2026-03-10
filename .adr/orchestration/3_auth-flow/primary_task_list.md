# Primary Task List — 3_auth-flow

Session: Authentication Flow
Started: 2026-03-10
Design Fidelity: Faithful (pass-1 brutalism-neobrutalism)

---

## Phase 1 — Auth Pages from Pass-1

- [ ] Read pass-1 signin/signup styling from style.css and index.html
- [ ] Build signin page matching pass-1 neo-brutalist auth styling:
  - Thick bordered form card centered on creamy-milk background
  - Signal-black labels in uppercase Space Grotesk
  - Input fields with 3px black borders, IBM Plex Mono placeholder
  - Watermelon error states, malachite success states
  - Hard shadow submit button with hover/active transforms
- [ ] Build signup page with same styling plus:
  - Email, password (12+ chars), confirm password fields
  - Client-side validation with inline error messages
  - Password strength indicator
- [ ] Verify visual match against pass-1 auth styling

## Phase 2 — Auth API Verification

- [ ] Verify existing auth API routes still work (signup, signin, signout, refresh, verify-email, password-reset, me)
- [ ] Test signup → signin → dashboard redirect flow
- [ ] Test signout clears session cookie
- [ ] Verify route protection middleware redirects unauthenticated users to /signin
- [ ] Fix any API issues found during testing

## Phase 3 — Auth Integration + Testing

- [ ] Wire signin page to POST /api/auth/signin
- [ ] Wire signup page to POST /api/auth/signup
- [ ] Handle error responses with neo-brutalist error display
- [ ] Test full flow: signup → verify → signin → dashboard → signout
- [ ] Playwright screenshots of signin and signup pages (desktop + mobile)
- [ ] User story validation for auth flows
