import StreamingAvatar from '@heygen/streaming-avatar';

/**
 * Quality settings for avatar streaming
 */
export enum AvatarQuality {
  High = 'high',
  Medium = 'medium',
  Low = 'low'
}

/**
 * Voice emotion settings
 */
export enum VoiceEmotion {
  EXCITED = 'excited',
  SERIOUS = 'serious',
  FRIENDLY = 'friendly',
  SOOTHING = 'soothing',
  BROADCASTER = 'broadcaster'
}

/**
 * Task types for avatar interactions
 */
export enum TaskType {
  TALK = 'talk',
  REPEAT = 'repeat'
}

/**
 * Voice settings configuration
 */
export interface VoiceSetting {
  voiceId: string;
  rate?: number; // 0.5 ~ 1.5
  emotion?: VoiceEmotion;
}

/**
 * Configuration for starting an avatar session
 */
export interface StartAvatarConfig {
  avatarName: string;
  quality?: AvatarQuality;
  voice?: VoiceSetting;
  knowledgeId?: string;
  knowledgeBase?: string;
  language?: string;
}

/**
 * WebRTC Session Description Protocol
 */
export interface SDPData {
  type: 'offer' | 'answer' | 'pranswer' | 'rollback';
  sdp: string;
}

/**
 * ICE Server Configuration
 */
export interface ICEServer {
  urls: string | string[];
  username?: string;
  credential?: string;
  credentialType?: 'password' | 'oauth' | 'token';
}

/**
 * Response from starting an avatar session
 */
export interface StartAvatarResponse {
  session_id: string;
  sdp: SDPData;
  access_token: string;
  url: string;
  ice_servers: ICEServer[];
  ice_servers2: ICEServer[];
  is_paid: boolean;
  session_duration_limit: number;
}

/**
 * Request for avatar to speak
 */
export interface SpeakRequest {
  text: string;
  task_type?: TaskType;
}

/**
 * Base event interface for all streaming events
 */
export interface BaseStreamEvent {
  timestamp: number;
  type: StreamingEvents;
}

/**
 * Avatar talking event data
 */
export interface AvatarTalkingEvent extends BaseStreamEvent {
  type: StreamingEvents.AVATAR_START_TALKING | StreamingEvents.AVATAR_STOP_TALKING;
  duration?: number;
}

/**
 * Avatar message event data
 */
export interface AvatarMessageEvent extends BaseStreamEvent {
  type: StreamingEvents.AVATAR_TALKING_MESSAGE | StreamingEvents.AVATAR_END_MESSAGE;
  text: string;
  messageId: string;
}

/**
 * User talking event data
 */
export interface UserTalkingEvent extends BaseStreamEvent {
  type: StreamingEvents.USER_START | StreamingEvents.USER_STOP | StreamingEvents.USER_SILENCE;
  duration?: number;
}

/**
 * User message event data
 */
export interface UserMessageEvent extends BaseStreamEvent {
  type: StreamingEvents.USER_TALKING_MESSAGE | StreamingEvents.USER_END_MESSAGE;
  text: string;
  messageId: string;
}

/**
 * Stream status event data
 */
export interface StreamStatusEvent extends BaseStreamEvent {
  type: StreamingEvents.STREAM_READY | StreamingEvents.STREAM_DISCONNECTED;
  reason?: string;
}

/**
 * Union type of all possible event types
 */
export type StreamingEventData = 
  | AvatarTalkingEvent
  | AvatarMessageEvent
  | UserTalkingEvent
  | UserMessageEvent
  | StreamStatusEvent;

/**
 * Event handler type for streaming events
 */
export type EventHandler = (event: StreamingEventData) => void;

/**
 * Streaming events emitted by the avatar
 */
export enum StreamingEvents {
  AVATAR_START_TALKING = 'avatar_start_talking',
  AVATAR_STOP_TALKING = 'avatar_stop_talking',
  AVATAR_TALKING_MESSAGE = 'avatar_talking_message',
  AVATAR_END_MESSAGE = 'avatar_end_message',
  USER_TALKING_MESSAGE = 'user_talking_message',
  USER_END_MESSAGE = 'user_end_message',
  USER_START = 'user_start',
  USER_STOP = 'user_stop',
  USER_SILENCE = 'user_silence',
  STREAM_READY = 'stream_ready',
  STREAM_DISCONNECTED = 'stream_disconnected'
}

/**
 * Service interface for managing avatar streaming
 */
export interface AvatarStreamingService {
  avatar: StreamingAvatar | null;
  sessionData: StartAvatarResponse | null;
  
  initialize(token: string): Promise<void>;
  startSession(config: StartAvatarConfig): Promise<StartAvatarResponse>;
  speak(request: SpeakRequest): Promise<void>;
  startVoiceChat(useSilencePrompt?: boolean): Promise<void>;
  closeVoiceChat(): Promise<void>;
  interrupt(): Promise<void>;
  stopAvatar(): Promise<void>;
  on(event: StreamingEvents, handler: EventHandler): void;
  off(event: StreamingEvents, handler: EventHandler): void;
}
