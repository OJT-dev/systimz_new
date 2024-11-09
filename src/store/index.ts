import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import avatarReducer from './slices/avatarSlice';
import uiReducer from './slices/uiSlice';
import messageReducer from './slices/messageSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    avatar: avatarReducer,
    ui: uiReducer,
    messages: messageReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
