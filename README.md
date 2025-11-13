# End-of-year M1 Project

A somewhat confusing project because the topic was somewhere between a traditional DBMS and a database backup/restore system.

This repo contains the backend part of the second option.

---

## Table of Contents

1. [Authentication](#authentication)
2. [API Endpoints](#api-endpoints)
3. [Data Types](#data-types)
4. [Error Handling](#error-handling)
5. [Storage](#storage)
6. [Configuration](#configuration)

---

## Authentication

### JWT-based Authentication

The API uses JWT (JSON Web Tokens) for authentication after a successful database connection.

**Token Details:**
- Algorithm: HS256
- Expiration: 1 day
- Storage: HTTP-only cookie (`auth_token`) or Authorization header
- Secret: Configured via `NITRO_JWT_SECRET` environment variable

### Middleware

All requests pass through the authentication middleware (`server/middleware/01.auth.ts`) which:
1. Checks for `auth_token` cookie
2. Falls back to `Authorization` header with `Bearer` scheme
3. Sets `event.context.user` to the JWT payload or `null` if unauthenticated

---

## API Endpoints

### 1. **POST `/api/connection`** - Establish Database Connection

Authenticates with a database (MySQL or PostgreSQL) and returns a JWT token.

**Request Body:**
```typescript
{
  connectionType: 'mysql' | 'postgres',
  host: string,
  port?: number,
  user: string,
  password: string,
  database?: string
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "<jwt_token>"
}
```

**Response (Failure):**
```json
{
  "success": false,
  "message": "Missing critical informations"
}
```

**Error Codes:**
- `500`: Unsupported connection type or database connection failed
- Missing `connectionType`, `host`, `user`, or `password` returns error message

**Process:**
1. Validates connection credentials
2. Tests connection with SQL query: `SELECT 1+1 AS result`
3. Generates JWT token containing connection type and login timestamp
4. Stores connection credentials in KV storage (encrypted)
5. Sets HTTP-only authentication cookie
6. Closes test connection

---

### 2. **POST `/api/database/postgres/is-dirty`** - Check PostgreSQL Changes

Checks if the connected PostgreSQL database has been modified since last backup.

**Authentication:** Required

**Request Body:** None

**Response:**
```typescript
{
  // Database change detection data
  // Specific fields depend on PostgreSQL query results
}
```

**Error Codes:**
- `401`: Unauthorized (no valid authentication token)

**Note:** Currently commented out in favor of MySQL implementation.

---

### 3. ~~**POST `/api/database/mysql/is-dirty`** - Check MySQL Changes (Current Implementation)~~

<!-- Checks if the connected MySQL database has been modified by analyzing:
- Binary log position
- Table statistics (row counts, data size, modification timestamps)
- Performance schema statistics (read/write counts)

**Authentication:** Required

**Request Body:** None

**Response:** Object containing:
```typescript
{
  binlogPosition: { /* Binary log status */ },
  tableStatistics: [ /* Table stats array */ ],
  performanceStats: [ /* Performance schema data */ ]
}
```

**Error Codes:**
- `401`: Unauthorized (no valid authentication token) -->

---

### 4. ~~**POST `/api/logout`** - Logout~~

<!-- Terminates the current session by removing the authentication token.

**Authentication:** Required

**Request Body:** None

**Response (Success):**
```json
{
  "success": true
}
```

**Error Codes:**
- `401`: Unauthorized (no valid authentication token)

**Process:**
1. Validates authentication token
2. Deletes `auth_token` cookie
3. Returns success response -->

---

### 5. **GET `/`** - Health Check

Returns an HTML page confirming the server is running.

---

### 6. **POST `/`** - Status

Returns a simple text response confirming the server is operational.

**Response:**
```
┬┴┤(･_├┬┴┬┴┬┴┬┴┬┴┬┴
```

---

### 7. **All Other Routes** - Catch-All

Unmatched routes return a 404 redirect to home.

---

## Data Types

### ConnectionType (Enum)
```typescript
enum ConnectionType {
  mysql = 'mysql',
  postgres = 'postgres'
}
```

### ConnectionCredentials
```typescript
type ConnectionCredentials = {
  connectionType: ConnectionType,
  host: string,
  port?: number,
  user: string,
  password: string,
  database?: string
}
```

### User (JWT Payload)
```typescript
type User = {
  connectionType: ConnectionType,
  loginDate: string  /** ISO 8601 format */
}
```

### StorageValue
```typescript
type StorageValue = null | string | number | boolean | object
```

---

## Error Handling

The API uses Nitro's `createError` for consistent error responses:

```typescript
throw createError({
  statusCode: number,
  statusMessage?: string,
  message: string
});
```

**Common Error Responses:**

| Status Code | Scenario |
|-------------|----------|
| 401 | Unauthorized (missing/invalid authentication) |
| 404 | Route not found (catch-all redirect) |
| 500 | Server error (database connection failed, unsupported type) |

---

## Storage

The API uses Nitro's file-based KV storage configured in `nitro.config.ts`:

**Location:** `./data/kv`

**Stored Items:**
- `current_connection`: The active database connection credentials

**Usage:**
```typescript
const storage = useStorage('data');
await storage.setItem('current_connection', connectionCredentials);
const credentials = await storage.getItem('current_connection');
```

---

## Configuration

**Environment Variables:**
- `NITRO_JWT_SECRET`: JWT signing secret (default: `api_token`)

**File:** `nitro.config.ts`

```typescript
{
  compatibilityDate: '2025-11-09',
  srcDir: "server",
  runtimeConfig: {
    jwtSecret: "api_token"
  },
  storage: {
    kv: {
      driver: "fs",
      base: "./data/kv"
    }
  }
}
```

---

## Project Structure

```
server/
├── api/
│   ├── connection/          # Database connection endpoint
│   ├── database/
│   │   ├── mysql/           # MySQL-specific endpoints
│   │   └── postgres/        # PostgreSQL-specific endpoints
│   └── logout/              # Logout endpoint
├── middleware/
│   └── 01.auth.ts           # JWT authentication middleware
├── routes/
│   ├── index.get.ts         # GET / endpoint
│   └── index.post.ts        # POST / endpoint
└── utils/
    ├── checkDirty.ts        # Database change detection
    ├── jwt.ts               # JWT utilities
    ├── parse.ts             # Connection credential parsing
    └── types.ts             # TypeScript type definitions
```

---

## Development

**Commands:**
```bash
npm run dev      # Start development server
npm run build    # Build for production
node .output/server/index.mjs  # Preview production build
```
