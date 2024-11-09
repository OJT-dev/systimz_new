'use client';

import React, { useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { cn } from '@/lib/utils';
import { hideToast, type ToastType } from '@/store/slices/uiSlice';

/**
 * Mapping of toast types to their respective styles
 */
const toastStyles: Record<ToastType, string> = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  warning: 'bg-yellow-500',
};

/**
 * Toast animation classes
 */
const animationClasses = {
  enter: 'animate-enter',
  exit: 'animate-exit',
  base: 'transform transition-all duration-300 ease-in-out',
};

/**
 * Toast Component
 * 
 * Displays toast notifications with different styles based on type.
 * Supports auto-dismiss and manual dismissal.
 * Includes proper accessibility attributes and keyboard handling.
 * 
 * @example
 * ```tsx
 * // Success toast with default duration (5000ms)
 * dispatch(showToast({ message: "Operation successful", type: "success" }));
 * 
 * // Error toast with custom duration and non-dismissible
 * dispatch(showToast({
 *   message: "Error occurred",
 *   type: "error",
 *   duration: 10000,
 *   dismissible: false
 * }));
 * ```
 */
export function Toast() {
  const dispatch = useAppDispatch();
  const toast = useAppSelector((state) => state.ui.toast);

  const handleDismiss = useCallback(() => {
    dispatch(hideToast());
  }, [dispatch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleDismiss();
    }
  }, [handleDismiss]);

  useEffect(() => {
    if (toast?.duration) {
      const timer = setTimeout(handleDismiss, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast, handleDismiss]);

  if (!toast) return null;

  const { message, type = 'info', dismissible = true } = toast;

  return (
    <div
      role="alert"
      aria-live="polite"
      tabIndex={0}
      onKeyDown={dismissible ? handleKeyDown : undefined}
      className={cn(
        'fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white shadow-lg',
        animationClasses.base,
        animationClasses.enter,
        toastStyles[type]
      )}
    >
      <div className="flex items-center gap-2">
        <span>{message}</span>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="ml-2 text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20 rounded"
            aria-label="Dismiss notification"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
