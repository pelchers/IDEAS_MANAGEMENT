"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import rough from "roughjs";

/* ══════════════════════════════════════════════════════════════════════
   Types
   ══════════════════════════════════════════════════════════════════════ */

interface SchemaField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  unique: boolean;
  isPK: boolean;
  isFK: boolean;
  fkTarget?: string;
  defaultValue?: string;
  autoIncrement?: boolean;
  indexed?: boolean;
}

interface SchemaEntity {
  id: string;
  name: string;
  fields: SchemaField[];
  x: number;
  y: number;
}

type OnDeleteAction = "CASCADE" | "SET NULL" | "RESTRICT" | "NO ACTION" | "SET DEFAULT";

interface SchemaRelation {
  id: string;
  fromEntityId: string;
  toEntityId: string;
  type: "1:1" | "1:N" | "N:N";
  fkFieldName?: string;
  onDelete?: OnDeleteAction;
}

interface SchemaGraph {
  entities: SchemaEntity[];
  relations: SchemaRelation[];
  source?: { type: "manual" | "github" | "local"; githubRepo?: string; importedAt?: string };
}

type ModalMode = null | "addEntity" | "editEntity" | "addField" | "editField" | "addRelation" | "import" | "export";
type ImportTab = "github" | "local";

const FIELD_TYPES = ["string", "int", "bigint", "smallint", "serial", "bigserial", "float", "decimal", "boolean", "datetime", "date", "time", "timestamptz", "text", "uuid", "enum", "array", "json", "bytes"];

/* ══════════════════════════════════════════════════════════════════════
   Utilities
   ══════════════════════════════════════════════════════════════════════ */

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function badgeFor(f: SchemaField): "pk" | "fk" | "unique" | null {
  if (f.isPK) return "pk";
  if (f.isFK) return "fk";
  if (f.unique) return "unique";
  return null;
}

function badgeClasses(badge: "pk" | "fk" | "unique"): string {
  switch (badge) {
    case "pk": return "bg-watermelon text-white";
    case "fk": return "bg-malachite";
    case "unique": return "bg-creamy-milk";
  }
}

function badgeLabel(badge: "pk" | "fk" | "unique"): string {
  switch (badge) {
    case "pk": return "PK";
    case "fk": return "FK";
    case "unique": return "UQ";
  }
}

/* ══════════════════════════════════════════════════════════════════════
   Parsers
   ══════════════════════════════════════════════════════════════════════ */

function parsePrismaSchema(text: string): SchemaEntity[] {
  const entities: SchemaEntity[] = [];
  const modelRegex = /model\s+(\w+)\s*\{([^}]+)\}/g;
  let match;
  let idx = 0;
  while ((match = modelRegex.exec(text)) !== null) {
    const name = match[1];
    const body = match[2];
    const fields: SchemaField[] = [];
    for (const line of body.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("@@")) continue;
      const fMatch = trimmed.match(/^(\w+)\s+(\S+)/);
      if (!fMatch) continue;
      const fName = fMatch[1];
      let fType = fMatch[2].replace("?", "").replace("[]", "");
      // Map Prisma types
      const typeMap: Record<string, string> = { String: "string", Int: "int", Float: "float", Boolean: "boolean", DateTime: "datetime", Json: "json", BigInt: "int", Decimal: "float", Bytes: "string" };
      fType = typeMap[fType] || fType.toLowerCase();
      const isPK = /@id\b/.test(trimmed);
      const isUnique = /@unique\b/.test(trimmed);
      const isFK = /@relation\b/.test(trimmed);
      const isRequired = !fMatch[2].includes("?");
      // Skip relation fields (type is another model name not in our type list and has @relation)
      if (isFK && !FIELD_TYPES.includes(fType)) continue;
      fields.push({ id: uid(), name: fName, type: fType, required: isRequired, unique: isUnique || isPK, isPK, isFK, fkTarget: isFK ? undefined : undefined });
    }
    if (fields.length > 0) {
      entities.push({ id: uid(), name, fields, x: 40 + (idx % 3) * 340, y: 40 + Math.floor(idx / 3) * 300 });
      idx++;
    }
  }
  return entities;
}

function parseTypeScript(text: string): SchemaEntity[] {
  const entities: SchemaEntity[] = [];
  const blockRegex = /(?:interface|type)\s+(\w+)\s*(?:=\s*)?\{([^}]+)\}/g;
  let match;
  let idx = 0;
  while ((match = blockRegex.exec(text)) !== null) {
    const name = match[1];
    const body = match[2];
    const fields: SchemaField[] = [];
    for (const line of body.split("\n")) {
      const trimmed = line.trim().replace(/;$/, "").replace(/,$/, "");
      if (!trimmed || trimmed.startsWith("//")) continue;
      const fMatch = trimmed.match(/^(\w+)(\?)?:\s*(.+)/);
      if (!fMatch) continue;
      const fName = fMatch[1];
      const optional = !!fMatch[2];
      let fType = fMatch[3].trim();
      const typeMap: Record<string, string> = { string: "string", number: "int", boolean: "boolean", Date: "datetime", any: "json", object: "json" };
      fType = typeMap[fType] || (fType.endsWith("[]") ? "array" : fType.toLowerCase());
      fields.push({ id: uid(), name: fName, type: fType, required: !optional, unique: false, isPK: fName === "id", isFK: false });
    }
    if (fields.length > 0) {
      entities.push({ id: uid(), name, fields, x: 40 + (idx % 3) * 340, y: 40 + Math.floor(idx / 3) * 300 });
      idx++;
    }
  }
  return entities;
}

function parseSql(text: string): SchemaEntity[] {
  const entities: SchemaEntity[] = [];
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["`]?(\w+)["`]?\s*\(([^;]+)\)/gi;
  let match;
  let idx = 0;
  while ((match = tableRegex.exec(text)) !== null) {
    const name = match[1];
    const body = match[2];
    const fields: SchemaField[] = [];
    for (const line of body.split(",")) {
      const trimmed = line.trim();
      if (!trimmed || /^\s*(PRIMARY\s+KEY|FOREIGN\s+KEY|CONSTRAINT|UNIQUE|INDEX|CHECK)\b/i.test(trimmed)) continue;
      const fMatch = trimmed.match(/^["`]?(\w+)["`]?\s+(\w+)/i);
      if (!fMatch) continue;
      const fName = fMatch[1];
      let fType = fMatch[2].toUpperCase();
      const typeMap: Record<string, string> = { VARCHAR: "string", TEXT: "string", CHAR: "string", INTEGER: "int", INT: "int", BIGINT: "int", SMALLINT: "int", SERIAL: "int", FLOAT: "float", DOUBLE: "float", DECIMAL: "float", NUMERIC: "float", REAL: "float", BOOLEAN: "boolean", BOOL: "boolean", TIMESTAMP: "datetime", TIMESTAMPTZ: "datetime", DATE: "datetime", TIME: "datetime", JSON: "json", JSONB: "json", UUID: "string", BYTEA: "string" };
      fType = typeMap[fType] || fType.toLowerCase();
      const isPK = /PRIMARY\s+KEY/i.test(trimmed);
      const isUnique = /UNIQUE/i.test(trimmed);
      const notNull = /NOT\s+NULL/i.test(trimmed);
      const isFK = /REFERENCES/i.test(trimmed);
      fields.push({ id: uid(), name: fName, type: fType, required: notNull || isPK, unique: isUnique || isPK, isPK, isFK });
    }
    if (fields.length > 0) {
      entities.push({ id: uid(), name: name.toUpperCase(), fields, x: 40 + (idx % 3) * 340, y: 40 + Math.floor(idx / 3) * 300 });
      idx++;
    }
  }
  return entities;
}

function parseFile(fileName: string, content: string): SchemaEntity[] {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (ext === "prisma") return parsePrismaSchema(content);
  if (["ts", "tsx"].includes(ext)) return parseTypeScript(content);
  if (ext === "sql") return parseSql(content);
  if (ext === "json") {
    try {
      const obj = JSON.parse(content);
      if (Array.isArray(obj.entities)) return obj.entities;
    } catch { /* ignore */ }
  }
  return [];
}

/* ══════════════════════════════════════════════════════════════════════
   Export Generators
   ══════════════════════════════════════════════════════════════════════ */

function exportPrisma(graph: SchemaGraph): string {
  const lines: string[] = [];
  for (const entity of graph.entities) {
    lines.push(`model ${entity.name} {`);
    for (const f of entity.fields) {
      const typeMap: Record<string, string> = { string: "String", int: "Int", bigint: "BigInt", smallint: "Int", serial: "Int", bigserial: "BigInt", float: "Float", decimal: "Decimal", boolean: "Boolean", datetime: "DateTime", date: "DateTime", time: "DateTime", timestamptz: "DateTime", text: "String", uuid: "String", json: "Json", bytes: "Bytes", array: "String[]", enum: "String" };
      const pType = typeMap[f.type] || "String";
      const mods: string[] = [];
      if (f.isPK && f.autoIncrement) mods.push("@id @default(autoincrement())");
      else if (f.isPK && f.type === "uuid") mods.push("@id @default(uuid())");
      else if (f.isPK) mods.push("@id @default(cuid())");
      if (f.unique && !f.isPK) mods.push("@unique");
      if (f.defaultValue) mods.push(`@default(${f.defaultValue})`);
      if (f.autoIncrement && !f.isPK) mods.push("@default(autoincrement())");
      const optional = !f.required && !f.isPK ? "?" : "";
      lines.push(`  ${f.name}  ${pType}${optional}${mods.length ? "  " + mods.join(" ") : ""}`);
    }
    // Add relation fields from graph.relations
    const rels = graph.relations.filter((r) => r.fromEntityId === entity.id || r.toEntityId === entity.id);
    for (const rel of rels) {
      const fromEntity = graph.entities.find((e) => e.id === rel.fromEntityId);
      const toEntity = graph.entities.find((e) => e.id === rel.toEntityId);
      if (!fromEntity || !toEntity) continue;
      if (rel.toEntityId === entity.id) {
        // This entity is the "to" side — add the relation model field
        const fkName = rel.fkFieldName || `${fromEntity.name.toLowerCase()}Id`;
        const onDel = rel.onDelete ? `, onDelete: ${rel.onDelete}` : "";
        // Check if fkName already exists as a field (auto-created)
        const hasFk = entity.fields.some((f) => f.name === fkName);
        if (!hasFk) {
          lines.push(`  ${fkName}  String`);
        }
        lines.push(`  ${fromEntity.name.toLowerCase()}  ${fromEntity.name}  @relation(fields: [${fkName}], references: [id]${onDel})`);
      } else if (rel.fromEntityId === entity.id) {
        // This entity is the "from" side — add the reverse relation
        const isMany = rel.type === "1:N" || rel.type === "N:N";
        if (isMany) {
          lines.push(`  ${toEntity.name.toLowerCase()}s  ${toEntity.name}[]`);
        } else {
          lines.push(`  ${toEntity.name.toLowerCase()}  ${toEntity.name}?`);
        }
      }
    }
    lines.push("}");
    lines.push("");
  }
  return lines.join("\n");
}

function exportSql(graph: SchemaGraph): string {
  const lines: string[] = [];
  const indexLines: string[] = [];

  for (const entity of graph.entities) {
    const tableName = entity.name.toLowerCase().replace(/\s+/g, "_");
    lines.push(`CREATE TABLE ${tableName} (`);
    const colLines: string[] = [];

    for (const f of entity.fields) {
      const typeMap: Record<string, string> = { string: "VARCHAR(255)", int: "INTEGER", bigint: "BIGINT", smallint: "SMALLINT", serial: "SERIAL", bigserial: "BIGSERIAL", float: "REAL", decimal: "DECIMAL(10,2)", boolean: "BOOLEAN", datetime: "TIMESTAMP", date: "DATE", time: "TIME", timestamptz: "TIMESTAMPTZ", text: "TEXT", uuid: "UUID", json: "JSONB", bytes: "BYTEA", array: "TEXT[]", enum: "VARCHAR(50)" };
      const sType = typeMap[f.type] || "TEXT";
      const parts = [`  ${f.name} ${sType}`];
      if (f.isPK) parts.push("PRIMARY KEY");
      if (f.unique && !f.isPK) parts.push("UNIQUE");
      if (f.required && !f.isPK) parts.push("NOT NULL");
      if (f.defaultValue) parts.push(`DEFAULT ${f.defaultValue}`);
      colLines.push(parts.join(" "));

      // Track indexes
      if (f.indexed && !f.isPK && !f.unique) {
        indexLines.push(`CREATE INDEX idx_${tableName}_${f.name} ON ${tableName} (${f.name});`);
      }
    }

    // Foreign key constraints from relations where this entity is the "to" side
    const fkRels = graph.relations.filter((r) => r.toEntityId === entity.id);
    for (const rel of fkRels) {
      const fromEntity = graph.entities.find((e) => e.id === rel.fromEntityId);
      if (!fromEntity) continue;
      const fkName = rel.fkFieldName || `${fromEntity.name.toLowerCase()}_id`;
      const refTable = fromEntity.name.toLowerCase().replace(/\s+/g, "_");
      const onDel = rel.onDelete || "CASCADE";
      // Add FK column if not already in fields
      const hasFk = entity.fields.some((f) => f.name === fkName || f.name === fkName.replace(/_/g, ""));
      if (!hasFk) {
        colLines.push(`  ${fkName} VARCHAR(255) NOT NULL`);
      }
      colLines.push(`  CONSTRAINT fk_${tableName}_${fkName} FOREIGN KEY (${fkName}) REFERENCES ${refTable}(id) ON DELETE ${onDel}`);
      indexLines.push(`CREATE INDEX idx_${tableName}_${fkName} ON ${tableName} (${fkName});`);
    }

    lines.push(colLines.join(",\n"));
    lines.push(");");
    lines.push("");
  }

  // Append indexes
  if (indexLines.length > 0) {
    lines.push("-- Indexes");
    lines.push(...indexLines);
    lines.push("");
  }

  return lines.join("\n");
}

function exportJson(graph: SchemaGraph): string {
  return JSON.stringify(graph, null, 2);
}

/* ══════════════════════════════════════════════════════════════════════
   GitHub API helpers
   ══════════════════════════════════════════════════════════════════════ */

interface GhTreeItem { path: string; type: string; url: string }

async function fetchGhTree(repo: string): Promise<GhTreeItem[]> {
  const res = await fetch(`https://api.github.com/repos/${repo}/git/trees/HEAD?recursive=1`);
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data = await res.json();
  return (data.tree || []).filter((t: GhTreeItem) => t.type === "blob");
}

async function fetchGhFile(repo: string, path: string): Promise<string> {
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`);
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data = await res.json();
  return atob(data.content.replace(/\n/g, ""));
}

const PARSEABLE_EXTS = ["prisma", "ts", "tsx", "sql", "json"];

function isParseableFile(path: string): boolean {
  const ext = path.split(".").pop()?.toLowerCase() || "";
  return PARSEABLE_EXTS.includes(ext);
}

/* ══════════════════════════════════════════════════════════════════════
   Component
   ══════════════════════════════════════════════════════════════════════ */

export default function SchemaPage() {
  const params = useParams();
  const projectId = String(params.id);
  const svgRef = useRef<SVGSVGElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // ── Core state ──
  const [graph, setGraph] = useState<SchemaGraph>({ entities: [], relations: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Modal state ──
  const [modal, setModal] = useState<ModalMode>(null);
  const [editEntityId, setEditEntityId] = useState<string | null>(null);
  const [editFieldEntityId, setEditFieldEntityId] = useState<string | null>(null);
  const [editFieldId, setEditFieldId] = useState<string | null>(null);

  // ── Form state ──
  const [formEntityName, setFormEntityName] = useState("");
  const [formFieldName, setFormFieldName] = useState("");
  const [formFieldType, setFormFieldType] = useState("string");
  const [formFieldRequired, setFormFieldRequired] = useState(true);
  const [formFieldUnique, setFormFieldUnique] = useState(false);
  const [formFieldPK, setFormFieldPK] = useState(false);
  const [formFieldFK, setFormFieldFK] = useState(false);
  const [formFieldDefault, setFormFieldDefault] = useState("");
  const [formFieldAutoInc, setFormFieldAutoInc] = useState(false);
  const [formFieldIndexed, setFormFieldIndexed] = useState(false);
  const [formRelFrom, setFormRelFrom] = useState("");
  const [formRelTo, setFormRelTo] = useState("");
  const [formRelType, setFormRelType] = useState<"1:1" | "1:N" | "N:N">("1:N");

  // ── Import state ──
  const [importTab, setImportTab] = useState<ImportTab>("github");
  const [ghRepoInput, setGhRepoInput] = useState("");
  const [ghTree, setGhTree] = useState<GhTreeItem[]>([]);
  const [ghSelected, setGhSelected] = useState<Set<string>>(new Set());
  const [ghLoading, setGhLoading] = useState(false);
  const [ghError, setGhError] = useState("");
  const [importMsg, setImportMsg] = useState("");

  // ── Export state ──
  const [exportFormat, setExportFormat] = useState<"prisma" | "sql" | "json">("prisma");
  const [exportContent, setExportContent] = useState("");

  // ── Hover state for entity actions ──
  const [hoverEntityId, setHoverEntityId] = useState<string | null>(null);
  const [hoverFieldKey, setHoverFieldKey] = useState<string | null>(null);

  /* ── Load schema from artifact API ── */
  useEffect(() => {
    fetch(`/api/projects/${projectId}/artifacts/schema/schema.graph.json`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.artifact?.content) {
          const c = data.artifact.content;
          if (Array.isArray(c.entities) && c.entities.length > 0) {
            setGraph({
              entities: c.entities,
              relations: c.relations || [],
              source: c.source,
            });
          }
        }
        // Also handle the old shape (data.content directly)
        if (data.ok && data.content && Array.isArray(data.content.entities) && data.content.entities.length > 0) {
          setGraph({
            entities: data.content.entities,
            relations: data.content.relations || [],
            source: data.content.source,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  /* ── Auto-save with debounce ── */
  const saveGraph = useCallback((g: SchemaGraph) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        await fetch(`/api/projects/${projectId}/artifacts/schema/schema.graph.json`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: g }),
        });
      } catch { /* silent */ }
      setSaving(false);
    }, 800);
  }, [projectId]);

  const updateGraph = useCallback((updater: (prev: SchemaGraph) => SchemaGraph) => {
    setGraph((prev) => {
      const next = updater(prev);
      saveGraph(next);
      return next;
    });
  }, [saveGraph]);

  /* ── Draw Rough.js relation lines ── */
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    if (graph.relations.length === 0) return;

    const rc = rough.svg(svg);
    const colors = ["#FF5E54", "#2BBF5D", "#A259FF", "#FFD93D", "#FF6D28"];

    for (let i = 0; i < graph.relations.length; i++) {
      const rel = graph.relations[i];
      const fromCard = cardRefs.current[rel.fromEntityId];
      const toCard = cardRefs.current[rel.toEntityId];
      // The SVG's offset parent is the .relative div
      const container = svg.closest(".relative");
      if (!fromCard || !toCard || !container) continue;

      const containerRect = container.getBoundingClientRect();
      const fromRect = fromCard.getBoundingClientRect();
      const toRect = toCard.getBoundingClientRect();

      // Draw from right edge of "from" card to left edge of "to" card (or bottom→top if stacked)
      const fx = fromRect.right - containerRect.left;
      const fy = fromRect.top + fromRect.height / 2 - containerRect.top;
      const tx = toRect.left - containerRect.left;
      const ty = toRect.top + toRect.height / 2 - containerRect.top;

      const color = colors[i % colors.length];

      svg.appendChild(rc.line(fx, fy, tx, ty, { roughness: 2, stroke: color, strokeWidth: 3 }));
      svg.appendChild(rc.circle(fx, fy, 12, { roughness: 1.5, stroke: "#282828", strokeWidth: 2, fill: color, fillStyle: "solid" }));
      svg.appendChild(rc.circle(tx, ty, 12, { roughness: 1.5, stroke: "#282828", strokeWidth: 2, fill: color, fillStyle: "solid" }));

      // Label
      const mx = (fx + tx) / 2;
      const my = (fy + ty) / 2;
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", String(mx));
      label.setAttribute("y", String(my - 8));
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("font-size", "11");
      label.setAttribute("font-family", "'IBM Plex Mono', monospace");
      label.setAttribute("font-weight", "700");
      label.setAttribute("fill", "#282828");
      label.textContent = rel.type;
      svg.appendChild(label);
    }
  }, [graph.relations, graph.entities]);

  /* ── Entity CRUD ── */
  const addEntity = () => {
    if (!formEntityName.trim()) return;
    updateGraph((g) => ({
      ...g,
      entities: [...g.entities, {
        id: uid(),
        name: formEntityName.trim().toUpperCase(),
        fields: [{ id: uid(), name: "id", type: "string", required: true, unique: true, isPK: true, isFK: false }],
        x: 40 + (g.entities.length % 3) * 340,
        y: 40 + Math.floor(g.entities.length / 3) * 300,
      }],
    }));
    setFormEntityName("");
    setModal(null);
  };

  const renameEntity = () => {
    if (!formEntityName.trim() || !editEntityId) return;
    updateGraph((g) => ({
      ...g,
      entities: g.entities.map((e) => e.id === editEntityId ? { ...e, name: formEntityName.trim().toUpperCase() } : e),
    }));
    setFormEntityName("");
    setEditEntityId(null);
    setModal(null);
  };

  const deleteEntity = (entityId: string) => {
    updateGraph((g) => ({
      ...g,
      entities: g.entities.filter((e) => e.id !== entityId),
      relations: g.relations.filter((r) => r.fromEntityId !== entityId && r.toEntityId !== entityId),
    }));
  };

  /* ── Field CRUD ── */
  const resetFieldForm = () => {
    setFormFieldName(""); setFormFieldType("string"); setFormFieldRequired(true);
    setFormFieldUnique(false); setFormFieldPK(false); setFormFieldFK(false);
    setFormFieldDefault(""); setFormFieldAutoInc(false); setFormFieldIndexed(false);
  };

  const addField = () => {
    if (!formFieldName.trim() || !editFieldEntityId) return;
    const newField: SchemaField = {
      id: uid(), name: formFieldName.trim(), type: formFieldType,
      required: formFieldRequired, unique: formFieldUnique || formFieldPK, isPK: formFieldPK, isFK: formFieldFK,
      defaultValue: formFieldDefault.trim() || undefined, autoIncrement: formFieldAutoInc || undefined, indexed: formFieldIndexed || undefined,
    };
    updateGraph((g) => ({
      ...g,
      entities: g.entities.map((e) => e.id === editFieldEntityId ? { ...e, fields: [...e.fields, newField] } : e),
    }));
    resetFieldForm();
    setEditFieldEntityId(null);
    setModal(null);
  };

  const saveEditField = () => {
    if (!formFieldName.trim() || !editFieldEntityId || !editFieldId) return;
    updateGraph((g) => ({
      ...g,
      entities: g.entities.map((e) => e.id === editFieldEntityId ? {
        ...e,
        fields: e.fields.map((f) => f.id === editFieldId ? {
          ...f, name: formFieldName.trim(), type: formFieldType,
          required: formFieldRequired, unique: formFieldUnique || formFieldPK, isPK: formFieldPK, isFK: formFieldFK,
          defaultValue: formFieldDefault.trim() || undefined, autoIncrement: formFieldAutoInc || undefined, indexed: formFieldIndexed || undefined,
        } : f),
      } : e),
    }));
    resetFieldForm();
    setEditFieldEntityId(null);
    setEditFieldId(null);
    setModal(null);
  };

  const deleteField = (entityId: string, fieldId: string) => {
    updateGraph((g) => ({
      ...g,
      entities: g.entities.map((e) => e.id === entityId ? { ...e, fields: e.fields.filter((f) => f.id !== fieldId) } : e),
    }));
  };

  // ── Relation form extras ──
  const [formRelOnDelete, setFormRelOnDelete] = useState<OnDeleteAction>("CASCADE");
  const [formRelFkName, setFormRelFkName] = useState("");

  /* ── Relation CRUD ── */
  const addRelation = () => {
    if (!formRelFrom || !formRelTo || formRelFrom === formRelTo) return;
    updateGraph((g) => {
      const fromEntity = g.entities.find((e) => e.id === formRelFrom);
      const toEntity = g.entities.find((e) => e.id === formRelTo);
      if (!fromEntity || !toEntity) return g;

      const fkFieldName = formRelFkName.trim() || `${fromEntity.name.toLowerCase()}Id`;
      const newRelation: SchemaRelation = {
        id: uid(), fromEntityId: formRelFrom, toEntityId: formRelTo,
        type: formRelType, fkFieldName, onDelete: formRelOnDelete,
      };

      // Auto-create FK field on the "to" entity if it doesn't exist
      const hasFk = toEntity.fields.some((f) => f.name === fkFieldName);
      let updatedEntities = g.entities;
      if (!hasFk) {
        const fkField: SchemaField = {
          id: uid(), name: fkFieldName, type: "string",
          required: true, unique: false, isPK: false, isFK: true,
          fkTarget: `${fromEntity.name}.id`, indexed: true,
        };
        updatedEntities = g.entities.map((e) =>
          e.id === formRelTo ? { ...e, fields: [...e.fields, fkField] } : e
        );
      }

      return { ...g, entities: updatedEntities, relations: [...g.relations, newRelation] };
    });
    setFormRelFrom("");
    setFormRelTo("");
    setFormRelFkName("");
    setModal(null);
  };

  const deleteRelation = (relId: string) => {
    updateGraph((g) => ({ ...g, relations: g.relations.filter((r) => r.id !== relId) }));
  };

  /* ── GitHub import ── */
  const handleGhFetchTree = async () => {
    const repo = ghRepoInput.trim().replace(/^https?:\/\/github\.com\//, "").replace(/\/$/, "").replace(/\.git$/, "");
    if (!repo || !repo.includes("/")) { setGhError("Enter owner/repo (e.g. prisma/prisma)"); return; }
    setGhLoading(true); setGhError(""); setGhTree([]); setGhSelected(new Set());
    try {
      const tree = await fetchGhTree(repo);
      const parseable = tree.filter((t) => isParseableFile(t.path));
      setGhTree(parseable);
      if (parseable.length === 0) setGhError("No parseable schema files found (.prisma, .ts, .sql, .json)");
    } catch (err) {
      setGhError(err instanceof Error ? err.message : "Failed to fetch repository");
    }
    setGhLoading(false);
  };

  const handleGhImport = async () => {
    if (ghSelected.size === 0) return;
    setGhLoading(true); setImportMsg("");
    const repo = ghRepoInput.trim().replace(/^https?:\/\/github\.com\//, "").replace(/\/$/, "").replace(/\.git$/, "");
    let imported: SchemaEntity[] = [];
    try {
      for (const path of ghSelected) {
        const content = await fetchGhFile(repo, path);
        const fileName = path.split("/").pop() || path;
        const parsed = parseFile(fileName, content);
        imported = imported.concat(parsed);
      }
      if (imported.length === 0) { setImportMsg("No entities found in selected files."); setGhLoading(false); return; }
      // Merge: skip entities with duplicate names
      updateGraph((g) => {
        const existingNames = new Set(g.entities.map((e) => e.name.toUpperCase()));
        const newEntities = imported.filter((e) => !existingNames.has(e.name.toUpperCase()));
        // Reposition new entities after existing ones
        const offset = g.entities.length;
        const positioned = newEntities.map((e, i) => ({ ...e, x: 40 + ((offset + i) % 3) * 340, y: 40 + Math.floor((offset + i) / 3) * 300 }));
        return { ...g, entities: [...g.entities, ...positioned], source: { type: "github" as const, githubRepo: repo, importedAt: new Date().toISOString() } };
      });
      setImportMsg(`Imported ${imported.length} entities from GitHub.`);
    } catch (err) {
      setGhError(err instanceof Error ? err.message : "Import failed");
    }
    setGhLoading(false);
  };

  /* ── Local file import ── */
  const handleLocalFileImport = (files: FileList | null) => {
    if (!files) return;
    setImportMsg("");
    let imported: SchemaEntity[] = [];
    let processed = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        const parsed = parseFile(file.name, content);
        imported = imported.concat(parsed);
        processed++;
        if (processed === files.length) {
          if (imported.length === 0) { setImportMsg("No entities found in uploaded files."); return; }
          updateGraph((g) => {
            const existingNames = new Set(g.entities.map((e) => e.name.toUpperCase()));
            const newEntities = imported.filter((e) => !existingNames.has(e.name.toUpperCase()));
            const offset = g.entities.length;
            const positioned = newEntities.map((e, j) => ({ ...e, x: 40 + ((offset + j) % 3) * 340, y: 40 + Math.floor((offset + j) / 3) * 300 }));
            return { ...g, entities: [...g.entities, ...positioned], source: { type: "local" as const, importedAt: new Date().toISOString() } };
          });
          setImportMsg(`Imported ${imported.length} entities from ${files.length} file(s).`);
        }
      };
      reader.readAsText(file);
    }
  };

  /* ── Export ── */
  const openExport = (fmt: "prisma" | "sql" | "json") => {
    setExportFormat(fmt);
    let content = "";
    if (fmt === "prisma") content = exportPrisma(graph);
    else if (fmt === "sql") content = exportSql(graph);
    else content = exportJson(graph);
    setExportContent(content);
    setModal("export");
  };

  const copyExport = () => { navigator.clipboard.writeText(exportContent); };

  const downloadExport = () => {
    const ext = exportFormat === "prisma" ? "prisma" : exportFormat === "sql" ? "sql" : "json";
    const blob = new Blob([exportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `schema.${ext}`;
    a.click(); URL.revokeObjectURL(url);
  };

  /* ── Render ── */
  if (loading) {
    return (
      <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
        <h1 className="nb-view-title">SCHEMA PLANNER</h1>
        <div className="nb-card p-8 text-center font-mono text-[0.85rem] uppercase mt-6">Loading...</div>
      </div>
    );
  }

  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      {/* View header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="nb-view-title">SCHEMA PLANNER</h1>
          {saving && <span className="font-mono text-[0.7rem] text-[#999] uppercase">Saving...</span>}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="nb-btn" onClick={() => setModal("import")}>IMPORT</button>
          <div className="flex gap-1">
            <button className="nb-btn" onClick={() => openExport("prisma")}>PRISMA</button>
            <button className="nb-btn" onClick={() => openExport("sql")}>SQL</button>
            <button className="nb-btn" onClick={() => openExport("json")}>JSON</button>
          </div>
          <button className="nb-btn nb-btn--primary" onClick={() => { setFormEntityName(""); setModal("addEntity"); }}>+ ADD ENTITY</button>
          {graph.entities.length >= 2 && (
            <button className="nb-btn" onClick={() => { setFormRelFrom(graph.entities[0]?.id || ""); setFormRelTo(graph.entities[1]?.id || ""); setFormRelType("1:N"); setModal("addRelation"); }}>+ ADD RELATION</button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {graph.entities.length === 0 && (
        <div className="nb-card p-12 text-center">
          <div className="font-mono text-[2rem] mb-4">[ ]</div>
          <div className="font-mono text-[0.9rem] uppercase text-[#999] mb-6">No entities yet. Create one or import from GitHub / local files.</div>
          <div className="flex gap-3 justify-center flex-wrap">
            <button className="nb-btn nb-btn--primary" onClick={() => { setFormEntityName(""); setModal("addEntity"); }}>+ ADD ENTITY</button>
            <button className="nb-btn" onClick={() => setModal("import")}>IMPORT SCHEMA</button>
          </div>
        </div>
      )}

      {/* Entity cards grid */}
      <div className="relative">
        <div
          className="grid gap-6 mb-6"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
        >
          {graph.entities.map((entity) => (
            <div
              key={entity.id}
              ref={(el) => { cardRefs.current[entity.id] = el; }}
              className="border-4 border-signal-black shadow-nb bg-white overflow-hidden transition-transform duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px]"
              onMouseEnter={() => setHoverEntityId(entity.id)}
              onMouseLeave={() => { setHoverEntityId(null); setHoverFieldKey(null); }}
            >
              {/* Entity header */}
              <div className="bg-signal-black text-creamy-milk px-4 py-3 font-bold text-base uppercase tracking-[0.1em] flex items-center justify-between">
                <span>{entity.name}</span>
                {hoverEntityId === entity.id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditEntityId(entity.id); setFormEntityName(entity.name); setModal("editEntity"); }}
                      className="text-[0.7rem] px-2 py-0.5 bg-creamy-milk text-signal-black border-2 border-creamy-milk font-bold uppercase cursor-pointer hover:bg-white"
                      title="Rename"
                    >REN</button>
                    <button
                      onClick={() => deleteEntity(entity.id)}
                      className="text-[0.7rem] px-2 py-0.5 bg-watermelon text-white border-2 border-watermelon font-bold uppercase cursor-pointer hover:opacity-80"
                      title="Delete"
                    >DEL</button>
                  </div>
                )}
              </div>

              {/* Fields list */}
              <ul className="list-none p-2">
                {entity.fields.map((field, idx) => {
                  const badge = badgeFor(field);
                  const fieldKey = `${entity.id}:${field.id}`;
                  return (
                    <li
                      key={field.id}
                      className={`flex items-center gap-2 px-2 py-2 font-mono text-[0.85rem] group ${
                        idx < entity.fields.length - 1 ? "border-b border-dashed border-black/15" : ""
                      }`}
                      onMouseEnter={() => setHoverFieldKey(fieldKey)}
                      onMouseLeave={() => setHoverFieldKey(null)}
                    >
                      <code className="font-semibold">{field.name}</code>
                      <span className="text-[0.7rem] text-gray-mid uppercase ml-auto">{field.type}</span>
                      {field.autoIncrement && <span className="text-[0.55rem] font-bold px-1 py-0 border border-signal-black uppercase bg-lemon/30">AUTO</span>}
                      {field.indexed && !field.isPK && !field.unique && <span className="text-[0.55rem] font-bold px-1 py-0 border border-signal-black uppercase bg-cornflower/20">IDX</span>}
                      {badge && (
                        <span className={`text-[0.6rem] font-bold px-[5px] py-[1px] border-2 border-signal-black uppercase ${badgeClasses(badge)}`}>
                          {badgeLabel(badge)}
                        </span>
                      )}
                      {field.isFK && field.fkTarget && (
                        <span className="text-[0.55rem] text-malachite font-bold">{field.fkTarget}</span>
                      )}
                      {hoverFieldKey === fieldKey && (
                        <div className="flex gap-1 ml-1">
                          <button
                            onClick={() => {
                              setEditFieldEntityId(entity.id); setEditFieldId(field.id);
                              setFormFieldName(field.name); setFormFieldType(field.type);
                              setFormFieldRequired(field.required); setFormFieldUnique(field.unique);
                              setFormFieldPK(field.isPK); setFormFieldFK(field.isFK);
                              setFormFieldDefault(field.defaultValue || ""); setFormFieldAutoInc(!!field.autoIncrement); setFormFieldIndexed(!!field.indexed);
                              setModal("editField");
                            }}
                            className="text-[0.6rem] px-1 bg-creamy-milk border border-signal-black cursor-pointer font-bold"
                            title="Edit field"
                          >E</button>
                          <button
                            onClick={() => deleteField(entity.id, field.id)}
                            className="text-[0.6rem] px-1 bg-watermelon text-white border border-signal-black cursor-pointer font-bold"
                            title="Delete field"
                          >X</button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* Add field button */}
              <div className="px-2 pb-2">
                <button
                  className="w-full py-1.5 border-2 border-dashed border-signal-black/30 font-mono text-[0.75rem] uppercase text-[#999] hover:border-signal-black hover:text-signal-black cursor-pointer bg-transparent transition-colors"
                  onClick={() => { setEditFieldEntityId(entity.id); resetFieldForm(); setModal("addField"); }}
                >
                  + ADD FIELD
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Relations list */}
        {graph.relations.length > 0 && (
          <div className="mb-4">
            <h3 className="font-bold text-[0.8rem] uppercase tracking-wider mb-2">RELATIONS</h3>
            <div className="flex flex-wrap gap-2">
              {graph.relations.map((rel) => {
                const from = graph.entities.find((e) => e.id === rel.fromEntityId);
                const to = graph.entities.find((e) => e.id === rel.toEntityId);
                return (
                  <div key={rel.id} className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-signal-black bg-white font-mono text-[0.75rem] uppercase">
                    <span className="font-bold">{from?.name || "?"}</span>
                    <span className="text-watermelon font-bold">{rel.type}</span>
                    <span className="font-bold">{to?.name || "?"}</span>
                    {rel.onDelete && rel.onDelete !== "CASCADE" && <span className="text-[0.6rem] text-[#999]">ON DEL: {rel.onDelete}</span>}
                    {rel.fkFieldName && <span className="text-[0.6rem] text-malachite">FK: {rel.fkFieldName}</span>}
                    <button
                      onClick={() => deleteRelation(rel.id)}
                      className="ml-1 text-watermelon font-bold cursor-pointer hover:opacity-70"
                    >X</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Rough.js relation SVG — overlays cards */}
        {graph.relations.length > 0 && (
          <svg ref={svgRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 10 }} data-testid="schema-relations-svg" />
        )}
      </div>

      {/* ══════════════════════════════════════════════════
          MODALS
          ══════════════════════════════════════════════════ */}
      {modal && (
        <div
          onClick={() => setModal(null)}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: "#FFFFFF", border: "4px solid #282828", boxShadow: "8px 8px 0px #282828", padding: "24px", width: "90%", maxWidth: "600px", maxHeight: "85vh", overflow: "auto" }}
          >
            {/* ── Add Entity ── */}
            {modal === "addEntity" && (
              <>
                <h2 className="font-bold text-[1.1rem] uppercase tracking-wider mb-4">ADD ENTITY</h2>
                <form onSubmit={(e) => { e.preventDefault(); addEntity(); }} className="flex flex-col gap-4">
                  <div>
                    <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">ENTITY NAME</label>
                    <input className="nb-input w-full" value={formEntityName} onChange={(e) => setFormEntityName(e.target.value)} placeholder="e.g. Users" autoFocus />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="nb-btn nb-btn--primary">CREATE</button>
                    <button type="button" className="nb-btn" onClick={() => setModal(null)}>CANCEL</button>
                  </div>
                </form>
              </>
            )}

            {/* ── Edit Entity (rename) ── */}
            {modal === "editEntity" && (
              <>
                <h2 className="font-bold text-[1.1rem] uppercase tracking-wider mb-4">RENAME ENTITY</h2>
                <form onSubmit={(e) => { e.preventDefault(); renameEntity(); }} className="flex flex-col gap-4">
                  <div>
                    <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">ENTITY NAME</label>
                    <input className="nb-input w-full" value={formEntityName} onChange={(e) => setFormEntityName(e.target.value)} autoFocus />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="nb-btn nb-btn--primary">SAVE</button>
                    <button type="button" className="nb-btn" onClick={() => setModal(null)}>CANCEL</button>
                  </div>
                </form>
              </>
            )}

            {/* ── Add Field ── */}
            {(modal === "addField" || modal === "editField") && (
              <>
                <h2 className="font-bold text-[1.1rem] uppercase tracking-wider mb-4">{modal === "addField" ? "ADD FIELD" : "EDIT FIELD"}</h2>
                <form onSubmit={(e) => { e.preventDefault(); modal === "addField" ? addField() : saveEditField(); }} className="flex flex-col gap-4">
                  <div>
                    <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">FIELD NAME</label>
                    <input className="nb-input w-full" value={formFieldName} onChange={(e) => setFormFieldName(e.target.value)} placeholder="e.g. email" autoFocus />
                  </div>
                  <div>
                    <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">TYPE</label>
                    <select className="nb-input w-full" value={formFieldType} onChange={(e) => setFormFieldType(e.target.value)}>
                      {FIELD_TYPES.map((t) => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { label: "REQUIRED", checked: formFieldRequired, set: setFormFieldRequired },
                      { label: "UNIQUE", checked: formFieldUnique, set: setFormFieldUnique },
                      { label: "PRIMARY KEY", checked: formFieldPK, set: setFormFieldPK },
                      { label: "FOREIGN KEY", checked: formFieldFK, set: setFormFieldFK },
                      { label: "AUTO INCREMENT", checked: formFieldAutoInc, set: setFormFieldAutoInc },
                      { label: "INDEXED", checked: formFieldIndexed, set: setFormFieldIndexed },
                    ].map((opt) => (
                      <label key={opt.label} className="flex items-center gap-2 font-mono text-[0.8rem] uppercase cursor-pointer">
                        <input type="checkbox" checked={opt.checked} onChange={(e) => opt.set(e.target.checked)} className="w-4 h-4" />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                  <div>
                    <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">DEFAULT VALUE (optional)</label>
                    <input className="nb-input w-full" value={formFieldDefault} onChange={(e) => setFormFieldDefault(e.target.value)} placeholder="e.g. 0, 'active', true, now()" />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="nb-btn nb-btn--primary">{modal === "addField" ? "ADD" : "SAVE"}</button>
                    <button type="button" className="nb-btn" onClick={() => setModal(null)}>CANCEL</button>
                  </div>
                </form>
              </>
            )}

            {/* ── Add Relation ── */}
            {modal === "addRelation" && (
              <>
                <h2 className="font-bold text-[1.1rem] uppercase tracking-wider mb-4">ADD RELATION</h2>
                <form onSubmit={(e) => { e.preventDefault(); addRelation(); }} className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">FROM</label>
                      <select className="nb-input w-full" value={formRelFrom} onChange={(e) => setFormRelFrom(e.target.value)}>
                        {graph.entities.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">TO</label>
                      <select className="nb-input w-full" value={formRelTo} onChange={(e) => setFormRelTo(e.target.value)}>
                        {graph.entities.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">TYPE</label>
                    <select className="nb-input w-full" value={formRelType} onChange={(e) => setFormRelType(e.target.value as "1:1" | "1:N" | "N:N")}>
                      <option value="1:1">1:1 (One to One)</option>
                      <option value="1:N">1:N (One to Many)</option>
                      <option value="N:N">N:N (Many to Many)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">ON DELETE</label>
                    <select className="nb-input w-full" value={formRelOnDelete} onChange={(e) => setFormRelOnDelete(e.target.value as OnDeleteAction)}>
                      <option value="CASCADE">CASCADE</option>
                      <option value="SET NULL">SET NULL</option>
                      <option value="RESTRICT">RESTRICT</option>
                      <option value="NO ACTION">NO ACTION</option>
                      <option value="SET DEFAULT">SET DEFAULT</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">FK FIELD NAME (auto-generated if blank)</label>
                    <input className="nb-input w-full" value={formRelFkName} onChange={(e) => setFormRelFkName(e.target.value)} placeholder={`e.g. ${graph.entities.find((e) => e.id === formRelFrom)?.name.toLowerCase() || "entity"}Id`} />
                  </div>
                  <p className="font-mono text-[0.7rem] text-[#999]">A FK field will be auto-created on the TO entity when you create this relation.</p>
                  <div className="flex gap-3">
                    <button type="submit" className="nb-btn nb-btn--primary">CREATE</button>
                    <button type="button" className="nb-btn" onClick={() => setModal(null)}>CANCEL</button>
                  </div>
                </form>
              </>
            )}

            {/* ── Import Modal ── */}
            {modal === "import" && (
              <>
                <h2 className="font-bold text-[1.1rem] uppercase tracking-wider mb-4">IMPORT SCHEMA</h2>

                {/* Tab bar */}
                <div className="flex gap-0 mb-4 border-b-4 border-signal-black">
                  {(["github", "local"] as ImportTab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => { setImportTab(tab); setGhError(""); setImportMsg(""); }}
                      className={`px-4 py-2 font-bold text-[0.85rem] uppercase tracking-wider border-2 border-signal-black border-b-0 cursor-pointer transition-colors ${
                        importTab === tab ? "bg-signal-black text-creamy-milk" : "bg-white text-signal-black hover:bg-gray-100"
                      }`}
                    >
                      {tab === "github" ? "GITHUB REPO" : "LOCAL FILES"}
                    </button>
                  ))}
                </div>

                {importMsg && (
                  <div className="p-3 border-2 border-signal-black font-mono text-[0.85rem] bg-malachite/20 text-malachite mb-4">{importMsg}</div>
                )}

                {/* GitHub tab */}
                {importTab === "github" && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">REPOSITORY (owner/repo)</label>
                      <div className="flex gap-2">
                        <input
                          className="nb-input flex-1"
                          value={ghRepoInput}
                          onChange={(e) => setGhRepoInput(e.target.value)}
                          placeholder="e.g. prisma/prisma or full GitHub URL"
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleGhFetchTree(); } }}
                        />
                        <button className="nb-btn nb-btn--primary" onClick={handleGhFetchTree} disabled={ghLoading}>
                          {ghLoading ? "..." : "FETCH"}
                        </button>
                      </div>
                    </div>
                    {ghError && <div className="p-3 border-2 border-signal-black font-mono text-[0.85rem] bg-watermelon/20 text-watermelon">{ghError}</div>}
                    {ghTree.length > 0 && (
                      <div>
                        <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-2 block">SELECT FILES TO PARSE ({ghSelected.size} selected)</label>
                        <div className="border-2 border-signal-black max-h-[250px] overflow-auto">
                          {ghTree.map((item) => (
                            <label
                              key={item.path}
                              className={`flex items-center gap-2 px-3 py-2 font-mono text-[0.8rem] cursor-pointer border-b border-dashed border-black/10 hover:bg-creamy-milk/50 ${ghSelected.has(item.path) ? "bg-malachite/10" : ""}`}
                            >
                              <input
                                type="checkbox"
                                checked={ghSelected.has(item.path)}
                                onChange={(e) => {
                                  const next = new Set(ghSelected);
                                  if (e.target.checked) next.add(item.path); else next.delete(item.path);
                                  setGhSelected(next);
                                }}
                                className="w-4 h-4"
                              />
                              <span>{item.path}</span>
                            </label>
                          ))}
                        </div>
                        <button className="nb-btn nb-btn--primary mt-3" onClick={handleGhImport} disabled={ghLoading || ghSelected.size === 0}>
                          {ghLoading ? "IMPORTING..." : `IMPORT ${ghSelected.size} FILE(S)`}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Local tab */}
                {importTab === "local" && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">UPLOAD SCHEMA FILES</label>
                      <p className="font-mono text-[0.75rem] text-[#999] mb-2">Supported: .prisma, .ts, .tsx, .sql, .json</p>
                      <input
                        type="file"
                        accept=".prisma,.ts,.tsx,.sql,.json"
                        multiple
                        onChange={(e) => handleLocalFileImport(e.target.files)}
                        className="nb-input w-full cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button className="nb-btn" onClick={() => setModal(null)}>CLOSE</button>
                </div>
              </>
            )}

            {/* ── Export Modal ── */}
            {modal === "export" && (
              <>
                <h2 className="font-bold text-[1.1rem] uppercase tracking-wider mb-4">EXPORT — {exportFormat.toUpperCase()}</h2>
                <pre className="bg-[#1a1a1a] text-[#e8e0d5] p-4 border-2 border-signal-black font-mono text-[0.8rem] overflow-auto max-h-[400px] whitespace-pre-wrap">{exportContent}</pre>
                <div className="flex gap-3 mt-4">
                  <button className="nb-btn nb-btn--primary" onClick={copyExport}>COPY TO CLIPBOARD</button>
                  <button className="nb-btn" onClick={downloadExport}>DOWNLOAD .{exportFormat === "prisma" ? "prisma" : exportFormat}</button>
                  <button className="nb-btn" onClick={() => setModal(null)}>CLOSE</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
