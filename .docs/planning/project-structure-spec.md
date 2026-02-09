# Project Folder Structure Spec

## Root Layout
```text
<ProjectRoot>/
  project.json
  planning/
    prd.md
    trd.md
    notes.md
  kanban/
    board.json
  whiteboard/
    board.json
    assets/
  schema/
    schema.graph.json
    exports/
  directory-tree/
    tree.plan.json
    generated/
  ideas/
    ideas.json
  ai/
    chats/
      default.ndjson
  .meta/
    sync.json
    snapshots/
```

## Mapping Rules
- App routes map directly to these folders/files.
- If a required file is missing, the app offers to create it from template.
- `project.json` is the source of truth for project descriptors in workspace UI.
- Local changes must update `.meta/sync.json` revision metadata.

## Sync Contract
- Local client writes first, then queues cloud sync.
- Cloud remains canonical for account-bound synchronized state.
- If conflict cannot be auto-merged, user resolves through conflict UI.

## project.json Core Fields
- `id`, `name`, `slug`
- `description`, `status`, `tags[]`
- `ownerId`, `collaborators[]`
- `goals[]`, `techStack[]`
- `links{}`
- `sync{ cloudProjectId, lastSyncedAt, revision }`
- `createdAt`, `updatedAt`
