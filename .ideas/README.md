# Ideas Folder

This folder stores repo-local idea capture and idea-specific planning artifacts.

## Purpose

Use this folder for random ideas that should be retained even when they are not active build work yet.

## Required Files

- `ideas.md` is the master list of ideas for this repo.
- `SYNC-REPOS.md` mirrors the root sync manifest so idea sync rules are visible from inside this folder.

## Master List Convention

`ideas.md` is the canonical index for this repo's ideas and must:

- use titled, dated, numbered sections
- keep one top-level entry per idea
- use the exact idea title as the subfolder name
- link each idea entry to its matching subfolder
- stay synchronized with the other `ideas.md` files in the repos listed in `SYNC-REPOS.md`

## Idea Folder Convention

Every idea listed in `ideas.md` gets a same-name subfolder under `.ideas/`.

Each idea subfolder should contain the applicable planning files that would normally be generated in `.docs/planning/` by the repo setup workflow. At minimum, create the core planning set when the idea has enough detail:

- `README.md`
- `overview.md`
- `prd.md`
- `technical-specification.md`
- `user-stories.md`
- `milestones.md`
- `risks-and-decisions.md`

Add applicable conditional docs when the idea warrants them, such as:

- `auth-and-subscriptions.md`
- `deployment-and-hosting.md`
- `project-structure-spec.md`
- `sync-strategy.md`

## Sync Requirement

The full `.ideas/` folder is expected to be mirrored to the repos listed in `SYNC-REPOS.md` when idea logging updates are made. This includes:

- `ideas.md`
- `README.md`
- `.ideas/SYNC-REPOS.md`
- idea subfolders and their planning docs

## Naming Rule

Folder names must match the exact titles used in `ideas.md`. If a title changes, rename the folder and update the master list entry in the same change.
