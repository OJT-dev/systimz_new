import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from './route';
import { getServerSession } from 'next-auth';

// Mock Prisma client
const mockPrisma = {
  avatar: {
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

describe('Avatar [id] API', () => {
  const mockSession = {
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
    },
  };

  const mockAvatar = {
    id: 'avatar-1',
    name: 'Test Avatar',
    description: 'Test Description',
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/avatars/[id]', () => {
    const createContext = (id: string) => ({
      params: { id },
    });

    it('requires authentication', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const response = await GET(
        new NextRequest('http://localhost:3000/api/avatars/avatar-1'),
        createContext('avatar-1')
      );
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toContain('Unauthorized');
    });

    it('returns 404 for non-existent avatar', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      mockPrisma.avatar.findUnique.mockResolvedValue(null);

      const response = await GET(
        new NextRequest('http://localhost:3000/api/avatars/non-existent'),
        createContext('non-existent')
      );
      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.error).toContain('not found');
    });

    it('prevents unauthorized access', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 'different-user' },
      });

      mockPrisma.avatar.findUnique.mockResolvedValue(mockAvatar);

      const response = await GET(
        new NextRequest('http://localhost:3000/api/avatars/avatar-1'),
        createContext('avatar-1')
      );
      expect(response.status).toBe(403);

      const data = await response.json();
      expect(data.error).toContain('not authorized');
    });

    it('returns avatar successfully', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      mockPrisma.avatar.findUnique.mockResolvedValue(mockAvatar);

      const response = await GET(
        new NextRequest('http://localhost:3000/api/avatars/avatar-1'),
        createContext('avatar-1')
      );
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.avatar).toEqual(mockAvatar);
    });

    it('handles database errors gracefully', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      mockPrisma.avatar.findUnique.mockRejectedValue(new Error('Database error'));

      const response = await GET(
        new NextRequest('http://localhost:3000/api/avatars/avatar-1'),
        createContext('avatar-1')
      );
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error).toContain('fetch avatar failed');
    });
  });

  describe('PUT /api/avatars/[id]', () => {
    const createContext = (id: string) => ({
      params: { id },
    });

    const createRequest = (id: string, body: any) => {
      return new NextRequest(`http://localhost:3000/api/avatars/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    };

    it('requires authentication', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const response = await PUT(
        createRequest('avatar-1', { name: 'Updated Avatar' }),
        createContext('avatar-1')
      );
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toContain('Unauthorized');
    });

    it('validates required fields', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      mockPrisma.avatar.findUnique.mockResolvedValue(mockAvatar);

      const response = await PUT(
        createRequest('avatar-1', {}),
        createContext('avatar-1')
      );
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('name');
    });

    it('prevents unauthorized updates', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 'different-user' },
      });

      mockPrisma.avatar.findUnique.mockResolvedValue(mockAvatar);

      const response = await PUT(
        createRequest('avatar-1', { name: 'Updated Avatar' }),
        createContext('avatar-1')
      );
      expect(response.status).toBe(403);

      const data = await response.json();
      expect(data.error).toContain('not authorized');
    });

    it('updates avatar successfully', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      mockPrisma.avatar.findUnique.mockResolvedValue(mockAvatar);

      const updatedAvatar = {
        ...mockAvatar,
        name: 'Updated Avatar',
        description: 'Updated Description',
      };
      mockPrisma.avatar.update.mockResolvedValue(updatedAvatar);

      const response = await PUT(
        createRequest('avatar-1', {
          name: 'Updated Avatar',
          description: 'Updated Description',
        }),
        createContext('avatar-1')
      );
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.avatar).toEqual(updatedAvatar);
    });

    it('handles database errors gracefully', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      mockPrisma.avatar.findUnique.mockResolvedValue(mockAvatar);
      mockPrisma.avatar.update.mockRejectedValue(new Error('Database error'));

      const response = await PUT(
        createRequest('avatar-1', { name: 'Updated Avatar' }),
        createContext('avatar-1')
      );
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error).toContain('update avatar failed');
    });
  });

  describe('DELETE /api/avatars/[id]', () => {
    const createContext = (id: string) => ({
      params: { id },
    });

    it('requires authentication', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const response = await DELETE(
        new NextRequest('http://localhost:3000/api/avatars/avatar-1'),
        createContext('avatar-1')
      );
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toContain('Unauthorized');
    });

    it('prevents unauthorized deletion', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 'different-user' },
      });

      mockPrisma.avatar.findUnique.mockResolvedValue(mockAvatar);

      const response = await DELETE(
        new NextRequest('http://localhost:3000/api/avatars/avatar-1'),
        createContext('avatar-1')
      );
      expect(response.status).toBe(403);

      const data = await response.json();
      expect(data.error).toContain('not authorized');
    });

    it('deletes avatar successfully', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      mockPrisma.avatar.findUnique.mockResolvedValue(mockAvatar);
      mockPrisma.avatar.delete.mockResolvedValue(mockAvatar);

      const response = await DELETE(
        new NextRequest('http://localhost:3000/api/avatars/avatar-1'),
        createContext('avatar-1')
      );
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.message).toContain('deleted successfully');
    });

    it('handles database errors gracefully', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      mockPrisma.avatar.findUnique.mockResolvedValue(mockAvatar);
      mockPrisma.avatar.delete.mockRejectedValue(new Error('Database error'));

      const response = await DELETE(
        new NextRequest('http://localhost:3000/api/avatars/avatar-1'),
        createContext('avatar-1')
      );
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error).toContain('delete avatar failed');
    });
  });
});
