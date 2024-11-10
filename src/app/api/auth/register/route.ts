import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@vercel/postgres';

export const runtime = 'edge';

// Validation schema
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function generateToken(): Promise<string> {
  const tokenBuffer = new Uint8Array(32);
  crypto.getRandomValues(tokenBuffer);
  return Array.from(tokenBuffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function POST(req: NextRequest) {
  const client = createClient();
  try {
    await client.connect();

    // Parse and validate request body
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: result.error.issues[0].message,
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    const { name, email, password } = result.data;

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return new Response(
        JSON.stringify({
          error: 'Email already registered',
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await client.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );

    // Create verification token
    const token = await generateToken();
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // Token expires in 24 hours

    await client.query(
      'INSERT INTO verification_tokens (identifier, token, expires) VALUES ($1, $2, $3)',
      [user.rows[0].id, token, expires.toISOString()]
    );

    // Get the current hostname from the request
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host') || '';
    const baseUrl = `${protocol}://${host}`;

    // Generate verification URL using current hostname
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`;

    // Return success response with verification URL
    return new Response(
      JSON.stringify({
        user: {
          id: user.rows[0].id,
          name: user.rows[0].name,
          email: user.rows[0].email,
        },
        message: 'Registration successful. Please verify your email.',
        verificationUrl,
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(
      JSON.stringify({
        error: 'User registration failed. Please try again later.',
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
