# Component Testing Guide

## Overview
This guide provides practical examples and best practices for testing React components using React Testing Library and Jest.

## Table of Contents
1. UI Components
2. Form Components
3. State Management
4. Event Handling
5. Async Operations
6. Integration Testing

## 1. UI Components

### Button Component Example
```typescript
// src/components/ui/button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant styles correctly', () => {
    render(<Button variant="primary">Primary Button</Button>);
    const button = screen.getByText('Primary Button');
    expect(button).toHaveClass('bg-primary');
  });

  it('can be disabled', () => {
    render(<Button disabled>Disabled Button</Button>);
    expect(screen.getByText('Disabled Button')).toBeDisabled();
  });
});
```

### Toast Component Example
```typescript
// src/components/ui/toast.test.tsx
import { render, screen, act } from '@testing-library/react';
import { Toast } from './toast';
import { useToast } from '@/hooks/useToast';

jest.mock('@/hooks/useToast');

describe('Toast Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays toast message', () => {
    render(
      <Toast
        message="Success!"
        type="success"
        isVisible={true}
        onClose={() => {}}
      />
    );
    
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });

  it('auto-dismisses after timeout', () => {
    jest.useFakeTimers();
    const onClose = jest.fn();
    
    render(
      <Toast
        message="Auto dismiss"
        type="info"
        isVisible={true}
        onClose={onClose}
      />
    );

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(onClose).toHaveBeenCalled();
    jest.useRealTimers();
  });
});
```

## 2. Form Components

### Input Area Example
```typescript
// src/components/chat/InputArea.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { InputArea } from './InputArea';

describe('InputArea Component', () => {
  it('handles user input', () => {
    const handleSubmit = jest.fn();
    render(<InputArea onSubmit={handleSubmit} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Hello' } });
    
    expect(input).toHaveValue('Hello');
  });

  it('submits form on enter', () => {
    const handleSubmit = jest.fn();
    render(<InputArea onSubmit={handleSubmit} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 13, charCode: 13 });
    
    expect(handleSubmit).toHaveBeenCalledWith('Hello');
    expect(input).toHaveValue('');
  });

  it('prevents empty submissions', () => {
    const handleSubmit = jest.fn();
    render(<InputArea onSubmit={handleSubmit} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.keyPress(input, { key: 'Enter', code: 13, charCode: 13 });
    
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
```

## 3. State Management

### Redux Connected Component Example
```typescript
// src/components/chat/MessageList.test.tsx
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MessageList } from './MessageList';
import { messageReducer } from '@/store/slices/messageSlice';

describe('MessageList Component', () => {
  const createTestStore = (initialState = {}) => {
    return configureStore({
      reducer: {
        messages: messageReducer,
      },
      preloadedState: initialState,
    });
  };

  it('renders messages from store', () => {
    const store = createTestStore({
      messages: {
        items: [
          {
            id: '1',
            content: 'Test message',
            type: 'user',
            createdAt: new Date().toISOString(),
          },
        ],
      },
    });

    render(
      <Provider store={store}>
        <MessageList />
      </Provider>
    );

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    const store = createTestStore({
      messages: {
        loading: true,
        items: [],
      },
    });

    render(
      <Provider store={store}>
        <MessageList />
      </Provider>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

## 4. Event Handling

### Avatar Studio Example
```typescript
// src/components/avatar/AvatarStudio.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AvatarStudio } from './AvatarStudio';

describe('AvatarStudio Component', () => {
  const mockHandleSave = jest.fn();
  const mockHandleCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles configuration changes', () => {
    render(
      <AvatarStudio
        onSave={mockHandleSave}
        onCancel={mockHandleCancel}
      />
    );

    // Change avatar name
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'New Avatar' },
    });

    // Save changes
    fireEvent.click(screen.getByText('Save'));

    expect(mockHandleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New Avatar',
      })
    );
  });

  it('validates required fields', () => {
    render(
      <AvatarStudio
        onSave={mockHandleSave}
        onCancel={mockHandleCancel}
      />
    );

    // Try to save without name
    fireEvent.click(screen.getByText('Save'));

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(mockHandleSave).not.toHaveBeenCalled();
  });
});
```

## 5. Async Operations

### WebSocket Component Example
```typescript
// src/components/chat/ChatInterface.test.tsx
import { render, screen, act } from '@testing-library/react';
import { ChatInterface } from './ChatInterface';
import { WebSocketService } from '@/services/chat/WebSocketService';

jest.mock('@/services/chat/WebSocketService');

describe('ChatInterface Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('connects to WebSocket on mount', () => {
    render(<ChatInterface />);
    expect(WebSocketService.connect).toHaveBeenCalled();
  });

  it('handles incoming messages', async () => {
    render(<ChatInterface />);

    await act(async () => {
      // Simulate incoming message
      WebSocketService.emit('message', {
        id: '1',
        content: 'New message',
        type: 'user',
      });
    });

    expect(screen.getByText('New message')).toBeInTheDocument();
  });

  it('handles connection errors', async () => {
    (WebSocketService.connect as jest.Mock).mockRejectedValue(
      new Error('Connection failed')
    );

    render(<ChatInterface />);

    expect(await screen.findByText('Connection failed')).toBeInTheDocument();
  });
});
```

## 6. Integration Testing

### Authentication Flow Example
```typescript
// src/tests/integration/auth-flow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createTestStore } from '../utils/store';
import { App } from '@/App';

describe('Authentication Flow', () => {
  it('completes login flow successfully', async () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    // Navigate to login
    fireEvent.click(screen.getByText('Login'));

    // Fill login form
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });

    // Submit form
    fireEvent.click(screen.getByText('Sign In'));

    // Verify successful login
    await waitFor(() => {
      expect(screen.getByText('Welcome back')).toBeInTheDocument();
    });

    // Verify navigation to dashboard
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
```

## Best Practices

1. **Component Testing**
   - Test behavior, not implementation
   - Use semantic queries (getByRole, getByLabelText)
   - Test accessibility features
   - Test error states and edge cases

2. **Test Organization**
   - Group related tests with describe blocks
   - Use clear, descriptive test names
   - Keep tests focused and isolated
   - Follow the Arrange-Act-Assert pattern

3. **Mocking**
   - Mock external dependencies
   - Use MSW for API calls
   - Mock complex child components
   - Keep mocks simple and focused

4. **Async Testing**
   - Use async/await for asynchronous operations
   - Use waitFor for state changes
   - Handle promises properly
   - Test loading and error states

5. **State Management**
   - Test initial state
   - Test state changes
   - Verify Redux actions/reducers
   - Test side effects

6. **Integration Testing**
   - Test common user flows
   - Test component interactions
   - Test routing behavior
   - Test error boundaries
