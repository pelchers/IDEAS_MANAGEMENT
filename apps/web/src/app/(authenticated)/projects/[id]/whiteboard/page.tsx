"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";

/* ── Types ── */
type Tool = "select" | "draw" | "rect" | "text" | "sticky" | "eraser";

interface StickyNote {
  id: string;
  text: string;
  color: "yellow" | "orange" | "green" | "pink";
  x: number;
  y: number;
}

interface DrawPath {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

/* ── Tool definitions ── */
const TOOLS: { id: Tool; icon: string; title: string }[] = [
  { id: "select", icon: "\u261A", title: "Select" },
  { id: "draw", icon: "\u270E", title: "Draw" },
  { id: "eraser", icon: "\u2421", title: "Eraser (clears all)" },
  { id: "sticky", icon: "\u25A0", title: "Add Sticky Note" },
];

const STICKY_COLORS: Record<StickyNote["color"], { bg: string; text: string }> = {
  yellow: { bg: "#FFE459", text: "#282828" },
  orange: { bg: "#FF5E54", text: "#FFFFFF" },
  green: { bg: "#2BBF5D", text: "#282828" },
  pink: { bg: "#7B61FF", text: "#FFFFFF" },
};

const STICKY_COLOR_KEYS: StickyNote["color"][] = ["yellow", "orange", "green", "pink"];

function getStickyRotation(index: number): string {
  if ((index + 1) % 3 === 0) return "rotate(-3deg)";
  if ((index + 1) % 2 === 0) return "rotate(1.5deg)";
  return "rotate(-2deg)";
}

function getCursor(tool: Tool): string {
  switch (tool) {
    case "select": return "default";
    case "draw": return "crosshair";
    case "eraser": return "crosshair";
    case "sticky": return "cell";
    default: return "default";
  }
}

function stickyId(): string {
  return `sticky-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

  // Drawing state refs
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const pathsRef = useRef<DrawPath[]>([]);
  const currentPath = useRef<{ x: number; y: number }[]>([]);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sticky dragging
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Sticky editing
  const [editingStickyId, setEditingStickyId] = useState<string | null>(null);
  const [editStickyText, setEditStickyText] = useState("");
  const [hoverStickyId, setHoverStickyId] = useState<string | null>(null);

  // New sticky color
  const [nextStickyColor, setNextStickyColor] = useState<StickyNote["color"]>("yellow");

  // Save to artifact API
  const saveWhiteboard = useCallback((savePaths: DrawPath[], saveStickies: StickyNote[]) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setSaving(true);
    saveTimeoutRef.current = setTimeout(() => {
      fetch(`/api/projects/${projectId}/artifacts/whiteboard/board.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: { paths: savePaths, stickies: saveStickies },
        }),
      })
        .then(() => setSaving(false))
        .catch(() => setSaving(false));
    }, 500);
  }, [projectId]);

  // Load whiteboard
  useEffect(() => {
    fetch(`/api/projects/${projectId}/artifacts/whiteboard/board.json`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.artifact?.content) {
          const content = data.artifact.content;
          if (Array.isArray(content.paths)) {
            // Normalize old format (flat {x,y}[] arrays) to new {points,color,width}
            pathsRef.current = content.paths.map((p: unknown) => {
              if (Array.isArray(p)) {
                return { points: p, color: "#282828", width: 3 };
              }
              const obj = p as Record<string, unknown>;
              return {
                points: Array.isArray(obj.points) ? obj.points : [],
                color: (obj.color as string) || "#282828",
                width: (obj.width as number) || 3,
              };
            });
          }
          if (Array.isArray(content.stickies)) {
            setStickies(content.stickies);
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
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }, []);

  /* ── Redraw everything ── */
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx);

    for (const path of pathsRef.current) {
      if (path.points.length < 2) continue;
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
    if (activeTool === "draw") {
      isDrawing.current = true;
      const pos = getCanvasPos(e);
      lastPos.current = pos;
      currentPath.current = [pos];
    } else if (activeTool === "sticky") {
      const pos = getCanvasPos(e);
      const newSticky: StickyNote = {
        id: stickyId(),
        text: "New note",
        color: nextStickyColor,
        x: pos.x - 80,
        y: pos.y - 40,
      };
      const updated = [...stickies, newSticky];
      setStickies(updated);
      saveWhiteboard(pathsRef.current, updated);
      setActiveTool("select");
      // Auto-edit
      setTimeout(() => {
        setEditingStickyId(newSticky.id);
        setEditStickyText(newSticky.text);
      }, 50);
    } else if (activeTool === "eraser") {
      pathsRef.current = [];
      redraw();
      saveWhiteboard([], stickies);
      setActiveTool("select");
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || activeTool !== "draw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || !lastPos.current) return;

    const pos = getCanvasPos(e);
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
  };

  const handleCanvasMouseUp = () => {
    if (isDrawing.current && currentPath.current.length > 0) {
      pathsRef.current.push({
        points: [...currentPath.current],
        color: "#282828",
        width: 3,
      });
      currentPath.current = [];
      saveWhiteboard(pathsRef.current, stickies);
    }
    isDrawing.current = false;
    lastPos.current = null;
  };

  /* ── Sticky note dragging ── */
  const handleStickyMouseDown = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    if (editingStickyId === id) return; // don't drag while editing
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
        saveWhiteboard(pathsRef.current, current);
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

  /* ── Sticky CRUD ── */
  const saveStickyEdit = (id: string) => {
    const text = editStickyText.trim() || "Empty note";
    const updated = stickies.map((s) => (s.id === id ? { ...s, text } : s));
    setStickies(updated);
    saveWhiteboard(pathsRef.current, updated);
    setEditingStickyId(null);
    setEditStickyText("");
  };

  const deleteSticky = (id: string) => {
    const updated = stickies.filter((s) => s.id !== id);
    setStickies(updated);
    saveWhiteboard(pathsRef.current, updated);
  };

  const changeStickyColor = (id: string, color: StickyNote["color"]) => {
    const updated = stickies.map((s) => (s.id === id ? { ...s, color } : s));
    setStickies(updated);
    saveWhiteboard(pathsRef.current, updated);
  };

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

  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      {/* View header */}
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
            {stickies.length} note{stickies.length !== 1 ? "s" : ""} / {pathsRef.current.length} stroke{pathsRef.current.length !== 1 ? "s" : ""}
          </span>
          {/* Tool buttons */}
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
          {/* Sticky color picker (when sticky tool active) */}
          {activeTool === "sticky" && (
            <div style={{ display: "flex", gap: "4px", borderLeft: "3px solid #282828", paddingLeft: "12px" }}>
              {STICKY_COLOR_KEYS.map((color) => (
                <button
                  key={color}
                  onClick={() => setNextStickyColor(color)}
                  style={{
                    width: "24px", height: "24px", backgroundColor: STICKY_COLORS[color].bg,
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

      {/* Canvas wrap */}
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
          onMouseLeave={handleCanvasMouseUp}
        />

        {/* Sticky notes overlay */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {stickies.map((sticky, index) => {
            const colors = STICKY_COLORS[sticky.color];
            const isDragging = draggingId === sticky.id;
            const isHover = hoverStickyId === sticky.id;
            const isEditing = editingStickyId === sticky.id;

            return (
              <div
                key={sticky.id}
                onMouseDown={(e) => handleStickyMouseDown(e, sticky.id)}
                onMouseEnter={() => setHoverStickyId(sticky.id)}
                onMouseLeave={() => setHoverStickyId(null)}
                onDoubleClick={() => {
                  setEditingStickyId(sticky.id);
                  setEditStickyText(sticky.text);
                }}
                style={{
                  position: "absolute",
                  left: `${sticky.x}px`,
                  top: `${sticky.y}px`,
                  width: "160px",
                  padding: "16px",
                  border: "3px solid #282828",
                  backgroundColor: colors.bg,
                  color: colors.text,
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  pointerEvents: "auto",
                  userSelect: "none",
                  transform: isDragging ? "rotate(0deg) scale(1.05)" : getStickyRotation(index),
                  boxShadow: isDragging ? "6px 6px 0px #282828" : "3px 3px 0px #282828",
                  zIndex: isDragging ? 20 : "auto",
                  cursor: isEditing ? "text" : isDragging ? "grabbing" : "grab",
                  transition: isDragging ? "none" : "transform 150ms, box-shadow 150ms",
                }}
              >
                {isEditing ? (
                  <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                    <textarea
                      autoFocus
                      value={editStickyText}
                      onChange={(e) => setEditStickyText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveStickyEdit(sticky.id); } if (e.key === "Escape") { setEditingStickyId(null); } }}
                      onBlur={() => saveStickyEdit(sticky.id)}
                      style={{
                        width: "100%", minHeight: "60px", padding: "4px",
                        border: "2px solid currentColor", background: "rgba(255,255,255,0.3)",
                        color: "inherit", fontWeight: 600, fontSize: "0.85rem",
                        fontFamily: "inherit", resize: "none", outline: "none",
                      }}
                    />
                  </div>
                ) : (
                  <p style={{ margin: 0, wordBreak: "break-word" }}>{sticky.text}</p>
                )}

                {/* Action buttons on hover */}
                {isHover && !isEditing && (
                  <div style={{
                    position: "absolute", top: "-12px", right: "-12px",
                    display: "flex", gap: "4px",
                  }}>
                    {/* Color cycle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const curIdx = STICKY_COLOR_KEYS.indexOf(sticky.color);
                        const nextColor = STICKY_COLOR_KEYS[(curIdx + 1) % STICKY_COLOR_KEYS.length];
                        changeStickyColor(sticky.id, nextColor);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      style={{
                        width: "22px", height: "22px", backgroundColor: "#FFF", color: "#282828",
                        border: "2px solid #282828", cursor: "pointer", fontSize: "0.7rem",
                        display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
                      }}
                      title="Change color"
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
        {stickies.length === 0 && pathsRef.current.length === 0 && (
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "none",
          }}>
            <div style={{
              fontFamily: "monospace", fontSize: "0.9rem", color: "#999",
              textTransform: "uppercase", textAlign: "center",
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "8px" }}>[ ]</div>
              Select DRAW to sketch or STICKY to add notes
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
