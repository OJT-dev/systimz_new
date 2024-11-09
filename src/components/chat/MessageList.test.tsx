import React from 'react';
import { render } from '@/tests/utils';
import MessageList from './MessageList';
import { createMockMessage } from '@/tests/utils';

describe('MessageList', () => {
  const mockMessages = [
    createMockMessage({
      id: '1',
      content: 'Hello, how are you?',
      type: 'user',
      createdAt: '2024-01-01T12:00:00Z',
    }),
    createMockMessage({
      id: '2',
      content: 'I am doing well, thank you!',
      type: 'ai',
      createdAt: '2024-01-01T12:01:00Z',
    }),
    createMockMessage({
      id: '3',
      content: 'That\'s great to hear!',
      type: 'user',
      createdAt: '2024-01-01T12:02:00Z',
    }),
  ];

  it('renders messages correctly', () => {
    const { getByText } = render(<MessageList messages={mockMessages} />);
    
    mockMessages.forEach(message => {
      expect(getByText(message.content)).toBeInTheDocument();
    });
  });

  it('applies correct styles for user messages', () => {
    const { container } = render(<MessageList messages={mockMessages} />);
    
    const userMessages = container.querySelectorAll('.justify-end');
    expect(userMessages).toHaveLength(2); // Two user messages
    
    userMessages.forEach(message => {
      expect(message.querySelector('.bg-blue-500')).toBeInTheDocument();
      expect(message.querySelector('.text-white')).toBeInTheDocument();
    });
  });

  it('applies correct styles for AI messages', () => {
    const { container } = render(<MessageList messages={mockMessages} />);
    
    const aiMessages = container.querySelectorAll('.justify-start');
    expect(aiMessages).toHaveLength(1); // One AI message
    
    aiMessages.forEach(message => {
      expect(message.querySelector('.bg-gray-100')).toBeInTheDocument();
      expect(message.querySelector('.text-gray-900')).toBeInTheDocument();
    });
  });

  it('displays messages in chronological order', () => {
    const { getAllByText } = render(<MessageList messages={mockMessages} />);
    
    const timestamps = getAllByText(/\d{1,2}:\d{2}:\d{2}/);
    const times = timestamps.map(el => el.textContent);
    
    expect(times).toEqual([...times].sort());
  });

  it('formats timestamps correctly', () => {
    const { getAllByText } = render(<MessageList messages={mockMessages} />);
    
    const timestamps = getAllByText(/\d{1,2}:\d{2}:\d{2}/);
    expect(timestamps).toHaveLength(mockMessages.length);
    
    timestamps.forEach(timestamp => {
      expect(timestamp).toHaveClass('text-xs', 'opacity-75');
    });
  });

  it('handles empty message list', () => {
    const { container } = render(<MessageList messages={[]} />);
    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it('handles messages with long content', () => {
    const longMessage = createMockMessage({
      content: 'This is a very long message that should be contained within the message bubble and not overflow. '.repeat(5),
      type: 'user',
    });

    const { container } = render(<MessageList messages={[longMessage]} />);
    const messageBubble = container.querySelector('.max-w-[70%]');
    
    expect(messageBubble).toBeInTheDocument();
  });

  it('maintains consistent spacing between messages', () => {
    const { container } = render(<MessageList messages={mockMessages} />);
    expect(container.firstChild).toHaveClass('space-y-4');
  });

  it('has proper accessibility structure', () => {
    const { container } = render(<MessageList messages={mockMessages} />);
    
    // Messages should be in a list or article structure
    const messageContainer = container.firstChild;
    expect(messageContainer).toHaveAttribute('role', 'log');
    expect(messageContainer).toHaveAttribute('aria-live', 'polite');
    
    // Each message should be properly labeled
    const messages = container.querySelectorAll('[role="article"]');
    messages.forEach(message => {
      expect(message).toHaveAttribute('aria-label');
    });
  });

  it('handles messages with special characters', () => {
    const specialMessage = createMockMessage({
      content: '!@#$%^&*()_+ Special <characters> & symbols',
      type: 'user',
    });

    const { getByText } = render(<MessageList messages={[specialMessage]} />);
    expect(getByText(specialMessage.content)).toBeInTheDocument();
  });

  it('handles rapid message updates', () => {
    const { rerender, container } = render(<MessageList messages={[mockMessages[0]]} />);
    
    // Add messages one by one
    rerender(<MessageList messages={[mockMessages[0], mockMessages[1]]} />);
    rerender(<MessageList messages={mockMessages} />);
    
    const messages = container.querySelectorAll('[role="article"]');
    expect(messages).toHaveLength(mockMessages.length);
  });
});
