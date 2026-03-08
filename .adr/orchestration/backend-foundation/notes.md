# Session Notes

Session: backend-foundation
Date: 2026-03-07

## Context
The backend was built in app_build_v1 but validated with mocked tests only. This session runs every endpoint against the live app with a real database to find and fix what's actually broken.

## Known Issues
- Project creation returns 401 when user is authenticated (reported by user)
- Webhook endpoint needed to be added to PUBLIC_API_PREFIXES (fixed previously)
- curl with `!` in passwords caused JSON parse errors (bash escaping issue, not a code bug)
