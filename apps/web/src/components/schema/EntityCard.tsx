"use client";

import { useState, useCallback, useRef } from "react";
import type { SchemaEntity, SchemaField, SchemaGraph } from "@/lib/schema-types";
import { badgeFor, badgeClasses, badgeLabel, HEADER_COLORS, getTableTriggerCount, getTableIndexCount, getTablePolicyCount, getTableGrantCount } from "@/lib/schema-types";

interface EntityCardProps {
  entity: SchemaEntity;
  graph: SchemaGraph;
  isSelected?: boolean;
  isDragging?: boolean;
  onSelect?: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
  onFieldEdit?: (fieldId: string) => void;
  onFieldDelete?: (fieldId: string) => void;
  onAddField?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  onColorChange?: (color: string) => void;
  onToggleCollapse?: () => void;
  onInlineFieldUpdate?: (fieldId: string, updates: Partial<SchemaField>) => void;
}

export function EntityCard({
  entity,
  graph,
  isSelected,
  isDragging,
  onSelect,
  onDragStart,
  onFieldEdit,
  onFieldDelete,
  onAddField,
  onRename,
  onDelete,
  onColorChange,
  onToggleCollapse,
  onInlineFieldUpdate,
}: EntityCardProps) {
  const [hover, setHover] = useState(false);
  const [hoverFieldId, setHoverFieldId] = useState<string | null>(null);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const headerColor = HEADER_COLORS[entity.headerColor || "signal-black"] || HEADER_COLORS["signal-black"];
  const cardWidth = entity.width || 280;
  const triggerCount = getTableTriggerCount(graph, entity.name);
  const indexCount = getTableIndexCount(graph, entity.name);
  const policyCount = getTablePolicyCount(graph, entity.name);
  const grantCount = getTableGrantCount(graph, entity.name);

  const handleInlineEdit = useCallback((fieldId: string, fieldName: string) => {
    setEditingFieldId(fieldId);
    setEditingValue(fieldName);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const commitInlineEdit = useCallback(() => {
    if (editingFieldId && editingValue.trim()) {
      onInlineFieldUpdate?.(editingFieldId, { name: editingValue.trim() });
    }
    setEditingFieldId(null);
  }, [editingFieldId, editingValue, onInlineFieldUpdate]);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setShowColorPicker(false); }}
      onClick={onSelect}
      onMouseDown={onDragStart}
      style={{
        width: `${cardWidth}px`,
        border: isSelected ? "4px solid #A259FF" : "4px solid #282828",
        boxShadow: isDragging ? "8px 8px 0px #282828" : isSelected ? "6px 6px 0px #A259FF" : "4px 4px 0px #282828",
        backgroundColor: "#FFF",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        transition: isDragging ? "none" : "box-shadow 150ms",
        position: "relative",
      }}
    >
      {/* Header */}
      <div style={{
        backgroundColor: headerColor.bg,
        color: headerColor.text,
        padding: "8px 12px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        position: "relative",
      }}>
        {/* Collapse toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleCollapse?.(); }}
          onMouseDown={(e) => e.stopPropagation()}
          style={{ background: "none", border: "none", color: headerColor.text, cursor: "pointer", fontSize: "0.7rem", padding: 0 }}
        >
          {entity.collapsed ? "\u25B6" : "\u25BC"}
        </button>

        <span style={{ fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.05em", textTransform: "uppercase", flex: 1 }}>
          {entity.name}
        </span>

        {/* Entity-level badges */}
        {triggerCount > 0 && <span style={{ fontSize: "0.55rem", padding: "1px 4px", backgroundColor: "#FF6D28", color: "#FFF", fontWeight: 700 }}>TRG:{triggerCount}</span>}
        {indexCount > 0 && <span style={{ fontSize: "0.55rem", padding: "1px 4px", backgroundColor: "#6C8EBF", color: "#FFF", fontWeight: 700 }}>IDX:{indexCount}</span>}
        {entity.enableRLS && <span style={{ fontSize: "0.55rem", padding: "1px 4px", backgroundColor: "#A259FF", color: "#FFF", fontWeight: 700 }}>RLS{policyCount > 0 ? `:${policyCount}` : ""}</span>}
        {grantCount > 0 && <span style={{ fontSize: "0.55rem", padding: "1px 4px", backgroundColor: "#708090", color: "#FFF", fontWeight: 700 }}>GRT:{grantCount}</span>}

        {/* Hover action buttons */}
        {hover && !isDragging && (
          <div style={{ display: "flex", gap: "3px" }}>
            <button onClick={(e) => { e.stopPropagation(); setShowColorPicker(!showColorPicker); }} onMouseDown={(e) => e.stopPropagation()} style={{ width: "12px", height: "12px", borderRadius: "50%", border: "2px solid " + headerColor.text, backgroundColor: headerColor.bg, cursor: "pointer" }} title="Color" />
            <button onClick={(e) => { e.stopPropagation(); onRename?.(); }} onMouseDown={(e) => e.stopPropagation()} style={{ fontSize: "0.55rem", color: headerColor.text, background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>REN</button>
            <button onClick={(e) => { e.stopPropagation(); onDelete?.(); }} onMouseDown={(e) => e.stopPropagation()} style={{ fontSize: "0.55rem", color: "#FF5E54", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>DEL</button>
          </div>
        )}
      </div>

      {/* Color picker dropdown */}
      {showColorPicker && (
        <div style={{ position: "absolute", top: "40px", right: "4px", zIndex: 50, display: "flex", gap: "3px", padding: "6px", backgroundColor: "#FFF", border: "2px solid #282828", boxShadow: "3px 3px 0 #282828" }}>
          {Object.entries(HEADER_COLORS).map(([key, c]) => (
            <button
              key={key}
              onClick={(e) => { e.stopPropagation(); onColorChange?.(key); setShowColorPicker(false); }}
              onMouseDown={(e) => e.stopPropagation()}
              style={{ width: "18px", height: "18px", backgroundColor: c.bg, border: entity.headerColor === key ? "2px solid #FFF" : "1px solid #282828", cursor: "pointer", borderRadius: "2px" }}
              title={key}
            />
          ))}
        </div>
      )}

      {/* Fields (collapsed = hidden) */}
      {!entity.collapsed && (
        <div style={{ padding: "4px 0" }}>
          {entity.fields.map((f) => {
            const badge = badgeFor(f);
            const isFieldHover = hoverFieldId === f.id;
            const isEditing = editingFieldId === f.id;

            return (
              <div
                key={f.id}
                onMouseEnter={() => setHoverFieldId(f.id)}
                onMouseLeave={() => setHoverFieldId(null)}
                style={{
                  display: "flex", alignItems: "center", gap: "4px",
                  padding: "3px 12px", fontSize: "0.8rem", fontFamily: "IBM Plex Mono, monospace",
                  backgroundColor: isFieldHover ? "#f5f5f0" : "transparent",
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {/* Field name — double-click to inline edit */}
                {isEditing ? (
                  <input
                    ref={inputRef}
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={commitInlineEdit}
                    onKeyDown={(e) => { if (e.key === "Enter") commitInlineEdit(); if (e.key === "Escape") setEditingFieldId(null); }}
                    style={{ flex: 1, fontFamily: "inherit", fontSize: "inherit", border: "1px solid #282828", padding: "0 2px", outline: "none" }}
                  />
                ) : (
                  <span
                    style={{ flex: 1, cursor: "text" }}
                    onDoubleClick={() => handleInlineEdit(f.id, f.name)}
                  >
                    {f.name}
                  </span>
                )}

                {/* Type */}
                <span style={{ fontSize: "0.7rem", color: "#999", textAlign: "right" }}>{f.type}</span>

                {/* Badges */}
                {f.autoIncrement && <span style={{ fontSize: "0.55rem", padding: "0 3px", backgroundColor: "#FFE459", fontWeight: 700 }}>AUTO</span>}
                {f.indexed && !f.isPK && !f.unique && <span style={{ fontSize: "0.55rem", padding: "0 3px", backgroundColor: "#6C8EBF", color: "#FFF", fontWeight: 700 }}>IDX</span>}
                {badge && <span style={{ fontSize: "0.55rem", padding: "0 3px", fontWeight: 700 }} className={badgeClasses(badge)}>{badgeLabel(badge)}</span>}

                {/* FK target */}
                {f.isFK && f.fkTarget && <span style={{ fontSize: "0.55rem", color: "#2BBF5D" }}>{"\u2192"}{f.fkTarget}</span>}

                {/* Action buttons on hover */}
                {isFieldHover && !isEditing && (
                  <div style={{ display: "flex", gap: "2px" }}>
                    <button onClick={() => onFieldEdit?.(f.id)} style={{ width: "16px", height: "16px", fontSize: "0.5rem", border: "1px solid #282828", backgroundColor: "#FFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>E</button>
                    <button onClick={() => onFieldDelete?.(f.id)} style={{ width: "16px", height: "16px", fontSize: "0.5rem", border: "1px solid #282828", backgroundColor: "#FF5E54", color: "#FFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>X</button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add field */}
          <div
            style={{
              padding: "6px 12px", borderTop: "1px dashed #e0e0e0",
              fontSize: "0.7rem", color: "#999", cursor: "pointer", textAlign: "center",
            }}
            onClick={(e) => { e.stopPropagation(); onAddField?.(); }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            + ADD FIELD
          </div>
        </div>
      )}

      {/* Collapsed badge */}
      {entity.collapsed && (
        <div style={{ padding: "6px 12px", fontSize: "0.7rem", color: "#999", fontFamily: "monospace" }}>
          {entity.fields.length} fields
        </div>
      )}
    </div>
  );
}
