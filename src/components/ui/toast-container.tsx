'use client';

import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { Toast } from '@/components/ui/toast';

/**
 * Toast Container Component
 * 
 * Manages the positioning and animation of toast notifications.
 * Provides a consistent container for toast messages with proper
 * positioning and stacking context.
 * 
 * @example
 * ```tsx
 * // In your layout or app wrapper
 * <ToastContainer />
 * ```
 */
export function ToastContainer() {
  const toast = useAppSelector((state) => state.ui.toast);

  if (!toast) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none flex flex-col items-end justify-end p-4 gap-2"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="pointer-events-auto">
        <Toast />
      </div>
    </div>
  );
}

export default ToastContainer;
