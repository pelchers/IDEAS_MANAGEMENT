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

const PRIORITY_COLORS: Record<Priority, string> = {
  low: "#4caf50",
  medium: "#ff9800",
  high: "#f44336",
  critical: "#9c27b0",
};

const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: "col-backlog", title: "Backlog", cardIds: [], order: 0 },
  { id: "col-todo", title: "To Do", cardIds: [], order: 1 },
  { id: "col-inprogress", title: "In Progress", cardIds: [], order: 2 },
  { id: "col-review", title: "Review", cardIds: [], order: 3 },
  { id: "col-done", title: "Done", cardIds: [], order: 4 },
];

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

  const persist = useCallback(
    async (b: KanbanBoard) => {
      await fetch(artifactUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(b),
      });
    },
    [artifactUrl]
  );

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(artifactUrl, { credentials: "include" });
        if (res.ok) {
          const data: KanbanBoard = await res.json();
          setBoard({
            columns: data.columns?.length ? data.columns : DEFAULT_COLUMNS,
            cards: data.cards ?? {},
          });
        } else if (res.status === 404) {
          const initial = { columns: DEFAULT_COLUMNS, cards: {} };
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
    persist(next);
  }

  /* Card drag & drop */
  function handleCardDragStart(cardId: string) {
    setDragCardId(cardId);
  }

  function handleCardDragOver(e: React.DragEvent, colId: string) {
    e.preventDefault();
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
    // Recompute order
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
    if (!renameValue.trim()) return;
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
    if (!col || col.cardIds.length > 0) return; // only delete empty
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
      <div style={s.center}>
        <span>Loading kanban board...</span>
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

  const sortedCols = [...board.columns].sort((a, b) => a.order - b.order);

  return (
    <div style={s.page}>
      {/* Breadcrumb */}
      <nav style={s.breadcrumb}>
        <a href="/dashboard" style={s.breadcrumbLink}>Dashboard</a>
        <span style={s.breadcrumbSep}>/</span>
        <a href={`/projects/${projectId}`} style={s.breadcrumbLink}>Project</a>
        <span style={s.breadcrumbSep}>/</span>
        <span style={s.breadcrumbCurrent}>Kanban</span>
      </nav>

      <header style={s.header}>
        <h1 style={s.title}>Kanban Board</h1>
        <button
          style={s.primaryBtn}
          onClick={() => setShowAddCol(!showAddCol)}
        >
          + Add Column
        </button>
      </header>

      {showAddCol && (
        <div style={s.addColBar}>
          <input
            style={s.input}
            placeholder="Column title"
            value={newColTitle}
            onChange={(e) => setNewColTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCol()}
          />
          <button style={s.primaryBtn} onClick={handleAddCol}>Add</button>
          <button style={s.ghostBtn} onClick={() => setShowAddCol(false)}>Cancel</button>
        </div>
      )}

      {/* Board */}
      <div style={s.board}>
        {sortedCols.map((col) => (
          <div
            key={col.id}
            style={{
              ...s.column,
              border:
                dragOverCol === col.id
                  ? "2px dashed #1a73e8"
                  : dragOverColTarget === col.id
                  ? "2px dashed #ff9800"
                  : "1px solid #e0e0e0",
            }}
            draggable
            onDragStart={(e) => {
              if (dragCardId) return; // don't conflict with card drag
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
            <div style={s.colHeader}>
              {renamingCol === col.id ? (
                <input
                  style={s.inlineInput}
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRenameCol(col.id);
                    if (e.key === "Escape") setRenamingCol(null);
                  }}
                  onBlur={() => handleRenameCol(col.id)}
                />
              ) : (
                <span
                  style={s.colTitle}
                  onDoubleClick={() => {
                    setRenamingCol(col.id);
                    setRenameValue(col.title);
                  }}
                >
                  {col.title}{" "}
                  <span style={s.colCount}>({col.cardIds.length})</span>
                </span>
              )}
              {col.cardIds.length === 0 && (
                <button
                  style={s.colDeleteBtn}
                  onClick={() => handleDeleteCol(col.id)}
                  title="Delete empty column"
                >
                  x
                </button>
              )}
            </div>

            {/* Cards */}
            <div style={s.cardList}>
              {col.cardIds.map((cardId) => {
                const card = board.cards[cardId];
                if (!card) return null;
                return (
                  <div
                    key={card.id}
                    style={{
                      ...s.card,
                      opacity: dragCardId === card.id ? 0.5 : 1,
                    }}
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      e.dataTransfer.effectAllowed = "move";
                      handleCardDragStart(card.id);
                    }}
                    onClick={() => openDetail(card)}
                  >
                    <div style={s.cardTitle}>{card.title}</div>
                    <div style={s.cardMeta}>
                      <span
                        style={{
                          ...s.priorityDot,
                          backgroundColor: PRIORITY_COLORS[card.priority],
                        }}
                      />
                      {card.labels.slice(0, 3).map((l) => (
                        <span key={l} style={s.cardLabel}>
                          {l}
                        </span>
                      ))}
                    </div>
                    {(card.dueDate || card.assignee) && (
                      <div style={s.cardFooter}>
                        {card.dueDate && (
                          <span style={s.cardDue}>{card.dueDate}</span>
                        )}
                        {card.assignee && (
                          <span style={s.cardAssignee}>{card.assignee}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add card inline */}
            {addingInCol === col.id ? (
              <div style={s.addCardForm}>
                <input
                  style={s.input}
                  placeholder="Card title"
                  autoFocus
                  value={addCardTitle}
                  onChange={(e) => setAddCardTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddCard(col.id);
                    if (e.key === "Escape") setAddingInCol(null);
                  }}
                />
                <div style={s.addCardActions}>
                  <button style={s.smallBtn} onClick={() => handleAddCard(col.id)}>
                    Add
                  </button>
                  <button style={s.ghostBtn} onClick={() => setAddingInCol(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                style={s.addCardBtn}
                onClick={() => {
                  setAddingInCol(col.id);
                  setAddCardTitle("");
                }}
              >
                + Add Card
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Card Detail Modal */}
      {detailCard && (
        <div style={s.modalOverlay} onClick={() => setDetailCard(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={s.modalTitle}>Card Details</h2>
            <label style={s.label}>Title</label>
            <input
              style={s.input}
              value={detailTitle}
              onChange={(e) => setDetailTitle(e.target.value)}
            />
            <label style={s.label}>Description</label>
            <textarea
              style={{ ...s.input, minHeight: "80px" }}
              value={detailDesc}
              onChange={(e) => setDetailDesc(e.target.value)}
            />
            <label style={s.label}>Labels (comma-separated)</label>
            <input
              style={s.input}
              value={detailLabels}
              onChange={(e) => setDetailLabels(e.target.value)}
            />
            <div style={s.formRow}>
              <label style={s.label}>
                Priority:
                <select
                  style={s.select}
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
              </label>
              <label style={s.label}>
                Due Date:
                <input
                  type="date"
                  style={s.input}
                  value={detailDueDate}
                  onChange={(e) => setDetailDueDate(e.target.value)}
                />
              </label>
            </div>
            <label style={s.label}>Assignee</label>
            <input
              style={s.input}
              placeholder="Assignee name"
              value={detailAssignee}
              onChange={(e) => setDetailAssignee(e.target.value)}
            />
            <div style={s.modalActions}>
              <button style={s.primaryBtn} onClick={handleSaveDetail}>
                Save
              </button>
              <button
                style={s.ghostBtn}
                onClick={() => setDetailCard(null)}
              >
                Cancel
              </button>
              {!deleteConfirm ? (
                <button
                  style={s.dangerBtn}
                  onClick={() => setDeleteConfirm(true)}
                >
                  Delete
                </button>
              ) : (
                <button style={s.dangerBtn} onClick={handleDeleteCard}>
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

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const s: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    padding: "16px 24px",
    overflow: "hidden",
  },
  center: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    fontSize: "14px",
    color: "#888",
  },
  breadcrumb: { fontSize: "13px", marginBottom: "8px" },
  breadcrumbLink: { color: "#1a73e8", textDecoration: "none" },
  breadcrumbSep: { margin: "0 6px", color: "#999" },
  breadcrumbCurrent: { color: "#333", fontWeight: 500 },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    flexShrink: 0,
  },
  title: { fontSize: "22px", fontWeight: 600, margin: 0 },
  addColBar: {
    display: "flex",
    gap: "8px",
    marginBottom: "12px",
    alignItems: "center",
  },
  board: {
    display: "flex",
    gap: "12px",
    flex: 1,
    overflowX: "auto",
    overflowY: "hidden",
    paddingBottom: "8px",
  },
  column: {
    minWidth: "260px",
    maxWidth: "300px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    padding: "10px",
    display: "flex",
    flexDirection: "column" as const,
    flexShrink: 0,
  },
  colHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
    padding: "4px 2px",
  },
  colTitle: {
    fontSize: "14px",
    fontWeight: 600,
    cursor: "default",
  },
  colCount: { fontWeight: 400, color: "#999", fontSize: "12px" },
  colDeleteBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#999",
    fontSize: "14px",
    padding: "2px 6px",
  },
  cardList: {
    flex: 1,
    overflowY: "auto" as const,
    display: "flex",
    flexDirection: "column" as const,
    gap: "6px",
    minHeight: "40px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "6px",
    padding: "10px 12px",
    border: "1px solid #e0e0e0",
    cursor: "grab",
    fontSize: "13px",
  },
  cardTitle: { fontWeight: 500, marginBottom: "4px" },
  cardMeta: { display: "flex", gap: "4px", alignItems: "center", flexWrap: "wrap" as const },
  priorityDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    display: "inline-block",
  },
  cardLabel: {
    padding: "1px 6px",
    backgroundColor: "#e8f0fe",
    borderRadius: "3px",
    fontSize: "10px",
    color: "#1a73e8",
  },
  cardFooter: {
    marginTop: "4px",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    color: "#888",
  },
  cardDue: {},
  cardAssignee: { fontStyle: "italic" as const },
  addCardForm: { marginTop: "4px" },
  addCardActions: { display: "flex", gap: "4px", marginTop: "4px" },
  addCardBtn: {
    width: "100%",
    padding: "6px",
    border: "none",
    background: "none",
    color: "#888",
    cursor: "pointer",
    fontSize: "12px",
    textAlign: "left" as const,
    borderRadius: "4px",
  },
  inlineInput: {
    border: "1px solid #1a73e8",
    borderRadius: "4px",
    padding: "4px 6px",
    fontSize: "13px",
    fontWeight: 600,
    outline: "none",
    width: "140px",
  },
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
  label: { fontSize: "12px", color: "#555", display: "block", marginBottom: "4px", fontWeight: 500 },
  formRow: { display: "flex", gap: "12px", marginBottom: "8px" },
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
  smallBtn: {
    padding: "4px 10px",
    backgroundColor: "#1a73e8",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  ghostBtn: {
    padding: "4px 10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "12px",
    color: "#555",
  },
  dangerBtn: {
    padding: "8px 16px",
    backgroundColor: "#d93025",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    marginLeft: "auto",
  },
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
    width: "500px",
    maxWidth: "90vw",
    maxHeight: "80vh",
    overflow: "auto",
  },
  modalTitle: { margin: "0 0 16px", fontSize: "18px", fontWeight: 600 },
  modalActions: { display: "flex", gap: "8px", marginTop: "12px" },
};
