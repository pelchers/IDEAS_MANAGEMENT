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

const PRIORITY_COLORS: Record<Priority, string> = {
  low: "#4caf50",
  medium: "#ff9800",
  high: "#f44336",
  critical: "#9c27b0",
};

const STATUS_LABELS: Record<IdeaStatus, string> = {
  captured: "Captured",
  exploring: "Exploring",
  validated: "Validated",
  promoted: "Promoted",
  archived: "Archived",
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
      <div style={s.center}>
        <span>Loading ideas...</span>
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

  return (
    <div style={s.page}>
      {/* Breadcrumb */}
      <nav style={s.breadcrumb}>
        <a href="/dashboard" style={s.breadcrumbLink}>
          Dashboard
        </a>
        <span style={s.breadcrumbSep}>/</span>
        <a href={`/projects/${projectId}`} style={s.breadcrumbLink}>
          Project
        </a>
        <span style={s.breadcrumbSep}>/</span>
        <span style={s.breadcrumbCurrent}>Ideas</span>
      </nav>

      <header style={s.header}>
        <h1 style={s.title}>Ideas</h1>
        <button style={s.primaryBtn} onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "+ New Idea"}
        </button>
      </header>

      {/* Add Form */}
      {showAddForm && (
        <div style={s.formCard}>
          <h3 style={s.formTitle}>New Idea</h3>
          <input
            style={s.input}
            placeholder="Title (required)"
            value={addTitle}
            onChange={(e) => setAddTitle(e.target.value)}
          />
          <textarea
            style={{ ...s.input, minHeight: "60px" }}
            placeholder="Description"
            value={addDesc}
            onChange={(e) => setAddDesc(e.target.value)}
          />
          <input
            style={s.input}
            placeholder="Tags (comma-separated)"
            value={addTags}
            onChange={(e) => setAddTags(e.target.value)}
          />
          <div style={s.formRow}>
            <label style={s.label}>
              Priority:
              <select
                style={s.select}
                value={addPriority}
                onChange={(e) => setAddPriority(e.target.value as Priority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </label>
            <label style={s.label}>
              Category:
              <input
                style={s.input}
                value={addCategory}
                onChange={(e) => setAddCategory(e.target.value)}
              />
            </label>
          </div>
          <button style={s.primaryBtn} onClick={handleAdd}>
            Add Idea
          </button>
        </div>
      )}

      {/* Filters */}
      <div style={s.filterBar}>
        <input
          style={s.searchInput}
          placeholder="Search ideas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div style={s.tagFilters}>
          {activeTag && (
            <button
              style={{ ...s.tagBtn, backgroundColor: "#e0e0e0" }}
              onClick={() => setActiveTag(null)}
            >
              Clear filter
            </button>
          )}
          {allTags.map((tag) => (
            <button
              key={tag}
              style={{
                ...s.tagBtn,
                backgroundColor:
                  activeTag === tag ? "#1a73e8" : "#f1f3f4",
                color: activeTag === tag ? "#fff" : "#333",
              }}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Ideas list */}
      <div style={s.ideaList}>
        {filtered.length === 0 && (
          <div style={s.empty}>No ideas yet. Create your first one!</div>
        )}
        {filtered.map((idea) => (
          <div key={idea.id} style={s.ideaCard}>
            <div style={s.ideaHeader}>
              <h3 style={s.ideaTitle}>{idea.title}</h3>
              <span
                style={{
                  ...s.priorityBadge,
                  backgroundColor: PRIORITY_COLORS[idea.priority],
                }}
              >
                {idea.priority}
              </span>
            </div>
            {idea.description && (
              <p style={s.ideaDesc}>{idea.description}</p>
            )}
            <div style={s.ideaMeta}>
              <span style={s.statusBadge}>
                {STATUS_LABELS[idea.status]}
              </span>
              {idea.category !== "general" && (
                <span style={s.categoryBadge}>{idea.category}</span>
              )}
              {idea.tags.map((tag) => (
                <span key={tag} style={s.ideaTag}>
                  {tag}
                </span>
              ))}
            </div>
            <div style={s.ideaActions}>
              <button style={s.actionBtn} onClick={() => openEdit(idea)}>
                Edit
              </button>
              {idea.status !== "promoted" && (
                <button
                  style={{ ...s.actionBtn, color: "#1a73e8" }}
                  onClick={() => handlePromoteToKanban(idea)}
                >
                  Promote to Kanban
                </button>
              )}
              <button
                style={{ ...s.actionBtn, color: "#d93025" }}
                onClick={() => setDeletingId(idea.id)}
              >
                Delete
              </button>
            </div>

            {/* Delete confirmation */}
            {deletingId === idea.id && (
              <div style={s.confirmBar}>
                <span>Delete this idea?</span>
                <button
                  style={s.dangerBtn}
                  onClick={() => handleDelete(idea.id)}
                >
                  Yes, Delete
                </button>
                <button
                  style={s.actionBtn}
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
        <div style={s.modalOverlay} onClick={() => setEditingIdea(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={s.modalTitle}>Edit Idea</h2>
            <input
              style={s.input}
              placeholder="Title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <textarea
              style={{ ...s.input, minHeight: "80px" }}
              placeholder="Description"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
            />
            <input
              style={s.input}
              placeholder="Tags (comma-separated)"
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
            />
            <div style={s.formRow}>
              <label style={s.label}>
                Priority:
                <select
                  style={s.select}
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
              </label>
              <label style={s.label}>
                Status:
                <select
                  style={s.select}
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
              </label>
            </div>
            <label style={s.label}>
              Category:
              <input
                style={s.input}
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
              />
            </label>
            <div style={s.modalActions}>
              <button style={s.primaryBtn} onClick={handleSaveEdit}>
                Save
              </button>
              <button
                style={s.actionBtn}
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

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const s: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    maxWidth: "960px",
    margin: "0 auto",
    padding: "24px",
  },
  center: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    fontSize: "14px",
    color: "#888",
  },
  breadcrumb: { fontSize: "13px", marginBottom: "12px" },
  breadcrumbLink: { color: "#1a73e8", textDecoration: "none" },
  breadcrumbSep: { margin: "0 6px", color: "#999" },
  breadcrumbCurrent: { color: "#333", fontWeight: 500 },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  title: { fontSize: "24px", fontWeight: 600, margin: 0 },
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
  formCard: {
    padding: "16px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    marginBottom: "16px",
    backgroundColor: "#fafafa",
  },
  formTitle: { margin: "0 0 12px", fontSize: "16px", fontWeight: 600 },
  formRow: { display: "flex", gap: "12px", marginBottom: "8px" },
  input: {
    display: "block",
    width: "100%",
    padding: "8px 10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "13px",
    marginBottom: "8px",
    boxSizing: "border-box" as const,
  },
  select: {
    padding: "6px 8px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "13px",
    marginLeft: "6px",
  },
  label: { fontSize: "13px", color: "#555", display: "flex", alignItems: "center", gap: "4px" },
  filterBar: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "8px",
    marginBottom: "16px",
    alignItems: "center",
  },
  searchInput: {
    padding: "8px 10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "13px",
    minWidth: "200px",
    flex: "1",
  },
  tagFilters: { display: "flex", gap: "4px", flexWrap: "wrap" as const },
  tagBtn: {
    padding: "4px 10px",
    border: "none",
    borderRadius: "12px",
    fontSize: "12px",
    cursor: "pointer",
  },
  ideaList: { display: "flex", flexDirection: "column" as const, gap: "8px" },
  ideaCard: {
    padding: "14px 16px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    backgroundColor: "#fff",
  },
  ideaHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },
  ideaTitle: { margin: 0, fontSize: "15px", fontWeight: 600 },
  priorityBadge: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "10px",
    fontSize: "11px",
    fontWeight: 600,
    color: "#fff",
    textTransform: "uppercase" as const,
  },
  ideaDesc: { margin: "4px 0 8px", fontSize: "13px", color: "#555", lineHeight: "1.4" },
  ideaMeta: { display: "flex", gap: "6px", flexWrap: "wrap" as const, marginBottom: "8px" },
  statusBadge: {
    display: "inline-block",
    padding: "2px 8px",
    backgroundColor: "#e8f0fe",
    borderRadius: "4px",
    fontSize: "11px",
    color: "#1a73e8",
    fontWeight: 500,
  },
  categoryBadge: {
    display: "inline-block",
    padding: "2px 8px",
    backgroundColor: "#fce8e6",
    borderRadius: "4px",
    fontSize: "11px",
    color: "#c5221f",
  },
  ideaTag: {
    display: "inline-block",
    padding: "2px 8px",
    backgroundColor: "#f1f3f4",
    borderRadius: "4px",
    fontSize: "11px",
    color: "#5f6368",
  },
  ideaActions: { display: "flex", gap: "8px" },
  actionBtn: {
    padding: "4px 10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "12px",
    color: "#333",
  },
  dangerBtn: {
    padding: "4px 10px",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#d93025",
    color: "#fff",
    cursor: "pointer",
    fontSize: "12px",
  },
  confirmBar: {
    marginTop: "8px",
    padding: "8px",
    backgroundColor: "#fff3e0",
    borderRadius: "4px",
    display: "flex",
    gap: "8px",
    alignItems: "center",
    fontSize: "13px",
  },
  empty: { textAlign: "center" as const, color: "#888", fontSize: "14px", padding: "40px 0" },
  modalOverlay: {
    position: "fixed" as const,
    inset: "0",
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "24px",
    width: "480px",
    maxWidth: "90vw",
    maxHeight: "80vh",
    overflow: "auto",
  },
  modalTitle: { margin: "0 0 16px", fontSize: "18px", fontWeight: 600 },
  modalActions: { display: "flex", gap: "8px", marginTop: "12px" },
};
