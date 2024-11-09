import { useState, useEffect, useCallback, useRef } from 'react';
import { heygenService } from '@/services/heygen/HeyGenService';
import {
  AvatarQuality,
  StartAvatarConfig,
  StreamingEvents,
  TaskType,
  VoiceEmotion,
  VoiceSetting
} from '@/services/heygen/types';

interface UseHeygenAvatarProps {
  onStreamReady?: (stream: MediaStream) => void;
  onTalkingStart?: () => void;
  onTalkingEnd?: () => void;
  onError?: (error: any) => void;
}

export function useHeygenAvatar({
  onStreamReady,
  onTalkingStart,
  onTalkingEnd,
  onError
}: UseHeygenAvatarProps = {}) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isTalking, setIsTalking] = useState(false);

  // Keep track of event handlers to properly remove them
  const eventHandlersRef = useRef<{
    streamReady: (event: any) => void;
    talkingStart: () => void;
    talkingEnd: () => void;
    disconnected: () => void;
  }>();

  // Initialize the avatar service with a token
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch token from our secure endpoint
      const response = await fetch('/api/heygen/token', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to get access token');
      }

      const { token } = await response.json();
      await heygenService.initialize(token);
      setIsInitialized(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize avatar');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  // Start a streaming session
  const startSession = useCallback(async (config: Partial<StartAvatarConfig> = {}) => {
    if (!isInitialized) {
      throw new Error('Avatar service not initialized');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Create default voice settings if not provided
      const defaultVoice: VoiceSetting = {
        voiceId: '2d5b0e6cf36f460aa7fc47e3eee4ba54',
        rate: 1,
        emotion: VoiceEmotion.FRIENDLY
      };

      const voice: VoiceSetting = config.voice ? {
        ...defaultVoice,
        ...config.voice
      } : defaultVoice;

      const sessionConfig: StartAvatarConfig = {
        avatarName: config.avatarName || 'default',
        quality: config.quality || AvatarQuality.High,
        voice,
        knowledgeId: config.knowledgeId,
        knowledgeBase: config.knowledgeBase,
        language: config.language
      };

      await heygenService.startSession(sessionConfig);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start session');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, onError]);

  // Send text for the avatar to speak
  const speak = useCallback(async (text: string, taskType: TaskType = TaskType.REPEAT) => {
    if (!isInitialized) {
      throw new Error('Avatar service not initialized');
    }

    try {
      await heygenService.speak({ text, task_type: taskType });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to speak');
      setError(error);
      onError?.(error);
      throw error;
    }
  }, [isInitialized, onError]);

  // Interrupt current speech
  const interrupt = useCallback(async () => {
    if (!isInitialized) {
      throw new Error('Avatar service not initialized');
    }

    try {
      await heygenService.interrupt();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to interrupt');
      setError(error);
      onError?.(error);
      throw error;
    }
  }, [isInitialized, onError]);

  // Stop the avatar session
  const stopSession = useCallback(async () => {
    if (!isInitialized) {
      return;
    }

    try {
      await heygenService.stopAvatar();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to stop session');
      setError(error);
      onError?.(error);
      throw error;
    }
  }, [isInitialized, onError]);

  // Set up event listeners
  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    const handlers = {
      streamReady: (event: any) => {
        if (event.detail) {
          onStreamReady?.(event.detail);
        }
      },
      talkingStart: () => {
        setIsTalking(true);
        onTalkingStart?.();
      },
      talkingEnd: () => {
        setIsTalking(false);
        onTalkingEnd?.();
      },
      disconnected: () => {
        setIsInitialized(false);
        setError(new Error('Stream disconnected'));
      }
    };

    eventHandlersRef.current = handlers;

    heygenService.on(StreamingEvents.STREAM_READY, handlers.streamReady);
    heygenService.on(StreamingEvents.AVATAR_START_TALKING, handlers.talkingStart);
    heygenService.on(StreamingEvents.AVATAR_STOP_TALKING, handlers.talkingEnd);
    heygenService.on(StreamingEvents.STREAM_DISCONNECTED, handlers.disconnected);

    return () => {
      if (eventHandlersRef.current) {
        heygenService.off(StreamingEvents.STREAM_READY, handlers.streamReady);
        heygenService.off(StreamingEvents.AVATAR_START_TALKING, handlers.talkingStart);
        heygenService.off(StreamingEvents.AVATAR_STOP_TALKING, handlers.talkingEnd);
        heygenService.off(StreamingEvents.STREAM_DISCONNECTED, handlers.disconnected);
      }
    };
  }, [isInitialized, onStreamReady, onTalkingStart, onTalkingEnd]);

  return {
    isInitialized,
    isLoading,
    error,
    isTalking,
    initialize,
    startSession,
    speak,
    interrupt,
    stopSession
  };
}
