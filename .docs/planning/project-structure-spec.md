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
```

## Mapping Rules
- App routes map directly to these folders/files.
- If a required file is missing, the app offers to create it from template.
- `project.json` is the source of truth for metadata shown in project overview.

## project.json Core Fields
- `id`, `name`, `slug`
- `description`
- `status`
- `tags[]`
- `createdAt`, `updatedAt`
- `owner`
- `goals[]`
- `techStack[]`
- `links{}`
