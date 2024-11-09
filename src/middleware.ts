import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Authentication middleware that protects routes by requiring a valid session.
 * Protected routes include:
 * - /dashboard
 * - /avatar/*
 * - /api/avatars/*
 */
export default withAuth(
  function middleware(_req: NextRequest) {
    // Currently just passing through since withAuth handles the auth check
    // Additional middleware logic can be added here if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      // Only allow access if there's a valid token
      authorized: ({ token }) => !!token,
    },
    pages: {
      // Redirect to login page when unauthorized
      signIn: "/auth/login",
    },
  }
);

// Configure which routes are protected by the middleware
export const config = {
  matcher: [
    "/dashboard",
    "/avatar/:path*",
    "/api/avatars/:path*",
  ],
};
