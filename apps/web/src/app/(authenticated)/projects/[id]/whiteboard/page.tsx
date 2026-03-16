"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";

/* ── Types ── */
type Tool = "select" | "draw" | "line" | "eraser" | "dot" | "sticky";

interface DrawPath {
  id: string;
  type: "freehand" | "line";
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

interface Dot {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
}

type StickyColor = "yellow" | "orange" | "green" | "pink";

interface StickyNote {
  id: string;
  title: string;
  description: string;
  tags: string[];
  color: StickyColor;
  bgColor: string;
  borderColor: string;
  x: number;
  y: number;
}

/* ── Constants ── */
const TOOLS: { id: Tool; icon: string; title: string }[] = [
  { id: "select", icon: "\u261A", title: "Select" },
  { id: "draw", icon: "\u270E", title: "Freehand Draw" },
  { id: "line", icon: "\u2571", title: "Straight Line" },
  { id: "dot", icon: "\u25CF", title: "Place Dot / Pin" },
  { id: "eraser", icon: "\u232B", title: "Eraser (click a stroke to remove it)" },
  { id: "sticky", icon: "\u25A0", title: "Add Sticky Note" },
];

const STICKY_PRESETS: Record<StickyColor, { bg: string; border: string }> = {
  yellow: { bg: "#FFE459", border: "#D4B800" },
  orange: { bg: "#FF5E54", border: "#C9302C" },
  green: { bg: "#2BBF5D", border: "#1A8C3E" },
  pink: { bg: "#7B61FF", border: "#5A3FD4" },
};

const BG_COLORS = [
  "#FFE459", "#FF5E54", "#2BBF5D", "#7B61FF", "#FFFFFF",
  "#F8F3EC", "#3498DB", "#E74C3C", "#1ABC9C", "#F39C12",
];

const BORDER_COLORS = [
  "#282828", "#D4B800", "#C9302C", "#1A8C3E", "#5A3FD4",
  "#2980B9", "#999999", "#FF5E54", "#16A085", "#E67E22",
];

const STICKY_COLOR_KEYS: StickyColor[] = ["yellow", "orange", "green", "pink"];

function contrastText(hex: string): string {
  const c = hex.replace("#", "");
  if (c.length < 6) return "#282828";
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? "#282828" : "#FFFFFF";
}

function getStickyRotation(index: number): string {
  if ((index + 1) % 3 === 0) return "rotate(-3deg)";
  if ((index + 1) % 2 === 0) return "rotate(1.5deg)";
  return "rotate(-2deg)";
}

function getCursor(tool: Tool): string {
  switch (tool) {
    case "select": return "default";
    case "draw": return "crosshair";
    case "line": return "crosshair";
    case "eraser": return "pointer";
    case "dot": return "crosshair";
    case "sticky": return "cell";
    default: return "default";
  }
}

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ── Hit detection: distance from point to line segment ── */
function distToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax, dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - ax, py - ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function isNearPath(px: number, py: number, path: DrawPath, threshold = 8): boolean {
  const pts = path.points;
  if (!pts || pts.length < 2) return false;
  for (let i = 0; i < pts.length - 1; i++) {
    if (distToSegment(px, py, pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y) < threshold) {
      return true;
    }
  }
  return false;
}

function isNearDot(px: number, py: number, dot: Dot, threshold = 12): boolean {
  return Math.hypot(px - dot.x, py - dot.y) < threshold;
}

/* ── Component ── */
export default function WhiteboardPage() {
  const params = useParams();
  const projectId = String(params.id);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [stickies, setStickies] = useState<StickyNote[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  // Drawing refs
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const pathsRef = useRef<DrawPath[]>([]);
  const dotsRef = useRef<Dot[]>([]);
  const currentPath = useRef<{ x: number; y: number }[]>([]);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Line tool preview
  const lineStart = useRef<{ x: number; y: number } | null>(null);
  const [linePreview, setLinePreview] = useState<{ x: number; y: number } | null>(null);

  // Sticky dragging
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Sticky settings popup
  const [settingsSticky, setSettingsSticky] = useState<StickyNote | null>(null);
  const [ssTitle, setSsTitle] = useState("");
  const [ssDesc, setSsDesc] = useState("");
  const [ssTags, setSsTags] = useState("");
  const [ssBgColor, setSsBgColor] = useState("#FFE459");
  const [ssBorderColor, setSsBorderColor] = useState("#282828");

  const [hoverStickyId, setHoverStickyId] = useState<string | null>(null);
  const [nextStickyColor, setNextStickyColor] = useState<StickyColor>("yellow");

  // Force re-render for dot/stroke counts
  const [, forceRender] = useState(0);
  const bump = () => forceRender((n) => n + 1);

  /* ── Save ── */
  const saveWhiteboard = useCallback((savePaths: DrawPath[], saveDots: Dot[], saveStickies: StickyNote[]) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setSaving(true);
    saveTimeoutRef.current = setTimeout(() => {
      fetch(`/api/projects/${projectId}/artifacts/whiteboard/board.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: { paths: savePaths, dots: saveDots, stickies: saveStickies },
        }),
      })
        .then(() => setSaving(false))
        .catch(() => setSaving(false));
    }, 500);
  }, [projectId]);

  /* ── Load ── */
  useEffect(() => {
    fetch(`/api/projects/${projectId}/artifacts/whiteboard/board.json`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.artifact?.content) {
          const content = data.artifact.content;
          if (Array.isArray(content.paths)) {
            pathsRef.current = content.paths.map((p: unknown) => {
              if (Array.isArray(p)) {
                return { id: genId("path"), type: "freehand" as const, points: p, color: "#282828", width: 3 };
              }
              const obj = p as Record<string, unknown>;
              return {
                id: (obj.id as string) || genId("path"),
                type: (obj.type as "freehand" | "line") || "freehand",
                points: Array.isArray(obj.points) ? obj.points : [],
                color: (obj.color as string) || "#282828",
                width: (obj.width as number) || 3,
              };
            });
          }
          if (Array.isArray(content.dots)) {
            dotsRef.current = content.dots;
          }
          if (Array.isArray(content.stickies)) {
            // Normalize old sticky format
            setStickies(content.stickies.map((s: Record<string, unknown>) => ({
              id: (s.id as string) || genId("sticky"),
              title: (s.title as string) || (s.text as string) || "Note",
              description: (s.description as string) || "",
              tags: Array.isArray(s.tags) ? (s.tags as string[]) : [],
              color: (s.color as StickyColor) || "yellow",
              bgColor: (s.bgColor as string) || STICKY_PRESETS[(s.color as StickyColor) || "yellow"]?.bg || "#FFE459",
              borderColor: (s.borderColor as string) || "#282828",
              x: (s.x as number) || 0,
              y: (s.y as number) || 0,
            })));
          }
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [projectId]);

  /* ── Draw grid ── */
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    const { width, height } = ctx.canvas;
    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y <= height; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }
  }, []);

  /* ── Redraw ── */
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx);

    // Paths
    for (const path of pathsRef.current) {
      if (!path.points || path.points.length < 2) continue;
      ctx.strokeStyle = path.color || "#282828";
      ctx.lineWidth = path.width || 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.stroke();
    }

    // Dots
    for (const dot of dotsRef.current) {
      ctx.fillStyle = dot.color || "#282828";
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.size || 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#282828";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [drawGrid]);

  /* ── Canvas setup + resize ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    function resize() {
      if (!canvas || !wrap) return;
      const rect = wrap.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      redraw();
    }

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [redraw, loaded]);

  /* ── Canvas mouse events ── */
  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasPos(e);

    if (activeTool === "draw") {
      isDrawing.current = true;
      lastPos.current = pos;
      currentPath.current = [pos];
    } else if (activeTool === "line") {
      lineStart.current = pos;
      setLinePreview(pos);
    } else if (activeTool === "dot") {
      const dot: Dot = { id: genId("dot"), x: pos.x, y: pos.y, color: "#282828", size: 6 };
      dotsRef.current.push(dot);
      redraw();
      saveWhiteboard(pathsRef.current, dotsRef.current, stickies);
      bump();
    } else if (activeTool === "eraser") {
      // Find nearest path or dot and remove it
      let removedSomething = false;

      // Check dots first (smaller targets)
      const dotIdx = dotsRef.current.findIndex((d) => isNearDot(pos.x, pos.y, d));
      if (dotIdx !== -1) {
        dotsRef.current.splice(dotIdx, 1);
        removedSomething = true;
      } else {
        // Check paths
        const pathIdx = pathsRef.current.findIndex((p) => isNearPath(pos.x, pos.y, p));
        if (pathIdx !== -1) {
          pathsRef.current.splice(pathIdx, 1);
          removedSomething = true;
        }
      }

      if (removedSomething) {
        redraw();
        saveWhiteboard(pathsRef.current, dotsRef.current, stickies);
        bump();
      }
    } else if (activeTool === "sticky") {
      const preset = STICKY_PRESETS[nextStickyColor];
      const newSticky: StickyNote = {
        id: genId("sticky"),
        title: "New note",
        description: "",
        tags: [],
        color: nextStickyColor,
        bgColor: preset.bg,
        borderColor: preset.border,
        x: pos.x - 80,
        y: pos.y - 40,
      };
      const updated = [...stickies, newSticky];
      setStickies(updated);
      saveWhiteboard(pathsRef.current, dotsRef.current, updated);
      setActiveTool("select");
      // Open settings immediately
      setTimeout(() => openStickySettings(newSticky), 50);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasPos(e);

    if (activeTool === "draw" && isDrawing.current) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx || !lastPos.current) return;

      ctx.strokeStyle = "#282828";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();

      lastPos.current = pos;
      currentPath.current.push(pos);
    } else if (activeTool === "line" && lineStart.current) {
      // Live preview: redraw everything + preview line
      redraw();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.strokeStyle = "#282828";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(lineStart.current.x, lineStart.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.setLineDash([]);
      setLinePreview(pos);
    }
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === "draw" && isDrawing.current && currentPath.current.length > 0) {
      pathsRef.current.push({
        id: genId("path"),
        type: "freehand",
        points: [...currentPath.current],
        color: "#282828",
        width: 3,
      });
      currentPath.current = [];
      saveWhiteboard(pathsRef.current, dotsRef.current, stickies);
      bump();
    } else if (activeTool === "line" && lineStart.current) {
      const pos = getCanvasPos(e);
      const dist = Math.hypot(pos.x - lineStart.current.x, pos.y - lineStart.current.y);
      if (dist > 5) {
        pathsRef.current.push({
          id: genId("line"),
          type: "line",
          points: [lineStart.current, pos],
          color: "#282828",
          width: 3,
        });
        saveWhiteboard(pathsRef.current, dotsRef.current, stickies);
        bump();
      }
      lineStart.current = null;
      setLinePreview(null);
      redraw();
    }

    isDrawing.current = false;
    lastPos.current = null;
  };

  /* ── Sticky note dragging ── */
  const handleStickyMouseDown = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    if (settingsSticky?.id === id) return;
    e.preventDefault();
    const sticky = stickies.find((s) => s.id === id);
    if (!sticky) return;
    const wrapRect = wrapRef.current?.getBoundingClientRect();
    if (!wrapRect) return;

    dragOffset.current = {
      x: e.clientX - (wrapRect.left + sticky.x),
      y: e.clientY - (wrapRect.top + sticky.y),
    };
    setDraggingId(id);
  };

  useEffect(() => {
    if (draggingId === null) return;

    const handleMouseMove = (e: MouseEvent) => {
      const wrapRect = wrapRef.current?.getBoundingClientRect();
      if (!wrapRect) return;
      const newX = e.clientX - wrapRect.left - dragOffset.current.x;
      const newY = e.clientY - wrapRect.top - dragOffset.current.y;
      setStickies((prev) =>
        prev.map((s) => (s.id === draggingId ? { ...s, x: newX, y: newY } : s))
      );
    };

    const handleMouseUp = () => {
      setDraggingId(null);
      setStickies((current) => {
        saveWhiteboard(pathsRef.current, dotsRef.current, current);
        return current;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingId, saveWhiteboard]);

  /* ── Sticky settings ── */
  const openStickySettings = (sticky: StickyNote) => {
    setSettingsSticky(sticky);
    setSsTitle(sticky.title);
    setSsDesc(sticky.description);
    setSsTags(sticky.tags.join(", "));
    setSsBgColor(sticky.bgColor);
    setSsBorderColor(sticky.borderColor);
  };

  const saveStickySettings = () => {
    if (!settingsSticky) return;
    const updated = stickies.map((s) =>
      s.id === settingsSticky.id
        ? {
            ...s,
            title: ssTitle.trim() || "Note",
            description: ssDesc.trim(),
            tags: ssTags.split(",").map((t) => t.trim()).filter(Boolean),
            bgColor: ssBgColor,
            borderColor: ssBorderColor,
          }
        : s
    );
    setStickies(updated);
    saveWhiteboard(pathsRef.current, dotsRef.current, updated);
    setSettingsSticky(null);
  };

  const deleteSticky = (id: string) => {
    const updated = stickies.filter((s) => s.id !== id);
    setStickies(updated);
    saveWhiteboard(pathsRef.current, dotsRef.current, updated);
    if (settingsSticky?.id === id) setSettingsSticky(null);
  };

  /* ── Loading ── */
  if (!loaded) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        minHeight: "400px", gap: "16px",
      }}>
        <div style={{
          width: "48px", height: "48px", border: "4px solid #282828", borderTopColor: "transparent",
          animation: "spin 0.8s linear infinite",
        }} />
        <div style={{ fontWeight: 700, fontSize: "1rem", textTransform: "uppercase", fontFamily: "monospace" }}>
          Loading whiteboard...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const strokeCount = pathsRef.current.length + dotsRef.current.length;

  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <h1 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "0.05em", textTransform: "uppercase", margin: 0 }}>
          WHITEBOARD
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {saving && (
            <span style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#999", textTransform: "uppercase" }}>
              saving...
            </span>
          )}
          <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#666", textTransform: "uppercase" }}>
            {stickies.length} note{stickies.length !== 1 ? "s" : ""} / {strokeCount} stroke{strokeCount !== 1 ? "s" : ""}
          </span>
          {/* Tools */}
          <div style={{ display: "flex", gap: "4px" }}>
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                title={tool.title}
                onClick={() => setActiveTool(tool.id)}
                style={{
                  width: "40px", height: "40px", fontSize: "1.1rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "3px solid #282828", cursor: "pointer", fontWeight: 700,
                  backgroundColor: activeTool === tool.id ? "#282828" : "#FFFFFF",
                  color: activeTool === tool.id ? "#FFFFFF" : "#282828",
                  transition: "background-color 150ms, color 150ms",
                }}
              >
                {tool.icon}
              </button>
            ))}
          </div>
          {/* Sticky color picker */}
          {activeTool === "sticky" && (
            <div style={{ display: "flex", gap: "4px", borderLeft: "3px solid #282828", paddingLeft: "12px" }}>
              {STICKY_COLOR_KEYS.map((color) => (
                <button
                  key={color}
                  onClick={() => setNextStickyColor(color)}
                  style={{
                    width: "24px", height: "24px", backgroundColor: STICKY_PRESETS[color].bg,
                    border: nextStickyColor === color ? "3px solid #282828" : "2px solid #28282860",
                    cursor: "pointer", padding: 0,
                    transform: nextStickyColor === color ? "scale(1.2)" : "none",
                    transition: "transform 100ms",
                  }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={wrapRef}
        style={{
          position: "relative",
          border: "4px solid #282828",
          boxShadow: "4px 4px 0 #282828",
          backgroundColor: "#FFFFFF",
          minHeight: "max(500px, calc(100vh - 60px - 200px))",
          cursor: getCursor(activeTool),
          overflow: "hidden",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ display: "block", width: "100%", height: "100%", position: "absolute", inset: 0 }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={() => {
            if (activeTool === "draw") handleCanvasMouseUp({} as React.MouseEvent<HTMLCanvasElement>);
          }}
        />

        {/* Sticky notes */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {stickies.map((sticky, index) => {
            const isDragging = draggingId === sticky.id;
            const isHover = hoverStickyId === sticky.id;
            const textColor = contrastText(sticky.bgColor);

            return (
              <div
                key={sticky.id}
                onMouseDown={(e) => handleStickyMouseDown(e, sticky.id)}
                onMouseEnter={() => setHoverStickyId(sticky.id)}
                onMouseLeave={() => setHoverStickyId(null)}
                style={{
                  position: "absolute",
                  left: `${sticky.x}px`,
                  top: `${sticky.y}px`,
                  width: "170px",
                  padding: "14px",
                  border: `3px solid ${sticky.borderColor}`,
                  backgroundColor: sticky.bgColor,
                  color: textColor,
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  pointerEvents: "auto",
                  userSelect: "none",
                  transform: isDragging ? "rotate(0deg) scale(1.05)" : getStickyRotation(index),
                  boxShadow: isDragging ? "6px 6px 0px #282828" : "3px 3px 0px #282828",
                  zIndex: isDragging ? 20 : "auto",
                  cursor: isDragging ? "grabbing" : "grab",
                  transition: isDragging ? "none" : "transform 150ms, box-shadow 150ms",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: sticky.description ? "4px" : 0 }}>
                  {sticky.title}
                </div>
                {sticky.description && (
                  <div style={{ fontSize: "0.75rem", opacity: 0.8, marginBottom: "4px", wordBreak: "break-word" }}>
                    {sticky.description.length > 60 ? sticky.description.slice(0, 60) + "..." : sticky.description}
                  </div>
                )}
                {sticky.tags.length > 0 && (
                  <div style={{ display: "flex", gap: "3px", flexWrap: "wrap", marginTop: "4px" }}>
                    {sticky.tags.map((tag) => (
                      <span key={tag} style={{
                        fontSize: "0.6rem", padding: "1px 6px", border: `1px solid ${sticky.borderColor}`,
                        backgroundColor: "rgba(255,255,255,0.3)", textTransform: "uppercase",
                        fontFamily: "monospace",
                      }}>{tag}</span>
                    ))}
                  </div>
                )}

                {/* Hover actions */}
                {isHover && !isDragging && (
                  <div style={{
                    position: "absolute", top: "-12px", right: "-12px",
                    display: "flex", gap: "4px",
                  }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); openStickySettings(sticky); }}
                      onMouseDown={(e) => e.stopPropagation()}
                      style={{
                        width: "22px", height: "22px", backgroundColor: "#FFF", color: "#282828",
                        border: "2px solid #282828", cursor: "pointer", fontSize: "0.7rem",
                        display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
                      }}
                      title="Settings"
                    >&#9881;</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteSticky(sticky.id); }}
                      onMouseDown={(e) => e.stopPropagation()}
                      style={{
                        width: "22px", height: "22px", backgroundColor: "#FF5E54", color: "#FFF",
                        border: "2px solid #282828", cursor: "pointer", fontSize: "0.7rem", fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
                      }}
                      title="Delete"
                    >&#10005;</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {stickies.length === 0 && strokeCount === 0 && (
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "none",
          }}>
            <div style={{
              fontFamily: "monospace", fontSize: "0.9rem", color: "#999",
              textTransform: "uppercase", textAlign: "center",
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "8px" }}>[ ]</div>
              Select a tool to start: Draw, Line, Dot, or Sticky
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky Settings Popup ── */}
      {settingsSticky && (
        <div onClick={() => setSettingsSticky(null)} style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            backgroundColor: ssBgColor,
            border: `4px solid ${ssBorderColor}`,
            boxShadow: "8px 8px 0px #282828",
            padding: "32px", width: "100%", maxWidth: "440px",
            maxHeight: "90vh", overflowY: "auto", boxSizing: "border-box",
            color: contrastText(ssBgColor),
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontWeight: 800, fontSize: "1.2rem", textTransform: "uppercase", margin: 0 }}>
                STICKY SETTINGS
              </h2>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setSettingsSticky(null)} style={{
                  padding: "8px 16px", backgroundColor: "rgba(255,255,255,0.3)",
                  border: `3px solid ${ssBorderColor}`, fontWeight: 700, fontSize: "0.8rem",
                  textTransform: "uppercase", cursor: "pointer", color: "inherit",
                }}>CANCEL</button>
                <button onClick={saveStickySettings} style={{
                  padding: "8px 16px", backgroundColor: ssBorderColor,
                  color: contrastText(ssBorderColor),
                  border: `3px solid ${ssBorderColor}`, fontWeight: 700, fontSize: "0.8rem",
                  textTransform: "uppercase", cursor: "pointer",
                }}>SAVE</button>
              </div>
            </div>

            {/* Title */}
            <label style={popupLabelStyle(ssBorderColor)}>Title</label>
            <input type="text" value={ssTitle} onChange={(e) => setSsTitle(e.target.value)}
              style={popupInputStyle(ssBorderColor, ssBgColor)} />

            {/* Description */}
            <label style={popupLabelStyle(ssBorderColor)}>Description</label>
            <textarea value={ssDesc} onChange={(e) => setSsDesc(e.target.value)}
              placeholder="Add details..." rows={3}
              style={{ ...popupInputStyle(ssBorderColor, ssBgColor), resize: "vertical" as const, minHeight: "70px" }}
            />

            {/* Tags */}
            <label style={popupLabelStyle(ssBorderColor)}>Tags (comma-separated)</label>
            <input type="text" value={ssTags} onChange={(e) => setSsTags(e.target.value)}
              placeholder="idea, important, todo"
              style={popupInputStyle(ssBorderColor, ssBgColor)} />

            {/* Background Color */}
            <label style={popupLabelStyle(ssBorderColor)}>Background Color</label>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
              {BG_COLORS.map((color) => (
                <button key={color} onClick={() => setSsBgColor(color)} style={{
                  width: "28px", height: "28px", backgroundColor: color,
                  border: ssBgColor === color ? `3px solid ${ssBorderColor}` : "2px solid #28282860",
                  cursor: "pointer", padding: 0,
                }} />
              ))}
            </div>

            {/* Border Color */}
            <label style={popupLabelStyle(ssBorderColor)}>Border Color</label>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
              {BORDER_COLORS.map((color) => (
                <button key={color} onClick={() => setSsBorderColor(color)} style={{
                  width: "28px", height: "28px", backgroundColor: color,
                  border: ssBorderColor === color ? "3px solid #FF5E54" : "2px solid #28282860",
                  cursor: "pointer", padding: 0,
                }} />
              ))}
            </div>

            {/* Live Preview */}
            <label style={popupLabelStyle(ssBorderColor)}>Preview</label>
            <div style={{
              border: `3px solid ${ssBorderColor}`, padding: "12px", backgroundColor: ssBgColor,
              color: contrastText(ssBgColor), boxShadow: "3px 3px 0px #282828",
              transform: "rotate(-2deg)",
            }}>
              <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{ssTitle || "Note"}</div>
              {ssDesc && <div style={{ fontSize: "0.75rem", opacity: 0.8, marginTop: "4px" }}>{ssDesc.slice(0, 60)}</div>}
              {ssTags && (
                <div style={{ display: "flex", gap: "3px", flexWrap: "wrap", marginTop: "6px" }}>
                  {ssTags.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                    <span key={tag} style={{
                      fontSize: "0.6rem", padding: "1px 6px", border: `1px solid ${ssBorderColor}`,
                      backgroundColor: "rgba(255,255,255,0.3)", textTransform: "uppercase", fontFamily: "monospace",
                    }}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Popup styles (dynamic based on sticky colors) ── */
function popupLabelStyle(borderColor: string): React.CSSProperties {
  return {
    display: "block", fontWeight: 700, fontSize: "0.85rem",
    textTransform: "uppercase", marginBottom: "6px",
    borderBottom: `1px solid ${borderColor}40`, paddingBottom: "2px",
  };
}

function popupInputStyle(borderColor: string, bgColor: string): React.CSSProperties {
  return {
    width: "100%", padding: "10px 14px", border: `3px solid ${borderColor}`,
    fontFamily: "monospace", fontSize: "0.9rem",
    backgroundColor: `${bgColor}80`, color: "inherit",
    outline: "none", boxSizing: "border-box", marginBottom: "16px",
  };
}
