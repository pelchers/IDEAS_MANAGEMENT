"use client";

import { useState, useEffect, use, useCallback, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Priority = "low" | "medium" | "high";
type Category = "feature" | "bug" | "improvement" | "research";

interface Idea {
  id: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: "new" | "in-progress" | "done";
  createdAt: string;
}

interface IdeasData {
  ideas: Idea[];
  categories: Category[];
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CATEGORIES: Category[] = ["feature", "bug", "improvement", "research"];

const CATEGORY_LABELS: Record<Category, string> = {
  feature: "FEATURE",
  bug: "BUG FIX",
  improvement: "IMPROVEMENT",
  research: "RESEARCH",
};

const PRIORITY_CLASS: Record<Priority, string> = {
  high: "idea-card-priority--high",
  medium: "idea-card-priority--medium",
  low: "idea-card-priority--low",
};

const PRIORITY_BADGE: Record<Priority, string> = {
  high: "nb-badge-watermelon",
  medium: "nb-badge-lemon",
  low: "nb-badge-malachite",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function uid(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function truncate(text: string, len: number): string {
  return text.length > len ? text.slice(0, len) + "..." : text;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick-add
  const [quickTitle, setQuickTitle] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  // Full add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [addCategory, setAddCategory] = useState<Category>("feature");
  const [addPriority, setAddPriority] = useState<Priority>("medium");

  // Edit modal
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCategory, setEditCategory] = useState<Category>("feature");
  const [editPriority, setEditPriority] = useState<Priority>("medium");

  // Delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Debounce ref
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---------- Persistence ---------- */

  const artifactUrl = `/api/projects/${projectId}/artifacts/ideas/ideas.json`;

  const persist = useCallback(
    async (list: Idea[]) => {
      setSaving(true);
      try {
        const data: IdeasData = { ideas: list, categories: CATEGORIES };
        await fetch(artifactUrl, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content: data }),
        });
      } finally {
        setSaving(false);
      }
    },
    [artifactUrl]
  );

  const debouncedPersist = useCallback(
    (list: Idea[]) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => persist(list), 500);
    },
    [persist]
  );

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(artifactUrl, { credentials: "include" });
        if (res.ok) {
          const json = await res.json();
          // API returns { ok, artifact: { content: ... } }
          const data: IdeasData = json.artifact?.content ?? json;
          setIdeas(data.ideas ?? []);
        } else if (res.status === 404) {
          // No artifact yet -- start with empty list
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

  function handleQuickAdd() {
    if (!quickTitle.trim()) return;
    const now = new Date().toISOString();
    const idea: Idea = {
      id: uid(),
      title: quickTitle.trim(),
      description: "",
      category: "feature",
      priority: "medium",
      status: "new",
      createdAt: now,
    };
    const next = [...ideas, idea];
    setIdeas(next);
    debouncedPersist(next);
    setQuickTitle("");
  }

  function handleFullAdd() {
    if (!addTitle.trim()) return;
    const now = new Date().toISOString();
    const idea: Idea = {
      id: uid(),
      title: addTitle.trim(),
      description: addDesc.trim(),
      category: addCategory,
      priority: addPriority,
      status: "new",
      createdAt: now,
    };
    const next = [...ideas, idea];
    setIdeas(next);
    debouncedPersist(next);
    setAddTitle("");
    setAddDesc("");
    setAddCategory("feature");
    setAddPriority("medium");
    setShowAddForm(false);
  }

  function openEdit(idea: Idea) {
    setEditingIdea(idea);
    setEditTitle(idea.title);
    setEditDesc(idea.description);
    setEditCategory(idea.category);
    setEditPriority(idea.priority);
  }

  function handleSaveEdit() {
    if (!editingIdea || !editTitle.trim()) return;
    const next = ideas.map((i) =>
      i.id === editingIdea.id
        ? {
            ...i,
            title: editTitle.trim(),
            description: editDesc.trim(),
            category: editCategory,
            priority: editPriority,
          }
        : i
    );
    setIdeas(next);
    debouncedPersist(next);
    setEditingIdea(null);
  }

  function handleDelete(ideaId: string) {
    const next = ideas.filter((i) => i.id !== ideaId);
    setIdeas(next);
    debouncedPersist(next);
    setDeletingId(null);
  }

  /* ---------- Filter ---------- */

  const filtered = ideas.filter((i) => {
    if (activeCategory && i.category !== activeCategory) return false;
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
      <div
        className="nb-empty"
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ color: "var(--nb-watermelon)", fontWeight: 700 }}>
          {error}
        </span>
      </div>
    );
  }

  return (
    <div className="nb-page" style={{ maxWidth: 1080, margin: "0 auto" }}>
      {/* Header */}
      <header className="nb-header nb-mb-md">
        <h1
          style={{
            fontSize: 28,
            fontWeight: 900,
            fontFamily: "var(--font-heading)",
            margin: 0,
            textTransform: "uppercase",
            letterSpacing: "0.02em",
          }}
        >
          IDEAS
        </h1>
        <div className="nb-flex nb-gap-sm" style={{ alignItems: "center" }}>
          {saving && (
            <span
              className="nb-text-mono nb-text-xs"
              style={{ color: "var(--nb-gray-mid)" }}
            >
              Saving...
            </span>
          )}
          <button
            className="nb-btn nb-btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? "CANCEL" : "+ CAPTURE IDEA"}
          </button>
        </div>
      </header>

      {/* Quick-add bar */}
      <div
        className="nb-flex nb-gap-sm nb-mb-md"
        style={{ alignItems: "stretch" }}
      >
        <input
          className="nb-input"
          placeholder="Quick capture — type an idea and press Enter..."
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleQuickAdd();
          }}
          style={{ flex: 1, marginBottom: 0 }}
        />
        <button
          className="nb-btn nb-btn-primary"
          onClick={handleQuickAdd}
          disabled={!quickTitle.trim()}
        >
          ADD
        </button>
      </div>

      {/* Full add form */}
      {showAddForm && (
        <div className="nb-form-card nb-mb-md">
          <h3
            style={{
              margin: "0 0 var(--space-sm)",
              fontSize: 18,
              fontWeight: 900,
              fontFamily: "var(--font-heading)",
              textTransform: "uppercase",
            }}
          >
            NEW IDEA
          </h3>
          <div className="nb-form-group">
            <label className="nb-label">TITLE</label>
            <input
              className="nb-input"
              placeholder="Idea title (required)"
              value={addTitle}
              onChange={(e) => setAddTitle(e.target.value)}
            />
          </div>
          <div className="nb-form-group">
            <label className="nb-label">DESCRIPTION</label>
            <textarea
              className="nb-input"
              style={{ minHeight: 80 }}
              placeholder="Describe your idea..."
              value={addDesc}
              onChange={(e) => setAddDesc(e.target.value)}
            />
          </div>
          <div
            className="nb-flex nb-gap-sm"
            style={{ marginBottom: "var(--space-sm)" }}
          >
            <div className="nb-form-group" style={{ flex: 1 }}>
              <label className="nb-label">CATEGORY</label>
              <select
                className="nb-select"
                value={addCategory}
                onChange={(e) => setAddCategory(e.target.value as Category)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>
            <div className="nb-form-group" style={{ flex: 1 }}>
              <label className="nb-label">PRIORITY</label>
              <select
                className="nb-select"
                value={addPriority}
                onChange={(e) => setAddPriority(e.target.value as Priority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <button className="nb-btn nb-btn-primary" onClick={handleFullAdd}>
            ADD IDEA
          </button>
        </div>
      )}

      {/* Filters: search + category chips */}
      <div className="nb-mb-md">
        <input
          className="nb-input nb-mb-sm"
          placeholder="SEARCH IDEAS..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            marginBottom: "var(--space-sm)",
            fontFamily: "var(--font-mono)",
            textTransform: "uppercase",
            fontSize: "0.85rem",
          }}
        />
        <div className="ideas-filters">
          <button
            className={`filter-chip${activeCategory === null ? " active" : ""}`}
            onClick={() => setActiveCategory(null)}
          >
            ALL
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`filter-chip${activeCategory === cat ? " active" : ""}`}
              onClick={() =>
                setActiveCategory(activeCategory === cat ? null : cat)
              }
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Ideas grid */}
      {filtered.length === 0 ? (
        <div className="nb-empty">
          <div className="nb-empty-icon" style={{ fontSize: 48 }}>
            {ideas.length === 0 ? "\u2726" : "\u2715"}
          </div>
          <div className="nb-empty-text">
            {ideas.length === 0
              ? "No ideas yet. Capture your first one!"
              : "No ideas match your filters."}
          </div>
        </div>
      ) : (
        <div className="ideas-grid">
          {filtered.map((idea) => (
            <div
              key={idea.id}
              className="idea-card"
              onClick={() => openEdit(idea)}
              style={{ cursor: "pointer" }}
            >
              {/* Priority badge — absolute top-right */}
              <div className={`idea-card-priority ${PRIORITY_CLASS[idea.priority]}`}>
                {idea.priority.toUpperCase()}
              </div>

              {/* Title */}
              <h3 className="idea-card-title">{idea.title}</h3>

              {/* Description */}
              {idea.description && (
                <p className="idea-card-body">
                  {truncate(idea.description, 120)}
                </p>
              )}

              {/* Category badge */}
              <div className="idea-card-tags">
                <span className={`nb-badge ${PRIORITY_BADGE[idea.priority]}`}>
                  {CATEGORY_LABELS[idea.category] ?? idea.category}
                </span>
              </div>

              {/* Footer: date + delete */}
              <div className="idea-card-footer">
                <span>{formatDate(idea.createdAt)}</span>
                <button
                  className="nb-btn nb-btn-sm nb-btn-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingId(idea.id);
                  }}
                >
                  DELETE
                </button>
              </div>

              {/* Delete confirmation */}
              {deletingId === idea.id && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    marginTop: "var(--space-sm)",
                    padding: "var(--space-sm)",
                    backgroundColor: "var(--nb-lemon)",
                    border: "var(--border-thick)",
                    display: "flex",
                    gap: "var(--space-xs)",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      flex: 1,
                    }}
                  >
                    Delete this idea?
                  </span>
                  <button
                    className="nb-btn nb-btn-sm nb-btn-danger"
                    onClick={() => handleDelete(idea.id)}
                  >
                    YES
                  </button>
                  <button
                    className="nb-btn nb-btn-sm nb-btn-secondary"
                    onClick={() => setDeletingId(null)}
                  >
                    NO
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editingIdea && (
        <div
          style={{
            position: "fixed",
            inset: 0,
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
            style={{
              width: 480,
              maxWidth: "90vw",
              maxHeight: "80vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                margin: "0 0 var(--space-md)",
                fontSize: 20,
                fontWeight: 900,
                fontFamily: "var(--font-heading)",
                textTransform: "uppercase",
              }}
            >
              EDIT IDEA
            </h2>
            <div className="nb-form-group">
              <label className="nb-label">TITLE</label>
              <input
                className="nb-input"
                placeholder="Title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="nb-form-group">
              <label className="nb-label">DESCRIPTION</label>
              <textarea
                className="nb-input"
                style={{ minHeight: 80 }}
                placeholder="Description"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />
            </div>
            <div
              className="nb-flex nb-gap-sm"
              style={{ marginBottom: "var(--space-sm)" }}
            >
              <div className="nb-form-group" style={{ flex: 1 }}>
                <label className="nb-label">CATEGORY</label>
                <select
                  className="nb-select"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as Category)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="nb-form-group" style={{ flex: 1 }}>
                <label className="nb-label">PRIORITY</label>
                <select
                  className="nb-select"
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as Priority)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="nb-form-actions">
              <button className="nb-btn nb-btn-primary" onClick={handleSaveEdit}>
                SAVE
              </button>
              <button
                className="nb-btn nb-btn-secondary"
                onClick={() => setEditingIdea(null)}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
