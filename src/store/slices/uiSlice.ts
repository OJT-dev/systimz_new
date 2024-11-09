import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Available toast notification types
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Toast notification configuration
 */
export interface Toast {
  message: string;
  type: ToastType;
  duration?: number;
  dismissible?: boolean;
}

/**
 * UI state interface
 */
interface UiState {
  toast: Toast | null;
}

const initialState: UiState = {
  toast: null,
};

/**
 * UI slice for managing global UI state
 */
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showToast: (state, action: PayloadAction<Toast>) => {
      state.toast = {
        ...action.payload,
        duration: action.payload.duration ?? 5000,
        dismissible: action.payload.dismissible ?? true,
      };
    },
    hideToast: (state) => {
      state.toast = null;
    },
  },
});

export const { showToast, hideToast } = uiSlice.actions;
export default uiSlice.reducer;
