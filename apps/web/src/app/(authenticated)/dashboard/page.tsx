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
  PLANNING: "project-status project-status--planning",
  ACTIVE: "project-status project-status--active",
  PAUSED: "project-status project-status--paused",
  ARCHIVED: "nb-badge nb-badge-neutral",
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("updated");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const fetchProjects = useCallback(async () => {
    try {
      setError("");
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
      } else {
        setError("Failed to load projects");
      }
    } catch {
      setError("Network error");
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
    setCreateError("");
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
      } else {
        const data = await res.json().catch(() => ({}));
        setCreateError(data.error || "Failed to create project");
      }
    } catch {
      setCreateError("Network error");
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
      <div className="nb-loading nb-loading-pulse">
        LOADING PROJECTS...
      </div>
    );
  }

  return (
    <div className="nb-page">
      {/* Header */}
      <div className="view-header">
        <h1 className="view-title">PROJECTS</h1>
        <button
          className="brutalist-btn brutalist-btn--primary"
          onClick={() => setShowCreateForm(true)}
        >
          + NEW PROJECT
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="nb-form-error" style={{ marginBottom: "var(--space-md)" }}>
          {error}
        </div>
      )}

      {/* Create project form */}
      {showCreateForm && (
        <div className="project-create-card">
          <h3>CREATE NEW PROJECT</h3>
          <div className="nb-form-group">
            <input
              type="text"
              className="nb-input"
              placeholder="PROJECT NAME"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateProject();
                if (e.key === "Escape") {
                  setShowCreateForm(false);
                  setNewProjectName("");
                  setNewProjectDesc("");
                }
              }}
            />
          </div>
          <div className="nb-form-group">
            <textarea
              className="nb-input"
              placeholder="DESCRIPTION (OPTIONAL)"
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              rows={3}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setShowCreateForm(false);
                  setNewProjectName("");
                  setNewProjectDesc("");
                }
              }}
            />
          </div>
          {createError && (
            <div className="nb-form-error">{createError}</div>
          )}
          <div className="nb-form-actions">
            <button
              className="nb-btn nb-btn-secondary"
              onClick={() => {
                setShowCreateForm(false);
                setNewProjectName("");
                setNewProjectDesc("");
                setCreateError("");
              }}
            >
              CANCEL
            </button>
            <button
              className="nb-btn nb-btn-success"
              onClick={handleCreateProject}
              disabled={creating || !newProjectName.trim()}
            >
              {creating ? "CREATING..." : "CREATE"}
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="dashboard-toolbar">
        <input
          type="text"
          className="nb-input"
          placeholder="SEARCH PROJECTS..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="nb-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="updated">LAST UPDATED</option>
          <option value="created">CREATED</option>
          <option value="name">NAME</option>
        </select>
        <select
          className="nb-select"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
        >
          <option value="desc">NEWEST FIRST</option>
          <option value="asc">OLDEST FIRST</option>
        </select>
        <select
          className="nb-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">ALL STATUSES</option>
          <option value="PLANNING">PLANNING</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="PAUSED">PAUSED</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>
        <div className="dashboard-view-toggle">
          <button
            className={`nb-btn nb-btn-sm ${viewMode === "grid" ? "nb-btn-info" : "nb-btn-secondary"}`}
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
            aria-pressed={viewMode === "grid"}
          >
            GRID
          </button>
          <button
            className={`nb-btn nb-btn-sm ${viewMode === "list" ? "nb-btn-info" : "nb-btn-secondary"}`}
            onClick={() => setViewMode("list")}
            aria-label="List view"
            aria-pressed={viewMode === "list"}
          >
            LIST
          </button>
        </div>
      </div>

      {/* Content */}
      {projects.length === 0 ? (
        <div className="nb-empty">
          <span className="nb-empty-icon">&#9670;</span>
          <p className="nb-empty-text">NO PROJECTS FOUND</p>
          <button
            className="nb-btn nb-btn-primary nb-mt-md"
            onClick={() => setShowCreateForm(true)}
          >
            CREATE YOUR FIRST PROJECT
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="projects-grid">
          {projects.map((p) => (
            <a
              key={p.id}
              href={`/projects/${p.id}`}
              className="project-card"
              style={{ display: "block", textDecoration: "none", color: "inherit" }}
            >
              <div className="project-card-header">
                <h3 className="project-title">{p.name}</h3>
                <span className={STATUS_CLASS[p.status] || "nb-badge nb-badge-neutral"}>
                  {p.status}
                </span>
              </div>
              {p.description && (
                <p className="project-desc" style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical" as const,
                }}>
                  {p.description}
                </p>
              )}
              {p.tags.length > 0 && (
                <div className="nb-flex nb-flex-wrap nb-mb-sm">
                  {p.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="nb-tag">{tag}</span>
                  ))}
                </div>
              )}
              <div className="project-meta">
                <span>{p.memberCount} member{p.memberCount !== 1 ? "s" : ""}</span>
                <span>{formatDate(p.updatedAt)}</span>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="project-list">
          {projects.map((p) => (
            <a
              key={p.id}
              href={`/projects/${p.id}`}
              className="project-list-item"
            >
              <div className="project-list-left">
                <h3>{p.name}</h3>
                <span className={STATUS_CLASS[p.status] || "nb-badge nb-badge-neutral"}>
                  {p.status}
                </span>
                {p.description && (
                  <span className="project-list-desc">
                    {p.description}
                  </span>
                )}
              </div>
              <div className="project-list-right">
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
