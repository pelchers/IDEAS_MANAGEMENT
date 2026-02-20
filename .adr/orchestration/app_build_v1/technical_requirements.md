# Technical Requirements (Orchestration Pointer)

Primary source: `.docs/planning/technical-specification.md`

## Additional Requirements For Orchestration

## Stack / Runtime
- Monorepo with shared packages for 1-to-1 web/desktop behavior.
- Early Electron spine required to validate filesystem + sync queue constraints.

## Data / Storage
- PostgreSQL for accounts/projects/entitlements/audit logs.
- Object storage for binary assets (whiteboard images, exports).
- Local project mirror format as defined in `.docs/planning/project-structure-spec.md`.

## Security / Compliance
- Subscription gating enforced server-side and mirrored client-side.
- Admin override account for internal testing with explicit audit logging.
- AI tool actions are allowlisted, validated, and auditable.

## Performance
- Targets as defined in `.docs/planning/technical-specification.md`.

## Testing / Validation
- Required: auth/session regression tests, entitlement gate tests, Stripe webhook idempotency tests.
- Required: sync queue tests and conflict-path tests.
- Required: smoke E2E for core flows (login -> project -> ideas -> AI add idea -> sync).

## Deployment
- Hosting plan as defined in `.docs/planning/deployment-and-hosting.md`.
