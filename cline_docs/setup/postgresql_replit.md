# PostgreSQL and @vercel/postgres on Replit

This guide provides instructions and examples for using PostgreSQL 15.7 with @vercel/postgres within the [Replit](https://replit.com) environment, using Neon as the PostgreSQL provider.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Database Configuration](#database-configuration)
  - [Neon Setup](#neon-setup)
  - [Replit Configuration](#replit-configuration)
- [Using @vercel/postgres](#using-vercel-postgres)
  - [Installation](#installation)
  - [Basic Usage](#basic-usage)
  - [Connection Management](#connection-management)
  - [Error Handling](#error-handling)
- [Schema Management](#schema-management)
- [Best Practices](#best-practices)
- [Additional Resources](#additional-resources)

---

## Prerequisites

Before you begin, ensure you have:

- A Replit workspace
- A Neon PostgreSQL database (version 15.7)
- Node.js environment (v20+)
- Database connection details from Neon:
  - **Host** (e.g., ep-divine-bush-a49hwonr.us-east-1.aws.neon.tech)
  - **Port** (typically `5432`)
  - **Database name**
  - **Username**
  - **Password**

---

## Database Configuration

### Neon Setup

1. **Create a Neon Project**:
   - Visit [Neon Console](https://console.neon.tech)
   - Create a new project
   - Select PostgreSQL 15.7
   - Note your connection details

2. **Connection String Format**:
```
postgresql://username:password@hostname/database?sslmode=require
```

### Replit Configuration

1. **Configure replit.nix**:
```nix
{ pkgs }: {
  deps = [
    pkgs.postgresql_15
    pkgs.nodejs_20
  ];
  env = {
    DATABASE_URL = "postgresql://username:password@hostname/database?sslmode=require";
  };
}
```

2. **Configure .replit**:
```toml
[env]
DATABASE_URL = "postgresql://username:password@hostname/database?sslmode=require"

[[ports]]
localPort = 5432
externalPort = 5432
```

3. **Environment Variables**:
Create a `.env` file with your Neon database credentials:
```env
DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require
PGHOST=hostname
PGUSER=username
PGPASSWORD=password
PGDATABASE=database
PGPORT=5432
```

---

## Using @vercel/postgres

### Installation

```bash
npm install @vercel/postgres
```

### Basic Usage

```typescript
import { createClient } from '@vercel/postgres';

const client = createClient();

try {
  await client.connect();
  const { rows } = await client.query('SELECT NOW()');
  console.log('Current time:', rows[0].now);
} catch (error) {
  console.error('Database error:', error);
} finally {
  await client.end();
}
```

### Connection Management

```typescript
import { createClient } from '@vercel/postgres';

async function executeQuery(query: string, params: any[] = []) {
  const client = createClient();
  try {
    await client.connect();
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    await client.end();
  }
}
```

### Error Handling

```typescript
import { createClient } from '@vercel/postgres';

async function safeQuery(query: string, params: any[] = []) {
  const client = createClient();
  try {
    await client.connect();
    return await client.query(query, params);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      throw new Error('Record already exists');
    }
    if (error.code === '23503') { // Foreign key violation
      throw new Error('Referenced record not found');
    }
    throw error;
  } finally {
    await client.end();
  }
}
```

---

## Schema Management

The database schema is defined in `schema.sql` and includes:

- Users management (users, accounts, sessions)
- Authentication (verification_tokens, password_reset_tokens)
- Application data (avatars, messages)
- Automatic timestamp management
- UUID primary keys
- Proper indexing for performance

To apply schema changes:

```bash
PGPASSWORD=your_password psql -h hostname -U username -d database -f schema.sql
```

Note: The schema includes the uuid-ossp extension and proper cascading deletes for referential integrity.

---

## Best Practices

1. **Connection Management**
   - Always close connections using `client.end()`
   - Use try/finally blocks to ensure connections are closed
   - Keep connections short-lived
   - Use connection pooling in production

2. **Query Safety**
   - Use parameterized queries to prevent SQL injection
   - Validate input data before querying
   - Handle database errors gracefully
   - Use transactions for multi-step operations

3. **Performance**
   - Utilize provided indexes
   - Keep transactions short
   - Monitor query performance
   - Use appropriate connection pools

4. **Security**
   - Store credentials in environment variables
   - Use SSL mode for all connections
   - Implement proper access control
   - Regular security audits
   - Keep dependencies updated

---

## Additional Resources

- **@vercel/postgres Documentation**
  - [Official Documentation](https://vercel.com/docs/storage/vercel-postgres)
  - [API Reference](https://vercel.com/docs/storage/vercel-postgres/api-reference)
- **Neon Documentation**
  - [Neon Docs](https://neon.tech/docs)
  - [Connection Pooling](https://neon.tech/docs/connect/connection-pooling)
- **PostgreSQL Documentation**
  - [PostgreSQL 15.7 Documentation](https://www.postgresql.org/docs/15/index.html)

---

**Note:** Always use SSL mode when connecting to Neon databases. The connection string should include `?sslmode=require`.

---

_Citations:_

- [@vercel/postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Neon Documentation](https://neon.tech/docs)
- [PostgreSQL 15.7 Documentation](https://www.postgresql.org/docs/15/index.html)
