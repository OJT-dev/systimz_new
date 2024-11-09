'use client';

import React from 'react';
import type { Message } from '@/types/chat';

interface MessageListProps {
  messages: Message[];
}

/**
 * MessageList Component
 * 
 * Displays a list of chat messages with different styles for user and AI messages.
 * Messages are displayed in chronological order with timestamps.
 * 
 * @param {MessageListProps} props - Component props
 * @param {Message[]} props.messages - Array of messages to display
 */
const MessageList = React.memo(function MessageList({ messages }: MessageListProps) {
  return (
    <div 
      className="space-y-4"
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          role="article"
          aria-label={`${message.type === 'user' ? 'You' : 'AI'}: ${message.content}`}
          className={`flex ${
            message.type === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[70%] rounded-lg px-4 py-2 ${
              message.type === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <p className="text-sm break-words">{message.content}</p>
            <span className="text-xs opacity-75 mt-1 block">
              {new Date(message.createdAt).toLocaleTimeString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
});

MessageList.displayName = 'MessageList';

export default MessageList;
