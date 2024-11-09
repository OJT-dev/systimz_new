export interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai';
  userId: string;
  metadata?: string;
  createdAt: string;
  updatedAt: string;
}

export type NewMessage = Omit<Message, 'id' | 'createdAt' | 'updatedAt'>;

export type MessageType = 'user' | 'ai';

export interface WebSocketMessage {
  type: 'ping' | 'message';
  content?: string;
  messageType?: MessageType;
  metadata?: string;
}

export interface WebSocketBroadcast {
  type: 'message' | 'initial' | 'error' | 'pong';
  message?: Message;
  messages?: Message[];
  error?: string;
}

export interface WebSocketError {
  type: 'error';
  error: string;
}
