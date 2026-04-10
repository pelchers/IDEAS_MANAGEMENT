"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useAnyArtifactRefresh } from "@/hooks/use-artifact-refresh";
import { useParams } from "next/navigation";

/* ── Types ── */
type Tool = "select" | "hand" | "draw" | "line" | "rect" | "circle" | "arrow" | "eraser" | "dot" | "sticky" | "media" | "text";

interface DrawPath {
  id: string;
  type: "freehand" | "line";
  points: { x: number; y: number }[];
  color: string;
  width: number;
  offsetX: number;
  offsetY: number;
  rotation?: number; // degrees, rotates around bbox center
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
const TOOLS: { id: Tool; icon: string; title: string; shortcut?: string }[] = [
  { id: "select", icon: "\u261A", title: "Select", shortcut: "V" },
  { id: "hand", icon: "\u270B", title: "Hand / Pan", shortcut: "H" },
  { id: "draw", icon: "\u270E", title: "Freehand Draw", shortcut: "P" },
  { id: "line", icon: "\u2571", title: "Straight Line", shortcut: "L" },
  { id: "rect", icon: "\u25AD", title: "Rectangle", shortcut: "R" },
  { id: "circle", icon: "\u25CB", title: "Circle / Ellipse", shortcut: "O" },
  { id: "arrow", icon: "\u2794", title: "Arrow", shortcut: "A" },
  { id: "dot", icon: "\u25CF", title: "Place Dot / Pin" },
  { id: "eraser", icon: "\u232B", title: "Eraser", shortcut: "E" },
  { id: "sticky", icon: "\u25A0", title: "Add Sticky Note", shortcut: "S" },
  { id: "text", icon: "T", title: "Add Text (no border)", shortcut: "T" },
  { id: "media", icon: "\uD83D\uDCCE", title: "Attach Media" },
];

const DRAW_COLORS = ["#282828", "#FF5E54", "#2BBF5D", "#A259FF", "#6C8EBF", "#FFE459", "#FF6D28", "#708090"];
const DRAW_WIDTHS = [1, 2, 3, 5, 8];

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
    case "hand": return "grab";
    case "draw": return "crosshair";
    case "line": return "crosshair";
    case "rect": return "crosshair";
    case "circle": return "crosshair";
    case "arrow": return "crosshair";
    case "text": return "text";
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
  const [rotatingElement, setRotatingElement] = useState<{ id: string; type: "path" | "dot"; centerX: number; centerY: number; startAngle: number; startRotation: number } | null>(null);

  // ── Marquee selection state (snapshot-based transform — Excalidraw/tldraw pattern) ──
  const [marquee, setMarquee] = useState<{ startX: number; startY: number; x: number; y: number; w: number; h: number } | null>(null);
  const [multiSel, setMultiSel] = useState<{ paths: Set<string>; dots: Set<string>; stickies: Set<string>; media: Set<string> }>({ paths: new Set(), dots: new Set(), stickies: new Set(), media: new Set() });

  const multiSelCount = multiSel.paths.size + multiSel.dots.size + multiSel.stickies.size + multiSel.media.size;
  const hasMultiSelection = multiSelCount > 1;
  const clearMultiSelection = useCallback(() => {
    setMultiSel({ paths: new Set(), dots: new Set(), stickies: new Set(), media: new Set() });
  }, []);

  // Transform mode + snapshot: captured at pointerdown, never mutated during drag
  // All transforms recompute final values from snapshot each mousemove (no delta accumulation)
  type TransformMode = "translate" | "resize" | "rotate";
  interface TransformSnapshot {
    mode: TransformMode;
    // Starting bbox of the entire multi-selection (world coords, unrotated)
    bbox: { x: number; y: number; w: number; h: number };
    // Starting pointer position (world coords)
    startPointer: { x: number; y: number };
    // For resize: which corner we dragged from → opposite = anchor
    anchor?: { x: number; y: number };
    // Deep snapshots of every selected item's state at pointerdown
    paths: Map<string, { offsetX: number; offsetY: number; rotation: number; points: { x: number; y: number }[] }>;
    dots: Map<string, { x: number; y: number; offsetX: number; offsetY: number }>;
    stickies: Map<string, { x: number; y: number; width: number; height: number; rotation: number }>;
    media: Map<string, { x: number; y: number; width: number; height: number; rotation: number }>;
  }
  const transformRef = useRef<TransformSnapshot | null>(null);
  const [, setTransformTick] = useState(0); // forces re-render during transform

  // Compute combined bbox of current multi-selection (uses CURRENT live state)
  const computeMultiBBox = useCallback((): { x: number; y: number; w: number; h: number } | null => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const id of multiSel.paths) {
      const p = pathsRef.current.find((pp) => pp.id === id);
      if (p) { const bb = getPathBoundingBox(p); minX = Math.min(minX, bb.x); minY = Math.min(minY, bb.y); maxX = Math.max(maxX, bb.x + bb.width); maxY = Math.max(maxY, bb.y + bb.height); }
    }
    for (const id of multiSel.dots) {
      const d = dotsRef.current.find((dd) => dd.id === id);
      if (d) { const bb = getDotBoundingBox(d); minX = Math.min(minX, bb.x); minY = Math.min(minY, bb.y); maxX = Math.max(maxX, bb.x + bb.width); maxY = Math.max(maxY, bb.y + bb.height); }
    }
    for (const id of multiSel.stickies) {
      const s = stickies.find((ss) => ss.id === id);
      if (s) { minX = Math.min(minX, s.x); minY = Math.min(minY, s.y); maxX = Math.max(maxX, s.x + (s.width || 170)); maxY = Math.max(maxY, s.y + (s.height || 100)); }
    }
    for (const id of multiSel.media) {
      const m = mediaItems.find((mm) => mm.id === id);
      if (m) { minX = Math.min(minX, m.x); minY = Math.min(minY, m.y); maxX = Math.max(maxX, m.x + m.width); maxY = Math.max(maxY, m.y + m.height); }
    }
    if (minX >= Infinity) return null;
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }, [multiSel, stickies, mediaItems]);

  // Snapshot current selection state at pointerdown
  const snapshotSelection = useCallback((mode: TransformMode, startPointer: { x: number; y: number }, anchor?: { x: number; y: number }): boolean => {
    const bbox = computeMultiBBox();
    if (!bbox) return false;
    const snap: TransformSnapshot = {
      mode, bbox, startPointer, anchor,
      paths: new Map(), dots: new Map(), stickies: new Map(), media: new Map(),
    };
    for (const id of multiSel.paths) {
      const p = pathsRef.current.find((pp) => pp.id === id);
      if (p) snap.paths.set(id, { offsetX: p.offsetX || 0, offsetY: p.offsetY || 0, rotation: p.rotation || 0, points: p.points.map((pt) => ({ ...pt })) });
    }
    for (const id of multiSel.dots) {
      const d = dotsRef.current.find((dd) => dd.id === id);
      if (d) snap.dots.set(id, { x: d.x, y: d.y, offsetX: d.offsetX || 0, offsetY: d.offsetY || 0 });
    }
    for (const id of multiSel.stickies) {
      const s = stickies.find((ss) => ss.id === id);
      if (s) snap.stickies.set(id, { x: s.x, y: s.y, width: s.width || 170, height: s.height || 100, rotation: s.rotation || 0 });
    }
    for (const id of multiSel.media) {
      const m = mediaItems.find((mm) => mm.id === id);
      if (m) snap.media.set(id, { x: m.x, y: m.y, width: m.width, height: m.height, rotation: m.rotation || 0 });
    }
    transformRef.current = snap;
    return true;
  }, [multiSel, stickies, mediaItems, computeMultiBBox]);

  // Refs that mirror zoom/pan state — needed for window-level listeners that
  // can't depend on state in their closure (would need re-binding every render)
  const zoomRef = useRef(1);
  const panXRef = useRef(0);
  const panYRef = useRef(0);

  // Apply the current transform from snapshot — recomputes ALL positions/sizes/rotations
  // from the snapshot + delta. Never mutates the snapshot itself.
  const applyTransformFromSnapshot = useCallback((pointer: { x: number; y: number }) => {
    const snap = transformRef.current;
    if (!snap) return;

    if (snap.mode === "translate") {
      const dx = pointer.x - snap.startPointer.x;
      const dy = pointer.y - snap.startPointer.y;
      for (const [id, orig] of snap.paths) {
        const p = pathsRef.current.find((pp) => pp.id === id);
        if (p) { p.offsetX = orig.offsetX + dx; p.offsetY = orig.offsetY + dy; }
      }
      for (const [id, orig] of snap.dots) {
        const d = dotsRef.current.find((dd) => dd.id === id);
        if (d) { d.offsetX = orig.offsetX + dx; d.offsetY = orig.offsetY + dy; }
      }
      if (snap.stickies.size > 0) {
        setStickies((prev) => prev.map((s) => {
          const orig = snap.stickies.get(s.id);
          return orig ? { ...s, x: orig.x + dx, y: orig.y + dy } : s;
        }));
      }
      if (snap.media.size > 0) {
        setMediaItems((prev) => prev.map((m) => {
          const orig = snap.media.get(m.id);
          return orig ? { ...m, x: orig.x + dx, y: orig.y + dy } : m;
        }));
      }
    } else if (snap.mode === "resize" && snap.anchor) {
      // Scale around the fixed anchor (opposite corner from dragged handle)
      const newW = Math.abs(pointer.x - snap.anchor.x);
      const newH = Math.abs(pointer.y - snap.anchor.y);
      const origW = Math.max(1, snap.bbox.w);
      const origH = Math.max(1, snap.bbox.h);
      // Uniform scale based on the larger dimension change (prevents drift)
      const sx = Math.max(0.1, newW / origW);
      const sy = Math.max(0.1, newH / origH);
      const scale = Math.min(sx, sy); // Keep aspect ratio to prevent drift
      const ax = snap.anchor.x;
      const ay = snap.anchor.y;
      // Paths: scale points relative to anchor (rebuild from original snapshot points)
      for (const [id, orig] of snap.paths) {
        const p = pathsRef.current.find((pp) => pp.id === id);
        if (p) {
          p.points = orig.points.map((pt) => ({ x: ax + (pt.x - ax) * scale, y: ay + (pt.y - ay) * scale }));
          p.offsetX = orig.offsetX;
          p.offsetY = orig.offsetY;
        }
      }
      // Dots: scale position relative to anchor (size stays)
      for (const [id, orig] of snap.dots) {
        const d = dotsRef.current.find((dd) => dd.id === id);
        if (d) {
          d.x = ax + (orig.x + orig.offsetX - ax) * scale;
          d.y = ay + (orig.y + orig.offsetY - ay) * scale;
          d.offsetX = 0;
          d.offsetY = 0;
        }
      }
      // Stickies: scale position AND dimensions relative to anchor
      setStickies((prev) => prev.map((s) => {
        const orig = snap.stickies.get(s.id);
        if (!orig) return s;
        return { ...s, x: ax + (orig.x - ax) * scale, y: ay + (orig.y - ay) * scale, width: Math.max(40, orig.width * scale), height: Math.max(20, orig.height * scale) };
      }));
      setMediaItems((prev) => prev.map((m) => {
        const orig = snap.media.get(m.id);
        if (!orig) return m;
        return { ...m, x: ax + (orig.x - ax) * scale, y: ay + (orig.y - ay) * scale, width: Math.max(20, orig.width * scale), height: Math.max(20, orig.height * scale) };
      }));
    } else if (snap.mode === "rotate") {
      // Rotation: rotate each item's center around group center, set angle absolutely from snapshot
      const cx = snap.bbox.x + snap.bbox.w / 2;
      const cy = snap.bbox.y + snap.bbox.h / 2;
      const startAngle = Math.atan2(snap.startPointer.y - cy, snap.startPointer.x - cx);
      const currAngle = Math.atan2(pointer.y - cy, pointer.x - cx);
      const deltaRad = currAngle - startAngle;
      const deltaDeg = deltaRad * 180 / Math.PI;
      const cos = Math.cos(deltaRad);
      const sin = Math.sin(deltaRad);
      const rotPt = (px: number, py: number) => ({ x: cx + (px - cx) * cos - (py - cy) * sin, y: cy + (px - cx) * sin + (py - cy) * cos });
      // Paths: rotate each point around group center
      for (const [id, orig] of snap.paths) {
        const p = pathsRef.current.find((pp) => pp.id === id);
        if (p) {
          p.points = orig.points.map((pt) => rotPt(pt.x + orig.offsetX, pt.y + orig.offsetY));
          p.offsetX = 0;
          p.offsetY = 0;
          p.rotation = orig.rotation + deltaDeg;
        }
      }
      for (const [id, orig] of snap.dots) {
        const d = dotsRef.current.find((dd) => dd.id === id);
        if (d) {
          const np = rotPt(orig.x + orig.offsetX, orig.y + orig.offsetY);
          d.x = np.x;
          d.y = np.y;
          d.offsetX = 0;
          d.offsetY = 0;
        }
      }
      setStickies((prev) => prev.map((s) => {
        const orig = snap.stickies.get(s.id);
        if (!orig) return s;
        const origCenterX = orig.x + orig.width / 2;
        const origCenterY = orig.y + orig.height / 2;
        const newCenter = rotPt(origCenterX, origCenterY);
        return { ...s, x: newCenter.x - orig.width / 2, y: newCenter.y - orig.height / 2, rotation: orig.rotation + deltaDeg };
      }));
      setMediaItems((prev) => prev.map((m) => {
        const orig = snap.media.get(m.id);
        if (!orig) return m;
        const origCenterX = orig.x + orig.width / 2;
        const origCenterY = orig.y + orig.height / 2;
        const newCenter = rotPt(origCenterX, origCenterY);
        return { ...m, x: newCenter.x - orig.width / 2, y: newCenter.y - orig.height / 2, rotation: orig.rotation + deltaDeg };
      }));
    }
    setTransformTick((t) => t + 1);
  }, []);

  // ── Render tick (forces re-render when refs change) ──
  const [, setRenderTick] = useState(0);

  // ── Zoom/Pan state ──
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; panX: number; panY: number }>({ x: 0, y: 0, panX: 0, panY: 0 });

  // Sync refs with state for use in window-level listeners
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { panXRef.current = panX; }, [panX]);
  useEffect(() => { panYRef.current = panY; }, [panY]);
  const stickiesRef = useRef<StickyNote[]>([]);
  const mediaItemsRef = useRef<MediaItem[]>([]);
  useEffect(() => { stickiesRef.current = stickies; }, [stickies]);
  useEffect(() => { mediaItemsRef.current = mediaItems; }, [mediaItems]);

  // Window-level handlers for snapshot transforms (works when mouse leaves canvas).
  // Mounted ONCE — uses refs internally to avoid stale closures.
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!transformRef.current) return;
      const wrap = wrapRef.current;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const worldX = (e.clientX - rect.left - panXRef.current) / zoomRef.current;
      const worldY = (e.clientY - rect.top - panYRef.current) / zoomRef.current;
      applyTransformFromSnapshot({ x: worldX, y: worldY });
      redraw();
    };
    const onUp = () => {
      if (!transformRef.current) return;
      transformRef.current = null;
      saveWhiteboard(pathsRef.current, dotsRef.current, stickiesRef.current, mediaItemsRef.current);
      bump();
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Drawing customization ──
  const [drawColor, setDrawColor] = useState("#282828");
  const [drawWidth, setDrawWidth] = useState(3);

  // ── Context menu ──
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; target: "canvas" | "sticky" | "media" | "element"; targetId?: string } | null>(null);

  // ── Undo/Redo ──
  const historyRef = useRef<Array<{ paths: DrawPath[]; dots: Dot[]; stickies: StickyNote[]; media: MediaItem[] }>>([]);
  const historyIdxRef = useRef(-1);

  const pushHistory = useCallback(() => {
    const snapshot = { paths: JSON.parse(JSON.stringify(pathsRef.current)), dots: JSON.parse(JSON.stringify(dotsRef.current)), stickies: JSON.parse(JSON.stringify(stickies)), media: JSON.parse(JSON.stringify(mediaItems)) };
    historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1);
    historyRef.current.push(snapshot);
    if (historyRef.current.length > 50) historyRef.current.shift();
    historyIdxRef.current = historyRef.current.length - 1;
  }, [stickies, mediaItems]);

  const undo = useCallback(() => {
    if (historyIdxRef.current <= 0) return;
    historyIdxRef.current--;
    const s = historyRef.current[historyIdxRef.current];
    pathsRef.current = JSON.parse(JSON.stringify(s.paths));
    dotsRef.current = JSON.parse(JSON.stringify(s.dots));
    setStickies(JSON.parse(JSON.stringify(s.stickies)));
    setMediaItems(JSON.parse(JSON.stringify(s.media)));
    setRenderTick((t) => t + 1);
  }, []);

  const redo = useCallback(() => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current++;
    const s = historyRef.current[historyIdxRef.current];
    pathsRef.current = JSON.parse(JSON.stringify(s.paths));
    dotsRef.current = JSON.parse(JSON.stringify(s.dots));
    setStickies(JSON.parse(JSON.stringify(s.stickies)));
    setMediaItems(JSON.parse(JSON.stringify(s.media)));
    setRenderTick((t) => t + 1);
  }, []);

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
      ctx.save();
      // Apply rotation around path center if set
      if (path.rotation) {
        const xs = path.points.map((p) => p.x + ox);
        const ys = path.points.map((p) => p.y + oy);
        const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
        const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
        ctx.translate(cx, cy);
        ctx.rotate((path.rotation * Math.PI) / 180);
        ctx.translate(-cx, -cy);
      }
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
      ctx.restore();
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
        // Draw rotation handle (purple circle) outside bottom-right
        const rotX = bbox.x + bbox.width + 18;
        const rotY = bbox.y + bbox.height + 18;
        ctx.fillStyle = "#A259FF";
        ctx.beginPath();
        ctx.arc(rotX, rotY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#282828";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }
    }

    // Marquee selection rectangle
    if (marquee && marquee.w > 0 && marquee.h > 0) {
      ctx.save();
      ctx.strokeStyle = "#A259FF";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 3]);
      ctx.fillStyle = "rgba(162, 89, 255, 0.08)";
      ctx.fillRect(marquee.x, marquee.y, marquee.w, marquee.h);
      ctx.strokeRect(marquee.x, marquee.y, marquee.w, marquee.h);
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Group selection bounding box (paths + dots only — stickies/media drawn as overlay divs)
    if (multiSel.paths.size + multiSel.dots.size > 0) {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const id of multiSel.paths) {
        const p = pathsRef.current.find((pp) => pp.id === id);
        if (p) {
          const bb = getPathBoundingBox(p);
          minX = Math.min(minX, bb.x); minY = Math.min(minY, bb.y);
          maxX = Math.max(maxX, bb.x + bb.width); maxY = Math.max(maxY, bb.y + bb.height);
        }
      }
      for (const id of multiSel.dots) {
        const d = dotsRef.current.find((dd) => dd.id === id);
        if (d) {
          const bb = getDotBoundingBox(d);
          minX = Math.min(minX, bb.x); minY = Math.min(minY, bb.y);
          maxX = Math.max(maxX, bb.x + bb.width); maxY = Math.max(maxY, bb.y + bb.height);
        }
      }
      if (minX < Infinity) {
        ctx.save();
        ctx.strokeStyle = "#A259FF";
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        const pad = 6;
        ctx.strokeRect(minX - pad, minY - pad, maxX - minX + pad * 2, maxY - minY + pad * 2);
        ctx.setLineDash([]);
        ctx.restore();
      }
    }
  }, [drawGrid, selectedElementId, selectedElementType, marquee, multiSel]);

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
    // Use the WRAPPER rect (untransformed) to convert screen → world coords
    const wrap = wrapRef.current;
    if (!wrap) return { x: 0, y: 0 };
    const rect = wrap.getBoundingClientRect();
    return { x: (e.clientX - rect.left - panX) / zoom, y: (e.clientY - rect.top - panY) / zoom };
  };

  // ── Zoom handler (native listener to prevent page scroll) ──
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      setZoom((prevZoom) => {
        const newZoom = Math.min(3, Math.max(0.25, prevZoom + delta));
        const scl = newZoom / prevZoom;
        setPanX((prevPanX) => mouseX - scl * (mouseX - prevPanX));
        setPanY((prevPanY) => mouseY - scl * (mouseY - prevPanY));
        return newZoom;
      });
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  // ── Pan handler ──
  useEffect(() => {
    if (!isPanning) return;
    const handleMove = (e: MouseEvent) => {
      setPanX(panStartRef.current.panX + (e.clientX - panStartRef.current.x));
      setPanY(panStartRef.current.panY + (e.clientY - panStartRef.current.y));
    };
    const handleUp = () => setIsPanning(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => { window.removeEventListener("mousemove", handleMove); window.removeEventListener("mouseup", handleUp); };
  }, [isPanning]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const shortcuts: Record<string, Tool> = { v: "select", h: "hand", p: "draw", l: "line", r: "rect", o: "circle", a: "arrow", t: "text", e: "eraser", s: "sticky" };
      if (shortcuts[e.key.toLowerCase()] && !e.ctrlKey && !e.metaKey) { setActiveTool(shortcuts[e.key.toLowerCase()]); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) { e.preventDefault(); redo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") { e.preventDefault(); redo(); }
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(3, z + 0.1));
      if (e.key === "-") setZoom((z) => Math.max(0.25, z - 0.1));
      if (e.key === "Escape") { setContextMenu(null); setSelectedElementId(null); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  // ── Context menu handler ──
  const handleContextMenu = useCallback((e: React.MouseEvent, target: "canvas" | "sticky" | "media" | "element", targetId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, target, targetId });
  }, []);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setContextMenu(null);
    // Hand tool: start panning
    if (activeTool === "hand" || e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY, panX, panY };
      return;
    }
    const pos = getCanvasPos(e);

    if (activeTool === "draw") {
      isDrawing.current = true;
      lastPos.current = pos;
      currentPath.current = [pos];
    } else if (activeTool === "line") {
      lineStart.current = pos;
      setLinePreview(pos);
    } else if (activeTool === "dot") {
      pushHistory();
      const dot: Dot = { id: genId("dot"), x: pos.x, y: pos.y, color: drawColor, size: Math.max(4, drawWidth * 2), offsetX: 0, offsetY: 0 };
      dotsRef.current.push(dot);
      redraw();
      saveWhiteboard(pathsRef.current, dotsRef.current, stickies, mediaItems);
      bump();
    } else if (activeTool === "eraser") {
      // Find nearest path or dot and remove it; start continuous erase mode
      isDrawing.current = true;
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
    } else if (activeTool === "rect") {
      // Start rectangle draw — store start point, will complete on mouseup
      lineStart.current = pos;
      setLinePreview(pos);
    } else if (activeTool === "circle") {
      lineStart.current = pos;
      setLinePreview(pos);
    } else if (activeTool === "arrow") {
      lineStart.current = pos;
      setLinePreview(pos);
    } else if (activeTool === "text") {
      // Create a text sticky with no background/border
      const newSticky: StickyNote = {
        id: genId("text"),
        title: "Text",
        description: "",
        tags: [],
        color: "yellow" as StickyColor,
        bgColor: "transparent",
        borderColor: "transparent",
        x: pos.x - 60,
        y: pos.y - 15,
        width: 200,
        height: 0,
      };
      const updated = [...stickies, newSticky];
      setStickies(updated);
      saveWhiteboard(pathsRef.current, dotsRef.current, updated, mediaItems);
      setActiveTool("select");
      setTimeout(() => openStickySettings(newSticky), 50);
    } else if (activeTool === "select") {
      // Check if clicking on resize/rotation handle of selected element
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
          // Rotation handle (purple circle, 18px outside bbox bottom-right)
          const rotX = bbox.x + bbox.width + 18;
          const rotY = bbox.y + bbox.height + 18;
          if (Math.hypot(pos.x - rotX, pos.y - rotY) < 12) {
            const cx = bbox.x + bbox.width / 2;
            const cy = bbox.y + bbox.height / 2;
            const startAngle = Math.atan2(pos.y - cy, pos.x - cx) * 180 / Math.PI;
            const path = selectedElementType === "path" ? pathsRef.current.find((p) => p.id === selectedElementId) : null;
            setRotatingElement({ id: selectedElementId, type: selectedElementType!, centerX: cx, centerY: cy, startAngle, startRotation: path?.rotation || 0 });
            return;
          }
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
        if (multiSel.dots.has(dot.id)) {
          snapshotSelection("translate", pos);
          return;
        }
        setSelectedElementId(dot.id);
        setSelectedElementType("dot");
        setDraggingElement(true);
        elementDragStart.current = { x: pos.x, y: pos.y };
        clearMultiSelection();
        redraw();
        bump();
        return;
      }
      // Check if clicking near a path
      const pathIdx = pathsRef.current.findIndex((p) => isNearPath(pos.x, pos.y, p));
      if (pathIdx !== -1) {
        const path = pathsRef.current[pathIdx];
        // If path is part of multi-selection, start group translate (snapshot-based)
        if (multiSel.paths.has(path.id)) {
          snapshotSelection("translate", pos);
          return;
        }
        setSelectedElementId(path.id);
        setSelectedElementType("path");
        setDraggingElement(true);
        elementDragStart.current = { x: pos.x, y: pos.y };
        clearMultiSelection();
        redraw();
        bump();
        return;
      }
      // Clicked empty space — start marquee selection
      setSelectedElementId(null);
      setSelectedElementType(null);
      clearMultiSelection();
      setMarquee({ startX: pos.x, startY: pos.y, x: pos.x, y: pos.y, w: 0, h: 0 });
      redraw();
      bump();
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasPos(e);

    // Snapshot-based group transform (translate / resize / rotate)
    if (transformRef.current) {
      applyTransformFromSnapshot(pos);
      redraw();
      return;
    }

    // Marquee drag (priority — happens regardless of tool sub-state)
    if (marquee) {
      setMarquee({
        startX: marquee.startX,
        startY: marquee.startY,
        x: Math.min(marquee.startX, pos.x),
        y: Math.min(marquee.startY, pos.y),
        w: Math.abs(pos.x - marquee.startX),
        h: Math.abs(pos.y - marquee.startY),
      });
      redraw();
      return;
    }

    // (Old delta-based group drag removed — now handled by snapshot transform above)

    // Continuous eraser: erase while dragging
    if (activeTool === "eraser" && isDrawing.current) {
      let erased = false;
      const dotIdx = dotsRef.current.findIndex((d) => isNearDot(pos.x, pos.y, d));
      if (dotIdx !== -1) { dotsRef.current.splice(dotIdx, 1); erased = true; }
      const pathIdx = pathsRef.current.findIndex((p) => isNearPath(pos.x, pos.y, p));
      if (pathIdx !== -1) { pathsRef.current.splice(pathIdx, 1); erased = true; }
      if (erased) { redraw(); bump(); }
      return;
    }

    if (activeTool === "draw" && isDrawing.current) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx || !lastPos.current) return;

      ctx.strokeStyle = drawColor;
      ctx.lineWidth = drawWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();

      lastPos.current = pos;
      currentPath.current.push(pos);
    } else if (activeTool === "select" && rotatingElement) {
      // Calculate angle from element center to current mouse position
      const currentAngle = Math.atan2(pos.y - rotatingElement.centerY, pos.x - rotatingElement.centerX) * 180 / Math.PI;
      const delta = currentAngle - rotatingElement.startAngle;
      const newRotation = Math.round(rotatingElement.startRotation + delta);
      if (rotatingElement.type === "path") {
        const path = pathsRef.current.find((p) => p.id === rotatingElement.id);
        if (path) path.rotation = newRotation;
      }
      redraw();
      bump();
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
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = drawWidth;
      ctx.lineCap = "round";
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(lineStart.current.x, lineStart.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.setLineDash([]);
      setLinePreview(pos);
    } else if (activeTool === "rect" && lineStart.current) {
      redraw();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = drawWidth;
      ctx.setLineDash([8, 4]);
      const x = Math.min(lineStart.current.x, pos.x);
      const y = Math.min(lineStart.current.y, pos.y);
      const w = Math.abs(pos.x - lineStart.current.x);
      const h = Math.abs(pos.y - lineStart.current.y);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);
      setLinePreview(pos);
    } else if (activeTool === "circle" && lineStart.current) {
      redraw();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = drawWidth;
      ctx.setLineDash([8, 4]);
      const cx = (lineStart.current.x + pos.x) / 2;
      const cy = (lineStart.current.y + pos.y) / 2;
      const rx = Math.abs(pos.x - lineStart.current.x) / 2;
      const ry = Math.abs(pos.y - lineStart.current.y) / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      setLinePreview(pos);
    } else if (activeTool === "arrow" && lineStart.current) {
      redraw();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = drawWidth;
      ctx.lineCap = "round";
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(lineStart.current.x, lineStart.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      // Arrowhead preview
      const angle = Math.atan2(pos.y - lineStart.current.y, pos.x - lineStart.current.x);
      const headLen = 12;
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(pos.x - headLen * Math.cos(angle - Math.PI / 6), pos.y - headLen * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(pos.x - headLen * Math.cos(angle + Math.PI / 6), pos.y - headLen * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
      ctx.setLineDash([]);
      setLinePreview(pos);
    }
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Snapshot transform completion (translate / resize / rotate)
    if (transformRef.current) {
      transformRef.current = null;
      saveWhiteboard(pathsRef.current, dotsRef.current, stickies, mediaItems);
      bump();
      return;
    }
    // Marquee selection completion
    if (marquee) {
      const m = marquee;
      // Only meaningful if there's a real area
      if (m.w > 4 && m.h > 4) {
        const newSel = { paths: new Set<string>(), dots: new Set<string>(), stickies: new Set<string>(), media: new Set<string>() };
        const rectIntersects = (bx: number, by: number, bw: number, bh: number) =>
          !(bx + bw < m.x || bx > m.x + m.w || by + bh < m.y || by > m.y + m.h);
        // Paths
        for (const p of pathsRef.current) {
          const bb = getPathBoundingBox(p);
          if (rectIntersects(bb.x, bb.y, bb.width, bb.height)) newSel.paths.add(p.id);
        }
        // Dots
        for (const d of dotsRef.current) {
          const ox = d.offsetX || 0; const oy = d.offsetY || 0;
          const r = d.size || 6;
          if (rectIntersects(d.x + ox - r, d.y + oy - r, r * 2, r * 2)) newSel.dots.add(d.id);
        }
        // Stickies
        for (const s of stickies) {
          if (rectIntersects(s.x, s.y, s.width || 170, s.height || 100)) newSel.stickies.add(s.id);
        }
        // Media
        for (const me of mediaItems) {
          if (rectIntersects(me.x, me.y, me.width, me.height)) newSel.media.add(me.id);
        }
        setMultiSel(newSel);
      }
      setMarquee(null);
      redraw();
      bump();
      return;
    }
    // (Old multi-drag mouseup removed — handled by transformRef block above)
    if (activeTool === "draw" && isDrawing.current && currentPath.current.length > 0) {
      pushHistory();
      pathsRef.current.push({
        id: genId("path"),
        type: "freehand",
        points: [...currentPath.current],
        color: drawColor,
        width: drawWidth,
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
        pushHistory();
        pathsRef.current.push({
          id: genId("line"),
          type: "line",
          points: [lineStart.current, pos],
          color: drawColor,
          width: drawWidth,
          offsetX: 0,
          offsetY: 0,
        });
        saveWhiteboard(pathsRef.current, dotsRef.current, stickies, mediaItems);
        bump();
      }
      lineStart.current = null;
      setLinePreview(null);
      redraw();
    } else if (activeTool === "rect" && lineStart.current) {
      const pos = getCanvasPos(e);
      const x = Math.min(lineStart.current.x, pos.x);
      const y = Math.min(lineStart.current.y, pos.y);
      const w = Math.abs(pos.x - lineStart.current.x);
      const h = Math.abs(pos.y - lineStart.current.y);
      if (w > 5 && h > 5) {
        pushHistory();
        pathsRef.current.push({
          id: genId("rect"),
          type: "freehand" as const, // stored as freehand with rectangular points
          points: [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }, { x, y }],
          color: drawColor, width: drawWidth, offsetX: 0, offsetY: 0,
        });
        saveWhiteboard(pathsRef.current, dotsRef.current, stickies, mediaItems);
        bump();
      }
      lineStart.current = null;
      setLinePreview(null);
      redraw();
    } else if (activeTool === "circle" && lineStart.current) {
      const pos = getCanvasPos(e);
      const cx = (lineStart.current.x + pos.x) / 2;
      const cy = (lineStart.current.y + pos.y) / 2;
      const rx = Math.abs(pos.x - lineStart.current.x) / 2;
      const ry = Math.abs(pos.y - lineStart.current.y) / 2;
      if (rx > 3 && ry > 3) {
        pushHistory();
        // Generate ellipse as point series
        const pts: { x: number; y: number }[] = [];
        for (let a = 0; a <= Math.PI * 2; a += 0.15) {
          pts.push({ x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) });
        }
        pts.push(pts[0]); // close the shape
        pathsRef.current.push({
          id: genId("circle"),
          type: "freehand" as const,
          points: pts, color: drawColor, width: drawWidth, offsetX: 0, offsetY: 0,
        });
        saveWhiteboard(pathsRef.current, dotsRef.current, stickies, mediaItems);
        bump();
      }
      lineStart.current = null;
      setLinePreview(null);
      redraw();
    } else if (activeTool === "arrow" && lineStart.current) {
      const pos = getCanvasPos(e);
      const dist = Math.hypot(pos.x - lineStart.current.x, pos.y - lineStart.current.y);
      if (dist > 5) {
        pushHistory();
        const angle = Math.atan2(pos.y - lineStart.current.y, pos.x - lineStart.current.x);
        const headLen = 12;
        // Arrow = main line + two head lines
        pathsRef.current.push({
          id: genId("arrow"),
          type: "line" as const,
          points: [lineStart.current, pos],
          color: drawColor, width: drawWidth, offsetX: 0, offsetY: 0,
        });
        pathsRef.current.push({
          id: genId("arrowhead"),
          type: "line" as const,
          points: [pos, { x: pos.x - headLen * Math.cos(angle - Math.PI / 6), y: pos.y - headLen * Math.sin(angle - Math.PI / 6) }],
          color: drawColor, width: drawWidth, offsetX: 0, offsetY: 0,
        });
        pathsRef.current.push({
          id: genId("arrowhead"),
          type: "line" as const,
          points: [pos, { x: pos.x - headLen * Math.cos(angle + Math.PI / 6), y: pos.y - headLen * Math.sin(angle + Math.PI / 6) }],
          color: drawColor, width: drawWidth, offsetX: 0, offsetY: 0,
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
    if (activeTool === "select" && rotatingElement) {
      setRotatingElement(null);
      saveWhiteboard(pathsRef.current, dotsRef.current, stickies, mediaItems);
    }

    if (activeTool === "eraser" && isDrawing.current) {
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

    // If this sticky is part of a multi-selection, start group translate instead of solo drag
    if (multiSel.stickies.has(id) && multiSelCount > 1) {
      const worldX = (e.clientX - wrapRect.left - panX) / zoom;
      const worldY = (e.clientY - wrapRect.top - panY) / zoom;
      snapshotSelection("translate", { x: worldX, y: worldY });
      return;
    }

    // Clear any existing multi-selection on solo sticky click
    if (multiSelCount > 0) clearMultiSelection();

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

    // If this media is part of a multi-selection, start group translate
    if (multiSel.media.has(id) && multiSelCount > 1) {
      const worldX = (e.clientX - wrapRect.left - panX) / zoom;
      const worldY = (e.clientY - wrapRect.top - panY) / zoom;
      snapshotSelection("translate", { x: worldX, y: worldY });
      return;
    }

    // Clear any existing multi-selection on solo media click
    if (multiSelCount > 0) clearMultiSelection();

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
    // Set crosshair cursor on body during rotation so it stays visible everywhere
    document.body.style.cursor = "crosshair";
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
          <div style={{ display: "flex", gap: "3px", flexWrap: "wrap" }}>
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                title={`${tool.title}${tool.shortcut ? ` (${tool.shortcut})` : ""}`}
                aria-label={tool.title}
                aria-pressed={activeTool === tool.id}
                onClick={() => setActiveTool(tool.id)}
                style={{
                  width: "36px", height: "36px", fontSize: "1rem",
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

          {/* Divider */}
          <div style={{ width: "1px", height: "32px", backgroundColor: "#28282830" }} />

          {/* Color picker (for draw/line/shape tools) */}
          {["draw", "line", "rect", "circle", "arrow", "dot"].includes(activeTool) && (
            <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
              {DRAW_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setDrawColor(c)}
                  style={{
                    width: "20px", height: "20px", backgroundColor: c,
                    border: drawColor === c ? "3px solid #282828" : "1px solid #28282860",
                    cursor: "pointer", borderRadius: "2px",
                    transform: drawColor === c ? "scale(1.2)" : "none",
                  }}
                  title={c}
                />
              ))}
              <div style={{ width: "1px", height: "20px", backgroundColor: "#28282830", margin: "0 4px" }} />
              {DRAW_WIDTHS.map((w) => (
                <button
                  key={w}
                  onClick={() => setDrawWidth(w)}
                  style={{
                    width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center",
                    border: drawWidth === w ? "2px solid #282828" : "1px solid #28282860",
                    cursor: "pointer", backgroundColor: drawWidth === w ? "#f0f0f0" : "#FFF",
                    fontSize: "0.6rem", fontFamily: "monospace", fontWeight: 700,
                  }}
                  title={`${w}px`}
                >{w}</button>
              ))}
            </div>
          )}

          {/* Sticky color picker */}
          {activeTool === "sticky" && (
            <div style={{ display: "flex", gap: "4px" }}>
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

          {/* Divider */}
          <div style={{ width: "1px", height: "32px", backgroundColor: "#28282830" }} />

          {/* Undo/Redo */}
          <button onClick={undo} disabled={historyIdxRef.current <= 0} style={{ fontSize: "0.7rem", fontFamily: "monospace", fontWeight: 700, border: "2px solid #282828", padding: "4px 8px", cursor: "pointer", backgroundColor: "#FFF", opacity: historyIdxRef.current <= 0 ? 0.3 : 1 }} title="Undo (Ctrl+Z)">UNDO</button>
          <button onClick={redo} disabled={historyIdxRef.current >= historyRef.current.length - 1} style={{ fontSize: "0.7rem", fontFamily: "monospace", fontWeight: 700, border: "2px solid #282828", padding: "4px 8px", cursor: "pointer", backgroundColor: "#FFF", opacity: historyIdxRef.current >= historyRef.current.length - 1 ? 0.3 : 1 }} title="Redo (Ctrl+Shift+Z)">REDO</button>
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
          cursor: activeTool === "hand" ? (isPanning ? "grabbing" : "grab") : getCursor(activeTool),
          overflow: "hidden",
        }}
        onContextMenu={(e) => handleContextMenu(e, "canvas")}
      >
        {/* Zoom controls (bottom-left) */}
        <div style={{ position: "absolute", bottom: "12px", left: "12px", zIndex: 40, display: "flex", gap: "4px" }}>
          <button onClick={() => setZoom((z) => Math.max(0.25, z - 0.15))} style={{ width: "28px", height: "28px", border: "2px solid #282828", backgroundColor: "#FFF", cursor: "pointer", fontWeight: 700, fontSize: "0.8rem" }}>-</button>
          <span style={{ padding: "4px 8px", border: "2px solid #282828", backgroundColor: "#FFF", fontFamily: "monospace", fontSize: "0.7rem", fontWeight: 700, display: "flex", alignItems: "center" }}>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(3, z + 0.15))} style={{ width: "28px", height: "28px", border: "2px solid #282828", backgroundColor: "#FFF", cursor: "pointer", fontWeight: 700, fontSize: "0.8rem" }}>+</button>
          <button onClick={() => { setZoom(1); setPanX(0); setPanY(0); }} style={{ padding: "4px 8px", border: "2px solid #282828", backgroundColor: "#FFF", cursor: "pointer", fontFamily: "monospace", fontSize: "0.65rem", fontWeight: 700 }}>FIT</button>
        </div>

        <canvas
          ref={canvasRef}
          style={{ display: "block", width: "100%", height: "100%", position: "absolute", inset: 0, transform: `translate(${panX}px, ${panY}px) scale(${zoom})`, transformOrigin: "0 0" }}
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

        {/* Sticky notes — transforms with canvas zoom/pan */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", transform: `translate(${panX}px, ${panY}px) scale(${zoom})`, transformOrigin: "0 0" }}>
          {stickies.map((sticky, index) => {
            const isDragging = draggingId === sticky.id;
            const isHover = hoverStickyId === sticky.id;
            const textColor = sticky.bgColor === "transparent" ? "#282828" : contrastText(sticky.bgColor);
            const stickyW = sticky.width || 170;
            const stickyH = sticky.height && sticky.height > 0 ? `${sticky.height}px` : "auto";

            return (
              <div
                key={sticky.id}
                onMouseEnter={() => setHoverStickyId(sticky.id)}
                onContextMenu={(e) => handleContextMenu(e, "sticky", sticky.id)}
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
                  padding: sticky.bgColor === "transparent" ? "4px" : "14px",
                  border: sticky.bgColor === "transparent" ? "none" : `3px solid ${sticky.borderColor}`,
                  backgroundColor: sticky.bgColor,
                  color: textColor,
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  userSelect: "none",
                  transform: isDragging ? "rotate(0deg) scale(1.05)" : (sticky.rotation !== undefined ? `rotate(${sticky.rotation}deg)` : (sticky.bgColor === "transparent" ? "none" : getStickyRotation(index))),
                  boxShadow: sticky.bgColor === "transparent" ? "none" : (isDragging ? "6px 6px 0px #282828" : "3px 3px 0px #282828"),
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
                      cursor: "grab",
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

        {/* Media items — transforms with canvas zoom/pan */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", transform: `translate(${panX}px, ${panY}px) scale(${zoom})`, transformOrigin: "0 0" }}>
          {mediaItems.map((media) => {
            const isDragging = draggingMediaId === media.id;
            const isHover = hoverMediaId === media.id;

            return (
              <div
                key={media.id}
                onMouseEnter={() => setHoverMediaId(media.id)}
                onContextMenu={(e) => handleContextMenu(e, "media", media.id)}
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

                  {/* Video — drag from anywhere, double-click to view */}
                  {media.type === "video" && (
                    <video
                      src={media.dataUrl}
                      style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", pointerEvents: "none" }}
                      onDoubleClick={(e) => { e.stopPropagation(); setViewerMedia(media); }}
                    />
                  )}

                  {/* Document — drag from anywhere, double-click to preview */}
                  {media.type === "document" && (
                    <div
                      onDoubleClick={(e) => { e.stopPropagation(); setViewerMedia(media); }}
                      style={{
                        width: "100%", height: "100%",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        pointerEvents: "none",
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
                      cursor: "grab",
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

      {/* ── Group Selection Overlay (resize + rotate handles) ── */}
      {hasMultiSelection && (() => {
        // Compute combined bbox of all selected items
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const id of multiSel.paths) {
          const p = pathsRef.current.find((pp) => pp.id === id);
          if (p) { const bb = getPathBoundingBox(p); minX = Math.min(minX, bb.x); minY = Math.min(minY, bb.y); maxX = Math.max(maxX, bb.x + bb.width); maxY = Math.max(maxY, bb.y + bb.height); }
        }
        for (const id of multiSel.dots) {
          const d = dotsRef.current.find((dd) => dd.id === id);
          if (d) { const bb = getDotBoundingBox(d); minX = Math.min(minX, bb.x); minY = Math.min(minY, bb.y); maxX = Math.max(maxX, bb.x + bb.width); maxY = Math.max(maxY, bb.y + bb.height); }
        }
        for (const id of multiSel.stickies) {
          const s = stickies.find((ss) => ss.id === id);
          if (s) { minX = Math.min(minX, s.x); minY = Math.min(minY, s.y); maxX = Math.max(maxX, s.x + (s.width || 170)); maxY = Math.max(maxY, s.y + (s.height || 100)); }
        }
        for (const id of multiSel.media) {
          const m = mediaItems.find((mm) => mm.id === id);
          if (m) { minX = Math.min(minX, m.x); minY = Math.min(minY, m.y); maxX = Math.max(maxX, m.x + m.width); maxY = Math.max(maxY, m.y + m.height); }
        }
        if (minX >= Infinity) return null;
        const pad = 10;
        const bx = minX - pad;
        const by = minY - pad;
        const bw = maxX - minX + pad * 2;
        const bh = maxY - minY + pad * 2;
        const cx = minX + (maxX - minX) / 2;
        const cy = minY + (maxY - minY) / 2;
        return (
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", transform: `translate(${panX}px, ${panY}px) scale(${zoom})`, transformOrigin: "0 0", zIndex: 60 }}>
            {/* Group bounding box */}
            <div style={{ position: "absolute", left: `${bx}px`, top: `${by}px`, width: `${bw}px`, height: `${bh}px`, border: "2px dashed #A259FF", backgroundColor: "transparent" }} />
            {/* Resize handle (bottom-right corner) */}
            <div
              style={{ position: "absolute", left: `${bx + bw - 5}px`, top: `${by + bh - 5}px`, width: "10px", height: "10px", backgroundColor: "#A259FF", border: "2px solid #282828", cursor: "nwse-resize", pointerEvents: "auto" }}
              onMouseDown={(e) => {
                e.stopPropagation();
                const wrap = wrapRef.current; if (!wrap) return;
                const rect = wrap.getBoundingClientRect();
                const px = (e.clientX - rect.left - panX) / zoom;
                const py = (e.clientY - rect.top - panY) / zoom;
                // Anchor = top-left corner of bbox (opposite of dragged corner)
                snapshotSelection("resize", { x: px, y: py }, { x: minX, y: minY });
              }}
            />
            {/* Rotation handle (outside bottom-right) */}
            <div
              style={{ position: "absolute", left: `${bx + bw + 14}px`, top: `${by + bh + 14}px`, width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#A259FF", border: "2px solid #282828", cursor: "grab", pointerEvents: "auto", display: "flex", alignItems: "center", justifyContent: "center" }}
              onMouseDown={(e) => {
                e.stopPropagation();
                const wrap = wrapRef.current; if (!wrap) return;
                const rect = wrap.getBoundingClientRect();
                const px = (e.clientX - rect.left - panX) / zoom;
                const py = (e.clientY - rect.top - panY) / zoom;
                snapshotSelection("rotate", { x: px, y: py });
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="3"><path d="M21 12a9 9 0 1 1-6.219-8.56" /><polyline points="17 2 21 3.5 21 8" /></svg>
            </div>
          </div>
        );
      })()}

      {/* ── Right-Click Context Menu ── */}
      {contextMenu && (
        <div
          style={{
            position: "fixed", left: `${contextMenu.x}px`, top: `${contextMenu.y}px`, zIndex: 3000,
            backgroundColor: "#FFF", border: "3px solid #282828", boxShadow: "4px 4px 0 #282828",
            minWidth: "160px", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.8rem",
          }}
          onClick={() => setContextMenu(null)}
        >
          {contextMenu.target === "canvas" && (
            <>
              <button className="block w-full text-left px-3 py-2 hover:bg-creamy-milk uppercase font-bold text-[0.75rem]" onClick={() => { setActiveTool("sticky"); }}>Add Sticky Note</button>
              <button className="block w-full text-left px-3 py-2 hover:bg-creamy-milk uppercase font-bold text-[0.75rem]" onClick={() => { fileInputRef.current?.click(); }}>Add Media</button>
              <div style={{ height: "1px", backgroundColor: "#28282820" }} />
              <button className="block w-full text-left px-3 py-2 hover:bg-creamy-milk uppercase font-bold text-[0.75rem]" onClick={() => { setZoom(1); setPanX(0); setPanY(0); }}>Zoom to Fit</button>
              <button className="block w-full text-left px-3 py-2 hover:bg-creamy-milk uppercase font-bold text-[0.75rem]" onClick={undo} disabled={historyIdxRef.current <= 0}>Undo</button>
              <button className="block w-full text-left px-3 py-2 hover:bg-creamy-milk uppercase font-bold text-[0.75rem]" onClick={redo}>Redo</button>
            </>
          )}
          {contextMenu.target === "sticky" && contextMenu.targetId && (
            <>
              <button className="block w-full text-left px-3 py-2 hover:bg-creamy-milk uppercase font-bold text-[0.75rem]" onClick={() => {
                const s = stickies.find((st) => st.id === contextMenu.targetId);
                if (s) { setSettingsSticky(s); setSsTitle(s.title); setSsDesc(s.description); setSsTags(s.tags.join(", ")); setSsBgColor(s.bgColor); setSsBorderColor(s.borderColor); }
              }}>Edit</button>
              <button className="block w-full text-left px-3 py-2 hover:bg-creamy-milk uppercase font-bold text-[0.75rem]" onClick={() => {
                const s = stickies.find((st) => st.id === contextMenu.targetId);
                if (s) { pushHistory(); setStickies((prev) => [...prev, { ...s, id: `sticky-${Date.now()}`, x: s.x + 20, y: s.y + 20 }]); }
              }}>Duplicate</button>
              <div style={{ height: "1px", backgroundColor: "#28282820" }} />
              <button className="block w-full text-left px-3 py-2 hover:bg-creamy-milk uppercase font-bold text-[0.75rem] text-watermelon" onClick={() => {
                pushHistory();
                setStickies((prev) => prev.filter((s) => s.id !== contextMenu.targetId));
              }}>Delete</button>
            </>
          )}
          {contextMenu.target === "media" && contextMenu.targetId && (
            <>
              <button className="block w-full text-left px-3 py-2 hover:bg-creamy-milk uppercase font-bold text-[0.75rem]" onClick={() => {
                const m = mediaItems.find((mi) => mi.id === contextMenu.targetId);
                if (m) setViewerMedia(m);
              }}>View</button>
              <button className="block w-full text-left px-3 py-2 hover:bg-creamy-milk uppercase font-bold text-[0.75rem]" onClick={() => {
                const m = mediaItems.find((mi) => mi.id === contextMenu.targetId);
                if (m) { pushHistory(); setMediaItems((prev) => [...prev, { ...m, id: `media-${Date.now()}`, x: m.x + 20, y: m.y + 20 }]); }
              }}>Duplicate</button>
              <div style={{ height: "1px", backgroundColor: "#28282820" }} />
              <button className="block w-full text-left px-3 py-2 hover:bg-creamy-milk uppercase font-bold text-[0.75rem] text-watermelon" onClick={() => {
                pushHistory();
                setMediaItems((prev) => prev.filter((m) => m.id !== contextMenu.targetId));
              }}>Delete</button>
            </>
          )}
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
