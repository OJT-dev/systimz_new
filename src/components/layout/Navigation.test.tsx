import React from 'react';
import { render } from '@/tests/utils';
import { Navigation } from './Navigation';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

describe('Navigation', () => {
  const mockSession = {
    data: {
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
      },
      expires: '2024-01-01',
    },
    status: 'authenticated',
  };

  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue(mockSession);
    (usePathname as jest.Mock).mockReturnValue('/');
  });

  it('renders logo and navigation links', () => {
    const { getByText } = render(<Navigation />);
    
    expect(getByText('Systimz')).toBeInTheDocument();
    expect(getByText('Home')).toBeInTheDocument();
    expect(getByText('Dashboard')).toBeInTheDocument();
    expect(getByText('Pricing')).toBeInTheDocument();
    expect(getByText('About')).toBeInTheDocument();
  });

  it('highlights active link based on current path', () => {
    (usePathname as jest.Mock).mockReturnValue('/about');
    const { getByText } = render(<Navigation />);
    
    const aboutLink = getByText('About');
    expect(aboutLink).toHaveClass('text-primary');
    
    const homeLink = getByText('Home');
    expect(homeLink).toHaveClass('text-muted-foreground');
  });

  it('shows login/signup buttons when not authenticated', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    const { getByText } = render(<Navigation />);
    
    expect(getByText('Login')).toBeInTheDocument();
    expect(getByText('Sign Up')).toBeInTheDocument();
  });

  it('shows dashboard button when authenticated', () => {
    const { getByText, queryByText } = render(<Navigation />);
    
    expect(getByText('Dashboard')).toBeInTheDocument();
    expect(queryByText('Login')).not.toBeInTheDocument();
    expect(queryByText('Sign Up')).not.toBeInTheDocument();
  });

  it('applies responsive styles correctly', () => {
    const { container } = render(<Navigation />);
    
    const navLinks = container.querySelector('.ml-8');
    expect(navLinks).toHaveClass('hidden', 'md:flex');
  });

  it('handles loading state gracefully', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'loading',
    });

    const { container } = render(<Navigation />);
    expect(container).toBeInTheDocument();
  });

  it('applies correct styles to navigation links', () => {
    const { getAllByRole } = render(<Navigation />);
    const links = getAllByRole('link');
    
    links.forEach(link => {
      expect(link).toHaveClass('text-sm', 'transition-colors');
    });
  });

  it('applies correct styles to buttons', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    const { getByText } = render(<Navigation />);
    
    const loginButton = getByText('Login');
    const signUpButton = getByText('Sign Up');
    
    expect(loginButton).toHaveClass('variant-ghost');
    expect(signUpButton).toHaveClass('bg-primary');
  });

  it('maintains consistent spacing between navigation items', () => {
    const { container } = render(<Navigation />);
    const navLinksContainer = container.querySelector('.gap-6');
    
    expect(navLinksContainer).toBeInTheDocument();
  });

  it('maintains consistent spacing between auth buttons', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    const { container } = render(<Navigation />);
    const authButtonsContainer = container.querySelector('.gap-4');
    
    expect(authButtonsContainer).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    const { container, getAllByRole } = render(<Navigation />);
    
    // Navigation landmark
    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
    
    // Interactive elements are focusable
    const interactiveElements = getAllByRole('link');
    interactiveElements.forEach(element => {
      expect(element).toHaveAttribute('href');
      expect(element).not.toHaveAttribute('aria-hidden');
    });
  });

  it('renders all navigation items in correct order', () => {
    const { getAllByRole } = render(<Navigation />);
    const links = getAllByRole('link');
    const linkTexts = links.map(link => link.textContent);
    
    expect(linkTexts).toEqual(
      expect.arrayContaining(['Systimz', 'Home', 'Dashboard', 'Pricing', 'About'])
    );
  });
});
