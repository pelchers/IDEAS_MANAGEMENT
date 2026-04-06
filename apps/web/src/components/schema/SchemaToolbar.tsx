"use client";

interface SchemaToolbarProps {
  entityCount: number;
  fieldCount: number;
  relationCount: number;
  zoom: number;
  gridEnabled: boolean;
  snapEnabled: boolean;
  roughMode: boolean;
  searchQuery: string;
  canUndo: boolean;
  canRedo: boolean;
  saving: boolean;
  onAddEntity: () => void;
  onAddRelation: () => void;
  onAddEnum: () => void;
  onAutoLayout: () => void;
  onFitView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onToggleGrid: () => void;
  onToggleSnap: () => void;
  onToggleRough: () => void;
  onSearchChange: (q: string) => void;
  onImport: () => void;
  onExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export function SchemaToolbar({
  entityCount, fieldCount, relationCount,
  zoom, gridEnabled, snapEnabled, roughMode, searchQuery,
  canUndo, canRedo, saving,
  onAddEntity, onAddRelation, onAddEnum,
  onAutoLayout, onFitView, onZoomIn, onZoomOut, onZoomReset,
  onToggleGrid, onToggleSnap, onToggleRough,
  onSearchChange, onImport, onExport, onUndo, onRedo,
}: SchemaToolbarProps) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px",
      borderBottom: "3px solid #282828", backgroundColor: "#FFF", flexWrap: "wrap",
      fontFamily: "IBM Plex Mono, monospace", fontSize: "0.75rem",
    }}>
      {/* Primary actions */}
      <button className="nb-btn nb-btn--small" onClick={onAddEntity}>+ ENTITY</button>
      <button className="nb-btn nb-btn--small" onClick={onAddRelation}>+ RELATION</button>
      <button className="nb-btn nb-btn--small" onClick={onAddEnum}>+ ENUM</button>

      <div style={{ width: "1px", height: "24px", backgroundColor: "#e0e0e0" }} />

      {/* Layout */}
      <button className="nb-btn nb-btn--small" onClick={onAutoLayout} title="Auto Layout">LAYOUT</button>
      <button className="nb-btn nb-btn--small" onClick={onFitView} title="Fit all entities in view">FIT</button>

      <div style={{ width: "1px", height: "24px", backgroundColor: "#e0e0e0" }} />

      {/* Zoom */}
      <button className="nb-btn nb-btn--small" onClick={onZoomOut} title="Zoom Out">-</button>
      <span style={{ minWidth: "40px", textAlign: "center", fontWeight: 700 }}>{Math.round(zoom * 100)}%</span>
      <button className="nb-btn nb-btn--small" onClick={onZoomIn} title="Zoom In">+</button>
      <button className="nb-btn nb-btn--small" onClick={onZoomReset} title="Reset to 100%">100</button>

      <div style={{ width: "1px", height: "24px", backgroundColor: "#e0e0e0" }} />

      {/* Toggles */}
      <button
        className="nb-btn nb-btn--small"
        onClick={onToggleGrid}
        style={{ backgroundColor: gridEnabled ? "#282828" : "#FFF", color: gridEnabled ? "#FFF" : "#282828" }}
      >GRID</button>
      <button
        className="nb-btn nb-btn--small"
        onClick={onToggleSnap}
        style={{ backgroundColor: snapEnabled ? "#282828" : "#FFF", color: snapEnabled ? "#FFF" : "#282828" }}
      >SNAP</button>
      <button
        className="nb-btn nb-btn--small"
        onClick={onToggleRough}
        style={{ backgroundColor: roughMode ? "#282828" : "#FFF", color: roughMode ? "#FFF" : "#282828" }}
      >ROUGH</button>

      <div style={{ width: "1px", height: "24px", backgroundColor: "#e0e0e0" }} />

      {/* Undo/Redo */}
      <button className="nb-btn nb-btn--small" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">UNDO</button>
      <button className="nb-btn nb-btn--small" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">REDO</button>

      <div style={{ width: "1px", height: "24px", backgroundColor: "#e0e0e0" }} />

      {/* Search */}
      <input
        type="text"
        placeholder="Search entities..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{
          border: "2px solid #282828", padding: "3px 8px", fontFamily: "inherit", fontSize: "inherit",
          width: "150px", outline: "none",
        }}
      />

      <div style={{ flex: 1 }} />

      {/* Import/Export */}
      <button className="nb-btn nb-btn--small" onClick={onImport}>IMPORT</button>
      <button className="nb-btn nb-btn--small" onClick={onExport}>EXPORT</button>

      {/* Stats */}
      <span style={{ color: "#999", fontSize: "0.65rem" }}>
        {entityCount}E {fieldCount}F {relationCount}R
      </span>

      {saving && <span style={{ color: "#2BBF5D", fontSize: "0.65rem", fontWeight: 700 }}>SAVING...</span>}
    </div>
  );
}
