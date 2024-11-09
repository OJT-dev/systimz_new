import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Message } from '@/types/chat';

interface MessagesState {
  messages: Message[];
  loading: boolean;
  error: string | null;
}

const initialState: MessagesState = {
  messages: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async () => {
    const response = await fetch('/api/messages');
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    return response.json();
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (message: { content: string; type: 'user' | 'ai'; metadata?: string }) => {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
    return response.json();
  }
);

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.messages = [];
      state.error = null;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      // Add message only if it doesn't already exist
      const exists = state.messages.some(msg => msg.id === action.payload.id);
      if (!exists) {
        state.messages.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action: PayloadAction<Message[]>) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch messages';
      })
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action: PayloadAction<Message>) => {
        state.loading = false;
        // Add message only if it doesn't already exist
        const exists = state.messages.some(msg => msg.id === action.payload.id);
        if (!exists) {
          state.messages.push(action.payload);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to send message';
      });
  },
});

export const { clearMessages, addMessage } = messageSlice.actions;
export default messageSlice.reducer;
