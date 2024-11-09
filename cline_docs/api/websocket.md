# WebSocket API Reference

## Overview
This document details the WebSocket API for real-time communication, including connection handling, message formats, and error handling.

## Connection

### WebSocket URL
```
wss://api.systimz.com/ws
```

### Connection Process
1. Client initiates WebSocket connection
2. Server authenticates connection using session token
3. Server sends connection acknowledgment
4. Real-time communication begins

### Authentication
Include authentication token in connection URL:
```javascript
const ws = new WebSocket('wss://api.systimz.com/ws?token=<session-token>');
```

## Message Format

### Base Message Structure
```typescript
interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
  id: string;
}
```

### Message Types

#### 1. Chat Message
```json
{
  "type": "message",
  "payload": {
    "content": "string",
    "type": "user" | "ai",
    "metadata": "string" (optional)
  },
  "timestamp": "2024-01-11T12:00:00Z",
  "id": "msg-123"
}
```

#### 2. Status Update
```json
{
  "type": "status",
  "payload": {
    "status": "typing" | "online" | "offline",
    "userId": "string"
  },
  "timestamp": "2024-01-11T12:00:00Z",
  "id": "status-123"
}
```

#### 3. Avatar Update
```json
{
  "type": "avatar_update",
  "payload": {
    "avatarId": "string",
    "action": "speaking" | "idle" | "thinking",
    "metadata": "string" (optional)
  },
  "timestamp": "2024-01-11T12:00:00Z",
  "id": "avatar-123"
}
```

## Client Events

### Sending Messages
```javascript
// Send chat message
ws.send(JSON.stringify({
  type: 'message',
  payload: {
    content: 'Hello!',
    type: 'user'
  }
}));

// Send status update
ws.send(JSON.stringify({
  type: 'status',
  payload: {
    status: 'typing'
  }
}));
```

### Event Listeners
```javascript
ws.onopen = () => {
  console.log('Connected to WebSocket');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = (event) => {
  console.log('WebSocket closed:', event.code, event.reason);
};
```

## Server Events

### Connection Events
```typescript
interface ConnectionEvent {
  type: 'connection';
  payload: {
    userId: string;
    connectionId: string;
    timestamp: string;
  };
}
```

### Broadcast Events
```typescript
interface BroadcastEvent {
  type: 'broadcast';
  payload: {
    message: string;
    severity: 'info' | 'warning' | 'error';
    timestamp: string;
  };
}
```

### System Events
```typescript
interface SystemEvent {
  type: 'system';
  payload: {
    event: 'maintenance' | 'shutdown' | 'restart';
    scheduledTime: string;
    duration: number;
  };
}
```

## Rate Limiting

### Message Rate Limits
- Maximum 10 messages per second per connection
- Maximum 100 messages per minute per user
- Burst allowance: 20 messages

### Reconnection Rate Limits
- Maximum 5 reconnection attempts per minute
- Exponential backoff required
- Maximum backoff: 30 seconds

## Error Handling

### Error Message Format
```typescript
interface ErrorMessage {
  type: 'error';
  payload: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  id: string;
}
```

### Error Codes
- `AUTH_FAILED`: Authentication failure
- `RATE_LIMIT`: Rate limit exceeded
- `INVALID_MESSAGE`: Invalid message format
- `SERVER_ERROR`: Internal server error

### Example Error Messages
```json
{
  "type": "error",
  "payload": {
    "code": "RATE_LIMIT",
    "message": "Message rate limit exceeded",
    "details": {
      "limit": 10,
      "interval": "second",
      "resetTime": "2024-01-11T12:00:10Z"
    }
  },
  "timestamp": "2024-01-11T12:00:00Z",
  "id": "error-123"
}
```

## Connection Management

### Heartbeat
- Server sends ping every 30 seconds
- Client must respond with pong within 10 seconds
- Connection closed if pong not received

### Reconnection Strategy
```javascript
function connect() {
  let retries = 0;
  const maxRetries = 5;
  const baseDelay = 1000;

  function attemptConnect() {
    if (retries >= maxRetries) {
      console.error('Max retries reached');
      return;
    }

    const ws = new WebSocket('wss://api.systimz.com/ws');
    
    ws.onclose = () => {
      retries++;
      const delay = Math.min(baseDelay * Math.pow(2, retries), 30000);
      setTimeout(attemptConnect, delay);
    };

    return ws;
  }

  return attemptConnect();
}
```

## Implementation Examples

### Basic Chat Client
```typescript
class ChatClient {
  private ws: WebSocket;
  private messageQueue: any[] = [];
  private isConnected = false;

  constructor(private token: string) {
    this.connect();
  }

  private connect() {
    this.ws = new WebSocket(`wss://api.systimz.com/ws?token=${this.token}`);
    
    this.ws.onopen = () => {
      this.isConnected = true;
      this.processQueue();
    };

    this.ws.onmessage = this.handleMessage.bind(this);
    this.ws.onerror = this.handleError.bind(this);
    this.ws.onclose = this.handleClose.bind(this);
  }

  public sendMessage(content: string) {
    const message = {
      type: 'message',
      payload: {
        content,
        type: 'user'
      }
    };

    if (this.isConnected) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
  }

  private processQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.ws.send(JSON.stringify(message));
    }
  }

  private handleMessage(event: MessageEvent) {
    const message = JSON.parse(event.data);
    // Handle different message types
    switch (message.type) {
      case 'message':
        this.onMessage?.(message.payload);
        break;
      case 'error':
        this.handleError(message);
        break;
    }
  }

  private handleError(error: any) {
    console.error('WebSocket error:', error);
    // Implement error handling
  }

  private handleClose() {
    this.isConnected = false;
    // Implement reconnection logic
  }

  // Event handlers
  public onMessage?: (message: any) => void;
  public onError?: (error: any) => void;
}
```

### Usage Example
```typescript
const chat = new ChatClient('session-token');

chat.onMessage = (message) => {
  console.log('New message:', message);
};

chat.onError = (error) => {
  console.error('Error:', error);
};

// Send message
chat.sendMessage('Hello, world!');
