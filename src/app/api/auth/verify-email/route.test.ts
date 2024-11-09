import { NextRequest } from 'next/server';
import { GET } from './route';
import { prisma } from '@/lib/prisma';

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    verificationToken: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
  },
}));

describe('Email Verification API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createRequest = (token: string) => {
    return new NextRequest(`http://localhost:3000/api/auth/verify-email?token=${token}`);
  };

  it('validates token parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/verify-email');
    const response = await GET(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain('Token is required');
  });

  it('handles invalid token', async () => {
    (prisma.verificationToken.findUnique as jest.Mock).mockResolvedValue(null);

    const request = createRequest('invalid-token');
    const response = await GET(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain('Invalid verification token');
  });

  it('handles expired token', async () => {
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() - 1); // Yesterday

    (prisma.verificationToken.findUnique as jest.Mock).mockResolvedValue({
      identifier: 'user-1',
      token: 'valid-token',
      expires: expiredDate,
    });

    const request = createRequest('valid-token');
    const response = await GET(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain('Token has expired');
  });

  it('verifies email successfully', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1); // Tomorrow

    const mockToken = {
      identifier: 'user-1',
      token: 'valid-token',
      expires: futureDate,
    };

    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      emailVerified: null,
    };

    (prisma.verificationToken.findUnique as jest.Mock).mockResolvedValue(mockToken);
    (prisma.user.update as jest.Mock).mockResolvedValue({
      ...mockUser,
      emailVerified: new Date(),
    });

    const request = createRequest('valid-token');
    const response = await GET(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.message).toContain('verified successfully');

    // Verify token was deleted
    expect(prisma.verificationToken.delete).toHaveBeenCalledWith({
      where: { token: 'valid-token' },
    });

    // Verify user was updated
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: mockToken.identifier },
      data: { emailVerified: expect.any(Date) },
    });
  });

  it('handles database errors gracefully', async () => {
    (prisma.verificationToken.findUnique as jest.Mock).mockRejectedValue(
      new Error('Database error')
    );

    const request = createRequest('valid-token');
    const response = await GET(request);
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.error).toContain('verification failed');
  });

  it('prevents verification of already verified email', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const mockToken = {
      identifier: 'user-1',
      token: 'valid-token',
      expires: futureDate,
    };

    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      emailVerified: new Date(), // Already verified
    };

    (prisma.verificationToken.findUnique as jest.Mock).mockResolvedValue(mockToken);
    (prisma.user.update as jest.Mock).mockRejectedValue(
      new Error('Email already verified')
    );

    const request = createRequest('valid-token');
    const response = await GET(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain('already verified');
  });

  it('handles concurrent verification attempts', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const mockToken = {
      identifier: 'user-1',
      token: 'valid-token',
      expires: futureDate,
    };

    // First attempt finds token
    (prisma.verificationToken.findUnique as jest.Mock)
      .mockResolvedValueOnce(mockToken)
      // Second attempt (during update) finds token was already used
      .mockResolvedValueOnce(null);

    const request = createRequest('valid-token');
    const response = await GET(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain('Token has already been used');
  });

  it('sanitizes token input', async () => {
    const request = createRequest(' valid-token '); // Extra spaces
    await GET(request);

    expect(prisma.verificationToken.findUnique).toHaveBeenCalledWith({
      where: { token: 'valid-token' }, // Should be trimmed
    });
  });
});
