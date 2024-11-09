# Resource API Reference

## Overview
This document details the resource endpoints for managing avatars and messages.

## Base URL
```
https://api.systimz.com
```

## Avatar Endpoints

### 1. Create Avatar
Create a new avatar for the authenticated user.

**Endpoint:** `POST /api/avatars`

**Authentication Required:** Yes

**Request Body:**
```json
{
  "name": "string",
  "description": "string" (optional)
}
```

**Validation Rules:**
- `name`: Required, non-empty string
- `description`: Optional string

**Success Response (201):**
```json
{
  "avatar": {
    "id": "string",
    "name": "string",
    "description": "string",
    "userId": "string",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
  }
}
```

**Error Responses:**
- `401 Unauthorized`:
  ```json
  {
    "error": "Unauthorized"
  }
  ```
- `400 Bad Request`:
  ```json
  {
    "error": "Name is required"
  }
  ```

### 2. List Avatars
Get all avatars for the authenticated user.

**Endpoint:** `GET /api/avatars`

**Authentication Required:** Yes

**Success Response (200):**
```json
{
  "avatars": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "userId": "string",
      "createdAt": "string (ISO date)",
      "updatedAt": "string (ISO date)"
    }
  ]
}
```

### 3. Get Avatar
Get a specific avatar by ID.

**Endpoint:** `GET /api/avatars/{id}`

**Authentication Required:** Yes

**Path Parameters:**
- `id`: Avatar ID

**Success Response (200):**
```json
{
  "avatar": {
    "id": "string",
    "name": "string",
    "description": "string",
    "userId": "string",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
  }
}
```

**Error Responses:**
- `404 Not Found`:
  ```json
  {
    "error": "Avatar not found"
  }
  ```
- `403 Forbidden`:
  ```json
  {
    "error": "You are not authorized to access this avatar"
  }
  ```

### 4. Update Avatar
Update an existing avatar.

**Endpoint:** `PUT /api/avatars/{id}`

**Authentication Required:** Yes

**Path Parameters:**
- `id`: Avatar ID

**Request Body:**
```json
{
  "name": "string",
  "description": "string" (optional)
}
```

**Success Response (200):**
```json
{
  "avatar": {
    "id": "string",
    "name": "string",
    "description": "string",
    "userId": "string",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
  }
}
```

### 5. Delete Avatar
Delete an existing avatar.

**Endpoint:** `DELETE /api/avatars/{id}`

**Authentication Required:** Yes

**Path Parameters:**
- `id`: Avatar ID

**Success Response (200):**
```json
{
  "message": "Avatar deleted successfully"
}
```

## Message Endpoints

### 1. Create Message
Create a new message.

**Endpoint:** `POST /api/messages`

**Authentication Required:** Yes

**Request Body:**
```json
{
  "content": "string",
  "type": "user" | "ai",
  "metadata": "string" (optional)
}
```

**Validation Rules:**
- `content`: Required, non-empty string
- `type`: Must be either "user" or "ai"
- `metadata`: Optional JSON string

**Success Response (201):**
```json
{
  "message": {
    "id": "string",
    "content": "string",
    "type": "user" | "ai",
    "userId": "string",
    "metadata": "string",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
  }
}
```

**Error Responses:**
- `429 Too Many Requests`:
  ```json
  {
    "error": "Rate limit exceeded. Please wait before sending more messages."
  }
  ```

### 2. List Messages
Get messages with pagination.

**Endpoint:** `GET /api/messages`

**Authentication Required:** Yes

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Success Response (200):**
```json
{
  "messages": [
    {
      "id": "string",
      "content": "string",
      "type": "user" | "ai",
      "userId": "string",
      "metadata": "string",
      "createdAt": "string (ISO date)",
      "updatedAt": "string (ISO date)"
    }
  ],
  "pagination": {
    "currentPage": number,
    "totalPages": number,
    "totalMessages": number
  }
}
```

### 3. Delete Message
Delete a specific message.

**Endpoint:** `DELETE /api/messages`

**Authentication Required:** Yes

**Query Parameters:**
- `id`: Message ID

**Success Response (200):**
```json
{
  "message": "Message deleted successfully"
}
```

## Rate Limiting

### Message Creation
- 5 messages per minute per user
- Lockout period: 1 minute
- Reset after lockout period expires

### General Endpoints
- 100 requests per minute per IP
- Applies to GET requests
- Separate limits for authenticated endpoints

## Error Handling

### Common Error Codes
- `400`: Invalid request (validation errors)
- `401`: Authentication required
- `403`: Permission denied
- `404`: Resource not found
- `429`: Rate limit exceeded
- `500`: Server error

### Error Response Format
```json
{
  "error": "string",
  "details": "string" (optional)
}
```

## Implementation Examples

### Create Avatar
```typescript
const response = await fetch('/api/avatars', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'My Avatar',
    description: 'A friendly avatar',
  }),
});

const data = await response.json();
```

### Send Message
```typescript
const response = await fetch('/api/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    content: 'Hello, world!',
    type: 'user',
  }),
});

const data = await response.json();
```

### Fetch Messages with Pagination
```typescript
const page = 1;
const limit = 20;

const response = await fetch(`/api/messages?page=${page}&limit=${limit}`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
```

## WebSocket Integration

### Message Events
```typescript
// Connect to WebSocket
const ws = new WebSocket('wss://api.systimz.com/ws');

// Listen for messages
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('New message:', message);
};

// Send message
ws.send(JSON.stringify({
  type: 'message',
  content: 'Hello via WebSocket!',
}));
