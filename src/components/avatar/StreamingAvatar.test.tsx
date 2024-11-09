import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { StreamingAvatar } from './StreamingAvatar';
import { useHeygenAvatar } from '@/hooks/useHeygenAvatar';
import { AvatarQuality } from '@/services/heygen/types';

// Mock useHeygenAvatar hook
jest.mock('@/hooks/useHeygenAvatar', () => ({
  useHeygenAvatar: jest.fn(),
}));

describe('StreamingAvatar', () => {
  const mockOnError = jest.fn();

  const mockStream = new MediaStream();
  const mockVideoTrack = new MediaStreamTrack();
  mockStream.addTrack(mockVideoTrack);

  beforeEach(() => {
    jest.clearAllMocks();
    (useHeygenAvatar as jest.Mock).mockReturnValue({
      isInitialized: false,
      isLoading: false,
      isTalking: false,
      error: null,
      initialize: jest.fn(),
      startSession: jest.fn(),
      speak: jest.fn(),
      interrupt: jest.fn(),
      stopSession: jest.fn(),
    });
  });

  it('renders loading state correctly', () => {
    (useHeygenAvatar as jest.Mock).mockReturnValue({
      isInitialized: true,
      isLoading: true,
      isTalking: false,
      error: null,
      initialize: jest.fn(),
      startSession: jest.fn(),
      speak: jest.fn(),
      interrupt: jest.fn(),
      stopSession: jest.fn(),
    });

    const { container } = render(
      <StreamingAvatar avatarId="test-id" onError={mockOnError} />
    );

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    const mockError = new Error('Failed to connect');
    (useHeygenAvatar as jest.Mock).mockReturnValue({
      isInitialized: true,
      isLoading: false,
      isTalking: false,
      error: mockError,
      initialize: jest.fn(),
      startSession: jest.fn(),
      speak: jest.fn(),
      interrupt: jest.fn(),
      stopSession: jest.fn(),
    });

    const { getByText } = render(
      <StreamingAvatar avatarId="test-id" onError={mockOnError} />
    );

    expect(getByText('Failed to connect')).toBeInTheDocument();
  });

  it('initializes avatar service on mount', () => {
    const mockInitialize = jest.fn();
    (useHeygenAvatar as jest.Mock).mockReturnValue({
      isInitialized: false,
      isLoading: false,
      isTalking: false,
      error: null,
      initialize: mockInitialize,
      startSession: jest.fn(),
      speak: jest.fn(),
      interrupt: jest.fn(),
      stopSession: jest.fn(),
    });

    render(<StreamingAvatar avatarId="test-id" onError={mockOnError} />);

    expect(mockInitialize).toHaveBeenCalled();
  });

  it('starts session when initialized', () => {
    const mockStartSession = jest.fn();
    (useHeygenAvatar as jest.Mock).mockReturnValue({
      isInitialized: true,
      isLoading: false,
      isTalking: false,
      error: null,
      initialize: jest.fn(),
      startSession: mockStartSession,
      speak: jest.fn(),
      interrupt: jest.fn(),
      stopSession: jest.fn(),
    });

    render(
      <StreamingAvatar
        avatarId="test-id"
        voiceId="test-voice"
        quality={AvatarQuality.High}
        language="en"
        onError={mockOnError}
      />
    );

    expect(mockStartSession).toHaveBeenCalledWith(expect.objectContaining({
      avatarName: 'test-id',
      quality: AvatarQuality.High,
      language: 'en',
      voice: expect.objectContaining({
        voiceId: 'test-voice',
      }),
    }));
  });

  it('handles text input and submission', async () => {
    const mockSpeak = jest.fn();
    (useHeygenAvatar as jest.Mock).mockReturnValue({
      isInitialized: true,
      isLoading: false,
      isTalking: false,
      error: null,
      initialize: jest.fn(),
      startSession: jest.fn(),
      speak: mockSpeak,
      interrupt: jest.fn(),
      stopSession: jest.fn(),
    });

    const { getByPlaceholderText, getByText } = render(
      <StreamingAvatar avatarId="test-id" onError={mockOnError} />
    );

    const input = getByPlaceholderText(/type something/i);
    const speakButton = getByText('Speak');

    await fireEvent.change(input, { target: { value: 'Hello world' } });
    await fireEvent.click(speakButton);

    expect(mockSpeak).toHaveBeenCalledWith('Hello world', expect.any(String));
  });

  it('handles interruption when talking', async () => {
    const mockInterrupt = jest.fn();
    (useHeygenAvatar as jest.Mock).mockReturnValue({
      isInitialized: true,
      isLoading: false,
      isTalking: true,
      error: null,
      initialize: jest.fn(),
      startSession: jest.fn(),
      speak: jest.fn(),
      interrupt: mockInterrupt,
      stopSession: jest.fn(),
    });

    const { getByText } = render(
      <StreamingAvatar avatarId="test-id" onError={mockOnError} />
    );

    const stopButton = getByText('Stop');
    await fireEvent.click(stopButton);

    expect(mockInterrupt).toHaveBeenCalled();
  });

  it('cleans up on unmount', () => {
    const mockStopSession = jest.fn();
    (useHeygenAvatar as jest.Mock).mockReturnValue({
      isInitialized: true,
      isLoading: false,
      isTalking: false,
      error: null,
      initialize: jest.fn(),
      startSession: jest.fn(),
      speak: jest.fn(),
      interrupt: jest.fn(),
      stopSession: mockStopSession,
    });

    const { unmount } = render(
      <StreamingAvatar avatarId="test-id" onError={mockOnError} />
    );

    unmount();
    expect(mockStopSession).toHaveBeenCalled();
  });

  it('handles video element setup', () => {
    // Mock video element
    const mockVideoElement = document.createElement('video');
    const mockPlay = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(mockVideoElement, 'play', {
      value: mockPlay,
      writable: true,
    });

    // Mock useRef to return our mock video element
    jest.spyOn(React, 'useRef').mockReturnValue({ current: mockVideoElement });

    let onStreamReadyCallback: ((stream: MediaStream) => void) | undefined;
    (useHeygenAvatar as jest.Mock).mockImplementation((callbacks) => {
      onStreamReadyCallback = callbacks.onStreamReady;
      return {
        isInitialized: true,
        isLoading: false,
        isTalking: false,
        error: null,
        initialize: jest.fn(),
        startSession: jest.fn(),
        speak: jest.fn(),
        interrupt: jest.fn(),
        stopSession: jest.fn(),
      };
    });

    render(<StreamingAvatar avatarId="test-id" onError={mockOnError} />);

    if (onStreamReadyCallback) {
      onStreamReadyCallback(mockStream);
      expect(mockPlay).toHaveBeenCalled();
    }
  });

  it('disables controls while talking', () => {
    (useHeygenAvatar as jest.Mock).mockReturnValue({
      isInitialized: true,
      isLoading: false,
      isTalking: true,
      error: null,
      initialize: jest.fn(),
      startSession: jest.fn(),
      speak: jest.fn(),
      interrupt: jest.fn(),
      stopSession: jest.fn(),
    });

    const { getByPlaceholderText, getByText } = render(
      <StreamingAvatar avatarId="test-id" onError={mockOnError} />
    );

    const input = getByPlaceholderText(/type something/i);
    const speakButton = getByText('Speak');

    expect(input).toBeDisabled();
    expect(speakButton).toBeDisabled();
  });
});
