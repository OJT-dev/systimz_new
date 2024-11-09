import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { GET } from './route';

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

describe('WebSocket Route Handler', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock request
    mockRequest = new NextRequest(new URL('wss://localhost:3000/api/ws'), {
      headers: new Headers({
        'upgrade': 'websocket',
        'sec-websocket-key': 'test-key',
      }),
    });
  });

  it('requires authentication', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const response = await GET(mockRequest);
    expect(response.status).toBe(401);
    expect(await response.text()).toBe('Unauthorized');
  });

  it('requires WebSocket upgrade header', async () => {
    const mockSession = {
      user: { id: 'user-1', name: 'Test User' },
      expires: '2024-01-01',
    };
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    // Request without upgrade header
    const regularRequest = new NextRequest('http://localhost:3000/api/ws');
    const response = await GET(regularRequest);

    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Expected WebSocket connection');
  });

  it('handles WebSocket upgrade for authenticated users', async () => {
    const mockSession = {
      user: { id: 'user-1', name: 'Test User' },
      expires: '2024-01-01',
    };
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    const response = await GET(mockRequest);

    expect(response.status).toBe(101);
    expect(response.headers.get('upgrade')).toBe('websocket');
    expect(response.headers.get('connection')).toBe('Upgrade');
    expect(response.headers.get('sec-websocket-accept')).toBe('test-key');

    // Verify location header contains userId
    const locationUrl = new URL(response.headers.get('location') || '');
    expect(locationUrl.searchParams.get('userId')).toBe(mockSession.user.id);
  });

  it('includes authentication in WebSocket URL', async () => {
    const mockSession = {
      user: { id: 'user-1', name: 'Test User' },
      expires: '2024-01-01',
    };
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    const response = await GET(mockRequest);
    const locationHeader = response.headers.get('location');
    expect(locationHeader).toBeDefined();

    if (locationHeader) {
      const wsUrl = new URL(locationHeader);
      expect(wsUrl.protocol).toBe('ws:');
      expect(wsUrl.host).toBe('localhost:3000');
      expect(wsUrl.pathname).toBe('/api/ws');
      expect(wsUrl.searchParams.get('userId')).toBe(mockSession.user.id);
    }
  });

  it('handles missing WebSocket key', async () => {
    const mockSession = {
      user: { id: 'user-1', name: 'Test User' },
      expires: '2024-01-01',
    };
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    // Request without WebSocket key
    const requestWithoutKey = new NextRequest(new URL('wss://localhost:3000/api/ws'), {
      headers: new Headers({
        'upgrade': 'websocket',
      }),
    });

    const response = await GET(requestWithoutKey);
    expect(response.status).toBe(101);
    expect(response.headers.get('sec-websocket-accept')).toBe('');
  });

  it('preserves query parameters in WebSocket URL', async () => {
    const mockSession = {
      user: { id: 'user-1', name: 'Test User' },
      expires: '2024-01-01',
    };
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    // Request with additional query parameters
    const requestWithQuery = new NextRequest(
      new URL('wss://localhost:3000/api/ws?param1=value1&param2=value2'),
      {
        headers: new Headers({
          'upgrade': 'websocket',
          'sec-websocket-key': 'test-key',
        }),
      }
    );

    const response = await GET(requestWithQuery);
    const locationHeader = response.headers.get('location');
    expect(locationHeader).toBeDefined();

    if (locationHeader) {
      const wsUrl = new URL(locationHeader);
      expect(wsUrl.searchParams.get('param1')).toBe('value1');
      expect(wsUrl.searchParams.get('param2')).toBe('value2');
      expect(wsUrl.searchParams.get('userId')).toBe(mockSession.user.id);
    }
  });
});
