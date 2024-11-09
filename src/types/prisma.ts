export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN"
}

export interface Avatar {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  imageUrl?: string | null; // Added from avatarSlice interface
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  emailVerified: Date | null;
  image: string | null;
  avatars: Avatar[];
  createdAt: Date;
  updatedAt: Date;
}
