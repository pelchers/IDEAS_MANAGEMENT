import type { SchemaGraph } from "./schema-types";

export function exportPrisma(graph: SchemaGraph): string {
  const lines: string[] = [];
  if (graph.enumTypes && graph.enumTypes.length > 0) {
    for (const en of graph.enumTypes) {
      lines.push(`enum ${en.name} {`);
      for (const v of en.values) lines.push(`  ${v}`);
      lines.push("}"); lines.push("");
    }
  }
  for (const entity of graph.entities) {
    lines.push(`model ${entity.name} {`);
    for (const f of entity.fields) {
      const enumType = graph.enumTypes?.find((en) => en.name.toLowerCase() === f.type.toLowerCase());
      let pType: string;
      if (enumType) { pType = enumType.name; }
      else {
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
      if (f.isGenerated) continue;
      const optional = !f.required && !f.isPK ? "?" : "";
      const commentStr = f.comment ? ` /// ${f.comment}` : "";
      lines.push(`  ${f.name}  ${pType}${optional}${mods.length ? "  " + mods.join(" ") : ""}${commentStr}`);
    }
    const rels = graph.relations.filter((r) => r.fromEntityId === entity.id || r.toEntityId === entity.id);
    for (const rel of rels) {
      const fromEntity = graph.entities.find((e) => e.id === rel.fromEntityId);
      const toEntity = graph.entities.find((e) => e.id === rel.toEntityId);
      if (!fromEntity || !toEntity) continue;
      if (rel.toEntityId === entity.id) {
        const fkName = rel.fkFieldName || `${fromEntity.name.toLowerCase()}Id`;
        const onDel = rel.onDelete ? `, onDelete: ${rel.onDelete}` : "";
        const hasFk = entity.fields.some((f) => f.name === fkName);
        if (!hasFk) lines.push(`  ${fkName}  String`);
        lines.push(`  ${fromEntity.name.toLowerCase()}  ${fromEntity.name}  @relation(fields: [${fkName}], references: [id]${onDel})`);
      } else if (rel.fromEntityId === entity.id) {
        const isMany = rel.type === "1:N" || rel.type === "N:N";
        if (isMany) lines.push(`  ${toEntity.name.toLowerCase()}s  ${toEntity.name}[]`);
        else lines.push(`  ${toEntity.name.toLowerCase()}  ${toEntity.name}?`);
      }
    }
    if (entity.compositePK && entity.compositePK.length > 0) lines.push(`  @@id([${entity.compositePK.join(", ")}])`);
    if (entity.compositeUniques) for (const cols of entity.compositeUniques) lines.push(`  @@unique([${cols.join(", ")}])`);
    if (entity.schema && entity.schema !== "public") lines.push(`  @@schema("${entity.schema}")`);
    lines.push("}");
    if (entity.comment) lines.push(`/// ${entity.comment}`);
    lines.push("");
  }
  return lines.join("\n");
}

export function exportSql(graph: SchemaGraph): string {
  const lines: string[] = [];
  const indexLines: string[] = [];
  const commentLines: string[] = [];
  if (graph.enumTypes && graph.enumTypes.length > 0) {
    lines.push("-- Enum Types");
    for (const en of graph.enumTypes) { const schema = en.schema && en.schema !== "public" ? `${en.schema}.` : ""; lines.push(`CREATE TYPE ${schema}${en.name.toLowerCase()} AS ENUM (${en.values.map((v) => `'${v}'`).join(", ")});`); }
    lines.push("");
  }
  const schemas = new Set(graph.entities.map((e) => e.schema).filter((s) => s && s !== "public"));
  if (schemas.size > 0) { lines.push("-- Schemas"); for (const s of schemas) lines.push(`CREATE SCHEMA IF NOT EXISTS ${s};`); lines.push(""); }
  for (const entity of graph.entities) {
    const schemaPrefix = entity.schema && entity.schema !== "public" ? `${entity.schema}.` : "";
    const tableName = entity.name.toLowerCase().replace(/\s+/g, "_");
    const qualifiedName = `${schemaPrefix}${tableName}`;
    const unlogged = entity.isUnlogged ? "UNLOGGED " : "";
    lines.push(`CREATE ${unlogged}TABLE ${qualifiedName} (`);
    const colLines: string[] = [];
    for (const f of entity.fields) {
      const enumType = graph.enumTypes?.find((en) => en.name.toLowerCase() === f.type.toLowerCase());
      let sType: string;
      if (enumType) { sType = enumType.name.toLowerCase(); }
      else if (f.isIdentity) { sType = f.type === "bigint" ? "BIGINT" : "INTEGER"; }
      else if (f.type === "array" && f.arrayElementType) {
        const baseMap: Record<string, string> = { string: "VARCHAR(255)", int: "INTEGER", text: "TEXT", boolean: "BOOLEAN", uuid: "UUID", json: "JSONB" };
        sType = `${baseMap[f.arrayElementType] || f.arrayElementType.toUpperCase()}[]`;
      } else {
        const typeMap: Record<string, string> = { string: "VARCHAR(255)", varchar: "VARCHAR", char: "CHAR", text: "TEXT", citext: "CITEXT", int: "INTEGER", bigint: "BIGINT", smallint: "SMALLINT", serial: "SERIAL", bigserial: "BIGSERIAL", float: "REAL", real: "REAL", double: "DOUBLE PRECISION", decimal: "DECIMAL", numeric: "NUMERIC", money: "MONEY", boolean: "BOOLEAN", datetime: "TIMESTAMP", timestamp: "TIMESTAMP", timestamptz: "TIMESTAMPTZ", date: "DATE", time: "TIME", timetz: "TIMETZ", interval: "INTERVAL", uuid: "UUID", json: "JSON", jsonb: "JSONB", bytes: "BYTEA", bytea: "BYTEA", xml: "XML", inet: "INET", cidr: "CIDR", macaddr: "MACADDR", tsvector: "TSVECTOR", tsquery: "TSQUERY", int4range: "INT4RANGE", int8range: "INT8RANGE", numrange: "NUMRANGE", tsrange: "TSRANGE", tstzrange: "TSTZRANGE", daterange: "DATERANGE", point: "POINT", line: "LINE", box: "BOX", polygon: "POLYGON", circle: "CIRCLE", vector: "VECTOR", array: "TEXT[]", enum: "VARCHAR(50)" };
        sType = typeMap[f.type] || "TEXT";
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
      if (f.indexed && !f.isPK && !f.unique) { const idxType = f.indexType && f.indexType !== "BTREE" ? ` USING ${f.indexType}` : ""; indexLines.push(`CREATE INDEX idx_${tableName}_${f.name} ON ${qualifiedName}${idxType} (${f.name});`); }
      if (f.comment) commentLines.push(`COMMENT ON COLUMN ${qualifiedName}.${f.name} IS '${f.comment.replace(/'/g, "''")}';`);
    }
    if (entity.compositePK && entity.compositePK.length > 0) colLines.push(`  CONSTRAINT pk_${tableName} PRIMARY KEY (${entity.compositePK.join(", ")})`);
    if (entity.compositeUniques) entity.compositeUniques.forEach((cols, i) => { colLines.push(`  CONSTRAINT uq_${tableName}_${i} UNIQUE (${cols.join(", ")})`); });
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
        colLines.push(`  CONSTRAINT ${constraintName} FOREIGN KEY (${rel.fkColumns.join(", ")}) REFERENCES ${refTable}(${rel.refColumns.join(", ")}) ON DELETE ${onDel}${onUpd}${deferrable}`);
        indexLines.push(`CREATE INDEX idx_${tableName}_${rel.fkColumns.join("_")} ON ${qualifiedName} (${rel.fkColumns.join(", ")});`);
      } else {
        const fkName = rel.fkFieldName || `${fromEntity.name.toLowerCase()}_id`;
        const hasFk = entity.fields.some((f) => f.name === fkName || f.name === fkName.replace(/_/g, ""));
        if (!hasFk) colLines.push(`  ${fkName} VARCHAR(255) NOT NULL`);
        colLines.push(`  CONSTRAINT ${constraintName} FOREIGN KEY (${fkName}) REFERENCES ${refTable}(id) ON DELETE ${onDel}${onUpd}${deferrable}`);
        indexLines.push(`CREATE INDEX idx_${tableName}_${fkName} ON ${qualifiedName} (${fkName});`);
      }
    }
    lines.push(colLines.join(",\n"));
    let closeTable = ")";
    if (entity.inherits) closeTable += ` INHERITS (${entity.inherits.toLowerCase()})`;
    if (entity.partitionBy && entity.partitionKey) closeTable += ` PARTITION BY ${entity.partitionBy} (${entity.partitionKey})`;
    lines.push(closeTable + ";");
    if (entity.comment) commentLines.push(`COMMENT ON TABLE ${qualifiedName} IS '${entity.comment.replace(/'/g, "''")}';`);
    lines.push("");
  }
  if (indexLines.length > 0) { lines.push("-- Indexes"); lines.push(...indexLines); lines.push(""); }
  if (commentLines.length > 0) { lines.push("-- Comments"); lines.push(...commentLines); lines.push(""); }
  if (graph.extensions && graph.extensions.length > 0) { lines.unshift(""); for (let i = graph.extensions.length - 1; i >= 0; i--) { const ext = graph.extensions[i]; const schema = ext.schema ? ` SCHEMA ${ext.schema}` : ""; lines.unshift(`CREATE EXTENSION IF NOT EXISTS "${ext.name}"${schema};`); } lines.unshift("-- Extensions"); }
  if (graph.domainTypes && graph.domainTypes.length > 0) { lines.push("-- Domain Types"); for (const d of graph.domainTypes) { let def = `CREATE DOMAIN ${d.name} AS ${d.baseType}`; if (d.notNull) def += " NOT NULL"; if (d.defaultValue) def += ` DEFAULT ${d.defaultValue}`; if (d.checkExpr) def += ` CHECK (${d.checkExpr})`; lines.push(def + ";"); } lines.push(""); }
  if (graph.indexes && graph.indexes.length > 0) { lines.push("-- Advanced Indexes"); for (const idx of graph.indexes) { const unique = idx.isUnique ? "UNIQUE " : ""; const using = idx.type && idx.type !== "BTREE" ? ` USING ${idx.type}` : ""; const cols = idx.expression || idx.columns.join(", "); const include = idx.includeColumns?.length ? ` INCLUDE (${idx.includeColumns.join(", ")})` : ""; const where = idx.whereClause ? ` WHERE ${idx.whereClause}` : ""; lines.push(`CREATE ${unique}INDEX ${idx.name} ON ${idx.tableName}${using} (${cols})${include}${where};`); } lines.push(""); }
  if (graph.sequences && graph.sequences.length > 0) { lines.push("-- Sequences"); for (const seq of graph.sequences) { const parts = [`CREATE SEQUENCE ${seq.name}`]; if (seq.dataType) parts.push(`AS ${seq.dataType}`); if (seq.start !== undefined) parts.push(`START WITH ${seq.start}`); if (seq.increment !== undefined) parts.push(`INCREMENT BY ${seq.increment}`); if (seq.minValue !== undefined) parts.push(`MINVALUE ${seq.minValue}`); if (seq.maxValue !== undefined) parts.push(`MAXVALUE ${seq.maxValue}`); if (seq.cycle) parts.push("CYCLE"); lines.push(parts.join(" ") + ";"); if (seq.ownedBy) lines.push(`ALTER SEQUENCE ${seq.name} OWNED BY ${seq.ownedBy};`); } lines.push(""); }
  if (graph.views && graph.views.length > 0) { lines.push("-- Views"); for (const v of graph.views) { const mat = v.isMaterialized ? "MATERIALIZED " : ""; const schema = v.schema && v.schema !== "public" ? `${v.schema}.` : ""; lines.push(`CREATE ${mat}VIEW ${schema}${v.name} AS`); lines.push(`${v.query};`); lines.push(""); } }
  if (graph.functions && graph.functions.length > 0) { lines.push("-- Functions"); for (const fn of graph.functions) { lines.push(`CREATE OR REPLACE FUNCTION ${fn.name}(${fn.params})`); lines.push(`RETURNS ${fn.returnType}`); lines.push(`LANGUAGE ${fn.language}`); if (fn.volatility) lines.push(fn.volatility); if (fn.security === "DEFINER") lines.push("SECURITY DEFINER"); lines.push(`AS $$`); lines.push(fn.body); lines.push(`$$;`); lines.push(""); } }
  if (graph.triggers && graph.triggers.length > 0) { lines.push("-- Triggers"); for (const tr of graph.triggers) { const events = tr.events.join(" OR "); const when = tr.whenExpr ? `\n  WHEN (${tr.whenExpr})` : ""; lines.push(`CREATE TRIGGER ${tr.name}`); lines.push(`  ${tr.timing} ${events} ON ${tr.tableName}`); lines.push(`  FOR EACH ${tr.forEach}${when}`); lines.push(`  EXECUTE FUNCTION ${tr.functionName}();`); lines.push(""); } }
  const rlsTables = graph.entities.filter((e) => e.enableRLS);
  if (rlsTables.length > 0 || (graph.policies && graph.policies.length > 0)) { lines.push("-- Row-Level Security"); for (const t of rlsTables) { const schema = t.schema && t.schema !== "public" ? `${t.schema}.` : ""; lines.push(`ALTER TABLE ${schema}${t.name.toLowerCase()} ENABLE ROW LEVEL SECURITY;`); } if (graph.policies) { for (const p of graph.policies) { const roles = p.roles?.length ? ` TO ${p.roles.join(", ")}` : ""; const using = p.usingExpr ? `\n  USING (${p.usingExpr})` : ""; const check = p.checkExpr ? `\n  WITH CHECK (${p.checkExpr})` : ""; lines.push(`CREATE POLICY ${p.name} ON ${p.tableName}`); lines.push(`  FOR ${p.command}${roles}${using}${check};`); } } lines.push(""); }
  if (graph.compositeTypes && graph.compositeTypes.length > 0) { lines.push("-- Composite Types"); for (const ct of graph.compositeTypes) { const fields = ct.fields.map((f) => `  ${f.name} ${f.type}`).join(",\n"); lines.push(`CREATE TYPE ${ct.name} AS (\n${fields}\n);`); } lines.push(""); }
  if (graph.roles && graph.roles.length > 0) { lines.push("-- Roles & Permissions"); for (const r of graph.roles) { const opts: string[] = []; if (r.login) opts.push("LOGIN"); if (r.superuser) opts.push("SUPERUSER"); if (r.createdb) opts.push("CREATEDB"); if (r.createrole) opts.push("CREATEROLE"); if (r.inherit !== false) opts.push("INHERIT"); lines.push(`CREATE ROLE ${r.name}${opts.length ? " " + opts.join(" ") : ""};`); if (r.grants) { for (const g of r.grants) { lines.push(`GRANT ${g.privileges.join(", ")} ON ${g.target} TO ${r.name};`); } } } lines.push(""); }
  return lines.join("\n");
}

export function exportJson(graph: SchemaGraph): string {
  return JSON.stringify(graph, null, 2);
}

/* ── GitHub API helpers ── */
export interface GhTreeItem { path: string; type: string; url: string }

export async function fetchGhTree(repo: string): Promise<GhTreeItem[]> {
  const res = await fetch(`https://api.github.com/repos/${repo}/git/trees/HEAD?recursive=1`);
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data = await res.json();
  return (data.tree || []).filter((t: GhTreeItem) => t.type === "blob");
}

export async function fetchGhFile(repo: string, path: string): Promise<string> {
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`);
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data = await res.json();
  return atob(data.content.replace(/\n/g, ""));
}

export const PARSEABLE_EXTS = ["prisma", "ts", "tsx", "sql", "json"];

export function isParseableFile(path: string): boolean {
  const ext = path.split(".").pop()?.toLowerCase() || "";
  return PARSEABLE_EXTS.includes(ext);
}
