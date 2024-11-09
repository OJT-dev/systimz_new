import { NextRequest } from 'next/server';
import { POST, GET } from './route';
import { getServerSession } from 'next-auth';

// Mock Prisma client
const mockPrisma = {
  avatar: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
};

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

describe('Avatar API', () => {
  const mockSession = {
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/avatars', () => {
    const createRequest = (body: any) => {
      return new NextRequest('http://localhost:3000/api/avatars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    };

    it('requires authentication', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = createRequest({
        name: 'Test Avatar',
        description: 'Test Description',
      });

      const response = await POST(request);
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toContain('Unauthorized');
    });

    it('validates required fields', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const testCases = [
        { body: {}, field: 'name' },
        { body: { description: 'Test' }, field: 'name' },
      ];

      for (const testCase of testCases) {
        const request = createRequest(testCase.body);
        const response = await POST(request);
        expect(response.status).toBe(400);

        const data = await response.json();
        expect(data.error).toContain(testCase.field);
      }
    });

    it('creates avatar successfully', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const mockAvatar = {
        id: 'avatar-1',
        name: 'Test Avatar',
        description: 'Test Description',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.avatar.create.mockResolvedValue(mockAvatar);

      const request = createRequest({
        name: 'Test Avatar',
        description: 'Test Description',
      });

      const response = await POST(request);
      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data).toEqual({
        avatar: mockAvatar,
      });

      expect(mockPrisma.avatar.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Avatar',
          description: 'Test Description',
          userId: mockSession.user.id,
        },
      });
    });

    it('handles database errors gracefully', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      mockPrisma.avatar.create.mockRejectedValue(new Error('Database error'));

      const request = createRequest({
        name: 'Test Avatar',
        description: 'Test Description',
      });

      const response = await POST(request);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error).toContain('create avatar failed');
    });

    it('sanitizes input', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const request = createRequest({
        name: ' Test Avatar ',
        description: ' Test Description ',
      });

      await POST(request);

      expect(mockPrisma.avatar.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Test Avatar',
          description: 'Test Description',
        }),
      });
    });
  });

  describe('GET /api/avatars', () => {
    it('requires authentication', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/avatars');
      const response = await GET(request);
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toContain('Unauthorized');
    });

    it('lists user avatars', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const mockAvatars = [
        {
          id: 'avatar-1',
          name: 'Avatar 1',
          description: 'Description 1',
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'avatar-2',
          name: 'Avatar 2',
          description: 'Description 2',
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.avatar.findMany.mockResolvedValue(mockAvatars);

      const request = new NextRequest('http://localhost:3000/api/avatars');
      const response = await GET(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        avatars: mockAvatars,
      });

      expect(mockPrisma.avatar.findMany).toHaveBeenCalledWith({
        where: { userId: mockSession.user.id },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('handles database errors gracefully', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      mockPrisma.avatar.findMany.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/avatars');
      const response = await GET(request);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error).toContain('fetch avatars failed');
    });
  });
});
