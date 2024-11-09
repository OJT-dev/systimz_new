import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/useToast';
import AvatarStudioPage from './page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock useToast hook
jest.mock('@/hooks/useToast', () => ({
  useToast: jest.fn(),
}));

describe('AvatarStudioPage', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockSession = {
    data: {
      user: {
        id: 'user-1',
        name: 'Test User',
      },
    },
    status: 'authenticated',
  };

  const mockShowToast = jest.fn();

  const mockAvatar = {
    id: 'avatar-1',
    name: 'Test Avatar',
    description: 'Test Description',
    imageUrl: 'test-image.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSession as jest.Mock).mockReturnValue(mockSession);
    (useToast as jest.Mock).mockReturnValue({ showToast: mockShowToast });
    global.fetch = jest.fn();
  });

  it('renders loading state initially', () => {
    const { getByText } = render(<AvatarStudioPage params={{ id: 'avatar-1' }} />);
    expect(getByText('Loading studio...')).toBeInTheDocument();
  });

  it('fetches and displays avatar data', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockAvatar),
    });

    const { getByText } = render(<AvatarStudioPage params={{ id: 'avatar-1' }} />);

    await waitFor(() => {
      expect(getByText(mockAvatar.name)).toBeInTheDocument();
      expect(getByText(mockAvatar.description)).toBeInTheDocument();
    });
  });

  it('handles fetch error correctly', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<AvatarStudioPage params={{ id: 'avatar-1' }} />);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Failed to load avatar', 'error');
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('handles non-ok response correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    render(<AvatarStudioPage params={{ id: 'avatar-1' }} />);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Failed to load avatar', 'error');
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('navigates back to dashboard when exit button is clicked', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockAvatar),
    });

    const { getByText } = render(<AvatarStudioPage params={{ id: 'avatar-1' }} />);

    await waitFor(() => {
      const exitButton = getByText('Exit Studio');
      fireEvent.click(exitButton);
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('displays placeholder content for upcoming features', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockAvatar),
    });

    const { getByText } = render(<AvatarStudioPage params={{ id: 'avatar-1' }} />);

    await waitFor(() => {
      expect(getByText('Avatar Studio - Coming Soon')).toBeInTheDocument();
      expect(getByText('Voice Settings')).toBeInTheDocument();
      expect(getByText('Appearance')).toBeInTheDocument();
      expect(getByText('Behavior')).toBeInTheDocument();
    });
  });

  it('handles missing avatar description gracefully', async () => {
    const avatarWithoutDescription = { ...mockAvatar, description: null };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(avatarWithoutDescription),
    });

    const { getByText, queryByText } = render(<AvatarStudioPage params={{ id: 'avatar-1' }} />);

    await waitFor(() => {
      expect(getByText(avatarWithoutDescription.name)).toBeInTheDocument();
      expect(queryByText('Test Description')).not.toBeInTheDocument();
    });
  });

  it('requires authentication', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<AvatarStudioPage params={{ id: 'avatar-1' }} />);

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('displays not found message when avatar is null', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(null),
    });

    const { getByText } = render(<AvatarStudioPage params={{ id: 'avatar-1' }} />);

    await waitFor(() => {
      expect(getByText('Avatar not found')).toBeInTheDocument();
    });
  });

  it('has proper accessibility attributes', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockAvatar),
    });

    const { container } = render(<AvatarStudioPage params={{ id: 'avatar-1' }} />);

    await waitFor(() => {
      // Main heading
      const heading = container.querySelector('h1');
      expect(heading).toHaveTextContent(mockAvatar.name);

      // Section headings
      const sectionHeadings = container.querySelectorAll('h3');
      expect(sectionHeadings).toHaveLength(3);
      sectionHeadings.forEach(heading => {
        expect(heading).toHaveClass('font-semibold');
      });

      // Interactive elements
      const button = container.querySelector('button');
      expect(button).toHaveAttribute('type');
    });
  });
});
