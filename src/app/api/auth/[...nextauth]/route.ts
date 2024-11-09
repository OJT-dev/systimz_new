import NextAuth from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Configure for Node.js runtime
export const runtime = 'nodejs';

// Create and export the route handler
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
