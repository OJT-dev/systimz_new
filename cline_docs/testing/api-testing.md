# API Testing Guide

## Overview
This guide covers testing approaches for Next.js API routes, focusing on authentication, validation, error handling, and integration testing.

## Table of Contents
1. Route Testing Fundamentals
2. Authentication Testing
3. Error Handling
4. Database Integration
5. Rate Limiting
6. WebSocket Testing

## 1. Route Testing Fundamentals

### Basic Route Test Structure
```typescript
// src/app/api/[route]/route.test.ts
import { NextRequest } from 'next/server';
import { POST, GET, PUT, DELETE } from './route';

describe('API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/resource', () => {
    const createRequest = (body: any) => {
      return new NextRequest('http://localhost:3000/api/resource', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    };

    it('validates required fields', async () => {
      const request = createRequest({});
      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it('handles successful creation', async () => {
      const request = createRequest({
        name: 'Test Resource',
      });

      const response = await POST(request);
      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.resource).toBeDefined();
    });
  });
});
```

## 2. Authentication Testing

### Protected Route Example
```typescript
// src/app/api/protected/route.test.ts
import { NextRequest } from 'next/server';
import { GET } from './route';
import { getServerSession } from 'next-auth';

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

describe('Protected API Route', () => {
  it('requires authentication', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/protected');
    const response = await GET(request);
    
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('allows authenticated access', async () => {
    const mockSession = {
      user: {
        id: 'user-1',
        email: 'test@example.com',
      },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    const request = new NextRequest('http://localhost:3000/api/protected');
    const response = await GET(request);
    
    expect(response.status).toBe(200);
  });
});
```

## 3. Error Handling

### Error Cases Example
```typescript
// src/app/api/resource/route.test.ts
import { NextRequest } from 'next/server';
import { POST } from './route';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    resource: {
      create: jest.fn(),
    },
  },
}));

describe('Resource API Error Handling', () => {
  it('handles validation errors', async () => {
    const request = new NextRequest('http://localhost:3000/api/resource', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invalidField: 'test',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain('validation');
  });

  it('handles database errors', async () => {
    (prisma.resource.create as jest.Mock).mockRejectedValue(
      new Error('Database error')
    );

    const request = new NextRequest('http://localhost:3000/api/resource', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Resource',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.error).toContain('failed');
  });
});
```

## 4. Database Integration

### Prisma Testing Example
```typescript
// src/app/api/users/route.test.ts
import { NextRequest } from 'next/server';
import { GET, POST } from './route';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

describe('Users API', () => {
  it('lists users with pagination', async () => {
    const mockUsers = Array(10).fill(null).map((_, i) => ({
      id: `user-${i}`,
      name: `User ${i}`,
      email: `user${i}@example.com`,
    }));

    (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

    const request = new NextRequest(
      'http://localhost:3000/api/users?page=1&limit=10'
    );
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.users).toHaveLength(10);
  });

  it('prevents duplicate email registration', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'existing-user',
      email: 'test@example.com',
    });

    const request = new NextRequest('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain('already exists');
  });
});
```

## 5. Rate Limiting

### Rate Limit Testing Example
```typescript
// src/app/api/messages/route.test.ts
import { NextRequest } from 'next/server';
import { POST } from './route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

describe('Message API Rate Limiting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('enforces rate limits', async () => {
    const mockSession = {
      user: { id: 'user-1' },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.message.count as jest.Mock).mockResolvedValue(6); // Over limit

    const request = new NextRequest('http://localhost:3000/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: 'Test message',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(429);

    const data = await response.json();
    expect(data.error).toContain('rate limit');
  });
});
```

## 6. WebSocket Testing

### WebSocket Route Testing
```typescript
// src/app/api/ws/route.test.ts
import { NextRequest } from 'next/server';
import { GET } from './route';
import { getServerSession } from 'next-auth';

describe('WebSocket API', () => {
  it('requires authentication for upgrade', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/ws');
    const response = await GET(request);
    
    expect(response.status).toBe(401);
  });

  it('handles successful upgrade', async () => {
    const mockSession = {
      user: { id: 'user-1' },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    const request = new NextRequest('http://localhost:3000/api/ws', {
      headers: {
        'upgrade': 'websocket',
        'connection': 'Upgrade',
      },
    });

    const response = await GET(request);
    expect(response.status).toBe(101);
  });
});
```

## Best Practices

1. **Route Testing**
   - Test all HTTP methods
   - Validate request bodies
   - Check response status codes
   - Verify response formats
   - Test query parameters
   - Test path parameters

2. **Authentication**
   - Test unauthorized access
   - Test invalid credentials
   - Test expired tokens
   - Test permission levels
   - Test session handling

3. **Error Handling**
   - Test validation errors
   - Test database errors
   - Test network errors
   - Test rate limiting
   - Test edge cases

4. **Database Integration**
   - Mock database calls
   - Test CRUD operations
   - Test constraints
   - Test relationships
   - Test transactions

5. **Performance**
   - Test pagination
   - Test rate limiting
   - Test caching
   - Test response times
   - Test concurrent requests

6. **Security**
   - Test input validation
   - Test authentication
   - Test authorization
   - Test rate limiting
   - Test data sanitization

## Testing Tools

1. **Jest**
   - Test runner
   - Assertion library
   - Mocking capabilities
   - Coverage reporting

2. **Mock Service Worker (MSW)**
   - API mocking
   - Network request interception
   - Response simulation
   - Error simulation

3. **Prisma Client**
   - Database mocking
   - Transaction testing
   - Query testing
   - Error simulation

4. **Next.js Testing**
   - API route testing
   - Middleware testing
   - Config testing
   - Environment testing
