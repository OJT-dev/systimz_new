import { NextRequest } from 'next/server';
import { POST } from './route';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { getServerSession } from 'next-auth';

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

describe('Login API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  };

  it('validates required fields', async () => {
    const testCases = [
      { body: {}, field: 'email' },
      { body: { email: 'test@example.com' }, field: 'password' },
    ];

    for (const testCase of testCases) {
      const request = createRequest(testCase.body);
      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain(testCase.field);
    }
  });

  it('validates email format', async () => {
    const request = createRequest({
      email: 'invalid-email',
      password: 'password123',
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain('valid email');
  });

  it('handles non-existent user', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const request = createRequest({
      email: 'nonexistent@example.com',
      password: 'password123',
    });

    const response = await POST(request);
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.error).toContain('Invalid credentials');
  });

  it('validates password', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      password: 'hashed-password',
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (compare as jest.Mock).mockResolvedValue(false);

    const request = createRequest({
      email: 'test@example.com',
      password: 'wrong-password',
    });

    const response = await POST(request);
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.error).toContain('Invalid credentials');
  });

  it('handles successful login', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      password: 'hashed-password',
      name: 'Test User',
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (compare as jest.Mock).mockResolvedValue(true);

    const request = createRequest({
      email: 'test@example.com',
      password: 'correct-password',
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.user).toEqual({
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
    });
  });

  it('handles database errors gracefully', async () => {
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

    const request = createRequest({
      email: 'test@example.com',
      password: 'password123',
    });

    const response = await POST(request);
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.error).toContain('login failed');
  });

  it('sanitizes email input', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      password: 'hashed-password',
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (compare as jest.Mock).mockResolvedValue(true);

    const request = createRequest({
      email: ' TEST@example.com ',  // Mixed case and spaces
      password: 'password123',
    });

    await POST(request);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },  // Should be lowercase and trimmed
    });
  });

  it('prevents login for unverified email', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      password: 'hashed-password',
      emailVerified: null,
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (compare as jest.Mock).mockResolvedValue(true);

    const request = createRequest({
      email: 'test@example.com',
      password: 'password123',
    });

    const response = await POST(request);
    expect(response.status).toBe(403);

    const data = await response.json();
    expect(data.error).toContain('verify your email');
  });

  it('implements rate limiting', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      password: 'hashed-password',
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (compare as jest.Mock).mockResolvedValue(false);

    // Simulate multiple failed login attempts
    for (let i = 0; i < 5; i++) {
      const request = createRequest({
        email: 'test@example.com',
        password: 'wrong-password',
      });
      await POST(request);
    }

    // Next attempt should be rate limited
    const request = createRequest({
      email: 'test@example.com',
      password: 'wrong-password',
    });

    const response = await POST(request);
    expect(response.status).toBe(429);

    const data = await response.json();
    expect(data.error).toContain('Too many login attempts');
  });
});
