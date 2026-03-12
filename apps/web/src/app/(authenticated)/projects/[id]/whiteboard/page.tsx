"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";

/* ── Types ── */
type Tool = "select" | "draw" | "rect" | "text" | "sticky";

interface StickyNote {
  id: number;
  text: string;
  color: "yellow" | "orange" | "green" | "pink";
  x: number;
  y: number;
}

/* ── Tool definitions ── */
const TOOLS: { id: Tool; icon: string; title: string }[] = [
  { id: "select", icon: "☚", title: "Select" },
  { id: "draw", icon: "✎", title: "Draw" },
  { id: "rect", icon: "□", title: "Rectangle" },
  { id: "text", icon: "T", title: "Text" },
  { id: "sticky", icon: "■", title: "Sticky Note" },
];

/* ── Sticky note colors ── */
const STICKY_COLORS: Record<
  StickyNote["color"],
  { bg: string; text: string }
> = {
  yellow: { bg: "#FFE459", text: "#282828" },
  orange: { bg: "#FF5E54", text: "#FFFFFF" },
  green: { bg: "#2BBF5D", text: "#282828" },
  pink: { bg: "#7B61FF", text: "#FFFFFF" },
};

/* ── Initial stickies (matching pass-1) ── */
const INITIAL_STICKIES: StickyNote[] = [
  { id: 1, text: "User flow for onboarding", color: "yellow", x: 60, y: 40 },
  {
    id: 2,
    text: "API rate limiting strategy",
    color: "orange",
    x: 280,
    y: 120,
  },
  { id: 3, text: "Dashboard layout v2", color: "green", x: 520, y: 60 },
  { id: 4, text: "Auth flow design", color: "pink", x: 180, y: 280 },
];

/* ── Rotation helper (matching pass-1 nth-child rules) ── */
function getStickyRotation(index: number): string {
  // pass-1: default -2deg, 2n → 1.5deg, 3n → -3deg
  if ((index + 1) % 3 === 0) return "rotate(-3deg)";
  if ((index + 1) % 2 === 0) return "rotate(1.5deg)";
  return "rotate(-2deg)";
}

/* ── Cursor for each tool ── */
function getCursor(tool: Tool): string {
  switch (tool) {
    case "select":
      return "default";
    case "draw":
      return "crosshair";
    case "rect":
      return "crosshair";
    case "text":
      return "text";
    case "sticky":
      return "cell";
    default:
      return "default";
  }
}

/* ── Component ── */
export default function WhiteboardPage() {
  const params = useParams();
  const projectId = String(params.id);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [stickies, setStickies] =
    useState<StickyNote[]>(INITIAL_STICKIES);

  // Drawing state refs (avoid re-renders during drawing)
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  // Store all drawing paths so we can redraw on resize
  const paths = useRef<{ x: number; y: number }[][]>([]);
  const currentPath = useRef<{ x: number; y: number }[]>([]);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dragging state
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Debounced save to artifact API
  const saveWhiteboard = useCallback((savePaths: { x: number; y: number }[][], saveStickies: StickyNote[]) => {
    if (projectId.startsWith("mock-")) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      fetch(`/api/projects/${projectId}/artifacts/whiteboard/board.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: { paths: savePaths, stickies: saveStickies },
        }),
      }).catch(() => {});
    }, 500);
  }, [projectId]);

  // Load whiteboard from artifact API
  useEffect(() => {
    if (projectId.startsWith("mock-")) return;
    fetch(`/api/projects/${projectId}/artifacts/whiteboard/board.json`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.content) {
          if (Array.isArray(data.content.paths)) {
            paths.current = data.content.paths;
          }
          if (Array.isArray(data.content.stickies) && data.content.stickies.length > 0) {
            setStickies(data.content.stickies);
          }
        }
      })
      .catch(() => {});
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

  /* ── Redraw everything (grid + paths) ── */
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx);

    // Redraw all saved paths
    ctx.strokeStyle = "#282828";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const path of paths.current) {
      if (path.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
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
  }, [redraw]);

  /* ── Canvas mouse events ── */
  const getCanvasPos = (
    e: React.MouseEvent<HTMLCanvasElement>
  ): { x: number; y: number } => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== "draw") return;
    isDrawing.current = true;
    const pos = getCanvasPos(e);
    lastPos.current = pos;
    currentPath.current = [pos];
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
      paths.current.push([...currentPath.current]);
      currentPath.current = [];
      saveWhiteboard(paths.current, stickies);
    }
    isDrawing.current = false;
    lastPos.current = null;
  };

  /* ── Sticky note dragging ── */
  const handleStickyMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    id: number
  ) => {
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
      // Save after sticky note drag completes
      setStickies((current) => {
        saveWhiteboard(paths.current, current);
        return current;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingId]);

  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      {/* View header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="nb-view-title">WHITEBOARD</h1>
        <div className="flex gap-1">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              title={tool.title}
              onClick={() => setActiveTool(tool.id)}
              className={`w-11 h-11 text-xl flex items-center justify-center border-3 border-signal-black cursor-pointer font-bold transition-colors ${
                activeTool === tool.id
                  ? "bg-signal-black text-white"
                  : "bg-white text-signal-black hover:bg-creamy-milk"
              }`}
            >
              {tool.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas wrap */}
      <div
        ref={wrapRef}
        className="relative border-4 border-signal-black shadow-nb bg-white min-h-[max(500px,calc(100vh-60px-200px))] max-sm:min-h-[300px]"
        style={{ cursor: getCursor(activeTool) }}
      >
        <canvas
          ref={canvasRef}
          className="block w-full h-full absolute inset-0"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        />

        {/* Sticky notes overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {stickies.map((sticky, index) => {
            const colors = STICKY_COLORS[sticky.color];
            const isDragging = draggingId === sticky.id;
            return (
              <div
                key={sticky.id}
                onMouseDown={(e) => handleStickyMouseDown(e, sticky.id)}
                className="absolute w-40 p-4 border-3 border-signal-black text-[0.85rem] font-semibold pointer-events-auto select-none transition-[transform,box-shadow] duration-150"
                style={{
                  left: `${sticky.x}px`,
                  top: `${sticky.y}px`,
                  backgroundColor: colors.bg,
                  color: colors.text,
                  transform: isDragging
                    ? "rotate(0deg) scale(1.05)"
                    : getStickyRotation(index),
                  boxShadow: isDragging
                    ? "6px 6px 0px #282828"
                    : "3px 3px 0px #282828",
                  zIndex: isDragging ? 20 : "auto",
                  cursor: isDragging ? "grabbing" : "grab",
                }}
              >
                <p>{sticky.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
