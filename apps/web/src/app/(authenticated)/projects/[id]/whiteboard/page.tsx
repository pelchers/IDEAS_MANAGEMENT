"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useAnyArtifactRefresh } from "@/hooks/use-artifact-refresh";
import { useParams } from "next/navigation";

/* ── Types ── */
type Tool = "select" | "draw" | "line" | "eraser" | "dot" | "sticky" | "media";

interface DrawPath {
  id: string;
  type: "freehand" | "line";
  points: { x: number; y: number }[];
  color: string;
  width: number;
  offsetX: number;
  offsetY: number;
}

interface Dot {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  offsetX: number;
  offsetY: number;
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
  width: number;
  height: number;
  rotation?: number;
}

type MediaType = "image" | "video" | "document";

interface MediaItem {
  id: string;
  type: MediaType;
  dataUrl: string;
  fileName: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

const MEDIA_EXTENSIONS: Record<string, MediaType> = {
  png: "image", jpg: "image", jpeg: "image", gif: "image", webp: "image", svg: "image", bmp: "image",
  mp4: "video", webm: "video", ogg: "video", mov: "video",
  pdf: "document", doc: "document", docx: "document", xls: "document", xlsx: "document",
  ppt: "document", pptx: "document", txt: "document", csv: "document", zip: "document", md: "document",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB warning threshold

/* ── Constants ── */
const TOOLS: { id: Tool; icon: string; title: string }[] = [
  { id: "select", icon: "\u261A", title: "Select" },
  { id: "draw", icon: "\u270E", title: "Freehand Draw" },
  { id: "line", icon: "\u2571", title: "Straight Line" },
  { id: "dot", icon: "\u25CF", title: "Place Dot / Pin" },
  { id: "eraser", icon: "\u232B", title: "Eraser (click a stroke to remove it)" },
  { id: "sticky", icon: "\u25A0", title: "Add Sticky Note" },
  { id: "media", icon: "\uD83D\uDCCE", title: "Attach Media (image, video, document)" },
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
    case "media": return "copy";
    default: return "default";
  }
}

function getMediaType(fileName: string): MediaType {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  return MEDIA_EXTENSIONS[ext] || "document";
}

function getDocIcon(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf") return "\uD83D\uDCC4";
  if (["doc", "docx", "txt"].includes(ext)) return "\uD83D\uDDD2";
  if (ext === "md") return "\uD83D\uDCDD";
  if (["xls", "xlsx", "csv"].includes(ext)) return "\uD83D\uDCCA";
  if (["ppt", "pptx"].includes(ext)) return "\uD83D\uDCCA";
  if (ext === "zip") return "\uD83D\uDCE6";
  return "\uD83D\uDCC1";
}

function renderMarkdownToHtml(md: string): string {
  let html = md
    // Escape HTML entities
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    // Headings (### before ## before #)
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Bold and italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Inline code
    .replace(/`([^`]+)`/g, '<code style="background:#e8e0d5;padding:2px 5px;font-size:0.85em;border:1px solid #ccc">$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:#0066cc;text-decoration:underline">$1</a>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr style="border:none;border-top:2px solid #282828;margin:16px 0">')
    // Unordered list items
    .replace(/^[*-] (.+)$/gm, '<li style="margin-left:20px;list-style:disc">$1</li>')
    // Ordered list items
    .replace(/^\d+\. (.+)$/gm, '<li style="margin-left:20px;list-style:decimal">$1</li>')
    // Line breaks → paragraphs (double newline)
    .replace(/\n\n/g, "</p><p>")
    // Single newlines → <br>
    .replace(/\n/g, "<br>");
  return `<div style="font-family:'IBM Plex Mono',monospace;font-size:0.85rem;line-height:1.7;color:#282828"><p>${html}</p></div>`;
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
  const ox = path.offsetX || 0;
  const oy = path.offsetY || 0;
  for (let i = 0; i < pts.length - 1; i++) {
    if (distToSegment(px, py, pts[i].x + ox, pts[i].y + oy, pts[i + 1].x + ox, pts[i + 1].y + oy) < threshold) {
      return true;
    }
  }
  return false;
}

function isNearDot(px: number, py: number, dot: Dot, threshold = 12): boolean {
  return Math.hypot(px - (dot.x + (dot.offsetX || 0)), py - (dot.y + (dot.offsetY || 0))) < threshold;
}

function getPathBoundingBox(path: DrawPath): { x: number; y: number; width: number; height: number } {
  const ox = path.offsetX || 0;
  const oy = path.offsetY || 0;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const pt of path.points) {
    const px = pt.x + ox;
    const py = pt.y + oy;
    if (px < minX) minX = px;
    if (py < minY) minY = py;
    if (px > maxX) maxX = px;
    if (py > maxY) maxY = py;
  }
  const pad = (path.width || 3) / 2 + 4;
  return { x: minX - pad, y: minY - pad, width: maxX - minX + pad * 2, height: maxY - minY + pad * 2 };
}

function getDotBoundingBox(dot: Dot): { x: number; y: number; width: number; height: number } {
  const ox = dot.offsetX || 0;
  const oy = dot.offsetY || 0;
  const r = (dot.size || 6) + 6;
  return { x: dot.x + ox - r, y: dot.y + oy - r, width: r * 2, height: r * 2 };
}

/* ── Component ── */
export default function WhiteboardPage() {
  const params = useParams();
  const projectId = String(params.id);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [stickies, setStickies] = useState<StickyNote[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
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

  // Media dragging
  const [draggingMediaId, setDraggingMediaId] = useState<string | null>(null);
  const mediaDragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Resize state (works for stickies and media)
  const [resizing, setResizing] = useState<{ id: string; kind: "sticky" | "media"; startX: number; startY: number; startW: number; startH: number } | null>(null);

  // Media viewer modal
  const [viewerMedia, setViewerMedia] = useState<MediaItem | null>(null);

  // File size warning
  const [fileSizeWarning, setFileSizeWarning] = useState<string | null>(null);

  // Sticky settings popup
  const [settingsSticky, setSettingsSticky] = useState<StickyNote | null>(null);
  const [ssTitle, setSsTitle] = useState("");
  const [ssDesc, setSsDesc] = useState("");
  const [ssTags, setSsTags] = useState("");
  const [ssBgColor, setSsBgColor] = useState("#FFE459");
  const [ssBorderColor, setSsBorderColor] = useState("#282828");

  const [hoverStickyId, setHoverStickyId] = useState<string | null>(null);
  const [hoverMediaId, setHoverMediaId] = useState<string | null>(null);
  const [nextStickyColor, setNextStickyColor] = useState<StickyColor>("yellow");

  // Selected drawn element state (for select tool)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedElementType, setSelectedElementType] = useState<"path" | "dot" | null>(null);
  const [draggingElement, setDraggingElement] = useState(false);
  const elementDragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [resizingElement, setResizingElement] = useState<{ id: string; type: "path" | "dot"; startX: number; startY: number; startBBox: { x: number; y: number; width: number; height: number } } | null>(null);

  // Force re-render for dot/stroke counts
  const [, forceRender] = useState(0);
  const bump = () => forceRender((n) => n + 1);

  // Pending file add position (where user clicked canvas with media tool)
  const pendingMediaPos = useRef<{ x: number; y: number } | null>(null);

  /* ── Save ── */
  const saveWhiteboard = useCallback((savePaths: DrawPath[], saveDots: Dot[], saveStickies: StickyNote[], saveMedia?: MediaItem[]) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setSaving(true);
    saveTimeoutRef.current = setTimeout(() => {
      fetch(`/api/projects/${projectId}/artifacts/whiteboard/board.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: { paths: savePaths, dots: saveDots, stickies: saveStickies, media: saveMedia },
        }),
      })
        .then(() => setSaving(false))
        .catch(() => setSaving(false));
    }, 500);
  }, [projectId]);

  // Live reactivity: reload when AI modifies whiteboard via tool
  useAnyArtifactRefresh(useCallback(() => window.location.reload(), []));

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
                return { id: genId("path"), type: "freehand" as const, points: p, color: "#282828", width: 3, offsetX: 0, offsetY: 0 };
              }
              const obj = p as Record<string, unknown>;
              return {
                id: (obj.id as string) || genId("path"),
                type: (obj.type as "freehand" | "line") || "freehand",
                points: Array.isArray(obj.points) ? obj.points : [],
                color: (obj.color as string) || "#282828",
                width: (obj.width as number) || 3,
                offsetX: (obj.offsetX as number) || 0,
                offsetY: (obj.offsetY as number) || 0,
              };
            });
          }
          if (Array.isArray(content.dots)) {
            dotsRef.current = content.dots.map((d: Record<string, unknown>) => ({
              id: (d.id as string) || genId("dot"),
              x: (d.x as number) || 0,
              y: (d.y as number) || 0,
              color: (d.color as string) || "#282828",
              size: (d.size as number) || 6,
              offsetX: (d.offsetX as number) || 0,
              offsetY: (d.offsetY as number) || 0,
            }));
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
              width: (s.width as number) || 170,
              height: (s.height as number) || 0, // 0 = auto
            })));
          }
          if (Array.isArray(content.media)) {
            setMediaItems(content.media);
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
      const ox = path.offsetX || 0;
      const oy = path.offsetY || 0;
      ctx.strokeStyle = path.color || "#282828";
      ctx.lineWidth = path.width || 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(path.points[0].x + ox, path.points[0].y + oy);
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x + ox, path.points[i].y + oy);
      }
      ctx.stroke();
    }

    // Dots
    for (const dot of dotsRef.current) {
      const ox = dot.offsetX || 0;
      const oy = dot.offsetY || 0;
      ctx.fillStyle = dot.color || "#282828";
      ctx.beginPath();
      ctx.arc(dot.x + ox, dot.y + oy, dot.size || 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#282828";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw selection bounding box
    if (selectedElementId) {
      let bbox: { x: number; y: number; width: number; height: number } | null = null;
      if (selectedElementType === "path") {
        const path = pathsRef.current.find((p) => p.id === selectedElementId);
        if (path) bbox = getPathBoundingBox(path);
      } else if (selectedElementType === "dot") {
        const dot = dotsRef.current.find((d) => d.id === selectedElementId);
        if (dot) bbox = getDotBoundingBox(dot);
      }
      if (bbox) {
        ctx.save();
        ctx.strokeStyle = "#3498DB";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
        ctx.setLineDash([]);
        // Draw resize handle at bottom-right
        const hSize = 8;
        ctx.fillStyle = "#3498DB";
        ctx.fillRect(bbox.x + bbox.width - hSize / 2, bbox.y + bbox.height - hSize / 2, hSize, hSize);
        ctx.strokeStyle = "#282828";
        ctx.lineWidth = 1;
        ctx.strokeRect(bbox.x + bbox.width - hSize / 2, bbox.y + bbox.height - hSize / 2, hSize, hSize);
        ctx.restore();
      }
    }
  }, [drawGrid, selectedElementId, selectedElementType]);

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
      const dot: Dot = { id: genId("dot"), x: pos.x, y: pos.y, color: "#282828", size: 6, offsetX: 0, offsetY: 0 };
      dotsRef.current.push(dot);
      redraw();
      saveWhiteboard(pathsRef.current, dotsRef.current, stickies, mediaItems);
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
        saveWhiteboard(pathsRef.current, dotsRef.current, stickies, mediaItems);
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
        width: 170,
        height: 0,
      };
      const updated = [...stickies, newSticky];
      setStickies(updated);
      saveWhiteboard(pathsRef.current, dotsRef.current, updated, mediaItems);
      setActiveTool("select");
      // Open settings immediately
      setTimeout(() => openStickySettings(newSticky), 50);
    } else if (activeTool === "media") {
      pendingMediaPos.current = pos;
      fileInputRef.current?.click();
    } else if (activeTool === "select") {
      // Check if clicking on resize handle of selected element
      if (selectedElementId) {
        let bbox: { x: number; y: number; width: number; height: number } | null = null;
        if (selectedElementType === "path") {
          const path = pathsRef.current.find((p) => p.id === selectedElementId);
          if (path) bbox = getPathBoundingBox(path);
        } else if (selectedElementType === "dot") {
          const dot = dotsRef.current.find((d) => d.id === selectedElementId);
          if (dot) bbox = getDotBoundingBox(dot);
        }
        if (bbox) {
          const hx = bbox.x + bbox.width;
          const hy = bbox.y + bbox.height;
          if (Math.abs(pos.x - hx) < 10 && Math.abs(pos.y - hy) < 10) {
            setResizingElement({ id: selectedElementId, type: selectedElementType!, startX: pos.x, startY: pos.y, startBBox: bbox });
            return;
          }
        }
      }
      // Check if clicking near a dot
      const dotIdx = dotsRef.current.findIndex((d) => isNearDot(pos.x, pos.y, d));
      if (dotIdx !== -1) {
        const dot = dotsRef.current[dotIdx];
        setSelectedElementId(dot.id);
        setSelectedElementType("dot");
        setDraggingElement(true);
        elementDragStart.current = { x: pos.x, y: pos.y };
        redraw();
        bump();
        return;
      }
      // Check if clicking near a path
      const pathIdx = pathsRef.current.findIndex((p) => isNearPath(pos.x, pos.y, p));
      if (pathIdx !== -1) {
        const path = pathsRef.current[pathIdx];
        setSelectedElementId(path.id);
        setSelectedElementType("path");
        setDraggingElement(true);
        elementDragStart.current = { x: pos.x, y: pos.y };
        redraw();
        bump();
        return;
      }
      // Clicked empty space — deselect
      setSelectedElementId(null);
      setSelectedElementType(null);
      redraw();
      bump();
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
    } else if (activeTool === "select" && resizingElement) {
      // Scale the element uniformly based on drag delta
      const bbox = resizingElement.startBBox;
      const cx = bbox.x + bbox.width / 2;
      const cy = bbox.y + bbox.height / 2;
      const origDist = Math.max(bbox.width, bbox.height) / 2;
      const curDist = Math.hypot(pos.x - cx, pos.y - cy);
      const scale = origDist > 0 ? curDist / origDist : 1;

      if (resizingElement.type === "path") {
        const path = pathsRef.current.find((p) => p.id === resizingElement.id);
        if (path) {
          // Get the original center (without offset) for scaling
          let ominX = Infinity, ominY = Infinity, omaxX = -Infinity, omaxY = -Infinity;
          for (const pt of path.points) {
            if (pt.x < ominX) ominX = pt.x;
            if (pt.y < ominY) ominY = pt.y;
            if (pt.x > omaxX) omaxX = pt.x;
            if (pt.y > omaxY) omaxY = pt.y;
          }
          const ocx = (ominX + omaxX) / 2;
          const ocy = (ominY + omaxY) / 2;
          path.points = path.points.map((pt) => ({
            x: ocx + (pt.x - ocx) * scale,
            y: ocy + (pt.y - ocy) * scale,
          }));
          // Update startBBox for continuous scaling
          setResizingElement({ ...resizingElement, startBBox: getPathBoundingBox(path) });
        }
      } else if (resizingElement.type === "dot") {
        const dot = dotsRef.current.find((d) => d.id === resizingElement.id);
        if (dot) {
          dot.size = Math.max(2, (dot.size || 6) * scale);
          setResizingElement({ ...resizingElement, startBBox: getDotBoundingBox(dot) });
        }
      }
      redraw();
      bump();
    } else if (activeTool === "select" && draggingElement && selectedElementId) {
      const dx = pos.x - elementDragStart.current.x;
      const dy = pos.y - elementDragStart.current.y;
      elementDragStart.current = { x: pos.x, y: pos.y };

      if (selectedElementType === "path") {
        const path = pathsRef.current.find((p) => p.id === selectedElementId);
        if (path) {
          path.offsetX = (path.offsetX || 0) + dx;
          path.offsetY = (path.offsetY || 0) + dy;
        }
      } else if (selectedElementType === "dot") {
        const dot = dotsRef.current.find((d) => d.id === selectedElementId);
        if (dot) {
          dot.offsetX = (dot.offsetX || 0) + dx;
          dot.offsetY = (dot.offsetY || 0) + dy;
        }
      }
      redraw();
      bump();
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
        offsetX: 0,
        offsetY: 0,
      });
      currentPath.current = [];
      saveWhiteboard(pathsRef.current, dotsRef.current, stickies, mediaItems);
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
          offsetX: 0,
          offsetY: 0,
        });
        saveWhiteboard(pathsRef.current, dotsRef.current, stickies, mediaItems);
        bump();
      }
      lineStart.current = null;
      setLinePreview(null);
      redraw();
    }

    if (activeTool === "select" && draggingElement) {
      setDraggingElement(false);
      saveWhiteboard(pathsRef.current, dotsRef.current, stickies, mediaItems);
    }
    if (activeTool === "select" && resizingElement) {
      setResizingElement(null);
      saveWhiteboard(pathsRef.current, dotsRef.current, stickies, mediaItems);
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
        setMediaItems((curMedia) => {
          saveWhiteboard(pathsRef.current, dotsRef.current, current, curMedia);
          return curMedia;
        });
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
    saveWhiteboard(pathsRef.current, dotsRef.current, updated, mediaItems);
    setSettingsSticky(null);
  };

  const deleteSticky = (id: string) => {
    const updated = stickies.filter((s) => s.id !== id);
    setStickies(updated);
    saveWhiteboard(pathsRef.current, dotsRef.current, updated, mediaItems);
    if (settingsSticky?.id === id) setSettingsSticky(null);
  };

  /* ── File input handler ── */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setFileSizeWarning(`"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)}MB — files over 5MB may slow down saving.`);
      setTimeout(() => setFileSizeWarning(null), 5000);
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const pos = pendingMediaPos.current || { x: 100, y: 100 };
      const mediaType = getMediaType(file.name);

      const addMedia = (w: number, h: number) => {
        const newMedia: MediaItem = {
          id: genId("media"),
          type: mediaType,
          dataUrl,
          fileName: file.name,
          x: pos.x - w / 2,
          y: pos.y - h / 2,
          width: w,
          height: h,
        };
        const updated = [...mediaItems, newMedia];
        setMediaItems(updated);
        saveWhiteboard(pathsRef.current, dotsRef.current, stickies, updated);
        setActiveTool("select");
        pendingMediaPos.current = null;
      };

      if (mediaType === "image") {
        const img = new Image();
        img.onload = () => {
          const nw = img.naturalWidth;
          const nh = img.naturalHeight;
          const maxSide = 400;
          let w: number, h: number;
          if (nw >= nh) {
            w = Math.min(nw, maxSide);
            h = (nh / nw) * w;
          } else {
            h = Math.min(nh, maxSide);
            w = (nw / nh) * h;
          }
          addMedia(Math.round(w), Math.round(h));
        };
        img.onerror = () => {
          addMedia(300, 200);
        };
        img.src = dataUrl;
      } else if (mediaType === "video") {
        addMedia(300, 200);
      } else {
        addMedia(200, 80);
      }
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-added
    e.target.value = "";
  };

  /* ── Media dragging ── */
  const handleMediaMouseDown = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const media = mediaItems.find((m) => m.id === id);
    if (!media) return;
    const wrapRect = wrapRef.current?.getBoundingClientRect();
    if (!wrapRect) return;
    mediaDragOffset.current = {
      x: e.clientX - (wrapRect.left + media.x),
      y: e.clientY - (wrapRect.top + media.y),
    };
    setDraggingMediaId(id);
  };

  useEffect(() => {
    if (draggingMediaId === null) return;
    const handleMouseMove = (e: MouseEvent) => {
      const wrapRect = wrapRef.current?.getBoundingClientRect();
      if (!wrapRect) return;
      const newX = e.clientX - wrapRect.left - mediaDragOffset.current.x;
      const newY = e.clientY - wrapRect.top - mediaDragOffset.current.y;
      setMediaItems((prev) =>
        prev.map((m) => (m.id === draggingMediaId ? { ...m, x: newX, y: newY } : m))
      );
    };
    const handleMouseUp = () => {
      setDraggingMediaId(null);
      setMediaItems((cur) => {
        setStickies((curStickies) => {
          saveWhiteboard(pathsRef.current, dotsRef.current, curStickies, cur);
          return curStickies;
        });
        return cur;
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingMediaId, saveWhiteboard]);

  const deleteMedia = (id: string) => {
    const updated = mediaItems.filter((m) => m.id !== id);
    setMediaItems(updated);
    saveWhiteboard(pathsRef.current, dotsRef.current, stickies, updated);
  };

  /* ── Resize handling (stickies + media) ── */
  const handleResizeStart = (e: React.MouseEvent, id: string, kind: "sticky" | "media") => {
    e.preventDefault();
    e.stopPropagation();
    const item = kind === "sticky"
      ? stickies.find((s) => s.id === id)
      : mediaItems.find((m) => m.id === id);
    if (!item) return;
    setResizing({
      id,
      kind,
      startX: e.clientX,
      startY: e.clientY,
      startW: item.width,
      startH: kind === "sticky" ? ((item as StickyNote).height || 0) : (item as MediaItem).height,
    });
  };

  useEffect(() => {
    if (!resizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - resizing.startX;
      const dy = e.clientY - resizing.startY;
      const newW = Math.max(80, resizing.startW + dx);
      const newH = Math.max(40, resizing.startH + dy);

      if (resizing.kind === "sticky") {
        setStickies((prev) =>
          prev.map((s) => (s.id === resizing.id ? { ...s, width: newW, height: newH } : s))
        );
      } else {
        setMediaItems((prev) =>
          prev.map((m) => (m.id === resizing.id ? { ...m, width: newW, height: newH } : m))
        );
      }
    };
    const handleMouseUp = () => {
      setResizing(null);
      setStickies((curStickies) => {
        setMediaItems((curMedia) => {
          saveWhiteboard(pathsRef.current, dotsRef.current, curStickies, curMedia);
          return curMedia;
        });
        return curStickies;
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizing, mediaItems, saveWhiteboard]);

  /* ── Rotation handling (stickies + media) ── */
  const [rotating, setRotating] = useState<{ id: string; kind: "sticky" | "media"; centerX: number; centerY: number; startAngle: number; startRotation: number } | null>(null);

  const handleRotateStart = (e: React.MouseEvent, id: string, kind: "sticky" | "media") => {
    e.preventDefault();
    e.stopPropagation();
    const item = kind === "sticky" ? stickies.find((s) => s.id === id) : mediaItems.find((m) => m.id === id);
    if (!item) return;
    const wrapper = wrapRef.current;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    const centerX = item.x + item.width / 2;
    const centerY = item.y + (kind === "sticky" ? (item as StickyNote).height || item.width : (item as MediaItem).height) / 2;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const startAngle = Math.atan2(mouseY - centerY, mouseX - centerX) * (180 / Math.PI);
    setRotating({ id, kind, centerX, centerY, startAngle, startRotation: item.rotation || 0 });
  };

  useEffect(() => {
    if (!rotating) return;
    // Set rotation cursor on body during rotation so it doesn't disappear
    const rotateCursorSvg = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23282828" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/><polyline points="17 2 21 3.5 21 8"/></svg>');
    document.body.style.cursor = `url("data:image/svg+xml,${rotateCursorSvg}") 12 12, grabbing`;
    const handleMouseMove = (e: MouseEvent) => {
      const wrapper = wrapRef.current;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const currentAngle = Math.atan2(mouseY - rotating.centerY, mouseX - rotating.centerX) * (180 / Math.PI);
      const delta = currentAngle - rotating.startAngle;
      const newRotation = Math.round(rotating.startRotation + delta);

      if (rotating.kind === "sticky") {
        setStickies((prev) => prev.map((s) => (s.id === rotating.id ? { ...s, rotation: newRotation } : s)));
      } else {
        setMediaItems((prev) => prev.map((m) => (m.id === rotating.id ? { ...m, rotation: newRotation } : m)));
      }
    };
    const handleMouseUp = () => {
      document.body.style.cursor = "";
      setRotating(null);
      setStickies((curStickies) => {
        setMediaItems((curMedia) => {
          saveWhiteboard(pathsRef.current, dotsRef.current, curStickies, curMedia);
          return curMedia;
        });
        return curStickies;
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [rotating, saveWhiteboard]);

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
            {stickies.length} note{stickies.length !== 1 ? "s" : ""} / {strokeCount} stroke{strokeCount !== 1 ? "s" : ""}{mediaItems.length > 0 ? ` / ${mediaItems.length} media` : ""}
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

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.md"
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />

        {/* Sticky notes */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {stickies.map((sticky, index) => {
            const isDragging = draggingId === sticky.id;
            const isHover = hoverStickyId === sticky.id;
            const textColor = contrastText(sticky.bgColor);
            const stickyW = sticky.width || 170;
            const stickyH = sticky.height && sticky.height > 0 ? `${sticky.height}px` : "auto";

            return (
              <div
                key={sticky.id}
                onMouseEnter={() => setHoverStickyId(sticky.id)}
                onMouseLeave={() => setHoverStickyId(null)}
                style={{
                  position: "absolute",
                  left: `${sticky.x - 20}px`,
                  top: `${sticky.y - 20}px`,
                  width: `${stickyW + 40}px`,
                  height: stickyH === "auto" ? "auto" : `${(sticky.height || 0) + 40}px`,
                  padding: "20px",
                  pointerEvents: "auto",
                  zIndex: isDragging ? 20 : "auto",
                }}
              >
              <div
                onMouseDown={(e) => handleStickyMouseDown(e, sticky.id)}
                style={{
                  width: `${stickyW}px`,
                  height: stickyH,
                  padding: "14px",
                  border: `3px solid ${sticky.borderColor}`,
                  backgroundColor: sticky.bgColor,
                  color: textColor,
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  userSelect: "none",
                  transform: isDragging ? "rotate(0deg) scale(1.05)" : (sticky.rotation !== undefined ? `rotate(${sticky.rotation}deg)` : getStickyRotation(index)),
                  boxShadow: isDragging ? "6px 6px 0px #282828" : "3px 3px 0px #282828",
                  cursor: isDragging ? "grabbing" : "grab",
                  transition: isDragging ? "none" : "transform 150ms, box-shadow 150ms",
                  position: "relative",
                }}
              >
                {/* Content wrapper — hides overflow when sticky is resized small */}
                <div style={{ overflow: "hidden", width: "100%", height: sticky.height && sticky.height > 0 ? `${Math.max(0, sticky.height - 28)}px` : "auto" }}>
                  <div style={{
                    fontWeight: 700, fontSize: "0.9rem", marginBottom: sticky.description ? "4px" : 0,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {sticky.title}
                  </div>
                  {sticky.description && (!sticky.height || sticky.height >= 60) && (
                    <div style={{ fontSize: "0.75rem", opacity: 0.8, marginBottom: "4px", wordBreak: "break-word", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: sticky.height && sticky.height < 100 ? 1 : 3, WebkitBoxOrient: "vertical" as const }}>
                      {sticky.description.length > 60 ? sticky.description.slice(0, 60) + "..." : sticky.description}
                    </div>
                  )}
                  {sticky.tags.length > 0 && (!sticky.height || sticky.height >= 80) && (
                    <div style={{ display: "flex", gap: "3px", flexWrap: "wrap", marginTop: "4px", overflow: "hidden", maxHeight: sticky.height && sticky.height < 120 ? "18px" : "none" }}>
                      {sticky.tags.map((tag) => (
                        <span key={tag} style={{
                          fontSize: "0.6rem", padding: "1px 6px", border: `1px solid ${sticky.borderColor}`,
                          backgroundColor: "rgba(255,255,255,0.3)", textTransform: "uppercase",
                          fontFamily: "monospace",
                        }}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

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

                {/* Resize handle */}
                {isHover && !isDragging && (
                  <div
                    onMouseDown={(e) => handleResizeStart(e, sticky.id, "sticky")}
                    style={{
                      position: "absolute", bottom: "0", right: "0",
                      width: "16px", height: "16px", cursor: "nwse-resize",
                      background: "linear-gradient(135deg, transparent 50%, #282828 50%)",
                      opacity: 0.6,
                    }}
                  />
                )}
                {/* Rotate handle — just outside bottom-right corner */}
                {isHover && !isDragging && !resizing && (
                  <div
                    onMouseDown={(e) => handleRotateStart(e, sticky.id, "sticky")}
                    style={{
                      position: "absolute", bottom: "-20px", right: "-20px",
                      width: "18px", height: "18px",
                      cursor: `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%23282828" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/><polyline points="17 2 21 3.5 21 8"/></svg>')}") 10 10, grab`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                    title="Rotate"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#282828" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      <polyline points="17 2 21 3.5 21 8" />
                    </svg>
                  </div>
                )}
              </div>
              </div>
            );
          })}
        </div>

        {/* Media items */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {mediaItems.map((media) => {
            const isDragging = draggingMediaId === media.id;
            const isHover = hoverMediaId === media.id;

            return (
              <div
                key={media.id}
                onMouseEnter={() => setHoverMediaId(media.id)}
                onMouseLeave={() => setHoverMediaId(null)}
                style={{
                  position: "absolute",
                  left: `${media.x - 20}px`,
                  top: `${media.y - 20}px`,
                  width: `${media.width + 40}px`,
                  height: `${media.height + 40}px`,
                  padding: "20px",
                  pointerEvents: "auto",
                  zIndex: isDragging ? 20 : 5,
                }}
              >
              <div
                onMouseDown={(e) => handleMediaMouseDown(e, media.id)}
                style={{
                  width: `${media.width}px`,
                  height: `${media.height}px`,
                  userSelect: "none",
                  cursor: isDragging ? "grabbing" : "grab",
                  position: "relative",
                  ...(media.type === "document" ? {
                    border: isHover ? "2px dashed #28282860" : "2px solid transparent",
                    backgroundColor: "transparent",
                  } : {
                    border: isHover ? "3px solid #282828" : "2px solid #28282860",
                    boxShadow: isDragging ? "6px 6px 0px #282828" : isHover ? "3px 3px 0px #282828" : "none",
                    backgroundColor: "#fff",
                  }),
                  transform: media.rotation ? `rotate(${media.rotation}deg)` : undefined,
                  transition: isDragging ? "none" : "box-shadow 150ms, transform 150ms",
                }}
              >
                {/* Inner wrapper with overflow hidden for content only */}
                <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
                  {/* Image — double-click to view full size */}
                  {media.type === "image" && (
                    <img
                      src={media.dataUrl}
                      alt={media.fileName}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }}
                      draggable={false}
                      onDoubleClick={(e) => { e.stopPropagation(); setViewerMedia(media); }}
                    />
                  )}

                  {/* Video */}
                  {media.type === "video" && (
                    <video
                      src={media.dataUrl}
                      controls
                      style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                      onMouseDown={(e) => e.stopPropagation()}
                    />
                  )}

                  {/* Document — emoji IS the item, scales with container */}
                  {media.type === "document" && (
                    <div
                      onClick={(e) => { e.stopPropagation(); setViewerMedia(media); }}
                      onMouseDown={(e) => e.stopPropagation()}
                      style={{
                        width: "100%", height: "100%",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <span style={{
                        fontSize: `${Math.min(media.width, media.height) * 0.7}px`,
                        lineHeight: 1,
                        filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.15))",
                      }}>{getDocIcon(media.fileName)}</span>
                      <span style={{
                        fontSize: Math.max(9, Math.min(media.width * 0.08, 13)) + "px",
                        fontFamily: "monospace", fontWeight: 700,
                        textTransform: "uppercase", textAlign: "center",
                        overflow: "hidden", textOverflow: "ellipsis",
                        width: "100%", whiteSpace: "nowrap",
                        color: "#282828", marginTop: "2px",
                      }}>
                        {media.fileName}
                      </span>
                    </div>
                  )}
                </div>

                {/* Hover actions */}
                {isHover && !isDragging && (
                  <div style={{
                    position: "absolute", top: "-12px", right: "-12px",
                    display: "flex", gap: "4px",
                  }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setViewerMedia(media); }}
                      onMouseDown={(e) => e.stopPropagation()}
                      style={{
                        width: "22px", height: "22px", backgroundColor: "#FFF", color: "#282828",
                        border: "2px solid #282828", cursor: "pointer", fontSize: "0.65rem",
                        display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
                      }}
                      title={media.type === "document" ? "Preview" : "View full size"}
                    >&#128269;</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteMedia(media.id); }}
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

                {/* Resize handle */}
                {isHover && !isDragging && (
                  <div
                    onMouseDown={(e) => handleResizeStart(e, media.id, "media")}
                    style={{
                      position: "absolute", bottom: "0", right: "0",
                      width: "16px", height: "16px", cursor: "nwse-resize",
                      background: "linear-gradient(135deg, transparent 50%, #282828 50%)",
                      opacity: 0.6,
                    }}
                  />
                )}
                {/* Rotate handle — just outside bottom-right corner */}
                {isHover && !isDragging && !resizing && (
                  <div
                    onMouseDown={(e) => handleRotateStart(e, media.id, "media")}
                    style={{
                      position: "absolute", bottom: "-20px", right: "-20px",
                      width: "18px", height: "18px",
                      cursor: `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%23282828" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/><polyline points="17 2 21 3.5 21 8"/></svg>')}") 10 10, grab`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                    title="Rotate"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#282828" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      <polyline points="17 2 21 3.5 21 8" />
                    </svg>
                  </div>
                )}
              </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {stickies.length === 0 && strokeCount === 0 && mediaItems.length === 0 && (
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "none",
          }}>
            <div style={{
              fontFamily: "monospace", fontSize: "0.9rem", color: "#999",
              textTransform: "uppercase", textAlign: "center",
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "8px" }}>[ ]</div>
              Select a tool to start: Draw, Line, Dot, Sticky, or Media
            </div>
          </div>
        )}

        {/* File size warning */}
        {fileSizeWarning && (
          <div style={{
            position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)",
            backgroundColor: "#FFE459", border: "3px solid #282828", padding: "10px 20px",
            fontFamily: "monospace", fontSize: "0.8rem", fontWeight: 700,
            boxShadow: "3px 3px 0px #282828", zIndex: 30, maxWidth: "400px", textAlign: "center",
          }}>
            {fileSizeWarning}
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

      {/* ── Media Viewer Modal ── */}
      {viewerMedia && (
        <div onClick={() => setViewerMedia(null)} style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            backgroundColor: "#FFFFFF",
            border: "4px solid #282828",
            boxShadow: "8px 8px 0px #282828",
            padding: "24px", width: "90%", maxWidth: "800px",
            maxHeight: "90vh", display: "flex", flexDirection: "column",
            overflow: "hidden",
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h2 style={{ fontWeight: 800, fontSize: "1.1rem", textTransform: "uppercase", margin: 0, fontFamily: "monospace" }}>
                {viewerMedia.fileName}
              </h2>
              <button onClick={() => setViewerMedia(null)} style={{
                padding: "8px 16px", backgroundColor: "#282828", color: "#FFF",
                border: "3px solid #282828", fontWeight: 700, fontSize: "0.8rem",
                textTransform: "uppercase", cursor: "pointer",
              }}>CLOSE</button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {viewerMedia.type === "image" && (
                <img
                  src={viewerMedia.dataUrl}
                  alt={viewerMedia.fileName}
                  style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", border: "3px solid #282828" }}
                />
              )}
              {viewerMedia.type === "video" && (
                <video
                  src={viewerMedia.dataUrl}
                  controls
                  autoPlay
                  style={{ maxWidth: "100%", maxHeight: "70vh", border: "3px solid #282828" }}
                />
              )}
              {viewerMedia.type === "document" && (
                <div style={{ width: "100%", textAlign: "center" }}>
                  {viewerMedia.fileName.toLowerCase().endsWith(".pdf") ? (
                    <iframe
                      src={viewerMedia.dataUrl}
                      title={viewerMedia.fileName}
                      style={{ width: "100%", height: "65vh", border: "3px solid #282828" }}
                    />
                  ) : viewerMedia.fileName.toLowerCase().endsWith(".md") ? (
                    <div style={{
                      padding: "32px 40px", border: "3px solid #282828", background: "#FFFDF8",
                      textAlign: "left", maxHeight: "65vh", overflowY: "auto",
                    }}>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: renderMarkdownToHtml(
                            viewerMedia.dataUrl.startsWith("data:")
                              ? decodeURIComponent(escape(atob(viewerMedia.dataUrl.split(",")[1] || "")))
                              : ""
                          ),
                        }}
                      />
                      <div style={{ marginTop: "20px", borderTop: "2px solid #282828", paddingTop: "12px", textAlign: "center" }}>
                        <a
                          href={viewerMedia.dataUrl}
                          download={viewerMedia.fileName}
                          style={{
                            display: "inline-block",
                            padding: "10px 20px", backgroundColor: "#282828", color: "#FFF",
                            border: "3px solid #282828", fontWeight: 700, fontSize: "0.8rem",
                            textTransform: "uppercase", fontFamily: "monospace",
                            textDecoration: "none", cursor: "pointer",
                          }}
                        >
                          DOWNLOAD FILE
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      padding: "60px 40px", border: "3px solid #282828", background: "#F8F3EC",
                    }}>
                      <div style={{ fontSize: "3rem", marginBottom: "16px" }}>{getDocIcon(viewerMedia.fileName)}</div>
                      <div style={{ fontWeight: 800, fontSize: "1.1rem", textTransform: "uppercase", fontFamily: "monospace", marginBottom: "8px" }}>
                        {viewerMedia.fileName}
                      </div>
                      <a
                        href={viewerMedia.dataUrl}
                        download={viewerMedia.fileName}
                        style={{
                          display: "inline-block", marginTop: "12px",
                          padding: "10px 20px", backgroundColor: "#282828", color: "#FFF",
                          border: "3px solid #282828", fontWeight: 700, fontSize: "0.8rem",
                          textTransform: "uppercase", fontFamily: "monospace",
                          textDecoration: "none", cursor: "pointer",
                        }}
                      >
                        DOWNLOAD FILE
                      </a>
                    </div>
                  )}
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
