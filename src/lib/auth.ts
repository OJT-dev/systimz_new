import { NextAuthOptions } from "next-auth";
import { createClient } from "@vercel/postgres";
import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN"
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          console.error('Missing credentials');
          return null;
        }

        const client = createClient();
        try {
          await client.connect();

          const { rows } = await client.query(
            'SELECT * FROM users WHERE email = $1',
            [credentials.email]
          );

          const user = rows[0];

          if (!user?.password) {
            console.error('User not found or no password');
            return null;
          }

          if (!user.email_verified) {
            console.error('Email not verified');
            throw new Error("Please verify your email before logging in");
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValidPassword) {
            console.error('Invalid password');
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as UserRole,
            image: user.image
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        } finally {
          await client.end();
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: UserRole.USER
        };
      }
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          role: UserRole.USER
        };
      }
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "github") {
        const client = createClient();
        try {
          await client.connect();

          // Check if user exists
          const { rows } = await client.query(
            'SELECT * FROM users WHERE email = $1',
            [user.email]
          );

          if (rows.length === 0) {
            // Create new user
            await client.query(
              'INSERT INTO users (name, email, image, role, email_verified) VALUES ($1, $2, $3, $4, NOW())',
              [user.name, user.email, user.image, UserRole.USER]
            );
          }

          return true;
        } catch (error) {
          console.error('OAuth sign in error:', error);
          return false;
        } finally {
          await client.end();
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as UserRole;
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      const productionUrl = process.env.NEXT_PUBLIC_APP_URL || baseUrl;
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${productionUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === productionUrl) return url;
      return productionUrl;
    }
  }
};
