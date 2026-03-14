"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";

/* ── Types ── */
type ColumnId = "backlog" | "todo" | "progress" | "done";

interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  links?: string[];
  bgColor?: string;
  createdAt?: string;
  modifiedAt?: string;
}

interface ColumnDef {
  id: ColumnId;
  label: string;
  headerBg: string;
  headerColor: string;
}

const COLUMNS: ColumnDef[] = [
  { id: "backlog", label: "BACKLOG", headerBg: "#F8F3EC", headerColor: "#282828" },
  { id: "todo", label: "TO DO", headerBg: "#FF5E54", headerColor: "#FFFFFF" },
  { id: "progress", label: "IN PROGRESS", headerBg: "#2ECC71", headerColor: "#282828" },
  { id: "done", label: "DONE", headerBg: "#282828", headerColor: "#FFFFFF" },
];

const PRESET_COLORS = [
  "#FFFFFF", "#F8F3EC", "#FFE459", "#FF5E54", "#2ECC71",
  "#9B59B6", "#3498DB", "#282828", "#E74C3C", "#1ABC9C",
  "#F39C12", "#E8DAEF", "#D5F5E3", "#FADBD8",
];

function getTagStyle(tag: string): React.CSSProperties {
  switch (tag) {
    case "urgent": return { backgroundColor: "#FF5E54", color: "#FFFFFF" };
    case "feature": return { backgroundColor: "#2ECC71", color: "#282828" };
    case "bug": return { backgroundColor: "#9B59B6", color: "#FFFFFF" };
    default: return { backgroundColor: "#F8F3EC", color: "#282828" };
  }
}

function contrastText(hex: string): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? "#282828" : "#FFFFFF";
}

function uid(): string {
  return `card-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

function truncateUrl(url: string, max = 35): string {
  try {
    const u = new URL(url);
    const display = u.hostname + u.pathname;
    return display.length > max ? display.slice(0, max) + "..." : display;
  } catch {
    return url.length > max ? url.slice(0, max) + "..." : url;
  }
}

type ColumnsMap = Record<ColumnId, KanbanCard[]>;
function emptyColumns(): ColumnsMap {
  return { backlog: [], todo: [], progress: [], done: [] };
}

/* ── Component ── */
export default function KanbanPage() {
  const params = useParams();
  const projectId = String(params.id);
  const [columns, setColumns] = useState<ColumnsMap>(emptyColumns);
  const [loaded, setLoaded] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Add-card
  const [addingTo, setAddingTo] = useState<ColumnId | null>(null);
  const [newTitle, setNewTitle] = useState("");

  // Edit modal
  const [editCard, setEditCard] = useState<{ colId: ColumnId; card: KanbanCard } | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editLinks, setEditLinks] = useState("");
  const [editBgColor, setEditBgColor] = useState("#FFFFFF");

  // Settings popover
  const [settingsCardId, setSettingsCardId] = useState<string | null>(null);

  // Drag state (native HTML5 DnD)
  const [dragCard, setDragCard] = useState<{ colId: ColumnId; index: number } | null>(null);
  const [dropTarget, setDropTarget] = useState<{ colId: ColumnId; index: number } | null>(null);

  // Load board
  useEffect(() => {
    fetch(`/api/projects/${projectId}/artifacts/kanban/board.json`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.artifact?.content?.columns) {
          const result = emptyColumns();
          const colMap: Record<string, ColumnId> = {
            backlog: "backlog", Backlog: "backlog",
            todo: "todo", Todo: "todo", "to-do": "todo",
            "in-progress": "progress", "In Progress": "progress", progress: "progress", inprogress: "progress",
            done: "done", Done: "done", completed: "done",
          };
          for (const col of data.artifact.content.columns) {
            const mappedId = colMap[col.id] || colMap[col.title] || "backlog";
            if (Array.isArray(col.cards)) {
              result[mappedId] = col.cards.map((c: Record<string, unknown>, i: number) => ({
                id: c.id ? String(c.id) : uid() + i,
                title: (c.title as string) || "Untitled",
                description: (c.description as string) || "",
                tags: Array.isArray(c.tags) ? (c.tags as string[]) : [],
                links: Array.isArray(c.links) ? (c.links as string[]) : [],
                bgColor: (c.bgColor as string) || undefined,
                createdAt: (c.createdAt as string) || undefined,
                modifiedAt: (c.modifiedAt as string) || undefined,
              }));
            }
          }
          setColumns(result);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [projectId]);

  // Save
  const saveBoard = useCallback((newColumns: ColumnsMap) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      const payload = {
        columns: COLUMNS.map((col) => ({
          id: col.id, title: col.label, cards: newColumns[col.id],
        })),
      };
      fetch(`/api/projects/${projectId}/artifacts/kanban/board.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: payload }),
      }).catch(() => {});
    }, 500);
  }, [projectId]);

  const updateAndSave = useCallback((next: ColumnsMap) => {
    setColumns(next);
    saveBoard(next);
  }, [saveBoard]);

  /* ── Drag & Drop (native HTML5) ── */
  const onDragStart = (colId: ColumnId, index: number) => (e: React.DragEvent) => {
    setDragCard({ colId, index });
    e.dataTransfer.effectAllowed = "move";
    // Make the drag image slightly transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.currentTarget, 20, 20);
    }
  };

  const onDragOver = (colId: ColumnId, index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget({ colId, index });
  };

  const onDragOverColumn = (colId: ColumnId) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    // Drop at end of column
    setDropTarget({ colId, index: columns[colId].length });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragCard || !dropTarget) return;

    const { colId: fromCol, index: fromIdx } = dragCard;
    const { colId: toCol, index: toIdx } = dropTarget;

    const fromCards = [...columns[fromCol]];
    const [moved] = fromCards.splice(fromIdx, 1);
    if (!moved) return;

    if (fromCol === toCol) {
      const adjustedIdx = toIdx > fromIdx ? toIdx - 1 : toIdx;
      fromCards.splice(adjustedIdx, 0, moved);
      updateAndSave({ ...columns, [fromCol]: fromCards });
    } else {
      const toCards = [...columns[toCol]];
      toCards.splice(toIdx, 0, moved);
      updateAndSave({ ...columns, [fromCol]: fromCards, [toCol]: toCards });
    }

    setDragCard(null);
    setDropTarget(null);
  };

  const onDragEnd = () => {
    setDragCard(null);
    setDropTarget(null);
  };

  /* ── CRUD ── */
  const addCard = (colId: ColumnId) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    const now = nowISO();
    const card: KanbanCard = {
      id: uid(), title: trimmed, description: "", tags: [], links: [],
      createdAt: now, modifiedAt: now,
    };
    const next = { ...columns, [colId]: [...columns[colId], card] };
    updateAndSave(next);
    setNewTitle("");
    setAddingTo(null);
    setTimeout(() => openEditModal(colId, card), 50);
  };

  const deleteCard = (colId: ColumnId, cardId: string) => {
    updateAndSave({ ...columns, [colId]: columns[colId].filter((c) => c.id !== cardId) });
    if (settingsCardId === cardId) setSettingsCardId(null);
  };

  const updateCardColor = (colId: ColumnId, cardId: string, color: string) => {
    updateAndSave({
      ...columns,
      [colId]: columns[colId].map((c) =>
        c.id === cardId ? { ...c, bgColor: color, modifiedAt: nowISO() } : c
      ),
    });
  };

  const openEditModal = (colId: ColumnId, card: KanbanCard) => {
    setEditCard({ colId, card });
    setEditTitle(card.title);
    setEditDescription(card.description || "");
    setEditTags(card.tags.join(", "));
    setEditLinks((card.links || []).join("\n"));
    setEditBgColor(card.bgColor || "#FFFFFF");
  };

  const saveEdit = () => {
    if (!editCard) return;
    const { colId, card } = editCard;
    const parsedTags = editTags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
    const parsedLinks = editLinks.split("\n").map((l) => l.trim()).filter(Boolean);
    updateAndSave({
      ...columns,
      [colId]: columns[colId].map((c) =>
        c.id === card.id
          ? { ...c, title: editTitle.trim() || c.title, description: editDescription.trim(),
              tags: parsedTags, links: parsedLinks, bgColor: editBgColor, modifiedAt: nowISO() }
          : c
      ),
    });
    setEditCard(null);
  };

  const totalCards = Object.values(columns).reduce((sum, col) => sum + col.length, 0);

  if (!loaded) {
    return (
      <div style={{ padding: "48px", textAlign: "center" }}>
        <div style={{ fontWeight: 700, fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Loading board...
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <h1 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "0.05em", textTransform: "uppercase", margin: 0 }}>
          KANBAN
        </h1>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.8rem", color: "#666666", textTransform: "uppercase" }}>
          {totalCards} card{totalCards !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Empty state */}
      {totalCards === 0 && (
        <div style={{ border: "4px dashed #282828", padding: "48px", textAlign: "center", backgroundColor: "#FFFFFF", marginBottom: "24px" }}>
          <div style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: "8px" }}>No cards yet</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.85rem", color: "#666666" }}>
            Click &quot;+ ADD&quot; at the bottom of any column to create your first card
          </div>
        </div>
      )}

      {/* Board */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", minHeight: "max(500px, calc(100vh - 60px - 160px))" }}>
        {COLUMNS.map((col) => (
          <div key={col.id} style={{ border: "4px solid #282828", backgroundColor: "#FFFFFF", display: "flex", flexDirection: "column", minWidth: 0 }}>
            {/* Column header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px",
              backgroundColor: col.headerBg, color: col.headerColor, fontWeight: 700, textTransform: "uppercase",
            }}>
              <h3 style={{ fontSize: "1.1rem", margin: 0 }}>{col.label}</h3>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.85rem",
                width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid currentColor",
              }}>
                {columns[col.id].length}
              </span>
            </div>

            {/* Cards */}
            <div
              onDragOver={onDragOverColumn(col.id)}
              onDrop={onDrop}
              style={{ flex: 1, padding: "8px", minHeight: "100px", display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {columns[col.id].map((card, cardIdx) => {
                const bg = card.bgColor || "#FFFFFF";
                const textColor = contrastText(bg);
                const showSettings = settingsCardId === card.id;
                const hasDesc = !!(card.description?.trim());
                const hasLinks = !!(card.links && card.links.length > 0);
                const isDragOver = dropTarget?.colId === col.id && dropTarget?.index === cardIdx;

                return (
                  <div key={card.id}>
                    {/* Drop indicator line */}
                    {isDragOver && dragCard && !(dragCard.colId === col.id && dragCard.index === cardIdx) && (
                      <div style={{ height: "4px", backgroundColor: "#FF5E54", marginBottom: "4px", borderRadius: "2px" }} />
                    )}
                    <div
                      draggable
                      onDragStart={onDragStart(col.id, cardIdx)}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDropTarget({ colId: col.id, index: cardIdx }); }}
                      onDragEnd={onDragEnd}
                      className="kanban-card-interactive"
                      style={{
                        border: "3px solid #282828",
                        backgroundColor: bg,
                        color: textColor,
                        boxShadow: "3px 3px 0px #282828",
                        position: "relative",
                        cursor: "grab",
                        opacity: dragCard?.colId === col.id && dragCard?.index === cardIdx ? 0.4 : 1,
                      }}
                    >
                      {/* Card body */}
                      <div style={{ padding: "10px 12px" }}>
                        {/* Title */}
                        <div
                          onClick={() => openEditModal(col.id, card)}
                          style={{ fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", wordBreak: "break-word", paddingRight: "56px" }}
                        >
                          {card.title}
                        </div>

                        {/* Description */}
                        {hasDesc && (
                          <div style={{
                            fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.75rem", marginTop: "4px",
                            opacity: 0.7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {card.description}
                          </div>
                        )}

                        {/* Tags */}
                        {card.tags.length > 0 && (
                          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "8px" }}>
                            {card.tags.map((tag) => (
                              <span key={tag} className="kanban-tag" style={{
                                ...getTagStyle(tag),
                                fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.65rem",
                                textTransform: "uppercase", padding: "2px 8px", border: "2px solid #282828",
                                cursor: "default", transition: "transform 100ms ease, box-shadow 100ms ease",
                              }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Links as clickable blue tags */}
                        {hasLinks && (
                          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "6px" }}>
                            {card.links!.map((link, li) => (
                              <a
                                key={li}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="kanban-link-tag"
                                style={{
                                  fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.6rem",
                                  padding: "2px 8px", border: "2px solid #282828",
                                  backgroundColor: "#3498DB", color: "#FFFFFF",
                                  textDecoration: "none", cursor: "pointer",
                                  transition: "transform 100ms ease, box-shadow 100ms ease",
                                  display: "inline-flex", alignItems: "center", gap: "4px",
                                }}
                              >
                                <span style={{ fontSize: "0.7rem" }}>&#8599;</span>
                                {truncateUrl(link, 25)}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action buttons — top-right, stacked */}
                      <div className="kanban-card-actions" style={{
                        position: "absolute", top: "6px", right: "6px",
                        display: "flex", gap: "4px", opacity: 0,
                      }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSettingsCardId(showSettings ? null : card.id); }}
                          style={{
                            width: "22px", height: "22px", backgroundColor: "#FFFFFF", color: "#282828",
                            border: "2px solid #282828", cursor: "pointer", fontSize: "0.7rem",
                            display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
                          }}
                          title="Card settings"
                        >&#9881;</button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteCard(col.id, card.id); }}
                          style={{
                            width: "22px", height: "22px", backgroundColor: "#FF5E54", color: "#FFFFFF",
                            border: "2px solid #282828", cursor: "pointer", fontSize: "0.7rem", fontWeight: 700,
                            display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
                          }}
                          title="Delete card"
                        >&#10005;</button>
                      </div>

                      {/* Color picker */}
                      {showSettings && (
                        <div onClick={(e) => e.stopPropagation()} style={{
                          position: "absolute", top: "34px", right: "6px", backgroundColor: "#FFFFFF",
                          border: "3px solid #282828", boxShadow: "4px 4px 0px #282828", padding: "8px",
                          zIndex: 100, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", width: "200px",
                        }}>
                          {PRESET_COLORS.map((color) => (
                            <button key={color} onClick={() => { updateCardColor(col.id, card.id, color); setSettingsCardId(null); }}
                              style={{
                                width: "24px", height: "24px", backgroundColor: color,
                                border: bg === color ? "3px solid #FF5E54" : "2px solid #282828",
                                cursor: "pointer", padding: 0,
                              }} title={color}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Drop indicator at end of column */}
              {dropTarget?.colId === col.id && dropTarget?.index === columns[col.id].length && dragCard && (
                <div style={{ height: "4px", backgroundColor: "#FF5E54", borderRadius: "2px" }} />
              )}
            </div>

            {/* Add card */}
            <div style={{ padding: "8px", borderTop: "2px dashed #28282840" }}>
              {addingTo === col.id ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <input
                    type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addCard(col.id); if (e.key === "Escape") { setAddingTo(null); setNewTitle(""); } }}
                    placeholder="Card title..." autoFocus
                    style={{
                      width: "100%", padding: "8px 12px", border: "3px solid #282828",
                      fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.85rem",
                      backgroundColor: "#F8F3EC", outline: "none", boxSizing: "border-box",
                    }}
                  />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => addCard(col.id)} style={{
                      flex: 1, padding: "8px", backgroundColor: "#282828", color: "#FFFFFF",
                      border: "3px solid #282828", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", cursor: "pointer",
                    }}>ADD</button>
                    <button onClick={() => { setAddingTo(null); setNewTitle(""); }} style={{
                      padding: "8px 12px", backgroundColor: "#FFFFFF", border: "3px solid #282828",
                      fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
                    }}>&#10005;</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setAddingTo(col.id); setNewTitle(""); }} style={{
                  width: "100%", padding: "10px", backgroundColor: "transparent", border: "2px dashed #28282860",
                  cursor: "pointer", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase",
                  color: "#666666", letterSpacing: "0.05em",
                }}>+ ADD</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Edit Modal ── */}
      {editCard && (
        <div onClick={() => setEditCard(null)} style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            backgroundColor: "#FFFFFF", border: "4px solid #282828", boxShadow: "8px 8px 0px #282828",
            padding: "32px", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto", boxSizing: "border-box",
          }}>
            {/* Modal header — title left, buttons right */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontWeight: 800, fontSize: "1.2rem", textTransform: "uppercase", margin: 0 }}>
                EDIT CARD
              </h2>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setEditCard(null)} className="nb-modal-btn" style={{
                  padding: "8px 16px", backgroundColor: "#FFFFFF", border: "3px solid #282828",
                  fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", cursor: "pointer",
                  transition: "transform 100ms ease, box-shadow 100ms ease",
                }}>CANCEL</button>
                <button onClick={saveEdit} className="nb-modal-btn" style={{
                  padding: "8px 16px", backgroundColor: "#282828", color: "#FFFFFF",
                  border: "3px solid #282828", fontWeight: 700, fontSize: "0.8rem",
                  textTransform: "uppercase", cursor: "pointer", letterSpacing: "0.05em",
                  transition: "transform 100ms ease, box-shadow 100ms ease",
                }}>SAVE</button>
              </div>
            </div>

            {/* Timestamps */}
            {(editCard.card.createdAt || editCard.card.modifiedAt) && (
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.7rem", color: "#666666",
                marginBottom: "16px", display: "flex", gap: "16px",
              }}>
                {editCard.card.createdAt && <span>Created: {formatDate(editCard.card.createdAt)}</span>}
                {editCard.card.modifiedAt && <span>Modified: {formatDate(editCard.card.modifiedAt)}</span>}
              </div>
            )}

            {/* Title */}
            <label style={labelStyle}>Title</label>
            <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={inputStyle} />

            {/* Description */}
            <label style={labelStyle}>Description</label>
            <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Add a description..." rows={3}
              style={{ ...inputStyle, resize: "vertical" as const, minHeight: "70px" }}
            />

            {/* Tags */}
            <label style={labelStyle}>Tags (comma-separated)</label>
            <input type="text" value={editTags} onChange={(e) => setEditTags(e.target.value)}
              placeholder="feature, bug, urgent" style={inputStyle}
            />

            {/* Links */}
            <label style={labelStyle}>Links (one per line)</label>
            <textarea value={editLinks} onChange={(e) => setEditLinks(e.target.value)}
              placeholder={"https://example.com\nhttps://github.com/..."} rows={2}
              style={{ ...inputStyle, resize: "vertical" as const, minHeight: "50px" }}
            />

            {/* Background color */}
            <label style={labelStyle}>Background Color</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px", marginBottom: "20px" }}>
              {PRESET_COLORS.map((color) => (
                <button key={color} onClick={() => setEditBgColor(color)} style={{
                  width: "32px", height: "32px", backgroundColor: color,
                  border: editBgColor === color ? "3px solid #FF5E54" : "2px solid #282828",
                  cursor: "pointer", padding: 0,
                }} />
              ))}
            </div>

            {/* Preview */}
            <label style={labelStyle}>Preview</label>
            <div style={{
              border: "3px solid #282828", padding: "12px", backgroundColor: editBgColor,
              color: contrastText(editBgColor), boxShadow: "3px 3px 0px #282828",
            }}>
              <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{editTitle || "Preview"}</div>
              {editDescription && (
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.75rem", marginTop: "4px", opacity: 0.7 }}>
                  {editDescription.length > 80 ? editDescription.slice(0, 80) + "..." : editDescription}
                </div>
              )}
              {editTags && (
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "8px" }}>
                  {editTags.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                    <span key={tag} style={{
                      ...getTagStyle(tag), fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.65rem",
                      textTransform: "uppercase", padding: "2px 8px", border: "2px solid #282828",
                    }}>{tag}</span>
                  ))}
                </div>
              )}
              {editLinks && (
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "6px" }}>
                  {editLinks.split("\n").map((l) => l.trim()).filter(Boolean).map((link, i) => (
                    <span key={i} style={{
                      fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.6rem", padding: "2px 8px",
                      border: "2px solid #282828", backgroundColor: "#3498DB", color: "#FFFFFF",
                    }}>&#8599; {truncateUrl(link, 25)}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .kanban-card-interactive:hover .kanban-card-actions {
          opacity: 1 !important;
        }
        .kanban-tag:hover {
          transform: translateY(-1px);
          box-shadow: 2px 2px 0px #282828;
        }
        .kanban-link-tag:hover {
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
        [draggable="true"] {
          -webkit-user-drag: element;
        }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: repeat(4"] {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          div[style*="grid-template-columns: repeat(4"] {
            grid-template-columns: 1fr !important;
          }
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
