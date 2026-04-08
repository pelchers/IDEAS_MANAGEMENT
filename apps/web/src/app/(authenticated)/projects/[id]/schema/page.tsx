"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAnyArtifactRefresh } from "@/hooks/use-artifact-refresh";
import { useParams } from "next/navigation";
import rough from "roughjs";
import { SchemaToolbar } from "@/components/schema/SchemaToolbar";
import { RelationLines } from "@/components/schema/RelationLines";
import { SchemaMinimap } from "@/components/schema/SchemaMinimap";
import { HEADER_COLORS } from "@/lib/schema-types";
import { autoLayout } from "@/lib/schema-layout";

/* ══════════════════════════════════════════════════════════════════════
   Types
   ══════════════════════════════════════════════════════════════════════ */

interface SchemaField {
  id: string;
  name: string;
  type: string;
  length?: number;          // varchar(n), char(n), bit(n)
  precision?: number;       // numeric(p,s)
  scale?: number;
  required: boolean;
  unique: boolean;
  isPK: boolean;
  isFK: boolean;
  fkTarget?: string;
  defaultValue?: string;
  autoIncrement?: boolean;
  indexed?: boolean;
  checkExpr?: string;
  comment?: string;
  isGenerated?: boolean;
  generatedExpr?: string;
  isIdentity?: boolean;
  identityType?: "ALWAYS" | "BY DEFAULT";
  collation?: string;
  arrayElementType?: string;
  indexType?: "BTREE" | "GIN" | "GIST" | "BRIN" | "HASH";
}

interface SchemaEntity {
  id: string;
  name: string;
  fields: SchemaField[];
  x: number;
  y: number;
  width?: number;
  headerColor?: string;
  collapsed?: boolean;
  schema?: string;
  comment?: string;
  isUnlogged?: boolean;
  compositePK?: string[];
  compositeUniques?: string[][];
  enableRLS?: boolean;
  inherits?: string;
  partitionBy?: string;
  partitionKey?: string;
}

interface CompositeType {
  id: string;
  name: string;
  fields: { name: string; type: string }[];
}

interface SchemaRole {
  id: string;
  name: string;
  login?: boolean;
  superuser?: boolean;
  createdb?: boolean;
  createrole?: boolean;
  inherit?: boolean;
  grants?: { target: string; privileges: string[] }[];
}

interface EnumType {
  id: string;
  name: string;
  values: string[];
  schema?: string;
}

interface DomainType {
  id: string;
  name: string;
  baseType: string;
  notNull?: boolean;
  defaultValue?: string;
  checkExpr?: string;
}

interface SchemaView {
  id: string;
  name: string;
  query: string;
  isMaterialized?: boolean;
  schema?: string;
  x: number;
  y: number;
}

interface SchemaSequence {
  id: string;
  name: string;
  dataType?: string;
  start?: number;
  increment?: number;
  minValue?: number;
  maxValue?: number;
  cycle?: boolean;
  ownedBy?: string;
}

interface SchemaFunction {
  id: string;
  name: string;
  params: string;
  returnType: string;
  language: string;
  body: string;
  volatility?: "IMMUTABLE" | "STABLE" | "VOLATILE";
  security?: "DEFINER" | "INVOKER";
}

interface SchemaTrigger {
  id: string;
  name: string;
  timing: "BEFORE" | "AFTER" | "INSTEAD OF";
  events: string[];
  tableName: string;
  forEach: "ROW" | "STATEMENT";
  functionName: string;
  whenExpr?: string;
}

interface SchemaPolicy {
  id: string;
  name: string;
  tableName: string;
  command: "ALL" | "SELECT" | "INSERT" | "UPDATE" | "DELETE";
  usingExpr?: string;
  checkExpr?: string;
  roles?: string[];
}

interface SchemaExtension {
  id: string;
  name: string;
  schema?: string;
}

interface SchemaIndex {
  id: string;
  name: string;
  tableName: string;
  columns: string[];
  type?: "BTREE" | "GIN" | "GIST" | "BRIN" | "HASH" | "SPGIST";
  isUnique?: boolean;
  whereClause?: string;
  includeColumns?: string[];
  expression?: string;
}

type OnDeleteAction = "CASCADE" | "SET NULL" | "RESTRICT" | "NO ACTION" | "SET DEFAULT";

interface SchemaRelation {
  id: string;
  fromEntityId: string;
  toEntityId: string;
  type: "1:1" | "1:N" | "N:N";
  fkFieldName?: string;
  fkColumns?: string[];    // composite FK: multiple columns
  refColumns?: string[];   // composite FK: referenced columns
  onDelete?: OnDeleteAction;
  onUpdate?: OnDeleteAction;
  constraintName?: string;
  isDeferrable?: boolean;
  isDeferred?: boolean;
}

interface SchemaGraph {
  entities: SchemaEntity[];
  relations: SchemaRelation[];
  enumTypes?: EnumType[];
  domainTypes?: DomainType[];
  compositeTypes?: CompositeType[];
  views?: SchemaView[];
  sequences?: SchemaSequence[];
  functions?: SchemaFunction[];
  triggers?: SchemaTrigger[];
  policies?: SchemaPolicy[];
  extensions?: SchemaExtension[];
  indexes?: SchemaIndex[];
  roles?: SchemaRole[];
  source?: { type: "manual" | "github" | "local"; githubRepo?: string; importedAt?: string };
}

type ModalMode = null | "addEntity" | "editEntity" | "addField" | "editField" | "addRelation" | "editRelation" | "import" | "export" | "addEnum" | "editEnum" | "addView" | "editView" | "addSequence" | "editSequence" | "addFunction" | "editFunction" | "addTrigger" | "editTrigger" | "addPolicy" | "editPolicy" | "addExtension" | "addIndex" | "editIndex" | "addDomain" | "editDomain" | "addCompositeType" | "editCompositeType" | "addRole" | "editRole";
type ImportTab = "github" | "local";

const FIELD_TYPES = [
  // Numeric
  "int", "bigint", "smallint", "serial", "bigserial", "float", "decimal", "numeric", "real", "double", "money",
  // Character
  "string", "varchar", "char", "text", "citext",
  // Boolean
  "boolean",
  // Date/Time
  "datetime", "timestamp", "timestamptz", "date", "time", "timetz", "interval",
  // Binary
  "bytes", "bytea",
  // UUID
  "uuid",
  // JSON
  "json", "jsonb",
  // Network
  "inet", "cidr", "macaddr",
  // Full-text
  "tsvector", "tsquery",
  // Range
  "int4range", "int8range", "numrange", "tsrange", "tstzrange", "daterange",
  // Other
  "array", "enum", "xml", "point", "line", "box", "polygon", "circle", "vector",
];

/* ══════════════════════════════════════════════════════════════════════
   Utilities
   ══════════════════════════════════════════════════════════════════════ */

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ── Cross-object linkage helpers ── */

function getEnumUsage(graph: SchemaGraph, enumName: string): string[] {
  const uses: string[] = [];
  for (const e of graph.entities) {
    for (const f of e.fields) {
      if (f.type.toLowerCase() === enumName.toLowerCase()) uses.push(`${e.name}.${f.name}`);
    }
  }
  return uses;
}

function getDomainUsage(graph: SchemaGraph, domainName: string): string[] {
  const uses: string[] = [];
  for (const e of graph.entities) {
    for (const f of e.fields) {
      if (f.type.toLowerCase() === domainName.toLowerCase()) uses.push(`${e.name}.${f.name}`);
    }
  }
  return uses;
}

function getCompositeTypeUsage(graph: SchemaGraph, typeName: string): string[] {
  const uses: string[] = [];
  for (const e of graph.entities) {
    for (const f of e.fields) {
      if (f.type.toLowerCase() === typeName.toLowerCase()) uses.push(`${e.name}.${f.name}`);
    }
  }
  return uses;
}

function getTableTriggerCount(graph: SchemaGraph, tableName: string): number {
  return (graph.triggers || []).filter((t) => t.tableName.toLowerCase() === tableName.toLowerCase()).length;
}

function getTableIndexCount(graph: SchemaGraph, tableName: string): number {
  return (graph.indexes || []).filter((i) => i.tableName.toLowerCase() === tableName.toLowerCase()).length;
}

function getTablePolicyCount(graph: SchemaGraph, tableName: string): number {
  return (graph.policies || []).filter((p) => p.tableName.toLowerCase() === tableName.toLowerCase()).length;
}

function getTableGrantCount(graph: SchemaGraph, tableName: string): number {
  return (graph.roles || []).reduce((count, r) => count + (r.grants || []).filter((g) => g.target.toLowerCase() === tableName.toLowerCase()).length, 0);
}

function getViewDependencies(query: string, entities: SchemaEntity[]): string[] {
  const tableNames = entities.map((e) => e.name.toLowerCase());
  const deps: string[] = [];
  const words = query.toLowerCase().replace(/[(),;]/g, " ").split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    if ((words[i] === "from" || words[i] === "join") && i + 1 < words.length) {
      const ref = words[i + 1];
      if (tableNames.includes(ref)) deps.push(ref.toUpperCase());
    }
  }
  return [...new Set(deps)];
}

function getTableDependents(graph: SchemaGraph, tableName: string): { type: string; name: string }[] {
  const tl = tableName.toLowerCase();
  const deps: { type: string; name: string }[] = [];
  for (const r of graph.relations) {
    const from = graph.entities.find((e) => e.id === r.fromEntityId);
    const to = graph.entities.find((e) => e.id === r.toEntityId);
    if (from?.name.toLowerCase() === tl || to?.name.toLowerCase() === tl) deps.push({ type: "relation", name: `${from?.name}→${to?.name}` });
  }
  for (const t of graph.triggers || []) { if (t.tableName.toLowerCase() === tl) deps.push({ type: "trigger", name: t.name }); }
  for (const p of graph.policies || []) { if (p.tableName.toLowerCase() === tl) deps.push({ type: "policy", name: p.name }); }
  for (const i of graph.indexes || []) { if (i.tableName.toLowerCase() === tl) deps.push({ type: "index", name: i.name }); }
  for (const v of graph.views || []) { if (getViewDependencies(v.query, graph.entities).includes(tableName.toUpperCase())) deps.push({ type: "view", name: v.name }); }
  for (const s of graph.sequences || []) { if (s.ownedBy?.toLowerCase().startsWith(tl + ".")) deps.push({ type: "sequence", name: s.name }); }
  return deps;
}

function getFunctionDependents(graph: SchemaGraph, fnName: string): string[] {
  return (graph.triggers || []).filter((t) => t.functionName.toLowerCase() === fnName.toLowerCase()).map((t) => t.name);
}

function getRoleDependents(graph: SchemaGraph, roleName: string): string[] {
  return (graph.policies || []).filter((p) => p.roles?.some((r) => r.toLowerCase() === roleName.toLowerCase())).map((p) => p.name);
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

  // Enum types
  if (graph.enumTypes && graph.enumTypes.length > 0) {
    for (const en of graph.enumTypes) {
      lines.push(`enum ${en.name} {`);
      for (const v of en.values) lines.push(`  ${v}`);
      lines.push("}");
      lines.push("");
    }
  }

  for (const entity of graph.entities) {
    lines.push(`model ${entity.name} {`);
    for (const f of entity.fields) {
      // Check if type is a user-defined enum
      const enumType = graph.enumTypes?.find((en) => en.name.toLowerCase() === f.type.toLowerCase());
      let pType: string;
      if (enumType) {
        pType = enumType.name;
      } else {
        const typeMap: Record<string, string> = { string: "String", int: "Int", bigint: "BigInt", smallint: "Int", serial: "Int", bigserial: "BigInt", float: "Float", decimal: "Decimal", boolean: "Boolean", datetime: "DateTime", date: "DateTime", time: "DateTime", timestamptz: "DateTime", text: "String", uuid: "String", json: "Json", bytes: "Bytes", array: "String[]", enum: "String" };
        pType = typeMap[f.type] || "String";
      }
      const mods: string[] = [];
      if (f.isPK && f.autoIncrement) mods.push("@id @default(autoincrement())");
      else if (f.isPK && f.type === "uuid") mods.push("@id @default(uuid())");
      else if (f.isPK) mods.push("@id @default(cuid())");
      if (f.unique && !f.isPK) mods.push("@unique");
      if (f.defaultValue && !f.isGenerated) mods.push(`@default(${f.defaultValue})`);
      if (f.autoIncrement && !f.isPK) mods.push("@default(autoincrement())");
      if (f.isGenerated) continue; // Prisma doesn't support generated columns directly
      const optional = !f.required && !f.isPK ? "?" : "";
      const commentStr = f.comment ? ` /// ${f.comment}` : "";
      lines.push(`  ${f.name}  ${pType}${optional}${mods.length ? "  " + mods.join(" ") : ""}${commentStr}`);
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
    // Composite PK
    if (entity.compositePK && entity.compositePK.length > 0) {
      lines.push(`  @@id([${entity.compositePK.join(", ")}])`);
    }
    // Composite uniques
    if (entity.compositeUniques) {
      for (const cols of entity.compositeUniques) {
        lines.push(`  @@unique([${cols.join(", ")}])`);
      }
    }
    // Schema
    if (entity.schema && entity.schema !== "public") {
      lines.push(`  @@schema("${entity.schema}")`);
    }
    lines.push("}");
    if (entity.comment) lines.push(`/// ${entity.comment}`);
    lines.push("");
  }
  return lines.join("\n");
}

function exportSql(graph: SchemaGraph): string {
  const lines: string[] = [];
  const indexLines: string[] = [];
  const commentLines: string[] = [];

  // Enum types
  if (graph.enumTypes && graph.enumTypes.length > 0) {
    lines.push("-- Enum Types");
    for (const en of graph.enumTypes) {
      const schema = en.schema && en.schema !== "public" ? `${en.schema}.` : "";
      lines.push(`CREATE TYPE ${schema}${en.name.toLowerCase()} AS ENUM (${en.values.map((v) => `'${v}'`).join(", ")});`);
    }
    lines.push("");
  }

  // Schemas
  const schemas = new Set(graph.entities.map((e) => e.schema).filter((s) => s && s !== "public"));
  if (schemas.size > 0) {
    lines.push("-- Schemas");
    for (const s of schemas) lines.push(`CREATE SCHEMA IF NOT EXISTS ${s};`);
    lines.push("");
  }

  for (const entity of graph.entities) {
    const schemaPrefix = entity.schema && entity.schema !== "public" ? `${entity.schema}.` : "";
    const tableName = entity.name.toLowerCase().replace(/\s+/g, "_");
    const qualifiedName = `${schemaPrefix}${tableName}`;
    const unlogged = entity.isUnlogged ? "UNLOGGED " : "";
    lines.push(`CREATE ${unlogged}TABLE ${qualifiedName} (`);
    const colLines: string[] = [];

    for (const f of entity.fields) {
      // Resolve type — check if it's a user-defined enum
      const enumType = graph.enumTypes?.find((en) => en.name.toLowerCase() === f.type.toLowerCase());
      let sType: string;
      if (enumType) {
        sType = enumType.name.toLowerCase();
      } else if (f.isIdentity) {
        sType = f.type === "bigint" ? "BIGINT" : "INTEGER";
      } else if (f.type === "array" && f.arrayElementType) {
        const baseMap: Record<string, string> = { string: "VARCHAR(255)", int: "INTEGER", text: "TEXT", boolean: "BOOLEAN", uuid: "UUID", json: "JSONB" };
        sType = `${baseMap[f.arrayElementType] || f.arrayElementType.toUpperCase()}[]`;
      } else {
        const typeMap: Record<string, string> = {
          string: "VARCHAR(255)", varchar: "VARCHAR", char: "CHAR", text: "TEXT", citext: "CITEXT",
          int: "INTEGER", bigint: "BIGINT", smallint: "SMALLINT", serial: "SERIAL", bigserial: "BIGSERIAL",
          float: "REAL", real: "REAL", double: "DOUBLE PRECISION", decimal: "DECIMAL", numeric: "NUMERIC", money: "MONEY",
          boolean: "BOOLEAN", datetime: "TIMESTAMP", timestamp: "TIMESTAMP", timestamptz: "TIMESTAMPTZ",
          date: "DATE", time: "TIME", timetz: "TIMETZ", interval: "INTERVAL",
          uuid: "UUID", json: "JSON", jsonb: "JSONB", bytes: "BYTEA", bytea: "BYTEA", xml: "XML",
          inet: "INET", cidr: "CIDR", macaddr: "MACADDR",
          tsvector: "TSVECTOR", tsquery: "TSQUERY",
          int4range: "INT4RANGE", int8range: "INT8RANGE", numrange: "NUMRANGE",
          tsrange: "TSRANGE", tstzrange: "TSTZRANGE", daterange: "DATERANGE",
          point: "POINT", line: "LINE", box: "BOX", polygon: "POLYGON", circle: "CIRCLE",
          vector: "VECTOR", array: "TEXT[]", enum: "VARCHAR(50)",
        };
        sType = typeMap[f.type] || "TEXT";
        // Apply type modifiers
        if (f.length && ["varchar", "char", "string"].includes(f.type)) sType = `VARCHAR(${f.length})`;
        if (f.precision && ["decimal", "numeric"].includes(f.type)) sType = `NUMERIC(${f.precision}${f.scale ? `,${f.scale}` : ""})`;
        if (f.length && f.type === "vector") sType = `VECTOR(${f.length})`;
      }

      const parts = [`  ${f.name} ${sType}`];
      if (f.isIdentity) parts.push(`GENERATED ${f.identityType || "ALWAYS"} AS IDENTITY`);
      if (f.isGenerated && f.generatedExpr) parts.push(`GENERATED ALWAYS AS (${f.generatedExpr}) STORED`);
      if (f.collation) parts.push(`COLLATE "${f.collation}"`);
      if (f.isPK && !entity.compositePK?.length) parts.push("PRIMARY KEY");
      if (f.unique && !f.isPK) parts.push("UNIQUE");
      if (f.required && !f.isPK && !f.isGenerated) parts.push("NOT NULL");
      if (f.defaultValue && !f.isIdentity && !f.isGenerated) parts.push(`DEFAULT ${f.defaultValue}`);
      if (f.checkExpr) parts.push(`CHECK (${f.checkExpr})`);
      colLines.push(parts.join(" "));

      // Track indexes
      if (f.indexed && !f.isPK && !f.unique) {
        const idxType = f.indexType && f.indexType !== "BTREE" ? ` USING ${f.indexType}` : "";
        indexLines.push(`CREATE INDEX idx_${tableName}_${f.name} ON ${qualifiedName}${idxType} (${f.name});`);
      }

      // Column comments
      if (f.comment) commentLines.push(`COMMENT ON COLUMN ${qualifiedName}.${f.name} IS '${f.comment.replace(/'/g, "''")}';`);
    }

    // Composite primary key
    if (entity.compositePK && entity.compositePK.length > 0) {
      colLines.push(`  CONSTRAINT pk_${tableName} PRIMARY KEY (${entity.compositePK.join(", ")})`);
    }

    // Composite unique constraints
    if (entity.compositeUniques) {
      entity.compositeUniques.forEach((cols, i) => {
        colLines.push(`  CONSTRAINT uq_${tableName}_${i} UNIQUE (${cols.join(", ")})`);
      });
    }

    // Foreign key constraints from relations
    const fkRels = graph.relations.filter((r) => r.toEntityId === entity.id);
    for (const rel of fkRels) {
      const fromEntity = graph.entities.find((e) => e.id === rel.fromEntityId);
      if (!fromEntity) continue;
      const constraintName = rel.constraintName || `fk_${tableName}_${rel.fkFieldName || fromEntity.name.toLowerCase()}`;
      const onDel = rel.onDelete || "CASCADE";
      const onUpd = rel.onUpdate ? ` ON UPDATE ${rel.onUpdate}` : "";
      const deferrable = rel.isDeferrable ? ` DEFERRABLE${rel.isDeferred ? " INITIALLY DEFERRED" : " INITIALLY IMMEDIATE"}` : "";
      const refSchema = fromEntity.schema && fromEntity.schema !== "public" ? `${fromEntity.schema}.` : "";
      const refTable = `${refSchema}${fromEntity.name.toLowerCase().replace(/\s+/g, "_")}`;

      if (rel.fkColumns && rel.fkColumns.length > 1 && rel.refColumns) {
        // Composite FK
        colLines.push(`  CONSTRAINT ${constraintName} FOREIGN KEY (${rel.fkColumns.join(", ")}) REFERENCES ${refTable}(${rel.refColumns.join(", ")}) ON DELETE ${onDel}${onUpd}${deferrable}`);
        indexLines.push(`CREATE INDEX idx_${tableName}_${rel.fkColumns.join("_")} ON ${qualifiedName} (${rel.fkColumns.join(", ")});`);
      } else {
        // Single-column FK
        const fkName = rel.fkFieldName || `${fromEntity.name.toLowerCase()}_id`;
        const hasFk = entity.fields.some((f) => f.name === fkName || f.name === fkName.replace(/_/g, ""));
        if (!hasFk) {
          colLines.push(`  ${fkName} VARCHAR(255) NOT NULL`);
        }
        colLines.push(`  CONSTRAINT ${constraintName} FOREIGN KEY (${fkName}) REFERENCES ${refTable}(id) ON DELETE ${onDel}${onUpd}${deferrable}`);
        indexLines.push(`CREATE INDEX idx_${tableName}_${fkName} ON ${qualifiedName} (${fkName});`);
      }
    }

    lines.push(colLines.join(",\n"));
    let closeTable = ")";
    if (entity.inherits) closeTable += ` INHERITS (${entity.inherits.toLowerCase()})`;
    if (entity.partitionBy && entity.partitionKey) closeTable += ` PARTITION BY ${entity.partitionBy} (${entity.partitionKey})`;
    lines.push(closeTable + ";");
    // Table comment
    if (entity.comment) commentLines.push(`COMMENT ON TABLE ${qualifiedName} IS '${entity.comment.replace(/'/g, "''")}';`);
    lines.push("");
  }

  // Append indexes
  if (indexLines.length > 0) {
    lines.push("-- Indexes");
    lines.push(...indexLines);
    lines.push("");
  }

  // Append comments
  if (commentLines.length > 0) {
    lines.push("-- Comments");
    lines.push(...commentLines);
    lines.push("");
  }

  // Extensions
  if (graph.extensions && graph.extensions.length > 0) {
    lines.unshift(""); // insert at top
    for (let i = graph.extensions.length - 1; i >= 0; i--) {
      const ext = graph.extensions[i];
      const schema = ext.schema ? ` SCHEMA ${ext.schema}` : "";
      lines.unshift(`CREATE EXTENSION IF NOT EXISTS "${ext.name}"${schema};`);
    }
    lines.unshift("-- Extensions");
  }

  // Domain types
  if (graph.domainTypes && graph.domainTypes.length > 0) {
    lines.push("-- Domain Types");
    for (const d of graph.domainTypes) {
      let def = `CREATE DOMAIN ${d.name} AS ${d.baseType}`;
      if (d.notNull) def += " NOT NULL";
      if (d.defaultValue) def += ` DEFAULT ${d.defaultValue}`;
      if (d.checkExpr) def += ` CHECK (${d.checkExpr})`;
      lines.push(def + ";");
    }
    lines.push("");
  }

  // Advanced indexes
  if (graph.indexes && graph.indexes.length > 0) {
    lines.push("-- Advanced Indexes");
    for (const idx of graph.indexes) {
      const unique = idx.isUnique ? "UNIQUE " : "";
      const using = idx.type && idx.type !== "BTREE" ? ` USING ${idx.type}` : "";
      const cols = idx.expression || idx.columns.join(", ");
      const include = idx.includeColumns?.length ? ` INCLUDE (${idx.includeColumns.join(", ")})` : "";
      const where = idx.whereClause ? ` WHERE ${idx.whereClause}` : "";
      lines.push(`CREATE ${unique}INDEX ${idx.name} ON ${idx.tableName}${using} (${cols})${include}${where};`);
    }
    lines.push("");
  }

  // Sequences
  if (graph.sequences && graph.sequences.length > 0) {
    lines.push("-- Sequences");
    for (const seq of graph.sequences) {
      const parts = [`CREATE SEQUENCE ${seq.name}`];
      if (seq.dataType) parts.push(`AS ${seq.dataType}`);
      if (seq.start !== undefined) parts.push(`START WITH ${seq.start}`);
      if (seq.increment !== undefined) parts.push(`INCREMENT BY ${seq.increment}`);
      if (seq.minValue !== undefined) parts.push(`MINVALUE ${seq.minValue}`);
      if (seq.maxValue !== undefined) parts.push(`MAXVALUE ${seq.maxValue}`);
      if (seq.cycle) parts.push("CYCLE");
      lines.push(parts.join(" ") + ";");
      if (seq.ownedBy) lines.push(`ALTER SEQUENCE ${seq.name} OWNED BY ${seq.ownedBy};`);
    }
    lines.push("");
  }

  // Views
  if (graph.views && graph.views.length > 0) {
    lines.push("-- Views");
    for (const v of graph.views) {
      const mat = v.isMaterialized ? "MATERIALIZED " : "";
      const schema = v.schema && v.schema !== "public" ? `${v.schema}.` : "";
      lines.push(`CREATE ${mat}VIEW ${schema}${v.name} AS`);
      lines.push(`${v.query};`);
      lines.push("");
    }
  }

  // Functions
  if (graph.functions && graph.functions.length > 0) {
    lines.push("-- Functions");
    for (const fn of graph.functions) {
      lines.push(`CREATE OR REPLACE FUNCTION ${fn.name}(${fn.params})`);
      lines.push(`RETURNS ${fn.returnType}`);
      lines.push(`LANGUAGE ${fn.language}`);
      if (fn.volatility) lines.push(fn.volatility);
      if (fn.security === "DEFINER") lines.push("SECURITY DEFINER");
      lines.push(`AS $$`);
      lines.push(fn.body);
      lines.push(`$$;`);
      lines.push("");
    }
  }

  // Triggers
  if (graph.triggers && graph.triggers.length > 0) {
    lines.push("-- Triggers");
    for (const tr of graph.triggers) {
      const events = tr.events.join(" OR ");
      const when = tr.whenExpr ? `\n  WHEN (${tr.whenExpr})` : "";
      lines.push(`CREATE TRIGGER ${tr.name}`);
      lines.push(`  ${tr.timing} ${events} ON ${tr.tableName}`);
      lines.push(`  FOR EACH ${tr.forEach}${when}`);
      lines.push(`  EXECUTE FUNCTION ${tr.functionName}();`);
      lines.push("");
    }
  }

  // RLS Policies
  const rlsTables = graph.entities.filter((e) => e.enableRLS);
  if (rlsTables.length > 0 || (graph.policies && graph.policies.length > 0)) {
    lines.push("-- Row-Level Security");
    for (const t of rlsTables) {
      const schema = t.schema && t.schema !== "public" ? `${t.schema}.` : "";
      lines.push(`ALTER TABLE ${schema}${t.name.toLowerCase()} ENABLE ROW LEVEL SECURITY;`);
    }
    if (graph.policies) {
      for (const p of graph.policies) {
        const roles = p.roles?.length ? ` TO ${p.roles.join(", ")}` : "";
        const using = p.usingExpr ? `\n  USING (${p.usingExpr})` : "";
        const check = p.checkExpr ? `\n  WITH CHECK (${p.checkExpr})` : "";
        lines.push(`CREATE POLICY ${p.name} ON ${p.tableName}`);
        lines.push(`  FOR ${p.command}${roles}${using}${check};`);
      }
    }
    lines.push("");
  }

  // Composite types
  if (graph.compositeTypes && graph.compositeTypes.length > 0) {
    lines.push("-- Composite Types");
    for (const ct of graph.compositeTypes) {
      const fields = ct.fields.map((f) => `  ${f.name} ${f.type}`).join(",\n");
      lines.push(`CREATE TYPE ${ct.name} AS (\n${fields}\n);`);
    }
    lines.push("");
  }

  // Roles & Grants
  if (graph.roles && graph.roles.length > 0) {
    lines.push("-- Roles & Permissions");
    for (const r of graph.roles) {
      const opts: string[] = [];
      if (r.login) opts.push("LOGIN");
      if (r.superuser) opts.push("SUPERUSER");
      if (r.createdb) opts.push("CREATEDB");
      if (r.createrole) opts.push("CREATEROLE");
      if (r.inherit !== false) opts.push("INHERIT");
      lines.push(`CREATE ROLE ${r.name}${opts.length ? " " + opts.join(" ") : ""};`);
      if (r.grants) {
        for (const g of r.grants) {
          lines.push(`GRANT ${g.privileges.join(", ")} ON ${g.target} TO ${r.name};`);
        }
      }
    }
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
  const [formFieldLength, setFormFieldLength] = useState("");
  const [formFieldPrecision, setFormFieldPrecision] = useState("");
  const [formFieldScale, setFormFieldScale] = useState("");
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

  // ── Enum state ──
  const [formEnumName, setFormEnumName] = useState("");
  const [formEnumValues, setFormEnumValues] = useState("");

  // ── Generic object form (reused for view, sequence, function, trigger, policy, extension, index, domain) ──
  const [formObj, setFormObj] = useState<Record<string, string>>({});
  const [editObjId, setEditObjId] = useState<string | null>(null);

  // ── Hover state for entity actions ──
  const [hoverEntityId, setHoverEntityId] = useState<string | null>(null);
  const [hoverFieldKey, setHoverFieldKey] = useState<string | null>(null);

  // ── Drag state ──
  const [draggingEntityId, setDraggingEntityId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // ── Zoom/Pan state ──
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; panX: number; panY: number }>({ x: 0, y: 0, panX: 0, panY: 0 });

  // ── New feature state ──
  const [searchQuery, setSearchQuery] = useState("");
  const [gridEnabled, setGridEnabled] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [roughMode, setRoughMode] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [selectedRelationId, setSelectedRelationId] = useState<string | null>(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [schemaToolMode, setSchemaToolMode] = useState<"select" | "hand" | "text" | "rect">("select");
  const [annotations, setAnnotations] = useState<Array<{ id: string; type: "text" | "rect"; x: number; y: number; width: number; height: number; text?: string; color?: string }>>([]);
  const [drawingRect, setDrawingRect] = useState<{ startX: number; startY: number; x: number; y: number; width: number; height: number } | null>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; target: "canvas" | "entity" | "relation"; targetId?: string } | null>(null);
  const [relationsPanelOpen, setRelationsPanelOpen] = useState(false);

  // ── Undo/Redo ──
  const historyRef = useRef<SchemaGraph[]>([]);
  const historyIdxRef = useRef(-1);

  const pushHistory = useCallback((g: SchemaGraph) => {
    historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1);
    historyRef.current.push(JSON.parse(JSON.stringify(g)));
    if (historyRef.current.length > 50) historyRef.current.shift();
    historyIdxRef.current = historyRef.current.length - 1;
  }, []);

  const undo = useCallback(() => {
    if (historyIdxRef.current <= 0) return;
    historyIdxRef.current--;
    const snapshot = JSON.parse(JSON.stringify(historyRef.current[historyIdxRef.current]));
    setGraph(snapshot);
    saveGraph(snapshot);
  }, []);

  const redo = useCallback(() => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current++;
    const snapshot = JSON.parse(JSON.stringify(historyRef.current[historyIdxRef.current]));
    setGraph(snapshot);
    saveGraph(snapshot);
  }, []);

  // Live reactivity: reload when AI modifies schema via tool
  useAnyArtifactRefresh(useCallback(() => window.location.reload(), []));

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

      // Adaptive connection points based on relative card positions
      const fromCx = fromRect.left + fromRect.width / 2 - containerRect.left;
      const fromCy = fromRect.top + fromRect.height / 2 - containerRect.top;
      const toCx = toRect.left + toRect.width / 2 - containerRect.left;
      const toCy = toRect.top + toRect.height / 2 - containerRect.top;

      const dx = toCx - fromCx;
      const dy = toCy - fromCy;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      let fx: number, fy: number, tx: number, ty: number;

      if (absDx > absDy) {
        // Cards are more side-by-side → connect right→left or left→right
        if (dx > 0) {
          fx = fromRect.right - containerRect.left;
          fy = fromCy;
          tx = toRect.left - containerRect.left;
          ty = toCy;
        } else {
          fx = fromRect.left - containerRect.left;
          fy = fromCy;
          tx = toRect.right - containerRect.left;
          ty = toCy;
        }
      } else {
        // Cards are more stacked → connect bottom→top or top→bottom
        if (dy > 0) {
          fx = fromCx;
          fy = fromRect.bottom - containerRect.top;
          tx = toCx;
          ty = toRect.top - containerRect.top;
        } else {
          fx = fromCx;
          fy = fromRect.top - containerRect.top;
          tx = toCx;
          ty = toRect.bottom - containerRect.top;
        }
      }

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
    setFormFieldLength(""); setFormFieldPrecision(""); setFormFieldScale("");
  };

  const addField = () => {
    if (!formFieldName.trim() || !editFieldEntityId) return;
    const newField: SchemaField = {
      id: uid(), name: formFieldName.trim(), type: formFieldType,
      required: formFieldRequired, unique: formFieldUnique || formFieldPK, isPK: formFieldPK, isFK: formFieldFK,
      defaultValue: formFieldDefault.trim() || undefined, autoIncrement: formFieldAutoInc || undefined, indexed: formFieldIndexed || undefined,
      length: formFieldLength ? Number(formFieldLength) : undefined,
      precision: formFieldPrecision ? Number(formFieldPrecision) : undefined,
      scale: formFieldScale ? Number(formFieldScale) : undefined,
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
  const [formRelOnUpdate, setFormRelOnUpdate] = useState<OnDeleteAction>("NO ACTION");
  const [formRelFkName, setFormRelFkName] = useState("");

  /* ── Enum CRUD ── */
  const saveEnum = () => {
    if (!formEnumName.trim() || !formEnumValues.trim()) return;
    const values = formEnumValues.split(",").map((v) => v.trim()).filter(Boolean);
    if (values.length === 0) return;
    updateGraph((g) => {
      if (editObjId) {
        return { ...g, enumTypes: (g.enumTypes || []).map((en) => en.id === editObjId ? { ...en, name: formEnumName.trim(), values } : en) };
      }
      return { ...g, enumTypes: [...(g.enumTypes || []), { id: uid(), name: formEnumName.trim(), values }] };
    });
    setFormEnumName(""); setFormEnumValues(""); setEditObjId(null); setModal(null);
  };
  const openEditEnum = (en: EnumType) => { setFormEnumName(en.name); setFormEnumValues(en.values.join(", ")); setEditObjId(en.id); setModal("editEnum"); };
  const deleteEnum = (enumId: string) => { updateGraph((g) => ({ ...g, enumTypes: (g.enumTypes || []).filter((en) => en.id !== enumId) })); };

  /* ── Generic upsert helper ── */
  const upsertList = <T extends { id: string }>(list: T[] | undefined, item: T): T[] => {
    const arr = list || [];
    if (editObjId) return arr.map((x) => x.id === editObjId ? item : x);
    return [...arr, item];
  };
  const clearObjForm = () => { setFormObj({}); setEditObjId(null); setModal(null); };

  /* ── Generic object CRUD ── */
  const saveView = () => {
    if (!formObj.name?.trim() || !formObj.query?.trim()) return;
    updateGraph((g) => ({ ...g, views: upsertList(g.views, { id: editObjId || uid(), name: formObj.name.trim(), query: formObj.query.trim(), isMaterialized: formObj.materialized === "true", schema: formObj.schema || undefined, x: 40, y: 40 }) }));
    clearObjForm();
  };
  const openEditView = (v: SchemaView) => { setFormObj({ name: v.name, query: v.query, materialized: v.isMaterialized ? "true" : "", schema: v.schema || "" }); setEditObjId(v.id); setModal("editView"); };
  const deleteView = (id: string) => { updateGraph((g) => ({ ...g, views: (g.views || []).filter((v) => v.id !== id) })); };

  const saveSequence = () => {
    if (!formObj.name?.trim()) return;
    updateGraph((g) => ({ ...g, sequences: upsertList(g.sequences, { id: editObjId || uid(), name: formObj.name.trim(), dataType: formObj.dataType || undefined, start: formObj.start ? Number(formObj.start) : undefined, increment: formObj.increment ? Number(formObj.increment) : undefined, minValue: formObj.minValue ? Number(formObj.minValue) : undefined, maxValue: formObj.maxValue ? Number(formObj.maxValue) : undefined, cycle: formObj.cycle === "true", ownedBy: formObj.ownedBy || undefined }) }));
    clearObjForm();
  };
  const openEditSequence = (s: SchemaSequence) => { setFormObj({ name: s.name, dataType: s.dataType || "", start: s.start?.toString() || "", increment: s.increment?.toString() || "", minValue: s.minValue?.toString() || "", maxValue: s.maxValue?.toString() || "", cycle: s.cycle ? "true" : "", ownedBy: s.ownedBy || "" }); setEditObjId(s.id); setModal("editSequence"); };
  const deleteSequence = (id: string) => { updateGraph((g) => ({ ...g, sequences: (g.sequences || []).filter((s) => s.id !== id) })); };

  const saveFunction = () => {
    if (!formObj.name?.trim()) return;
    updateGraph((g) => ({ ...g, functions: upsertList(g.functions, { id: editObjId || uid(), name: formObj.name.trim(), params: formObj.params || "", returnType: formObj.returnType || "void", language: formObj.language || "plpgsql", body: formObj.body || "", volatility: (formObj.volatility as "IMMUTABLE" | "STABLE" | "VOLATILE") || undefined, security: (formObj.security as "DEFINER" | "INVOKER") || undefined }) }));
    clearObjForm();
  };
  const openEditFunction = (fn: SchemaFunction) => { setFormObj({ name: fn.name, params: fn.params, returnType: fn.returnType, language: fn.language, body: fn.body, volatility: fn.volatility || "", security: fn.security || "" }); setEditObjId(fn.id); setModal("editFunction"); };
  const deleteFunction = (id: string) => { updateGraph((g) => ({ ...g, functions: (g.functions || []).filter((f) => f.id !== id) })); };

  const saveTrigger = () => {
    if (!formObj.name?.trim() || !formObj.tableName?.trim() || !formObj.functionName?.trim()) return;
    updateGraph((g) => ({ ...g, triggers: upsertList(g.triggers, { id: editObjId || uid(), name: formObj.name.trim(), timing: (formObj.timing as "BEFORE" | "AFTER" | "INSTEAD OF") || "BEFORE", events: (formObj.events || "INSERT").split(",").map((e) => e.trim()), tableName: formObj.tableName.trim(), forEach: (formObj.forEach as "ROW" | "STATEMENT") || "ROW", functionName: formObj.functionName.trim(), whenExpr: formObj.whenExpr || undefined }) }));
    clearObjForm();
  };
  const openEditTrigger = (tr: SchemaTrigger) => { setFormObj({ name: tr.name, timing: tr.timing, events: tr.events.join(", "), tableName: tr.tableName, forEach: tr.forEach, functionName: tr.functionName, whenExpr: tr.whenExpr || "" }); setEditObjId(tr.id); setModal("editTrigger"); };
  const deleteTrigger = (id: string) => { updateGraph((g) => ({ ...g, triggers: (g.triggers || []).filter((t) => t.id !== id) })); };

  const savePolicy = () => {
    if (!formObj.name?.trim() || !formObj.tableName?.trim()) return;
    updateGraph((g) => ({ ...g, policies: upsertList(g.policies, { id: editObjId || uid(), name: formObj.name.trim(), tableName: formObj.tableName.trim(), command: (formObj.command as "ALL" | "SELECT" | "INSERT" | "UPDATE" | "DELETE") || "ALL", usingExpr: formObj.usingExpr || undefined, checkExpr: formObj.checkExpr || undefined, roles: formObj.roles ? formObj.roles.split(",").map((r) => r.trim()) : undefined }) }));
    clearObjForm();
  };
  const openEditPolicy = (p: SchemaPolicy) => { setFormObj({ name: p.name, tableName: p.tableName, command: p.command, usingExpr: p.usingExpr || "", checkExpr: p.checkExpr || "", roles: p.roles?.join(", ") || "" }); setEditObjId(p.id); setModal("editPolicy"); };
  const deletePolicy = (id: string) => { updateGraph((g) => ({ ...g, policies: (g.policies || []).filter((p) => p.id !== id) })); };

  const saveExtension = () => {
    if (!formObj.name?.trim()) return;
    updateGraph((g) => ({ ...g, extensions: upsertList(g.extensions, { id: editObjId || uid(), name: formObj.name.trim(), schema: formObj.schema || undefined }) }));
    clearObjForm();
  };
  const deleteExtension = (id: string) => { updateGraph((g) => ({ ...g, extensions: (g.extensions || []).filter((e) => e.id !== id) })); };

  const saveAdvancedIndex = () => {
    if (!formObj.name?.trim() || !formObj.tableName?.trim() || (!formObj.columns?.trim() && !formObj.expression?.trim())) return;
    updateGraph((g) => ({ ...g, indexes: upsertList(g.indexes, { id: editObjId || uid(), name: formObj.name.trim(), tableName: formObj.tableName.trim(), columns: formObj.columns ? formObj.columns.split(",").map((c) => c.trim()) : [], type: (formObj.type as SchemaIndex["type"]) || undefined, isUnique: formObj.isUnique === "true", whereClause: formObj.whereClause || undefined, includeColumns: formObj.includeColumns ? formObj.includeColumns.split(",").map((c) => c.trim()) : undefined, expression: formObj.expression || undefined }) }));
    clearObjForm();
  };
  const openEditIndex = (idx: SchemaIndex) => { setFormObj({ name: idx.name, tableName: idx.tableName, columns: idx.columns.join(", "), type: idx.type || "", isUnique: idx.isUnique ? "true" : "", whereClause: idx.whereClause || "", includeColumns: idx.includeColumns?.join(", ") || "", expression: idx.expression || "" }); setEditObjId(idx.id); setModal("editIndex"); };
  const deleteIndex = (id: string) => { updateGraph((g) => ({ ...g, indexes: (g.indexes || []).filter((i) => i.id !== id) })); };

  const saveDomain = () => {
    if (!formObj.name?.trim() || !formObj.baseType?.trim()) return;
    updateGraph((g) => ({ ...g, domainTypes: upsertList(g.domainTypes, { id: editObjId || uid(), name: formObj.name.trim(), baseType: formObj.baseType.trim(), notNull: formObj.notNull === "true", defaultValue: formObj.defaultValue || undefined, checkExpr: formObj.checkExpr || undefined }) }));
    clearObjForm();
  };
  const openEditDomain = (d: DomainType) => { setFormObj({ name: d.name, baseType: d.baseType, notNull: d.notNull ? "true" : "", defaultValue: d.defaultValue || "", checkExpr: d.checkExpr || "" }); setEditObjId(d.id); setModal("editDomain"); };
  const deleteDomain = (id: string) => { updateGraph((g) => ({ ...g, domainTypes: (g.domainTypes || []).filter((d) => d.id !== id) })); };

  const saveCompositeType = () => {
    if (!formObj.name?.trim() || !formObj.fields?.trim()) return;
    const fields = formObj.fields.split(",").map((f) => { const parts = f.trim().split(/\s+/); return { name: parts[0] || "", type: parts[1] || "TEXT" }; }).filter((f) => f.name);
    updateGraph((g) => ({ ...g, compositeTypes: upsertList(g.compositeTypes, { id: editObjId || uid(), name: formObj.name.trim(), fields }) }));
    clearObjForm();
  };
  const openEditCompositeType = (ct: CompositeType) => { setFormObj({ name: ct.name, fields: ct.fields.map((f) => `${f.name} ${f.type}`).join(", ") }); setEditObjId(ct.id); setModal("editCompositeType"); };
  const deleteCompositeType = (id: string) => { updateGraph((g) => ({ ...g, compositeTypes: (g.compositeTypes || []).filter((c) => c.id !== id) })); };

  const saveRole = () => {
    if (!formObj.name?.trim()) return;
    const grants = formObj.grants ? formObj.grants.split(";").map((g) => { const parts = g.trim().split(/\s+/); return { target: parts[0] || "", privileges: parts.slice(1) }; }).filter((g) => g.target) : [];
    updateGraph((g) => ({ ...g, roles: upsertList(g.roles, { id: editObjId || uid(), name: formObj.name.trim(), login: formObj.login === "true", superuser: formObj.superuser === "true", createdb: formObj.createdb === "true", createrole: formObj.createrole === "true", inherit: formObj.inherit !== "false", grants: grants.length > 0 ? grants : undefined }) }));
    clearObjForm();
  };
  const openEditRole = (r: SchemaRole) => { setFormObj({ name: r.name, login: r.login ? "true" : "", superuser: r.superuser ? "true" : "", createdb: r.createdb ? "true" : "", createrole: r.createrole ? "true" : "", grants: r.grants?.map((g) => `${g.target} ${g.privileges.join(" ")}`).join("; ") || "" }); setEditObjId(r.id); setModal("editRole"); };
  const deleteRole = (id: string) => { updateGraph((g) => ({ ...g, roles: (g.roles || []).filter((r) => r.id !== id) })); };

  // ── Relation edit state ──
  const [editRelId, setEditRelId] = useState<string | null>(null);

  const openEditRelation = (rel: SchemaRelation) => {
    setFormRelFrom(rel.fromEntityId); setFormRelTo(rel.toEntityId); setFormRelType(rel.type);
    setFormRelOnDelete(rel.onDelete || "CASCADE"); setFormRelOnUpdate(rel.onUpdate || "NO ACTION");
    setFormRelFkName(rel.fkFieldName || ""); setEditRelId(rel.id); setModal("editRelation");
  };

  const saveRelation = () => {
    if (!formRelFrom || !formRelTo || formRelFrom === formRelTo) return;
    if (editRelId) {
      updateGraph((g) => ({
        ...g,
        relations: g.relations.map((r) => r.id === editRelId ? {
          ...r, fromEntityId: formRelFrom, toEntityId: formRelTo, type: formRelType,
          fkFieldName: formRelFkName.trim() || undefined, onDelete: formRelOnDelete, onUpdate: formRelOnUpdate,
        } : r),
      }));
      setEditRelId(null); setFormRelFrom(""); setFormRelTo(""); setFormRelFkName(""); setModal(null);
      return;
    }
    addRelation();
  };

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
        type: formRelType, fkFieldName, onDelete: formRelOnDelete, onUpdate: formRelOnUpdate,
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

  /* ── Drag handlers ── */
  const handleEntityMouseDown = (e: React.MouseEvent, entityId: string) => {
    // Only drag from the header area
    const target = e.target as HTMLElement;
    if (target.tagName === "BUTTON" || target.tagName === "INPUT" || target.tagName === "SELECT" || target.closest("button") || target.closest("input")) return;
    e.preventDefault();
    const entity = graph.entities.find((en) => en.id === entityId);
    if (!entity || !canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    dragOffsetRef.current = { x: e.clientX - canvasRect.left - entity.x, y: e.clientY - canvasRect.top - entity.y };
    setDraggingEntityId(entityId);
  };

  useEffect(() => {
    if (!draggingEntityId) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const newX = Math.max(0, e.clientX - canvasRect.left - dragOffsetRef.current.x);
      const newY = Math.max(0, e.clientY - canvasRect.top - dragOffsetRef.current.y);
      setGraph((prev) => ({
        ...prev,
        entities: prev.entities.map((en) => en.id === draggingEntityId ? { ...en, x: newX, y: newY } : en),
      }));
    };
    const handleMouseUp = () => {
      setDraggingEntityId(null);
      // Save position after drag
      saveGraph(graph);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => { window.removeEventListener("mousemove", handleMouseMove); window.removeEventListener("mouseup", handleMouseUp); };
  }, [draggingEntityId, graph, saveGraph]);

  // ── Zoom handler (native listener to prevent page scroll) ──
  useEffect(() => {
    const el = canvasWrapRef.current;
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

  // ── Pan handler (middle-click or space+click) ──
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

  // ── Rect drawing handler ──
  useEffect(() => {
    if (!drawingRect) return;
    const handleMove = (e: MouseEvent) => {
      const wrap = canvasWrapRef.current;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const worldX = (e.clientX - rect.left - panX) / zoom;
      const worldY = (e.clientY - rect.top - panY) / zoom;
      setDrawingRect((prev) => prev ? {
        ...prev,
        x: Math.min(prev.startX, worldX),
        y: Math.min(prev.startY, worldY),
        width: Math.abs(worldX - prev.startX),
        height: Math.abs(worldY - prev.startY),
      } : null);
    };
    const handleUp = () => {
      setDrawingRect((current) => {
        if (current && current.width > 5 && current.height > 5) {
          setAnnotations((prev) => [...prev, { id: `ann-${Date.now()}`, type: "rect", x: current.x, y: current.y, width: current.width, height: current.height, color: "#282828" }]);
        }
        setSchemaToolMode("select");
        return null;
      });
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => { window.removeEventListener("mousemove", handleMove); window.removeEventListener("mouseup", handleUp); };
  }, [drawingRect, panX, panY, zoom]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    // Middle-click pan or hand tool left-click pan
    if (e.button === 1 || (e.button === 0 && schemaToolMode === "hand")) {
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY, panX, panY };
      return;
    }
    // Convert screen coords to canvas world coords
    const wrap = canvasWrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const worldX = (e.clientX - rect.left - panX) / zoom;
    const worldY = (e.clientY - rect.top - panY) / zoom;

    if (schemaToolMode === "text" && e.button === 0) {
      const text = window.prompt("Enter text:");
      if (text) {
        setAnnotations((prev) => [...prev, { id: `ann-${Date.now()}`, type: "text", x: worldX, y: worldY, width: 200, height: 30, text, color: "#282828" }]);
      }
      setSchemaToolMode("select");
    } else if (schemaToolMode === "rect" && e.button === 0) {
      setDrawingRect({ startX: worldX, startY: worldY, x: worldX, y: worldY, width: 0, height: 0 });
    }
  }, [panX, panY, zoom, schemaToolMode]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) { e.preventDefault(); redo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") { e.preventDefault(); redo(); }
      if (e.key === "Escape") { setSelectedEntityId(null); setSidePanelOpen(false); setModal(null); setContextMenu(null); }
      if (e.key.toLowerCase() === "v" && !e.ctrlKey && !e.metaKey) setSchemaToolMode("select");
      if (e.key.toLowerCase() === "h" && !e.ctrlKey && !e.metaKey) setSchemaToolMode("hand");
      if (e.key === "+" || e.key === "=") { setZoom((z) => Math.min(3, z + 0.1)); }
      if (e.key === "-") { setZoom((z) => Math.max(0.25, z - 0.1)); }
      if (e.key === "0" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); setZoom(1); setPanX(0); setPanY(0); }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedEntityId && !modal) {
        const deps = getTableDependents(graph, graph.entities.find((en) => en.id === selectedEntityId)?.name || "");
        if (deps.length > 0 && !window.confirm(`This entity has ${deps.length} dependencies. Delete anyway?`)) return;
        setGraph((prev) => ({ ...prev, entities: prev.entities.filter((en) => en.id !== selectedEntityId), relations: prev.relations.filter((r) => r.fromEntityId !== selectedEntityId && r.toEntityId !== selectedEntityId) }));
        setSelectedEntityId(null);
        pushHistory(graph);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "f") { e.preventDefault(); document.querySelector<HTMLInputElement>("[data-schema-search]")?.focus(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo, selectedEntityId, modal, graph, pushHistory]);

  // ── Fit view ──
  const fitView = useCallback(() => {
    if (graph.entities.length === 0) return;
    const wrapEl = canvasWrapRef.current;
    if (!wrapEl) return;
    const minX = Math.min(...graph.entities.map((e) => e.x));
    const minY = Math.min(...graph.entities.map((e) => e.y));
    const maxX = Math.max(...graph.entities.map((e) => e.x + 320));
    const maxY = Math.max(...graph.entities.map((e) => e.y + 300));
    const worldW = maxX - minX + 80;
    const worldH = maxY - minY + 80;
    const fitZoom = Math.min(wrapEl.clientWidth / worldW, wrapEl.clientHeight / worldH, 1.5);
    setZoom(fitZoom);
    setPanX(-(minX - 40) * fitZoom + (wrapEl.clientWidth - worldW * fitZoom) / 2);
    setPanY(-(minY - 40) * fitZoom);
  }, [graph.entities]);

  // ── Auto layout ──
  const handleAutoLayout = useCallback(() => {
    if (!window.confirm("Auto-layout will rearrange all entities. Continue?")) return;
    const laid = autoLayout(graph.entities, graph.relations);
    pushHistory(graph);
    setGraph((prev) => ({ ...prev, entities: laid }));
    saveGraph({ ...graph, entities: laid });
  }, [graph, pushHistory, saveGraph]);

  // ── Search filter ──
  const matchesSearch = useCallback((name: string) => {
    if (!searchQuery) return true;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  }, [searchQuery]);

  // Calculate canvas size from entity positions
  const canvasWidth = Math.max(900, ...graph.entities.map((e) => e.x + 320));
  const canvasHeight = Math.max(600, ...graph.entities.map((e) => e.y + 300));

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
      <h1 className="nb-view-title mb-4">SCHEMA PLANNER</h1>

      {/* Canvas tool mode */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
        {[
          { id: "select" as const, icon: "\u261A", title: "Select / Move (V)" },
          { id: "hand" as const, icon: "\u270B", title: "Hand / Pan (H)" },
          { id: "text" as const, icon: "T", title: "Add Text Label (T)" },
          { id: "rect" as const, icon: "\u25AD", title: "Draw Rectangle (R)" },
        ].map((tool) => (
          <button
            key={tool.id}
            title={tool.title}
            onClick={() => setSchemaToolMode(tool.id)}
            style={{
              width: "36px", height: "36px", fontSize: "1rem",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "3px solid #282828", cursor: "pointer", fontWeight: 700,
              backgroundColor: schemaToolMode === tool.id ? "#282828" : "#FFF",
              color: schemaToolMode === tool.id ? "#FFF" : "#282828",
            }}
          >
            {tool.icon}
          </button>
        ))}
        <span style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "#999", alignSelf: "center", marginLeft: "8px" }}>
          V = Select, H = Hand/Pan, Scroll = Zoom
        </span>
      </div>

      {/* Toolbar */}
      <SchemaToolbar
        entityCount={graph.entities.length}
        fieldCount={graph.entities.reduce((c, e) => c + e.fields.length, 0)}
        relationCount={graph.relations.length}
        zoom={zoom}
        gridEnabled={gridEnabled}
        snapEnabled={snapEnabled}
        roughMode={roughMode}
        searchQuery={searchQuery}
        canUndo={historyIdxRef.current > 0}
        canRedo={historyIdxRef.current < historyRef.current.length - 1}
        saving={saving}
        onAddEntity={() => { setFormEntityName(""); setModal("addEntity"); }}
        onAddRelation={() => setRelationsPanelOpen(true)}
        onAddEnum={() => { setFormEnumName(""); setFormEnumValues(""); setModal("addEnum"); }}
        onAutoLayout={handleAutoLayout}
        onFitView={fitView}
        onZoomIn={() => setZoom((z) => Math.min(3, z + 0.15))}
        onZoomOut={() => setZoom((z) => Math.max(0.25, z - 0.15))}
        onZoomReset={() => { setZoom(1); setPanX(0); setPanY(0); }}
        onToggleGrid={() => setGridEnabled((g) => !g)}
        onToggleSnap={() => setSnapEnabled((s) => !s)}
        onToggleRough={() => setRoughMode((r) => !r)}
        onSearchChange={setSearchQuery}
        onImport={() => setModal("import")}
        onExport={() => openExport("prisma")}
        onUndo={undo}
        onRedo={redo}
      />

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

      {/* Entity cards canvas (zoom/pan) */}
      <div
        ref={canvasWrapRef}
        className="relative border-2 border-dashed border-signal-black/20 overflow-hidden"
        style={{
          height: "calc(100vh - 220px)", minHeight: "500px",
          cursor: isPanning ? "grabbing" : schemaToolMode === "hand" ? "grab" : "default",
          background: gridEnabled
            ? `radial-gradient(circle, #28282815 1px, transparent 1px)`
            : "#faf8f4",
          backgroundSize: gridEnabled ? `${20 * zoom}px ${20 * zoom}px` : undefined,
          backgroundPosition: gridEnabled ? `${panX}px ${panY}px` : undefined,
        }}
        onMouseDown={handleCanvasMouseDown}
        onClick={() => { if (!draggingEntityId) { setSelectedEntityId(null); setSidePanelOpen(false); } setContextMenu(null); }}
        onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, target: "canvas" }); }}
      >
      <div
        ref={canvasRef}
        style={{
          position: "absolute", inset: 0,
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: "0 0",
          minHeight: `${canvasHeight}px`, minWidth: `${canvasWidth}px`,
        }}
      >
        {/* Crow's foot relation lines (when not using rough mode) */}
        {!roughMode && (
          <RelationLines
            entities={graph.entities}
            relations={graph.relations}
            highlightEntityId={selectedEntityId || hoverEntityId}
            selectedRelationId={selectedRelationId}
            onSelectRelation={setSelectedRelationId}
            zoom={zoom}
          />
        )}

        {/* Annotations: text labels and rectangles */}
        {annotations.map((ann) => (
          <div
            key={ann.id}
            style={{
              position: "absolute",
              left: `${ann.x}px`,
              top: `${ann.y}px`,
              width: `${ann.width}px`,
              height: `${ann.height}px`,
              border: ann.type === "rect" ? `2px solid ${ann.color || "#282828"}` : "none",
              backgroundColor: "transparent",
              color: ann.color || "#282828",
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: ann.type === "text" ? "0.85rem" : "0.7rem",
              fontWeight: 700,
              padding: ann.type === "text" ? "4px" : 0,
              pointerEvents: "auto",
              cursor: schemaToolMode === "select" ? "move" : "default",
              userSelect: "none",
              zIndex: 5,
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (window.confirm(`Delete this ${ann.type}?`)) {
                setAnnotations((prev) => prev.filter((a) => a.id !== ann.id));
              }
            }}
            onDoubleClick={() => {
              if (ann.type === "text") {
                const newText = window.prompt("Edit text:", ann.text);
                if (newText !== null) {
                  setAnnotations((prev) => prev.map((a) => a.id === ann.id ? { ...a, text: newText } : a));
                }
              }
            }}
          >
            {ann.type === "text" && ann.text}
          </div>
        ))}

        {/* Live rectangle preview while drawing */}
        {drawingRect && drawingRect.width > 0 && drawingRect.height > 0 && (
          <div
            style={{
              position: "absolute",
              left: `${drawingRect.x}px`,
              top: `${drawingRect.y}px`,
              width: `${drawingRect.width}px`,
              height: `${drawingRect.height}px`,
              border: "2px dashed #A259FF",
              backgroundColor: "rgba(162, 89, 255, 0.05)",
              pointerEvents: "none",
              zIndex: 5,
            }}
          />
        )}

        {graph.entities.map((entity) => {
          const isDragging = draggingEntityId === entity.id;
          const isSelected = selectedEntityId === entity.id;
          const dimmed = searchQuery && !matchesSearch(entity.name);
          const headerColor = HEADER_COLORS[entity.headerColor || "signal-black"] || HEADER_COLORS["signal-black"];
          return (
            <div
              key={entity.id}
              ref={(el) => { cardRefs.current[entity.id] = el; }}
              onMouseDown={(e) => handleEntityMouseDown(e, entity.id)}
              onMouseEnter={() => setHoverEntityId(entity.id)}
              onMouseLeave={() => { setHoverEntityId(null); setHoverFieldKey(null); }}
              onClick={(e) => { e.stopPropagation(); setSelectedEntityId(entity.id); setContextMenu(null); }}
              onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY, target: "entity", targetId: entity.id }); }}
              className="shadow-nb bg-white overflow-hidden"
              style={{
                position: "absolute",
                left: `${entity.x}px`,
                top: `${entity.y}px`,
                width: `${entity.width || 280}px`,
                zIndex: isDragging ? 50 : isSelected ? 10 : 1,
                cursor: isDragging ? "grabbing" : "grab",
                border: isSelected ? "4px solid #A259FF" : "4px solid #282828",
                boxShadow: isDragging ? "8px 8px 0px #282828" : isSelected ? "6px 6px 0px #A259FF" : "4px 4px 0px #282828",
                transition: isDragging ? "none" : "box-shadow 150ms, opacity 150ms",
                userSelect: "none",
                opacity: dimmed ? 0.25 : 1,
              }}
            >
              {/* Entity header — color-coded */}
              <div style={{ backgroundColor: headerColor.bg, color: headerColor.text }} className="px-4 py-3 font-bold text-base uppercase tracking-[0.1em] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{entity.name}</span>
                  {/* Linked object badges */}
                  {(() => {
                    const tn = entity.name.toLowerCase();
                    const trgC = getTableTriggerCount(graph, tn);
                    const idxC = getTableIndexCount(graph, tn);
                    const plcC = getTablePolicyCount(graph, tn);
                    const grtC = getTableGrantCount(graph, tn);
                    return (
                      <>
                        {trgC > 0 && <span className="text-[0.55rem] px-1 py-0 bg-lemon/40 text-signal-black border border-lemon font-bold" title={`${trgC} trigger(s)`}>TRG {trgC}</span>}
                        {idxC > 0 && <span className="text-[0.55rem] px-1 py-0 bg-cornflower/30 text-white border border-cornflower font-bold" title={`${idxC} index(es)`}>IDX {idxC}</span>}
                        {entity.enableRLS && <span className="text-[0.55rem] px-1 py-0 bg-amethyst/40 text-white border border-amethyst font-bold" title={`RLS enabled, ${plcC} policy(ies)`}>RLS {plcC}</span>}
                        {grtC > 0 && <span className="text-[0.55rem] px-1 py-0 bg-malachite/30 text-white border border-malachite font-bold" title={`${grtC} grant(s)`}>GRT {grtC}</span>}
                      </>
                    );
                  })()}
                </div>
                {hoverEntityId === entity.id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditEntityId(entity.id); setFormEntityName(entity.name); setModal("editEntity"); }}
                      className="text-[0.7rem] px-2 py-0.5 bg-creamy-milk text-signal-black border-2 border-creamy-milk font-bold uppercase cursor-pointer hover:bg-white"
                      title="Rename"
                    >REN</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); const deps = getTableDependents(graph, entity.name); if (deps.length > 0 && !window.confirm(`Delete ${entity.name}? This will affect:\n${deps.map((d) => `- ${d.type}: ${d.name}`).join("\n")}`)) return; deleteEntity(entity.id); }}
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
          );
        })}

        {/* Rough.js relation SVG — only in rough mode */}
        {roughMode && graph.relations.length > 0 && (
          <svg ref={svgRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 10 }} data-testid="schema-relations-svg" />
        )}
      </div>

        {/* Minimap */}
        <SchemaMinimap
          entities={graph.entities}
          zoom={zoom}
          panX={panX}
          panY={panY}
          viewportWidth={canvasWrapRef.current?.clientWidth || 800}
          viewportHeight={canvasWrapRef.current?.clientHeight || 600}
          onPan={(x, y) => { setPanX(x); setPanY(y); }}
        />

        {/* Zoom controls (bottom-left) */}
        <div style={{ position: "absolute", bottom: "12px", left: "12px", zIndex: 40, display: "flex", gap: "4px" }}>
          <button className="nb-btn nb-btn--small" onClick={() => setZoom((z) => Math.max(0.25, z - 0.15))}>-</button>
          <span style={{ padding: "4px 8px", border: "2px solid #282828", backgroundColor: "#FFF", fontFamily: "monospace", fontSize: "0.75rem", fontWeight: 700 }}>{Math.round(zoom * 100)}%</span>
          <button className="nb-btn nb-btn--small" onClick={() => setZoom((z) => Math.min(3, z + 0.15))}>+</button>
          <button className="nb-btn nb-btn--small" onClick={fitView}>FIT</button>
        </div>
      </div>

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
              <button className="block w-full text-left px-3 py-2 hover:bg-creamy-milk uppercase font-bold text-[0.75rem]" onClick={() => { setFormEntityName(""); setModal("addEntity"); }}>Add Entity</button>
              <button className="block w-full text-left px-3 py-2 hover:bg-creamy-milk uppercase font-bold text-[0.75rem]" onClick={() => { if (graph.entities.length >= 2) { setFormRelFrom(graph.entities[0]?.id || ""); setFormRelTo(graph.entities[1]?.id || ""); setModal("addRelation"); } }}>Add Relation</button>
              <button className="block w-full text-left px-3 py-2 hover:bg-creamy-milk uppercase font-bold text-[0.75rem]" onClick={() => { setFormEnumName(""); setFormEnumValues(""); setModal("addEnum"); }}>Add Enum</button>
              <div style={{ height: "1px", backgroundColor: "#28282820" }} />
              <button className="block w-full text-left px-3 py-2 hover:bg-creamy-milk uppercase font-bold text-[0.75rem]" onClick={handleAutoLayout}>Auto Layout</button>
              <button className="block w-full text-left px-3 py-2 hover:bg-creamy-milk uppercase font-bold text-[0.75rem]" onClick={fitView}>Fit View</button>
            </>
          )}
          {contextMenu.target === "entity" && contextMenu.targetId && (() => {
            const ent = graph.entities.find((e) => e.id === contextMenu.targetId);
            if (!ent) return null;
            return (
              <>
                <button className="block w-full text-left px-3 py-2 hover:bg-creamy-milk uppercase font-bold text-[0.75rem]" onClick={() => { setEditEntityId(ent.id); setFormEntityName(ent.name); setModal("editEntity"); }}>Rename</button>
                <button className="block w-full text-left px-3 py-2 hover:bg-creamy-milk uppercase font-bold text-[0.75rem]" onClick={() => { setEditFieldEntityId(ent.id); setFormFieldName(""); setFormFieldType("string"); setModal("addField"); }}>Add Field</button>
                <div style={{ height: "1px", backgroundColor: "#28282820" }} />
                <div className="px-3 py-2 text-[0.65rem] text-gray-mid uppercase">Color</div>
                <div className="px-3 pb-2 flex gap-2">
                  {Object.entries(HEADER_COLORS).map(([key, c]) => (
                    <button key={key} onClick={() => { pushHistory(graph); setGraph((prev) => ({ ...prev, entities: prev.entities.map((en) => en.id === ent.id ? { ...en, headerColor: key } : en) })); }} style={{ width: "16px", height: "16px", backgroundColor: c.bg, border: "1px solid #282828", cursor: "pointer" }} />
                  ))}
                </div>
                <div style={{ height: "1px", backgroundColor: "#28282820" }} />
                <button className="block w-full text-left px-3 py-2 hover:bg-creamy-milk uppercase font-bold text-[0.75rem] text-watermelon" onClick={() => {
                  const deps = getTableDependents(graph, ent.name);
                  if (deps.length > 0 && !window.confirm(`${ent.name} has ${deps.length} dependencies. Delete?`)) return;
                  pushHistory(graph);
                  setGraph((prev) => ({ ...prev, entities: prev.entities.filter((en) => en.id !== ent.id), relations: prev.relations.filter((r) => r.fromEntityId !== ent.id && r.toEntityId !== ent.id) }));
                  setSelectedEntityId(null);
                }}>Delete</button>
              </>
            );
          })()}
        </div>
      )}

      {/* Relations slide-out panel (right side, like nav drawer) */}
      <div
        style={{
          position: "fixed", top: 0, right: 0, height: "100vh", width: "340px",
          backgroundColor: "#FFF", borderLeft: "4px solid #282828",
          boxShadow: "-6px 0 0 #282828",
          transform: relationsPanelOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 300ms cubic-bezier(0.2,0,0,1)",
          zIndex: 100, overflowY: "auto", padding: "20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 className="font-bold text-[1rem] uppercase tracking-wider">RELATIONS</h3>
          <button onClick={() => setRelationsPanelOpen(false)} style={{ fontSize: "1.2rem", fontWeight: 700, cursor: "pointer", border: "none", background: "none" }}>X</button>
        </div>
        {graph.relations.length === 0 && (
          <p className="font-mono text-[0.8rem] text-[#999]">No relations yet.</p>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {graph.relations.map((rel) => {
            const from = graph.entities.find((e) => e.id === rel.fromEntityId);
            const to = graph.entities.find((e) => e.id === rel.toEntityId);
            return (
              <div key={rel.id} className="flex items-center gap-2 px-3 py-2 border-2 border-signal-black bg-white font-mono text-[0.75rem] uppercase">
                <span className="font-bold">{from?.name || "?"}</span>
                <span className="text-watermelon font-bold">{rel.type}</span>
                <span className="font-bold">{to?.name || "?"}</span>
                {rel.fkFieldName && <span className="text-[0.55rem] text-malachite">FK: {rel.fkFieldName}</span>}
                <div className="ml-auto flex gap-1">
                  <button onClick={() => openEditRelation(rel)} className="text-signal-black font-bold cursor-pointer hover:opacity-70 text-[0.6rem]">E</button>
                  <button onClick={() => deleteRelation(rel.id)} className="text-watermelon font-bold cursor-pointer hover:opacity-70">X</button>
                </div>
              </div>
            );
          })}
        </div>
        <button
          className="nb-btn nb-btn--primary w-full mt-4"
          onClick={() => { if (graph.entities.length >= 2) { setFormRelFrom(graph.entities[0]?.id || ""); setFormRelTo(graph.entities[1]?.id || ""); setFormRelType("1:N"); setFormRelOnDelete("CASCADE"); setFormRelOnUpdate("NO ACTION"); setModal("addRelation"); } }}
        >+ ADD RELATION</button>
      </div>
      {/* Overlay when panel open */}
      {relationsPanelOpen && (
        <div onClick={() => setRelationsPanelOpen(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.2)", zIndex: 99 }} />
      )}

      {/* Enum types list */}
      {(graph.enumTypes || []).length > 0 && (
        <div className="mt-4 mb-4">
          <h3 className="font-bold text-[0.8rem] uppercase tracking-wider mb-2">ENUM TYPES</h3>
          <div className="flex flex-wrap gap-2">
            {(graph.enumTypes || []).map((en) => (
              <div key={en.id} className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-signal-black bg-white font-mono text-[0.75rem] uppercase">
                <span className="font-bold text-amethyst">{en.name}</span>
                <span className="text-[0.6rem] text-[#999]">({en.values.join(", ")})</span>
                {(() => { const usage = getEnumUsage(graph, en.name); return usage.length > 0 ? <span className="text-[0.55rem] text-malachite font-bold">used by: {usage.join(", ")}</span> : null; })()}
                <button onClick={() => openEditEnum(en)} className="ml-1 text-signal-black font-bold cursor-pointer hover:opacity-70 text-[0.6rem]">E</button>
                <button onClick={() => { const usage = getEnumUsage(graph, en.name); if (usage.length > 0 && !window.confirm(`Delete enum "${en.name}"? Used by: ${usage.join(", ")}`)) return; deleteEnum(en.id); }} className="text-watermelon font-bold cursor-pointer hover:opacity-70">X</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Database objects summary */}
      {((graph.views || []).length > 0 || (graph.sequences || []).length > 0 || (graph.functions || []).length > 0 || (graph.triggers || []).length > 0 || (graph.policies || []).length > 0 || (graph.extensions || []).length > 0 || (graph.indexes || []).length > 0 || (graph.domainTypes || []).length > 0 || (graph.compositeTypes || []).length > 0 || (graph.roles || []).length > 0) && (
        <div className="mt-4 mb-4 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          {/* Views */}
          {(graph.views || []).length > 0 && (
            <div className="border-2 border-signal-black p-3 bg-white">
              <h4 className="font-bold text-[0.75rem] uppercase tracking-wider mb-2">VIEWS</h4>
              {(graph.views || []).map((v) => (
                <div key={v.id} className="flex items-center justify-between font-mono text-[0.75rem] py-1 border-b border-dashed border-black/10">
                  <span>{v.isMaterialized ? "MAT " : ""}{v.name}{(() => { const deps = getViewDependencies(v.query, graph.entities); return deps.length > 0 ? ` (→ ${deps.join(", ")})` : ""; })()}</span>
                  <div className="flex gap-1"><button onClick={() => openEditView(v)} className="text-signal-black font-bold text-[0.6rem]">E</button><button onClick={() => deleteView(v.id)} className="text-watermelon font-bold">X</button></div>
                </div>
              ))}
            </div>
          )}
          {/* Sequences */}
          {(graph.sequences || []).length > 0 && (
            <div className="border-2 border-signal-black p-3 bg-white">
              <h4 className="font-bold text-[0.75rem] uppercase tracking-wider mb-2">SEQUENCES</h4>
              {(graph.sequences || []).map((s) => (
                <div key={s.id} className="flex items-center justify-between font-mono text-[0.75rem] py-1 border-b border-dashed border-black/10">
                  <span>{s.name}{s.ownedBy ? ` → ${s.ownedBy}` : ""}{s.start !== undefined ? ` (START ${s.start})` : ""}</span>
                  <div className="flex gap-1"><button onClick={() => openEditSequence(s)} className="text-signal-black font-bold text-[0.6rem]">E</button><button onClick={() => deleteSequence(s.id)} className="text-watermelon font-bold">X</button></div>
                </div>
              ))}
            </div>
          )}
          {/* Functions */}
          {(graph.functions || []).length > 0 && (
            <div className="border-2 border-signal-black p-3 bg-white">
              <h4 className="font-bold text-[0.75rem] uppercase tracking-wider mb-2">FUNCTIONS</h4>
              {(graph.functions || []).map((fn) => (
                <div key={fn.id} className="flex items-center justify-between font-mono text-[0.75rem] py-1 border-b border-dashed border-black/10">
                  <span>{fn.name}({fn.params}) → {fn.returnType}</span>
                  <div className="flex gap-1"><button onClick={() => openEditFunction(fn)} className="text-signal-black font-bold text-[0.6rem]">E</button><button onClick={() => { const deps = getFunctionDependents(graph, fn.name); if (deps.length > 0 && !window.confirm(`Delete function "${fn.name}"? Used by triggers: ${deps.join(", ")}`)) return; deleteFunction(fn.id); }} className="text-watermelon font-bold">X</button></div>
                </div>
              ))}
            </div>
          )}
          {/* Triggers */}
          {(graph.triggers || []).length > 0 && (
            <div className="border-2 border-signal-black p-3 bg-white">
              <h4 className="font-bold text-[0.75rem] uppercase tracking-wider mb-2">TRIGGERS</h4>
              {(graph.triggers || []).map((tr) => (
                <div key={tr.id} className="flex items-center justify-between font-mono text-[0.75rem] py-1 border-b border-dashed border-black/10">
                  <span>{tr.name} {tr.timing} {tr.events.join("/")} ON {tr.tableName}</span>
                  <div className="flex gap-1"><button onClick={() => openEditTrigger(tr)} className="text-signal-black font-bold text-[0.6rem]">E</button><button onClick={() => deleteTrigger(tr.id)} className="text-watermelon font-bold">X</button></div>
                </div>
              ))}
            </div>
          )}
          {/* Policies */}
          {(graph.policies || []).length > 0 && (
            <div className="border-2 border-signal-black p-3 bg-white">
              <h4 className="font-bold text-[0.75rem] uppercase tracking-wider mb-2">RLS POLICIES</h4>
              {(graph.policies || []).map((p) => (
                <div key={p.id} className="flex items-center justify-between font-mono text-[0.75rem] py-1 border-b border-dashed border-black/10">
                  <span>{p.name} ({p.command}) ON {p.tableName}</span>
                  <div className="flex gap-1"><button onClick={() => openEditPolicy(p)} className="text-signal-black font-bold text-[0.6rem]">E</button><button onClick={() => deletePolicy(p.id)} className="text-watermelon font-bold">X</button></div>
                </div>
              ))}
            </div>
          )}
          {/* Extensions */}
          {(graph.extensions || []).length > 0 && (
            <div className="border-2 border-signal-black p-3 bg-white">
              <h4 className="font-bold text-[0.75rem] uppercase tracking-wider mb-2">EXTENSIONS</h4>
              {(graph.extensions || []).map((ext) => (
                <div key={ext.id} className="flex items-center justify-between font-mono text-[0.75rem] py-1 border-b border-dashed border-black/10">
                  <span>{ext.name}</span>
                  <button onClick={() => deleteExtension(ext.id)} className="text-watermelon font-bold">X</button>
                </div>
              ))}
            </div>
          )}
          {/* Indexes */}
          {(graph.indexes || []).length > 0 && (
            <div className="border-2 border-signal-black p-3 bg-white">
              <h4 className="font-bold text-[0.75rem] uppercase tracking-wider mb-2">INDEXES</h4>
              {(graph.indexes || []).map((idx) => (
                <div key={idx.id} className="flex items-center justify-between font-mono text-[0.75rem] py-1 border-b border-dashed border-black/10">
                  <span>{idx.isUnique ? "UQ " : ""}{idx.name} ON {idx.tableName} ({idx.expression || idx.columns.join(",")}){idx.type && idx.type !== "BTREE" ? ` ${idx.type}` : ""}</span>
                  <div className="flex gap-1"><button onClick={() => openEditIndex(idx)} className="text-signal-black font-bold text-[0.6rem]">E</button><button onClick={() => deleteIndex(idx.id)} className="text-watermelon font-bold">X</button></div>
                </div>
              ))}
            </div>
          )}
          {/* Domains */}
          {(graph.domainTypes || []).length > 0 && (
            <div className="border-2 border-signal-black p-3 bg-white">
              <h4 className="font-bold text-[0.75rem] uppercase tracking-wider mb-2">DOMAIN TYPES</h4>
              {(graph.domainTypes || []).map((d) => (
                <div key={d.id} className="flex items-center justify-between font-mono text-[0.75rem] py-1 border-b border-dashed border-black/10">
                  <span>{d.name} AS {d.baseType}{d.checkExpr ? ` CHECK(${d.checkExpr})` : ""}{(() => { const u = getDomainUsage(graph, d.name); return u.length > 0 ? ` (${u.length} uses)` : ""; })()}</span>
                  <div className="flex gap-1"><button onClick={() => openEditDomain(d)} className="text-signal-black font-bold text-[0.6rem]">E</button><button onClick={() => deleteDomain(d.id)} className="text-watermelon font-bold">X</button></div>
                </div>
              ))}
            </div>
          )}
          {/* Composite Types */}
          {(graph.compositeTypes || []).length > 0 && (
            <div className="border-2 border-signal-black p-3 bg-white">
              <h4 className="font-bold text-[0.75rem] uppercase tracking-wider mb-2">COMPOSITE TYPES</h4>
              {(graph.compositeTypes || []).map((ct) => (
                <div key={ct.id} className="flex items-center justify-between font-mono text-[0.75rem] py-1 border-b border-dashed border-black/10">
                  <span>{ct.name} ({ct.fields.map((f) => `${f.name} ${f.type}`).join(", ")}){(() => { const u = getCompositeTypeUsage(graph, ct.name); return u.length > 0 ? ` — ${u.length} uses` : ""; })()}</span>
                  <div className="flex gap-1"><button onClick={() => openEditCompositeType(ct)} className="text-signal-black font-bold text-[0.6rem]">E</button><button onClick={() => deleteCompositeType(ct.id)} className="text-watermelon font-bold">X</button></div>
                </div>
              ))}
            </div>
          )}
          {/* Roles */}
          {(graph.roles || []).length > 0 && (
            <div className="border-2 border-signal-black p-3 bg-white">
              <h4 className="font-bold text-[0.75rem] uppercase tracking-wider mb-2">ROLES & PERMISSIONS</h4>
              {(graph.roles || []).map((r) => (
                <div key={r.id} className="flex items-center justify-between font-mono text-[0.75rem] py-1 border-b border-dashed border-black/10">
                  <span>{r.name} {r.login ? "LOGIN" : ""} {r.superuser ? "SUPER" : ""}{r.grants?.length ? ` (${r.grants.length} grants)` : ""}{(() => { const pc = getRoleDependents(graph, r.name).length; return pc > 0 ? ` ${pc} policies` : ""; })()}</span>
                  <div className="flex gap-1"><button onClick={() => openEditRole(r)} className="text-signal-black font-bold text-[0.6rem]">E</button><button onClick={() => { const deps = getRoleDependents(graph, r.name); if (deps.length > 0 && !window.confirm(`Delete role "${r.name}"? Referenced by policies: ${deps.join(", ")}`)) return; deleteRole(r.id); }} className="text-watermelon font-bold">X</button></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
                      {((graph.enumTypes || []).length > 0 || (graph.domainTypes || []).length > 0 || (graph.compositeTypes || []).length > 0) && <option disabled>── CUSTOM TYPES ──</option>}
                      {(graph.enumTypes || []).map((en) => <option key={en.id} value={en.name.toLowerCase()}>{en.name} (ENUM)</option>)}
                      {(graph.domainTypes || []).map((d) => <option key={d.id} value={d.name.toLowerCase()}>{d.name} (DOMAIN)</option>)}
                      {(graph.compositeTypes || []).map((ct) => <option key={ct.id} value={ct.name.toLowerCase()}>{ct.name} (TYPE)</option>)}
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

            {/* ── Add/Edit Relation ── */}
            {(modal === "addRelation" || modal === "editRelation") && (
              <>
                <h2 className="font-bold text-[1.1rem] uppercase tracking-wider mb-4">{editRelId ? "EDIT" : "ADD"} RELATION</h2>
                <form onSubmit={(e) => { e.preventDefault(); saveRelation(); }} className="flex flex-col gap-4">
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
                  <div className="grid grid-cols-2 gap-4">
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
                      <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">ON UPDATE</label>
                      <select className="nb-input w-full" value={formRelOnUpdate} onChange={(e) => setFormRelOnUpdate(e.target.value as OnDeleteAction)}>
                        <option value="NO ACTION">NO ACTION</option>
                        <option value="CASCADE">CASCADE</option>
                        <option value="SET NULL">SET NULL</option>
                        <option value="RESTRICT">RESTRICT</option>
                        <option value="SET DEFAULT">SET DEFAULT</option>
                      </select>
                    </div>
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

            {/* ── Add/Edit Enum ── */}
            {(modal === "addEnum" || modal === "editEnum") && (
              <>
                <h2 className="font-bold text-[1.1rem] uppercase tracking-wider mb-4">{editObjId ? "EDIT" : "ADD"} ENUM TYPE</h2>
                <form onSubmit={(e) => { e.preventDefault(); saveEnum(); }} className="flex flex-col gap-4">
                  <div>
                    <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">ENUM NAME</label>
                    <input className="nb-input w-full" value={formEnumName} onChange={(e) => setFormEnumName(e.target.value)} placeholder="e.g. OrderStatus" autoFocus />
                  </div>
                  <div>
                    <label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">VALUES (comma-separated)</label>
                    <input className="nb-input w-full" value={formEnumValues} onChange={(e) => setFormEnumValues(e.target.value)} placeholder="e.g. PENDING, ACTIVE, COMPLETED, CANCELLED" />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="nb-btn nb-btn--primary">CREATE</button>
                    <button type="button" className="nb-btn" onClick={() => setModal(null)}>CANCEL</button>
                  </div>
                </form>
              </>
            )}

            {/* ── Generic Object Modals ── */}
            {(modal === "addView" || modal === "editView") && (
              <>
                <h2 className="font-bold text-[1.1rem] uppercase tracking-wider mb-4">{editObjId ? "EDIT" : "ADD"} VIEW</h2>
                <form onSubmit={(e) => { e.preventDefault(); saveView(); }} className="flex flex-col gap-4">
                  <div><label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">VIEW NAME</label><input className="nb-input w-full" value={formObj.name || ""} onChange={(e) => setFormObj((p) => ({ ...p, name: e.target.value }))} autoFocus /></div>
                  <div><label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">SQL QUERY</label><textarea className="nb-input nb-textarea w-full font-mono text-[0.8rem]" rows={6} value={formObj.query || ""} onChange={(e) => setFormObj((p) => ({ ...p, query: e.target.value }))} placeholder="SELECT * FROM ..." /></div>
                  <label className="flex items-center gap-2 font-mono text-[0.8rem] uppercase cursor-pointer"><input type="checkbox" checked={formObj.materialized === "true"} onChange={(e) => setFormObj((p) => ({ ...p, materialized: e.target.checked ? "true" : "" }))} className="w-4 h-4" />MATERIALIZED</label>
                  <div className="flex gap-3"><button type="submit" className="nb-btn nb-btn--primary">CREATE</button><button type="button" className="nb-btn" onClick={() => setModal(null)}>CANCEL</button></div>
                </form>
              </>
            )}
            {(modal === "addSequence" || modal === "editSequence") && (
              <>
                <h2 className="font-bold text-[1.1rem] uppercase tracking-wider mb-4">{editObjId ? "EDIT" : "ADD"} SEQUENCE</h2>
                <form onSubmit={(e) => { e.preventDefault(); saveSequence(); }} className="flex flex-col gap-4">
                  <div><label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">SEQUENCE NAME</label><input className="nb-input w-full" value={formObj.name || ""} onChange={(e) => setFormObj((p) => ({ ...p, name: e.target.value }))} autoFocus /></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="font-bold text-[0.75rem] uppercase mb-1 block">START</label><input className="nb-input w-full" type="number" value={formObj.start || ""} onChange={(e) => setFormObj((p) => ({ ...p, start: e.target.value }))} /></div>
                    <div><label className="font-bold text-[0.75rem] uppercase mb-1 block">INCREMENT</label><input className="nb-input w-full" type="number" value={formObj.increment || ""} onChange={(e) => setFormObj((p) => ({ ...p, increment: e.target.value }))} /></div>
                    <div><label className="font-bold text-[0.75rem] uppercase mb-1 block">OWNED BY</label><select className="nb-input w-full" value={formObj.ownedBy || ""} onChange={(e) => setFormObj((p) => ({ ...p, ownedBy: e.target.value }))}><option value="">None</option>{graph.entities.flatMap((en) => en.fields.map((f) => ({ label: `${en.name.toLowerCase()}.${f.name}`, value: `${en.name.toLowerCase()}.${f.name}` }))).map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>
                  </div>
                  <label className="flex items-center gap-2 font-mono text-[0.8rem] uppercase cursor-pointer"><input type="checkbox" checked={formObj.cycle === "true"} onChange={(e) => setFormObj((p) => ({ ...p, cycle: e.target.checked ? "true" : "" }))} className="w-4 h-4" />CYCLE</label>
                  <div className="flex gap-3"><button type="submit" className="nb-btn nb-btn--primary">CREATE</button><button type="button" className="nb-btn" onClick={() => setModal(null)}>CANCEL</button></div>
                </form>
              </>
            )}
            {(modal === "addFunction" || modal === "editFunction") && (
              <>
                <h2 className="font-bold text-[1.1rem] uppercase tracking-wider mb-4">{editObjId ? "EDIT" : "ADD"} FUNCTION</h2>
                <form onSubmit={(e) => { e.preventDefault(); saveFunction(); }} className="flex flex-col gap-4">
                  <div><label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">FUNCTION NAME</label><input className="nb-input w-full" value={formObj.name || ""} onChange={(e) => setFormObj((p) => ({ ...p, name: e.target.value }))} autoFocus /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="font-bold text-[0.75rem] uppercase mb-1 block">PARAMETERS</label><input className="nb-input w-full" value={formObj.params || ""} onChange={(e) => setFormObj((p) => ({ ...p, params: e.target.value }))} placeholder="p_id INT, p_name TEXT" /></div>
                    <div><label className="font-bold text-[0.75rem] uppercase mb-1 block">RETURNS</label><input className="nb-input w-full" value={formObj.returnType || ""} onChange={(e) => setFormObj((p) => ({ ...p, returnType: e.target.value }))} placeholder="void, INTEGER, TABLE(...)" /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="font-bold text-[0.75rem] uppercase mb-1 block">LANGUAGE</label><select className="nb-input w-full" value={formObj.language || "plpgsql"} onChange={(e) => setFormObj((p) => ({ ...p, language: e.target.value }))}><option value="plpgsql">PLPGSQL</option><option value="sql">SQL</option><option value="plpython3u">PLPYTHON3U</option></select></div>
                    <div><label className="font-bold text-[0.75rem] uppercase mb-1 block">VOLATILITY</label><select className="nb-input w-full" value={formObj.volatility || ""} onChange={(e) => setFormObj((p) => ({ ...p, volatility: e.target.value }))}><option value="">DEFAULT</option><option value="IMMUTABLE">IMMUTABLE</option><option value="STABLE">STABLE</option><option value="VOLATILE">VOLATILE</option></select></div>
                    <div><label className="font-bold text-[0.75rem] uppercase mb-1 block">SECURITY</label><select className="nb-input w-full" value={formObj.security || ""} onChange={(e) => setFormObj((p) => ({ ...p, security: e.target.value }))}><option value="">INVOKER</option><option value="DEFINER">DEFINER</option></select></div>
                  </div>
                  <div><label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">FUNCTION BODY</label><textarea className="nb-input nb-textarea w-full font-mono text-[0.8rem]" rows={8} value={formObj.body || ""} onChange={(e) => setFormObj((p) => ({ ...p, body: e.target.value }))} placeholder="BEGIN&#10;  -- logic here&#10;  RETURN result;&#10;END;" /></div>
                  <div className="flex gap-3"><button type="submit" className="nb-btn nb-btn--primary">CREATE</button><button type="button" className="nb-btn" onClick={() => setModal(null)}>CANCEL</button></div>
                </form>
              </>
            )}
            {(modal === "addTrigger" || modal === "editTrigger") && (
              <>
                <h2 className="font-bold text-[1.1rem] uppercase tracking-wider mb-4">{editObjId ? "EDIT" : "ADD"} TRIGGER</h2>
                <form onSubmit={(e) => { e.preventDefault(); saveTrigger(); }} className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="font-bold text-[0.75rem] uppercase mb-1 block">TRIGGER NAME</label><input className="nb-input w-full" value={formObj.name || ""} onChange={(e) => setFormObj((p) => ({ ...p, name: e.target.value }))} autoFocus /></div>
                    <div><label className="font-bold text-[0.75rem] uppercase mb-1 block">TABLE</label><select className="nb-input w-full" value={formObj.tableName || ""} onChange={(e) => setFormObj((p) => ({ ...p, tableName: e.target.value }))}><option value="">Select...</option>{graph.entities.map((en) => <option key={en.id} value={en.name.toLowerCase()}>{en.name}</option>)}</select></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="font-bold text-[0.75rem] uppercase mb-1 block">TIMING</label><select className="nb-input w-full" value={formObj.timing || "BEFORE"} onChange={(e) => setFormObj((p) => ({ ...p, timing: e.target.value }))}><option value="BEFORE">BEFORE</option><option value="AFTER">AFTER</option><option value="INSTEAD OF">INSTEAD OF</option></select></div>
                    <div><label className="font-bold text-[0.75rem] uppercase mb-1 block">EVENTS</label><input className="nb-input w-full" value={formObj.events || "INSERT"} onChange={(e) => setFormObj((p) => ({ ...p, events: e.target.value }))} placeholder="INSERT,UPDATE,DELETE" /></div>
                    <div><label className="font-bold text-[0.75rem] uppercase mb-1 block">FOR EACH</label><select className="nb-input w-full" value={formObj.forEach || "ROW"} onChange={(e) => setFormObj((p) => ({ ...p, forEach: e.target.value }))}><option value="ROW">ROW</option><option value="STATEMENT">STATEMENT</option></select></div>
                  </div>
                  <div><label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">EXECUTE FUNCTION</label><select className="nb-input w-full" value={formObj.functionName || ""} onChange={(e) => setFormObj((p) => ({ ...p, functionName: e.target.value }))}><option value="">Select or type...</option>{(graph.functions || []).map((fn) => <option key={fn.id} value={fn.name}>{fn.name}</option>)}</select></div>
                  <div><label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">WHEN (optional)</label><input className="nb-input w-full" value={formObj.whenExpr || ""} onChange={(e) => setFormObj((p) => ({ ...p, whenExpr: e.target.value }))} placeholder="OLD.status IS DISTINCT FROM NEW.status" /></div>
                  <div className="flex gap-3"><button type="submit" className="nb-btn nb-btn--primary">CREATE</button><button type="button" className="nb-btn" onClick={() => setModal(null)}>CANCEL</button></div>
                </form>
              </>
            )}
            {(modal === "addPolicy" || modal === "editPolicy") && (
              <>
                <h2 className="font-bold text-[1.1rem] uppercase tracking-wider mb-4">{editObjId ? "EDIT" : "ADD"} RLS POLICY</h2>
                <form onSubmit={(e) => { e.preventDefault(); savePolicy(); }} className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="font-bold text-[0.75rem] uppercase mb-1 block">POLICY NAME</label><input className="nb-input w-full" value={formObj.name || ""} onChange={(e) => setFormObj((p) => ({ ...p, name: e.target.value }))} autoFocus /></div>
                    <div><label className="font-bold text-[0.75rem] uppercase mb-1 block">TABLE</label><select className="nb-input w-full" value={formObj.tableName || ""} onChange={(e) => setFormObj((p) => ({ ...p, tableName: e.target.value }))}><option value="">Select...</option>{graph.entities.map((en) => <option key={en.id} value={en.name.toLowerCase()}>{en.name}</option>)}</select></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="font-bold text-[0.75rem] uppercase mb-1 block">COMMAND</label><select className="nb-input w-full" value={formObj.command || "ALL"} onChange={(e) => setFormObj((p) => ({ ...p, command: e.target.value }))}><option value="ALL">ALL</option><option value="SELECT">SELECT</option><option value="INSERT">INSERT</option><option value="UPDATE">UPDATE</option><option value="DELETE">DELETE</option></select></div>
                    <div><label className="font-bold text-[0.75rem] uppercase mb-1 block">ROLES</label><input className="nb-input w-full" value={formObj.roles || ""} onChange={(e) => setFormObj((p) => ({ ...p, roles: e.target.value }))} placeholder={(graph.roles || []).map((r) => r.name).join(", ") || "app_user, admin"} list="role-hints" />{(graph.roles || []).length > 0 && <datalist id="role-hints">{(graph.roles || []).map((r) => <option key={r.id} value={r.name} />)}</datalist>}</div>
                  </div>
                  <div><label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">USING (read filter)</label><input className="nb-input w-full" value={formObj.usingExpr || ""} onChange={(e) => setFormObj((p) => ({ ...p, usingExpr: e.target.value }))} placeholder="user_id = current_user_id()" /></div>
                  <div><label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">WITH CHECK (write filter)</label><input className="nb-input w-full" value={formObj.checkExpr || ""} onChange={(e) => setFormObj((p) => ({ ...p, checkExpr: e.target.value }))} placeholder="user_id = current_user_id()" /></div>
                  <div className="flex gap-3"><button type="submit" className="nb-btn nb-btn--primary">CREATE</button><button type="button" className="nb-btn" onClick={() => setModal(null)}>CANCEL</button></div>
                </form>
              </>
            )}
            {(modal === "addExtension") && (
              <>
                <h2 className="font-bold text-[1.1rem] uppercase tracking-wider mb-4">ADD EXTENSION</h2>
                <form onSubmit={(e) => { e.preventDefault(); saveExtension(); }} className="flex flex-col gap-4">
                  <div><label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">EXTENSION NAME</label><select className="nb-input w-full" value={formObj.name || ""} onChange={(e) => setFormObj((p) => ({ ...p, name: e.target.value }))}><option value="">Select...</option>
                    {["uuid-ossp", "pgcrypto", "postgis", "citext", "pg_trgm", "pgvector", "hstore", "ltree", "btree_gist", "btree_gin", "tablefunc", "pg_stat_statements", "timescaledb", "postgis_topology"].map((ext) => <option key={ext} value={ext}>{ext}</option>)}
                  </select></div>
                  <div className="flex gap-3"><button type="submit" className="nb-btn nb-btn--primary">ADD</button><button type="button" className="nb-btn" onClick={() => setModal(null)}>CANCEL</button></div>
                </form>
              </>
            )}
            {(modal === "addIndex" || modal === "editIndex") && (
              <>
                <h2 className="font-bold text-[1.1rem] uppercase tracking-wider mb-4">{editObjId ? "EDIT" : "ADD"} INDEX</h2>
                <form onSubmit={(e) => { e.preventDefault(); saveAdvancedIndex(); }} className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="font-bold text-[0.75rem] uppercase mb-1 block">INDEX NAME</label><input className="nb-input w-full" value={formObj.name || ""} onChange={(e) => setFormObj((p) => ({ ...p, name: e.target.value }))} autoFocus /></div>
                    <div><label className="font-bold text-[0.75rem] uppercase mb-1 block">TABLE</label><select className="nb-input w-full" value={formObj.tableName || ""} onChange={(e) => setFormObj((p) => ({ ...p, tableName: e.target.value }))}><option value="">Select...</option>{graph.entities.map((en) => <option key={en.id} value={en.name.toLowerCase()}>{en.name}</option>)}</select></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="font-bold text-[0.75rem] uppercase mb-1 block">COLUMNS (comma-sep)</label><input className="nb-input w-full" value={formObj.columns || ""} onChange={(e) => setFormObj((p) => ({ ...p, columns: e.target.value }))} placeholder="col1, col2" /></div>
                    <div><label className="font-bold text-[0.75rem] uppercase mb-1 block">OR EXPRESSION</label><input className="nb-input w-full" value={formObj.expression || ""} onChange={(e) => setFormObj((p) => ({ ...p, expression: e.target.value }))} placeholder="lower(email)" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="font-bold text-[0.75rem] uppercase mb-1 block">TYPE</label><select className="nb-input w-full" value={formObj.type || ""} onChange={(e) => setFormObj((p) => ({ ...p, type: e.target.value }))}><option value="">BTREE (default)</option><option value="GIN">GIN</option><option value="GIST">GiST</option><option value="BRIN">BRIN</option><option value="HASH">HASH</option><option value="SPGIST">SP-GiST</option></select></div>
                    <div><label className="font-bold text-[0.75rem] uppercase mb-1 block">INCLUDE (covering)</label><input className="nb-input w-full" value={formObj.includeColumns || ""} onChange={(e) => setFormObj((p) => ({ ...p, includeColumns: e.target.value }))} placeholder="col3, col4" /></div>
                  </div>
                  <div><label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">WHERE (partial index)</label><input className="nb-input w-full" value={formObj.whereClause || ""} onChange={(e) => setFormObj((p) => ({ ...p, whereClause: e.target.value }))} placeholder="status = 'active'" /></div>
                  <label className="flex items-center gap-2 font-mono text-[0.8rem] uppercase cursor-pointer"><input type="checkbox" checked={formObj.isUnique === "true"} onChange={(e) => setFormObj((p) => ({ ...p, isUnique: e.target.checked ? "true" : "" }))} className="w-4 h-4" />UNIQUE</label>
                  <div className="flex gap-3"><button type="submit" className="nb-btn nb-btn--primary">CREATE</button><button type="button" className="nb-btn" onClick={() => setModal(null)}>CANCEL</button></div>
                </form>
              </>
            )}
            {(modal === "addDomain" || modal === "editDomain") && (
              <>
                <h2 className="font-bold text-[1.1rem] uppercase tracking-wider mb-4">{editObjId ? "EDIT" : "ADD"} DOMAIN TYPE</h2>
                <form onSubmit={(e) => { e.preventDefault(); saveDomain(); }} className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="font-bold text-[0.75rem] uppercase mb-1 block">DOMAIN NAME</label><input className="nb-input w-full" value={formObj.name || ""} onChange={(e) => setFormObj((p) => ({ ...p, name: e.target.value }))} autoFocus placeholder="e.g. email_address" /></div>
                    <div><label className="font-bold text-[0.75rem] uppercase mb-1 block">BASE TYPE</label><input className="nb-input w-full" value={formObj.baseType || ""} onChange={(e) => setFormObj((p) => ({ ...p, baseType: e.target.value }))} placeholder="TEXT, INTEGER, etc." /></div>
                  </div>
                  <div><label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">CHECK CONSTRAINT</label><input className="nb-input w-full" value={formObj.checkExpr || ""} onChange={(e) => setFormObj((p) => ({ ...p, checkExpr: e.target.value }))} placeholder="VALUE ~ '^.+@.+$'" /></div>
                  <div><label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">DEFAULT VALUE</label><input className="nb-input w-full" value={formObj.defaultValue || ""} onChange={(e) => setFormObj((p) => ({ ...p, defaultValue: e.target.value }))} /></div>
                  <label className="flex items-center gap-2 font-mono text-[0.8rem] uppercase cursor-pointer"><input type="checkbox" checked={formObj.notNull === "true"} onChange={(e) => setFormObj((p) => ({ ...p, notNull: e.target.checked ? "true" : "" }))} className="w-4 h-4" />NOT NULL</label>
                  <div className="flex gap-3"><button type="submit" className="nb-btn nb-btn--primary">CREATE</button><button type="button" className="nb-btn" onClick={() => setModal(null)}>CANCEL</button></div>
                </form>
              </>
            )}

            {/* ── Composite Type ── */}
            {(modal === "addCompositeType" || modal === "editCompositeType") && (
              <>
                <h2 className="font-bold text-[1.1rem] uppercase tracking-wider mb-4">{editObjId ? "EDIT" : "ADD"} COMPOSITE TYPE</h2>
                <form onSubmit={(e) => { e.preventDefault(); saveCompositeType(); }} className="flex flex-col gap-4">
                  <div><label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">TYPE NAME</label><input className="nb-input w-full" value={formObj.name || ""} onChange={(e) => setFormObj((p) => ({ ...p, name: e.target.value }))} autoFocus placeholder="e.g. address" /></div>
                  <div><label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">FIELDS (name type, comma-separated)</label><input className="nb-input w-full" value={formObj.fields || ""} onChange={(e) => setFormObj((p) => ({ ...p, fields: e.target.value }))} placeholder="street TEXT, city TEXT, zip VARCHAR(10)" /></div>
                  <div className="flex gap-3"><button type="submit" className="nb-btn nb-btn--primary">CREATE</button><button type="button" className="nb-btn" onClick={() => setModal(null)}>CANCEL</button></div>
                </form>
              </>
            )}
            {/* ── Role ── */}
            {(modal === "addRole" || modal === "editRole") && (
              <>
                <h2 className="font-bold text-[1.1rem] uppercase tracking-wider mb-4">{editObjId ? "EDIT" : "ADD"} ROLE</h2>
                <form onSubmit={(e) => { e.preventDefault(); saveRole(); }} className="flex flex-col gap-4">
                  <div><label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">ROLE NAME</label><input className="nb-input w-full" value={formObj.name || ""} onChange={(e) => setFormObj((p) => ({ ...p, name: e.target.value }))} autoFocus placeholder="e.g. app_user" /></div>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { label: "LOGIN", key: "login" },
                      { label: "SUPERUSER", key: "superuser" },
                      { label: "CREATEDB", key: "createdb" },
                      { label: "CREATEROLE", key: "createrole" },
                    ].map((opt) => (
                      <label key={opt.key} className="flex items-center gap-2 font-mono text-[0.8rem] uppercase cursor-pointer">
                        <input type="checkbox" checked={formObj[opt.key] === "true"} onChange={(e) => setFormObj((p) => ({ ...p, [opt.key]: e.target.checked ? "true" : "" }))} className="w-4 h-4" />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                  <div><label className="font-bold text-[0.85rem] uppercase tracking-wider mb-1 block">GRANTS (target privileges; per line)</label><input className="nb-input w-full" value={formObj.grants || ""} onChange={(e) => setFormObj((p) => ({ ...p, grants: e.target.value }))} placeholder="users SELECT INSERT; projects ALL" /></div>
                  <div className="flex gap-3"><button type="submit" className="nb-btn nb-btn--primary">CREATE</button><button type="button" className="nb-btn" onClick={() => setModal(null)}>CANCEL</button></div>
                </form>
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
