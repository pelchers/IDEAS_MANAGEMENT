# Notes

## Decisions
- Web-first foundation + early Electron spine (documented in `.docs/planning/technical-specification.md`).
- Cloud-canonical sync with local mirrored workspace (`.docs/planning/sync-strategy.md`).

## Constraints
- Production posture: no MVP shortcuts for auth/subscriptions/security/audit.
- 1,000+ user baseline.

## Open Questions
- Exact pricing tiers and entitlements matrix (needed before Stripe implementation finalization).
- Offline grace period rules for desktop subscription enforcement.
- Whether to support self-hosted/local-only mode as a paid tier or not.

## References
- `.docs/planning/*`
