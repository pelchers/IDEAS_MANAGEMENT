# PRD — 3_auth-flow

## Summary
Build auth pages (signin/signup) as faithful pass-1 conversions, verify existing auth API routes, and wire the frontend to the backend for a complete auth flow.

## Goals
- Signin/signup pages visually identical to pass-1 styling
- Full auth flow working: signup → signin → dashboard → signout
- Route protection redirecting unauthenticated users

## Success Criteria
- Playwright screenshots match pass-1 auth styling
- User can create account, sign in, and access dashboard
- Unauthenticated access to /dashboard redirects to /signin
