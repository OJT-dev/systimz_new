import { NextRequest } from 'next/server';
import { POST } from './route';
import crypto from 'crypto';

// Mock crypto
jest.mock('crypto', () => ({
  randomBytes: jest.fn(),
}));

// Mock Prisma client
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
  passwordResetToken: {
    create: jest.fn(),
    findFirst: jest.fn(),
    deleteMany: jest.fn(),
  },
};

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

describe('Password Reset Request API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (crypto.randomBytes as jest.Mock).mockReturnValue({
      toString: () => 'mock-token',
    });
  });

  const createRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/auth/password-reset/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  };

  it('validates email format', async () => {
    const request = createRequest({
      email: 'invalid-email',
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain('valid email');
  });

  it('handles non-existent user', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const request = createRequest({
      email: 'nonexistent@example.com',
    });

    const response = await POST(request);
    expect(response.status).toBe(200); // Don't reveal user existence

    const data = await response.json();
    expect(data.message).toContain('If an account exists');
  });

  it('creates reset token successfully', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      emailVerified: new Date(),
    };

    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    const request = createRequest({
      email: 'test@example.com',
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    // Verify token creation
    expect(mockPrisma.passwordResetToken.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: mockUser.id,
        token: 'mock-token',
        expires: expect.any(Date),
      }),
    });
  });

  it('handles rate limiting', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      emailVerified: new Date(),
    };

    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.passwordResetToken.findFirst.mockResolvedValue({
      createdAt: new Date(),
    });

    const request = createRequest({
      email: 'test@example.com',
    });

    const response = await POST(request);
    expect(response.status).toBe(429);

    const data = await response.json();
    expect(data.error).toContain('Please wait');
  });

  it('cleans up expired tokens', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      emailVerified: new Date(),
    };

    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    const request = createRequest({
      email: 'test@example.com',
    });

    await POST(request);

    expect(mockPrisma.passwordResetToken.deleteMany).toHaveBeenCalledWith({
      where: {
        expires: {
          lt: expect.any(Date),
        },
      },
    });
  });

  it('handles database errors gracefully', async () => {
    mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

    const request = createRequest({
      email: 'test@example.com',
    });

    const response = await POST(request);
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.error).toContain('request failed');
  });

  it('sanitizes email input', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      emailVerified: new Date(),
    };

    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    const request = createRequest({
      email: ' TEST@example.com ',  // Mixed case and spaces
    });

    await POST(request);

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },  // Should be lowercase and trimmed
    });
  });

  it('prevents requests for unverified emails', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      emailVerified: null,
    };

    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    const request = createRequest({
      email: 'test@example.com',
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain('verify your email');
  });
});
