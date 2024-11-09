import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import type { RootState } from '@/store';
import type { WebSocket } from 'ws';

/**
 * Configure mock store with middleware
 */
const mockStore = configureStore<
  Partial<RootState>,
  ThunkDispatch<RootState, undefined, AnyAction>
>([]);

/**
 * Custom render function that includes Redux Provider
 */
export const render = (
  ui: React.ReactElement,
  {
    initialState = {},
    store = mockStore(initialState),
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  return {
    store,
    user: userEvent.setup(),
    ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

/**
 * Create a mock WebSocket instance for testing
 */
export const createMockWebSocket = (): jest.Mocked<WebSocket> => {
  const ws = {
    on: jest.fn(),
    send: jest.fn(),
    close: jest.fn(),
    terminate: jest.fn(),
    ping: jest.fn(),
    pong: jest.fn(),
    // Add other WebSocket properties as needed
    readyState: 1,
    protocol: '',
    url: '',
    bufferedAmount: 0,
    extensions: '',
    binaryType: 'blob' as const,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(() => true),
  };

  return ws as unknown as jest.Mocked<WebSocket>;
};

/**
 * Mock data generators
 */

/**
 * Generate a mock message
 */
export const createMockMessage = (overrides = {}) => ({
  id: 'msg-' + Math.random().toString(36).substr(2, 9),
  content: 'Test message',
  type: 'user' as const,
  userId: 'user-1',
  metadata: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Generate a mock toast
 */
export const createMockToast = (overrides = {}) => ({
  message: 'Test toast',
  type: 'info' as const,
  duration: 5000,
  dismissible: true,
  ...overrides,
});

/**
 * Generate a mock user
 */
export const createMockUser = (overrides = {}) => ({
  id: 'user-' + Math.random().toString(36).substr(2, 9),
  name: 'Test User',
  email: 'test@example.com',
  image: null,
  ...overrides,
});

/**
 * Generate a mock avatar
 */
export const createMockAvatar = (overrides = {}) => ({
  id: 'avatar-' + Math.random().toString(36).substr(2, 9),
  name: 'Test Avatar',
  userId: 'user-1',
  voiceId: 'voice-1',
  quality: 'high',
  language: 'en',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Test helper functions
 */

/**
 * Wait for a condition to be true
 */
export const waitForCondition = (
  condition: () => boolean | Promise<boolean>,
  timeout = 5000
) => {
  const start = Date.now();
  return new Promise<void>((resolve, reject) => {
    const check = async () => {
      try {
        if (await condition()) {
          resolve();
        } else if (Date.now() - start > timeout) {
          reject(new Error('Condition not met within timeout'));
        } else {
          setTimeout(check, 100);
        }
      } catch (error) {
        reject(error);
      }
    };
    check();
  });
};

/**
 * Mock response helper
 */
export const mockResponse = (status: number, data: any) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  });
};

/**
 * Mock error response helper
 */
export const mockErrorResponse = (status: number, message: string) => {
  return Promise.reject({
    ok: false,
    status,
    json: () => Promise.resolve({ message }),
  });
};
