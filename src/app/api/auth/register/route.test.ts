import { NextRequest } from 'next/server';
import { POST } from './route';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    verificationToken: {
      create: jest.fn(),
    },
  },
}));

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

describe('Registration API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (hash as jest.Mock).mockResolvedValue('hashed-password');
  });

  const createRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  };

  it('creates a new user successfully', async () => {
    const mockUser = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
    (prisma.verificationToken.create as jest.Mock).mockResolvedValue({
      identifier: mockUser.id,
      token: 'verification-token',
      expires: new Date(),
    });

    const request = createRequest({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123',
    });

    const response = await POST(request);
    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data).toEqual({
      user: {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
      },
      message: 'Registration successful. Please check your email for verification.',
    });
  });

  it('validates required fields', async () => {
    const testCases = [
      { body: {}, field: 'Name is required' },
      { body: { name: 'Test' }, field: 'Invalid email address' },
      { body: { name: 'Test', email: 'test@example.com' }, field: 'Password must be at least 8 characters' },
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
      name: 'Test User',
      email: 'invalid-email',
      password: 'Password123',
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain('Invalid email address');
  });

  it('validates password strength', async () => {
    const request = createRequest({
      name: 'Test User',
      email: 'test@example.com',
      password: 'weak',
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain('Password must be at least 8 characters');
  });

  it('prevents duplicate email registration', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'existing-user',
      email: 'test@example.com',
    });

    const request = createRequest({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123',
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain('already registered');
  });

  it('handles database errors gracefully', async () => {
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

    const request = createRequest({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123',
    });

    const response = await POST(request);
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.error).toContain('registration failed');
  });

  it('creates verification token for new user', async () => {
    const mockUser = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

    const request = createRequest({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123',
    });

    await POST(request);

    expect(prisma.verificationToken.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        identifier: mockUser.id,
        expires: expect.any(Date),
      }),
    });
  });

  it('sanitizes user input', async () => {
    const mockUser = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

    const request = createRequest({
      name: ' Test User ',  // Extra spaces
      email: ' TEST@example.com ',  // Mixed case and spaces
      password: 'Password123',
    });

    await POST(request);

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'Test User',
        email: 'test@example.com',  // Should be lowercase and trimmed
      }),
    });
  });
});
