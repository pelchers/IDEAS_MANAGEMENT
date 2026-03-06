"use client";

import { useState, useEffect, useCallback } from "react";

interface ProjectSummary {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  tags: string[];
  memberCount: number;
  userRole: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PLANNING: { bg: "#e8f4fd", text: "#1a73e8" },
  ACTIVE: { bg: "#e6f4ea", text: "#1e8e3e" },
  PAUSED: { bg: "#fef7e0", text: "#f9ab00" },
  ARCHIVED: { bg: "#f1f3f4", text: "#5f6368" },
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("updated");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("sort", sortBy);
      params.set("order", sortOrder);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/projects?${params.toString()}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects ?? []);
      }
    } catch {
      // Network error
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, sortOrder, statusFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: newProjectName.trim(),
          description: newProjectDesc.trim(),
        }),
      });
      if (res.ok) {
        setNewProjectName("");
        setNewProjectDesc("");
        setShowCreateForm(false);
        fetchProjects();
      }
    } catch {
      // error
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>Loading projects...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Projects</h1>
        <button
          style={styles.createBtn}
          onClick={() => setShowCreateForm(true)}
        >
          + New Project
        </button>
      </header>

      {/* Create Project Form */}
      {showCreateForm && (
        <div style={styles.createForm}>
          <h3 style={styles.formTitle}>Create New Project</h3>
          <input
            type="text"
            placeholder="Project name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            style={styles.input}
            autoFocus
          />
          <textarea
            placeholder="Description (optional)"
            value={newProjectDesc}
            onChange={(e) => setNewProjectDesc(e.target.value)}
            style={{ ...styles.input, minHeight: "60px", resize: "vertical" }}
          />
          <div style={styles.formActions}>
            <button
              style={styles.cancelBtn}
              onClick={() => {
                setShowCreateForm(false);
                setNewProjectName("");
                setNewProjectDesc("");
              }}
            >
              Cancel
            </button>
            <button
              style={styles.submitBtn}
              onClick={handleCreateProject}
              disabled={creating || !newProjectName.trim()}
            >
              {creating ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      )}

      {/* Filters & Controls */}
      <div style={styles.controls}>
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={styles.select}
        >
          <option value="updated">Last Updated</option>
          <option value="created">Created</option>
          <option value="name">Name</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
          style={styles.select}
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={styles.select}
        >
          <option value="">All Statuses</option>
          <option value="PLANNING">Planning</option>
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <div style={styles.viewToggle}>
          <button
            style={{
              ...styles.viewBtn,
              ...(viewMode === "grid" ? styles.viewBtnActive : {}),
            }}
            onClick={() => setViewMode("grid")}
            title="Grid View"
          >
            Grid
          </button>
          <button
            style={{
              ...styles.viewBtn,
              ...(viewMode === "list" ? styles.viewBtnActive : {}),
            }}
            onClick={() => setViewMode("list")}
            title="List View"
          >
            List
          </button>
        </div>
      </div>

      {/* Project List */}
      {projects.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No projects found.</p>
          <button
            style={styles.createBtn}
            onClick={() => setShowCreateForm(true)}
          >
            Create your first project
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div style={styles.grid}>
          {projects.map((p) => (
            <a
              key={p.id}
              href={`/projects/${p.id}`}
              style={styles.card}
            >
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{p.name}</h3>
                <span
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: STATUS_COLORS[p.status]?.bg ?? "#f1f3f4",
                    color: STATUS_COLORS[p.status]?.text ?? "#5f6368",
                  }}
                >
                  {p.status.toLowerCase()}
                </span>
              </div>
              {p.description && (
                <p style={styles.cardDesc}>{p.description}</p>
              )}
              {p.tags.length > 0 && (
                <div style={styles.tagRow}>
                  {p.tags.slice(0, 4).map((tag) => (
                    <span key={tag} style={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div style={styles.cardFooter}>
                <span style={styles.metaText}>
                  {p.memberCount} member{p.memberCount !== 1 ? "s" : ""}
                </span>
                <span style={styles.metaText}>
                  Updated {formatDate(p.updatedAt)}
                </span>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div style={styles.list}>
          {projects.map((p) => (
            <a
              key={p.id}
              href={`/projects/${p.id}`}
              style={styles.listRow}
            >
              <div style={styles.listMain}>
                <h3 style={styles.listTitle}>{p.name}</h3>
                <span
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: STATUS_COLORS[p.status]?.bg ?? "#f1f3f4",
                    color: STATUS_COLORS[p.status]?.text ?? "#5f6368",
                  }}
                >
                  {p.status.toLowerCase()}
                </span>
                {p.description && (
                  <span style={styles.listDesc}>{p.description}</span>
                )}
              </div>
              <div style={styles.listMeta}>
                <span style={styles.metaText}>
                  {p.memberCount} member{p.memberCount !== 1 ? "s" : ""}
                </span>
                <span style={styles.metaText}>
                  {formatDate(p.updatedAt)}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "24px",
    fontFamily: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  title: {
    fontSize: "24px",
    fontWeight: 600,
    margin: 0,
  },
  createBtn: {
    padding: "8px 16px",
    backgroundColor: "#1a73e8",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
  },
  controls: {
    display: "flex",
    gap: "8px",
    marginBottom: "20px",
    flexWrap: "wrap" as const,
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    minWidth: "200px",
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
  },
  select: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "#fff",
  },
  viewToggle: {
    display: "flex",
    border: "1px solid #ddd",
    borderRadius: "6px",
    overflow: "hidden",
  },
  viewBtn: {
    padding: "8px 12px",
    border: "none",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "13px",
  },
  viewBtnActive: {
    backgroundColor: "#1a73e8",
    color: "#fff",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "16px",
  },
  card: {
    display: "block",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "16px",
    textDecoration: "none",
    color: "inherit",
    transition: "box-shadow 0.2s",
    backgroundColor: "#fff",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "8px",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: 600,
    margin: 0,
    flex: 1,
  },
  cardDesc: {
    fontSize: "14px",
    color: "#666",
    margin: "0 0 8px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as const,
  },
  statusBadge: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: 500,
    textTransform: "capitalize" as const,
    whiteSpace: "nowrap" as const,
    marginLeft: "8px",
    flexShrink: 0,
  },
  tagRow: {
    display: "flex",
    gap: "4px",
    flexWrap: "wrap" as const,
    marginBottom: "8px",
  },
  tag: {
    display: "inline-block",
    padding: "2px 6px",
    backgroundColor: "#f1f3f4",
    borderRadius: "4px",
    fontSize: "11px",
    color: "#5f6368",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    borderTop: "1px solid #f1f3f4",
    paddingTop: "8px",
    marginTop: "4px",
  },
  metaText: {
    fontSize: "12px",
    color: "#999",
  },
  list: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "4px",
  },
  listRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    textDecoration: "none",
    color: "inherit",
    backgroundColor: "#fff",
    gap: "16px",
  },
  listMain: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
    overflow: "hidden",
  },
  listTitle: {
    fontSize: "15px",
    fontWeight: 500,
    margin: 0,
    whiteSpace: "nowrap" as const,
  },
  listDesc: {
    fontSize: "13px",
    color: "#888",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  listMeta: {
    display: "flex",
    gap: "16px",
    flexShrink: 0,
  },
  emptyState: {
    textAlign: "center" as const,
    padding: "60px 20px",
  },
  emptyText: {
    fontSize: "16px",
    color: "#888",
    marginBottom: "16px",
  },
  createForm: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
    backgroundColor: "#fafafa",
  },
  formTitle: {
    fontSize: "16px",
    fontWeight: 600,
    margin: "0 0 12px",
  },
  input: {
    display: "block",
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    marginBottom: "8px",
    boxSizing: "border-box" as const,
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    marginTop: "8px",
  },
  cancelBtn: {
    padding: "8px 16px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "14px",
  },
  submitBtn: {
    padding: "8px 16px",
    backgroundColor: "#1a73e8",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
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
