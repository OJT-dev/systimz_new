import { NextRequest } from 'next/server';
import { createClient } from '@vercel/postgres';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Validation schemas
const createMessageSchema = z.object({
  content: z.string().min(1, 'Content is required').trim(),
  type: z.enum(['user', 'ai'], {
    errorMap: () => ({ message: 'Type must be either "user" or "ai"' }),
  }),
  metadata: z.string().optional().nullable(),
});

const paginationSchema = z.object({
  page: z.coerce.number().min(1, 'Page must be greater than 0'),
  limit: z.coerce.number().min(1, 'Limit must be greater than 0').max(100),
});

// Rate limiting: 5 messages per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5;

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
    const result = createMessageSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: result.error.issues[0].message,
        }),
        { status: 400 }
      );
    }

    const { content, type, metadata } = result.data;

    // Check rate limiting
    const { rows: [{ count }] } = await client.query(
      'SELECT COUNT(*) FROM messages WHERE user_id = $1 AND created_at > NOW() - INTERVAL \'1 minute\'',
      [session.user.id]
    );

    if (parseInt(count) >= RATE_LIMIT_MAX) {
      return new Response(
        JSON.stringify({
          error: `Rate limit exceeded. Please wait before sending more messages.`,
        }),
        { status: 429 }
      );
    }

    // Create message
    const { rows: [message] } = await client.query(
      'INSERT INTO messages (content, type, metadata, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [content, type, metadata, session.user.id]
    );

    return new Response(
      JSON.stringify({
        message,
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Create message error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to create message. Please try again later.',
      }),
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}

export async function GET(request: NextRequest) {
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

    // Parse pagination parameters
    const searchParams = new URL(request.url).searchParams;
    const paginationResult = paginationSchema.safeParse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    });

    if (!paginationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid pagination parameters',
        }),
        { status: 400 }
      );
    }

    const { page, limit } = paginationResult.data;
    const offset = (page - 1) * limit;

    // Get messages with pagination
    const [{ rows: messages }, { rows: [{ count: totalMessages }] }] = await Promise.all([
      client.query(
        'SELECT * FROM messages WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
        [session.user.id, limit, offset]
      ),
      client.query(
        'SELECT COUNT(*) FROM messages WHERE user_id = $1',
        [session.user.id]
      )
    ]);

    const totalPages = Math.ceil(parseInt(totalMessages) / limit);

    return new Response(
      JSON.stringify({
        messages,
        pagination: {
          currentPage: page,
          totalPages,
          totalMessages: parseInt(totalMessages),
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
    console.error('Fetch messages error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch messages. Please try again later.',
      }),
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}

export async function DELETE(request: NextRequest) {
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

    // Get message ID from query parameters
    const searchParams = new URL(request.url).searchParams;
    const messageId = searchParams.get('id');

    if (!messageId) {
      return new Response(
        JSON.stringify({
          error: 'Message ID is required',
        }),
        { status: 400 }
      );
    }

    // Delete message
    await client.query(
      'DELETE FROM messages WHERE id = $1 AND user_id = $2',
      [messageId, session.user.id]
    );

    return new Response(
      JSON.stringify({
        message: 'Message deleted successfully',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Delete message error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to delete message. Please try again later.',
      }),
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}
