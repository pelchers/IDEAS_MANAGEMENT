# Risks and Decisions

## Key Risks
- Auth/session bugs causing unauthorized access or lockouts.
- Subscription entitlement drift between Stripe and app state.
- Local/cloud sync conflicts causing user confusion.
- Canvas performance degradation on large whiteboards.
- AI tool misuse leading to unintended file mutations.

## Mitigations
- Defense-in-depth auth checks and regression test suites.
- Idempotent Stripe webhook processing with reconciliation jobs.
- Versioned sync operations + conflict-resolution UI.
- Virtualized rendering and selective redraw for large canvases.
- Tool allowlists, confirmations, and immutable audit logs.

## Confirmed Decisions
- Keep Electron for desktop and Next.js for web with shared domain packages.
- Build production-grade system from initial release (not MVP-scoped).
- Use cloud-canonical sync with local mirrored project workspaces.
- Include AI chat (full page + sidebar) in Phase 1 foundation.
- Enforce auth + subscription gates on both web and desktop clients.
