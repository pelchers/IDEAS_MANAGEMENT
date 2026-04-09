"use client";

import { useMemo, memo } from "react";
import type { SchemaEntity, SchemaRelation } from "@/lib/schema-types";
import { RELATION_COLORS } from "@/lib/schema-types";
import { getRelationPath } from "@/lib/schema-layout";

interface RelationLinesProps {
  entities: SchemaEntity[];
  relations: SchemaRelation[];
  roughMode?: boolean;
  highlightEntityId?: string | null;
  selectedRelationId?: string | null;
  onSelectRelation?: (id: string | null) => void;
  zoom?: number;
}

/**
 * SVG crow's foot relation lines between entity cards.
 */
export const RelationLines = memo(function RelationLines({
  entities,
  relations,
  roughMode = false,
  highlightEntityId,
  selectedRelationId,
  onSelectRelation,
  zoom = 1,
}: RelationLinesProps) {
  const lines = useMemo(() => {
    return relations.map((rel, i) => {
      const from = entities.find((e) => e.id === rel.fromEntityId);
      const to = entities.find((e) => e.id === rel.toEntityId);
      if (!from || !to) return null;

      const fromRect = { x: from.x, y: from.y, width: from.width || 280, height: estimateHeight(from) };
      const toRect = { x: to.x, y: to.y, width: to.width || 280, height: estimateHeight(to) };
      const { path, fromPoint, toPoint, midPoint } = getRelationPath(fromRect, toRect);
      const color = RELATION_COLORS[i % RELATION_COLORS.length];
      const isHighlighted = !highlightEntityId || rel.fromEntityId === highlightEntityId || rel.toEntityId === highlightEntityId;
      const isSelected = selectedRelationId === rel.id;

      return { rel, path, fromPoint, toPoint, midPoint, color, isHighlighted, isSelected, from, to };
    }).filter(Boolean);
  }, [entities, relations, highlightEntityId, selectedRelationId]);

  return (
    <svg
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10, overflow: "visible" }}
      width="100%"
      height="100%"
    >
      {/* Crow's foot marker definitions */}
      <defs>
        {RELATION_COLORS.map((color, i) => (
          <g key={i}>
            {/* One marker (perpendicular line) */}
            <marker id={`one-${i}`} viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
              <line x1="10" y1="0" x2="10" y2="10" stroke={color} strokeWidth="2" />
            </marker>
            {/* Many marker (crow's foot) */}
            <marker id={`many-${i}`} viewBox="0 0 14 10" refX="14" refY="5" markerWidth="10" markerHeight="10" orient="auto-start-reverse">
              <line x1="0" y1="5" x2="14" y2="0" stroke={color} strokeWidth="1.5" />
              <line x1="0" y1="5" x2="14" y2="5" stroke={color} strokeWidth="1.5" />
              <line x1="0" y1="5" x2="14" y2="10" stroke={color} strokeWidth="1.5" />
            </marker>
          </g>
        ))}
      </defs>

      {lines.map((line) => {
        if (!line) return null;
        const { rel, path, midPoint, color, isHighlighted, isSelected } = line;
        const colorIdx = RELATION_COLORS.indexOf(color);
        const startMarker = `url(#one-${colorIdx})`;
        const endMarker = rel.type === "1:1" ? `url(#one-${colorIdx})` : `url(#many-${colorIdx})`;

        return (
          <g key={rel.id} style={{ opacity: isHighlighted ? 1 : 0.15 }}>
            {/* Invisible wider click target */}
            <path
              d={path}
              fill="none"
              stroke="transparent"
              strokeWidth={12 / zoom}
              style={{ pointerEvents: "stroke", cursor: "pointer" }}
              onClick={() => onSelectRelation?.(isSelected ? null : rel.id)}
            />
            {/* Visible line */}
            <path
              d={path}
              fill="none"
              stroke={isSelected ? "#282828" : color}
              strokeWidth={isSelected ? 3 : 2}
              strokeDasharray={roughMode ? "6 3" : undefined}
              markerStart={rel.type === "N:N" ? `url(#many-${colorIdx})` : startMarker}
              markerEnd={endMarker}
            />
            {/* Label at midpoint */}
            <g transform={`translate(${midPoint.x}, ${midPoint.y})`}>
              <rect x="-28" y="-10" width="56" height="20" rx="4" fill="white" stroke={color} strokeWidth="1" />
              <text
                x="0" y="5"
                textAnchor="middle"
                fontFamily="IBM Plex Mono, monospace"
                fontSize={11 / zoom}
                fontWeight="bold"
                fill={color}
              >
                {rel.fkFieldName || rel.type}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
});

function estimateHeight(entity: SchemaEntity): number {
  if (entity.collapsed) return 48;
  return 48 + entity.fields.length * 28 + 40;
}
