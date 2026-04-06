/* ══════════════════════════════════════════════════════════════════════
   Schema Planner Types — shared across all schema components
   ══════════════════════════════════════════════════════════════════════ */

export interface SchemaField {
  id: string;
  name: string;
  type: string;
  length?: number;
  precision?: number;
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

export interface SchemaEntity {
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

export interface CompositeType {
  id: string;
  name: string;
  fields: { name: string; type: string }[];
}

export interface SchemaRole {
  id: string;
  name: string;
  login?: boolean;
  superuser?: boolean;
  createdb?: boolean;
  createrole?: boolean;
  inherit?: boolean;
  grants?: { target: string; privileges: string[] }[];
}

export interface EnumType {
  id: string;
  name: string;
  values: string[];
  schema?: string;
}

export interface DomainType {
  id: string;
  name: string;
  baseType: string;
  notNull?: boolean;
  defaultValue?: string;
  checkExpr?: string;
}

export interface SchemaView {
  id: string;
  name: string;
  query: string;
  isMaterialized?: boolean;
  schema?: string;
  x: number;
  y: number;
}

export interface SchemaSequence {
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

export interface SchemaFunction {
  id: string;
  name: string;
  params: string;
  returnType: string;
  language: string;
  body: string;
  volatility?: "IMMUTABLE" | "STABLE" | "VOLATILE";
  security?: "DEFINER" | "INVOKER";
}

export interface SchemaTrigger {
  id: string;
  name: string;
  timing: "BEFORE" | "AFTER" | "INSTEAD OF";
  events: string[];
  tableName: string;
  forEach: "ROW" | "STATEMENT";
  functionName: string;
  whenExpr?: string;
}

export interface SchemaPolicy {
  id: string;
  name: string;
  tableName: string;
  command: "ALL" | "SELECT" | "INSERT" | "UPDATE" | "DELETE";
  usingExpr?: string;
  checkExpr?: string;
  roles?: string[];
}

export interface SchemaExtension {
  id: string;
  name: string;
  schema?: string;
}

export interface SchemaIndex {
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

export type OnDeleteAction = "CASCADE" | "SET NULL" | "RESTRICT" | "NO ACTION" | "SET DEFAULT";

export interface SchemaRelation {
  id: string;
  fromEntityId: string;
  toEntityId: string;
  type: "1:1" | "1:N" | "N:N";
  fkFieldName?: string;
  fkColumns?: string[];
  refColumns?: string[];
  onDelete?: OnDeleteAction;
  onUpdate?: OnDeleteAction;
  constraintName?: string;
  isDeferrable?: boolean;
  isDeferred?: boolean;
}

export interface SchemaGraph {
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

export type ModalMode = null | "addEntity" | "editEntity" | "addField" | "editField" | "addRelation" | "editRelation" | "import" | "export" | "addEnum" | "editEnum" | "addView" | "editView" | "addSequence" | "editSequence" | "addFunction" | "editFunction" | "addTrigger" | "editTrigger" | "addPolicy" | "editPolicy" | "addExtension" | "addIndex" | "editIndex" | "addDomain" | "editDomain" | "addCompositeType" | "editCompositeType" | "addRole" | "editRole";

export const FIELD_TYPES = [
  "int", "bigint", "smallint", "serial", "bigserial", "float", "decimal", "numeric", "real", "double", "money",
  "string", "varchar", "char", "text", "citext",
  "boolean",
  "datetime", "timestamp", "timestamptz", "date", "time", "timetz", "interval",
  "bytes", "bytea",
  "uuid",
  "json", "jsonb",
  "inet", "cidr", "macaddr",
  "tsvector", "tsquery",
  "int4range", "int8range", "numrange", "tsrange", "tstzrange", "daterange",
  "array", "enum", "xml", "point", "line", "box", "polygon", "circle", "vector",
];

export const HEADER_COLORS: Record<string, { bg: string; text: string }> = {
  "signal-black": { bg: "#282828", text: "#FFFFFF" },
  "watermelon": { bg: "#FF5E54", text: "#FFFFFF" },
  "malachite": { bg: "#2BBF5D", text: "#FFFFFF" },
  "cornflower": { bg: "#6C8EBF", text: "#FFFFFF" },
  "amethyst": { bg: "#A259FF", text: "#FFFFFF" },
  "lemon": { bg: "#FFE459", text: "#282828" },
  "orange": { bg: "#FF6D28", text: "#FFFFFF" },
  "slate": { bg: "#708090", text: "#FFFFFF" },
};

/* ── Utilities ── */

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function badgeFor(f: SchemaField): "pk" | "fk" | "unique" | null {
  if (f.isPK) return "pk";
  if (f.isFK) return "fk";
  if (f.unique) return "unique";
  return null;
}

export function badgeClasses(badge: "pk" | "fk" | "unique"): string {
  switch (badge) {
    case "pk": return "bg-watermelon text-white";
    case "fk": return "bg-malachite";
    case "unique": return "bg-creamy-milk";
  }
}

export function badgeLabel(badge: "pk" | "fk" | "unique"): string {
  switch (badge) {
    case "pk": return "PK";
    case "fk": return "FK";
    case "unique": return "UQ";
  }
}

/* ── Cross-object linkage helpers ── */

export function getEnumUsage(graph: SchemaGraph, enumName: string): string[] {
  const uses: string[] = [];
  for (const e of graph.entities) for (const f of e.fields) if (f.type.toLowerCase() === enumName.toLowerCase()) uses.push(`${e.name}.${f.name}`);
  return uses;
}

export function getDomainUsage(graph: SchemaGraph, domainName: string): string[] {
  const uses: string[] = [];
  for (const e of graph.entities) for (const f of e.fields) if (f.type.toLowerCase() === domainName.toLowerCase()) uses.push(`${e.name}.${f.name}`);
  return uses;
}

export function getCompositeTypeUsage(graph: SchemaGraph, typeName: string): string[] {
  const uses: string[] = [];
  for (const e of graph.entities) for (const f of e.fields) if (f.type.toLowerCase() === typeName.toLowerCase()) uses.push(`${e.name}.${f.name}`);
  return uses;
}

export function getTableTriggerCount(graph: SchemaGraph, tableName: string): number {
  return (graph.triggers || []).filter((t) => t.tableName.toLowerCase() === tableName.toLowerCase()).length;
}

export function getTableIndexCount(graph: SchemaGraph, tableName: string): number {
  return (graph.indexes || []).filter((i) => i.tableName.toLowerCase() === tableName.toLowerCase()).length;
}

export function getTablePolicyCount(graph: SchemaGraph, tableName: string): number {
  return (graph.policies || []).filter((p) => p.tableName.toLowerCase() === tableName.toLowerCase()).length;
}

export function getTableGrantCount(graph: SchemaGraph, tableName: string): number {
  return (graph.roles || []).reduce((count, r) => count + (r.grants || []).filter((g) => g.target.toLowerCase() === tableName.toLowerCase()).length, 0);
}

export function getViewDependencies(query: string, entities: SchemaEntity[]): string[] {
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

export function getTableDependents(graph: SchemaGraph, tableName: string): { type: string; name: string }[] {
  const tl = tableName.toLowerCase();
  const deps: { type: string; name: string }[] = [];
  for (const r of graph.relations) {
    const from = graph.entities.find((e) => e.id === r.fromEntityId);
    const to = graph.entities.find((e) => e.id === r.toEntityId);
    if (from?.name.toLowerCase() === tl || to?.name.toLowerCase() === tl) deps.push({ type: "relation", name: `${from?.name}→${to?.name}` });
  }
  for (const t of graph.triggers || []) if (t.tableName.toLowerCase() === tl) deps.push({ type: "trigger", name: t.name });
  for (const p of graph.policies || []) if (p.tableName.toLowerCase() === tl) deps.push({ type: "policy", name: p.name });
  for (const i of graph.indexes || []) if (i.tableName.toLowerCase() === tl) deps.push({ type: "index", name: i.name });
  for (const v of graph.views || []) if (getViewDependencies(v.query, graph.entities).includes(tableName.toUpperCase())) deps.push({ type: "view", name: v.name });
  for (const s of graph.sequences || []) if (s.ownedBy?.toLowerCase().startsWith(tl + ".")) deps.push({ type: "sequence", name: s.name });
  return deps;
}

export function getFunctionDependents(graph: SchemaGraph, fnName: string): string[] {
  return (graph.triggers || []).filter((t) => t.functionName.toLowerCase() === fnName.toLowerCase()).map((t) => t.name);
}

export function getRoleDependents(graph: SchemaGraph, roleName: string): string[] {
  return (graph.policies || []).filter((p) => p.roles?.some((r) => r.toLowerCase() === roleName.toLowerCase())).map((p) => p.name);
}

export const RELATION_COLORS = ["#FF5E54", "#2BBF5D", "#A259FF", "#FFD93D", "#FF6D28"];
