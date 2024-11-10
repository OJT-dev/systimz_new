import { store } from '@/store';
import { Session } from "next-auth";
import { Toast } from "./toast";

export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  password: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

export interface Avatar {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

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
