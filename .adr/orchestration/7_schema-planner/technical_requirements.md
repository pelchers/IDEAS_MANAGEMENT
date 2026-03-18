# Technical Requirements — 7_schema-planner

## Libraries
- roughjs — hand-drawn relation lines (same as pass-1)
- No external parsing libraries — inline parsers for Prisma/TS/SQL

## Key Files
- `apps/web/src/app/(authenticated)/projects/[id]/schema/page.tsx` — main schema planner UI
- `apps/web/src/app/api/projects/[id]/artifacts/[...path]/route.ts` — artifact persistence

## Schema Data Model (Artifact JSON)

```typescript
interface SchemaField {
  id: string;
  name: string;
  type: string;        // "string" | "int" | "float" | "boolean" | "datetime" | "text" | "enum" | "array" | "json" | custom
  required: boolean;
  unique: boolean;
  isPK: boolean;
  isFK: boolean;
  fkTarget?: string;   // "EntityName.fieldName" for FK references
}

interface SchemaEntity {
  id: string;
  name: string;
  fields: SchemaField[];
  x: number;           // position on canvas
  y: number;
}

interface SchemaRelation {
  id: string;
  fromEntityId: string;
  toEntityId: string;
  type: "1:1" | "1:N" | "N:N";
  label?: string;
}

interface SchemaGraph {
  entities: SchemaEntity[];
  relations: SchemaRelation[];
  source?: {            // tracks import source for re-sync
    type: "manual" | "github" | "local";
    githubRepo?: string; // "owner/repo"
    importedAt?: string;
  };
}
```

## API Endpoints

### Artifact Persistence (Existing)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects/:id/artifacts/schema/schema.graph.json` | Load schema graph |
| PUT | `/api/projects/:id/artifacts/schema/schema.graph.json` | Save schema graph |

### GitHub Import (New — client-side)
- Uses GitHub REST API directly from browser (no backend proxy needed for public repos)
- `GET https://api.github.com/repos/:owner/:repo/git/trees/HEAD?recursive=1` — fetch file tree
- `GET https://api.github.com/repos/:owner/:repo/contents/:path` — fetch file content (base64)
- Rate limit: 60 requests/hour unauthenticated — sufficient for single repo import

## Parsing Rules

### Prisma Schema (.prisma)
- Match `model <Name> { ... }` blocks
- Parse field lines: `fieldName Type @modifiers`
- Detect `@id` → PK, `@unique` → unique, `@relation` → FK
- Map Prisma types: String→string, Int→int, Float→float, Boolean→boolean, DateTime→datetime, Json→json

### TypeScript (.ts / .tsx)
- Match `interface <Name> { ... }` and `type <Name> = { ... }` blocks
- Parse field lines: `fieldName: Type;` or `fieldName?: Type;`
- `?` → not required, otherwise required
- Map TS types: string, number→int, boolean, Date→datetime, any→json

### SQL (.sql)
- Match `CREATE TABLE <name> ( ... )` blocks
- Parse column definitions: `column_name TYPE constraints`
- Detect PRIMARY KEY, UNIQUE, REFERENCES (FK)
- Map SQL types: VARCHAR/TEXT→string, INTEGER/INT→int, FLOAT/DECIMAL→float, BOOLEAN→boolean, TIMESTAMP→datetime

## Export Formats

### Prisma Export
```prisma
model EntityName {
  fieldName  Type  @id @default(cuid())
  fieldName  Type  @unique
  fieldName  Type
  relatedEntity RelatedEntity @relation(fields: [fkField], references: [id])
}
```

### SQL DDL Export
```sql
CREATE TABLE entity_name (
  field_name TYPE PRIMARY KEY,
  field_name TYPE UNIQUE NOT NULL,
  field_name TYPE,
  FOREIGN KEY (fk_field) REFERENCES other_table(id)
);
```

### JSON Export
Raw `SchemaGraph` object as formatted JSON.
