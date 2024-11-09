import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

/**
 * Generate a secure access token for HeyGen streaming
 * POST /api/heygen/token
 */
export async function POST() {
  try {
    // Verify user is authenticated
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get HeyGen API key from environment variables
    const apiKey = process.env.HEYGEN_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'HeyGen API key not configured' },
        { status: 500 }
      );
    }

    // Request access token from HeyGen
    const response = await fetch('https://api.heygen.com/v1/streaming.create_token', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || 'Failed to generate token' },
        { status: response.status }
      );
    }

    const { data } = await response.json();
    return NextResponse.json({ token: data.token });

  } catch (error) {
    console.error('Error generating HeyGen token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
