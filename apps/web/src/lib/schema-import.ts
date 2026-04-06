import { uid, FIELD_TYPES } from "./schema-types";
import type { SchemaEntity, SchemaField } from "./schema-types";

export function parsePrismaSchema(text: string): SchemaEntity[] {
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
      const typeMap: Record<string, string> = { String: "string", Int: "int", Float: "float", Boolean: "boolean", DateTime: "datetime", Json: "json", BigInt: "int", Decimal: "float", Bytes: "string" };
      fType = typeMap[fType] || fType.toLowerCase();
      const isPK = /@id\b/.test(trimmed);
      const isUnique = /@unique\b/.test(trimmed);
      const isFK = /@relation\b/.test(trimmed);
      const isRequired = !fMatch[2].includes("?");
      if (isFK && !FIELD_TYPES.includes(fType)) continue;
      fields.push({ id: uid(), name: fName, type: fType, required: isRequired, unique: isUnique || isPK, isPK, isFK });
    }
    if (fields.length > 0) {
      entities.push({ id: uid(), name, fields, x: 40 + (idx % 3) * 340, y: 40 + Math.floor(idx / 3) * 300 });
      idx++;
    }
  }
  return entities;
}

export function parseTypeScript(text: string): SchemaEntity[] {
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

export function parseSql(text: string): SchemaEntity[] {
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

export function parseFile(fileName: string, content: string): SchemaEntity[] {
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
