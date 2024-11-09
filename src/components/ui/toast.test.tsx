import React from 'react';
import { render } from '@/tests/utils';
import { Toast } from './toast';
import { showToast, hideToast } from '@/store/slices/uiSlice';
import type { ToastType } from '@/store/slices/uiSlice';

describe('Toast', () => {
  const mockToast = {
    message: 'Test message',
    type: 'info' as ToastType,
    duration: 5000,
    dismissible: true,
  };

  it('renders nothing when no toast is present', () => {
    const { container } = render(<Toast />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders toast with correct message and style', () => {
    const { getByText, getByRole } = render(<Toast />, {
      initialState: {
        ui: { toast: mockToast },
      },
    });

    const toastElement = getByRole('alert');
    const messageElement = getByText('Test message');

    expect(toastElement).toBeInTheDocument();
    expect(messageElement).toBeInTheDocument();
    expect(toastElement).toHaveClass('bg-blue-500'); // info style
  });

  it('applies correct styles for different toast types', () => {
    const types: ToastType[] = ['success', 'error', 'warning', 'info'];
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500',
    };

    types.forEach((type) => {
      const { getByRole } = render(<Toast />, {
        initialState: {
          ui: { toast: { ...mockToast, type } },
        },
      });

      expect(getByRole('alert')).toHaveClass(colors[type]);
    });
  });

  it('shows dismiss button when dismissible is true', () => {
    const { getByRole } = render(<Toast />, {
      initialState: {
        ui: { toast: mockToast },
      },
    });

    const dismissButton = getByRole('button', { name: /dismiss notification/i });
    expect(dismissButton).toBeInTheDocument();
  });

  it('hides dismiss button when dismissible is false', () => {
    const { queryByRole } = render(<Toast />, {
      initialState: {
        ui: { toast: { ...mockToast, dismissible: false } },
      },
    });

    const dismissButton = queryByRole('button', { name: /dismiss notification/i });
    expect(dismissButton).not.toBeInTheDocument();
  });

  it('calls hideToast when dismiss button is clicked', async () => {
    const { getByRole, store, user } = render(<Toast />, {
      initialState: {
        ui: { toast: mockToast },
      },
    });

    const dismissButton = getByRole('button', { name: /dismiss notification/i });
    await user.click(dismissButton);

    const actions = store.getActions();
    expect(actions).toContainEqual(hideToast());
  });

  it('calls hideToast when Escape key is pressed', async () => {
    const { getByRole, store, user } = render(<Toast />, {
      initialState: {
        ui: { toast: mockToast },
      },
    });

    const toastElement = getByRole('alert');
    toastElement.focus();
    await user.keyboard('{Escape}');

    const actions = store.getActions();
    expect(actions).toContainEqual(hideToast());
  });

  it('auto-dismisses after duration', () => {
    jest.useFakeTimers();

    const { store } = render(<Toast />, {
      initialState: {
        ui: { toast: { ...mockToast, duration: 2000 } },
      },
    });

    jest.advanceTimersByTime(2000);

    const actions = store.getActions();
    expect(actions).toContainEqual(hideToast());

    jest.useRealTimers();
  });

  it('has proper accessibility attributes', () => {
    const { getByRole } = render(<Toast />, {
      initialState: {
        ui: { toast: mockToast },
      },
    });

    const toastElement = getByRole('alert');
    expect(toastElement).toHaveAttribute('aria-live', 'polite');
    expect(toastElement).toHaveAttribute('tabIndex', '0');
  });

  it('applies animation classes', () => {
    const { getByRole } = render(<Toast />, {
      initialState: {
        ui: { toast: mockToast },
      },
    });

    const toastElement = getByRole('alert');
    expect(toastElement).toHaveClass('transform', 'transition-all', 'animate-enter');
  });

  it('handles multiple rapid toast updates correctly', () => {
    const { store, rerender } = render(<Toast />, {
      initialState: {
        ui: { toast: mockToast },
      },
    });

    // Dispatch multiple toast updates
    store.dispatch(showToast({ ...mockToast, message: 'Message 1' }));
    store.dispatch(showToast({ ...mockToast, message: 'Message 2' }));
    store.dispatch(showToast({ ...mockToast, message: 'Message 3' }));

    rerender(<Toast />);

    // Should show the latest message
    const state = store.getState() as { ui: { toast: { message: string } } };
    expect(state.ui.toast?.message).toBe('Message 3');
  });
});
