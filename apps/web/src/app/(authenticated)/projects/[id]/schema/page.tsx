"use client";

import { useState, useEffect, use, useCallback, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SchemaField {
  id: string;
  name: string;
  type: "String" | "Number" | "Boolean" | "Date" | "JSON" | "Relation";
  required: boolean;
  unique: boolean;
  relatedEntity?: string; // only used when type === "Relation"
}

interface SchemaEntity {
  id: string;
  name: string;
  fields: SchemaField[];
}

interface SchemaData {
  entities: SchemaEntity[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function uid(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const FIELD_TYPES: SchemaField["type"][] = [
  "String",
  "Number",
  "Boolean",
  "Date",
  "JSON",
  "Relation",
];

const TYPE_COLORS: Record<SchemaField["type"], string> = {
  String: "var(--nb-cornflower)",
  Number: "var(--nb-amethyst)",
  Boolean: "var(--nb-malachite)",
  Date: "var(--nb-lemon)",
  JSON: "var(--nb-gray-mid)",
  Relation: "var(--nb-watermelon)",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SchemaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);

  const [entities, setEntities] = useState<SchemaEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Expanded entity (for editing)
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Inline add-entity
  const [showAddEntity, setShowAddEntity] = useState(false);
  const [newEntityName, setNewEntityName] = useState("");

  // Edit entity name
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState("");

  // Add field form per entity
  const [addFieldEntityId, setAddFieldEntityId] = useState<string | null>(null);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<SchemaField["type"]>("String");
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldRelated, setNewFieldRelated] = useState("");

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const artifactUrl = `/api/projects/${projectId}/artifacts/schema/schema.json`;

  /* ---------- Debounced save ---------- */

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback(
    async (data: SchemaData) => {
      setSaving(true);
      try {
        await fetch(artifactUrl, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content: data }),
        });
      } catch {
        // silently fail
      } finally {
        setSaving(false);
      }
    },
    [artifactUrl]
  );

  const debouncedPersist = useCallback(
    (data: SchemaData) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => persist(data), 500);
    },
    [persist]
  );

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  /* ---------- Load ---------- */

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(artifactUrl, { credentials: "include" });
        if (res.ok) {
          const json = await res.json();
          // API returns { ok, artifact: { content: ... } }
          const data: SchemaData = json.artifact?.content ?? json;
          setEntities(data.entities ?? []);
        } else if (res.status === 404) {
          setEntities([]);
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

  /* ---------- Update helper ---------- */

  function updateEntities(next: SchemaEntity[]) {
    setEntities(next);
    debouncedPersist({ entities: next });
  }

  /* ---------- Entity operations ---------- */

  function addEntity() {
    const name = newEntityName.trim();
    if (!name) return;
    const entity: SchemaEntity = {
      id: uid(),
      name,
      fields: [],
    };
    updateEntities([...entities, entity]);
    setNewEntityName("");
    setShowAddEntity(false);
    setExpandedId(entity.id);
  }

  function deleteEntity(entityId: string) {
    updateEntities(entities.filter((e) => e.id !== entityId));
    setDeleteConfirmId(null);
    if (expandedId === entityId) setExpandedId(null);
  }

  function saveEntityName(entityId: string) {
    const trimmed = editNameValue.trim();
    if (!trimmed) {
      setEditingNameId(null);
      return;
    }
    updateEntities(
      entities.map((e) => (e.id === entityId ? { ...e, name: trimmed } : e))
    );
    setEditingNameId(null);
  }

  /* ---------- Field operations ---------- */

  function addField(entityId: string) {
    const name = newFieldName.trim();
    if (!name) return;
    const field: SchemaField = {
      id: uid(),
      name,
      type: newFieldType,
      required: newFieldRequired,
      unique: false,
      ...(newFieldType === "Relation" ? { relatedEntity: newFieldRelated || undefined } : {}),
    };
    updateEntities(
      entities.map((e) =>
        e.id === entityId ? { ...e, fields: [...e.fields, field] } : e
      )
    );
    setNewFieldName("");
    setNewFieldType("String");
    setNewFieldRequired(false);
    setNewFieldRelated("");
  }

  function deleteField(entityId: string, fieldId: string) {
    updateEntities(
      entities.map((e) =>
        e.id === entityId
          ? { ...e, fields: e.fields.filter((f) => f.id !== fieldId) }
          : e
      )
    );
  }

  function toggleFieldProp(entityId: string, fieldId: string, prop: "required" | "unique") {
    updateEntities(
      entities.map((e) =>
        e.id === entityId
          ? {
              ...e,
              fields: e.fields.map((f) =>
                f.id === fieldId ? { ...f, [prop]: !f[prop] } : f
              ),
            }
          : e
      )
    );
  }

  /* ---------- Render ---------- */

  if (loading) {
    return (
      <div className="nb-loading nb-loading-pulse" style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "14px", textTransform: "uppercase", fontWeight: 700 }}>Loading schema planner...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nb-page" style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="nb-alert nb-alert-error" style={{ maxWidth: "400px", textAlign: "center" }}>
          <div style={{ fontWeight: 900, fontFamily: "var(--font-heading)", textTransform: "uppercase", marginBottom: "var(--space-sm)" }}>
            Error
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nb-page" style={{ minHeight: "100vh", padding: "0 24px 48px" }}>
      {/* Breadcrumb */}
      <nav style={{ fontFamily: "var(--font-mono)", fontSize: "13px", padding: "12px 0 0", textTransform: "uppercase" }}>
        <a href="/dashboard" style={{ color: "var(--nb-black)", textDecoration: "none", fontWeight: 700 }}>Dashboard</a>
        <span style={{ margin: "0 6px", color: "var(--nb-gray-mid)" }}>/</span>
        <a href={`/projects/${projectId}`} style={{ color: "var(--nb-black)", textDecoration: "none", fontWeight: 700 }}>Project</a>
        <span style={{ margin: "0 6px", color: "var(--nb-gray-mid)" }}>/</span>
        <span style={{ color: "var(--nb-gray-dark)" }}>Schema Planner</span>
      </nav>

      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 0 12px",
        borderBottom: "4px solid var(--nb-black)",
        marginBottom: "24px",
      }}>
        <h1 style={{
          fontFamily: "var(--font-heading)",
          fontSize: "28px",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          margin: 0,
        }}>
          Schema Planner
        </h1>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {saving && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--nb-gray-mid)", textTransform: "uppercase" }}>
              Saving...
            </span>
          )}
          <button
            className="nb-btn nb-btn-primary"
            onClick={() => {
              setShowAddEntity(true);
              setNewEntityName("");
            }}
          >
            + Add Entity
          </button>
        </div>
      </div>

      {/* Add entity inline form */}
      {showAddEntity && (
        <div style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          marginBottom: "20px",
          padding: "12px",
          border: "4px solid var(--nb-black)",
          boxShadow: "var(--shadow-brutal)",
          background: "var(--nb-white)",
        }}>
          <input
            className="nb-input"
            style={{ flex: 1, marginBottom: 0 }}
            placeholder="Entity name (e.g. User, Post, Comment)"
            value={newEntityName}
            onChange={(e) => setNewEntityName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addEntity()}
            autoFocus
          />
          <button className="nb-btn nb-btn-primary nb-btn-sm" onClick={addEntity}>
            Create
          </button>
          <button className="nb-btn nb-btn-secondary nb-btn-sm" onClick={() => setShowAddEntity(false)}>
            Cancel
          </button>
        </div>
      )}

      {/* Empty state */}
      {entities.length === 0 && !showAddEntity && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px",
          border: "4px dashed var(--nb-black)",
          background: "var(--nb-white)",
          textAlign: "center",
        }}>
          <div style={{
            fontFamily: "var(--font-heading)",
            fontSize: "20px",
            fontWeight: 800,
            textTransform: "uppercase",
            marginBottom: "12px",
          }}>
            No entities defined
          </div>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            color: "var(--nb-gray-mid)",
            marginBottom: "20px",
          }}>
            Start designing your data schema by adding entities
          </div>
          <button
            className="nb-btn nb-btn-primary"
            onClick={() => {
              setShowAddEntity(true);
              setNewEntityName("");
            }}
          >
            + Add First Entity
          </button>
        </div>
      )}

      {/* Entity cards grid */}
      <div className="schema-grid">
        {entities.map((entity) => {
          const isExpanded = expandedId === entity.id;
          const isEditingName = editingNameId === entity.id;
          const isDeleting = deleteConfirmId === entity.id;
          const isAddingField = addFieldEntityId === entity.id;

          return (
            <div key={entity.id} className="schema-entity">
              {/* Entity header */}
              <div
                className="schema-entity-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => setExpandedId(isExpanded ? null : entity.id)}
              >
                {isEditingName ? (
                  <input
                    style={{
                      background: "transparent",
                      border: "none",
                      borderBottom: "2px solid var(--nb-malachite)",
                      color: "var(--nb-malachite)",
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700,
                      fontSize: "1rem",
                      letterSpacing: "0.1em",
                      outline: "none",
                      width: "60%",
                    }}
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEntityName(entity.id);
                      if (e.key === "Escape") setEditingNameId(null);
                    }}
                    onBlur={() => saveEntityName(entity.id)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                ) : (
                  <span
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setEditingNameId(entity.id);
                      setEditNameValue(entity.name);
                    }}
                    title="Double-click to rename"
                  >
                    {entity.name}
                  </span>
                )}
                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                  <span style={{
                    fontSize: "11px",
                    fontFamily: "var(--font-mono)",
                    color: "var(--nb-malachite)",
                    opacity: 0.7,
                  }}>
                    {entity.fields.length} field{entity.fields.length !== 1 ? "s" : ""}
                  </span>
                  {!isEditingName && (
                    <button
                      style={{
                        background: "none",
                        border: "2px solid var(--nb-malachite)",
                        color: "var(--nb-malachite)",
                        cursor: "pointer",
                        padding: "0 6px",
                        fontSize: "14px",
                        fontWeight: 900,
                        lineHeight: "20px",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isDeleting) {
                          deleteEntity(entity.id);
                        } else {
                          setDeleteConfirmId(entity.id);
                        }
                      }}
                      title={isDeleting ? "Click to confirm deletion" : "Delete entity"}
                    >
                      {isDeleting ? "Confirm?" : "\u00d7"}
                    </button>
                  )}
                </div>
              </div>

              {/* Fields list */}
              <ul className="schema-fields">
                {entity.fields.length === 0 && (
                  <li style={{ color: "var(--nb-gray-mid)", fontStyle: "italic", fontSize: "0.8rem" }}>
                    No fields yet
                  </li>
                )}
                {entity.fields.map((field) => (
                  <li key={field.id}>
                    <code style={{ fontWeight: field.required ? 700 : 400 }}>{field.name}</code>
                    <span
                      className="field-type"
                      style={{
                        color: TYPE_COLORS[field.type],
                        fontWeight: 600,
                      }}
                    >
                      {field.type}
                    </span>
                    {field.required && (
                      <span className="field-badge field-badge--pk" style={{ background: "var(--nb-watermelon)", color: "var(--nb-white)" }}>
                        REQ
                      </span>
                    )}
                    {field.unique && (
                      <span className="field-badge field-badge--unique">
                        UQ
                      </span>
                    )}
                    {field.type === "Relation" && field.relatedEntity && (
                      <span className="field-badge field-badge--fk" title={`References ${field.relatedEntity}`}>
                        &rarr; {field.relatedEntity}
                      </span>
                    )}
                    {isExpanded && (
                      <div style={{ display: "flex", gap: "4px", marginLeft: "auto" }}>
                        <button
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "10px",
                            fontFamily: "var(--font-mono)",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            color: field.required ? "var(--nb-watermelon)" : "var(--nb-gray-mid)",
                            textDecoration: "underline",
                          }}
                          onClick={() => toggleFieldProp(entity.id, field.id, "required")}
                          title="Toggle required"
                        >
                          {field.required ? "REQ" : "opt"}
                        </button>
                        <button
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "10px",
                            fontFamily: "var(--font-mono)",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            color: field.unique ? "var(--nb-cornflower)" : "var(--nb-gray-mid)",
                            textDecoration: "underline",
                          }}
                          onClick={() => toggleFieldProp(entity.id, field.id, "unique")}
                          title="Toggle unique"
                        >
                          {field.unique ? "UQ" : "nu"}
                        </button>
                        <button
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--nb-watermelon)",
                            fontWeight: 900,
                            fontSize: "14px",
                            padding: "0 2px",
                            lineHeight: 1,
                          }}
                          onClick={() => deleteField(entity.id, field.id)}
                          title="Delete field"
                        >
                          &times;
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              {/* Expanded: add field form */}
              {isExpanded && (
                <div style={{
                  padding: "8px 12px 12px",
                  borderTop: "2px solid var(--nb-black)",
                  background: "var(--nb-cream)",
                }}>
                  {isAddingField ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <input
                        className="nb-input"
                        style={{ marginBottom: 0, fontSize: "13px" }}
                        placeholder="Field name"
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            addField(entity.id);
                          }
                          if (e.key === "Escape") {
                            setAddFieldEntityId(null);
                            setNewFieldName("");
                          }
                        }}
                        autoFocus
                      />
                      <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                        <select
                          className="nb-select"
                          style={{ fontSize: "12px", padding: "4px 8px" }}
                          value={newFieldType}
                          onChange={(e) => setNewFieldType(e.target.value as SchemaField["type"])}
                        >
                          {FIELD_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        <label style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "3px",
                          fontFamily: "var(--font-mono)",
                          fontSize: "11px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          cursor: "pointer",
                        }}>
                          <input
                            type="checkbox"
                            checked={newFieldRequired}
                            onChange={(e) => setNewFieldRequired(e.target.checked)}
                          />
                          Required
                        </label>
                      </div>
                      {newFieldType === "Relation" && (
                        <select
                          className="nb-select"
                          style={{ fontSize: "12px", padding: "4px 8px" }}
                          value={newFieldRelated}
                          onChange={(e) => setNewFieldRelated(e.target.value)}
                        >
                          <option value="">Select related entity...</option>
                          {entities
                            .filter((e) => e.id !== entity.id)
                            .map((e) => (
                              <option key={e.id} value={e.name}>{e.name}</option>
                            ))}
                        </select>
                      )}
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          className="nb-btn nb-btn-primary nb-btn-sm"
                          style={{ fontSize: "12px" }}
                          onClick={() => addField(entity.id)}
                        >
                          + Add Field
                        </button>
                        <button
                          className="nb-btn nb-btn-secondary nb-btn-sm"
                          style={{ fontSize: "12px" }}
                          onClick={() => {
                            setAddFieldEntityId(null);
                            setNewFieldName("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        className="nb-btn nb-btn-info nb-btn-sm"
                        style={{ fontSize: "12px", flex: 1 }}
                        onClick={() => {
                          setAddFieldEntityId(entity.id);
                          setNewFieldName("");
                          setNewFieldType("String");
                          setNewFieldRequired(false);
                          setNewFieldRelated("");
                        }}
                      >
                        + Add Field
                      </button>
                      <button
                        className="nb-btn nb-btn-secondary nb-btn-sm"
                        style={{ fontSize: "12px" }}
                        onClick={() => {
                          setEditingNameId(entity.id);
                          setEditNameValue(entity.name);
                        }}
                      >
                        Rename
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Relationships summary (text-based) */}
      {entities.some((e) => e.fields.some((f) => f.type === "Relation" && f.relatedEntity)) && (
        <div style={{
          marginTop: "32px",
          padding: "16px",
          border: "4px solid var(--nb-black)",
          boxShadow: "var(--shadow-brutal)",
          background: "var(--nb-white)",
        }}>
          <h2 style={{
            fontFamily: "var(--font-heading)",
            fontSize: "16px",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "12px",
          }}>
            Relationships
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {entities.flatMap((entity) =>
              entity.fields
                .filter((f) => f.type === "Relation" && f.relatedEntity)
                .map((field) => (
                  <div
                    key={`${entity.id}-${field.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px 10px",
                      borderBottom: "2px solid var(--nb-cream)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "13px",
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>{entity.name}</span>
                    <span style={{ color: "var(--nb-gray-mid)" }}>.{field.name}</span>
                    <span style={{ color: "var(--nb-watermelon)", fontWeight: 800 }}>&rarr;</span>
                    <span style={{ fontWeight: 700 }}>{field.relatedEntity}</span>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
