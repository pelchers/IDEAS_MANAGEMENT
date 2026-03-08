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

const STATUS_CLASS: Record<string, string> = {
  PLANNING: "nb-badge nb-status-planning",
  ACTIVE: "nb-badge nb-status-active",
  PAUSED: "nb-badge nb-status-paused",
  ARCHIVED: "nb-badge nb-status-archived",
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
    return <div className="nb-loading">Loading Projects...</div>;
  }

  return (
    <div className="nb-page">
      <header className="nb-header">
        <h1>Projects</h1>
        <button
          className="nb-btn nb-btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          + New Project
        </button>
      </header>

      {showCreateForm && (
        <div className="nb-card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16 }}>Create New Project</h3>
          <div className="nb-form-group">
            <input
              type="text"
              className="nb-input"
              placeholder="Project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="nb-form-group">
            <textarea
              className="nb-input"
              placeholder="Description (optional)"
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              style={{ minHeight: 60, resize: "vertical" }}
            />
          </div>
          <div className="nb-form-actions">
            <button
              className="nb-btn nb-btn-secondary"
              onClick={() => {
                setShowCreateForm(false);
                setNewProjectName("");
                setNewProjectDesc("");
              }}
            >
              Cancel
            </button>
            <button
              className="nb-btn nb-btn-success"
              onClick={handleCreateProject}
              disabled={creating || !newProjectName.trim()}
              style={{ opacity: creating || !newProjectName.trim() ? 0.5 : 1 }}
            >
              {creating ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      )}

      <div className="nb-flex nb-flex-wrap" style={{ marginBottom: 20 }}>
        <input
          type="text"
          className="nb-input"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select
          className="nb-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="updated">Last Updated</option>
          <option value="created">Created</option>
          <option value="name">Name</option>
        </select>
        <select
          className="nb-select"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
        <select
          className="nb-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="PLANNING">Planning</option>
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <div className="nb-flex" style={{ gap: 0 }}>
          <button
            className={`nb-btn nb-btn-sm ${viewMode === "grid" ? "nb-btn-info" : "nb-btn-secondary"}`}
            onClick={() => setViewMode("grid")}
          >
            Grid
          </button>
          <button
            className={`nb-btn nb-btn-sm ${viewMode === "list" ? "nb-btn-info" : "nb-btn-secondary"}`}
            onClick={() => setViewMode("list")}
            style={{ marginLeft: -4 }}
          >
            List
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="nb-empty">
          <p style={{ marginBottom: 16 }}>No projects found.</p>
          <button
            className="nb-btn nb-btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            Create your first project
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="nb-grid nb-grid-2">
          {projects.map((p) => (
            <a key={p.id} href={`/projects/${p.id}`} className="nb-card" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <h3 style={{ flex: 1, margin: 0 }}>{p.name}</h3>
                <span className={STATUS_CLASS[p.status] || "nb-badge nb-badge-neutral"}>
                  {p.status.toLowerCase()}
                </span>
              </div>
              {p.description && (
                <p style={{ fontSize: 14, color: "var(--nb-gray-mid)", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                  {p.description}
                </p>
              )}
              {p.tags.length > 0 && (
                <div className="nb-flex nb-flex-wrap" style={{ marginBottom: 8 }}>
                  {p.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="nb-tag">{tag}</span>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "var(--border-thick)", paddingTop: 8, marginTop: 4 }}>
                <span className="nb-label" style={{ marginBottom: 0 }}>
                  {p.memberCount} member{p.memberCount !== 1 ? "s" : ""}
                </span>
                <span className="nb-label" style={{ marginBottom: 0 }}>
                  {formatDate(p.updatedAt)}
                </span>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {projects.map((p) => (
            <a key={p.id} href={`/projects/${p.id}`} className="nb-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", textDecoration: "none", color: "inherit", padding: "12px 16px", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, overflow: "hidden" }}>
                <h3 style={{ margin: 0, whiteSpace: "nowrap" }}>{p.name}</h3>
                <span className={STATUS_CLASS[p.status] || "nb-badge nb-badge-neutral"}>
                  {p.status.toLowerCase()}
                </span>
                {p.description && (
                  <span style={{ fontSize: 13, color: "var(--nb-gray-mid)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.description}
                  </span>
                )}
              </div>
              <div className="nb-flex" style={{ flexShrink: 0, gap: 16 }}>
                <span className="nb-label" style={{ marginBottom: 0 }}>
                  {p.memberCount} member{p.memberCount !== 1 ? "s" : ""}
                </span>
                <span className="nb-label" style={{ marginBottom: 0 }}>
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
