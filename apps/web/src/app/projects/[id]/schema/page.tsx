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
      <div className="nb-loading" style={{ height: "100vh" }}>
        Loading schema planner...
      </div>
    );
  }

  if (error) {
    return (
      <div className="nb-loading" style={{ height: "100vh", color: "var(--nb-watermelon)" }}>
        {error}
      </div>
    );
  }

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="nb-page" style={{ height: "100vh", overflow: "hidden" }}>
      {/* Breadcrumb */}
      <nav style={{ fontFamily: "var(--font-mono)", fontSize: "13px", padding: "12px 24px 0", textTransform: "uppercase" }}>
        <a href="/dashboard" style={{ color: "var(--nb-black)", textDecoration: "none", fontWeight: 700 }}>Dashboard</a>
        <span style={{ margin: "0 6px", color: "var(--nb-gray-mid)" }}>/</span>
        <a href={`/projects/${projectId}`} style={{ color: "var(--nb-black)", textDecoration: "none", fontWeight: 700 }}>Project</a>
        <span style={{ margin: "0 6px", color: "var(--nb-gray-mid)" }}>/</span>
        <span style={{ color: "var(--nb-gray-dark)" }}>Schema Planner</span>
      </nav>

      {/* Toolbar */}
      <div className="nb-flex" style={{ gap: "6px", padding: "8px 24px", borderBottom: "4px solid var(--nb-black)", alignItems: "center", flexShrink: 0, backgroundColor: "var(--nb-cream)" }}>
        <button className="nb-btn nb-btn-primary" onClick={addNode}>+ Add Entity</button>
        <button className="nb-btn nb-btn-info" onClick={() => setAddingEdge(!addingEdge)}>
          {addingEdge ? "Cancel Edge" : "+ Add Relationship"}
        </button>
        <div style={{ flex: 1 }} />
        <button className="nb-btn nb-btn-secondary" onClick={downloadJSON}>Export JSON</button>
        <button className="nb-btn nb-btn-accent" onClick={() => setShowDDL(true)}>Export SQL</button>
      </div>

      {/* Edge creation form */}
      {addingEdge && (
        <div className="nb-flex nb-flex-wrap" style={{ gap: "6px", padding: "8px 24px", backgroundColor: "var(--nb-cornflower)", alignItems: "center", borderBottom: "4px solid var(--nb-black)" }}>
          <select className="nb-select" value={edgeFromNodeId} onChange={(e) => setEdgeFromNodeId(e.target.value)}>
            <option value="">From table...</option>
            {nodes.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>
          <select className="nb-select" value={edgeFromField} onChange={(e) => setEdgeFromField(e.target.value)}>
            <option value="">From field...</option>
            {nodes.find((n) => n.id === edgeFromNodeId)?.fields.map((f) => (
              <option key={f.name} value={f.name}>{f.name}</option>
            ))}
          </select>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "16px", fontWeight: 900, color: "var(--nb-black)" }}>&rarr;</span>
          <select className="nb-select" value={edgeToNodeId} onChange={(e) => setEdgeToNodeId(e.target.value)}>
            <option value="">To table...</option>
            {nodes.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>
          <select className="nb-select" value={edgeToField} onChange={(e) => setEdgeToField(e.target.value)}>
            <option value="">To field...</option>
            {nodes.find((n) => n.id === edgeToNodeId)?.fields.map((f) => (
              <option key={f.name} value={f.name}>{f.name}</option>
            ))}
          </select>
          <select className="nb-select" value={edgeType} onChange={(e) => setEdgeType(e.target.value as SchemaEdge["type"])}>
            <option value="one-to-one">1:1</option>
            <option value="one-to-many">1:N</option>
            <option value="many-to-many">N:N</option>
          </select>
          <button className="nb-btn nb-btn-primary nb-btn-sm" onClick={handleAddEdge}>Create</button>
        </div>
      )}

      {/* Canvas + sidebar layout */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Canvas */}
        <div
          style={{
            flex: 1,
            position: "relative",
            overflow: "auto",
            backgroundColor: "var(--nb-cream)",
            minHeight: "600px",
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={() => setSelectedNodeId(null)}
        >
          {/* SVG edges */}
          <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}>
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
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--nb-black)" strokeWidth={3} />
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 6}
                    textAnchor="middle"
                    fontSize="12"
                    fill="var(--nb-black)"
                    fontWeight="800"
                    fontFamily="var(--font-mono)"
                  >
                    {label}
                  </text>
                  <rect x={x1 - 5} y={y1 - 5} width={10} height={10} fill="var(--nb-black)" />
                  <rect x={x2 - 5} y={y2 - 5} width={10} height={10} fill="var(--nb-black)" />
                </g>
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <div
              key={node.id}
              className="nb-card"
              style={{
                position: "absolute",
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: "240px",
                cursor: "grab",
                userSelect: "none",
                border: selectedNodeId === node.id ? "4px solid var(--nb-watermelon)" : "4px solid var(--nb-black)",
                boxShadow: selectedNodeId === node.id ? "6px 6px 0px var(--nb-watermelon)" : "var(--shadow-brutal)",
                padding: 0,
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
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 10px",
                backgroundColor: "var(--nb-watermelon)",
                color: "var(--nb-white)",
                borderBottom: "4px solid var(--nb-black)",
              }}>
                <span style={{ fontSize: "13px", fontWeight: 800, fontFamily: "var(--font-heading)", textTransform: "uppercase" }}>{node.name}</span>
                <button
                  className="nb-btn nb-btn-sm"
                  style={{ background: "none", border: "2px solid var(--nb-white)", color: "var(--nb-white)", padding: "2px 6px", fontSize: "11px" }}
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
                <div key={f.name} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "4px 10px",
                  borderBottom: "2px solid var(--nb-black)",
                  fontSize: "12px",
                }}>
                  <span className="nb-label" style={{ fontWeight: f.primaryKey ? 800 : 500, margin: 0, letterSpacing: 0 }}>
                    {f.primaryKey && "PK "}
                    {f.unique && !f.primaryKey && "U "}
                    {f.name}
                  </span>
                  <span className="nb-tag" style={{ fontSize: "10px", padding: "1px 4px" }}>{f.type}</span>
                </div>
              ))}
              <button
                className="nb-btn nb-btn-info nb-btn-sm"
                style={{ display: "block", width: "100%", border: "none", borderTop: "2px solid var(--nb-black)" }}
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
        <aside style={{
          width: "260px",
          borderLeft: "4px solid var(--nb-black)",
          padding: "12px",
          overflow: "auto",
          flexShrink: 0,
          backgroundColor: "var(--nb-white)",
        }}>
          <h3 className="nb-label" style={{ fontSize: "13px", margin: "0 0 8px" }}>Relationships</h3>
          {edges.length === 0 && (
            <div className="nb-empty" style={{ padding: "12px", fontSize: "12px" }}>No relationships yet</div>
          )}
          {edges.map((edge) => {
            const from = nodes.find((n) => n.id === edge.fromNodeId);
            const to = nodes.find((n) => n.id === edge.toNodeId);
            return (
              <div key={edge.id} style={{
                display: "flex",
                gap: "4px",
                alignItems: "center",
                padding: "6px 0",
                borderBottom: "2px solid var(--nb-black)",
              }}>
                <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)" }}>
                  {from?.name}.{edge.fromField} &rarr; {to?.name}.{edge.toField}
                </span>
                <span className="nb-badge nb-badge-cornflower" style={{ marginLeft: "auto", fontSize: "10px" }}>{edge.type}</span>
                <button
                  className="nb-btn nb-btn-sm"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--nb-watermelon)", fontWeight: 900, fontSize: "14px", padding: "0 4px" }}
                  onClick={() => deleteEdge(edge.id)}
                >
                  x
                </button>
              </div>
            );
          })}
        </aside>
      </div>

      {/* Node edit modal */}
      {editingNode && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setEditingNode(null)}
        >
          <div
            className="nb-card"
            style={{ width: "520px", maxWidth: "90vw", maxHeight: "80vh", overflow: "auto", padding: "24px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: 800, fontFamily: "var(--font-heading)", textTransform: "uppercase" }}>Edit Entity</h2>
            <label className="nb-label">Name</label>
            <input
              className="nb-input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <h3 style={{ fontSize: "14px", fontWeight: 800, fontFamily: "var(--font-heading)", textTransform: "uppercase", margin: "12px 0 8px" }}>Fields</h3>
            {editFields.map((f, idx) => (
              <div key={idx} className="nb-flex nb-flex-wrap" style={{ gap: "6px", alignItems: "center", marginBottom: "6px" }}>
                <input
                  className="nb-input"
                  style={{ width: "120px", marginBottom: 0 }}
                  value={f.name}
                  onChange={(e) =>
                    setEditFields((prev) =>
                      prev.map((fi, i) => (i === idx ? { ...fi, name: e.target.value } : fi))
                    )
                  }
                />
                <select
                  className="nb-select"
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
                <label style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase", fontWeight: 700 }}>
                  <input type="checkbox" checked={f.primaryKey} onChange={() => toggleFieldProp(idx, "primaryKey")} />
                  PK
                </label>
                <label style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase", fontWeight: 700 }}>
                  <input type="checkbox" checked={f.unique} onChange={() => toggleFieldProp(idx, "unique")} />
                  U
                </label>
                <label style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase", fontWeight: 700 }}>
                  <input type="checkbox" checked={f.nullable} onChange={() => toggleFieldProp(idx, "nullable")} />
                  Null
                </label>
                <button
                  className="nb-btn nb-btn-sm"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--nb-watermelon)", fontSize: "16px", fontWeight: 900, padding: "2px 4px" }}
                  onClick={() => removeField(idx)}
                >
                  x
                </button>
              </div>
            ))}
            {/* Add new field */}
            <div className="nb-flex nb-flex-wrap" style={{ gap: "6px", alignItems: "center", marginBottom: "6px" }}>
              <input
                className="nb-input"
                style={{ width: "120px", marginBottom: 0 }}
                placeholder="Field name"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addField()}
              />
              <select
                className="nb-select"
                value={newFieldType}
                onChange={(e) => setNewFieldType(e.target.value)}
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <button className="nb-btn nb-btn-success nb-btn-sm" onClick={addField}>+ Add</button>
            </div>
            <div className="nb-form-actions">
              <button className="nb-btn nb-btn-primary" onClick={saveEditNode}>Save</button>
              <button className="nb-btn nb-btn-secondary" onClick={() => setEditingNode(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* DDL Modal */}
      {showDDL && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowDDL(false)}
        >
          <div
            className="nb-card"
            style={{ width: "600px", maxWidth: "90vw", maxHeight: "80vh", overflow: "auto", padding: "24px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: 800, fontFamily: "var(--font-heading)", textTransform: "uppercase" }}>SQL DDL</h2>
            <pre style={{
              backgroundColor: "var(--nb-cream)",
              padding: "12px",
              border: "4px solid var(--nb-black)",
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
              overflow: "auto",
              maxHeight: "400px",
              whiteSpace: "pre-wrap",
              boxShadow: "var(--shadow-brutal)",
            }}>
              {generateDDL({ nodes, edges })}
            </pre>
            <div className="nb-form-actions">
              <button className="nb-btn nb-btn-secondary" onClick={() => setShowDDL(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
