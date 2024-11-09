'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import MessageList from './MessageList';
import InputArea from './InputArea';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMessages, addMessage } from '@/store/slices/messageSlice';
import { useToast } from '@/hooks/useToast';
import { webSocketService } from '@/services/chat/WebSocketService';
import type { Message, NewMessage } from '@/types/chat';
import type { RootState } from '@/store';

/**
 * ChatInterface Component
 * 
 * Main chat interface that combines message display and input.
 * Handles WebSocket communication and message state management.
 */
const ChatInterface = () => {
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const { messages, loading, error } = useAppSelector((state: RootState) => state.messages);
  const { showToast } = useToast();
  const wsInitialized = useRef(false);

  // Memoize message handler to prevent unnecessary re-renders
  const handleWebSocketMessage = useCallback((message: Message) => {
    dispatch(addMessage(message));
  }, [dispatch]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!wsInitialized.current) {
      try {
        webSocketService.onMessage(handleWebSocketMessage);
        wsInitialized.current = true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize WebSocket';
        showToast(errorMessage, 'error');
      }
    }

    // Cleanup function
    return () => {
      try {
        webSocketService.disconnect();
        wsInitialized.current = false;
      } catch (err) {
        console.error('Error disconnecting WebSocket:', err);
      }
    };
  }, [handleWebSocketMessage, showToast]);

  // Fetch initial messages
  useEffect(() => {
    const fetchInitialMessages = async () => {
      try {
        await dispatch(fetchMessages()).unwrap();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load messages';
        showToast(errorMessage, 'error');
      }
    };

    fetchInitialMessages();
  }, [dispatch, showToast]);

  // Memoize send message handler
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    try {
      // Send message through WebSocket
      const message: NewMessage = {
        content: content.trim(),
        type: 'user',
        userId: session?.user?.id || '',
        metadata: ''
      };
      
      webSocketService.sendMessage(message);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      showToast(errorMessage, 'error');
    }
  }, [showToast, session?.user?.id]);

  return (
    <div 
      className="flex flex-col h-[600px] max-w-4xl mx-auto bg-white rounded-lg shadow-lg"
      role="region"
      aria-label="Chat interface"
    >
      <div 
        className="flex-1 overflow-y-auto p-4"
        role="log"
        aria-live="polite"
        aria-label="Message history"
      >
        {loading ? (
          <div 
            className="flex items-center justify-center h-full"
            role="status"
            aria-label="Loading messages"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : error ? (
          <div 
            className="flex items-center justify-center h-full text-red-500"
            role="alert"
            aria-label="Error message"
          >
            {error}
          </div>
        ) : (
          <MessageList messages={messages} />
        )}
      </div>
      <div className="border-t border-gray-200 p-4">
        <InputArea onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default ChatInterface;
