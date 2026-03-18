# Technical Requirements — 8_simple-views

## Key Files
- `apps/web/src/app/(authenticated)/projects/[id]/ideas/page.tsx`
- `apps/web/src/app/(authenticated)/projects/[id]/directory-tree/page.tsx`
- `apps/web/src/app/(authenticated)/settings/page.tsx`

## API Contracts
- Ideas: GET/PUT /api/projects/[id]/artifacts/ideas/ideas
- Directory Tree: GET/PUT /api/projects/[id]/artifacts/directory-tree/tree.plan.json
- Settings: GET /api/auth/me, POST /api/billing/portal

## Directory Tree Data Model (Artifact JSON)

```typescript
interface TreeNode {
  id: string;
  name: string;
  type: "folder" | "file";
  children?: TreeNode[];
}

interface DirectoryTreeData {
  tree: TreeNode[];
  fileContents: Record<string, string>;  // fileName → content
  source?: {
    type: "manual" | "github" | "local";
    githubRepo?: string;
    importedAt?: string;
  };
}
```

## GitHub API (Directory Tree)
- Same pattern as schema planner (7_schema-planner)
- `GET https://api.github.com/repos/:owner/:repo/git/trees/HEAD?recursive=1` → flat list of blobs/trees
- Convert flat tree to nested TreeNode[]:
  - Split each path by `/`, create intermediate folders
  - Blobs → files, trees → folders
- Lazy-load file content: `GET https://api.github.com/repos/:owner/:repo/contents/:path` → base64 content

## Export Formats

### Text Tree
```
idea-management/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx
│   │   └── Kanban.tsx
│   └── hooks/
│       └── useProjects.ts
├── package.json
└── README.md
```

### JSON
Raw `DirectoryTreeData` object as formatted JSON.

### Markdown
```markdown
- **idea-management/**
  - **src/**
    - **components/**
      - Dashboard.tsx
      - Kanban.tsx
    - **hooks/**
      - useProjects.ts
  - package.json
  - README.md
```
