import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { z } from 'zod';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

// Rate limiting
const rateLimits = new Map<string, { attempts: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function isRateLimited(email: string): boolean {
  const now = Date.now();
  const userAttempts = rateLimits.get(email);

  // Clean up old entries
  if (userAttempts && now - userAttempts.lastAttempt > WINDOW_MS) {
    rateLimits.delete(email);
    return false;
  }

  return userAttempts ? userAttempts.attempts >= MAX_ATTEMPTS : false;
}

function recordLoginAttempt(email: string) {
  const now = Date.now();
  const userAttempts = rateLimits.get(email);

  if (!userAttempts) {
    rateLimits.set(email, { attempts: 1, lastAttempt: now });
  } else if (now - userAttempts.lastAttempt > WINDOW_MS) {
    rateLimits.set(email, { attempts: 1, lastAttempt: now });
  } else {
    rateLimits.set(email, {
      attempts: userAttempts.attempts + 1,
      lastAttempt: now,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: result.error.issues[0].message,
        }),
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Check rate limiting
    if (isRateLimited(email)) {
      return new Response(
        JSON.stringify({
          error: 'Too many login attempts. Please try again later.',
        }),
        { status: 429 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      recordLoginAttempt(email);
      return new Response(
        JSON.stringify({
          error: 'Invalid credentials',
        }),
        { status: 401 }
      );
    }

    // Check email verification
    if (!user.emailVerified) {
      return new Response(
        JSON.stringify({
          error: 'Please verify your email before logging in',
        }),
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      recordLoginAttempt(email);
      return new Response(
        JSON.stringify({
          error: 'Invalid credentials',
        }),
        { status: 401 }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({
        error: 'Login failed. Please try again later.',
      }),
      { status: 500 }
    );
  }
}
