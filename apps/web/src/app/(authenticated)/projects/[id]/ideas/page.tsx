"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";

/* ── Types ── */
interface Idea {
  id: string;
  title: string;
  body: string;
  tags: string[];
  category: string;
  priority: "high" | "medium" | "low";
  createdAt?: string;
  modifiedAt?: string;
}

type IdeasData = Idea[];

function uid(): string {
  return `idea-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

function timeAgo(iso?: string): string {
  if (!iso) return "";
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  } catch { return ""; }
}

function priorityStyle(p: Idea["priority"]): React.CSSProperties {
  switch (p) {
    case "high": return { backgroundColor: "#FF5E54", color: "#FFFFFF" };
    case "medium": return { backgroundColor: "#FFE459", color: "#282828" };
    case "low": return { backgroundColor: "#3498DB", color: "#FFFFFF" };
  }
}

const CATEGORIES = ["ALL", "FEATURE", "BUG FIX", "RESEARCH", "DESIGN", "IMPROVEMENT"] as const;
const PRIORITIES: Idea["priority"][] = ["high", "medium", "low"];

/* ── Component ── */
export default function IdeasPage() {
  const params = useParams();
  const projectId = String(params.id);
  const [ideas, setIdeas] = useState<IdeasData>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Edit/create modal
  const [editIdea, setEditIdea] = useState<Idea | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editCategory, setEditCategory] = useState("FEATURE");
  const [editPriority, setEditPriority] = useState<Idea["priority"]>("medium");

  // Load from artifact API
  useEffect(() => {
    fetch(`/api/projects/${projectId}/artifacts/ideas/ideas.json`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.artifact?.content?.ideas && Array.isArray(data.artifact.content.ideas)) {
          setIdeas(data.artifact.content.ideas.map((idea: Record<string, unknown>, i: number) => ({
            id: (idea.id as string) || uid() + i,
            title: (idea.title as string) || "Untitled",
            body: (idea.body as string) || "",
            tags: Array.isArray(idea.tags) ? (idea.tags as string[]) : [],
            category: (idea.category as string) || "FEATURE",
            priority: (["high", "medium", "low"].includes(idea.priority as string) ? idea.priority : "medium") as Idea["priority"],
            createdAt: (idea.createdAt as string) || undefined,
            modifiedAt: (idea.modifiedAt as string) || undefined,
          })));
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [projectId]);

  // Save
  const saveIdeas = useCallback((newIdeas: IdeasData) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      fetch(`/api/projects/${projectId}/artifacts/ideas/ideas.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: { ideas: newIdeas } }),
      }).catch(() => {});
    }, 500);
  }, [projectId]);

  const updateAndSave = useCallback((next: IdeasData) => {
    setIdeas(next);
    saveIdeas(next);
  }, [saveIdeas]);

  /* ── CRUD ── */
  const openCreate = () => {
    const now = nowISO();
    const idea: Idea = {
      id: uid(), title: "", body: "", tags: [], category: "FEATURE",
      priority: "medium", createdAt: now, modifiedAt: now,
    };
    setEditIdea(idea);
    setIsNew(true);
    setEditTitle("");
    setEditBody("");
    setEditTags("");
    setEditCategory("FEATURE");
    setEditPriority("medium");
  };

  const openEdit = (idea: Idea) => {
    setEditIdea(idea);
    setIsNew(false);
    setEditTitle(idea.title);
    setEditBody(idea.body);
    setEditTags(idea.tags.join(", "));
    setEditCategory(idea.category);
    setEditPriority(idea.priority);
  };

  const saveModal = () => {
    if (!editIdea) return;
    const trimTitle = editTitle.trim();
    if (!trimTitle) return;
    const parsedTags = editTags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
    const updated: Idea = {
      ...editIdea,
      title: trimTitle,
      body: editBody.trim(),
      tags: parsedTags,
      category: editCategory,
      priority: editPriority,
      modifiedAt: nowISO(),
    };

    if (isNew) {
      updateAndSave([updated, ...ideas]);
    } else {
      updateAndSave(ideas.map((i) => i.id === updated.id ? updated : i));
    }
    setEditIdea(null);
  };

  const deleteIdea = (id: string) => {
    updateAndSave(ideas.filter((i) => i.id !== id));
  };

  // Filter
  const filtered = activeFilter === "ALL"
    ? ideas
    : ideas.filter((idea) =>
        idea.category.toUpperCase() === activeFilter.toUpperCase() ||
        idea.tags.some((t) => t.toUpperCase() === activeFilter.toUpperCase())
      );

  if (!loaded) {
    return (
      <div style={{ padding: "48px", textAlign: "center" }}>
        <div style={{ fontWeight: 700, fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Loading ideas...
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <h1 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "0.05em", textTransform: "uppercase", margin: 0 }}>
          IDEAS
        </h1>
        <button
          onClick={openCreate}
          style={{
            padding: "10px 20px", backgroundColor: "#282828", color: "#FFFFFF",
            border: "3px solid #282828", boxShadow: "4px 4px 0px #282828",
            fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase",
            cursor: "pointer", letterSpacing: "0.05em",
          }}
        >
          + CAPTURE IDEA
        </button>
      </div>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            style={{
              padding: "8px 16px", fontWeight: 700, fontSize: "0.8rem",
              textTransform: "uppercase", border: "3px solid #282828", cursor: "pointer",
              backgroundColor: activeFilter === cat ? "#282828" : "#FFFFFF",
              color: activeFilter === cat ? "#2ECC71" : "#282828",
              boxShadow: activeFilter === cat ? "none" : "3px 3px 0px #282828",
              transition: "all 150ms ease",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {ideas.length === 0 && (
        <div style={{
          border: "4px dashed #282828", padding: "48px", textAlign: "center",
          backgroundColor: "#FFFFFF", marginBottom: "24px",
        }}>
          <div style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: "8px" }}>No ideas yet</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.85rem", color: "#666666" }}>
            Click &quot;+ CAPTURE IDEA&quot; to add your first idea
          </div>
        </div>
      )}

      {/* No results for filter */}
      {ideas.length > 0 && filtered.length === 0 && (
        <div style={{
          border: "3px dashed #28282860", padding: "32px", textAlign: "center",
          backgroundColor: "#FFFFFF", marginBottom: "24px",
        }}>
          <div style={{ fontWeight: 700, fontSize: "1rem", color: "#666666" }}>
            No ideas match &quot;{activeFilter}&quot;
          </div>
        </div>
      )}

      {/* Ideas grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
        gap: "24px",
      }}>
        {filtered.map((idea) => (
          <div
            key={idea.id}
            className="idea-card"
            style={{
              backgroundColor: "#FFFFFF",
              border: "4px solid #282828",
              boxShadow: "6px 6px 0px #282828",
              padding: "24px",
              position: "relative",
              transition: "transform 150ms ease, box-shadow 150ms ease",
              cursor: "pointer",
            }}
            onClick={() => openEdit(idea)}
          >
            {/* Priority badge */}
            <span style={{
              position: "absolute", top: 0, right: 0,
              fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.7rem",
              textTransform: "uppercase", padding: "4px 12px",
              borderLeft: "3px solid #282828", borderBottom: "3px solid #282828",
              ...priorityStyle(idea.priority),
            }}>
              {idea.priority}
            </span>

            {/* Category */}
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.65rem",
              textTransform: "uppercase", color: "#666666", marginBottom: "4px",
            }}>
              {idea.category}
            </div>

            {/* Title */}
            <h3 style={{
              fontSize: "1.1rem", fontWeight: 700, marginBottom: "8px",
              paddingRight: "70px", textTransform: "uppercase", margin: "0 0 8px 0",
            }}>
              {idea.title}
            </h3>

            {/* Body */}
            {idea.body && (
              <p style={{
                fontSize: "0.9rem", color: "#555555", lineHeight: 1.5, marginBottom: "12px",
                overflow: "hidden", display: "-webkit-box",
                WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
              }}>
                {idea.body}
              </p>
            )}

            {/* Tags */}
            {idea.tags.length > 0 && (
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "12px" }}>
                {idea.tags.map((tag) => (
                  <span key={tag} className="kanban-tag" style={{
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.65rem",
                    textTransform: "uppercase", padding: "2px 8px",
                    border: "2px solid #282828", backgroundColor: "#F8F3EC",
                    transition: "transform 100ms ease, box-shadow 100ms ease",
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Footer: date */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.75rem",
              textTransform: "uppercase", paddingTop: "12px",
              borderTop: "2px dashed #28282840", color: "#666666",
            }}>
              <span>{timeAgo(idea.createdAt)}</span>
              {/* Delete button */}
              <button
                onClick={(e) => { e.stopPropagation(); deleteIdea(idea.id); }}
                className="idea-delete-btn"
                style={{
                  padding: "4px 10px", backgroundColor: "#FFFFFF", color: "#FF5E54",
                  border: "2px solid #FF5E54", fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase",
                  cursor: "pointer", opacity: 0,
                  transition: "opacity 150ms ease, transform 100ms ease, box-shadow 100ms ease",
                }}
              >
                DELETE
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Create/Edit Modal ── */}
      {editIdea && (
        <div onClick={() => setEditIdea(null)} style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            backgroundColor: "#FFFFFF", border: "4px solid #282828",
            boxShadow: "8px 8px 0px #282828", padding: "32px",
            width: "100%", maxWidth: "520px", maxHeight: "90vh",
            overflowY: "auto", boxSizing: "border-box",
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontWeight: 800, fontSize: "1.2rem", textTransform: "uppercase", margin: 0 }}>
                {isNew ? "CAPTURE IDEA" : "EDIT IDEA"}
              </h2>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setEditIdea(null)} className="nb-modal-btn" style={{
                  padding: "8px 16px", backgroundColor: "#FFFFFF", border: "3px solid #282828",
                  fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", cursor: "pointer",
                  transition: "transform 100ms ease, box-shadow 100ms ease",
                }}>CANCEL</button>
                <button onClick={saveModal} className="nb-modal-btn" style={{
                  padding: "8px 16px", backgroundColor: "#282828", color: "#FFFFFF",
                  border: "3px solid #282828", fontWeight: 700, fontSize: "0.8rem",
                  textTransform: "uppercase", cursor: "pointer", letterSpacing: "0.05em",
                  transition: "transform 100ms ease, box-shadow 100ms ease",
                }}>SAVE</button>
              </div>
            </div>

            {/* Timestamps */}
            {!isNew && (editIdea.createdAt || editIdea.modifiedAt) && (
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.7rem",
                color: "#666666", marginBottom: "16px", display: "flex", gap: "16px",
              }}>
                {editIdea.createdAt && <span>Created: {formatDate(editIdea.createdAt)}</span>}
                {editIdea.modifiedAt && <span>Modified: {formatDate(editIdea.modifiedAt)}</span>}
              </div>
            )}

            {/* Title */}
            <label style={labelStyle}>Title</label>
            <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Idea title..." autoFocus style={inputStyle} />

            {/* Body */}
            <label style={labelStyle}>Description</label>
            <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)}
              placeholder="Describe the idea..." rows={4}
              style={{ ...inputStyle, resize: "vertical" as const, minHeight: "90px" }} />

            {/* Category + Priority row */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Category</label>
                <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}
                  style={{
                    ...inputStyle, marginBottom: 0, cursor: "pointer",
                    appearance: "auto" as const,
                  }}>
                  {CATEGORIES.filter((c) => c !== "ALL").map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Priority</label>
                <div style={{ display: "flex", gap: "6px" }}>
                  {PRIORITIES.map((p) => (
                    <button key={p} onClick={() => setEditPriority(p)} style={{
                      flex: 1, padding: "10px 8px", border: "3px solid #282828",
                      fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase",
                      cursor: "pointer",
                      ...(editPriority === p ? priorityStyle(p) : { backgroundColor: "#FFFFFF", color: "#282828" }),
                      boxShadow: editPriority === p ? "none" : "2px 2px 0px #282828",
                    }}>{p}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tags */}
            <label style={labelStyle}>Tags (comma-separated)</label>
            <input type="text" value={editTags} onChange={(e) => setEditTags(e.target.value)}
              placeholder="ai, feature, integration" style={inputStyle} />
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .idea-card:hover {
          transform: translate(-2px, -2px);
          box-shadow: 8px 8px 0px #282828;
        }
        .idea-card:hover .idea-delete-btn {
          opacity: 1 !important;
        }
        .idea-delete-btn:hover {
          transform: translateY(-1px);
          box-shadow: 2px 2px 0px #FF5E54;
          background-color: #FF5E54 !important;
          color: #FFFFFF !important;
        }
        .kanban-tag:hover {
          transform: translateY(-1px);
          box-shadow: 2px 2px 0px #282828;
        }
        .nb-modal-btn:hover {
          transform: translate(-2px, -2px);
          box-shadow: 4px 4px 0px #282828;
        }
        .nb-modal-btn:active {
          transform: translate(0, 0);
          box-shadow: none;
        }
      `}</style>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontWeight: 700, fontSize: "0.85rem",
  textTransform: "uppercase", marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", border: "3px solid #282828",
  fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.9rem",
  backgroundColor: "#F8F3EC", outline: "none", boxSizing: "border-box", marginBottom: "16px",
};
