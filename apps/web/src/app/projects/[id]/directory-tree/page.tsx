"use client";

import { useState, useEffect, use, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Types (matching @idea-management/schemas DirectoryTree)            */
/* ------------------------------------------------------------------ */

interface TreeNode {
  name: string;
  type: "file" | "directory";
  children: TreeNode[];
  template?: string;
}

interface DirectoryTree {
  root: TreeNode;
  metadata: {
    generatedAt?: string;
    template?: string;
  };
}

/* ------------------------------------------------------------------ */
/*  Templates                                                          */
/* ------------------------------------------------------------------ */

const TEMPLATES: Record<string, TreeNode> = {
  "web-app": {
    name: "web-app",
    type: "directory",
    children: [
      {
        name: "src",
        type: "directory",
        children: [
          {
            name: "app",
            type: "directory",
            children: [
              { name: "page.tsx", type: "file", children: [] },
              { name: "layout.tsx", type: "file", children: [] },
              { name: "globals.css", type: "file", children: [] },
            ],
          },
          {
            name: "components",
            type: "directory",
            children: [
              { name: "header.tsx", type: "file", children: [] },
              { name: "footer.tsx", type: "file", children: [] },
            ],
          },
          {
            name: "lib",
            type: "directory",
            children: [
              { name: "utils.ts", type: "file", children: [] },
            ],
          },
        ],
      },
      { name: "public", type: "directory", children: [] },
      { name: "package.json", type: "file", children: [] },
      { name: "tsconfig.json", type: "file", children: [] },
      { name: "README.md", type: "file", children: [] },
    ],
  },
  api: {
    name: "api",
    type: "directory",
    children: [
      {
        name: "src",
        type: "directory",
        children: [
          {
            name: "routes",
            type: "directory",
            children: [
              { name: "index.ts", type: "file", children: [] },
              { name: "health.ts", type: "file", children: [] },
            ],
          },
          {
            name: "middleware",
            type: "directory",
            children: [
              { name: "auth.ts", type: "file", children: [] },
              { name: "logger.ts", type: "file", children: [] },
            ],
          },
          {
            name: "services",
            type: "directory",
            children: [],
          },
          { name: "index.ts", type: "file", children: [] },
        ],
      },
      {
        name: "tests",
        type: "directory",
        children: [],
      },
      { name: "package.json", type: "file", children: [] },
      { name: "tsconfig.json", type: "file", children: [] },
      { name: "Dockerfile", type: "file", children: [] },
    ],
  },
  library: {
    name: "library",
    type: "directory",
    children: [
      {
        name: "src",
        type: "directory",
        children: [
          { name: "index.ts", type: "file", children: [] },
        ],
      },
      {
        name: "tests",
        type: "directory",
        children: [
          { name: "index.test.ts", type: "file", children: [] },
        ],
      },
      { name: "package.json", type: "file", children: [] },
      { name: "tsconfig.json", type: "file", children: [] },
      { name: "README.md", type: "file", children: [] },
    ],
  },
  monorepo: {
    name: "monorepo",
    type: "directory",
    children: [
      {
        name: "apps",
        type: "directory",
        children: [
          {
            name: "web",
            type: "directory",
            children: [
              { name: "src", type: "directory", children: [] },
              { name: "package.json", type: "file", children: [] },
            ],
          },
          {
            name: "api",
            type: "directory",
            children: [
              { name: "src", type: "directory", children: [] },
              { name: "package.json", type: "file", children: [] },
            ],
          },
        ],
      },
      {
        name: "packages",
        type: "directory",
        children: [
          {
            name: "shared",
            type: "directory",
            children: [
              { name: "src", type: "directory", children: [] },
              { name: "package.json", type: "file", children: [] },
            ],
          },
        ],
      },
      { name: "package.json", type: "file", children: [] },
      { name: "pnpm-workspace.yaml", type: "file", children: [] },
      { name: "turbo.json", type: "file", children: [] },
    ],
  },
};

const DEFAULT_ROOT: TreeNode = {
  name: "project",
  type: "directory",
  children: [],
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function treeToAscii(node: TreeNode, prefix: string = "", isLast: boolean = true, isRoot: boolean = true): string {
  let result = "";
  if (isRoot) {
    result += `${node.name}/\n`;
  } else {
    const connector = isLast ? "\u2514\u2500\u2500 " : "\u251C\u2500\u2500 ";
    const suffix = node.type === "directory" ? "/" : "";
    result += `${prefix}${connector}${node.name}${suffix}\n`;
  }

  const childPrefix = isRoot ? "" : prefix + (isLast ? "    " : "\u2502   ");
  const sortedChildren = [...node.children].sort((a, b) => {
    if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  for (let i = 0; i < sortedChildren.length; i++) {
    const child = sortedChildren[i];
    const childIsLast = i === sortedChildren.length - 1;
    result += treeToAscii(child, childPrefix, childIsLast, false);
  }
  return result;
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/** Find a node by path (array of names from root). Returns [parentChildren, index] */
function findNode(
  root: TreeNode,
  path: string[]
): TreeNode | null {
  if (path.length === 0) return root;
  let current = root;
  for (const segment of path) {
    const child = current.children.find((c) => c.name === segment);
    if (!child) return null;
    current = child;
  }
  return current;
}

function findParentAndIndex(
  root: TreeNode,
  path: string[]
): { parent: TreeNode; index: number } | null {
  if (path.length === 0) return null; // root has no parent
  const parentPath = path.slice(0, -1);
  const parent = findNode(root, parentPath);
  if (!parent) return null;
  const name = path[path.length - 1];
  const idx = parent.children.findIndex((c) => c.name === name);
  if (idx === -1) return null;
  return { parent, index: idx };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function DirectoryTreePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);

  const [root, setRoot] = useState<TreeNode>(deepClone(DEFAULT_ROOT));
  const [metadata, setMetadata] = useState<DirectoryTree["metadata"]>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection: path from root (array of names)
  const [selectedPath, setSelectedPath] = useState<string[] | null>(null);

  // Rename
  const [renamingPath, setRenamingPath] = useState<string[] | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Delete confirm
  const [deletingPath, setDeletingPath] = useState<string[] | null>(null);

  // Expanded state
  const [expanded, setExpanded] = useState<Set<string>>(new Set([""]));

  const artifactUrl = `/api/projects/${projectId}/artifacts/directory-tree/tree.plan.json`;

  const persist = useCallback(
    async (tree: DirectoryTree) => {
      await fetch(artifactUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(tree),
      });
    },
    [artifactUrl]
  );

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(artifactUrl, { credentials: "include" });
        if (res.ok) {
          const data: DirectoryTree = await res.json();
          setRoot(data.root ?? deepClone(DEFAULT_ROOT));
          setMetadata(data.metadata ?? {});
          // Auto-expand root
          setExpanded(new Set([""]));
        } else if (res.status === 404) {
          setRoot(deepClone(DEFAULT_ROOT));
        } else {
          setError("Failed to load directory tree");
        }
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [artifactUrl]);

  function update(newRoot: TreeNode, newMeta?: DirectoryTree["metadata"]) {
    setRoot(newRoot);
    const m = newMeta ?? metadata;
    setMetadata(m);
    persist({ root: newRoot, metadata: m });
  }

  /* ---------- Operations ---------- */

  function addChild(type: "file" | "directory") {
    const newRoot = deepClone(root);
    const parentPath = selectedPath ?? [];
    const parent = findNode(newRoot, parentPath);
    if (!parent || parent.type !== "directory") return;

    const baseName = type === "directory" ? "new-folder" : "new-file.ts";
    let name = baseName;
    let counter = 1;
    while (parent.children.some((c) => c.name === name)) {
      name = type === "directory"
        ? `new-folder-${counter}`
        : `new-file-${counter}.ts`;
      counter++;
    }

    parent.children.push({ name, type, children: [] });
    update(newRoot);

    // Expand parent
    const pathKey = parentPath.join("/");
    setExpanded((prev) => new Set([...prev, pathKey]));
  }

  function handleRename(path: string[]) {
    if (!renameValue.trim() || !path.length) return;
    const newRoot = deepClone(root);
    const node = findNode(newRoot, path);
    if (!node) return;

    // Check for duplicate in parent
    const parentPath = path.slice(0, -1);
    const parent = findNode(newRoot, parentPath);
    if (parent && parent.children.some((c) => c.name === renameValue.trim() && c !== node)) {
      return; // duplicate name
    }

    node.name = renameValue.trim();
    update(newRoot);
    setRenamingPath(null);
    setRenameValue("");
  }

  function handleDelete(path: string[]) {
    const newRoot = deepClone(root);
    const result = findParentAndIndex(newRoot, path);
    if (!result) return;
    result.parent.children.splice(result.index, 1);
    update(newRoot);
    setDeletingPath(null);
    setSelectedPath(null);
  }

  function applyTemplate(templateKey: string) {
    const template = TEMPLATES[templateKey];
    if (!template) return;
    const newRoot = deepClone(template);
    update(newRoot, {
      generatedAt: new Date().toISOString(),
      template: templateKey,
    });
    setSelectedPath(null);
    setExpanded(new Set([""]));
  }

  /* ---------- Tree rendering ---------- */

  function toggleExpand(pathKey: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(pathKey)) next.delete(pathKey);
      else next.add(pathKey);
      return next;
    });
  }

  function renderNode(node: TreeNode, path: string[], depth: number): React.ReactElement {
    const pathKey = path.join("/");
    const isExpanded = expanded.has(pathKey);
    const isSelected =
      selectedPath !== null && selectedPath.join("/") === pathKey;
    const isRenaming =
      renamingPath !== null && renamingPath.join("/") === pathKey;
    const isDeleting =
      deletingPath !== null && deletingPath.join("/") === pathKey;

    return (
      <div key={pathKey || "root"}>
        <div
          style={{
            ...s.treeItem,
            paddingLeft: `${12 + depth * 18}px`,
            backgroundColor: isSelected ? "#e8f0fe" : "transparent",
          }}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPath(path);
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            if (path.length > 0) {
              setRenamingPath(path);
              setRenameValue(node.name);
            }
          }}
        >
          {node.type === "directory" ? (
            <span
              style={s.toggleIcon}
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(pathKey);
              }}
            >
              {isExpanded ? "\u25BE" : "\u25B8"}
            </span>
          ) : (
            <span style={s.toggleIcon}>&nbsp;</span>
          )}
          <span style={s.nodeIcon}>
            {node.type === "directory" ? "\uD83D\uDCC1" : "\uD83D\uDCC4"}
          </span>
          {isRenaming ? (
            <input
              style={s.renameInput}
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename(path);
                if (e.key === "Escape") setRenamingPath(null);
              }}
              onBlur={() => handleRename(path)}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span style={s.nodeName}>{node.name}</span>
          )}
        </div>

        {/* Delete confirmation */}
        {isDeleting && (
          <div style={{ ...s.confirmBar, paddingLeft: `${30 + depth * 18}px` }}>
            <span style={{ fontSize: "12px" }}>
              Delete {node.type === "directory" && node.children.length > 0
                ? `folder with ${node.children.length} items`
                : node.name}
              ?
            </span>
            <button style={s.dangerBtn} onClick={() => handleDelete(path)}>
              Delete
            </button>
            <button style={s.ghostBtn} onClick={() => setDeletingPath(null)}>
              Cancel
            </button>
          </div>
        )}

        {/* Children */}
        {node.type === "directory" && isExpanded && (
          <div>
            {[...node.children]
              .sort((a, b) => {
                if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
                return a.name.localeCompare(b.name);
              })
              .map((child) =>
                renderNode(child, [...path, child.name], depth + 1)
              )}
          </div>
        )}
      </div>
    );
  }

  /* ---------- Render ---------- */

  if (loading) {
    return (
      <div style={s.center}>
        <span>Loading directory tree...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={s.center}>
        <span style={{ color: "#d93025" }}>{error}</span>
      </div>
    );
  }

  const selectedNode = selectedPath ? findNode(root, selectedPath) : null;

  return (
    <div style={s.page}>
      {/* Breadcrumb */}
      <nav style={s.breadcrumb}>
        <a href="/dashboard" style={s.breadcrumbLink}>Dashboard</a>
        <span style={s.breadcrumbSep}>/</span>
        <a href={`/projects/${projectId}`} style={s.breadcrumbLink}>Project</a>
        <span style={s.breadcrumbSep}>/</span>
        <span style={s.breadcrumbCurrent}>Directory Tree</span>
      </nav>

      {/* Toolbar */}
      <div style={s.toolbar}>
        <button
          style={s.toolBtn}
          onClick={() => addChild("directory")}
          disabled={selectedNode !== null && selectedNode.type !== "directory"}
        >
          + Folder
        </button>
        <button
          style={s.toolBtn}
          onClick={() => addChild("file")}
          disabled={selectedNode !== null && selectedNode.type !== "directory"}
        >
          + File
        </button>
        {selectedPath && selectedPath.length > 0 && (
          <button
            style={{ ...s.toolBtn, color: "#d93025" }}
            onClick={() => setDeletingPath(selectedPath)}
          >
            Delete
          </button>
        )}
        <div style={{ flex: 1 }} />
        <label style={s.templateLabel}>
          Template:
          <select
            style={s.select}
            value=""
            onChange={(e) => {
              if (e.target.value) applyTemplate(e.target.value);
            }}
          >
            <option value="">Select template...</option>
            <option value="web-app">Web App</option>
            <option value="api">API</option>
            <option value="library">Library</option>
            <option value="monorepo">Monorepo</option>
          </select>
        </label>
        <button
          style={s.primaryBtn}
          onClick={() =>
            update(root, {
              ...metadata,
              generatedAt: new Date().toISOString(),
            })
          }
        >
          Save
        </button>
      </div>

      {/* Two-pane layout */}
      <div style={s.workspace}>
        {/* Tree editor */}
        <div style={s.treePane}>
          <h3 style={s.paneTitle}>Tree Editor</h3>
          <div style={s.treeContainer} onClick={() => setSelectedPath(null)}>
            {renderNode(root, [], 0)}
          </div>
        </div>

        {/* Preview */}
        <div style={s.previewPane}>
          <h3 style={s.paneTitle}>Preview</h3>
          <pre style={s.previewPre}>{treeToAscii(root)}</pre>
          {metadata.template && (
            <div style={s.metaInfo}>
              Template: {metadata.template}
            </div>
          )}
          {metadata.generatedAt && (
            <div style={s.metaInfo}>
              Generated: {new Date(metadata.generatedAt).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const s: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  center: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    fontSize: "14px",
    color: "#888",
  },
  breadcrumb: { fontSize: "13px", padding: "12px 24px 0" },
  breadcrumbLink: { color: "#1a73e8", textDecoration: "none" },
  breadcrumbSep: { margin: "0 6px", color: "#999" },
  breadcrumbCurrent: { color: "#333", fontWeight: 500 },
  toolbar: {
    display: "flex",
    gap: "6px",
    padding: "8px 24px",
    borderBottom: "1px solid #e0e0e0",
    alignItems: "center",
    flexShrink: 0,
    backgroundColor: "#f8f9fa",
  },
  toolBtn: {
    padding: "6px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 500,
  },
  templateLabel: {
    fontSize: "12px",
    color: "#555",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  select: {
    padding: "6px 8px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "12px",
  },
  primaryBtn: {
    padding: "8px 16px",
    backgroundColor: "#1a73e8",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
  },
  workspace: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
  },
  treePane: {
    flex: 1,
    borderRight: "1px solid #e0e0e0",
    overflow: "auto",
    padding: "12px 0",
  },
  previewPane: {
    width: "380px",
    overflow: "auto",
    padding: "12px 16px",
    flexShrink: 0,
  },
  paneTitle: {
    fontSize: "13px",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    color: "#888",
    letterSpacing: "0.5px",
    margin: "0 0 8px",
    padding: "0 16px",
  },
  treeContainer: {
    fontSize: "13px",
    minHeight: "100%",
  },
  treeItem: {
    display: "flex",
    alignItems: "center",
    padding: "3px 0",
    cursor: "pointer",
    gap: "4px",
    userSelect: "none" as const,
    borderRadius: "2px",
  },
  toggleIcon: {
    width: "14px",
    fontSize: "11px",
    color: "#888",
    flexShrink: 0,
    cursor: "pointer",
    textAlign: "center" as const,
    fontFamily: "monospace",
  },
  nodeIcon: {
    fontSize: "13px",
    flexShrink: 0,
  },
  nodeName: {
    fontSize: "13px",
  },
  renameInput: {
    border: "1px solid #1a73e8",
    borderRadius: "3px",
    padding: "2px 6px",
    fontSize: "13px",
    outline: "none",
    width: "160px",
  },
  confirmBar: {
    display: "flex",
    gap: "6px",
    alignItems: "center",
    padding: "4px 16px",
    backgroundColor: "#fff3e0",
    margin: "2px 0",
  },
  dangerBtn: {
    padding: "3px 8px",
    backgroundColor: "#d93025",
    color: "#fff",
    border: "none",
    borderRadius: "3px",
    cursor: "pointer",
    fontSize: "11px",
  },
  ghostBtn: {
    padding: "3px 8px",
    border: "1px solid #ddd",
    borderRadius: "3px",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "11px",
  },
  previewPre: {
    backgroundColor: "#f5f5f5",
    padding: "12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontFamily: "var(--font-geist-mono), monospace",
    overflow: "auto",
    whiteSpace: "pre" as const,
    lineHeight: "1.6",
  },
  metaInfo: {
    fontSize: "11px",
    color: "#888",
    marginTop: "8px",
  },
};
