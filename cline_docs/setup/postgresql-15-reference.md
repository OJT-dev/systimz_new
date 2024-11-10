# PostgreSQL 15 Reference Guide

PostgreSQL is a powerful, open-source object-relational database system renowned for its reliability, robustness, and performance.

## Table of Contents

- [What's New in PostgreSQL 15](#whats-new-in-postgresql-15)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Basic Configuration](#basic-configuration)
- [Core Concepts](#core-concepts)
  - [Data Types](#data-types)
  - [Schemas and Tables](#schemas-and-tables)
  - [Indexes](#indexes)
  - [Transactions](#transactions)
- [Advanced Features](#advanced-features)
  - [Partitioning](#partitioning)
  - [Replication](#replication)
  - [Full-Text Search](#full-text-search)
  - [JSON Support](#json-support)
- [Performance Tuning](#performance-tuning)
- [Security](#security)
- [Useful Commands](#useful-commands)
- [Additional Resources](#additional-resources)

## What's New in PostgreSQL 15

- **Improved Logical Replication**: Enhanced performance and flexibility in logical replication, including support for two-phase commit.
- **Column Compression Methods**: Introduction of new compression methods for columns stored in tables.
- **Enhanced SQL Standard Compliance**: Better adherence to the SQL standard with added features and functions.
- **Performance Improvements**: Optimizations in sorting algorithms and index handling for faster query execution.
- **Security Enhancements**: Strengthened authentication mechanisms and security features.

## Getting Started

### Installation

Visit the [official PostgreSQL download page](https://www.postgresql.org/download/) to download and install PostgreSQL 15 for your operating system.

### Basic Configuration

After installation, initialize your database cluster and start the PostgreSQL service.

```bash
# Initialize database cluster (Linux)
initdb -D /usr/local/pgsql/data

# Start PostgreSQL service
pg_ctl -D /usr/local/pgsql/data -l logfile start
```

## Core Concepts

### Data Types

PostgreSQL supports various data types, including:

- **Numeric Types**: `SMALLINT`, `INTEGER`, `BIGINT`, `DECIMAL`, `NUMERIC`, `REAL`, `DOUBLE PRECISION`, `SERIAL`
- **Character Types**: `CHAR(n)`, `VARCHAR(n)`, `TEXT`
- **Binary Data Types**: `BYTEA`
- **Date/Time Types**: `DATE`, `TIME`, `TIMESTAMP`, `INTERVAL`
- **Boolean Type**: `BOOLEAN`
- **Network Address Types**: `CIDR`, `INET`, `MACADDR`
- **JSON Types**: `JSON`, `JSONB`
- **Array Types**

### Schemas and Tables

- **Schemas**: Logical containers for tables, views, functions, etc.
- **Tables**: Define the structure to store data.

#### Creating a Schema

```sql
CREATE SCHEMA schema_name;
```

#### Creating a Table

```sql
CREATE TABLE schema_name.table_name (
    column1 datatype PRIMARY KEY,
    column2 datatype NOT NULL,
    column3 datatype DEFAULT default_value,
    ...
);
```

### Indexes

Indexes improve the speed of data retrieval.

#### Creating an Index

```sql
CREATE INDEX index_name ON schema_name.table_name (column1, column2);
```

### Transactions

Transactions ensure data integrity.

```sql
BEGIN;
-- Your SQL commands
COMMIT;
```

#### Rolling Back a Transaction

```sql
ROLLBACK;
```

## Advanced Features

### Partitioning

Divide large tables into smaller, more manageable pieces.

```sql
-- Create a partitioned table
CREATE TABLE measurement (
    city_id         INTEGER,
    logdate         DATE,
    peaktemp        INTEGER,
    unitsales       INTEGER
) PARTITION BY RANGE (logdate);
```

### Replication

Replicate data to other servers for redundancy and load balancing.

- **Streaming Replication**: Continuous copying of WAL (Write-Ahead Logging) data.
- **Logical Replication**: Replicates data changes based on replication slots.

### Full-Text Search

Enables advanced text search capabilities.

```sql
-- Creating a tsvector column
ALTER TABLE documents ADD COLUMN textsearchable tsvector;

-- Updating the tsvector column
UPDATE documents SET textsearchable = to_tsvector('english', content);
```

### JSON Support

Store and query JSON data.

```sql
-- Inserting JSON data
INSERT INTO api_logs (data) VALUES ('{"event": "login", "user": "john_doe"}');

-- Querying JSON fields
SELECT data->>'user' FROM api_logs WHERE data->>'event' = 'login';
```

## Performance Tuning

- **Analyze and Vacuum**: Maintain statistics for the query planner and reclaim storage.

  ```sql
  VACUUM ANALYZE;
  ```

- **Configure Settings**: Adjust `shared_buffers`, `work_mem`, and other settings in `postgresql.conf`.

## Security

- **Authentication Methods**: Use methods like `md5`, `scram-sha-256`, `ldap`, or `gss`.
- **Role Management**:

  ```sql
  -- Create a role
  CREATE ROLE role_name WITH LOGIN PASSWORD 'password';

  -- Grant privileges
  GRANT SELECT, INSERT ON schema_name.table_name TO role_name;
  ```

- **SSL Connections**: Enable SSL in the configuration for encrypted connections.

## Useful Commands

### Database Administration

- **Listing Databases**:

  ```sql
  \l
  ```

- **Connecting to a Database**:

  ```bash
  psql -d database_name
  ```

- **Backing Up a Database**:

  ```bash
  pg_dump database_name > backup.sql
  ```

- **Restoring a Database**:

  ```bash
  psql database_name < backup.sql
  ```

### Monitoring

- **Check Active Connections**:

  ```sql
  SELECT * FROM pg_stat_activity;
  ```

- **View Running Queries**:

  ```sql
  SELECT pid, query, state FROM pg_stat_activity WHERE state <> 'idle';
  ```

## Additional Resources

- [Official PostgreSQL Documentation](https://www.postgresql.org/docs/15/index.html)
- [PostgreSQL Wiki](https://wiki.postgresql.org/)
- [PostgreSQL Mailing Lists](https://www.postgresql.org/list/)

```