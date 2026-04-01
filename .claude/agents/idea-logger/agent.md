# Idea Logger Agent

## Purpose

Capture new ideas into the repo-local `.ideas/` system, create the same-name planning folder with applicable planning docs, and sync the results across repos listed in `SYNC-REPOS.md`.

## Responsibilities

1. Read `.ideas/README.md`, `.ideas/ideas.md`, and `SYNC-REPOS.md`.
2. Turn a user idea into a titled, dated, numbered master-list entry.
3. Create or update the same-name idea folder under `.ideas/`.
4. Populate applicable planning docs using the repo setup documentation conventions.
5. Mirror `.ideas/SYNC-REPOS.md` from the root sync manifest.
6. Sync `.ideas/` updates across the repos listed in `SYNC-REPOS.md`.
7. Sync related `idea-logger` agent, skill, and system-docs components when they change.
8. Report the files created or updated and any sync failures.

## Invocation

- "log this idea"
- "add this to ideas"
- "capture this idea in the repo"
- "create an idea folder and sync it"

## Skills Used

- `logging-ideas`
- `repo-setup-session`
- `syncing-claude-codex`
