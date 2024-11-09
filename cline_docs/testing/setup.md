# Test Setup Guide

## Environment Configuration

### Prerequisites
- Node.js 18+ and npm
- Jest as the test runner
- React Testing Library for component testing
- MSW (Mock Service Worker) for API mocking
- Prisma Client for database interactions

### Test Environment Setup

1. **Jest Configuration**
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/tests/**/*',
  ],
};
```

2. **Test Setup File**
```typescript
// src/tests/setup.ts
import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Enable API mocking
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Suppress console errors during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
```

### Mock Implementations

1. **API Mocking with MSW**
```typescript
// src/tests/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        user: {
          id: 'test-user',
          name: 'Test User',
          email: 'test@example.com',
        },
      })
    );
  }),
  // Add more handlers as needed
];

// src/tests/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

2. **Redux Store Mocking**
```typescript
// src/tests/utils/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from '@/store';

export const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
};
```

### Test Utilities

1. **Custom Render Function**
```typescript
// src/tests/utils/render.tsx
import { render as rtlRender } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createTestStore } from './store';

export function render(
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }

  return {
    store,
    ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}
```

2. **Test Helpers**
```typescript
// src/tests/utils/helpers.ts
export const mockSession = {
  user: {
    id: 'test-user',
    name: 'Test User',
    email: 'test@example.com',
  },
};

export const mockAvatar = {
  id: 'test-avatar',
  name: 'Test Avatar',
  description: 'Test Description',
  userId: 'test-user',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockMessage = {
  id: 'test-message',
  content: 'Test Message',
  type: 'user',
  userId: 'test-user',
  metadata: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

## Best Practices

1. **Test Organization**
   - Group related tests using `describe` blocks
   - Use clear, descriptive test names
   - Follow the Arrange-Act-Assert pattern
   - Keep tests focused and isolated

2. **Mocking Guidelines**
   - Mock external dependencies
   - Use MSW for API mocking
   - Mock only what's necessary
   - Avoid implementation details in mocks

3. **Testing Patterns**
   - Test user interactions
   - Test error states
   - Test loading states
   - Test edge cases
   - Test accessibility

4. **Code Coverage**
   - Aim for 80%+ coverage
   - Focus on critical paths
   - Don't chase 100% coverage
   - Use coverage reports to identify gaps

## Example Test Structure
```typescript
describe('Component/Feature Name', () => {
  beforeEach(() => {
    // Setup for each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  describe('Specific Functionality', () => {
    it('should handle successful case', () => {
      // Arrange
      const props = {};

      // Act
      const result = render(<Component {...props} />);

      // Assert
      expect(result).toBe(expected);
    });

    it('should handle error case', () => {
      // Test implementation
    });
  });
});
```

## Running Tests

1. **Single Run**
```bash
npm test
```

2. **Watch Mode**
```bash
npm test -- --watch
```

3. **Coverage Report**
```bash
npm test -- --coverage
```

## Debugging Tests

1. **Using Debug Mode**
```typescript
test('debugging example', () => {
  screen.debug(); // Print current DOM state
});
```

2. **Using Browser DevTools**
   - Add `debugger;` statement in test
   - Run tests with `node --inspect-brk`
   - Open Chrome DevTools

3. **Using VS Code**
   - Add configuration in launch.json
   - Set breakpoints
   - Use VS Code debugger

## Common Issues and Solutions

1. **Async Testing**
   - Use `async/await` with async operations
   - Use `waitFor` for state changes
   - Handle promises properly

2. **State Management**
   - Mock initial state when needed
   - Test state changes
   - Verify Redux actions/reducers

3. **Component Integration**
   - Mock child components when necessary
   - Test component interactions
   - Verify prop passing
