import StreamingAvatar from '@heygen/streaming-avatar';
import {
  AvatarStreamingService,
  StartAvatarConfig,
  StartAvatarResponse,
  SpeakRequest,
  StreamingEvents,
  EventHandler,
  StreamingEventData,
  AvatarMessageEvent,
  StreamStatusEvent
} from './types';

/**
 * Service implementation for HeyGen's streaming avatar SDK
 */
export class HeyGenService implements AvatarStreamingService {
  avatar: StreamingAvatar | null = null;
  sessionData: StartAvatarResponse | null = null;

  /**
   * Initialize the streaming avatar service with an API token
   */
  async initialize(token: string): Promise<void> {
    this.avatar = new StreamingAvatar({ token });
  }

  /**
   * Start a new avatar streaming session
   */
  async startSession(config: StartAvatarConfig): Promise<StartAvatarResponse> {
    if (!this.avatar) {
      throw new Error('Avatar service not initialized');
    }

    try {
      const sessionData = await this.avatar.createStartAvatar({
        avatarName: config.avatarName,
        quality: config.quality,
        voice: config.voice,
        knowledgeId: config.knowledgeId,
        knowledgeBase: config.knowledgeBase,
        language: config.language
      }) as StartAvatarResponse;

      this.sessionData = sessionData;
      return sessionData;
    } catch (error) {
      console.error('Failed to start avatar session:', error);
      throw new Error(error instanceof Error ? error.message : 'Unknown error starting avatar session');
    }
  }

  /**
   * Send a speak request to the avatar
   */
  async speak(request: SpeakRequest): Promise<void> {
    if (!this.avatar) {
      throw new Error('Avatar service not initialized');
    }

    try {
      await this.avatar.speak({
        text: request.text,
        task_type: request.task_type
      });
    } catch (error) {
      console.error('Failed to send speak request:', error);
      throw new Error(error instanceof Error ? error.message : 'Unknown error during speak request');
    }
  }

  /**
   * Start voice chat mode
   */
  async startVoiceChat(useSilencePrompt = false): Promise<void> {
    if (!this.avatar) {
      throw new Error('Avatar service not initialized');
    }

    try {
      await this.avatar.startVoiceChat({ useSilencePrompt });
    } catch (error) {
      console.error('Failed to start voice chat:', error);
      throw new Error(error instanceof Error ? error.message : 'Unknown error starting voice chat');
    }
  }

  /**
   * Close voice chat mode
   */
  async closeVoiceChat(): Promise<void> {
    if (!this.avatar) {
      throw new Error('Avatar service not initialized');
    }

    try {
      await this.avatar.closeVoiceChat();
    } catch (error) {
      console.error('Failed to close voice chat:', error);
      throw new Error(error instanceof Error ? error.message : 'Unknown error closing voice chat');
    }
  }

  /**
   * Interrupt current avatar speech
   */
  async interrupt(): Promise<void> {
    if (!this.avatar) {
      throw new Error('Avatar service not initialized');
    }

    try {
      await this.avatar.interrupt();
    } catch (error) {
      console.error('Failed to interrupt avatar:', error);
      throw new Error(error instanceof Error ? error.message : 'Unknown error interrupting avatar');
    }
  }

  /**
   * Stop the avatar session
   */
  async stopAvatar(): Promise<void> {
    if (!this.avatar) {
      throw new Error('Avatar service not initialized');
    }

    try {
      await this.avatar.stopAvatar();
      this.sessionData = null;
    } catch (error) {
      console.error('Failed to stop avatar:', error);
      throw new Error(error instanceof Error ? error.message : 'Unknown error stopping avatar');
    }
  }

  /**
   * Register an event handler
   */
  on(event: StreamingEvents, handler: EventHandler): void {
    if (!this.avatar) {
      throw new Error('Avatar service not initialized');
    }
    
    // Type-safe wrapper for event handling
    const wrappedHandler = (eventData: unknown) => {
      // Validate and type-cast the event data
      if (this.isValidEventData(eventData)) {
        handler(eventData);
      } else {
        console.error('Invalid event data received:', eventData);
      }
    };
    
    this.avatar.on(event, wrappedHandler);
  }

  /**
   * Unregister an event handler
   */
  off(event: StreamingEvents, handler: EventHandler): void {
    if (!this.avatar) {
      throw new Error('Avatar service not initialized');
    }
    this.avatar.off(event, handler);
  }

  /**
   * Type guard to validate event data
   */
  private isValidEventData(data: unknown): data is StreamingEventData {
    if (typeof data !== 'object' || data === null) {
      return false;
    }

    const event = data as Partial<StreamingEventData>;
    
    if (typeof event.timestamp !== 'number' || !event.type) {
      return false;
    }

    // Validate specific event types
    switch (event.type) {
      case StreamingEvents.AVATAR_START_TALKING:
      case StreamingEvents.AVATAR_STOP_TALKING:
      case StreamingEvents.USER_START:
      case StreamingEvents.USER_STOP:
      case StreamingEvents.USER_SILENCE:
        return typeof event.duration === 'undefined' || typeof event.duration === 'number';

      case StreamingEvents.AVATAR_TALKING_MESSAGE:
      case StreamingEvents.AVATAR_END_MESSAGE:
      case StreamingEvents.USER_TALKING_MESSAGE:
      case StreamingEvents.USER_END_MESSAGE:
        return typeof (event as AvatarMessageEvent).text === 'string' &&
               typeof (event as AvatarMessageEvent).messageId === 'string';

      case StreamingEvents.STREAM_READY:
      case StreamingEvents.STREAM_DISCONNECTED:
        return typeof (event as StreamStatusEvent).reason === 'undefined' ||
               typeof (event as StreamStatusEvent).reason === 'string';

      default:
        return false;
    }
  }
}

// Export a singleton instance
export const heygenService = new HeyGenService();
