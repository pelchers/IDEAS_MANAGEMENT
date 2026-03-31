---
name: logging-ideas
description: Logs product or project ideas into the repo-local .ideas system, creates a same-name planning folder with applicable planning docs, and syncs the resulting .ideas files plus related idea-logger components across repos listed in SYNC-REPOS.md. Use when the user asks to capture, log, add, or plan a new idea.
---

# Logging Ideas

Use this skill whenever the user asks to log a new idea, add something to the master ideas list, or create/update an idea planning folder.

## Purpose

Maintain a consistent `.ideas/` workflow across repos:

- capture the idea in `.ideas/ideas.md`
- create or update the same-name idea folder
- populate applicable planning docs using repo-setup conventions
- mirror `.ideas/SYNC-REPOS.md`
- sync the resulting files across repos in `SYNC-REPOS.md`

## Workflow

1. Read `.ideas/README.md`, `.ideas/ideas.md`, and `SYNC-REPOS.md`.
2. Derive or confirm the idea title.
3. Add a new titled, dated, numbered section to `.ideas/ideas.md`.
4. Create a same-name subfolder in `.ideas/`.
5. Populate the applicable planning docs for that idea using the same document style used in `.docs/planning/`.
6. Ensure `.ideas/SYNC-REPOS.md` mirrors the root sync manifest and idea-specific sync rules.
7. If the idea-logger agent/skill/system-docs files changed, sync those too.
8. Mirror the updated `.ideas/` files and related idea-logger components to the repos listed in `SYNC-REPOS.md`.

## Rules

- `ideas.md` is the master list for the repo.
- Folder names must match the exact idea titles used in `ideas.md`.
- Use substantive planning content, not empty placeholders.
- Only create the planning docs that are applicable to the specific idea.
- Preserve existing idea entries unless the user explicitly requests edits or removals.
- Report which repos received sync updates and note any failures.

## Typical Trigger Phrases

- "log this idea"
- "add this to ideas"
- "capture this idea"
- "create an idea folder"
- "plan this idea under .ideas"
