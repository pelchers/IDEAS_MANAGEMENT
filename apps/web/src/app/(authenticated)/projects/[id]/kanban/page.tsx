"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAnyArtifactRefresh } from "@/hooks/use-artifact-refresh";
import { useParams } from "next/navigation";

/* ── Types ── */
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
  id: string;
  label: string;
  headerBg: string;
  headerColor: string;
}

interface KanbanSettings {
  compactCards: boolean;
}

const DEFAULT_COLUMNS: ColumnDef[] = [
  { id: "backlog", label: "BACKLOG", headerBg: "#F8F3EC", headerColor: "#282828" },
  { id: "todo", label: "TO DO", headerBg: "#FF5E54", headerColor: "#FFFFFF" },
  { id: "progress", label: "IN PROGRESS", headerBg: "#2ECC71", headerColor: "#282828" },
  { id: "done", label: "DONE", headerBg: "#282828", headerColor: "#FFFFFF" },
];

const COLUMN_COLORS = [
  "#F8F3EC", "#FF5E54", "#2ECC71", "#282828", "#9B59B6",
  "#3498DB", "#FFE459", "#E74C3C", "#1ABC9C", "#F39C12",
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

function colUid(): string {
  return `col-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

type ColumnsMap = Record<string, KanbanCard[]>;

/* ── Component ── */
export default function KanbanPage() {
  const params = useParams();
  const projectId = String(params.id);
  const [columnDefs, setColumnDefs] = useState<ColumnDef[]>(DEFAULT_COLUMNS);
  const [columns, setColumns] = useState<ColumnsMap>({});
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Settings
  const [settings, setSettings] = useState<KanbanSettings>({ compactCards: false });
  const [showSettings, setShowSettings] = useState(false);

  // Add-card
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  // Edit modal
  const [editCard, setEditCard] = useState<{ colId: string; card: KanbanCard } | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editLinks, setEditLinks] = useState("");
  const [editBgColor, setEditBgColor] = useState("#FFFFFF");

  // Settings popover (card color)
  const [settingsCardId, setSettingsCardId] = useState<string | null>(null);

  // Column management
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [newColColor, setNewColColor] = useState("#F8F3EC");
  const [renamingCol, setRenamingCol] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Card drag state (native HTML5 DnD)
  const [dragCard, setDragCard] = useState<{ colId: string; index: number } | null>(null);
  const [dropTarget, setDropTarget] = useState<{ colId: string; index: number } | null>(null);

  // Column drag state
  const [dragCol, setDragCol] = useState<number | null>(null);
  const [dropColTarget, setDropColTarget] = useState<number | null>(null);

  // Live reactivity: reload when AI modifies board via tool
  useAnyArtifactRefresh(useCallback(() => window.location.reload(), []));

  // Load board
  useEffect(() => {
    fetch(`/api/projects/${projectId}/artifacts/kanban/board.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.ok && data.artifact?.content?.columns) {
          const loadedCols: ColumnDef[] = [];
          const loadedCards: ColumnsMap = {};

          for (const col of data.artifact.content.columns) {
            const id = col.id || colUid();
            loadedCols.push({
              id,
              label: col.title || col.label || id.toUpperCase(),
              headerBg: col.headerBg || "#F8F3EC",
              headerColor: col.headerColor || "#282828",
            });
            loadedCards[id] = Array.isArray(col.cards)
              ? col.cards.map((c: Record<string, unknown>, i: number) => ({
                  id: c.id ? String(c.id) : uid() + i,
                  title: (c.title as string) || "Untitled",
                  description: (c.description as string) || "",
                  tags: Array.isArray(c.tags) ? (c.tags as string[]) : [],
                  links: Array.isArray(c.links) ? (c.links as string[]) : [],
                  bgColor: (c.bgColor as string) || undefined,
                  createdAt: (c.createdAt as string) || undefined,
                  modifiedAt: (c.modifiedAt as string) || undefined,
                }))
              : [];
          }

          if (loadedCols.length > 0) {
            setColumnDefs(loadedCols);
            setColumns(loadedCards);
          } else {
            const defaultCards: ColumnsMap = {};
            for (const col of DEFAULT_COLUMNS) defaultCards[col.id] = [];
            setColumns(defaultCards);
          }

          // Load settings if present
          if (data.artifact.content.settings) {
            setSettings(data.artifact.content.settings);
          }
        } else {
          const defaultCards: ColumnsMap = {};
          for (const col of DEFAULT_COLUMNS) defaultCards[col.id] = [];
          setColumns(defaultCards);
        }
        setLoaded(true);
      })
      .catch((err) => {
        setLoadError(err.message || "Failed to load board");
        const defaultCards: ColumnsMap = {};
        for (const col of DEFAULT_COLUMNS) defaultCards[col.id] = [];
        setColumns(defaultCards);
        setLoaded(true);
      });
  }, [projectId]);

  // Save
  const saveBoard = useCallback((newColumnDefs: ColumnDef[], newColumns: ColumnsMap, newSettings?: KanbanSettings) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setSaving(true);
    setSaveError(null);
    saveTimeoutRef.current = setTimeout(() => {
      const payload = {
        columns: newColumnDefs.map((col) => ({
          id: col.id,
          title: col.label,
          headerBg: col.headerBg,
          headerColor: col.headerColor,
          cards: newColumns[col.id] || [],
        })),
        settings: newSettings || settings,
      };
      fetch(`/api/projects/${projectId}/artifacts/kanban/board.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: payload }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Save failed");
          setSaving(false);
        })
        .catch(() => {
          setSaveError("Failed to save — changes may be lost");
          setSaving(false);
        });
    }, 500);
  }, [projectId, settings]);

  const updateAndSave = useCallback((nextDefs: ColumnDef[], nextCards: ColumnsMap) => {
    setColumnDefs(nextDefs);
    setColumns(nextCards);
    saveBoard(nextDefs, nextCards);
  }, [saveBoard]);

  const updateCardsOnly = useCallback((nextCards: ColumnsMap) => {
    setColumns(nextCards);
    saveBoard(columnDefs, nextCards);
  }, [saveBoard, columnDefs]);

  const updateSettings = useCallback((next: KanbanSettings) => {
    setSettings(next);
    saveBoard(columnDefs, columns, next);
  }, [saveBoard, columnDefs, columns]);

  /* ── Column Management ── */
  const addColumn = () => {
    const name = newColName.trim();
    if (!name) return;
    const newCol: ColumnDef = {
      id: colUid(),
      label: name.toUpperCase(),
      headerBg: newColColor,
      headerColor: contrastText(newColColor),
    };
    const nextDefs = [...columnDefs, newCol];
    const nextCards = { ...columns, [newCol.id]: [] };
    updateAndSave(nextDefs, nextCards);
    setNewColName("");
    setNewColColor("#F8F3EC");
    setShowAddColumn(false);
  };

  const renameColumn = (colId: string) => {
    const name = renameValue.trim();
    if (!name) { setRenamingCol(null); return; }
    const nextDefs = columnDefs.map((c) =>
      c.id === colId ? { ...c, label: name.toUpperCase() } : c
    );
    updateAndSave(nextDefs, columns);
    setRenamingCol(null);
    setRenameValue("");
  };

  const deleteColumn = (colId: string) => {
    const nextDefs = columnDefs.filter((c) => c.id !== colId);
    const nextCards = { ...columns };
    delete nextCards[colId];
    updateAndSave(nextDefs, nextCards);
    setDeleteConfirm(null);
  };

  const updateColumnColor = (colId: string, color: string) => {
    const nextDefs = columnDefs.map((c) =>
      c.id === colId ? { ...c, headerBg: color, headerColor: contrastText(color) } : c
    );
    updateAndSave(nextDefs, columns);
  };

  const resetToDefaults = () => {
    const defaultCards: ColumnsMap = {};
    for (const col of DEFAULT_COLUMNS) {
      defaultCards[col.id] = columns[col.id] || [];
    }
    updateAndSave([...DEFAULT_COLUMNS], defaultCards);
  };

  /* ── Column Drag & Drop ── */
  const onColDragStart = (colIdx: number) => (e: React.DragEvent) => {
    setDragCol(colIdx);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "column");
  };

  const onColDragOver = (colIdx: number) => (e: React.DragEvent) => {
    if (dragCol === null) return; // only handle column drags
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropColTarget(colIdx);
  };

  const onColDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragCol === null || dropColTarget === null || dragCol === dropColTarget) {
      setDragCol(null);
      setDropColTarget(null);
      return;
    }
    const nextDefs = [...columnDefs];
    const [moved] = nextDefs.splice(dragCol, 1);
    nextDefs.splice(dropColTarget, 0, moved);
    updateAndSave(nextDefs, columns);
    setDragCol(null);
    setDropColTarget(null);
  };

  const onColDragEnd = () => {
    setDragCol(null);
    setDropColTarget(null);
  };

  /* ── Card Drag & Drop (native HTML5) ── */
  const onDragStart = (colId: string, index: number) => (e: React.DragEvent) => {
    setDragCard({ colId, index });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "card");
    if (e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.currentTarget, 20, 20);
    }
  };

  const onDragOverColumn = (colId: string) => (e: React.DragEvent) => {
    if (dragCol !== null) return; // don't handle column drags here
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget({ colId, index: (columns[colId] || []).length });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragCol !== null) { onColDrop(e); return; }
    if (!dragCard || !dropTarget) return;

    const { colId: fromCol, index: fromIdx } = dragCard;
    const { colId: toCol, index: toIdx } = dropTarget;

    const fromCards = [...(columns[fromCol] || [])];
    const [moved] = fromCards.splice(fromIdx, 1);
    if (!moved) return;

    if (fromCol === toCol) {
      const adjustedIdx = toIdx > fromIdx ? toIdx - 1 : toIdx;
      fromCards.splice(adjustedIdx, 0, moved);
      updateCardsOnly({ ...columns, [fromCol]: fromCards });
    } else {
      const toCards = [...(columns[toCol] || [])];
      toCards.splice(toIdx, 0, moved);
      updateCardsOnly({ ...columns, [fromCol]: fromCards, [toCol]: toCards });
    }

    setDragCard(null);
    setDropTarget(null);
  };

  const onDragEnd = () => {
    setDragCard(null);
    setDropTarget(null);
  };

  /* ── Card CRUD ── */
  const addCard = (colId: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    const now = nowISO();
    const card: KanbanCard = {
      id: uid(), title: trimmed, description: "", tags: [], links: [],
      createdAt: now, modifiedAt: now,
    };
    const next = { ...columns, [colId]: [...(columns[colId] || []), card] };
    updateCardsOnly(next);
    setNewTitle("");
    setAddingTo(null);
    setTimeout(() => openEditModal(colId, card), 50);
  };

  const deleteCard = (colId: string, cardId: string) => {
    updateCardsOnly({ ...columns, [colId]: (columns[colId] || []).filter((c) => c.id !== cardId) });
    if (settingsCardId === cardId) setSettingsCardId(null);
  };

  const updateCardColor = (colId: string, cardId: string, color: string) => {
    updateCardsOnly({
      ...columns,
      [colId]: (columns[colId] || []).map((c) =>
        c.id === cardId ? { ...c, bgColor: color, modifiedAt: nowISO() } : c
      ),
    });
  };

  const openEditModal = (colId: string, card: KanbanCard) => {
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
    updateCardsOnly({
      ...columns,
      [colId]: (columns[colId] || []).map((c) =>
        c.id === card.id
          ? { ...c, title: editTitle.trim() || c.title, description: editDescription.trim(),
              tags: parsedTags, links: parsedLinks, bgColor: editBgColor, modifiedAt: nowISO() }
          : c
      ),
    });
    setEditCard(null);
  };

  const totalCards = Object.values(columns).reduce((sum, col) => sum + col.length, 0);

  /* ── Loading state ── */
  if (!loaded) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        minHeight: "400px", gap: "16px",
      }}>
        <div style={{
          width: "48px", height: "48px", border: "4px solid #282828", borderTopColor: "transparent",
          borderRadius: "0", animation: "spin 0.8s linear infinite",
        }} />
        <div style={{
          fontWeight: 700, fontSize: "1rem", textTransform: "uppercase",
          letterSpacing: "0.05em", fontFamily: "monospace",
        }}>
          Loading board...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", minHeight: "calc(100vh - 120px)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <h1 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "0.05em", textTransform: "uppercase", margin: 0 }}>
          KANBAN
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {saving && (
            <span style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#999", textTransform: "uppercase" }}>
              saving...
            </span>
          )}
          {saveError && (
            <span style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#FF5E54", textTransform: "uppercase" }}>
              {saveError}
            </span>
          )}
          <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#666", textTransform: "uppercase" }}>
            {totalCards} card{totalCards !== 1 ? "s" : ""} / {columnDefs.length} col{columnDefs.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={() => setShowAddColumn(!showAddColumn)}
            style={{
              padding: "8px 16px", backgroundColor: "#282828", color: "#FFFFFF",
              border: "3px solid #282828", fontWeight: 700, fontSize: "0.8rem",
              textTransform: "uppercase", cursor: "pointer", fontFamily: "monospace",
              transition: "transform 100ms ease, box-shadow 100ms ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translate(-2px, -2px)"; e.currentTarget.style.boxShadow = "4px 4px 0 #282828"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
          >
            + COLUMN
          </button>
        </div>
      </div>

      {/* Load error banner */}
      {loadError && (
        <div style={{
          border: "3px solid #FF5E54", backgroundColor: "#FADBD8", padding: "12px 16px",
          marginBottom: "16px", fontFamily: "monospace", fontSize: "0.8rem",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span>Could not load saved board: {loadError}. Showing defaults.</span>
          <button onClick={() => setLoadError(null)} style={{
            background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "1rem",
          }}>&#10005;</button>
        </div>
      )}

      {/* Add column form */}
      {showAddColumn && (
        <div style={{
          border: "3px solid #282828", padding: "16px", marginBottom: "16px",
          backgroundColor: "#FFFFFF", boxShadow: "4px 4px 0 #282828",
          display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap",
        }}>
          <div style={{ flex: 1, minWidth: "150px" }}>
            <label style={{ display: "block", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", marginBottom: "4px" }}>
              Column Name
            </label>
            <input
              type="text" value={newColName} onChange={(e) => setNewColName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addColumn(); if (e.key === "Escape") setShowAddColumn(false); }}
              placeholder="New column..." autoFocus
              style={{
                width: "100%", padding: "8px 12px", border: "3px solid #282828",
                fontFamily: "monospace", fontSize: "0.85rem", outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", marginBottom: "4px" }}>
              Color
            </label>
            <div style={{ display: "flex", gap: "4px" }}>
              {COLUMN_COLORS.map((color) => (
                <button key={color} onClick={() => setNewColColor(color)} style={{
                  width: "24px", height: "24px", backgroundColor: color,
                  border: newColColor === color ? "3px solid #FF5E54" : "2px solid #282828",
                  cursor: "pointer", padding: 0,
                }} />
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={addColumn} style={{
              padding: "8px 16px", backgroundColor: "#282828", color: "#FFFFFF",
              border: "3px solid #282828", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", cursor: "pointer",
            }}>ADD</button>
            <button onClick={() => { setShowAddColumn(false); setNewColName(""); }} style={{
              padding: "8px 16px", backgroundColor: "#FFFFFF", border: "3px solid #282828",
              fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
            }}>&#10005;</button>
          </div>
        </div>
      )}

      {/* Empty states */}
      {totalCards === 0 && columnDefs.length > 0 && (
        <div style={{ border: "4px dashed #282828", padding: "48px", textAlign: "center", backgroundColor: "#FFFFFF", marginBottom: "24px" }}>
          <div style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: "8px" }}>No cards yet</div>
          <div style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#666" }}>
            Click &quot;+ ADD&quot; at the bottom of any column to create your first card
          </div>
        </div>
      )}

      {columnDefs.length === 0 && (
        <div style={{ border: "4px dashed #282828", padding: "48px", textAlign: "center", backgroundColor: "#FFFFFF", marginBottom: "24px" }}>
          <div style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: "8px" }}>No columns</div>
          <div style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#666" }}>
            Click &quot;+ COLUMN&quot; above to create your first column
          </div>
        </div>
      )}

      {/* Board */}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columnDefs.length}, 1fr)`,
        gap: "16px",
        minHeight: "max(500px, calc(100vh - 60px - 200px))",
        paddingBottom: "60px",
      }}>
        {columnDefs.map((col, colIdx) => {
          const isColDragOver = dropColTarget === colIdx && dragCol !== null && dragCol !== colIdx;
          return (
            <div
              key={col.id}
              onDragOver={onColDragOver(colIdx)}
              onDrop={onColDrop}
              style={{
                border: isColDragOver ? "4px solid #FF5E54" : "4px solid #282828",
                backgroundColor: "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                opacity: dragCol === colIdx ? 0.4 : 1,
                transition: "border-color 150ms, opacity 150ms",
              }}
            >
              {/* Column header — draggable */}
              <div
                draggable
                onDragStart={onColDragStart(colIdx)}
                onDragEnd={onColDragEnd}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px",
                  backgroundColor: col.headerBg, color: col.headerColor, fontWeight: 700, textTransform: "uppercase",
                  cursor: "grab",
                }}
              >
                {renamingCol === col.id ? (
                  <input
                    type="text" value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") renameColumn(col.id); if (e.key === "Escape") setRenamingCol(null); }}
                    onBlur={() => renameColumn(col.id)}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    draggable={false}
                    style={{
                      flex: 1, padding: "4px 8px", border: "2px solid currentColor",
                      fontWeight: 700, fontSize: "0.95rem", textTransform: "uppercase",
                      background: "rgba(255,255,255,0.3)", color: "inherit", outline: "none",
                      fontFamily: "inherit",
                    }}
                  />
                ) : (
                  <h3
                    onDoubleClick={() => { setRenamingCol(col.id); setRenameValue(col.label); }}
                    style={{ fontSize: "1rem", margin: 0, cursor: "grab" }}
                    title="Drag to reorder / Double-click to rename"
                  >
                    {col.label}
                  </h3>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{
                    fontFamily: "monospace", fontSize: "0.8rem",
                    width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center",
                    border: "2px solid currentColor",
                  }}>
                    {(columns[col.id] || []).length}
                  </span>
                  {deleteConfirm === col.id ? (
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button onClick={() => deleteColumn(col.id)} style={{
                        width: "22px", height: "22px", backgroundColor: "#FF5E54", color: "#FFF",
                        border: "2px solid #282828", cursor: "pointer", fontSize: "0.65rem", fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
                      }} title="Confirm delete">&#10003;</button>
                      <button onClick={() => setDeleteConfirm(null)} style={{
                        width: "22px", height: "22px", backgroundColor: "#FFF", color: "#282828",
                        border: "2px solid #282828", cursor: "pointer", fontSize: "0.65rem", fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
                      }} title="Cancel">&#10005;</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(col.id)} style={{
                      width: "22px", height: "22px", backgroundColor: "transparent", color: "currentColor",
                      border: "2px solid currentColor", cursor: "pointer", fontSize: "0.65rem", fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
                      opacity: 0.5, transition: "opacity 150ms",
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.5"; }}
                      title="Delete column"
                    >&#10005;</button>
                  )}
                </div>
              </div>

              {/* Cards */}
              <div
                onDragOver={(e) => { if (dragCol === null) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDropTarget({ colId: col.id, index: (columns[col.id] || []).length }); } }}
                onDrop={onDrop}
                style={{ flex: 1, padding: "8px", minHeight: "100px", display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {(columns[col.id] || []).map((card, cardIdx) => {
                  const bg = card.bgColor || "#FFFFFF";
                  const textColor = contrastText(bg);
                  const showCardSettings = settingsCardId === card.id;
                  const hasDesc = !!(card.description?.trim());
                  const hasLinks = !!(card.links && card.links.length > 0);
                  const isDragOver = dropTarget?.colId === col.id && dropTarget?.index === cardIdx;
                  const compact = settings.compactCards;

                  return (
                    <div key={card.id}>
                      {isDragOver && dragCard && !(dragCard.colId === col.id && dragCard.index === cardIdx) && (
                        <div style={{ height: "4px", backgroundColor: "#FF5E54", marginBottom: "4px", borderRadius: "2px" }} />
                      )}
                      <div
                        draggable
                        onDragStart={onDragStart(col.id, cardIdx)}
                        onDragOver={(e) => { if (dragCol === null) { e.preventDefault(); e.stopPropagation(); setDropTarget({ colId: col.id, index: cardIdx }); } }}
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
                        <div style={{ padding: compact ? "6px 10px" : "10px 12px" }}>
                          <div
                            onClick={() => openEditModal(col.id, card)}
                            style={{ fontWeight: 700, fontSize: compact ? "0.8rem" : "0.9rem", cursor: "pointer", wordBreak: "break-word", paddingRight: "56px" }}
                          >
                            {card.title}
                          </div>

                          {!compact && hasDesc && (
                            <div style={{
                              fontFamily: "monospace", fontSize: "0.75rem", marginTop: "4px",
                              opacity: 0.7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}>
                              {card.description}
                            </div>
                          )}

                          {!compact && card.tags.length > 0 && (
                            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "8px" }}>
                              {card.tags.map((tag) => (
                                <span key={tag} className="kanban-tag" style={{
                                  ...getTagStyle(tag),
                                  fontFamily: "monospace", fontSize: "0.65rem",
                                  textTransform: "uppercase", padding: "2px 8px", border: "2px solid #282828",
                                  cursor: "default", transition: "transform 100ms ease, box-shadow 100ms ease",
                                }}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {!compact && hasLinks && (
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
                                    fontFamily: "monospace", fontSize: "0.6rem",
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

                        {/* Action buttons */}
                        <div className="kanban-card-actions" style={{
                          position: "absolute", top: "6px", right: "6px",
                          display: "flex", gap: "4px", opacity: 0,
                        }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setSettingsCardId(showCardSettings ? null : card.id); }}
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
                        {showCardSettings && (
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

                {dropTarget?.colId === col.id && dropTarget?.index === (columns[col.id] || []).length && dragCard && (
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
                        fontFamily: "monospace", fontSize: "0.85rem",
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
                    color: "#666", letterSpacing: "0.05em",
                  }}>+ ADD</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Settings Button (bottom-right) ── */}
      <button
        onClick={() => setShowSettings(true)}
        style={{
          position: "fixed", bottom: "24px", right: "24px", zIndex: 1000,
          width: "48px", height: "48px", backgroundColor: "#282828", color: "#FFFFFF",
          border: "3px solid #282828", boxShadow: "4px 4px 0 #282828",
          cursor: "pointer", fontSize: "1.3rem", display: "flex",
          alignItems: "center", justifyContent: "center",
          transition: "transform 100ms ease, box-shadow 100ms ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "translate(-2px, -2px)"; e.currentTarget.style.boxShadow = "6px 6px 0 #282828"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "4px 4px 0 #282828"; }}
        title="Board Settings"
      >
        &#9881;
      </button>

      {/* ── Settings Modal ── */}
      {showSettings && (
        <div onClick={() => setShowSettings(false)} style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            backgroundColor: "#FFFFFF", border: "4px solid #282828", boxShadow: "8px 8px 0px #282828",
            padding: "32px", width: "100%", maxWidth: "480px", maxHeight: "90vh", overflowY: "auto", boxSizing: "border-box",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <h2 style={{ fontWeight: 800, fontSize: "1.2rem", textTransform: "uppercase", margin: 0 }}>
                BOARD SETTINGS
              </h2>
              <button onClick={() => setShowSettings(false)} className="nb-modal-btn" style={{
                padding: "8px 16px", backgroundColor: "#FFFFFF", border: "3px solid #282828",
                fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", cursor: "pointer",
                transition: "transform 100ms ease, box-shadow 100ms ease",
              }}>CLOSE</button>
            </div>

            {/* Stats */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px",
            }}>
              <div style={{ border: "3px solid #282828", padding: "16px", textAlign: "center" }}>
                <div style={{ fontWeight: 800, fontSize: "1.5rem", fontFamily: "monospace" }}>{columnDefs.length}</div>
                <div style={{ fontFamily: "monospace", fontSize: "0.7rem", textTransform: "uppercase", color: "#999" }}>Columns</div>
              </div>
              <div style={{ border: "3px solid #282828", padding: "16px", textAlign: "center" }}>
                <div style={{ fontWeight: 800, fontSize: "1.5rem", fontFamily: "monospace" }}>{totalCards}</div>
                <div style={{ fontFamily: "monospace", fontSize: "0.7rem", textTransform: "uppercase", color: "#999" }}>Total Cards</div>
              </div>
            </div>

            {/* Compact cards toggle */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              border: "3px solid #282828", padding: "12px 16px", marginBottom: "16px",
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase" }}>Compact Cards</div>
                <div style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#999", marginTop: "2px" }}>
                  Show title only, hide description/tags/links
                </div>
              </div>
              <button
                onClick={() => updateSettings({ ...settings, compactCards: !settings.compactCards })}
                style={{
                  width: "48px", height: "28px", border: "3px solid #282828",
                  backgroundColor: settings.compactCards ? "#2ECC71" : "#F8F3EC",
                  cursor: "pointer", position: "relative", padding: 0,
                  transition: "background-color 150ms",
                }}
              >
                <div style={{
                  width: "18px", height: "18px", backgroundColor: "#282828",
                  position: "absolute", top: "2px",
                  left: settings.compactCards ? "24px" : "2px",
                  transition: "left 150ms",
                }} />
              </button>
            </div>

            {/* Column list */}
            <label style={{ display: "block", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "8px" }}>
              Columns ({columnDefs.length})
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
              {columnDefs.map((col) => (
                <div key={col.id} style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  border: "2px solid #282828", padding: "8px 12px",
                }}>
                  <div style={{
                    width: "24px", height: "24px", backgroundColor: col.headerBg,
                    border: "2px solid #282828", flexShrink: 0,
                  }} />
                  <span style={{ flex: 1, fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase" }}>
                    {col.label}
                  </span>
                  <span style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#999" }}>
                    {(columns[col.id] || []).length} cards
                  </span>
                  {/* Color picker for column */}
                  <div style={{ display: "flex", gap: "2px" }}>
                    {COLUMN_COLORS.slice(0, 5).map((color) => (
                      <button key={color} onClick={() => updateColumnColor(col.id, color)} style={{
                        width: "16px", height: "16px", backgroundColor: color,
                        border: col.headerBg === color ? "2px solid #FF5E54" : "1px solid #282828",
                        cursor: "pointer", padding: 0,
                      }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Reset to defaults */}
            <button
              onClick={resetToDefaults}
              style={{
                width: "100%", padding: "10px", backgroundColor: "#FFFFFF",
                border: "3px solid #282828", fontWeight: 700, fontSize: "0.8rem",
                textTransform: "uppercase", cursor: "pointer", fontFamily: "monospace",
                transition: "transform 100ms ease, box-shadow 100ms ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translate(-2px, -2px)"; e.currentTarget.style.boxShadow = "4px 4px 0 #282828"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
            >
              RESET COLUMNS TO DEFAULTS
            </button>
          </div>
        </div>
      )}

      {/* ── Edit Card Modal ── */}
      {editCard && (
        <div onClick={() => setEditCard(null)} style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            backgroundColor: "#FFFFFF", border: "4px solid #282828", boxShadow: "8px 8px 0px #282828",
            padding: "32px", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto", boxSizing: "border-box",
          }}>
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

            {(editCard.card.createdAt || editCard.card.modifiedAt) && (
              <div style={{
                fontFamily: "monospace", fontSize: "0.7rem", color: "#666",
                marginBottom: "16px", display: "flex", gap: "16px",
              }}>
                {editCard.card.createdAt && <span>Created: {formatDate(editCard.card.createdAt)}</span>}
                {editCard.card.modifiedAt && <span>Modified: {formatDate(editCard.card.modifiedAt)}</span>}
              </div>
            )}

            <label style={labelStyle}>Title</label>
            <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={inputStyle} />

            <label style={labelStyle}>Description</label>
            <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Add a description..." rows={3}
              style={{ ...inputStyle, resize: "vertical" as const, minHeight: "70px" }}
            />

            <label style={labelStyle}>Tags (comma-separated)</label>
            <input type="text" value={editTags} onChange={(e) => setEditTags(e.target.value)}
              placeholder="feature, bug, urgent" style={inputStyle}
            />

            <label style={labelStyle}>Links (one per line)</label>
            <textarea value={editLinks} onChange={(e) => setEditLinks(e.target.value)}
              placeholder={"https://example.com\nhttps://github.com/..."} rows={2}
              style={{ ...inputStyle, resize: "vertical" as const, minHeight: "50px" }}
            />

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

            <label style={labelStyle}>Preview</label>
            <div style={{
              border: "3px solid #282828", padding: "12px", backgroundColor: editBgColor,
              color: contrastText(editBgColor), boxShadow: "3px 3px 0px #282828",
            }}>
              <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{editTitle || "Preview"}</div>
              {editDescription && (
                <div style={{ fontFamily: "monospace", fontSize: "0.75rem", marginTop: "4px", opacity: 0.7 }}>
                  {editDescription.length > 80 ? editDescription.slice(0, 80) + "..." : editDescription}
                </div>
              )}
              {editTags && (
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "8px" }}>
                  {editTags.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                    <span key={tag} style={{
                      ...getTagStyle(tag), fontFamily: "monospace", fontSize: "0.65rem",
                      textTransform: "uppercase", padding: "2px 8px", border: "2px solid #282828",
                    }}>{tag}</span>
                  ))}
                </div>
              )}
              {editLinks && (
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "6px" }}>
                  {editLinks.split("\n").map((l) => l.trim()).filter(Boolean).map((link, i) => (
                    <span key={i} style={{
                      fontFamily: "monospace", fontSize: "0.6rem", padding: "2px 8px",
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
          div[style*="grid-template-columns: repeat("] {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          div[style*="grid-template-columns: repeat("] {
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
  fontFamily: "monospace", fontSize: "0.9rem",
  backgroundColor: "#F8F3EC", outline: "none", boxSizing: "border-box", marginBottom: "16px",
};
