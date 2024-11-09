'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

interface InputAreaProps {
  onSendMessage: (message: string) => void;
}

/**
 * InputArea Component
 * 
 * A textarea input with send button for submitting chat messages.
 * Supports both button click and Enter key (without shift) for submission.
 * 
 * @param {InputAreaProps} props - Component props
 * @param {Function} props.onSendMessage - Callback for message submission
 */
const InputArea = React.memo(function InputArea({ onSendMessage }: InputAreaProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  }, [message, onSendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) {
        onSendMessage(message.trim());
        setMessage('');
      }
    }
  }, [message, onSendMessage]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Adjust textarea height
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  }, []);

  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex gap-2"
      aria-label="Message form"
      role="form"
    >
      <textarea
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
        placeholder="Type your message..."
        className="flex-1 resize-none rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px] max-h-[200px] overflow-y-auto"
        rows={1}
        aria-label="Message input"
      />
      <Button
        type="submit"
        disabled={!message.trim()}
        variant="default"
        className="self-end"
      >
        Send
      </Button>
    </form>
  );
});

InputArea.displayName = 'InputArea';

export default InputArea;
