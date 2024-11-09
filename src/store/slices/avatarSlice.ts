import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Avatar {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface AvatarState {
  avatars: Avatar[];
  currentAvatar: Avatar | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AvatarState = {
  avatars: [],
  currentAvatar: null,
  isLoading: false,
  error: null,
};

const avatarSlice = createSlice({
  name: "avatar",
  initialState,
  reducers: {
    setAvatars: (state, action: PayloadAction<Avatar[]>) => {
      state.avatars = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setCurrentAvatar: (state, action: PayloadAction<Avatar | null>) => {
      state.currentAvatar = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addAvatar: (state, action: PayloadAction<Avatar>) => {
      state.avatars.push(action.payload);
      state.isLoading = false;
      state.error = null;
    },
    updateAvatar: (state, action: PayloadAction<Avatar>) => {
      const index = state.avatars.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        state.avatars[index] = action.payload;
      }
      if (state.currentAvatar?.id === action.payload.id) {
        state.currentAvatar = action.payload;
      }
      state.isLoading = false;
      state.error = null;
    },
    removeAvatar: (state, action: PayloadAction<string>) => {
      state.avatars = state.avatars.filter((a) => a.id !== action.payload);
      if (state.currentAvatar?.id === action.payload) {
        state.currentAvatar = null;
      }
      state.isLoading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setAvatars,
  setCurrentAvatar,
  addAvatar,
  updateAvatar,
  removeAvatar,
  setLoading,
  setError,
} = avatarSlice.actions;

export default avatarSlice.reducer;
