---
name: sync
description: Sync .claude/ and .codex/ directories + external repos
invocable: true
---

# Sync (/sync)

Sync files between .claude/ and .codex/ directories and optionally to external repos.

## Usage
```
/sync                     # sync everything .claude/ ↔ .codex/
/sync agents              # sync just agents
/sync skills              # sync just skills
/sync system_docs         # sync just system docs
/sync repos               # sync to all SYNC-REPOS.md repos
/sync --check             # report what's out of sync without fixing
```

$ARGUMENTS
