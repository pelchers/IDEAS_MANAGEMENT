---
name: querying-postgresql
description: Integrates with PostgreSQL databases for queries, schema management, migrations, and optimization. Use when working with relational data, complex queries, transactions, or database administration.
---

# Querying PostgreSQL

Comprehensive guide to PostgreSQL integration, from basic queries to advanced optimization and schema design.

## What This Skill Does

Master PostgreSQL database operations:

- **Connection management**: Pooling, SSL, connection strings
- **Query execution**: SELECT, INSERT, UPDATE, DELETE
- **Schema design**: Tables, indexes, constraints, relationships
- **Migrations**: Version control for database schema
- **Transactions**: ACID compliance and isolation
- **Performance**: Query optimization, indexing, EXPLAIN

## Quick Start

### Connect to Database

```javascript
node scripts/pg-connect.js "postgresql://user:pass@localhost/db"
```

### Run Query

```bash
node scripts/pg-query.js "SELECT * FROM users LIMIT 10"
```

### Create Migration

```bash
node scripts/pg-migrate.js create add_users_table
```

---

## PostgreSQL Workflow

```mermaid
graph TD
    A[Application] --> B{Database Pool}
    B -->|Query| C[PostgreSQL]
    B -->|Transaction| D[Begin/Commit]

    C --> E{Query Type}
    E -->|SELECT| F[Read Data]
    E -->|INSERT| G[Write Data]
    E -->|UPDATE| H[Modify Data]
    E -->|DELETE| I[Remove Data]

    D --> J[Atomic Operations]
    J --> K{Success?}
    K -->|Yes| L[Commit]
    K -->|No| M[Rollback]

    F --> N[Return Results]
    G --> N
    H --> N

    style N fill:#99ff99
    style L fill:#99ff99
```

---

## Connection Setup

### Using node-postgres (pg)

**Installation**:
```bash
npm install pg
npm install --save-dev @types/node-postgres
```

**Basic connection**:
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'mydb',
  user: 'postgres',
  password: 'password',
  max: 20,  // Max connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Test connection
try {
  const client = await pool.connect();
  console.log('✓ Connected to PostgreSQL');
  client.release();
} catch (error) {
  console.error('✗ Connection failed:', error);
}
```

### Connection String

```typescript
// From environment variable
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false  // For cloud databases
  } : false
});
```

### Connection Pooling

```typescript
// lib/db.ts
import { Pool, QueryResult } from 'pg';

class Database {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20
    });

    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  async query(text: string, params?: any[]): Promise<QueryResult> {
    const start = Date.now();
    const res = await this.pool.query(text, params);
    const duration = Date.now() - start;

    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  }

  async getClient() {
    const client = await this.pool.connect();
    const query = client.query.bind(client);
    const release = client.release.bind(client);

    // Wrap release to ensure it's called
    client.release = () => {
      client.query = query;
      client.release = release;
      return release();
    };

    return client;
  }

  async end() {
    await this.pool.end();
  }
}

export const db = new Database();
```

---

## Basic Queries

### SELECT

```typescript
// Get all users
const result = await db.query('SELECT * FROM users');
console.log(result.rows);

// Get with filter
const result = await db.query(
  'SELECT * FROM users WHERE email = $1',
  ['user@example.com']
);

// Get with multiple conditions
const result = await db.query(
  'SELECT id, name, email FROM users WHERE age > $1 AND active = $2 ORDER BY created_at DESC LIMIT $3',
  [18, true, 10]
);

// Join tables
const result = await db.query(`
  SELECT u.name, u.email, p.title
  FROM users u
  INNER JOIN posts p ON u.id = p.user_id
  WHERE u.active = true
`);
```

### INSERT

```typescript
// Insert single row
const result = await db.query(
  'INSERT INTO users (name, email, age) VALUES ($1, $2, $3) RETURNING *',
  ['John Doe', 'john@example.com', 30]
);

const newUser = result.rows[0];
console.log('Created user:', newUser.id);

// Insert multiple rows
const result = await db.query(`
  INSERT INTO users (name, email)
  VALUES
    ('User 1', 'user1@example.com'),
    ('User 2', 'user2@example.com'),
    ('User 3', 'user3@example.com')
  RETURNING id, name
`);

console.log(`Created ${result.rowCount} users`);
```

### UPDATE

```typescript
// Update single record
const result = await db.query(
  'UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
  ['New Name', 123]
);

// Update with condition
const result = await db.query(
  'UPDATE posts SET published = true WHERE author_id = $1 AND draft = false',
  [userId]
);

console.log(`Updated ${result.rowCount} posts`);

// Update with join
const result = await db.query(`
  UPDATE posts p
  SET views = views + 1
  FROM users u
  WHERE p.user_id = u.id
    AND u.email = $1
`, ['user@example.com']);
```

### DELETE

```typescript
// Delete by ID
const result = await db.query(
  'DELETE FROM users WHERE id = $1',
  [123]
);

// Delete with condition
const result = await db.query(
  'DELETE FROM posts WHERE created_at < NOW() - INTERVAL \'30 days\' AND published = false'
);

console.log(`Deleted ${result.rowCount} old drafts`);

// Soft delete (recommended)
const result = await db.query(
  'UPDATE users SET deleted_at = NOW() WHERE id = $1',
  [userId]
);
```

---

## Advanced Queries

### Subqueries

```typescript
// Scalar subquery
const result = await db.query(`
  SELECT
    u.name,
    (SELECT COUNT(*) FROM posts WHERE user_id = u.id) as post_count
  FROM users u
`);

// IN subquery
const result = await db.query(`
  SELECT * FROM posts
  WHERE user_id IN (
    SELECT id FROM users WHERE premium = true
  )
`);

// EXISTS subquery
const result = await db.query(`
  SELECT u.* FROM users u
  WHERE EXISTS (
    SELECT 1 FROM posts p
    WHERE p.user_id = u.id AND p.published = true
  )
`);
```

### Common Table Expressions (CTEs)

```typescript
const result = await db.query(`
  WITH active_users AS (
    SELECT id, name FROM users WHERE active = true
  ),
  user_stats AS (
    SELECT
      user_id,
      COUNT(*) as post_count,
      MAX(created_at) as last_post
    FROM posts
    GROUP BY user_id
  )
  SELECT
    au.name,
    us.post_count,
    us.last_post
  FROM active_users au
  LEFT JOIN user_stats us ON au.id = us.user_id
`);
```

### Window Functions

```typescript
// Row number
const result = await db.query(`
  SELECT
    name,
    email,
    ROW_NUMBER() OVER (ORDER BY created_at DESC) as row_num
  FROM users
`);

// Rank and dense rank
const result = await db.query(`
  SELECT
    name,
    score,
    RANK() OVER (ORDER BY score DESC) as rank,
    DENSE_RANK() OVER (ORDER BY score DESC) as dense_rank
  FROM users
`);

// Partition by
const result = await db.query(`
  SELECT
    category,
    title,
    views,
    AVG(views) OVER (PARTITION BY category) as avg_views_in_category
  FROM posts
`);
```

### Aggregations

```typescript
// Basic aggregation
const result = await db.query(`
  SELECT
    COUNT(*) as total_users,
    AVG(age) as average_age,
    MIN(created_at) as first_user,
    MAX(created_at) as latest_user
  FROM users
`);

// Group by
const result = await db.query(`
  SELECT
    country,
    COUNT(*) as user_count,
    AVG(age) as avg_age
  FROM users
  GROUP BY country
  HAVING COUNT(*) > 10
  ORDER BY user_count DESC
`);
```

---

## Transactions

### Basic Transaction

```typescript
const client = await db.getClient();

try {
  await client.query('BEGIN');

  // Multiple queries in transaction
  const user = await client.query(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id',
    ['John', 'john@example.com']
  );

  await client.query(
    'INSERT INTO profiles (user_id, bio) VALUES ($1, $2)',
    [user.rows[0].id, 'Hello world']
  );

  await client.query('COMMIT');
  console.log('✓ Transaction committed');
} catch (error) {
  await client.query('ROLLBACK');
  console.error('✗ Transaction rolled back:', error);
  throw error;
} finally {
  client.release();
}
```

### Transaction Helper

```typescript
async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Usage
await withTransaction(async (client) => {
  const user = await client.query(
    'INSERT INTO users (name) VALUES ($1) RETURNING id',
    ['John']
  );

  await client.query(
    'INSERT INTO profiles (user_id) VALUES ($1)',
    [user.rows[0].id]
  );

  return user.rows[0];
});
```

### Isolation Levels

```typescript
// Read committed (default)
await client.query('BEGIN');

// Repeatable read
await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ');

// Serializable
await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
```

---

## Schema Design

### Create Tables

```sql
-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  age INTEGER CHECK (age >= 0),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create posts table with foreign key
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  published BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_published ON posts(published);
CREATE INDEX idx_users_email ON users(email);
```

### Data Types

```sql
-- Numeric types
id BIGSERIAL PRIMARY KEY,
price NUMERIC(10, 2),  -- 10 digits, 2 decimal places
quantity INTEGER,
rating REAL,

-- String types
email VARCHAR(255),
slug TEXT,
status CHAR(1),

-- Date/Time
created_at TIMESTAMP,
published_date DATE,
update_time TIME,
event_timestamp TIMESTAMPTZ,  -- With timezone

-- Boolean
active BOOLEAN DEFAULT true,

-- JSON
metadata JSON,
settings JSONB,  -- Binary JSON (faster)

-- Arrays
tags TEXT[],
scores INTEGER[],

-- UUID
id UUID DEFAULT gen_random_uuid() PRIMARY KEY
```

### Constraints

```sql
-- Primary key
id SERIAL PRIMARY KEY,

-- Unique
email VARCHAR(255) UNIQUE,
UNIQUE(user_id, post_id),  -- Composite unique

-- Not null
name VARCHAR(100) NOT NULL,

-- Check
age INTEGER CHECK (age >= 18),
price NUMERIC CHECK (price > 0),

-- Foreign key
user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,

-- Default
created_at TIMESTAMP DEFAULT NOW(),
status VARCHAR(20) DEFAULT 'active'
```

---

## Indexes

### Types of Indexes

```sql
-- B-tree (default, good for equality and range queries)
CREATE INDEX idx_users_email ON users(email);

-- Partial index (filtered)
CREATE INDEX idx_active_users ON users(email) WHERE active = true;

-- Composite index
CREATE INDEX idx_posts_user_published ON posts(user_id, published);

-- Unique index
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);

-- GIN index (for arrays, JSONB, full-text search)
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX idx_metadata ON posts USING GIN(metadata);

-- GiST index (for geometric data, full-text)
CREATE INDEX idx_location ON places USING GIST(location);

-- Hash index (equality only)
CREATE INDEX idx_hash_email ON users USING HASH(email);
```

### Index Strategy

```typescript
// Check if index is used
const result = await db.query(`
  EXPLAIN ANALYZE
  SELECT * FROM users WHERE email = 'test@example.com'
`);

console.log(result.rows);
```

---

## Migrations

### Migration Structure

```sql
-- migrations/001_create_users.up.sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- migrations/001_create_users.down.sql
DROP TABLE users;
```

### Migration Runner

```typescript
// scripts/migrate.ts
import fs from 'fs/promises';
import path from 'path';
import { db } from '../lib/db';

async function createMigrationsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

async function runMigrations() {
  await createMigrationsTable();

  const files = await fs.readdir('./migrations');
  const upMigrations = files
    .filter(f => f.endsWith('.up.sql'))
    .sort();

  for (const file of upMigrations) {
    const name = file.replace('.up.sql', '');

    // Check if already applied
    const result = await db.query(
      'SELECT * FROM migrations WHERE name = $1',
      [name]
    );

    if (result.rows.length > 0) {
      console.log(`⏭  Skipping ${name} (already applied)`);
      continue;
    }

    // Run migration
    const sql = await fs.readFile(
      path.join('./migrations', file),
      'utf-8'
    );

    await db.query(sql);
    await db.query(
      'INSERT INTO migrations (name) VALUES ($1)',
      [name]
    );

    console.log(`✓ Applied ${name}`);
  }
}

await runMigrations();
```

---

## Query Optimization

### EXPLAIN ANALYZE

```typescript
const result = await db.query(`
  EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
  SELECT u.name, COUNT(p.id)
  FROM users u
  LEFT JOIN posts p ON u.id = p.user_id
  WHERE u.active = true
  GROUP BY u.name
`);

console.log(JSON.stringify(result.rows[0], null, 2));
```

### Common Optimizations

**1. Use indexes**:
```sql
-- Bad: Sequential scan
SELECT * FROM users WHERE email = 'test@example.com';

-- Good: Index scan
CREATE INDEX idx_users_email ON users(email);
```

**2. Limit results**:
```sql
-- Bad: Returns millions of rows
SELECT * FROM logs;

-- Good: Paginate
SELECT * FROM logs ORDER BY created_at DESC LIMIT 100 OFFSET 0;
```

**3. Avoid SELECT *  **:
```sql
-- Bad: Fetches unused columns
SELECT * FROM users;

-- Good: Fetch only needed columns
SELECT id, name, email FROM users;
```

**4. Use JOINs instead of subqueries**:
```sql
-- Less efficient
SELECT * FROM posts WHERE user_id IN (SELECT id FROM users WHERE active = true);

-- More efficient
SELECT p.* FROM posts p INNER JOIN users u ON p.user_id = u.id WHERE u.active = true;
```

---

## Best Practices

### Security

**1. Use parameterized queries** (prevent SQL injection):
```typescript
// ✗ Vulnerable to SQL injection
const email = req.body.email;
await db.query(`SELECT * FROM users WHERE email = '${email}'`);

// ✓ Safe with parameters
await db.query('SELECT * FROM users WHERE email = $1', [email]);
```

**2. Least privilege principle**:
```sql
-- Create read-only user
CREATE USER readonly_user WITH PASSWORD 'password';
GRANT CONNECT ON DATABASE mydb TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
```

### Performance

1. **Use connection pooling**: Don't create new connection per query
2. **Index foreign keys**: Always index FK columns
3. **Monitor slow queries**: Log queries > 1000ms
4. **Use EXPLAIN**: Analyze query plans
5. **Batch operations**: Use multi-row INSERT/UPDATE

### Data Integrity

1. **Use transactions**: For multi-step operations
2. **Add constraints**: Enforce data rules at DB level
3. **Soft deletes**: Set deleted_at instead of DELETE
4. **Audit trails**: Track who changed what when

---

## Integration Patterns

### Next.js API Route

```typescript
// app/api/users/route.ts
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const result = await db.query('SELECT id, name, email FROM users');

    return Response.json({ users: result.rows });
  } catch (error) {
    return Response.json({ error: 'Query failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { name, email } = await request.json();

  try {
    const result = await db.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );

    return Response.json({ user: result.rows[0] }, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Insert failed' }, { status: 500 });
  }
}
```

### TypeScript Models

```typescript
// models/User.ts
import { db } from '../lib/db';

export interface User {
  id: number;
  email: string;
  name: string;
  created_at: Date;
}

export class UserModel {
  static async findAll(): Promise<User[]> {
    const result = await db.query('SELECT * FROM users');
    return result.rows;
  }

  static async findById(id: number): Promise<User | null> {
    const result = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async create(data: Omit<User, 'id' | 'created_at'>): Promise<User> {
    const result = await db.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [data.name, data.email]
    );
    return result.rows[0];
  }

  static async update(id: number, data: Partial<User>): Promise<User> {
    const result = await db.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
      [data.name, data.email, id]
    );
    return result.rows[0];
  }

  static async delete(id: number): Promise<void> {
    await db.query('DELETE FROM users WHERE id = $1', [id]);
  }
}
```

---

## Advanced Topics

For detailed information:
- **Query Optimization**: `resources/query-optimization.md`
- **Migration Strategies**: `resources/migrations.md`
- **Replication & Scaling**: `resources/scaling-postgres.md`
- **Full-Text Search**: `resources/full-text-search.md`

## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [node-postgres (pg)](https://node-postgres.com/)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [Use The Index, Luke](https://use-the-index-luke.com/)

