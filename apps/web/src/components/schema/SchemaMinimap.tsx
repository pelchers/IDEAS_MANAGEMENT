"use client";

import type { SchemaEntity } from "@/lib/schema-types";
import { HEADER_COLORS } from "@/lib/schema-types";

interface SchemaMinimapProps {
  entities: SchemaEntity[];
  zoom: number;
  panX: number;
  panY: number;
  viewportWidth: number;
  viewportHeight: number;
  onPan: (x: number, y: number) => void;
}

const MINIMAP_W = 200;
const MINIMAP_H = 150;

export function SchemaMinimap({ entities, zoom, panX, panY, viewportWidth, viewportHeight, onPan }: SchemaMinimapProps) {
  if (entities.length === 0) return null;

  // Calculate bounds of all entities
  const minX = Math.min(...entities.map((e) => e.x));
  const minY = Math.min(...entities.map((e) => e.y));
  const maxX = Math.max(...entities.map((e) => e.x + (e.width || 280)));
  const maxY = Math.max(...entities.map((e) => e.y + 200));
  const worldW = Math.max(maxX - minX + 100, 400);
  const worldH = Math.max(maxY - minY + 100, 300);

  const scale = Math.min(MINIMAP_W / worldW, MINIMAP_H / worldH);

  // Viewport indicator
  const vpX = (-panX / zoom - minX + 50) * scale;
  const vpY = (-panY / zoom - minY + 50) * scale;
  const vpW = (viewportWidth / zoom) * scale;
  const vpH = (viewportHeight / zoom) * scale;

  const handleMinimapClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / scale + minX - 50;
    const clickY = (e.clientY - rect.top) / scale + minY - 50;
    onPan(-clickX * zoom + viewportWidth / 2, -clickY * zoom + viewportHeight / 2);
  };

  return (
    <div
      style={{
        position: "absolute", bottom: "12px", right: "12px", zIndex: 40,
        width: `${MINIMAP_W}px`, height: `${MINIMAP_H}px`,
        border: "2px solid #282828", backgroundColor: "rgba(255,255,255,0.95)",
        boxShadow: "3px 3px 0 #282828", cursor: "crosshair", overflow: "hidden",
      }}
      onClick={handleMinimapClick}
    >
      {/* Entity rectangles */}
      {entities.map((e) => {
        const color = HEADER_COLORS[e.headerColor || "signal-black"] || HEADER_COLORS["signal-black"];
        return (
          <div
            key={e.id}
            style={{
              position: "absolute",
              left: `${(e.x - minX + 50) * scale}px`,
              top: `${(e.y - minY + 50) * scale}px`,
              width: `${Math.max(4, (e.width || 280) * scale)}px`,
              height: `${Math.max(3, 200 * scale)}px`,
              backgroundColor: color.bg,
              border: "1px solid #282828",
            }}
          />
        );
      })}

      {/* Viewport indicator */}
      <div
        style={{
          position: "absolute",
          left: `${Math.max(0, vpX)}px`,
          top: `${Math.max(0, vpY)}px`,
          width: `${Math.min(vpW, MINIMAP_W)}px`,
          height: `${Math.min(vpH, MINIMAP_H)}px`,
          border: "2px solid #A259FF",
          backgroundColor: "rgba(162, 89, 255, 0.1)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
