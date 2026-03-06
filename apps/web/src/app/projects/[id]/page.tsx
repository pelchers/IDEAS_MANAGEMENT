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
          ...treeStyles.treeItem,
          paddingLeft: `${12 + depth * 16}px`,
          cursor: node.isDir ? "pointer" : "default",
        }}
        onClick={() => node.isDir && setExpanded(!expanded)}
      >
        <span style={treeStyles.icon}>
          {node.isDir ? (expanded ? "v " : "> ") : "  "}
        </span>
        <span style={{ fontWeight: node.isDir ? 500 : 400 }}>
          {node.name}
        </span>
        {node.revision !== undefined && (
          <span style={treeStyles.revision}>rev {node.revision}</span>
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
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>Project not found</div>
      </div>
    );
  }

  const fileTree = buildFileTree(project.artifacts);

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <a href="/dashboard" style={styles.backLink}>
            &larr; Projects
          </a>
          <h1 style={styles.title}>{project.name}</h1>
        </div>
        <div style={styles.headerRight}>
          <SyncStatusIndicator state={syncState} lastSyncTime={lastSync} />
          <a
            href={`/projects/${id}/conflicts`}
            style={styles.conflictLink}
          >
            Conflicts
          </a>
        </div>
      </header>

      {/* Two-Pane Layout */}
      <div style={styles.workspace}>
        {/* Left: File Tree */}
        <aside style={styles.sidebar}>
          <h3 style={styles.sidebarTitle}>Project Files</h3>
          <div style={styles.fileTree}>
            {fileTree.map((node) => (
              <FileTreeNode key={node.path} node={node} />
            ))}
          </div>
        </aside>

        {/* Right: Project Overview */}
        <main style={styles.main}>
          <div style={styles.overview}>
            <h2 style={styles.sectionTitle}>Project Overview</h2>
            <div style={styles.metaGrid}>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Status</span>
                <span
                  style={{
                    ...styles.statusBadge,
                    textTransform: "capitalize" as const,
                  }}
                >
                  {project.status.toLowerCase()}
                </span>
              </div>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Members</span>
                <span>{project.members.length}</span>
              </div>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Your Role</span>
                <span style={{ textTransform: "capitalize" as const }}>
                  {project.userRole.toLowerCase()}
                </span>
              </div>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Created</span>
                <span>
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {project.description && (
              <div style={styles.descSection}>
                <h3 style={styles.subTitle}>Description</h3>
                <p style={styles.descText}>{project.description}</p>
              </div>
            )}

            {project.tags.length > 0 && (
              <div style={styles.tagSection}>
                <h3 style={styles.subTitle}>Tags</h3>
                <div style={styles.tagRow}>
                  {project.tags.map((tag) => (
                    <span key={tag} style={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Members */}
            <div style={styles.memberSection}>
              <h3 style={styles.subTitle}>Members</h3>
              {project.members.map((m) => (
                <div key={m.id} style={styles.memberRow}>
                  <span style={styles.memberEmail}>{m.email}</span>
                  <span style={styles.memberRole}>
                    {m.role.toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation to sub-views */}
          <div style={styles.subViewSection}>
            <h3 style={styles.subTitle}>Views</h3>
            <div style={styles.subViewGrid}>
              {SUB_VIEWS.map((view) => (
                <a
                  key={view.path}
                  href={`/projects/${id}/${view.path}`}
                  style={styles.subViewCard}
                >
                  <span style={styles.subViewIcon}>{view.icon}</span>
                  <span style={styles.subViewLabel}>{view.label}</span>
                  {"desc" in view && (
                    <span style={styles.subViewDesc}>{view.desc}</span>
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

const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: "1px solid #e0e0e0",
    flexShrink: 0,
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  backLink: {
    fontSize: "13px",
    color: "#1a73e8",
    textDecoration: "none",
    display: "block",
    marginBottom: "4px",
  },
  title: {
    fontSize: "20px",
    fontWeight: 600,
    margin: 0,
  },
  conflictLink: {
    fontSize: "13px",
    color: "#d93025",
    textDecoration: "none",
    padding: "4px 8px",
    borderRadius: "4px",
    border: "1px solid #d93025",
  },
  workspace: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
  },
  sidebar: {
    width: "280px",
    borderRight: "1px solid #e0e0e0",
    overflow: "auto",
    flexShrink: 0,
    padding: "12px 0",
  },
  sidebarTitle: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#5f6368",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    padding: "0 16px",
    margin: "0 0 8px",
  },
  fileTree: {
    fontSize: "13px",
  },
  main: {
    flex: 1,
    overflow: "auto",
    padding: "24px",
  },
  overview: {
    marginBottom: "24px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: 600,
    margin: "0 0 16px",
  },
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
  },
  metaItem: {
    padding: "12px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
  },
  metaLabel: {
    display: "block",
    fontSize: "11px",
    color: "#888",
    textTransform: "uppercase" as const,
    marginBottom: "4px",
    letterSpacing: "0.3px",
  },
  statusBadge: {
    fontSize: "14px",
    fontWeight: 500,
  },
  descSection: {
    marginBottom: "16px",
  },
  subTitle: {
    fontSize: "14px",
    fontWeight: 600,
    margin: "0 0 8px",
  },
  descText: {
    fontSize: "14px",
    color: "#555",
    lineHeight: "1.5",
    margin: 0,
  },
  tagSection: {
    marginBottom: "16px",
  },
  tagRow: {
    display: "flex",
    gap: "4px",
    flexWrap: "wrap" as const,
  },
  tag: {
    display: "inline-block",
    padding: "2px 8px",
    backgroundColor: "#f1f3f4",
    borderRadius: "4px",
    fontSize: "12px",
    color: "#5f6368",
  },
  memberSection: {
    marginBottom: "16px",
  },
  memberRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #f1f3f4",
    fontSize: "14px",
  },
  memberEmail: {
    color: "#333",
  },
  memberRole: {
    color: "#888",
    textTransform: "capitalize" as const,
    fontSize: "13px",
  },
  subViewSection: {
    marginTop: "16px",
  },
  subViewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "10px",
  },
  subViewCard: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    padding: "16px 12px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    textDecoration: "none",
    color: "inherit",
    transition: "background-color 0.15s",
    backgroundColor: "#fff",
  },
  subViewIcon: {
    fontSize: "20px",
    marginBottom: "6px",
    color: "#1a73e8",
    fontFamily: "var(--font-geist-mono), monospace",
  },
  subViewLabel: {
    fontSize: "13px",
    fontWeight: 500,
  },
  subViewDesc: {
    fontSize: "11px",
    color: "#888",
    textAlign: "center" as const,
    lineHeight: "1.3",
  },
  loadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
  loadingText: {
    fontSize: "14px",
    color: "#888",
  },
};

const treeStyles: Record<string, React.CSSProperties> = {
  treeItem: {
    display: "flex",
    alignItems: "center",
    padding: "4px 0",
    gap: "2px",
    userSelect: "none" as const,
  },
  icon: {
    width: "16px",
    fontSize: "11px",
    color: "#999",
    fontFamily: "monospace",
    flexShrink: 0,
  },
  revision: {
    fontSize: "10px",
    color: "#aaa",
    marginLeft: "auto",
    paddingRight: "12px",
  },
};
