import { Message, NewMessage } from '@/types/chat';
import { getSession } from 'next-auth/react';

type WebSocketCallback = (message: Message) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private messageCallback: WebSocketCallback | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private async initialize() {
    const session = await getSession();
    if (session?.user) {
      this.connect();
    }
  }

  private async connect() {
    const session = await getSession();
    if (!session?.user) {
      console.error('No active session found');
      return;
    }

    try {
      // Connect to standalone WebSocket server
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname;
      const port = process.env.NEXT_PUBLIC_WS_PORT || '3001';
      const wsUrl = `${protocol}//${host}:${port}?userId=${session.user.id}`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      this.ws = new WebSocket(wsUrl);
      this.setupEventListeners();
      this.setupPingInterval();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    }
  }

  private setupEventListeners() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'initial':
            // Handle initial messages load
            if (this.messageCallback && Array.isArray(data.messages)) {
              data.messages.forEach((message: Message) => {
                if (this.messageCallback) {
                  this.messageCallback(message);
                }
              });
            }
            break;
          
          case 'message':
            // Handle new message
            if (this.messageCallback && data.message) {
              this.messageCallback(data.message);
            }
            break;
          
          case 'pong':
            // Handle pong response
            console.log('Received pong from server');
            break;
          
          case 'error':
            console.error('WebSocket message error:', data.error);
            break;
          
          default:
            console.warn('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.clearPingInterval();
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private setupPingInterval() {
    // Send ping every 30 seconds to keep connection alive
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        console.log('Sending ping to server');
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  private clearPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
    console.log(`Scheduling reconnect in ${delay}ms`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
      this.connect();
    }, delay);
  }

  public onMessage(callback: WebSocketCallback) {
    this.messageCallback = callback;
  }

  public sendMessage(message: NewMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const payload = {
        type: 'message',
        content: message.content,
        userId: message.userId,
        metadata: message.metadata,
        messageType: message.type // Rename 'type' to 'messageType' to avoid conflict
      };
      this.ws.send(JSON.stringify(payload));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.clearPingInterval();
    this.messageCallback = null;
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
