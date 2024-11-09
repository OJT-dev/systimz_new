import { store } from "@/store";
import { Avatar, User } from "./prisma";
import { Session } from "next-auth";
import { Toast } from "./toast";

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export interface UIState {
  toast: Toast | null;
  isLoading: boolean;
}

export interface AuthState {
  session: Session | null;
  isLoading: boolean;
}

export interface AvatarState {
  avatars: Avatar[];
  currentAvatar: Avatar | null;
  isLoading: boolean;
  error: string | null;
}
