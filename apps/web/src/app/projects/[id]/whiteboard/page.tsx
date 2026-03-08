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
      // We'll add after URL is entered -- store temp container
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
      <div className="nb-loading" style={{ height: "100vh" }}>
        Loading whiteboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="nb-loading" style={{ height: "100vh", color: "var(--nb-watermelon)" }}>
        {error}
      </div>
    );
  }

  return (
    <div className="nb-page" style={{ height: "100vh", overflow: "hidden" }}>
      {/* Breadcrumb */}
      <nav style={{ fontFamily: "var(--font-mono)", fontSize: "13px", padding: "12px 24px 0", textTransform: "uppercase" }}>
        <a href="/dashboard" style={{ color: "var(--nb-black)", textDecoration: "none", fontWeight: 700 }}>Dashboard</a>
        <span style={{ margin: "0 6px", color: "var(--nb-gray-mid)" }}>/</span>
        <a href={`/projects/${projectId}`} style={{ color: "var(--nb-black)", textDecoration: "none", fontWeight: 700 }}>Project</a>
        <span style={{ margin: "0 6px", color: "var(--nb-gray-mid)" }}>/</span>
        <span style={{ color: "var(--nb-gray-dark)" }}>Whiteboard</span>
      </nav>

      {/* Toolbar */}
      <div className="nb-flex" style={{ gap: "6px", padding: "8px 24px", borderBottom: "4px solid var(--nb-black)", alignItems: "center", flexShrink: 0, backgroundColor: "var(--nb-cream)" }}>
        <button className="nb-btn nb-btn-primary" onClick={() => addContainer("text")}>
          + Text
        </button>
        <button className="nb-btn nb-btn-info" onClick={() => addContainer("image")}>
          + Image
        </button>
        {selectedId && (
          <>
            <button className="nb-btn nb-btn-warning" onClick={startEdgeFrom}>
              {edgeFrom ? "Drawing edge..." : "Connect"}
            </button>
            <button className="nb-btn nb-btn-secondary" onClick={deleteSelected} style={{ color: "var(--nb-watermelon)" }}>
              Delete
            </button>
          </>
        )}
        <div style={{ flex: 1 }} />
        <button className="nb-btn nb-btn-secondary nb-btn-sm" onClick={() => setViewport((v) => ({ ...v, zoom: Math.min(5, v.zoom + 0.2) }))}>
          Zoom +
        </button>
        <button className="nb-btn nb-btn-secondary nb-btn-sm" onClick={() => setViewport((v) => ({ ...v, zoom: Math.max(0.1, v.zoom - 0.2) }))}>
          Zoom -
        </button>
        <button className="nb-btn nb-btn-secondary nb-btn-sm" onClick={resetView}>
          Reset
        </button>
        <span className="nb-tag">{Math.round(viewport.zoom * 100)}%</span>
      </div>

      {/* Image URL input */}
      {showImageInput && (
        <div className="nb-flex" style={{ gap: "6px", padding: "6px 24px", backgroundColor: "var(--nb-lemon)", alignItems: "center", borderBottom: "4px solid var(--nb-black)" }}>
          <input
            className="nb-input"
            placeholder="Image URL"
            autoFocus
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddImage()}
            style={{ flex: 1, marginBottom: 0 }}
          />
          <button className="nb-btn nb-btn-primary nb-btn-sm" onClick={handleAddImage}>Set</button>
          <button className="nb-btn nb-btn-secondary nb-btn-sm" onClick={() => setShowImageInput(false)}>Cancel</button>
        </div>
      )}

      {/* Canvas */}
      <div
        ref={canvasRef}
        style={{
          flex: 1,
          overflow: "hidden",
          position: "relative",
          backgroundColor: "var(--nb-cream)",
          cursor: "default",
          border: "4px solid var(--nb-black)",
        }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onWheel={handleWheel}
      >
        <div
          data-canvas="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "10000px",
            height: "10000px",
            backgroundImage: "radial-gradient(circle, var(--nb-gray-mid) 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px",
            transform: `scale(${viewport.zoom}) translate(${viewport.x}px, ${viewport.y}px)`,
            transformOrigin: "0 0",
          }}
        >
          {/* SVG edges */}
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              overflow: "visible",
            }}
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
                    stroke="var(--nb-black)"
                    strokeWidth={3}
                    markerEnd="url(#arrowhead)"
                  />
                  {edge.label && (
                    <text
                      x={(from.cx + to.cx) / 2}
                      y={(from.cy + to.cy) / 2 - 6}
                      textAnchor="middle"
                      fontSize="12"
                      fill="var(--nb-black)"
                      fontWeight="700"
                      fontFamily="var(--font-mono)"
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
                <polygon points="0 0, 10 3.5, 0 7" fill="var(--nb-black)" />
              </marker>
            </defs>
          </svg>

          {/* Containers */}
          {containers.map((c) => (
            <div
              key={c.id}
              style={{
                position: "absolute",
                left: `${c.x}px`,
                top: `${c.y}px`,
                width: `${c.width}px`,
                height: `${c.height}px`,
                backgroundColor: "var(--nb-white)",
                border: selectedId === c.id
                  ? "4px solid var(--nb-watermelon)"
                  : "4px solid var(--nb-black)",
                cursor: edgeFrom ? "crosshair" : "grab",
                overflow: "hidden",
                userSelect: "none",
                boxShadow: selectedId === c.id
                  ? "6px 6px 0px var(--nb-watermelon)"
                  : "var(--shadow-brutal)",
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
                        boxSizing: "border-box",
                        fontFamily: "var(--font-body)",
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
                        whiteSpace: "pre-wrap",
                        overflow: "hidden",
                        height: "100%",
                        fontFamily: "var(--font-body)",
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
                    objectFit: "cover",
                    pointerEvents: "none",
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
                    color: "var(--nb-gray-mid)",
                    fontSize: "12px",
                    fontFamily: "var(--font-mono)",
                    textTransform: "uppercase",
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
                        position: "absolute",
                        width: "12px",
                        height: "12px",
                        backgroundColor: "var(--nb-black)",
                        border: "2px solid var(--nb-white)",
                        cursor: `${corner.replace("-", "")}-resize`,
                        ...(corner.includes("top") ? { top: "-6px" } : { bottom: "-6px" }),
                        ...(corner.includes("left") ? { left: "-6px" } : { right: "-6px" }),
                      }}
                      onMouseDown={(e) => handleResizeMouseDown(e, c.id, corner)}
                    />
                  )
                )}

              {/* Connector point */}
              {selectedId === c.id && (
                <div
                  style={{
                    position: "absolute",
                    top: "-10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "14px",
                    height: "14px",
                    backgroundColor: edgeFrom === c.id ? "var(--nb-lemon)" : "var(--nb-malachite)",
                    cursor: "crosshair",
                    border: "3px solid var(--nb-black)",
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
