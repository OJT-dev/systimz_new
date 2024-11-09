import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { parse } from 'url';
import type { Server } from 'http';

interface WebSocketMessage {
  type: string;
  content: string;
  userId: string;
}

type WebSocketData = string | Buffer | ArrayBuffer | Buffer[];

export class WebSocketHandler {
  private wss: WebSocketServer;
  private clients: Map<WebSocket, string> = new Map(); // WebSocket -> userId

  constructor(server: Server) {
    this.wss = new WebSocketServer({ noServer: true });

    server.on('upgrade', (request: IncomingMessage, socket, head) => {
      const { pathname, query } = parse(request.url || '', true);

      if (pathname === '/api/ws') {
        const userId = query.userId as string;
        if (!userId) {
          socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
          socket.destroy();
          return;
        }

        this.wss.handleUpgrade(request, socket, head, (ws) => {
          this.handleConnection(ws, userId);
        });
      }
    });
  }

  private handleConnection(ws: WebSocket, userId: string) {
    this.clients.set(ws, userId);

    ws.on('message', (data: WebSocketData) => {
      try {
        const message = JSON.parse(data.toString()) as WebSocketMessage;
        this.broadcastMessage(ws, message);
      } catch (error) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format',
        }));
      }
    });

    ws.on('close', () => {
      this.clients.delete(ws);
    });

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'system',
      content: 'Connected to chat server',
      userId: 'system',
    }));
  }

  private broadcastMessage(sender: WebSocket, message: WebSocketMessage) {
    const outgoingMessage = {
      ...message,
      timestamp: new Date().toISOString(),
    };

    this.wss.clients.forEach((client) => {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(outgoingMessage));
      }
    });
  }

  public close() {
    this.wss.close();
  }
}

// Export a function to create the WebSocket handler
export function createWebSocketHandler(server: Server) {
  return new WebSocketHandler(server);
}
