import { NextRequest } from 'next/server';
import { POST, GET, DELETE } from './route';
import { getServerSession } from 'next-auth';

// Mock Prisma client
const mockPrisma = {
  message: {
    create: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

describe('Messages API', () => {
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

  describe('POST /api/messages', () => {
    const createRequest = (body: any) => {
      return new NextRequest('http://localhost:3000/api/messages', {
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
        content: 'Test message',
        type: 'user',
      });

      const response = await POST(request);
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toContain('Unauthorized');
    });

    it('validates required fields', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const testCases = [
        { body: {}, field: 'content' },
        { body: { content: '' }, field: 'content' },
        { body: { content: 'Test', type: 'invalid' }, field: 'type' },
      ];

      for (const testCase of testCases) {
        const request = createRequest(testCase.body);
        const response = await POST(request);
        expect(response.status).toBe(400);

        const data = await response.json();
        expect(data.error).toContain(testCase.field);
      }
    });

    it('implements rate limiting', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      mockPrisma.message.count.mockResolvedValue(10); // Over rate limit

      const request = createRequest({
        content: 'Test message',
        type: 'user',
      });

      const response = await POST(request);
      expect(response.status).toBe(429);

      const data = await response.json();
      expect(data.error).toContain('rate limit');
    });

    it('creates message successfully', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      mockPrisma.message.count.mockResolvedValue(0);

      const mockMessage = {
        id: 'msg-1',
        content: 'Test message',
        type: 'user',
        userId: 'user-1',
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.message.create.mockResolvedValue(mockMessage);

      const request = createRequest({
        content: 'Test message',
        type: 'user',
      });

      const response = await POST(request);
      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.message).toEqual(mockMessage);
    });

    it('handles database errors gracefully', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      mockPrisma.message.count.mockResolvedValue(0);
      mockPrisma.message.create.mockRejectedValue(new Error('Database error'));

      const request = createRequest({
        content: 'Test message',
        type: 'user',
      });

      const response = await POST(request);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error).toContain('create message failed');
    });
  });

  describe('GET /api/messages', () => {
    it('requires authentication', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/messages');
      const response = await GET(request);
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toContain('Unauthorized');
    });

    it('implements pagination', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const mockMessages = Array(10).fill(null).map((_, i) => ({
        id: `msg-${i}`,
        content: `Message ${i}`,
        type: 'user',
        userId: 'user-1',
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      mockPrisma.message.findMany.mockResolvedValue(mockMessages);
      mockPrisma.message.count.mockResolvedValue(25);

      const request = new NextRequest('http://localhost:3000/api/messages?page=2&limit=10');
      const response = await GET(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.messages).toEqual(mockMessages);
      expect(data.pagination).toEqual({
        currentPage: 2,
        totalPages: 3,
        totalMessages: 25,
      });
    });

    it('handles invalid pagination parameters', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/messages?page=0&limit=0');
      const response = await GET(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('Invalid pagination');
    });

    it('handles database errors gracefully', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      mockPrisma.message.findMany.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/messages');
      const response = await GET(request);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error).toContain('fetch messages failed');
    });
  });

  describe('DELETE /api/messages', () => {
    const createRequest = (messageId: string) => {
      return new NextRequest(`http://localhost:3000/api/messages?id=${messageId}`);
    };

    it('requires authentication', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = createRequest('msg-1');
      const response = await DELETE(request);
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toContain('Unauthorized');
    });

    it('requires message ID', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/messages');
      const response = await DELETE(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('Message ID is required');
    });

    it('deletes message successfully', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const mockMessage = {
        id: 'msg-1',
        content: 'Test message',
        type: 'user',
        userId: 'user-1',
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.message.delete.mockResolvedValue(mockMessage);

      const request = createRequest('msg-1');
      const response = await DELETE(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.message).toEqual('Message deleted successfully');
    });

    it('handles database errors gracefully', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      mockPrisma.message.delete.mockRejectedValue(new Error('Database error'));

      const request = createRequest('msg-1');
      const response = await DELETE(request);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error).toContain('delete message failed');
    });
  });
});
