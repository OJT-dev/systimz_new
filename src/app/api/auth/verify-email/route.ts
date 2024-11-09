import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Get token from query parameters
    const searchParams = new URL(req.url).searchParams;
    const token = searchParams.get('token')?.trim();

    if (!token) {
      return new Response(
        JSON.stringify({
          error: 'Token is required',
        }),
        { status: 400 }
      );
    }

    // Find verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return new Response(
        JSON.stringify({
          error: 'Invalid verification token',
        }),
        { status: 400 }
      );
    }

    // Check if token has expired
    if (new Date() > verificationToken.expires) {
      // Clean up expired token
      await prisma.verificationToken.delete({
        where: { token },
      });

      return new Response(
        JSON.stringify({
          error: 'Token has expired. Please request a new verification email.',
        }),
        { status: 400 }
      );
    }

    try {
      // Verify email
      await prisma.user.update({
        where: { id: verificationToken.identifier },
        data: { emailVerified: new Date() },
      });

      // Delete used token
      await prisma.verificationToken.delete({
        where: { token },
      });

      return new Response(
        JSON.stringify({
          message: 'Email verified successfully',
        }),
        { status: 200 }
      );
    } catch (error) {
      // Check if token was already used (concurrent verification attempts)
      const tokenStillExists = await prisma.verificationToken.findUnique({
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

      // Check if email was already verified
      if (error instanceof Error && error.message.includes('already verified')) {
        return new Response(
          JSON.stringify({
            error: 'Email has already been verified',
          }),
          { status: 400 }
        );
      }

      throw error; // Re-throw other errors
    }
  } catch (error) {
    console.error('Email verification error:', error);
    return new Response(
      JSON.stringify({
        error: 'Email verification failed. Please try again later.',
      }),
      { status: 500 }
    );
  }
}
