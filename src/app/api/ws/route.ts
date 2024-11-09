import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Handle WebSocket upgrade
  if (req.headers.get('upgrade') === 'websocket') {
    // Redirect to WebSocket server with authentication token
    const wsUrl = new URL('ws://localhost:3000/api/ws');
    wsUrl.searchParams.set('userId', session.user.id);

    return new Response(null, {
      status: 101,
      headers: {
        'Upgrade': 'websocket',
        'Connection': 'Upgrade',
        'Sec-WebSocket-Accept': req.headers.get('sec-websocket-key') || '',
        'Location': wsUrl.toString(),
      },
    });
  }

  return new Response('Expected WebSocket connection', { status: 400 });
}
