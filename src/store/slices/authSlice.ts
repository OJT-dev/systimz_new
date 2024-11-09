import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Session } from "next-auth";

interface AuthState {
  session: Session | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  session: null,
  isLoading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<Session | null>) => {
      state.session = action.payload;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearSession: (state) => {
      state.session = null;
      state.isLoading = false;
    },
  },
});

export const { setSession, setLoading, clearSession } = authSlice.actions;
export default authSlice.reducer;
