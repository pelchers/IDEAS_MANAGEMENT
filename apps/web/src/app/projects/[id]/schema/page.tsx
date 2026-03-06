"use client";

import { useState, useEffect, use, useCallback, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  Types (matching @idea-management/schemas SchemaGraph)              */
/* ------------------------------------------------------------------ */

interface SchemaField {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  unique: boolean;
  defaultValue?: string;
  reference?: { table: string; field: string };
}

interface SchemaNode {
  id: string;
  name: string;
  x: number;
  y: number;
  fields: SchemaField[];
}

interface SchemaEdge {
  id: string;
  fromNodeId: string;
  fromField: string;
  toNodeId: string;
  toField: string;
  type: "one-to-one" | "one-to-many" | "many-to-many";
}

interface SchemaGraph {
  nodes: SchemaNode[];
  edges: SchemaEdge[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function uid(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const FIELD_TYPES = ["string", "number", "boolean", "date", "json", "reference"];

function generateDDL(graph: SchemaGraph): string {
  const lines: string[] = [];
  for (const node of graph.nodes) {
    lines.push(`CREATE TABLE "${node.name}" (`);
    const fieldLines: string[] = [];
    for (const f of node.fields) {
      let line = `  "${f.name}" ${mapSQLType(f.type)}`;
      if (f.primaryKey) line += " PRIMARY KEY";
      if (f.unique && !f.primaryKey) line += " UNIQUE";
      if (!f.nullable && !f.primaryKey) line += " NOT NULL";
      if (f.defaultValue) line += ` DEFAULT ${f.defaultValue}`;
      fieldLines.push(line);
    }
    lines.push(fieldLines.join(",\n"));
    lines.push(");\n");
  }
  return lines.join("\n");
}

function mapSQLType(t: string): string {
  switch (t) {
    case "string": return "TEXT";
    case "number": return "INTEGER";
    case "boolean": return "BOOLEAN";
    case "date": return "TIMESTAMP";
    case "json": return "JSONB";
    case "reference": return "INTEGER";
    default: return "TEXT";
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SchemaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);

  const [nodes, setNodes] = useState<SchemaNode[]>([]);
  const [edges, setEdges] = useState<SchemaEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection & drag
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<{
    nodeId: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  // Node editing
  const [editingNode, setEditingNode] = useState<SchemaNode | null>(null);
  const [editName, setEditName] = useState("");
  const [editFields, setEditFields] = useState<SchemaField[]>([]);

  // Add field form
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("string");

  // Edge creation
  const [addingEdge, setAddingEdge] = useState(false);
  const [edgeFromNodeId, setEdgeFromNodeId] = useState("");
  const [edgeFromField, setEdgeFromField] = useState("");
  const [edgeToNodeId, setEdgeToNodeId] = useState("");
  const [edgeToField, setEdgeToField] = useState("");
  const [edgeType, setEdgeType] = useState<SchemaEdge["type"]>("one-to-many");

  // Delete confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // DDL modal
  const [showDDL, setShowDDL] = useState(false);

  const artifactUrl = `/api/projects/${projectId}/artifacts/schema/schema.graph.json`;

  const persist = useCallback(
    async (graph: SchemaGraph) => {
      await fetch(artifactUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(graph),
      });
    },
    [artifactUrl]
  );

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(artifactUrl, { credentials: "include" });
        if (res.ok) {
          const data: SchemaGraph = await res.json();
          setNodes(data.nodes ?? []);
          setEdges(data.edges ?? []);
        } else if (res.status === 404) {
          setNodes([]);
          setEdges([]);
        } else {
          setError("Failed to load schema");
        }
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [artifactUrl]);

  function updateGraph(n: SchemaNode[], e: SchemaEdge[]) {
    setNodes(n);
    setEdges(e);
    persist({ nodes: n, edges: e });
  }

  /* ---------- Node operations ---------- */

  function addNode() {
    const node: SchemaNode = {
      id: uid(),
      name: `Entity${nodes.length + 1}`,
      x: 100 + nodes.length * 40,
      y: 100 + nodes.length * 40,
      fields: [
        { name: "id", type: "number", nullable: false, primaryKey: true, unique: true },
      ],
    };
    updateGraph([...nodes, node], edges);
  }

  function deleteNode(nodeId: string) {
    updateGraph(
      nodes.filter((n) => n.id !== nodeId),
      edges.filter((e) => e.fromNodeId !== nodeId && e.toNodeId !== nodeId)
    );
    setDeleteConfirmId(null);
    setSelectedNodeId(null);
  }

  function openEditNode(node: SchemaNode) {
    setEditingNode(node);
    setEditName(node.name);
    setEditFields([...node.fields]);
  }

  function saveEditNode() {
    if (!editingNode) return;
    const updated: SchemaNode = {
      ...editingNode,
      name: editName.trim() || editingNode.name,
      fields: editFields,
    };
    updateGraph(
      nodes.map((n) => (n.id === editingNode.id ? updated : n)),
      edges
    );
    setEditingNode(null);
  }

  function addField() {
    if (!newFieldName.trim()) return;
    setEditFields((prev) => [
      ...prev,
      {
        name: newFieldName.trim(),
        type: newFieldType,
        nullable: false,
        primaryKey: false,
        unique: false,
      },
    ]);
    setNewFieldName("");
    setNewFieldType("string");
  }

  function removeField(idx: number) {
    setEditFields((prev) => prev.filter((_, i) => i !== idx));
  }

  function toggleFieldProp(idx: number, prop: "nullable" | "primaryKey" | "unique") {
    setEditFields((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, [prop]: !f[prop] } : f))
    );
  }

  /* ---------- Edge operations ---------- */

  function handleAddEdge() {
    if (!edgeFromNodeId || !edgeFromField || !edgeToNodeId || !edgeToField) return;
    const edge: SchemaEdge = {
      id: uid(),
      fromNodeId: edgeFromNodeId,
      fromField: edgeFromField,
      toNodeId: edgeToNodeId,
      toField: edgeToField,
      type: edgeType,
    };
    updateGraph(nodes, [...edges, edge]);
    setAddingEdge(false);
    setEdgeFromNodeId("");
    setEdgeFromField("");
    setEdgeToNodeId("");
    setEdgeToField("");
  }

  function deleteEdge(edgeId: string) {
    updateGraph(nodes, edges.filter((e) => e.id !== edgeId));
  }

  /* ---------- Drag ---------- */

  function handleNodeMouseDown(e: React.MouseEvent, nodeId: string) {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setSelectedNodeId(nodeId);
    setDragState({
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      origX: node.x,
      origY: node.y,
    });
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragState) return;
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    setNodes((prev) =>
      prev.map((n) =>
        n.id === dragState.nodeId
          ? { ...n, x: dragState.origX + dx, y: dragState.origY + dy }
          : n
      )
    );
  }

  function handleMouseUp() {
    if (dragState) {
      // Persist position
      persist({ nodes, edges });
    }
    setDragState(null);
  }

  /* ---------- Export ---------- */

  function downloadJSON() {
    const blob = new Blob([JSON.stringify({ nodes, edges }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schema.graph.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ---------- Render ---------- */

  if (loading) {
    return (
      <div style={s.center}>
        <span>Loading schema planner...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={s.center}>
        <span style={{ color: "#d93025" }}>{error}</span>
      </div>
    );
  }

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div style={s.page}>
      {/* Breadcrumb */}
      <nav style={s.breadcrumb}>
        <a href="/dashboard" style={s.breadcrumbLink}>Dashboard</a>
        <span style={s.breadcrumbSep}>/</span>
        <a href={`/projects/${projectId}`} style={s.breadcrumbLink}>Project</a>
        <span style={s.breadcrumbSep}>/</span>
        <span style={s.breadcrumbCurrent}>Schema Planner</span>
      </nav>

      {/* Toolbar */}
      <div style={s.toolbar}>
        <button style={s.toolBtn} onClick={addNode}>+ Add Entity</button>
        <button style={s.toolBtn} onClick={() => setAddingEdge(!addingEdge)}>
          {addingEdge ? "Cancel Edge" : "+ Add Relationship"}
        </button>
        <div style={{ flex: 1 }} />
        <button style={s.toolBtn} onClick={downloadJSON}>Export JSON</button>
        <button style={s.toolBtn} onClick={() => setShowDDL(true)}>Export SQL</button>
      </div>

      {/* Edge creation form */}
      {addingEdge && (
        <div style={s.edgeForm}>
          <select style={s.select} value={edgeFromNodeId} onChange={(e) => setEdgeFromNodeId(e.target.value)}>
            <option value="">From table...</option>
            {nodes.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>
          <select style={s.select} value={edgeFromField} onChange={(e) => setEdgeFromField(e.target.value)}>
            <option value="">From field...</option>
            {nodes.find((n) => n.id === edgeFromNodeId)?.fields.map((f) => (
              <option key={f.name} value={f.name}>{f.name}</option>
            ))}
          </select>
          <span style={{ fontSize: "13px", color: "#888" }}>&rarr;</span>
          <select style={s.select} value={edgeToNodeId} onChange={(e) => setEdgeToNodeId(e.target.value)}>
            <option value="">To table...</option>
            {nodes.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>
          <select style={s.select} value={edgeToField} onChange={(e) => setEdgeToField(e.target.value)}>
            <option value="">To field...</option>
            {nodes.find((n) => n.id === edgeToNodeId)?.fields.map((f) => (
              <option key={f.name} value={f.name}>{f.name}</option>
            ))}
          </select>
          <select style={s.select} value={edgeType} onChange={(e) => setEdgeType(e.target.value as SchemaEdge["type"])}>
            <option value="one-to-one">1:1</option>
            <option value="one-to-many">1:N</option>
            <option value="many-to-many">N:N</option>
          </select>
          <button style={s.smallBtn} onClick={handleAddEdge}>Create</button>
        </div>
      )}

      {/* Canvas + sidebar layout */}
      <div style={s.workspace}>
        {/* Canvas */}
        <div
          style={s.canvas}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={() => setSelectedNodeId(null)}
        >
          {/* SVG edges */}
          <svg style={s.edgeSvg}>
            {edges.map((edge) => {
              const fromNode = nodes.find((n) => n.id === edge.fromNodeId);
              const toNode = nodes.find((n) => n.id === edge.toNodeId);
              if (!fromNode || !toNode) return null;
              const x1 = fromNode.x + 120;
              const y1 = fromNode.y + 20 + (fromNode.fields.findIndex((f) => f.name === edge.fromField) + 1) * 24;
              const x2 = toNode.x;
              const y2 = toNode.y + 20 + (toNode.fields.findIndex((f) => f.name === edge.toField) + 1) * 24;
              const label = edge.type === "one-to-one" ? "1:1" : edge.type === "one-to-many" ? "1:N" : "N:N";
              return (
                <g key={edge.id}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1a73e8" strokeWidth={2} />
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 6}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#1a73e8"
                    fontWeight="600"
                  >
                    {label}
                  </text>
                  <circle cx={x1} cy={y1} r={4} fill="#1a73e8" />
                  <circle cx={x2} cy={y2} r={4} fill="#1a73e8" />
                </g>
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <div
              key={node.id}
              style={{
                ...s.nodeCard,
                left: `${node.x}px`,
                top: `${node.y}px`,
                border: selectedNodeId === node.id ? "2px solid #1a73e8" : "1px solid #ddd",
              }}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNodeId(node.id);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                openEditNode(node);
              }}
            >
              <div style={s.nodeHeader}>
                <span style={s.nodeName}>{node.name}</span>
                <button
                  style={s.nodeDeleteBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (deleteConfirmId === node.id) {
                      deleteNode(node.id);
                    } else {
                      setDeleteConfirmId(node.id);
                    }
                  }}
                >
                  {deleteConfirmId === node.id ? "Confirm?" : "x"}
                </button>
              </div>
              {node.fields.map((f) => (
                <div key={f.name} style={s.fieldRow}>
                  <span style={{ fontWeight: f.primaryKey ? 600 : 400, fontSize: "11px" }}>
                    {f.primaryKey && "PK "}
                    {f.unique && !f.primaryKey && "U "}
                    {f.name}
                  </span>
                  <span style={s.fieldType}>{f.type}</span>
                </div>
              ))}
              <button
                style={s.editNodeBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  openEditNode(node);
                }}
              >
                Edit fields
              </button>
            </div>
          ))}
        </div>

        {/* Sidebar: edges list */}
        <aside style={s.sidebar}>
          <h3 style={s.sidebarTitle}>Relationships</h3>
          {edges.length === 0 && (
            <div style={s.emptyText}>No relationships yet</div>
          )}
          {edges.map((edge) => {
            const from = nodes.find((n) => n.id === edge.fromNodeId);
            const to = nodes.find((n) => n.id === edge.toNodeId);
            return (
              <div key={edge.id} style={s.edgeItem}>
                <span style={{ fontSize: "12px" }}>
                  {from?.name}.{edge.fromField} &rarr; {to?.name}.{edge.toField}
                </span>
                <span style={s.edgeTypeLabel}>{edge.type}</span>
                <button style={s.edgeDeleteBtn} onClick={() => deleteEdge(edge.id)}>x</button>
              </div>
            );
          })}
        </aside>
      </div>

      {/* Node edit modal */}
      {editingNode && (
        <div style={s.modalOverlay} onClick={() => setEditingNode(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={s.modalTitle}>Edit Entity</h2>
            <label style={s.label}>Name</label>
            <input
              style={s.input}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <h3 style={{ fontSize: "14px", fontWeight: 600, margin: "12px 0 8px" }}>Fields</h3>
            {editFields.map((f, idx) => (
              <div key={idx} style={s.editFieldRow}>
                <input
                  style={{ ...s.input, width: "120px", marginBottom: 0 }}
                  value={f.name}
                  onChange={(e) =>
                    setEditFields((prev) =>
                      prev.map((fi, i) => (i === idx ? { ...fi, name: e.target.value } : fi))
                    )
                  }
                />
                <select
                  style={s.select}
                  value={f.type}
                  onChange={(e) =>
                    setEditFields((prev) =>
                      prev.map((fi, i) => (i === idx ? { ...fi, type: e.target.value } : fi))
                    )
                  }
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <label style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "2px" }}>
                  <input type="checkbox" checked={f.primaryKey} onChange={() => toggleFieldProp(idx, "primaryKey")} />
                  PK
                </label>
                <label style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "2px" }}>
                  <input type="checkbox" checked={f.unique} onChange={() => toggleFieldProp(idx, "unique")} />
                  U
                </label>
                <label style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "2px" }}>
                  <input type="checkbox" checked={f.nullable} onChange={() => toggleFieldProp(idx, "nullable")} />
                  Null
                </label>
                <button style={s.removeFieldBtn} onClick={() => removeField(idx)}>x</button>
              </div>
            ))}
            {/* Add new field */}
            <div style={s.editFieldRow}>
              <input
                style={{ ...s.input, width: "120px", marginBottom: 0 }}
                placeholder="Field name"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addField()}
              />
              <select
                style={s.select}
                value={newFieldType}
                onChange={(e) => setNewFieldType(e.target.value)}
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <button style={s.smallBtn} onClick={addField}>+ Add</button>
            </div>
            <div style={s.modalActions}>
              <button style={s.primaryBtn} onClick={saveEditNode}>Save</button>
              <button style={s.ghostBtn} onClick={() => setEditingNode(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* DDL Modal */}
      {showDDL && (
        <div style={s.modalOverlay} onClick={() => setShowDDL(false)}>
          <div style={{ ...s.modal, width: "600px" }} onClick={(e) => e.stopPropagation()}>
            <h2 style={s.modalTitle}>SQL DDL</h2>
            <pre style={s.ddlPre}>{generateDDL({ nodes, edges })}</pre>
            <div style={s.modalActions}>
              <button style={s.ghostBtn} onClick={() => setShowDDL(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const s: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  center: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    fontSize: "14px",
    color: "#888",
  },
  breadcrumb: { fontSize: "13px", padding: "12px 24px 0" },
  breadcrumbLink: { color: "#1a73e8", textDecoration: "none" },
  breadcrumbSep: { margin: "0 6px", color: "#999" },
  breadcrumbCurrent: { color: "#333", fontWeight: 500 },
  toolbar: {
    display: "flex",
    gap: "6px",
    padding: "8px 24px",
    borderBottom: "1px solid #e0e0e0",
    alignItems: "center",
    flexShrink: 0,
    backgroundColor: "#f8f9fa",
  },
  toolBtn: {
    padding: "6px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 500,
  },
  edgeForm: {
    display: "flex",
    gap: "6px",
    padding: "8px 24px",
    backgroundColor: "#e8f0fe",
    alignItems: "center",
    flexWrap: "wrap" as const,
  },
  workspace: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
  },
  canvas: {
    flex: 1,
    position: "relative" as const,
    overflow: "auto",
    backgroundColor: "#fafafa",
    minHeight: "600px",
  },
  edgeSvg: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none" as const,
    overflow: "visible" as const,
  },
  nodeCard: {
    position: "absolute" as const,
    width: "240px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
    cursor: "grab",
    userSelect: "none" as const,
  },
  nodeHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 10px",
    backgroundColor: "#1a73e8",
    borderRadius: "8px 8px 0 0",
    color: "#fff",
  },
  nodeName: { fontSize: "13px", fontWeight: 600 },
  nodeDeleteBtn: {
    background: "none",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: "13px",
    opacity: 0.8,
  },
  fieldRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "4px 10px",
    borderBottom: "1px solid #f1f3f4",
    fontSize: "12px",
  },
  fieldType: { color: "#888", fontSize: "11px" },
  editNodeBtn: {
    display: "block",
    width: "100%",
    padding: "6px",
    border: "none",
    backgroundColor: "transparent",
    color: "#1a73e8",
    cursor: "pointer",
    fontSize: "11px",
    textAlign: "center" as const,
  },
  sidebar: {
    width: "260px",
    borderLeft: "1px solid #e0e0e0",
    padding: "12px",
    overflow: "auto",
    flexShrink: 0,
  },
  sidebarTitle: {
    fontSize: "13px",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    color: "#888",
    margin: "0 0 8px",
    letterSpacing: "0.5px",
  },
  emptyText: { fontSize: "12px", color: "#aaa" },
  edgeItem: {
    display: "flex",
    gap: "4px",
    alignItems: "center",
    padding: "6px 0",
    borderBottom: "1px solid #f1f3f4",
  },
  edgeTypeLabel: {
    fontSize: "10px",
    backgroundColor: "#e8f0fe",
    padding: "1px 6px",
    borderRadius: "3px",
    color: "#1a73e8",
    marginLeft: "auto",
  },
  edgeDeleteBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#d93025",
    fontSize: "12px",
  },
  editFieldRow: {
    display: "flex",
    gap: "6px",
    alignItems: "center",
    marginBottom: "6px",
    flexWrap: "wrap" as const,
  },
  removeFieldBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#d93025",
    fontSize: "14px",
    padding: "2px 4px",
  },
  input: {
    display: "block",
    width: "100%",
    padding: "8px 10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "13px",
    marginBottom: "8px",
    boxSizing: "border-box" as const,
  },
  select: {
    padding: "6px 8px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "12px",
  },
  label: { fontSize: "12px", color: "#555", display: "block", marginBottom: "4px", fontWeight: 500 },
  primaryBtn: {
    padding: "8px 16px",
    backgroundColor: "#1a73e8",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
  },
  smallBtn: {
    padding: "4px 10px",
    backgroundColor: "#1a73e8",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  ghostBtn: {
    padding: "8px 16px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "13px",
    color: "#555",
  },
  modalOverlay: {
    position: "fixed" as const,
    inset: "0",
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "24px",
    width: "520px",
    maxWidth: "90vw",
    maxHeight: "80vh",
    overflow: "auto",
  },
  modalTitle: { margin: "0 0 16px", fontSize: "18px", fontWeight: 600 },
  modalActions: { display: "flex", gap: "8px", marginTop: "12px" },
  ddlPre: {
    backgroundColor: "#f5f5f5",
    padding: "12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontFamily: "var(--font-geist-mono), monospace",
    overflow: "auto",
    maxHeight: "400px",
    whiteSpace: "pre-wrap" as const,
  },
};
