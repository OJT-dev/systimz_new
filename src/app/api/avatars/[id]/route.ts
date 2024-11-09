import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Validation schema
const updateAvatarSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  description: z.string().optional().nullable().transform(val => val?.trim() || null),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
    const avatar = await prisma.avatar.findUnique({
      where: { id: params.id },
    });

    if (!avatar) {
      return new Response(
        JSON.stringify({
          error: 'Avatar not found',
        }),
        { status: 404 }
      );
    }

    // Check authorization
    if (avatar.userId !== session.user.id) {
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
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
    const avatar = await prisma.avatar.findUnique({
      where: { id: params.id },
    });

    if (!avatar) {
      return new Response(
        JSON.stringify({
          error: 'Avatar not found',
        }),
        { status: 404 }
      );
    }

    // Check authorization
    if (avatar.userId !== session.user.id) {
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
    const updatedAvatar = await prisma.avatar.update({
      where: { id: params.id },
      data: {
        name,
        description,
      },
    });

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
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
    const avatar = await prisma.avatar.findUnique({
      where: { id: params.id },
    });

    if (!avatar) {
      return new Response(
        JSON.stringify({
          error: 'Avatar not found',
        }),
        { status: 404 }
      );
    }

    // Check authorization
    if (avatar.userId !== session.user.id) {
      return new Response(
        JSON.stringify({
          error: 'You are not authorized to delete this avatar',
        }),
        { status: 403 }
      );
    }

    // Delete avatar
    await prisma.avatar.delete({
      where: { id: params.id },
    });

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
  }
}
