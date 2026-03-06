"use client";

import { useState, useEffect, use, useCallback, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  Types (matching @idea-management/schemas Whiteboard)               */
/* ------------------------------------------------------------------ */

interface ContainerStyle {
  backgroundColor: string;
  borderColor: string;
  fontSize: number;
}

interface WBContainer {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  type: "text" | "image" | "group";
  imageUrl?: string;
  style: ContainerStyle;
  groupId?: string;
}

interface WBEdge {
  id: string;
  fromId: string;
  toId: string;
  label: string;
}

interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

interface WhiteboardData {
  containers: WBContainer[];
  edges: WBEdge[];
  viewport: Viewport;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function uid(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function containerCenter(c: WBContainer): { cx: number; cy: number } {
  return { cx: c.x + c.width / 2, cy: c.y + c.height / 2 };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function WhiteboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);

  const [containers, setContainers] = useState<WBContainer[]>([]);
  const [edges, setEdges] = useState<WBEdge[]>([]);
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection & interaction
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<{
    type: "move" | "resize" | "pan";
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW?: number;
    origH?: number;
    corner?: string;
  } | null>(null);

  // Edge drawing
  const [edgeFrom, setEdgeFrom] = useState<string | null>(null);

  // Image URL input
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");

  const canvasRef = useRef<HTMLDivElement>(null);

  const artifactUrl = `/api/projects/${projectId}/artifacts/whiteboard/board.json`;

  const persist = useCallback(
    async (data: WhiteboardData) => {
      await fetch(artifactUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
    },
    [artifactUrl]
  );

  const persistCurrent = useCallback(() => {
    persist({ containers, edges, viewport });
  }, [containers, edges, viewport, persist]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(artifactUrl, { credentials: "include" });
        if (res.ok) {
          const data: WhiteboardData = await res.json();
          setContainers(data.containers ?? []);
          setEdges(data.edges ?? []);
          setViewport(data.viewport ?? { x: 0, y: 0, zoom: 1 });
        } else if (res.status === 404) {
          setContainers([]);
          setEdges([]);
        } else {
          setError("Failed to load whiteboard");
        }
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [artifactUrl]);

  // Debounced persist on state changes (skip initial load)
  const loadedRef = useRef(false);
  useEffect(() => {
    if (loading) return;
    if (!loadedRef.current) {
      loadedRef.current = true;
      return;
    }
    const timer = setTimeout(() => persistCurrent(), 500);
    return () => clearTimeout(timer);
  }, [containers, edges, viewport, loading, persistCurrent]);

  /* ---------- Canvas mouse handlers ---------- */

  function screenToCanvas(screenX: number, screenY: number) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: screenX, y: screenY };
    return {
      x: (screenX - rect.left) / viewport.zoom - viewport.x,
      y: (screenY - rect.top) / viewport.zoom - viewport.y,
    };
  }

  function handleCanvasMouseDown(e: React.MouseEvent) {
    // Only pan if clicking on empty canvas
    if ((e.target as HTMLElement).dataset.canvas !== "true") return;

    // If drawing edge and clicking canvas, cancel
    if (edgeFrom) {
      setEdgeFrom(null);
      return;
    }

    setSelectedId(null);
    setDragState({
      type: "pan",
      startX: e.clientX,
      startY: e.clientY,
      origX: viewport.x,
      origY: viewport.y,
    });
  }

  function handleCanvasMouseMove(e: React.MouseEvent) {
    if (!dragState) return;

    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;

    if (dragState.type === "pan") {
      setViewport((v) => ({
        ...v,
        x: dragState.origX + dx / v.zoom,
        y: dragState.origY + dy / v.zoom,
      }));
    } else if (dragState.type === "move" && selectedId) {
      setContainers((prev) =>
        prev.map((c) =>
          c.id === selectedId
            ? {
                ...c,
                x: dragState.origX + dx / viewport.zoom,
                y: dragState.origY + dy / viewport.zoom,
              }
            : c
        )
      );
    } else if (dragState.type === "resize" && selectedId) {
      const scaledDx = dx / viewport.zoom;
      const scaledDy = dy / viewport.zoom;
      setContainers((prev) =>
        prev.map((c) => {
          if (c.id !== selectedId) return c;
          let newX = c.x, newY = c.y;
          let newW = dragState.origW ?? c.width;
          let newH = dragState.origH ?? c.height;

          if (dragState.corner?.includes("right")) newW = Math.max(40, (dragState.origW ?? c.width) + scaledDx);
          if (dragState.corner?.includes("bottom")) newH = Math.max(30, (dragState.origH ?? c.height) + scaledDy);
          if (dragState.corner?.includes("left")) {
            const delta = scaledDx;
            newX = dragState.origX + delta;
            newW = Math.max(40, (dragState.origW ?? c.width) - delta);
          }
          if (dragState.corner?.includes("top")) {
            const delta = scaledDy;
            newY = dragState.origY + delta;
            newH = Math.max(30, (dragState.origH ?? c.height) - delta);
          }
          return { ...c, x: newX, y: newY, width: newW, height: newH };
        })
      );
    }
  }

  function handleCanvasMouseUp() {
    setDragState(null);
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setViewport((v) => ({
      ...v,
      zoom: Math.max(0.1, Math.min(5, v.zoom + delta)),
    }));
  }

  /* ---------- Container handlers ---------- */

  function handleContainerMouseDown(e: React.MouseEvent, containerId: string) {
    e.stopPropagation();

    if (edgeFrom) {
      // Complete edge
      if (edgeFrom !== containerId) {
        setEdges((prev) => [
          ...prev,
          { id: uid(), fromId: edgeFrom, toId: containerId, label: "" },
        ]);
      }
      setEdgeFrom(null);
      return;
    }

    setSelectedId(containerId);
    const c = containers.find((c) => c.id === containerId);
    if (!c) return;
    setDragState({
      type: "move",
      startX: e.clientX,
      startY: e.clientY,
      origX: c.x,
      origY: c.y,
    });
  }

  function handleResizeMouseDown(
    e: React.MouseEvent,
    containerId: string,
    corner: string
  ) {
    e.stopPropagation();
    const c = containers.find((c) => c.id === containerId);
    if (!c) return;
    setSelectedId(containerId);
    setDragState({
      type: "resize",
      startX: e.clientX,
      startY: e.clientY,
      origX: c.x,
      origY: c.y,
      origW: c.width,
      origH: c.height,
      corner,
    });
  }

  /* ---------- Toolbar actions ---------- */

  function addContainer(type: "text" | "image") {
    const cx = -viewport.x + 400 / viewport.zoom;
    const cy = -viewport.y + 300 / viewport.zoom;
    const c: WBContainer = {
      id: uid(),
      x: cx,
      y: cy,
      width: 200,
      height: type === "image" ? 160 : 120,
      content: type === "text" ? "Double-click to edit" : "",
      type,
      style: { backgroundColor: "#ffffff", borderColor: "#333333", fontSize: 14 },
    };
    if (type === "image") {
      setShowImageInput(true);
      // We'll add after URL is entered — store temp container
      setContainers((prev) => [...prev, { ...c, imageUrl: "" }]);
      setSelectedId(c.id);
      return;
    }
    setContainers((prev) => [...prev, c]);
    setSelectedId(c.id);
  }

  function deleteSelected() {
    if (!selectedId) return;
    setContainers((prev) => prev.filter((c) => c.id !== selectedId));
    setEdges((prev) =>
      prev.filter((e) => e.fromId !== selectedId && e.toId !== selectedId)
    );
    setSelectedId(null);
  }

  function startEdgeFrom() {
    if (!selectedId) return;
    setEdgeFrom(selectedId);
  }

  function resetView() {
    setViewport({ x: 0, y: 0, zoom: 1 });
  }

  function handleAddImage() {
    if (!imageUrlInput.trim() || !selectedId) {
      setShowImageInput(false);
      return;
    }
    setContainers((prev) =>
      prev.map((c) =>
        c.id === selectedId ? { ...c, imageUrl: imageUrlInput.trim(), type: "image" } : c
      )
    );
    setImageUrlInput("");
    setShowImageInput(false);
  }

  /* ---------- Render ---------- */

  if (loading) {
    return (
      <div style={s.center}>
        <span>Loading whiteboard...</span>
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
        <a href="/dashboard" style={s.breadcrumbLink}>Dashboard</a>
        <span style={s.breadcrumbSep}>/</span>
        <a href={`/projects/${projectId}`} style={s.breadcrumbLink}>Project</a>
        <span style={s.breadcrumbSep}>/</span>
        <span style={s.breadcrumbCurrent}>Whiteboard</span>
      </nav>

      {/* Toolbar */}
      <div style={s.toolbar}>
        <button style={s.toolBtn} onClick={() => addContainer("text")}>
          + Text
        </button>
        <button style={s.toolBtn} onClick={() => addContainer("image")}>
          + Image
        </button>
        {selectedId && (
          <>
            <button style={s.toolBtn} onClick={startEdgeFrom}>
              {edgeFrom ? "Drawing edge..." : "Connect"}
            </button>
            <button
              style={{ ...s.toolBtn, color: "#d93025" }}
              onClick={deleteSelected}
            >
              Delete
            </button>
          </>
        )}
        <div style={{ flex: 1 }} />
        <button style={s.toolBtn} onClick={() => setViewport((v) => ({ ...v, zoom: Math.min(5, v.zoom + 0.2) }))}>
          Zoom +
        </button>
        <button style={s.toolBtn} onClick={() => setViewport((v) => ({ ...v, zoom: Math.max(0.1, v.zoom - 0.2) }))}>
          Zoom -
        </button>
        <button style={s.toolBtn} onClick={resetView}>
          Reset
        </button>
        <span style={s.zoomLabel}>{Math.round(viewport.zoom * 100)}%</span>
      </div>

      {/* Image URL input */}
      {showImageInput && (
        <div style={s.imageBar}>
          <input
            style={s.input}
            placeholder="Image URL"
            autoFocus
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddImage()}
          />
          <button style={s.smallBtn} onClick={handleAddImage}>Set</button>
          <button style={s.ghostBtn} onClick={() => setShowImageInput(false)}>Cancel</button>
        </div>
      )}

      {/* Canvas */}
      <div
        ref={canvasRef}
        style={s.canvasWrapper}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onWheel={handleWheel}
      >
        <div
          data-canvas="true"
          style={{
            ...s.canvas,
            transform: `scale(${viewport.zoom}) translate(${viewport.x}px, ${viewport.y}px)`,
            transformOrigin: "0 0",
          }}
        >
          {/* SVG edges */}
          <svg
            style={s.edgeSvg}
            data-canvas="true"
          >
            {edges.map((edge) => {
              const fromC = containers.find((c) => c.id === edge.fromId);
              const toC = containers.find((c) => c.id === edge.toId);
              if (!fromC || !toC) return null;
              const from = containerCenter(fromC);
              const to = containerCenter(toC);
              return (
                <g key={edge.id}>
                  <line
                    x1={from.cx}
                    y1={from.cy}
                    x2={to.cx}
                    y2={to.cy}
                    stroke="#666"
                    strokeWidth={2}
                    markerEnd="url(#arrowhead)"
                  />
                  {edge.label && (
                    <text
                      x={(from.cx + to.cx) / 2}
                      y={(from.cy + to.cy) / 2 - 6}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#555"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="10"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
              </marker>
            </defs>
          </svg>

          {/* Containers */}
          {containers.map((c) => (
            <div
              key={c.id}
              style={{
                position: "absolute" as const,
                left: `${c.x}px`,
                top: `${c.y}px`,
                width: `${c.width}px`,
                height: `${c.height}px`,
                backgroundColor: c.style.backgroundColor,
                border: `2px solid ${
                  selectedId === c.id ? "#1a73e8" : c.style.borderColor
                }`,
                borderRadius: "4px",
                cursor: edgeFrom ? "crosshair" : "grab",
                overflow: "hidden",
                userSelect: "none" as const,
                boxShadow:
                  selectedId === c.id
                    ? "0 0 0 2px rgba(26,115,232,0.3)"
                    : "0 1px 3px rgba(0,0,0,0.1)",
              }}
              onMouseDown={(e) => handleContainerMouseDown(e, c.id)}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (c.type === "text") setEditingId(c.id);
              }}
            >
              {c.type === "text" && (
                <>
                  {editingId === c.id ? (
                    <textarea
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                        outline: "none",
                        resize: "none",
                        fontSize: `${c.style.fontSize}px`,
                        padding: "8px",
                        boxSizing: "border-box" as const,
                        fontFamily: "inherit",
                        backgroundColor: "transparent",
                      }}
                      autoFocus
                      value={c.content}
                      onChange={(e) =>
                        setContainers((prev) =>
                          prev.map((ci) =>
                            ci.id === c.id
                              ? { ...ci, content: e.target.value }
                              : ci
                          )
                        )
                      }
                      onBlur={() => setEditingId(null)}
                      onMouseDown={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div
                      style={{
                        padding: "8px",
                        fontSize: `${c.style.fontSize}px`,
                        whiteSpace: "pre-wrap" as const,
                        overflow: "hidden",
                        height: "100%",
                      }}
                    >
                      {c.content}
                    </div>
                  )}
                </>
              )}
              {c.type === "image" && c.imageUrl && (
                <img
                  src={c.imageUrl}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover" as const,
                    pointerEvents: "none" as const,
                  }}
                />
              )}
              {c.type === "image" && !c.imageUrl && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    color: "#999",
                    fontSize: "12px",
                  }}
                >
                  No image URL set
                </div>
              )}

              {/* Resize handles (only when selected) */}
              {selectedId === c.id &&
                ["top-left", "top-right", "bottom-left", "bottom-right"].map(
                  (corner) => (
                    <div
                      key={corner}
                      style={{
                        position: "absolute" as const,
                        width: "10px",
                        height: "10px",
                        backgroundColor: "#1a73e8",
                        borderRadius: "2px",
                        cursor: `${corner.replace("-", "")}-resize`,
                        ...(corner.includes("top") ? { top: "-5px" } : { bottom: "-5px" }),
                        ...(corner.includes("left") ? { left: "-5px" } : { right: "-5px" }),
                      }}
                      onMouseDown={(e) => handleResizeMouseDown(e, c.id, corner)}
                    />
                  )
                )}

              {/* Connector point */}
              {selectedId === c.id && (
                <div
                  style={{
                    position: "absolute" as const,
                    top: "-8px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "12px",
                    height: "12px",
                    backgroundColor: edgeFrom === c.id ? "#ff9800" : "#4caf50",
                    borderRadius: "50%",
                    cursor: "crosshair",
                    border: "2px solid #fff",
                  }}
                  title="Click to start drawing an edge"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    if (edgeFrom === c.id) {
                      setEdgeFrom(null);
                    } else {
                      setEdgeFrom(c.id);
                    }
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
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
  breadcrumb: { fontSize: "13px", padding: "12px 24px 0" },
  breadcrumbLink: { color: "#1a73e8", textDecoration: "none" },
  breadcrumbSep: { margin: "0 6px", color: "#999" },
  breadcrumbCurrent: { color: "#333", fontWeight: 500 },
  toolbar: {
    display: "flex",
    gap: "6px",
    padding: "8px 24px",
    borderBottom: "1px solid #e0e0e0",
    alignItems: "center",
    flexShrink: 0,
    backgroundColor: "#f8f9fa",
  },
  toolBtn: {
    padding: "6px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 500,
  },
  zoomLabel: { fontSize: "12px", color: "#888", minWidth: "40px", textAlign: "right" as const },
  imageBar: {
    display: "flex",
    gap: "6px",
    padding: "6px 24px",
    backgroundColor: "#fffde7",
    alignItems: "center",
  },
  input: {
    padding: "6px 10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "13px",
    flex: 1,
  },
  smallBtn: {
    padding: "6px 12px",
    backgroundColor: "#1a73e8",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  ghostBtn: {
    padding: "6px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "12px",
  },
  canvasWrapper: {
    flex: 1,
    overflow: "hidden",
    position: "relative" as const,
    backgroundColor: "#f0f0f0",
    cursor: "default",
  },
  canvas: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "10000px",
    height: "10000px",
    backgroundImage:
      "radial-gradient(circle, #ccc 1px, transparent 1px)",
    backgroundSize: "20px 20px",
  },
  edgeSvg: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none" as const,
    overflow: "visible" as const,
  },
};
