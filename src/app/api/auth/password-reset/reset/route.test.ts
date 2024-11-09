import { NextRequest } from 'next/server';
import { POST } from './route';
import { hash } from 'bcryptjs';

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

// Mock Prisma client
const mockPrisma = {
  user: {
    update: jest.fn(),
  },
  passwordResetToken: {
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

describe('Password Reset API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (hash as jest.Mock).mockResolvedValue('hashed-password');
  });

  const createRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/auth/password-reset/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  };

  it('validates required fields', async () => {
    const testCases = [
      { body: {}, field: 'token' },
      { body: { token: 'valid-token' }, field: 'password' },
    ];

    for (const testCase of testCases) {
      const request = createRequest(testCase.body);
      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain(testCase.field);
    }
  });

  it('validates password strength', async () => {
    const request = createRequest({
      token: 'valid-token',
      password: 'weak',
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain('Password must');
  });

  it('handles invalid token', async () => {
    mockPrisma.passwordResetToken.findUnique.mockResolvedValue(null);

    const request = createRequest({
      token: 'invalid-token',
      password: 'StrongPassword123!',
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain('Invalid or expired token');
  });

  it('handles expired token', async () => {
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() - 1); // Yesterday

    mockPrisma.passwordResetToken.findUnique.mockResolvedValue({
      userId: 'user-1',
      token: 'valid-token',
      expires: expiredDate,
    });

    const request = createRequest({
      token: 'valid-token',
      password: 'StrongPassword123!',
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain('expired');
  });

  it('resets password successfully', async () => {
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 1);

    mockPrisma.passwordResetToken.findUnique.mockResolvedValue({
      userId: 'user-1',
      token: 'valid-token',
      expires: futureDate,
    });

    const request = createRequest({
      token: 'valid-token',
      password: 'StrongPassword123!',
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    // Verify password was updated
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { password: 'hashed-password' },
    });

    // Verify token was deleted
    expect(mockPrisma.passwordResetToken.delete).toHaveBeenCalledWith({
      where: { token: 'valid-token' },
    });
  });

  it('handles database errors gracefully', async () => {
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 1);

    mockPrisma.passwordResetToken.findUnique.mockResolvedValue({
      userId: 'user-1',
      token: 'valid-token',
      expires: futureDate,
    });

    mockPrisma.user.update.mockRejectedValue(new Error('Database error'));

    const request = createRequest({
      token: 'valid-token',
      password: 'StrongPassword123!',
    });

    const response = await POST(request);
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.error).toContain('reset failed');
  });

  it('prevents reuse of reset token', async () => {
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 1);

    // First attempt finds token
    mockPrisma.passwordResetToken.findUnique
      .mockResolvedValueOnce({
        userId: 'user-1',
        token: 'valid-token',
        expires: futureDate,
      })
      // Second attempt (during update) finds token was already used
      .mockResolvedValueOnce(null);

    mockPrisma.user.update.mockRejectedValue(new Error('Token already used'));

    const request = createRequest({
      token: 'valid-token',
      password: 'StrongPassword123!',
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain('already been used');
  });

  it('sanitizes input', async () => {
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 1);

    mockPrisma.passwordResetToken.findUnique.mockResolvedValue({
      userId: 'user-1',
      token: 'valid-token',
      expires: futureDate,
    });

    const request = createRequest({
      token: ' valid-token ',  // Extra spaces
      password: ' StrongPassword123! ',  // Extra spaces
    });

    await POST(request);

    expect(mockPrisma.passwordResetToken.findUnique).toHaveBeenCalledWith({
      where: { token: 'valid-token' },  // Should be trimmed
    });
  });
});
