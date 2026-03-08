"use client";

import { useState, useEffect, use, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Types (matching @idea-management/schemas IdeaSchema)               */
/* ------------------------------------------------------------------ */

type Priority = "low" | "medium" | "high" | "critical";
type IdeaStatus = "captured" | "exploring" | "validated" | "promoted" | "archived";

interface Idea {
  id: string;
  title: string;
  description: string;
  tags: string[];
  priority: Priority;
  category: string;
  status: IdeaStatus;
  promotedTo?: { type: "kanban" | "whiteboard"; targetId: string };
  createdAt: string;
  updatedAt: string;
}

interface IdeasList {
  ideas: Idea[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function uid(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const PRIORITY_BADGE: Record<Priority, string> = {
  low: "nb-badge-malachite",
  medium: "nb-badge-lemon",
  high: "nb-badge-watermelon",
  critical: "nb-badge-amethyst",
};

const STATUS_LABELS: Record<IdeaStatus, string> = {
  captured: "Captured",
  exploring: "Exploring",
  validated: "Validated",
  promoted: "Promoted",
  archived: "Archived",
};

const STATUS_BADGE: Record<IdeaStatus, string> = {
  captured: "nb-badge-cornflower",
  exploring: "nb-badge-lemon",
  validated: "nb-badge-malachite",
  promoted: "nb-badge-amethyst",
  archived: "nb-badge-neutral",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function IdeasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [addTags, setAddTags] = useState("");
  const [addPriority, setAddPriority] = useState<Priority>("medium");
  const [addCategory, setAddCategory] = useState("general");

  // Edit modal
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editPriority, setEditPriority] = useState<Priority>("medium");
  const [editCategory, setEditCategory] = useState("general");
  const [editStatus, setEditStatus] = useState<IdeaStatus>("captured");

  // Delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* ---------- Persistence ---------- */

  const artifactUrl = `/api/projects/${projectId}/artifacts/ideas/ideas.json`;

  const persist = useCallback(
    async (list: Idea[]) => {
      const body: IdeasList = { ideas: list };
      await fetch(artifactUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
    },
    [artifactUrl]
  );

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(artifactUrl, { credentials: "include" });
        if (res.ok) {
          const data: IdeasList = await res.json();
          setIdeas(data.ideas ?? []);
        } else if (res.status === 404) {
          setIdeas([]);
        } else {
          setError("Failed to load ideas");
        }
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [artifactUrl]);

  /* ---------- CRUD ---------- */

  function handleAdd() {
    if (!addTitle.trim()) return;
    const now = new Date().toISOString();
    const idea: Idea = {
      id: uid(),
      title: addTitle.trim(),
      description: addDesc.trim(),
      tags: addTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      priority: addPriority,
      category: addCategory.trim() || "general",
      status: "captured",
      createdAt: now,
      updatedAt: now,
    };
    const next = [...ideas, idea];
    setIdeas(next);
    persist(next);
    setAddTitle("");
    setAddDesc("");
    setAddTags("");
    setAddPriority("medium");
    setAddCategory("general");
    setShowAddForm(false);
  }

  function openEdit(idea: Idea) {
    setEditingIdea(idea);
    setEditTitle(idea.title);
    setEditDesc(idea.description);
    setEditTags(idea.tags.join(", "));
    setEditPriority(idea.priority);
    setEditCategory(idea.category);
    setEditStatus(idea.status);
  }

  function handleSaveEdit() {
    if (!editingIdea || !editTitle.trim()) return;
    const next = ideas.map((i) =>
      i.id === editingIdea.id
        ? {
            ...i,
            title: editTitle.trim(),
            description: editDesc.trim(),
            tags: editTags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
            priority: editPriority,
            category: editCategory.trim() || "general",
            status: editStatus,
            updatedAt: new Date().toISOString(),
          }
        : i
    );
    setIdeas(next);
    persist(next);
    setEditingIdea(null);
  }

  function handleDelete(ideaId: string) {
    const next = ideas.filter((i) => i.id !== ideaId);
    setIdeas(next);
    persist(next);
    setDeletingId(null);
  }

  async function handlePromoteToKanban(idea: Idea) {
    // Create a kanban card from this idea
    const boardUrl = `/api/projects/${projectId}/artifacts/kanban/board.json`;
    let board = { columns: [] as any[], cards: {} as Record<string, any> };
    try {
      const res = await fetch(boardUrl, { credentials: "include" });
      if (res.ok) board = await res.json();
    } catch {
      /* start fresh */
    }

    // Ensure at least a Backlog column exists
    if (board.columns.length === 0) {
      board.columns = [
        { id: "col-backlog", title: "Backlog", cardIds: [], order: 0 },
        { id: "col-todo", title: "To Do", cardIds: [], order: 1 },
        { id: "col-inprogress", title: "In Progress", cardIds: [], order: 2 },
        { id: "col-review", title: "Review", cardIds: [], order: 3 },
        { id: "col-done", title: "Done", cardIds: [], order: 4 },
      ];
    }

    const cardId = uid();
    const now = new Date().toISOString();
    board.cards[cardId] = {
      id: cardId,
      title: idea.title,
      description: idea.description,
      labels: idea.tags,
      priority: idea.priority,
      createdAt: now,
      updatedAt: now,
    };
    board.columns[0].cardIds.push(cardId);

    await fetch(boardUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(board),
    });

    // Update idea status to promoted
    const next = ideas.map((i) =>
      i.id === idea.id
        ? {
            ...i,
            status: "promoted" as IdeaStatus,
            promotedTo: { type: "kanban" as const, targetId: cardId },
            updatedAt: new Date().toISOString(),
          }
        : i
    );
    setIdeas(next);
    persist(next);
  }

  /* ---------- Filter ---------- */

  const allTags = Array.from(new Set(ideas.flatMap((i) => i.tags))).sort();

  const filtered = ideas.filter((i) => {
    if (activeTag && !i.tags.includes(activeTag)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  /* ---------- Render ---------- */

  if (loading) {
    return (
      <div className="nb-loading" style={{ height: "100vh" }}>
        Loading ideas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="nb-empty" style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "var(--nb-watermelon)", fontWeight: 700 }}>{error}</span>
      </div>
    );
  }

  return (
    <div className="nb-page" style={{ maxWidth: "960px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <nav style={{ fontFamily: "var(--font-mono)", fontSize: "13px", marginBottom: "var(--space-sm)", textTransform: "uppercase" }}>
        <a href="/dashboard" className="nb-btn nb-btn-sm nb-btn-secondary" style={{ textDecoration: "none" }}>
          Dashboard
        </a>
        <span style={{ margin: "0 var(--space-xs)", color: "var(--nb-gray-mid)", fontWeight: 900 }}>/</span>
        <a href={`/projects/${projectId}`} className="nb-btn nb-btn-sm nb-btn-secondary" style={{ textDecoration: "none" }}>
          Project
        </a>
        <span style={{ margin: "0 var(--space-xs)", color: "var(--nb-gray-mid)", fontWeight: 900 }}>/</span>
        <span style={{ fontWeight: 900 }}>Ideas</span>
      </nav>

      <header className="nb-header" style={{ marginBottom: "var(--space-md)" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 900, fontFamily: "var(--font-heading)", margin: 0, textTransform: "uppercase" }}>
          Ideas
        </h1>
        <button className="nb-btn nb-btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "+ New Idea"}
        </button>
      </header>

      {/* Add Form */}
      {showAddForm && (
        <div className="nb-form-card" style={{ marginBottom: "var(--space-md)" }}>
          <h3 style={{ margin: "0 0 var(--space-sm)", fontSize: "18px", fontWeight: 900, fontFamily: "var(--font-heading)", textTransform: "uppercase" }}>
            New Idea
          </h3>
          <div className="nb-form-group">
            <label className="nb-label">Title</label>
            <input
              className="nb-input"
              placeholder="Title (required)"
              value={addTitle}
              onChange={(e) => setAddTitle(e.target.value)}
            />
          </div>
          <div className="nb-form-group">
            <label className="nb-label">Description</label>
            <textarea
              className="nb-input"
              style={{ minHeight: "60px" }}
              placeholder="Description"
              value={addDesc}
              onChange={(e) => setAddDesc(e.target.value)}
            />
          </div>
          <div className="nb-form-group">
            <label className="nb-label">Tags</label>
            <input
              className="nb-input"
              placeholder="Tags (comma-separated)"
              value={addTags}
              onChange={(e) => setAddTags(e.target.value)}
            />
          </div>
          <div className="nb-flex" style={{ gap: "var(--space-sm)", marginBottom: "var(--space-sm)" }}>
            <div className="nb-form-group" style={{ flex: 1 }}>
              <label className="nb-label">Priority</label>
              <select
                className="nb-select"
                value={addPriority}
                onChange={(e) => setAddPriority(e.target.value as Priority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="nb-form-group" style={{ flex: 1 }}>
              <label className="nb-label">Category</label>
              <input
                className="nb-input"
                value={addCategory}
                onChange={(e) => setAddCategory(e.target.value)}
              />
            </div>
          </div>
          <button className="nb-btn nb-btn-primary" onClick={handleAdd}>
            Add Idea
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="nb-flex-wrap" style={{ gap: "var(--space-xs)", marginBottom: "var(--space-md)", alignItems: "center" }}>
        <input
          className="nb-input"
          placeholder="Search ideas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ minWidth: "200px", flex: 1, marginBottom: 0 }}
        />
        <div className="nb-flex-wrap" style={{ gap: "var(--space-xs)" }}>
          {activeTag && (
            <button
              className="nb-btn nb-btn-sm nb-btn-secondary"
              onClick={() => setActiveTag(null)}
            >
              Clear filter
            </button>
          )}
          {allTags.map((tag) => (
            <button
              key={tag}
              className={`nb-btn nb-btn-sm ${activeTag === tag ? "nb-btn-info" : "nb-btn-secondary"}`}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Ideas list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
        {filtered.length === 0 && (
          <div className="nb-empty">No ideas yet. Create your first one!</div>
        )}
        {filtered.map((idea) => (
          <div key={idea.id} className="nb-card" style={{ padding: "var(--space-md)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-xs)" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 900, fontFamily: "var(--font-heading)" }}>
                {idea.title}
              </h3>
              <span className={`nb-badge ${PRIORITY_BADGE[idea.priority]}`}>
                {idea.priority}
              </span>
            </div>
            {idea.description && (
              <p style={{ margin: "var(--space-xs) 0 var(--space-sm)", fontSize: "14px", color: "var(--nb-gray-dark)", lineHeight: "1.5", fontFamily: "var(--font-body)" }}>
                {idea.description}
              </p>
            )}
            <div className="nb-flex-wrap" style={{ gap: "var(--space-xs)", marginBottom: "var(--space-sm)" }}>
              <span className={`nb-badge ${STATUS_BADGE[idea.status]}`}>
                {STATUS_LABELS[idea.status]}
              </span>
              {idea.category !== "general" && (
                <span className="nb-badge nb-badge-watermelon">{idea.category}</span>
              )}
              {idea.tags.map((tag) => (
                <span key={tag} className="nb-tag">
                  {tag}
                </span>
              ))}
            </div>
            <div className="nb-flex" style={{ gap: "var(--space-xs)" }}>
              <button className="nb-btn nb-btn-sm nb-btn-secondary" onClick={() => openEdit(idea)}>
                Edit
              </button>
              {idea.status !== "promoted" && (
                <button
                  className="nb-btn nb-btn-sm nb-btn-info"
                  onClick={() => handlePromoteToKanban(idea)}
                >
                  Promote to Kanban
                </button>
              )}
              <button
                className="nb-btn nb-btn-sm"
                style={{ backgroundColor: "var(--nb-watermelon)", color: "var(--nb-black)", border: "var(--border-thick) solid var(--nb-black)" }}
                onClick={() => setDeletingId(idea.id)}
              >
                Delete
              </button>
            </div>

            {/* Delete confirmation */}
            {deletingId === idea.id && (
              <div className="nb-card" style={{ marginTop: "var(--space-sm)", padding: "var(--space-sm)", backgroundColor: "var(--nb-lemon)", display: "flex", gap: "var(--space-xs)", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: "13px" }}>Delete this idea?</span>
                <button
                  className="nb-btn nb-btn-sm"
                  style={{ backgroundColor: "var(--nb-watermelon)", color: "var(--nb-black)", border: "var(--border-thick) solid var(--nb-black)" }}
                  onClick={() => handleDelete(idea.id)}
                >
                  Yes, Delete
                </button>
                <button
                  className="nb-btn nb-btn-sm nb-btn-secondary"
                  onClick={() => setDeletingId(null)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingIdea && (
        <div
          style={{
            position: "fixed",
            inset: "0",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setEditingIdea(null)}
        >
          <div
            className="nb-form-card"
            style={{ width: "480px", maxWidth: "90vw", maxHeight: "80vh", overflow: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: "0 0 var(--space-md)", fontSize: "20px", fontWeight: 900, fontFamily: "var(--font-heading)", textTransform: "uppercase" }}>
              Edit Idea
            </h2>
            <div className="nb-form-group">
              <label className="nb-label">Title</label>
              <input
                className="nb-input"
                placeholder="Title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="nb-form-group">
              <label className="nb-label">Description</label>
              <textarea
                className="nb-input"
                style={{ minHeight: "80px" }}
                placeholder="Description"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />
            </div>
            <div className="nb-form-group">
              <label className="nb-label">Tags</label>
              <input
                className="nb-input"
                placeholder="Tags (comma-separated)"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
              />
            </div>
            <div className="nb-flex" style={{ gap: "var(--space-sm)", marginBottom: "var(--space-sm)" }}>
              <div className="nb-form-group" style={{ flex: 1 }}>
                <label className="nb-label">Priority</label>
                <select
                  className="nb-select"
                  value={editPriority}
                  onChange={(e) =>
                    setEditPriority(e.target.value as Priority)
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="nb-form-group" style={{ flex: 1 }}>
                <label className="nb-label">Status</label>
                <select
                  className="nb-select"
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(e.target.value as IdeaStatus)
                  }
                >
                  <option value="captured">Captured</option>
                  <option value="exploring">Exploring</option>
                  <option value="validated">Validated</option>
                  <option value="promoted">Promoted</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <div className="nb-form-group">
              <label className="nb-label">Category</label>
              <input
                className="nb-input"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
              />
            </div>
            <div className="nb-form-actions">
              <button className="nb-btn nb-btn-primary" onClick={handleSaveEdit}>
                Save
              </button>
              <button
                className="nb-btn nb-btn-secondary"
                onClick={() => setEditingIdea(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
