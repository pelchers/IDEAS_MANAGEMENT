# Sync Strategy

## Core Sync Question

This product does not begin with cross-device collaborative sync in the same sense as a cloud editor. Its first sync problem is session continuity between a phone client and a PC host.

## Recommended Strategy

- treat the PC as the source of truth for filesystem and repository state
- treat the mobile client as a remote projection and control surface
- cache recent hosts, sessions, and repo metadata locally on the phone
- add a host-side metadata cache if repeated repo scans become too slow

## Future Expansion

If the product later adds account systems or multi-device relay access, introduce a backend for:

- encrypted host registry
- session metadata
- relay connectivity
- notification routing

That backend should still avoid becoming the source of truth for the host filesystem itself.
