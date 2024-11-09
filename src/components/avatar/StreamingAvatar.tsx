'use client';

import { useEffect, useRef, useState } from 'react';
import { useHeygenAvatar } from '@/hooks/useHeygenAvatar';
import { AvatarQuality, TaskType, VoiceEmotion } from '@/services/heygen/types';

interface StreamingAvatarProps {
  avatarId?: string;
  voiceId?: string;
  quality?: AvatarQuality;
  language?: string;
  className?: string;
  onError?: (error: Error) => void;
}

interface StreamCallbacks {
  onStreamReady: (stream: MediaStream) => void;
  onError?: (error: Error) => void;
}

export function StreamingAvatar({
  avatarId = 'default',
  voiceId = '2d5b0e6cf36f460aa7fc47e3eee4ba54',
  quality = AvatarQuality.High,
  language = 'en',
  className = '',
  onError
}: StreamingAvatarProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inputText, setInputText] = useState('');
  const [isReady, setIsReady] = useState(false);

  const {
    isInitialized,
    isLoading,
    isTalking,
    error,
    initialize,
    startSession,
    speak,
    interrupt,
    stopSession
  } = useHeygenAvatar({
    onStreamReady: (stream: MediaStream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(console.error);
        setIsReady(true);
      }
    },
    onError
  } as StreamCallbacks);

  // Initialize avatar service when component mounts
  useEffect(() => {
    initialize();
    return () => {
      stopSession();
    };
  }, [initialize, stopSession]);

  // Start session when initialized
  useEffect(() => {
    if (isInitialized && !isReady) {
      startSession({
        avatarName: avatarId,
        quality,
        voice: {
          voiceId,
          rate: 1,
          emotion: VoiceEmotion.FRIENDLY
        },
        language
      });
    }
  }, [isInitialized, isReady, avatarId, voiceId, quality, language, startSession]);

  // Handle text input submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !isReady || isTalking) return;

    try {
      await speak(inputText.trim(), TaskType.REPEAT);
      setInputText('');
    } catch (err) {
      console.error('Failed to send text:', err);
    }
  };

  // Handle interruption
  const handleInterrupt = async () => {
    if (isTalking) {
      await interrupt();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Video Display */}
      <div className={`relative rounded-lg overflow-hidden bg-black ${className}`}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white" />
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-red-500 text-center p-4">
              {error.message}
            </div>
          </div>
        )}

        {/* Talking Indicator */}
        {isTalking && (
          <div className="absolute top-2 right-2">
            <div className="animate-pulse w-3 h-3 rounded-full bg-green-500" />
          </div>
        )}
      </div>

      {/* Controls */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type something for the avatar to say..."
          disabled={!isReady || isTalking}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!isReady || isTalking || !inputText.trim()}
          className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Speak
        </button>
        {isTalking && (
          <button
            type="button"
            onClick={handleInterrupt}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Stop
          </button>
        )}
      </form>
    </div>
  );
}
