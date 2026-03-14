# Phase 5: Directory Tree

Session: feature-views
Phase: 5
Date: 2026-03-08

## Objective
Build the directory tree view for visualizing and editing project file structures. Wire to artifact CRUD endpoints.

## Tasks
1. Build directory-tree page at `apps/web/src/app/(authenticated)/projects/[id]/directory-tree/page.tsx`
2. Tree structure: nested folders and files with expand/collapse
3. File/folder icons: folder icon for directories, file icon for files
4. Node operations: create file, create folder, rename, delete, move (drag optional)
5. Expand/collapse: click folder to toggle children visibility
6. Inline rename: double-click to rename
7. Context menu or action buttons for create/delete
8. Wire to GET/PUT /api/projects/[id]/artifacts?type=directory-tree
9. Neo-brutalism styling (monospace font for paths, black borders)

## Data Model:
```json
{
  "tree": {
    "id": "root",
    "name": "project-root",
    "type": "folder",
    "children": [
      {
        "id": "n1",
        "name": "src",
        "type": "folder",
        "children": [
          { "id": "n2", "name": "index.ts", "type": "file" }
        ]
      },
      { "id": "n3", "name": "README.md", "type": "file" }
    ]
  }
}
```

## Output
- Directory tree page component
- `.adr/history/feature-views/phase_5_review.md`
- `.docs/validation/feature-views/phase_5/user-story-report.md`
- Updated primary task list

> **ACCURACY NOTE (2026-03-12):** Tasks 4-7 (node operations: create, rename, delete, move; expand/collapse; inline rename; context menu) were marked complete but are actually non-functional. The directory tree renders mock data only with no real CRUD operations and no GitHub integration. Corrected in Phase B Tier 1 remediation.
