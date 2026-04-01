# Idea Logging Usage Guide

## Quick Start

Ask for an idea to be logged in natural language, for example:

- "log this idea"
- "add this to ideas"
- "create an idea folder for this"

The system should then:

1. update `.ideas/ideas.md`
2. create the same-name idea folder
3. write applicable planning docs
4. sync the changes to the repos listed in `SYNC-REPOS.md`

## Expected Outputs

- a new or updated idea entry in `.ideas/ideas.md`
- a planning subfolder named exactly after the idea title
- mirrored `.ideas` files in sync repos
- mirrored agent/skill/system-doc files when those changed

## Maintenance Rules

- do not change an idea title without renaming its folder
- do not leave empty planning placeholders unless the user explicitly wants a stub
- keep `.ideas/SYNC-REPOS.md` aligned with the root sync manifest

## Troubleshooting

### Sync Repo Missing

If a repo path in `SYNC-REPOS.md` does not exist, record the failure and continue syncing the remaining targets.

### Title Collision

If the same title already exists, update the existing idea unless the user asked for a separate entry.

### Partial Idea Detail

If the user gives only a rough concept, capture the idea anyway and write only the planning docs that are justified by available detail.
