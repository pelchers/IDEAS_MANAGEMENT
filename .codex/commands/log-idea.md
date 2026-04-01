---
name: log-idea
description: Full idea logging workflow — update .ideas/ideas.md, create the same-name planning folder, and sync .ideas plus idea-logger component files
invocable: true
---

# Log Idea (/log-idea)

Capture a new idea into the repo-local `.ideas/` system and create the corresponding planning folder using the repo setup planning conventions.

## Usage
```text
/log-idea "mobile ssh coding companion"
/log-idea "browser extension idea for markdown clipping"
/log-idea
```

## What It Does
1. Updates `.ideas/ideas.md`
2. Creates or updates `.ideas/<Idea Title>/`
3. Writes applicable planning docs for the idea
4. Mirrors `.ideas/SYNC-REPOS.md`
5. Syncs `.ideas` files and idea-logger component files to repos in `SYNC-REPOS.md`

$ARGUMENTS
