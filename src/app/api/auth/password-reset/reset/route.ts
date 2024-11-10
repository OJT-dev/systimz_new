import { NextRequest } from 'next/server';
import { createClient } from '@vercel/postgres';
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
  const client = createClient();
  try {
    await client.connect();

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
    const { rows: [resetToken] } = await client.query(
      'SELECT * FROM password_reset_tokens WHERE token = $1',
      [token]
    );

    if (!resetToken) {
      return new Response(
        JSON.stringify({
          error: 'Invalid or expired token',
        }),
        { status: 400 }
      );
    }

    // Check if token has expired
    if (new Date() > new Date(resetToken.expires)) {
      // Clean up expired token
      await client.query(
        'DELETE FROM password_reset_tokens WHERE token = $1',
        [token]
      );

      return new Response(
        JSON.stringify({
          error: 'Token has expired. Please request a new password reset.',
        }),
        { status: 400 }
      );
    }

    try {
      // Start transaction
      await client.query('BEGIN');

      // Hash new password
      const hashedPassword = await hash(password, 12);

      // Update user's password
      await client.query(
        'UPDATE users SET password = $1 WHERE id = $2',
        [hashedPassword, resetToken.user_id]
      );

      // Delete used token
      await client.query(
        'DELETE FROM password_reset_tokens WHERE token = $1',
        [token]
      );

      // Commit transaction
      await client.query('COMMIT');

      return new Response(
        JSON.stringify({
          message: 'Password has been reset successfully',
        }),
        { status: 200 }
      );
    } catch (error) {
      // Rollback transaction
      await client.query('ROLLBACK');

      // Check if token was already used (concurrent reset attempts)
      const { rows: [tokenStillExists] } = await client.query(
        'SELECT * FROM password_reset_tokens WHERE token = $1',
        [token]
      );

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
  } finally {
    await client.end();
  }
}
