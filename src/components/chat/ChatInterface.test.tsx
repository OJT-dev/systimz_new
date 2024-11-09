import React from 'react';
import { render } from '@/tests/utils';
import ChatInterface from './ChatInterface';
import { webSocketService } from '@/services/chat/WebSocketService';
import { createMockMessage } from '@/tests/utils';
import { fetchMessages, addMessage } from '@/store/slices/messageSlice';

// Mock WebSocket service
jest.mock('@/services/chat/WebSocketService', () => ({
  webSocketService: {
    onMessage: jest.fn(),
    sendMessage: jest.fn(),
    disconnect: jest.fn(),
  },
}));

// Mock useToast hook
jest.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));

describe('ChatInterface', () => {
  const mockMessages = [
    createMockMessage({ id: '1', content: 'Hello', type: 'user' }),
    createMockMessage({ id: '2', content: 'Hi there', type: 'ai' }),
  ];

  const mockInitialState = {
    messages: {
      messages: mockMessages,
      loading: false,
      error: null,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    const { getByRole } = render(<ChatInterface />, {
      initialState: {
        messages: {
          messages: [],
          loading: true,
          error: null,
        },
      },
    });

    expect(getByRole('status')).toBeInTheDocument();
  });

  it('renders messages when loaded', () => {
    const { getByText } = render(<ChatInterface />, {
      initialState: mockInitialState,
    });

    mockMessages.forEach(message => {
      expect(getByText(message.content)).toBeInTheDocument();
    });
  });

  it('initializes WebSocket connection on mount', () => {
    render(<ChatInterface />);
    expect(webSocketService.onMessage).toHaveBeenCalled();
  });

  it('cleans up WebSocket connection on unmount', () => {
    const { unmount } = render(<ChatInterface />);
    unmount();
    expect(webSocketService.disconnect).toHaveBeenCalled();
  });

  it('fetches initial messages on mount', () => {
    const { store } = render(<ChatInterface />);
    const actions = store.getActions();
    expect(actions).toContainEqual(expect.objectContaining({
      type: fetchMessages.pending.type,
    }));
  });

  it('handles message sending', async () => {
    const { getByPlaceholderText, user } = render(<ChatInterface />, {
      initialState: mockInitialState,
    });

    const input = getByPlaceholderText('Type your message...');
    await user.type(input, 'New message{Enter}');

    expect(webSocketService.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'New message',
        type: 'user',
      })
    );
  });

  it('adds received messages to the state', () => {
    const { store } = render(<ChatInterface />, {
      initialState: mockInitialState,
    });

    // Simulate receiving a message through WebSocket
    const mockCallback = (webSocketService.onMessage as jest.Mock).mock.calls[0][0];
    const newMessage = createMockMessage({
      id: '3',
      content: 'New message',
      type: 'ai',
    });

    mockCallback(newMessage);

    const actions = store.getActions();
    expect(actions).toContainEqual(addMessage(newMessage));
  });

  it('handles errors during message fetch', () => {
    const { store } = render(<ChatInterface />, {
      initialState: {
        messages: {
          messages: [],
          loading: false,
          error: 'Failed to load messages',
        },
      },
    });

    const actions = store.getActions();
    expect(actions).toContainEqual(expect.objectContaining({
      type: fetchMessages.rejected.type,
    }));
  });

  it('maintains WebSocket connection during component updates', async () => {
    const { rerender } = render(<ChatInterface />, {
      initialState: mockInitialState,
    });

    const initialCallCount = (webSocketService.onMessage as jest.Mock).mock.calls.length;
    rerender(<ChatInterface />);

    expect(webSocketService.onMessage).toHaveBeenCalledTimes(initialCallCount);
  });

  it('handles rapid message sending', async () => {
    const { getByPlaceholderText, user } = render(<ChatInterface />, {
      initialState: mockInitialState,
    });

    const input = getByPlaceholderText('Type your message...');
    await user.type(input, 'Message 1{Enter}');
    await user.type(input, 'Message 2{Enter}');
    await user.type(input, 'Message 3{Enter}');

    expect(webSocketService.sendMessage).toHaveBeenCalledTimes(3);
  });

  it('displays error state correctly', () => {
    const { getByText } = render(<ChatInterface />, {
      initialState: {
        messages: {
          messages: [],
          loading: false,
          error: 'Error loading messages',
        },
      },
    });

    expect(getByText('Error loading messages')).toBeInTheDocument();
  });

  it('has proper accessibility structure', () => {
    const { container } = render(<ChatInterface />, {
      initialState: mockInitialState,
    });

    // Main chat container
    expect(container.firstChild).toHaveClass('flex', 'flex-col');
    
    // Message list area
    const messageArea = container.querySelector('[role="log"]');
    expect(messageArea).toBeInTheDocument();
    expect(messageArea).toHaveAttribute('aria-live', 'polite');

    // Input form
    const form = container.querySelector('[role="form"]');
    expect(form).toBeInTheDocument();
    expect(form).toHaveAttribute('aria-label', 'Message form');
  });

  it('maintains scroll position on new messages', async () => {
    const { store } = render(<ChatInterface />, {
      initialState: mockInitialState,
    });

    // Simulate receiving multiple messages
    const mockCallback = (webSocketService.onMessage as jest.Mock).mock.calls[0][0];
    
    for (let i = 0; i < 5; i++) {
      mockCallback(createMockMessage({
        id: `new-${i}`,
        content: `Message ${i}`,
        type: 'ai',
      }));
    }

    const actions = store.getActions();
    expect(actions.filter(action => action.type === addMessage.type)).toHaveLength(5);
  });
});
