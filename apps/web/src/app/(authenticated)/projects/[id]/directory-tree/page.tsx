"use client";

import { useState, useEffect, use, useCallback, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  Types (matching phase 5 spec data model)                           */
/* ------------------------------------------------------------------ */

interface TreeNode {
  id: string;
  name: string;
  type: "folder" | "file";
  expanded?: boolean;
  children?: TreeNode[];
}

interface DirectoryTreeData {
  tree: TreeNode;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function uid(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `n-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

const DEFAULT_TREE: TreeNode = {
  id: "root",
  name: "project-root",
  type: "folder",
  expanded: true,
  children: [],
};

/** Find a node by id in the tree. */
function findById(node: TreeNode, id: string): TreeNode | null {
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findById(child, id);
      if (found) return found;
    }
  }
  return null;
}

/** Find the parent of a node by id. Returns parent + index of child. */
function findParentById(
  node: TreeNode,
  targetId: string
): { parent: TreeNode; index: number } | null {
  if (node.children) {
    for (let i = 0; i < node.children.length; i++) {
      if (node.children[i].id === targetId) {
        return { parent: node, index: i };
      }
      const found = findParentById(node.children[i], targetId);
      if (found) return found;
    }
  }
  return null;
}

/** Build an ASCII preview of the tree. */
function treeToAscii(
  node: TreeNode,
  prefix: string = "",
  isLast: boolean = true,
  isRoot: boolean = true
): string {
  let result = "";
  if (isRoot) {
    result += `${node.name}/\n`;
  } else {
    const connector = isLast ? "\u2514\u2500\u2500 " : "\u251C\u2500\u2500 ";
    const suffix = node.type === "folder" ? "/" : "";
    result += `${prefix}${connector}${node.name}${suffix}\n`;
  }

  const childPrefix = isRoot
    ? ""
    : prefix + (isLast ? "    " : "\u2502   ");
  const children = sortedChildren(node);

  for (let i = 0; i < children.length; i++) {
    result += treeToAscii(children[i], childPrefix, i === children.length - 1, false);
  }
  return result;
}

/** Sort children: folders first, then alphabetically. */
function sortedChildren(node: TreeNode): TreeNode[] {
  if (!node.children) return [];
  return [...node.children].sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
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

  const [tree, setTree] = useState<TreeNode>(deepClone(DEFAULT_TREE));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected node id
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Expanded set (by node id)
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["root"]));

  // Rename state
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const artifactUrl = `/api/projects/${projectId}/artifacts/directory-tree/tree.json`;

  // Debounced save
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback(
    async (data: DirectoryTreeData) => {
      setSaving(true);
      try {
        await fetch(artifactUrl, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content: data }),
        });
      } catch {
        // silently fail — user sees stale data on reload
      } finally {
        setSaving(false);
      }
    },
    [artifactUrl]
  );

  const debouncedPersist = useCallback(
    (data: DirectoryTreeData) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => persist(data), 500);
    },
    [persist]
  );

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(artifactUrl, { credentials: "include" });
        if (res.ok) {
          const json = await res.json();
          // API returns { ok, artifact: { content: { tree: {...} } } }
          const content: DirectoryTreeData = json.artifact?.content ?? json;
          if (content.tree) {
            setTree(content.tree);
            // Auto-expand root
            setExpanded(new Set(["root"]));
          } else {
            setTree(deepClone(DEFAULT_TREE));
          }
        } else if (res.status === 404) {
          setTree(deepClone(DEFAULT_TREE));
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

  function updateTree(newTree: TreeNode) {
    setTree(newTree);
    debouncedPersist({ tree: newTree });
  }

  /* ---------- Operations ---------- */

  function addChild(type: "folder" | "file") {
    const newTree = deepClone(tree);
    // Add to selected folder, or root if nothing selected or file selected
    let parentId = selectedId ?? "root";
    const parentNode = findById(newTree, parentId);
    if (!parentNode || parentNode.type !== "folder") {
      // If selected node is a file, add to its parent
      const parentResult = findParentById(newTree, parentId);
      if (parentResult) {
        parentId = parentResult.parent.id;
      } else {
        parentId = "root";
      }
    }

    const parent = findById(newTree, parentId);
    if (!parent) return;
    if (!parent.children) parent.children = [];

    const baseName = type === "folder" ? "new-folder" : "new-file.ts";
    let name = baseName;
    let counter = 1;
    while (parent.children.some((c) => c.name === name)) {
      name =
        type === "folder"
          ? `new-folder-${counter}`
          : `new-file-${counter}.ts`;
      counter++;
    }

    const newNode: TreeNode = {
      id: uid(),
      name,
      type,
      ...(type === "folder" ? { expanded: true, children: [] } : {}),
    };

    parent.children.push(newNode);
    parent.expanded = true;

    // Expand parent in UI
    setExpanded((prev) => new Set([...prev, parentId]));
    updateTree(newTree);

    // Start renaming the new node immediately
    setRenamingId(newNode.id);
    setRenameValue(name);
  }

  function handleRename(id: string) {
    if (!renameValue.trim()) {
      setRenamingId(null);
      return;
    }
    const newTree = deepClone(tree);
    const node = findById(newTree, id);
    if (!node) return;

    // Check for duplicate name in parent
    const parentResult = findParentById(newTree, id);
    if (parentResult) {
      const siblings = parentResult.parent.children ?? [];
      if (siblings.some((c) => c.name === renameValue.trim() && c.id !== id)) {
        // Duplicate name — cancel rename
        setRenamingId(null);
        setRenameValue("");
        return;
      }
    }

    node.name = renameValue.trim();
    updateTree(newTree);
    setRenamingId(null);
    setRenameValue("");
  }

  function handleDelete(id: string) {
    const newTree = deepClone(tree);
    const result = findParentById(newTree, id);
    if (!result) return;
    result.parent.children!.splice(result.index, 1);
    updateTree(newTree);
    setDeletingId(null);
    if (selectedId === id) setSelectedId(null);
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  /* ---------- Tree rendering ---------- */

  function renderNode(node: TreeNode, depth: number): React.ReactElement {
    const isExpanded = expanded.has(node.id);
    const isSelected = selectedId === node.id;
    const isRenaming = renamingId === node.id;
    const isDeleting = deletingId === node.id;
    const isFolder = node.type === "folder";
    const children = sortedChildren(node);

    return (
      <div key={node.id}>
        {/* Node row */}
        <div
          className="dir-node-row"
          style={{
            display: "flex",
            alignItems: "center",
            padding: "5px 8px",
            paddingLeft: `${12 + depth * 20}px`,
            cursor: "pointer",
            gap: "6px",
            userSelect: "none",
            backgroundColor: isSelected ? "var(--nb-lemon)" : "transparent",
            borderBottom: "2px solid var(--nb-black)",
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            fontWeight: isSelected ? 700 : 500,
            transition: "background 150ms ease",
          }}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedId(node.id);
            if (isFolder) toggleExpand(node.id);
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            if (node.id !== "root") {
              setRenamingId(node.id);
              setRenameValue(node.name);
            }
          }}
        >
          {/* Expand/collapse toggle for folders */}
          {isFolder ? (
            <span
              style={{
                width: "14px",
                fontSize: "10px",
                color: "var(--nb-black)",
                flexShrink: 0,
                textAlign: "center",
                fontFamily: "monospace",
                fontWeight: 900,
                lineHeight: 1,
              }}
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
            >
              {isExpanded ? "\u25BC" : "\u25B6"}
            </span>
          ) : (
            <span style={{ width: "14px", flexShrink: 0 }} />
          )}

          {/* Icon */}
          <span style={{ fontSize: "14px", flexShrink: 0, lineHeight: 1 }}>
            {isFolder
              ? isExpanded
                ? "\uD83D\uDCC2"
                : "\uD83D\uDCC1"
              : "\uD83D\uDCC4"}
          </span>

          {/* Name or rename input */}
          {isRenaming ? (
            <input
              className="nb-input"
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename(node.id);
                if (e.key === "Escape") {
                  setRenamingId(null);
                  setRenameValue("");
                }
              }}
              onBlur={() => handleRename(node.id)}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "180px",
                padding: "2px 6px",
                fontSize: "13px",
                marginBottom: 0,
                fontFamily: "var(--font-mono)",
                border: "2px solid var(--nb-black)",
              }}
            />
          ) : (
            <span
              style={{
                fontSize: "13px",
                textTransform: "none",
                fontFamily: "var(--font-mono)",
              }}
            >
              {node.name}
              {isFolder ? "/" : ""}
            </span>
          )}

          {/* Inline action buttons */}
          {isSelected && node.id !== "root" && !isRenaming && (
            <div
              style={{ marginLeft: "auto", display: "flex", gap: "4px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="nb-btn nb-btn-secondary"
                style={{
                  padding: "1px 6px",
                  fontSize: "11px",
                  border: "2px solid var(--nb-black)",
                  boxShadow: "2px 2px 0 var(--nb-black)",
                }}
                onClick={() => {
                  setRenamingId(node.id);
                  setRenameValue(node.name);
                }}
                title="Rename"
              >
                Rename
              </button>
              <button
                className="nb-btn"
                style={{
                  padding: "1px 6px",
                  fontSize: "11px",
                  border: "2px solid var(--nb-black)",
                  boxShadow: "2px 2px 0 var(--nb-black)",
                  color: "var(--nb-watermelon)",
                  fontWeight: 700,
                }}
                onClick={() => setDeletingId(node.id)}
                title="Delete"
              >
                Del
              </button>
            </div>
          )}
        </div>

        {/* Delete confirmation */}
        {isDeleting && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              padding: "6px 16px",
              paddingLeft: `${30 + depth * 20}px`,
              backgroundColor: "var(--nb-lemon)",
              borderBottom: "2px solid var(--nb-black)",
              fontFamily: "var(--font-mono)",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              Delete{" "}
              {isFolder && (node.children?.length ?? 0) > 0
                ? `folder with ${node.children!.length} item${node.children!.length > 1 ? "s" : ""}`
                : `"${node.name}"`}
              ?
            </span>
            <button
              className="nb-btn nb-btn-primary"
              style={{
                padding: "2px 10px",
                fontSize: "11px",
                backgroundColor: "var(--nb-watermelon)",
                border: "2px solid var(--nb-black)",
                boxShadow: "2px 2px 0 var(--nb-black)",
              }}
              onClick={() => handleDelete(node.id)}
            >
              Delete
            </button>
            <button
              className="nb-btn nb-btn-secondary"
              style={{
                padding: "2px 10px",
                fontSize: "11px",
                border: "2px solid var(--nb-black)",
                boxShadow: "2px 2px 0 var(--nb-black)",
              }}
              onClick={() => setDeletingId(null)}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Children (only if folder and expanded) */}
        {isFolder && isExpanded && (
          <div>
            {children.length === 0 && (
              <div
                style={{
                  padding: "4px 8px",
                  paddingLeft: `${30 + depth * 20}px`,
                  fontSize: "12px",
                  fontFamily: "var(--font-mono)",
                  color: "var(--nb-gray-mid)",
                  borderBottom: "1px dashed var(--nb-gray-mid)",
                  fontStyle: "italic",
                }}
              >
                (empty folder)
              </div>
            )}
            {children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  /* ---------- Render ---------- */

  if (loading) {
    return (
      <div
        className="nb-loading"
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-mono)",
          fontSize: "16px",
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        Loading directory tree...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-mono)",
          fontSize: "16px",
          fontWeight: 700,
          color: "var(--nb-watermelon)",
          textTransform: "uppercase",
        }}
      >
        {error}
      </div>
    );
  }

  const isEmpty =
    !tree.children || tree.children.length === 0;

  return (
    <div
      className="nb-page"
      style={{
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 24px 12px",
          borderBottom: "4px solid var(--nb-black)",
          backgroundColor: "var(--nb-cream)",
          flexShrink: 0,
        }}
      >
        {/* Breadcrumb */}
        <nav
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          <a
            href="/dashboard"
            style={{
              color: "var(--nb-black)",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Dashboard
          </a>
          <span style={{ margin: "0 6px", color: "var(--nb-gray-mid)" }}>
            /
          </span>
          <a
            href={`/projects/${projectId}`}
            style={{
              color: "var(--nb-black)",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Project
          </a>
          <span style={{ margin: "0 6px", color: "var(--nb-gray-mid)" }}>
            /
          </span>
          <span style={{ color: "var(--nb-gray-dark)" }}>Directory Tree</span>
        </nav>

        {/* Title + toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "20px",
              fontWeight: 900,
              textTransform: "uppercase",
              margin: 0,
              letterSpacing: "0.05em",
            }}
          >
            Directory Tree
          </h1>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <button
              className="nb-btn nb-btn-primary"
              style={{
                padding: "4px 12px",
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                border: "3px solid var(--nb-black)",
                boxShadow: "var(--shadow-brutal)",
                textTransform: "uppercase",
              }}
              onClick={() => addChild("folder")}
            >
              + Folder
            </button>
            <button
              className="nb-btn nb-btn-info"
              style={{
                padding: "4px 12px",
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                border: "3px solid var(--nb-black)",
                boxShadow: "var(--shadow-brutal)",
                textTransform: "uppercase",
              }}
              onClick={() => addChild("file")}
            >
              + File
            </button>
            {selectedId && selectedId !== "root" && (
              <button
                className="nb-btn"
                style={{
                  padding: "4px 12px",
                  fontSize: "12px",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  border: "3px solid var(--nb-black)",
                  boxShadow: "var(--shadow-brutal)",
                  color: "var(--nb-watermelon)",
                  textTransform: "uppercase",
                }}
                onClick={() => setDeletingId(selectedId)}
              >
                Delete
              </button>
            )}
          </div>

          <div style={{ flex: 1 }} />

          {saving && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--nb-gray-mid)",
                textTransform: "uppercase",
              }}
            >
              Saving...
            </span>
          )}
        </div>
      </div>

      {/* Main content: two-pane layout */}
      {isEmpty ? (
        /* Empty state */
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            padding: "48px 24px",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              lineHeight: 1,
            }}
          >
            {"\uD83D\uDCC2"}
          </div>
          <h2
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "18px",
              fontWeight: 900,
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            No files yet
          </h2>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              color: "var(--nb-gray-mid)",
              margin: 0,
              textAlign: "center",
              maxWidth: "400px",
            }}
          >
            Create your first folder or file to start building your project
            directory structure.
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="nb-btn nb-btn-primary"
              style={{
                padding: "8px 20px",
                fontSize: "14px",
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                border: "3px solid var(--nb-black)",
                boxShadow: "var(--shadow-brutal)",
                textTransform: "uppercase",
              }}
              onClick={() => addChild("folder")}
            >
              + Create Folder
            </button>
            <button
              className="nb-btn nb-btn-info"
              style={{
                padding: "8px 20px",
                fontSize: "14px",
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                border: "3px solid var(--nb-black)",
                boxShadow: "var(--shadow-brutal)",
                textTransform: "uppercase",
              }}
              onClick={() => addChild("file")}
            >
              + Create File
            </button>
          </div>
        </div>
      ) : (
        /* Two-pane layout: tree editor + preview */
        <div
          style={{
            display: "flex",
            flex: 1,
            overflow: "hidden",
          }}
        >
          {/* Tree editor pane */}
          <div
            style={{
              flex: 1,
              borderRight: "4px solid var(--nb-black)",
              overflow: "auto",
              padding: "0",
            }}
          >
            <div
              style={{
                padding: "8px 16px",
                borderBottom: "3px solid var(--nb-black)",
                backgroundColor: "var(--nb-cream)",
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  margin: 0,
                  letterSpacing: "0.05em",
                }}
              >
                Tree Editor
              </h3>
            </div>
            <div
              style={{ fontSize: "13px", minHeight: "100%" }}
              onClick={() => setSelectedId(null)}
            >
              {renderNode(tree, 0)}
            </div>
          </div>

          {/* Preview pane */}
          <div
            style={{
              width: "360px",
              overflow: "auto",
              padding: "0",
              flexShrink: 0,
              backgroundColor: "var(--nb-white)",
            }}
          >
            <div
              style={{
                padding: "8px 16px",
                borderBottom: "3px solid var(--nb-black)",
                backgroundColor: "var(--nb-cream)",
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  margin: 0,
                  letterSpacing: "0.05em",
                }}
              >
                Preview
              </h3>
            </div>
            <div style={{ padding: "12px 16px" }}>
              <pre
                style={{
                  backgroundColor: "var(--nb-cream)",
                  padding: "16px",
                  border: "4px solid var(--nb-black)",
                  fontSize: "12px",
                  fontFamily: "var(--font-mono)",
                  overflow: "auto",
                  whiteSpace: "pre",
                  lineHeight: "1.6",
                  boxShadow: "var(--shadow-brutal)",
                  margin: 0,
                }}
              >
                {treeToAscii(tree)}
              </pre>

              {/* Node count info */}
              <div
                style={{
                  marginTop: "12px",
                  fontSize: "11px",
                  fontFamily: "var(--font-mono)",
                  color: "var(--nb-gray-dark)",
                  textTransform: "uppercase",
                }}
              >
                {countNodes(tree)} items total
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Count total nodes in tree (excluding root). */
function countNodes(node: TreeNode): number {
  let count = 0;
  if (node.children) {
    for (const child of node.children) {
      count += 1 + countNodes(child);
    }
  }
  return count;
}
