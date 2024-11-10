import { NextRequest } from 'next/server';
import { createClient } from '@vercel/postgres';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const client = createClient();
  try {
    await client.connect();

    // Get token from query parameters
    const searchParams = new URL(req.url).searchParams;
    const token = searchParams.get('token')?.trim();

    if (!token) {
      return new Response(
        JSON.stringify({
          error: 'Token is required',
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Find verification token
    const { rows } = await client.query(
      'SELECT * FROM verification_tokens WHERE token = $1',
      [token]
    );

    const verificationToken = rows[0];

    if (!verificationToken) {
      return new Response(
        JSON.stringify({
          error: 'Invalid verification token',
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Check if token has expired
    if (new Date() > new Date(verificationToken.expires)) {
      // Clean up expired token
      await client.query(
        'DELETE FROM verification_tokens WHERE token = $1',
        [token]
      );

      return new Response(
        JSON.stringify({
          error: 'Token has expired. Please request a new verification email.',
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    try {
      // Start transaction
      await client.query('BEGIN');

      // Verify email
      await client.query(
        'UPDATE users SET email_verified = NOW() WHERE id = $1',
        [verificationToken.identifier]
      );

      // Delete used token
      await client.query(
        'DELETE FROM verification_tokens WHERE token = $1',
        [token]
      );

      // Commit transaction
      await client.query('COMMIT');

      return new Response(
        JSON.stringify({
          message: 'Email verified successfully',
        }),
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    } catch (error) {
      // Rollback transaction
      await client.query('ROLLBACK');

      // Check if token was already used (concurrent verification attempts)
      const { rows: [tokenStillExists] } = await client.query(
        'SELECT * FROM verification_tokens WHERE token = $1',
        [token]
      );

      if (!tokenStillExists) {
        return new Response(
          JSON.stringify({
            error: 'Token has already been used',
          }),
          { 
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
      }

      // Check if email was already verified
      const { rows: [user] } = await client.query(
        'SELECT email_verified FROM users WHERE id = $1',
        [verificationToken.identifier]
      );

      if (user && user.email_verified) {
        return new Response(
          JSON.stringify({
            error: 'Email has already been verified',
          }),
          { 
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
      }

      throw error;
    }
  } catch (error) {
    console.error('Email verification error:', error);
    return new Response(
      JSON.stringify({
        error: 'Email verification failed. Please try again later.',
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  } finally {
    await client.end();
  }
}
