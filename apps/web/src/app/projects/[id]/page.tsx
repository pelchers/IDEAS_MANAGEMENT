"use client";

import { useState, useEffect, use } from "react";
import {
  SyncStatusIndicator,
  type SyncState,
} from "@/components/sync-status-indicator";

interface ProjectDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  tags: string[];
  members: Array<{
    id: string;
    userId: string;
    email: string;
    role: string;
  }>;
  artifacts: Array<{
    artifactPath: string;
    revision: number;
    updatedAt: string;
  }>;
  userRole: string;
  createdAt: string;
  updatedAt: string;
}

/** Build a tree structure from flat artifact paths. */
interface TreeNode {
  name: string;
  path: string;
  isDir: boolean;
  children: TreeNode[];
  revision?: number;
}

function buildFileTree(
  artifacts: ProjectDetail["artifacts"]
): TreeNode[] {
  const root: TreeNode[] = [];

  for (const artifact of artifacts) {
    const parts = artifact.artifactPath.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const isLast = i === parts.length - 1;
      const partialPath = parts.slice(0, i + 1).join("/");

      let existing = current.find((n) => n.name === name);
      if (!existing) {
        existing = {
          name,
          path: partialPath,
          isDir: !isLast,
          children: [],
          revision: isLast ? artifact.revision : undefined,
        };
        current.push(existing);
      }
      if (!isLast) {
        existing.isDir = true;
      }
      current = existing.children;
    }
  }

  return root;
}

function FileTreeNode({
  node,
  depth = 0,
}: {
  node: TreeNode;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(depth < 2);

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "4px 0",
          paddingLeft: `${12 + depth * 16}px`,
          cursor: node.isDir ? "pointer" : "default",
          userSelect: "none",
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
        }}
        onClick={() => node.isDir && setExpanded(!expanded)}
      >
        <span style={{ width: "16px", fontSize: "11px", color: "var(--nb-gray-mid)", flexShrink: 0 }}>
          {node.isDir ? (expanded ? "v " : "> ") : "  "}
        </span>
        <span style={{ fontWeight: node.isDir ? 700 : 400 }}>
          {node.name}
        </span>
        {node.revision !== undefined && (
          <span className="nb-badge nb-badge-neutral" style={{ marginLeft: "auto", marginRight: "12px", fontSize: "10px" }}>
            rev {node.revision}
          </span>
        )}
      </div>
      {node.isDir && expanded && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode key={child.path} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Sub-views navigation links. */
const SUB_VIEWS = [
  { label: "Ideas", path: "ideas", icon: "\uD83D\uDCA1", desc: "Capture and organize ideas" },
  { label: "Kanban", path: "kanban", icon: "\uD83D\uDCCB", desc: "Track work with boards and cards" },
  { label: "Whiteboard", path: "whiteboard", icon: "\uD83C\uDFA8", desc: "Visual canvas for brainstorming" },
  { label: "Schema", path: "schema", icon: "\uD83D\uDDD7\uFE0F", desc: "Design data models and schemas" },
  { label: "Directory Tree", path: "directory-tree", icon: "\uD83D\uDCC2", desc: "Plan project file structure" },
  { label: "AI Chat", path: "ai", icon: "\uD83E\uDD16", desc: "AI-powered project assistant" },
];

export default function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncState, setSyncState] = useState<SyncState>("offline");
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/projects/${id}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setProject(data.project);
          setSyncState("synced");
          setLastSync(new Date().toISOString());
        }
      } catch {
        setSyncState("offline");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="nb-loading" style={{ height: "100vh" }}>
        Loading project...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="nb-empty" style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Project not found
      </div>
    );
  }

  const fileTree = buildFileTree(project.artifacts);

  return (
    <div className="nb-page" style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header className="nb-header" style={{ borderBottom: "var(--border-thick) solid var(--nb-black)" }}>
        <div>
          <a
            href="/dashboard"
            className="nb-btn nb-btn-sm nb-btn-secondary"
            style={{ textDecoration: "none", marginBottom: "var(--space-xs)" }}
          >
            &larr; Projects
          </a>
          <h1 style={{ fontSize: "24px", fontWeight: 900, fontFamily: "var(--font-heading)", margin: 0, textTransform: "uppercase" }}>
            {project.name}
          </h1>
        </div>
        <div className="nb-flex" style={{ gap: "var(--space-sm)", alignItems: "center" }}>
          <SyncStatusIndicator state={syncState} lastSyncTime={lastSync} />
          <a
            href={`/projects/${id}/conflicts`}
            className="nb-btn nb-btn-sm"
            style={{
              textDecoration: "none",
              border: "var(--border-thick) solid var(--nb-black)",
              backgroundColor: "var(--nb-watermelon)",
              color: "var(--nb-black)",
              fontWeight: 700,
            }}
          >
            Conflicts
          </a>
        </div>
      </header>

      {/* Two-Pane Layout */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left: File Tree */}
        <aside className="nb-card" style={{ width: "280px", flexShrink: 0, overflow: "auto", boxShadow: "none", borderRight: "var(--border-thick) solid var(--nb-black)", borderTop: "none", borderBottom: "none", borderLeft: "none" }}>
          <h3 className="nb-label" style={{ padding: "var(--space-sm) var(--space-md)" }}>
            Project Files
          </h3>
          <div>
            {fileTree.map((node) => (
              <FileTreeNode key={node.path} node={node} />
            ))}
          </div>
        </aside>

        {/* Right: Project Overview */}
        <main style={{ flex: 1, overflow: "auto", padding: "var(--space-lg)" }}>
          <div style={{ marginBottom: "var(--space-lg)" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 900, fontFamily: "var(--font-heading)", margin: "0 0 var(--space-md)", textTransform: "uppercase" }}>
              Project Overview
            </h2>
            <div className="nb-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "var(--space-sm)", marginBottom: "var(--space-md)" }}>
              <div className="nb-card" style={{ padding: "var(--space-sm)" }}>
                <span className="nb-label">Status</span>
                <span className="nb-badge nb-badge-cornflower" style={{ textTransform: "capitalize" }}>
                  {project.status.toLowerCase()}
                </span>
              </div>
              <div className="nb-card" style={{ padding: "var(--space-sm)" }}>
                <span className="nb-label">Members</span>
                <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>{project.members.length}</span>
              </div>
              <div className="nb-card" style={{ padding: "var(--space-sm)" }}>
                <span className="nb-label">Your Role</span>
                <span className="nb-badge nb-badge-amethyst" style={{ textTransform: "capitalize" }}>
                  {project.userRole.toLowerCase()}
                </span>
              </div>
              <div className="nb-card" style={{ padding: "var(--space-sm)" }}>
                <span className="nb-label">Created</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}>
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {project.description && (
              <div className="nb-card" style={{ marginBottom: "var(--space-md)", padding: "var(--space-md)" }}>
                <h3 className="nb-label">Description</h3>
                <p style={{ fontSize: "14px", lineHeight: "1.6", margin: 0, fontFamily: "var(--font-body)" }}>
                  {project.description}
                </p>
              </div>
            )}

            {project.tags.length > 0 && (
              <div style={{ marginBottom: "var(--space-md)" }}>
                <h3 className="nb-label">Tags</h3>
                <div className="nb-flex-wrap" style={{ gap: "var(--space-xs)" }}>
                  {project.tags.map((tag) => (
                    <span key={tag} className="nb-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Members */}
            <div style={{ marginBottom: "var(--space-md)" }}>
              <h3 className="nb-label">Members</h3>
              {project.members.map((m) => (
                <div
                  key={m.id}
                  className="nb-divider"
                  style={{ display: "flex", justifyContent: "space-between", padding: "var(--space-xs) 0", fontSize: "14px" }}
                >
                  <span style={{ fontWeight: 700 }}>{m.email}</span>
                  <span className="nb-badge nb-badge-neutral" style={{ textTransform: "capitalize" }}>
                    {m.role.toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation to sub-views */}
          <div>
            <h3 className="nb-label">Views</h3>
            <div className="nb-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "var(--space-sm)" }}>
              {SUB_VIEWS.map((view) => (
                <a
                  key={view.path}
                  href={`/projects/${id}/${view.path}`}
                  className="nb-card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "var(--space-md) var(--space-sm)",
                    textDecoration: "none",
                    color: "inherit",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: "24px", marginBottom: "var(--space-xs)", fontFamily: "var(--font-mono)" }}>
                    {view.icon}
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: 900, fontFamily: "var(--font-heading)", textTransform: "uppercase" }}>
                    {view.label}
                  </span>
                  {"desc" in view && (
                    <span style={{ fontSize: "11px", color: "var(--nb-gray-dark)", textAlign: "center", lineHeight: "1.3", fontFamily: "var(--font-mono)" }}>
                      {view.desc}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
