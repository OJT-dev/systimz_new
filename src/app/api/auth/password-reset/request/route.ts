import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

// Validation schema
const requestSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
});

// Rate limiting: 15 minutes between requests
const RATE_LIMIT_MINUTES = 15;

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const result = requestSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: result.error.issues[0].message,
        }),
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal user existence, but don't proceed if user doesn't exist
    if (!user) {
      return new Response(
        JSON.stringify({
          message: 'If an account exists with this email, a password reset link will be sent.',
        }),
        { status: 200 }
      );
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return new Response(
        JSON.stringify({
          error: 'Please verify your email before requesting a password reset.',
        }),
        { status: 400 }
      );
    }

    // Clean up expired tokens
    await prisma.passwordResetToken.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    });

    // Check rate limiting
    const recentToken = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        createdAt: {
          gt: new Date(Date.now() - RATE_LIMIT_MINUTES * 60 * 1000),
        },
      },
    });

    if (recentToken) {
      return new Response(
        JSON.stringify({
          error: `Please wait ${RATE_LIMIT_MINUTES} minutes before requesting another reset.`,
        }),
        { status: 429 }
      );
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // Token expires in 1 hour

    // Create reset token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expires,
      },
    });

    // TODO: Send password reset email
    // This would typically be handled by an email service

    return new Response(
      JSON.stringify({
        message: 'If an account exists with this email, a password reset link will be sent.',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Password reset request error:', error);
    return new Response(
      JSON.stringify({
        error: 'Password reset request failed. Please try again later.',
      }),
      { status: 500 }
    );
  }
}
