"use client";

import { useState, useEffect, use, useCallback, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ShapeType = "rect" | "circle" | "text" | "line" | "freehand";
type ToolType = "select" | ShapeType;

interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  text?: string;
  // For freehand shapes
  points?: { x: number; y: number }[];
  // For line shapes
  x2?: number;
  y2?: number;
}

interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

interface WhiteboardData {
  shapes: Shape[];
  viewport: Viewport;
}

/* ------------------------------------------------------------------ */
/*  Palette                                                            */
/* ------------------------------------------------------------------ */

const COLORS = [
  { name: "Black", value: "#282828" },
  { name: "Watermelon", value: "#FF5E54" },
  { name: "Malachite", value: "#2BBF5D" },
  { name: "Cornflower", value: "#1283EB" },
  { name: "Lemon", value: "#FFE459" },
  { name: "Amethyst", value: "#7B61FF" },
  { name: "White", value: "#FFFFFF" },
  { name: "Cream", value: "#F8F3EC" },
];

const FILL_COLORS = [
  { name: "None", value: "none" },
  { name: "White", value: "#FFFFFF" },
  { name: "Cream", value: "#F8F3EC" },
  { name: "Watermelon", value: "#FF5E54" },
  { name: "Malachite", value: "#2BBF5D" },
  { name: "Cornflower", value: "#1283EB" },
  { name: "Lemon", value: "#FFE459" },
  { name: "Amethyst", value: "#7B61FF" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function uid(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
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

  /* State */
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  /* Tool state */
  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [strokeColor, setStrokeColor] = useState("#282828");
  const [fillColor, setFillColor] = useState("none");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  /* Interaction state */
  const [dragState, setDragState] = useState<{
    type: "move" | "pan" | "create" | "freehand" | "line";
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    shapeId?: string;
  } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const artifactUrl = `/api/projects/${projectId}/artifacts/whiteboard/board.json`;

  /* ---- API ---- */

  const persist = useCallback(
    async (data: WhiteboardData) => {
      setSaving(true);
      try {
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
    [artifactUrl],
  );

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(artifactUrl, { credentials: "include" });
        if (res.ok) {
          const json = await res.json();
          const content = json?.artifact?.content;
          if (content) {
            setShapes(content.shapes ?? []);
            setViewport(content.viewport ?? { x: 0, y: 0, zoom: 1 });
          }
        } else if (res.status !== 404) {
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

  /* Debounced auto-save */
  const loadedRef = useRef(false);
  useEffect(() => {
    if (loading) return;
    if (!loadedRef.current) {
      loadedRef.current = true;
      return;
    }
    const timer = setTimeout(() => persist({ shapes, viewport }), 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shapes, viewport, loading]);

  /* ---- Coordinate helpers ---- */

  function screenToCanvas(clientX: number, clientY: number): { x: number; y: number } {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: clientX, y: clientY };
    return {
      x: (clientX - rect.left) / viewport.zoom - viewport.x,
      y: (clientY - rect.top) / viewport.zoom - viewport.y,
    };
  }

  /* ---- Mouse handlers ---- */

  function handlePointerDown(e: React.MouseEvent<SVGSVGElement>) {
    if (editingTextId) return;
    const target = e.target as SVGElement;
    const shapeEl = target.closest("[data-shape-id]") as SVGElement | null;

    if (activeTool === "select") {
      if (shapeEl) {
        const sid = shapeEl.getAttribute("data-shape-id")!;
        setSelectedId(sid);
        const s = shapes.find((sh) => sh.id === sid);
        if (!s) return;
        setDragState({
          type: "move",
          startX: e.clientX,
          startY: e.clientY,
          origX: s.x,
          origY: s.y,
          shapeId: sid,
        });
      } else {
        // Pan
        setSelectedId(null);
        setDragState({
          type: "pan",
          startX: e.clientX,
          startY: e.clientY,
          origX: viewport.x,
          origY: viewport.y,
        });
      }
    } else if (activeTool === "freehand") {
      const pt = screenToCanvas(e.clientX, e.clientY);
      const newShape: Shape = {
        id: uid(),
        type: "freehand",
        x: pt.x,
        y: pt.y,
        width: 0,
        height: 0,
        fill: "none",
        stroke: strokeColor,
        strokeWidth: 3,
        points: [{ x: pt.x, y: pt.y }],
      };
      setShapes((prev) => [...prev, newShape]);
      setDragState({
        type: "freehand",
        startX: e.clientX,
        startY: e.clientY,
        origX: pt.x,
        origY: pt.y,
        shapeId: newShape.id,
      });
    } else if (activeTool === "line") {
      const pt = screenToCanvas(e.clientX, e.clientY);
      const newShape: Shape = {
        id: uid(),
        type: "line",
        x: pt.x,
        y: pt.y,
        width: 0,
        height: 0,
        fill: "none",
        stroke: strokeColor,
        strokeWidth: 3,
        x2: pt.x,
        y2: pt.y,
      };
      setShapes((prev) => [...prev, newShape]);
      setDragState({
        type: "line",
        startX: e.clientX,
        startY: e.clientY,
        origX: pt.x,
        origY: pt.y,
        shapeId: newShape.id,
      });
    } else if (activeTool === "text") {
      const pt = screenToCanvas(e.clientX, e.clientY);
      const newShape: Shape = {
        id: uid(),
        type: "text",
        x: pt.x,
        y: pt.y,
        width: 180,
        height: 40,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: 0,
        text: "Text",
      };
      setShapes((prev) => [...prev, newShape]);
      setSelectedId(newShape.id);
      setEditingTextId(newShape.id);
      setActiveTool("select");
    } else {
      // rect or circle: start creating
      const pt = screenToCanvas(e.clientX, e.clientY);
      const newShape: Shape = {
        id: uid(),
        type: activeTool as ShapeType,
        x: pt.x,
        y: pt.y,
        width: 0,
        height: 0,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: 3,
      };
      setShapes((prev) => [...prev, newShape]);
      setDragState({
        type: "create",
        startX: e.clientX,
        startY: e.clientY,
        origX: pt.x,
        origY: pt.y,
        shapeId: newShape.id,
      });
    }
  }

  function handlePointerMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!dragState) return;

    const dx = (e.clientX - dragState.startX) / viewport.zoom;
    const dy = (e.clientY - dragState.startY) / viewport.zoom;

    if (dragState.type === "pan") {
      setViewport((v) => ({
        ...v,
        x: dragState.origX + dx,
        y: dragState.origY + dy,
      }));
    } else if (dragState.type === "move" && dragState.shapeId) {
      setShapes((prev) =>
        prev.map((s) =>
          s.id === dragState.shapeId
            ? { ...s, x: dragState.origX + dx, y: dragState.origY + dy }
            : s,
        ),
      );
    } else if (dragState.type === "create" && dragState.shapeId) {
      setShapes((prev) =>
        prev.map((s) => {
          if (s.id !== dragState.shapeId) return s;
          const w = dx;
          const h = dy;
          return {
            ...s,
            x: w < 0 ? dragState.origX + w : dragState.origX,
            y: h < 0 ? dragState.origY + h : dragState.origY,
            width: Math.abs(w),
            height: Math.abs(h),
          };
        }),
      );
    } else if (dragState.type === "freehand" && dragState.shapeId) {
      const pt = screenToCanvas(e.clientX, e.clientY);
      setShapes((prev) =>
        prev.map((s) =>
          s.id === dragState.shapeId
            ? { ...s, points: [...(s.points || []), { x: pt.x, y: pt.y }] }
            : s,
        ),
      );
    } else if (dragState.type === "line" && dragState.shapeId) {
      const pt = screenToCanvas(e.clientX, e.clientY);
      setShapes((prev) =>
        prev.map((s) =>
          s.id === dragState.shapeId ? { ...s, x2: pt.x, y2: pt.y } : s,
        ),
      );
    }
  }

  function handlePointerUp() {
    if (dragState?.type === "create" && dragState.shapeId) {
      // If shape is too small (just a click), give it minimum size
      setShapes((prev) =>
        prev.map((s) => {
          if (s.id !== dragState.shapeId) return s;
          if (s.width < 10 && s.height < 10) {
            return { ...s, width: 100, height: 80 };
          }
          return s;
        }),
      );
      setSelectedId(dragState.shapeId);
      setActiveTool("select");
    } else if (dragState?.type === "freehand" && dragState.shapeId) {
      setActiveTool("select");
      setSelectedId(dragState.shapeId);
    } else if (dragState?.type === "line" && dragState.shapeId) {
      setActiveTool("select");
      setSelectedId(dragState.shapeId);
    }
    setDragState(null);
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setViewport((v) => ({
      ...v,
      zoom: clamp(v.zoom + delta, 0.25, 4),
    }));
  }

  /* ---- Keyboard ---- */

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (editingTextId) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedId) {
          setShapes((prev) => prev.filter((s) => s.id !== selectedId));
          setSelectedId(null);
        }
      } else if (e.key === "Escape") {
        setSelectedId(null);
        setActiveTool("select");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, editingTextId]);

  /* ---- Actions ---- */

  function deleteSelected() {
    if (!selectedId) return;
    setShapes((prev) => prev.filter((s) => s.id !== selectedId));
    setSelectedId(null);
  }

  function zoomIn() {
    setViewport((v) => ({ ...v, zoom: clamp(v.zoom + 0.25, 0.25, 4) }));
  }

  function zoomOut() {
    setViewport((v) => ({ ...v, zoom: clamp(v.zoom - 0.25, 0.25, 4) }));
  }

  function resetView() {
    setViewport({ x: 0, y: 0, zoom: 1 });
  }

  /* ---- SVG shape rendering ---- */

  function renderShape(shape: Shape) {
    const isSelected = selectedId === shape.id;
    const commonProps = {
      "data-shape-id": shape.id,
      cursor: activeTool === "select" ? "grab" : "default",
    };

    switch (shape.type) {
      case "rect":
        return (
          <g key={shape.id} {...commonProps}>
            <rect
              x={shape.x}
              y={shape.y}
              width={shape.width}
              height={shape.height}
              fill={shape.fill}
              stroke={isSelected ? "#FF5E54" : shape.stroke}
              strokeWidth={isSelected ? shape.strokeWidth + 1 : shape.strokeWidth}
              data-shape-id={shape.id}
            />
            {isSelected && (
              <rect
                x={shape.x - 2}
                y={shape.y - 2}
                width={shape.width + 4}
                height={shape.height + 4}
                fill="none"
                stroke="#FF5E54"
                strokeWidth={2}
                strokeDasharray="6 3"
                pointerEvents="none"
              />
            )}
          </g>
        );

      case "circle":
        return (
          <g key={shape.id} {...commonProps}>
            <ellipse
              cx={shape.x + shape.width / 2}
              cy={shape.y + shape.height / 2}
              rx={shape.width / 2}
              ry={shape.height / 2}
              fill={shape.fill}
              stroke={isSelected ? "#FF5E54" : shape.stroke}
              strokeWidth={isSelected ? shape.strokeWidth + 1 : shape.strokeWidth}
              data-shape-id={shape.id}
            />
            {isSelected && (
              <rect
                x={shape.x - 2}
                y={shape.y - 2}
                width={shape.width + 4}
                height={shape.height + 4}
                fill="none"
                stroke="#FF5E54"
                strokeWidth={2}
                strokeDasharray="6 3"
                pointerEvents="none"
              />
            )}
          </g>
        );

      case "text":
        return (
          <g key={shape.id} {...commonProps}>
            {shape.fill !== "none" && (
              <rect
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
                fill={shape.fill}
                stroke="none"
                data-shape-id={shape.id}
              />
            )}
            {/* Invisible hit target for text */}
            <rect
              x={shape.x}
              y={shape.y}
              width={shape.width}
              height={shape.height}
              fill="transparent"
              stroke="none"
              data-shape-id={shape.id}
            />
            {editingTextId === shape.id ? (
              <foreignObject
                x={shape.x}
                y={shape.y}
                width={Math.max(shape.width, 120)}
                height={Math.max(shape.height, 40)}
              >
                <input
                  autoFocus
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({ xmlns: "http://www.w3.org/1999/xhtml" } as any)}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "3px solid #FF5E54",
                    outline: "none",
                    background: shape.fill === "none" ? "#FFFFFF" : shape.fill,
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    fontSize: "16px",
                    fontWeight: 700,
                    padding: "4px 8px",
                    boxSizing: "border-box" as const,
                    color: "#282828",
                  }}
                  value={shape.text ?? ""}
                  onChange={(e) =>
                    setShapes((prev) =>
                      prev.map((s) =>
                        s.id === shape.id ? { ...s, text: e.target.value } : s,
                      ),
                    )
                  }
                  onBlur={() => setEditingTextId(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setEditingTextId(null);
                    e.stopPropagation();
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              </foreignObject>
            ) : (
              <text
                x={shape.x + 8}
                y={shape.y + shape.height / 2 + 6}
                fill={shape.stroke}
                fontSize="16"
                fontWeight="700"
                fontFamily="'Space Grotesk', system-ui, sans-serif"
                data-shape-id={shape.id}
                style={{ userSelect: "none" }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingTextId(shape.id);
                  setSelectedId(shape.id);
                }}
              >
                {shape.text || "Text"}
              </text>
            )}
            {isSelected && (
              <rect
                x={shape.x - 2}
                y={shape.y - 2}
                width={shape.width + 4}
                height={shape.height + 4}
                fill="none"
                stroke="#FF5E54"
                strokeWidth={2}
                strokeDasharray="6 3"
                pointerEvents="none"
              />
            )}
          </g>
        );

      case "line":
        return (
          <g key={shape.id} {...commonProps}>
            {/* Wide invisible hit line */}
            <line
              x1={shape.x}
              y1={shape.y}
              x2={shape.x2 ?? shape.x}
              y2={shape.y2 ?? shape.y}
              stroke="transparent"
              strokeWidth={12}
              data-shape-id={shape.id}
            />
            <line
              x1={shape.x}
              y1={shape.y}
              x2={shape.x2 ?? shape.x}
              y2={shape.y2 ?? shape.y}
              stroke={isSelected ? "#FF5E54" : shape.stroke}
              strokeWidth={isSelected ? shape.strokeWidth + 1 : shape.strokeWidth}
              strokeLinecap="round"
              data-shape-id={shape.id}
            />
            {isSelected && (
              <>
                <circle
                  cx={shape.x}
                  cy={shape.y}
                  r={5}
                  fill="#FF5E54"
                  stroke="#282828"
                  strokeWidth={2}
                  pointerEvents="none"
                />
                <circle
                  cx={shape.x2 ?? shape.x}
                  cy={shape.y2 ?? shape.y}
                  r={5}
                  fill="#FF5E54"
                  stroke="#282828"
                  strokeWidth={2}
                  pointerEvents="none"
                />
              </>
            )}
          </g>
        );

      case "freehand": {
        if (!shape.points || shape.points.length < 2) return null;
        const d = shape.points
          .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
          .join(" ");
        return (
          <g key={shape.id} {...commonProps}>
            {/* Wide invisible hit path */}
            <path
              d={d}
              fill="none"
              stroke="transparent"
              strokeWidth={12}
              data-shape-id={shape.id}
            />
            <path
              d={d}
              fill="none"
              stroke={isSelected ? "#FF5E54" : shape.stroke}
              strokeWidth={isSelected ? shape.strokeWidth + 1 : shape.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              data-shape-id={shape.id}
            />
          </g>
        );
      }

      default:
        return null;
    }
  }

  /* ---- Render ---- */

  if (loading) {
    return (
      <div className="nb-loading" style={{ height: "100vh" }}>
        Loading whiteboard...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="nb-loading"
        style={{ height: "100vh", color: "var(--nb-watermelon)" }}
      >
        {error}
      </div>
    );
  }

  const tools: { tool: ToolType; label: string; icon: string }[] = [
    { tool: "select", label: "Select", icon: "\u2710" },
    { tool: "rect", label: "Rectangle", icon: "\u25A1" },
    { tool: "circle", label: "Circle", icon: "\u25CB" },
    { tool: "text", label: "Text", icon: "T" },
    { tool: "line", label: "Line", icon: "\u2571" },
    { tool: "freehand", label: "Freehand", icon: "\u270E" },
  ];

  return (
    <div
      className="nb-page"
      style={{
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Breadcrumb */}
      <nav
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          padding: "12px 24px 0",
          textTransform: "uppercase",
          flexShrink: 0,
        }}
      >
        <a
          href="/dashboard"
          style={{
            color: "var(--nb-black)",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          Dashboard
        </a>
        <span style={{ margin: "0 6px", color: "var(--nb-gray-mid)" }}>/</span>
        <a
          href={`/projects/${projectId}`}
          style={{
            color: "var(--nb-black)",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          Project
        </a>
        <span style={{ margin: "0 6px", color: "var(--nb-gray-mid)" }}>/</span>
        <span style={{ color: "var(--nb-gray-dark)" }}>Whiteboard</span>
        {saving && (
          <span
            style={{
              marginLeft: "16px",
              color: "var(--nb-gray-mid)",
              fontStyle: "italic",
              fontSize: "11px",
            }}
          >
            Saving...
          </span>
        )}
      </nav>

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          padding: "8px 24px",
          borderBottom: "4px solid var(--nb-black)",
          alignItems: "center",
          flexShrink: 0,
          backgroundColor: "var(--nb-cream)",
          flexWrap: "wrap",
        }}
      >
        {/* Tool buttons */}
        {tools.map((t) => (
          <button
            key={t.tool}
            className={`nb-btn nb-btn-sm ${activeTool === t.tool ? "nb-btn-primary" : "nb-btn-secondary"}`}
            onClick={() => setActiveTool(t.tool)}
            title={t.label}
            style={{ minWidth: "42px", justifyContent: "center" }}
          >
            <span style={{ fontSize: "18px", lineHeight: 1 }}>{t.icon}</span>
          </button>
        ))}

        {/* Separator */}
        <div
          style={{
            width: "3px",
            height: "32px",
            backgroundColor: "var(--nb-black)",
            margin: "0 6px",
          }}
        />

        {/* Stroke color swatches */}
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            marginRight: "4px",
          }}
        >
          Stroke
        </span>
        {COLORS.slice(0, 6).map((c) => (
          <button
            key={c.value}
            title={c.name}
            onClick={() => setStrokeColor(c.value)}
            style={{
              width: "28px",
              height: "28px",
              backgroundColor: c.value,
              border:
                strokeColor === c.value
                  ? "3px solid var(--nb-watermelon)"
                  : "3px solid var(--nb-black)",
              cursor: "pointer",
              boxShadow:
                strokeColor === c.value
                  ? "0 0 0 2px var(--nb-watermelon)"
                  : "2px 2px 0px var(--nb-black)",
            }}
          />
        ))}

        {/* Separator */}
        <div
          style={{
            width: "3px",
            height: "32px",
            backgroundColor: "var(--nb-black)",
            margin: "0 6px",
          }}
        />

        {/* Fill color swatches */}
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            marginRight: "4px",
          }}
        >
          Fill
        </span>
        {FILL_COLORS.slice(0, 6).map((c) => (
          <button
            key={`fill-${c.value}`}
            title={c.name}
            onClick={() => setFillColor(c.value)}
            style={{
              width: "28px",
              height: "28px",
              backgroundColor: c.value === "none" ? "var(--nb-cream)" : c.value,
              border:
                fillColor === c.value
                  ? "3px solid var(--nb-watermelon)"
                  : "3px solid var(--nb-black)",
              cursor: "pointer",
              position: "relative",
              boxShadow:
                fillColor === c.value
                  ? "0 0 0 2px var(--nb-watermelon)"
                  : "2px 2px 0px var(--nb-black)",
            }}
          >
            {c.value === "none" && (
              <span
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%) rotate(-45deg)",
                  width: "24px",
                  height: "3px",
                  backgroundColor: "var(--nb-watermelon)",
                }}
              />
            )}
          </button>
        ))}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Delete button */}
        {selectedId && (
          <button
            className="nb-btn nb-btn-sm nb-btn-danger"
            onClick={deleteSelected}
            title="Delete selected (Del)"
          >
            Delete
          </button>
        )}

        {/* Separator */}
        <div
          style={{
            width: "3px",
            height: "32px",
            backgroundColor: "var(--nb-black)",
            margin: "0 6px",
          }}
        />

        {/* Zoom controls */}
        <button
          className="nb-btn nb-btn-sm nb-btn-secondary"
          onClick={zoomOut}
          title="Zoom out"
        >
          -
        </button>
        <span
          className="nb-tag"
          style={{ minWidth: "50px", textAlign: "center" }}
        >
          {Math.round(viewport.zoom * 100)}%
        </span>
        <button
          className="nb-btn nb-btn-sm nb-btn-secondary"
          onClick={zoomIn}
          title="Zoom in"
        >
          +
        </button>
        <button
          className="nb-btn nb-btn-sm nb-btn-secondary"
          onClick={resetView}
          title="Reset view"
        >
          Reset
        </button>
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflow: "hidden",
          position: "relative",
          backgroundColor: "var(--nb-cream)",
          border: "4px solid var(--nb-black)",
          cursor:
            activeTool === "select"
              ? dragState?.type === "pan"
                ? "grabbing"
                : "default"
              : "crosshair",
        }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          style={{ display: "block" }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onWheel={handleWheel}
        >
          {/* Grid pattern */}
          <defs>
            <pattern
              id="grid"
              width={24 * viewport.zoom}
              height={24 * viewport.zoom}
              patternUnits="userSpaceOnUse"
              x={viewport.x * viewport.zoom}
              y={viewport.y * viewport.zoom}
            >
              <circle
                cx={12 * viewport.zoom}
                cy={12 * viewport.zoom}
                r={1.5}
                fill="var(--nb-gray-mid)"
                opacity="0.4"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Transformed group for shapes */}
          <g
            transform={`scale(${viewport.zoom}) translate(${viewport.x}, ${viewport.y})`}
          >
            {shapes.map(renderShape)}
          </g>
        </svg>

        {/* Empty state */}
        {shapes.length === 0 && !dragState && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "14px",
                color: "var(--nb-gray-mid)",
                textTransform: "uppercase",
                fontWeight: 700,
                letterSpacing: "0.1em",
              }}
            >
              Empty whiteboard
            </div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                color: "var(--nb-gray-mid)",
                marginTop: "8px",
              }}
            >
              Select a tool from the toolbar and click to start drawing.
              <br />
              Drag on empty space to pan. Scroll to zoom.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
