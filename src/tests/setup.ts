/// <reference types="jest" />

import '@testing-library/jest-dom';
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import uiReducer from '@/store/slices/uiSlice';
import messagesReducer from '@/store/slices/messageSlice';

/**
 * Mock Next.js Navigation
 */
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    set: jest.fn(),
  }),
  usePathname: () => '',
}));

/**
 * Mock Next.js Image Component
 */
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement('img', { ...props, alt: props.alt });
  },
}));

/**
 * WebRTC Mock Classes
 */

/**
 * Mock MediaStream with proper track management
 */
class MockMediaStream {
  private tracks: MediaStreamTrack[] = [];
  id: string = 'mock-stream-id';
  active: boolean = true;
  onaddtrack: ((this: MediaStream, ev: MediaStreamTrackEvent) => any) | null = null;
  onremovetrack: ((this: MediaStream, ev: MediaStreamTrackEvent) => any) | null = null;

  addTrack(track: MediaStreamTrack): void {
    this.tracks.push(track);
    if (this.onaddtrack) {
      this.onaddtrack.call(this, new MediaStreamTrackEvent('addtrack', { track }));
    }
  }

  removeTrack(track: MediaStreamTrack): void {
    this.tracks = this.tracks.filter(t => t !== track);
    if (this.onremovetrack) {
      this.onremovetrack.call(this, new MediaStreamTrackEvent('removetrack', { track }));
    }
  }

  getTracks(): MediaStreamTrack[] {
    return this.tracks;
  }

  getVideoTracks(): MediaStreamTrack[] {
    return this.tracks.filter(track => track.kind === 'video');
  }

  getAudioTracks(): MediaStreamTrack[] {
    return this.tracks.filter(track => track.kind === 'audio');
  }

  getTrackById(trackId: string): MediaStreamTrack | null {
    return this.tracks.find(track => track.id === trackId) || null;
  }

  clone(): MediaStream {
    const clonedStream = new MockMediaStream();
    this.tracks.forEach(track => clonedStream.addTrack(track.clone()));
    return clonedStream;
  }

  addEventListener(): void {}
  removeEventListener(): void {}
  dispatchEvent(): boolean { return true; }
}

/**
 * Mock RTCPeerConnection with event handling
 */
class MockRTCPeerConnection {
  onicecandidate: ((event: RTCPeerConnectionIceEvent) => void) | null = null;
  ontrack: ((event: RTCTrackEvent) => void) | null = null;
  oniceconnectionstatechange: (() => void) | null = null;
  onsignalingstatechange: (() => void) | null = null;
  ondatachannel: ((event: RTCDataChannelEvent) => void) | null = null;

  localDescription: RTCSessionDescription | null = null;
  remoteDescription: RTCSessionDescription | null = null;
  iceConnectionState: RTCIceConnectionState = 'new';
  signalingState: RTCSignalingState = 'stable';

  private senders: RTCRtpSender[] = [];
  private receivers: RTCRtpReceiver[] = [];

  async createOffer(options?: RTCOfferOptions): Promise<RTCSessionDescriptionInit> {
    return { type: 'offer', sdp: 'mock-sdp' };
  }

  async createAnswer(options?: RTCAnswerOptions): Promise<RTCSessionDescriptionInit> {
    return { type: 'answer', sdp: 'mock-sdp' };
  }

  async setLocalDescription(desc: RTCSessionDescriptionInit): Promise<void> {
    this.localDescription = desc as RTCSessionDescription;
  }

  async setRemoteDescription(desc: RTCSessionDescriptionInit): Promise<void> {
    this.remoteDescription = desc as RTCSessionDescription;
  }

  addTrack(track: MediaStreamTrack, ...streams: MediaStream[]): RTCRtpSender {
    const sender = {
      track,
      streams,
      getParameters: () => ({ encodings: [], transactionId: '' }),
      setParameters: async () => ({ encodings: [], transactionId: '' }),
      replaceTrack: async () => {},
      getStats: async () => new Map(),
    } as unknown as RTCRtpSender;
    
    this.senders.push(sender);
    return sender;
  }

  removeTrack(sender: RTCRtpSender): void {
    this.senders = this.senders.filter(s => s !== sender);
  }

  close(): void {
    this.iceConnectionState = 'closed';
    this.signalingState = 'closed';
    if (this.oniceconnectionstatechange) {
      this.oniceconnectionstatechange();
    }
    if (this.onsignalingstatechange) {
      this.onsignalingstatechange();
    }
  }

  getReceivers(): RTCRtpReceiver[] {
    return this.receivers;
  }

  getSenders(): RTCRtpSender[] {
    return this.senders;
  }
}

/**
 * Mock Observer Classes
 */

/**
 * Mock ResizeObserver with callback handling
 */
class MockResizeObserver implements ResizeObserver {
  private callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element): void {
    // Simulate initial size observation
    const entry = [{
      target,
      contentRect: target.getBoundingClientRect(),
      borderBoxSize: [],
      contentBoxSize: [],
      devicePixelContentBoxSize: []
    }] as ResizeObserverEntry[];
    
    this.callback(entry, this);
  }

  unobserve(): void {}
  disconnect(): void {}
}

/**
 * Mock IntersectionObserver with callback handling
 */
class MockIntersectionObserver implements IntersectionObserver {
  private callback: IntersectionObserverCallback;
  readonly root: Element | null = null;
  readonly rootMargin: string = '0px';
  readonly thresholds: ReadonlyArray<number> = [0];

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element): void {
    // Simulate intersection
    const entry = [{
      target,
      boundingClientRect: target.getBoundingClientRect(),
      intersectionRatio: 1,
      intersectionRect: target.getBoundingClientRect(),
      isIntersecting: true,
      rootBounds: null,
      time: Date.now()
    }] as IntersectionObserverEntry[];
    
    this.callback(entry, this);
  }

  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
}

/**
 * Global Mocks
 */
Object.defineProperty(global, 'MediaStream', {
  writable: true,
  value: MockMediaStream,
});

Object.defineProperty(global, 'RTCPeerConnection', {
  writable: true,
  value: MockRTCPeerConnection,
});

Object.defineProperty(global, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

/**
 * Redux Store Mock Provider
 */
const rootReducer = combineReducers({
  ui: uiReducer,
  messages: messagesReducer,
});

export const createMockStore = (initialState: Partial<RootState> = {}) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState: initialState as RootState,
  });
};

/**
 * Helper to wrap components with Redux Provider for testing
 */
export const withReduxProvider = (
  component: React.ReactElement,
  store = createMockStore()
): React.ReactElement => {
  return React.createElement(Provider, { store, children: component });
};

/**
 * Test Cleanup
 */
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  jest.restoreAllMocks();

  // Clean up any remaining event listeners
  document.body.innerHTML = '';

  // Reset WebRTC state
  const rtcPc = new MockRTCPeerConnection();
  rtcPc.close();
});
