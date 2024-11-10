import { NextRequest } from 'next/server';
import { createClient } from '@vercel/postgres';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Validation schema
const updateAvatarSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  description: z.string().optional().nullable().transform((val: string | null | undefined) => val?.trim() || null),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get avatar
    const { rows: [avatar] } = await client.query(
      'SELECT * FROM avatars WHERE id = $1',
      [params.id]
    );

    if (!avatar) {
      return new Response(
        JSON.stringify({
          error: 'Avatar not found',
        }),
        { status: 404 }
      );
    }

    // Check authorization
    if (avatar.user_id !== session.user.id) {
      return new Response(
        JSON.stringify({
          error: 'You are not authorized to access this avatar',
        }),
        { status: 403 }
      );
    }

    return new Response(
      JSON.stringify({
        avatar,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Fetch avatar error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch avatar. Please try again later.',
      }),
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get avatar
    const { rows: [avatar] } = await client.query(
      'SELECT * FROM avatars WHERE id = $1',
      [params.id]
    );

    if (!avatar) {
      return new Response(
        JSON.stringify({
          error: 'Avatar not found',
        }),
        { status: 404 }
      );
    }

    // Check authorization
    if (avatar.user_id !== session.user.id) {
      return new Response(
        JSON.stringify({
          error: 'You are not authorized to update this avatar',
        }),
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const result = updateAvatarSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: result.error.issues[0].message,
        }),
        { status: 400 }
      );
    }

    const { name, description } = result.data;

    // Update avatar
    const { rows: [updatedAvatar] } = await client.query(
      'UPDATE avatars SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description, params.id]
    );

    return new Response(
      JSON.stringify({
        avatar: updatedAvatar,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Update avatar error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to update avatar. Please try again later.',
      }),
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get avatar
    const { rows: [avatar] } = await client.query(
      'SELECT * FROM avatars WHERE id = $1',
      [params.id]
    );

    if (!avatar) {
      return new Response(
        JSON.stringify({
          error: 'Avatar not found',
        }),
        { status: 404 }
      );
    }

    // Check authorization
    if (avatar.user_id !== session.user.id) {
      return new Response(
        JSON.stringify({
          error: 'You are not authorized to delete this avatar',
        }),
        { status: 403 }
      );
    }

    // Delete avatar
    await client.query(
      'DELETE FROM avatars WHERE id = $1',
      [params.id]
    );

    return new Response(
      JSON.stringify({
        message: 'Avatar deleted successfully',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Delete avatar error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to delete avatar. Please try again later.',
      }),
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}
