import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { hash } from 'bcryptjs';

// Validation schema
const resetSchema = z.object({
  token: z.string().min(1, 'Token is required').trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const result = resetSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: result.error.issues[0].message,
        }),
        { status: 400 }
      );
    }

    const { token, password } = result.data;

    // Find reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return new Response(
        JSON.stringify({
          error: 'Invalid or expired token',
        }),
        { status: 400 }
      );
    }

    // Check if token has expired
    if (new Date() > resetToken.expires) {
      // Clean up expired token
      await prisma.passwordResetToken.delete({
        where: { token },
      });

      return new Response(
        JSON.stringify({
          error: 'Token has expired. Please request a new password reset.',
        }),
        { status: 400 }
      );
    }

    try {
      // Hash new password
      const hashedPassword = await hash(password, 12);

      // Update user's password
      await prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      });

      // Delete used token
      await prisma.passwordResetToken.delete({
        where: { token },
      });

      return new Response(
        JSON.stringify({
          message: 'Password has been reset successfully',
        }),
        { status: 200 }
      );
    } catch (error) {
      // Check if token was already used (concurrent reset attempts)
      const tokenStillExists = await prisma.passwordResetToken.findUnique({
        where: { token },
      });

      if (!tokenStillExists) {
        return new Response(
          JSON.stringify({
            error: 'Token has already been used',
          }),
          { status: 400 }
        );
      }

      throw error; // Re-throw other errors
    }
  } catch (error) {
    console.error('Password reset error:', error);
    return new Response(
      JSON.stringify({
        error: 'Password reset failed. Please try again later.',
      }),
      { status: 500 }
    );
  }
}
