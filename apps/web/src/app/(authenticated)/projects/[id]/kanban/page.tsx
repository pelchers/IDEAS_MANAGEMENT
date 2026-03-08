"use client";

import { useState, useEffect, use, useCallback, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  Types (matching @idea-management/schemas KanbanBoard)              */
/* ------------------------------------------------------------------ */

type Priority = "low" | "medium" | "high" | "critical";

interface KanbanCard {
  id: string;
  title: string;
  description: string;
  labels: string[];
  priority: Priority;
  dueDate?: string;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  cardIds: string[];
  order: number;
}

interface KanbanBoard {
  columns: KanbanColumn[];
  cards: Record<string, KanbanCard>;
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

const PRIORITY_LABEL: Record<Priority, string> = {
  low: "LOW",
  medium: "MED",
  high: "HIGH",
  critical: "CRIT",
};

const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: "col-todo", title: "To Do", cardIds: [], order: 0 },
  { id: "col-inprogress", title: "In Progress", cardIds: [], order: 1 },
  { id: "col-done", title: "Done", cardIds: [], order: 2 },
];

function truncate(text: string, max: number): string {
  if (!text || text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "...";
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function KanbanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);

  const [board, setBoard] = useState<KanbanBoard>({
    columns: [],
    cards: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Drag state
  const [dragCardId, setDragCardId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [dragColId, setDragColId] = useState<string | null>(null);
  const [dragOverColTarget, setDragOverColTarget] = useState<string | null>(null);

  // Add card inline
  const [addingInCol, setAddingInCol] = useState<string | null>(null);
  const [addCardTitle, setAddCardTitle] = useState("");

  // Card detail modal
  const [detailCard, setDetailCard] = useState<KanbanCard | null>(null);
  const [detailTitle, setDetailTitle] = useState("");
  const [detailDesc, setDetailDesc] = useState("");
  const [detailLabels, setDetailLabels] = useState("");
  const [detailPriority, setDetailPriority] = useState<Priority>("medium");
  const [detailDueDate, setDetailDueDate] = useState("");
  const [detailAssignee, setDetailAssignee] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Column rename
  const [renamingCol, setRenamingCol] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Add column
  const [showAddCol, setShowAddCol] = useState(false);
  const [newColTitle, setNewColTitle] = useState("");

  const artifactUrl = `/api/projects/${projectId}/artifacts/kanban/board.json`;

  // Debounced save
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback(
    async (b: KanbanBoard) => {
      setSaving(true);
      try {
        await fetch(artifactUrl, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content: b }),
        });
      } catch {
        // silently fail — user will see stale data on reload
      } finally {
        setSaving(false);
      }
    },
    [artifactUrl]
  );

  const debouncedPersist = useCallback(
    (b: KanbanBoard) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => persist(b), 500);
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
          // API returns { ok, artifact: { content: ... } }
          const data: KanbanBoard = json.artifact?.content ?? json;
          setBoard({
            columns: (data.columns?.length ? data.columns : DEFAULT_COLUMNS).map(c => ({
              ...c,
              cardIds: c.cardIds ?? [],
            })),
            cards: data.cards ?? {},
          });
        } else if (res.status === 404) {
          const initial: KanbanBoard = { columns: DEFAULT_COLUMNS, cards: {} };
          setBoard(initial);
          persist(initial);
        } else {
          setError("Failed to load kanban board");
        }
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [artifactUrl, persist]);

  /* ---------- Board mutations ---------- */

  function updateBoard(next: KanbanBoard) {
    setBoard(next);
    debouncedPersist(next);
  }

  /* Card drag & drop */
  function handleCardDragStart(cardId: string, e: React.DragEvent) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", cardId);
    setDragCardId(cardId);
  }

  function handleCardDragOver(e: React.DragEvent, colId: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragCardId) setDragOverCol(colId);
  }

  function handleCardDrop(targetColId: string) {
    if (!dragCardId) return;
    const next = { ...board, columns: board.columns.map((c) => ({ ...c, cardIds: [...c.cardIds] })) };
    // Remove from source column
    for (const col of next.columns) {
      const idx = col.cardIds.indexOf(dragCardId);
      if (idx !== -1) {
        col.cardIds.splice(idx, 1);
        break;
      }
    }
    // Add to target column
    const targetCol = next.columns.find((c) => c.id === targetColId);
    if (targetCol) {
      targetCol.cardIds.push(dragCardId);
    }
    updateBoard(next);
    setDragCardId(null);
    setDragOverCol(null);
  }

  /* Column drag & drop */
  function handleColDragStart(colId: string) {
    setDragColId(colId);
  }

  function handleColDragOver(e: React.DragEvent, colId: string) {
    e.preventDefault();
    if (dragColId && dragColId !== colId) setDragOverColTarget(colId);
  }

  function handleColDrop(targetColId: string) {
    if (!dragColId || dragColId === targetColId) return;
    const cols = [...board.columns];
    const srcIdx = cols.findIndex((c) => c.id === dragColId);
    const tgtIdx = cols.findIndex((c) => c.id === targetColId);
    if (srcIdx === -1 || tgtIdx === -1) return;
    const [moved] = cols.splice(srcIdx, 1);
    cols.splice(tgtIdx, 0, moved);
    cols.forEach((c, i) => (c.order = i));
    updateBoard({ ...board, columns: cols });
    setDragColId(null);
    setDragOverColTarget(null);
  }

  /* Add card */
  function handleAddCard(colId: string) {
    if (!addCardTitle.trim()) return;
    const now = new Date().toISOString();
    const cardId = uid();
    const card: KanbanCard = {
      id: cardId,
      title: addCardTitle.trim(),
      description: "",
      labels: [],
      priority: "medium",
      createdAt: now,
      updatedAt: now,
    };
    const next = {
      ...board,
      cards: { ...board.cards, [cardId]: card },
      columns: board.columns.map((c) =>
        c.id === colId ? { ...c, cardIds: [...c.cardIds, cardId] } : c
      ),
    };
    updateBoard(next);
    setAddCardTitle("");
    setAddingInCol(null);
  }

  /* Open card detail */
  function openDetail(card: KanbanCard) {
    setDetailCard(card);
    setDetailTitle(card.title);
    setDetailDesc(card.description);
    setDetailLabels(card.labels.join(", "));
    setDetailPriority(card.priority);
    setDetailDueDate(card.dueDate ?? "");
    setDetailAssignee(card.assignee ?? "");
    setDeleteConfirm(false);
  }

  function handleSaveDetail() {
    if (!detailCard) return;
    const updated: KanbanCard = {
      ...detailCard,
      title: detailTitle.trim() || detailCard.title,
      description: detailDesc.trim(),
      labels: detailLabels
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean),
      priority: detailPriority,
      dueDate: detailDueDate || undefined,
      assignee: detailAssignee || undefined,
      updatedAt: new Date().toISOString(),
    };
    updateBoard({
      ...board,
      cards: { ...board.cards, [detailCard.id]: updated },
    });
    setDetailCard(null);
  }

  function handleDeleteCard() {
    if (!detailCard) return;
    const { [detailCard.id]: _, ...restCards } = board.cards;
    const next = {
      ...board,
      cards: restCards,
      columns: board.columns.map((c) => ({
        ...c,
        cardIds: c.cardIds.filter((id) => id !== detailCard.id),
      })),
    };
    updateBoard(next);
    setDetailCard(null);
  }

  /* Column management */
  function handleRenameCol(colId: string) {
    if (!renameValue.trim()) {
      setRenamingCol(null);
      return;
    }
    updateBoard({
      ...board,
      columns: board.columns.map((c) =>
        c.id === colId ? { ...c, title: renameValue.trim() } : c
      ),
    });
    setRenamingCol(null);
    setRenameValue("");
  }

  function handleDeleteCol(colId: string) {
    const col = board.columns.find((c) => c.id === colId);
    if (!col || col.cardIds.length > 0) return;
    updateBoard({
      ...board,
      columns: board.columns
        .filter((c) => c.id !== colId)
        .map((c, i) => ({ ...c, order: i })),
    });
  }

  function handleAddCol() {
    if (!newColTitle.trim()) return;
    const col: KanbanColumn = {
      id: uid(),
      title: newColTitle.trim(),
      cardIds: [],
      order: board.columns.length,
    };
    updateBoard({ ...board, columns: [...board.columns, col] });
    setNewColTitle("");
    setShowAddCol(false);
  }

  /* ---------- Render ---------- */

  if (loading) {
    return (
      <div className="nb-page" style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="nb-card nb-card--static" style={{ padding: "var(--space-xl)", textAlign: "center" }}>
          <div style={{ fontSize: "24px", fontWeight: 900, fontFamily: "var(--font-heading)", textTransform: "uppercase", marginBottom: "var(--space-sm)" }}>
            Loading Board...
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--nb-gray-mid)" }}>
            Fetching kanban data
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nb-page" style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="nb-card nb-card--static" style={{ padding: "var(--space-xl)", textAlign: "center", borderColor: "var(--nb-watermelon)" }}>
          <div style={{ fontSize: "24px", fontWeight: 900, fontFamily: "var(--font-heading)", textTransform: "uppercase", color: "var(--nb-watermelon)", marginBottom: "var(--space-sm)" }}>
            Error
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  const sortedCols = [...board.columns].sort((a, b) => a.order - b.order);
  const totalCards = Object.keys(board.cards).length;

  return (
    <div className="nb-page" style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Breadcrumb */}
      <nav style={{ fontFamily: "var(--font-mono)", fontSize: "13px", marginBottom: "var(--space-xs)", textTransform: "uppercase" }}>
        <a href="/dashboard" className="nb-btn nb-btn-sm nb-btn-secondary" style={{ textDecoration: "none" }}>Dashboard</a>
        <span style={{ margin: "0 var(--space-xs)", color: "var(--nb-gray-mid)", fontWeight: 900 }}>/</span>
        <a href={`/projects/${projectId}`} className="nb-btn nb-btn-sm nb-btn-secondary" style={{ textDecoration: "none" }}>Project</a>
        <span style={{ margin: "0 var(--space-xs)", color: "var(--nb-gray-mid)", fontWeight: 900 }}>/</span>
        <span style={{ fontWeight: 900 }}>Kanban</span>
      </nav>

      <header className="nb-header" style={{ marginBottom: "var(--space-sm)" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-sm)" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 900, fontFamily: "var(--font-heading)", margin: 0, textTransform: "uppercase" }}>
            Kanban Board
          </h1>
          <span className="nb-badge nb-badge-neutral" style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>
            {totalCards} {totalCards === 1 ? "card" : "cards"}
          </span>
          {saving && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--nb-gray-mid)", textTransform: "uppercase" }}>
              Saving...
            </span>
          )}
        </div>
        <button
          className="nb-btn nb-btn-primary"
          onClick={() => setShowAddCol(!showAddCol)}
        >
          + Add Column
        </button>
      </header>

      {showAddCol && (
        <div className="nb-flex" style={{ gap: "var(--space-xs)", marginBottom: "var(--space-sm)", alignItems: "center" }}>
          <input
            className="nb-input"
            placeholder="Column title"
            value={newColTitle}
            onChange={(e) => setNewColTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddCol();
              if (e.key === "Escape") setShowAddCol(false);
            }}
            autoFocus
            style={{ marginBottom: 0, flex: 1, maxWidth: "300px" }}
          />
          <button className="nb-btn nb-btn-primary nb-btn-sm" onClick={handleAddCol}>Add</button>
          <button className="nb-btn nb-btn-secondary nb-btn-sm" onClick={() => setShowAddCol(false)}>Cancel</button>
        </div>
      )}

      {/* Board */}
      {sortedCols.length === 0 ? (
        <div className="nb-card nb-card--static" style={{ padding: "var(--space-2xl)", textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: "20px", fontWeight: 900, fontFamily: "var(--font-heading)", textTransform: "uppercase", marginBottom: "var(--space-sm)" }}>
            No Columns Yet
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--nb-gray-mid)", marginBottom: "var(--space-md)" }}>
            Add a column to start organizing your tasks
          </div>
          <button
            className="nb-btn nb-btn-primary"
            onClick={() => setShowAddCol(true)}
          >
            + Add Your First Column
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "var(--space-sm)", flex: 1, overflowX: "auto", overflowY: "hidden", paddingBottom: "var(--space-xs)" }}>
          {sortedCols.map((col) => {
            const isCardDropTarget = dragCardId && dragOverCol === col.id;
            const isColDropTarget = dragColId && dragOverColTarget === col.id;

            return (
              <div
                key={col.id}
                className="kanban-column"
                style={{
                  minWidth: "270px",
                  maxWidth: "310px",
                  display: "flex",
                  flexDirection: "column",
                  flexShrink: 0,
                  backgroundColor: "var(--nb-cream)",
                  border: isCardDropTarget
                    ? "4px dashed var(--nb-cornflower)"
                    : isColDropTarget
                    ? "4px dashed var(--nb-lemon)"
                    : "3px solid var(--nb-black)",
                  transition: "border-color 150ms ease",
                }}
                draggable
                onDragStart={(e) => {
                  if (dragCardId) return;
                  e.dataTransfer.effectAllowed = "move";
                  handleColDragStart(col.id);
                }}
                onDragOver={(e) => {
                  if (dragCardId) handleCardDragOver(e, col.id);
                  else handleColDragOver(e, col.id);
                }}
                onDrop={() => {
                  if (dragCardId) handleCardDrop(col.id);
                  else handleColDrop(col.id);
                }}
                onDragEnd={() => {
                  setDragCardId(null);
                  setDragOverCol(null);
                  setDragColId(null);
                  setDragOverColTarget(null);
                }}
              >
                {/* Column header */}
                <div className="kanban-column-header" style={{ cursor: dragCardId ? "default" : "grab" }}>
                  {renamingCol === col.id ? (
                    <input
                      className="nb-input"
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameCol(col.id);
                        if (e.key === "Escape") setRenamingCol(null);
                      }}
                      onBlur={() => handleRenameCol(col.id)}
                      style={{ marginBottom: 0, width: "140px", padding: "4px 6px", fontWeight: 900, fontSize: "14px" }}
                    />
                  ) : (
                    <h3
                      style={{ cursor: "default", fontSize: "14px", textTransform: "uppercase", margin: 0 }}
                      onDoubleClick={() => {
                        setRenamingCol(col.id);
                        setRenameValue(col.title);
                      }}
                      title="Double-click to rename"
                    >
                      {col.title}
                    </h3>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
                    <span className="kanban-count">
                      {col.cardIds.length}
                    </span>
                    {col.cardIds.length === 0 && (
                      <button
                        className="nb-btn nb-btn-sm nb-btn-secondary"
                        onClick={() => handleDeleteCol(col.id)}
                        title="Delete empty column"
                        style={{ padding: "2px 8px", fontSize: "11px", lineHeight: 1 }}
                      >
                        x
                      </button>
                    )}
                  </div>
                </div>

                {/* Cards */}
                <div className="kanban-cards" style={{ flex: 1, overflowY: "auto" }}>
                  {col.cardIds.length === 0 && !addingInCol && (
                    <div style={{
                      padding: "var(--space-md)",
                      textAlign: "center",
                      fontFamily: "var(--font-mono)",
                      fontSize: "12px",
                      color: "var(--nb-gray-mid)",
                      textTransform: "uppercase",
                      border: "2px dashed var(--nb-gray-mid)",
                      opacity: 0.5,
                    }}>
                      Drop cards here
                    </div>
                  )}
                  {col.cardIds.map((cardId) => {
                    const card = board.cards[cardId];
                    if (!card) return null;
                    return (
                      <div
                        key={card.id}
                        className="kanban-card"
                        style={{
                          opacity: dragCardId === card.id ? 0.4 : 1,
                          transform: dragCardId === card.id ? "rotate(-2deg)" : undefined,
                        }}
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          handleCardDragStart(card.id, e);
                        }}
                        onClick={() => openDetail(card)}
                      >
                        <div className="kanban-card-title">
                          {card.title}
                        </div>
                        {card.description && (
                          <div style={{
                            fontSize: "12px",
                            color: "var(--nb-gray-dark)",
                            marginBottom: "var(--space-xs)",
                            lineHeight: 1.4,
                          }}>
                            {truncate(card.description, 80)}
                          </div>
                        )}
                        <div className="kanban-card-tags">
                          <span className={`kanban-tag kanban-tag--${card.priority === "high" || card.priority === "critical" ? "urgent" : "feature"}`}>
                            {PRIORITY_LABEL[card.priority]}
                          </span>
                          {card.labels.slice(0, 2).map((l) => (
                            <span key={l} className="kanban-tag">
                              {l}
                            </span>
                          ))}
                        </div>
                        {(card.dueDate || card.assignee) && (
                          <div style={{
                            marginTop: "var(--space-xs)",
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "11px",
                            fontFamily: "var(--font-mono)",
                            color: "var(--nb-gray-dark)",
                          }}>
                            {card.dueDate && <span>{card.dueDate}</span>}
                            {card.assignee && <span style={{ fontWeight: 700 }}>{card.assignee}</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Add card inline */}
                {addingInCol === col.id ? (
                  <div style={{ padding: "var(--space-sm)", borderTop: "2px solid var(--nb-black)" }}>
                    <input
                      className="nb-input"
                      placeholder="Card title"
                      autoFocus
                      value={addCardTitle}
                      onChange={(e) => setAddCardTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddCard(col.id);
                        if (e.key === "Escape") setAddingInCol(null);
                      }}
                      style={{ marginBottom: "var(--space-xs)" }}
                    />
                    <div className="nb-flex" style={{ gap: "var(--space-xs)" }}>
                      <button className="nb-btn nb-btn-primary nb-btn-sm" onClick={() => handleAddCard(col.id)}>
                        Add
                      </button>
                      <button className="nb-btn nb-btn-secondary nb-btn-sm" onClick={() => setAddingInCol(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: "var(--space-sm)", borderTop: "2px solid var(--nb-black)" }}>
                    <button
                      className="nb-btn nb-btn-secondary"
                      style={{ width: "100%", fontSize: "12px", textAlign: "left" }}
                      onClick={() => {
                        setAddingInCol(col.id);
                        setAddCardTitle("");
                      }}
                    >
                      + Add Card
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Card Detail Modal */}
      {detailCard && (
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
          onClick={() => setDetailCard(null)}
        >
          <div
            className="nb-form-card"
            style={{ width: "500px", maxWidth: "90vw", maxHeight: "80vh", overflow: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: "0 0 var(--space-md)", fontSize: "20px", fontWeight: 900, fontFamily: "var(--font-heading)", textTransform: "uppercase" }}>
              Card Details
            </h2>
            <div className="nb-form-group">
              <label className="nb-label">Title</label>
              <input
                className="nb-input"
                value={detailTitle}
                onChange={(e) => setDetailTitle(e.target.value)}
              />
            </div>
            <div className="nb-form-group">
              <label className="nb-label">Description</label>
              <textarea
                className="nb-input"
                style={{ minHeight: "80px", resize: "vertical" }}
                value={detailDesc}
                onChange={(e) => setDetailDesc(e.target.value)}
              />
            </div>
            <div className="nb-form-group">
              <label className="nb-label">Labels (comma-separated)</label>
              <input
                className="nb-input"
                value={detailLabels}
                onChange={(e) => setDetailLabels(e.target.value)}
                placeholder="e.g. feature, bug, design"
              />
            </div>
            <div className="nb-flex" style={{ gap: "var(--space-sm)", marginBottom: "var(--space-sm)" }}>
              <div className="nb-form-group" style={{ flex: 1 }}>
                <label className="nb-label">Priority</label>
                <select
                  className="nb-select"
                  value={detailPriority}
                  onChange={(e) =>
                    setDetailPriority(e.target.value as Priority)
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="nb-form-group" style={{ flex: 1 }}>
                <label className="nb-label">Due Date</label>
                <input
                  type="date"
                  className="nb-input"
                  value={detailDueDate}
                  onChange={(e) => setDetailDueDate(e.target.value)}
                />
              </div>
            </div>
            <div className="nb-form-group">
              <label className="nb-label">Assignee</label>
              <input
                className="nb-input"
                placeholder="Assignee name"
                value={detailAssignee}
                onChange={(e) => setDetailAssignee(e.target.value)}
              />
            </div>
            <div className="nb-form-actions">
              <button className="nb-btn nb-btn-primary" onClick={handleSaveDetail}>
                Save
              </button>
              <button
                className="nb-btn nb-btn-secondary"
                onClick={() => setDetailCard(null)}
              >
                Cancel
              </button>
              {!deleteConfirm ? (
                <button
                  className="nb-btn nb-btn-danger"
                  style={{ marginLeft: "auto" }}
                  onClick={() => setDeleteConfirm(true)}
                >
                  Delete
                </button>
              ) : (
                <button
                  className="nb-btn nb-btn-danger"
                  style={{ marginLeft: "auto", fontWeight: 900 }}
                  onClick={handleDeleteCard}
                >
                  Confirm Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
