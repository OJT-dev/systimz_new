import React from 'react';
import { render } from '@/tests/utils';
import InputArea from './InputArea';

describe('InputArea', () => {
  const mockOnSendMessage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders input field and send button', () => {
    const { getByPlaceholderText, getByRole } = render(
      <InputArea onSendMessage={mockOnSendMessage} />
    );

    expect(getByPlaceholderText('Type your message...')).toBeInTheDocument();
    expect(getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('handles text input correctly', async () => {
    const { getByPlaceholderText, user } = render(
      <InputArea onSendMessage={mockOnSendMessage} />
    );

    const input = getByPlaceholderText('Type your message...') as HTMLTextAreaElement;
    await user.type(input, 'Hello, world!');

    expect(input.value).toBe('Hello, world!');
  });

  it('calls onSendMessage when form is submitted', async () => {
    const { getByPlaceholderText, getByRole, user } = render(
      <InputArea onSendMessage={mockOnSendMessage} />
    );

    const input = getByPlaceholderText('Type your message...');
    const sendButton = getByRole('button', { name: /send/i });

    await user.type(input, 'Test message');
    await user.click(sendButton);

    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
  });

  it('clears input after sending message', async () => {
    const { getByPlaceholderText, getByRole, user } = render(
      <InputArea onSendMessage={mockOnSendMessage} />
    );

    const input = getByPlaceholderText('Type your message...') as HTMLTextAreaElement;
    const sendButton = getByRole('button', { name: /send/i });

    await user.type(input, 'Test message');
    await user.click(sendButton);

    expect(input.value).toBe('');
  });

  it('prevents sending empty messages', async () => {
    const { getByRole, user } = render(
      <InputArea onSendMessage={mockOnSendMessage} />
    );

    const sendButton = getByRole('button', { name: /send/i });
    await user.click(sendButton);

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('prevents sending whitespace-only messages', async () => {
    const { getByPlaceholderText, getByRole, user } = render(
      <InputArea onSendMessage={mockOnSendMessage} />
    );

    const input = getByPlaceholderText('Type your message...');
    const sendButton = getByRole('button', { name: /send/i });

    await user.type(input, '   ');
    await user.click(sendButton);

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('handles Enter key press to send message', async () => {
    const { getByPlaceholderText, user } = render(
      <InputArea onSendMessage={mockOnSendMessage} />
    );

    const input = getByPlaceholderText('Type your message...');
    await user.type(input, 'Test message{Enter}');

    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
  });

  it('handles Shift+Enter for new line', async () => {
    const { getByPlaceholderText, user } = render(
      <InputArea onSendMessage={mockOnSendMessage} />
    );

    const input = getByPlaceholderText('Type your message...') as HTMLTextAreaElement;
    await user.type(input, 'Line 1{Shift>}{Enter}{/Shift}Line 2');

    expect(mockOnSendMessage).not.toHaveBeenCalled();
    expect(input.value).toContain('Line 1\nLine 2');
  });

  it('disables send button when input is empty', () => {
    const { getByRole } = render(
      <InputArea onSendMessage={mockOnSendMessage} />
    );

    const sendButton = getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });

  it('enables send button when input has content', async () => {
    const { getByPlaceholderText, getByRole, user } = render(
      <InputArea onSendMessage={mockOnSendMessage} />
    );

    const input = getByPlaceholderText('Type your message...');
    const sendButton = getByRole('button', { name: /send/i });

    await user.type(input, 'Test');
    expect(sendButton).toBeEnabled();
  });

  it('has proper accessibility attributes', () => {
    const { getByRole, getByPlaceholderText } = render(
      <InputArea onSendMessage={mockOnSendMessage} />
    );

    const input = getByPlaceholderText('Type your message...');
    expect(input).toHaveAttribute('aria-label', 'Message input');
    
    const form = getByRole('form');
    expect(form).toHaveAttribute('aria-label', 'Message form');
  });

  it('adjusts textarea height based on content', async () => {
    const { getByPlaceholderText, user } = render(
      <InputArea onSendMessage={mockOnSendMessage} />
    );

    const input = getByPlaceholderText('Type your message...') as HTMLTextAreaElement;
    const initialHeight = input.clientHeight;

    await user.type(input, 'Line 1{Shift>}{Enter}{/Shift}Line 2{Shift>}{Enter}{/Shift}Line 3');
    
    expect(input.clientHeight).toBeGreaterThan(initialHeight);
  });

  it('trims whitespace from messages before sending', async () => {
    const { getByPlaceholderText, getByRole, user } = render(
      <InputArea onSendMessage={mockOnSendMessage} />
    );

    const input = getByPlaceholderText('Type your message...');
    const sendButton = getByRole('button', { name: /send/i });

    await user.type(input, '  Test message  ');
    await user.click(sendButton);

    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
  });
});
