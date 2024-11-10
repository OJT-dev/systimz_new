import { NextRequest } from 'next/server';
import { createClient } from '@vercel/postgres';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Validation schema
const createAvatarSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  description: z.string().optional().nullable().transform((val: string | null | undefined) => val?.trim() || null),
});

export async function POST(request: NextRequest) {
  const client = createClient();
  try {
    await client.connect();

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(
        JSON.stringify({
          error: 'Unauthorized',
        }),
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const result = createAvatarSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: result.error.issues[0].message,
        }),
        { status: 400 }
      );
    }

    const { name, description } = result.data;

    // Create avatar
    const { rows: [avatar] } = await client.query(
      'INSERT INTO avatars (name, description, user_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description, session.user.id]
    );

    return new Response(
      JSON.stringify({
        avatar,
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Create avatar error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to create avatar. Please try again later.',
      }),
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}

export async function GET() {
  const client = createClient();
  try {
    await client.connect();

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(
        JSON.stringify({
          error: 'Unauthorized',
        }),
        { status: 401 }
      );
    }

    // Get user's avatars
    const { rows: avatars } = await client.query(
      'SELECT * FROM avatars WHERE user_id = $1 ORDER BY created_at DESC',
      [session.user.id]
    );

    return new Response(
      JSON.stringify({
        avatars,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Fetch avatars error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch avatars. Please try again later.',
      }),
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}
