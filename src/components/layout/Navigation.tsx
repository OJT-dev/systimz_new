'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import React from 'react';

type NavItem = {
  readonly label: string;
  readonly href: string;
};

const navItems: readonly NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
] as const;

interface NavLinkProps {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}

// Memoized navigation link component
const NavLink = React.memo(function NavLink({ href, isActive, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'text-sm transition-colors hover:text-primary',
        isActive ? 'text-primary' : 'text-muted-foreground'
      )}
    >
      {children}
    </Link>
  );
});

NavLink.displayName = 'NavLink';

interface AuthButtonsProps {
  session: Session | null;
}

// Memoized auth buttons component
const AuthButtons = React.memo(function AuthButtons({ session }: AuthButtonsProps) {
  if (session) {
    return (
      <Link href="/dashboard">
        <Button>Dashboard</Button>
      </Link>
    );
  }

  return (
    <>
      <Link href="/auth/login">
        <Button variant="ghost">Login</Button>
      </Link>
      <Link href="/auth/signup">
        <Button>Sign Up</Button>
      </Link>
    </>
  );
});

AuthButtons.displayName = 'AuthButtons';

export const Navigation = React.memo(function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession({
    required: false
  });

  const navLinks = React.useMemo(() => (
    navItems.map((item) => (
      <NavLink
        key={item.href}
        href={item.href}
        isActive={pathname === item.href}
      >
        {item.label}
      </NavLink>
    ))
  ), [pathname]);

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <Link href="/" className="font-bold text-xl">
          Systimz
        </Link>

        <div className="ml-8 hidden md:flex gap-6">
          {navLinks}
        </div>

        <div className="ml-auto flex items-center gap-4">
          <AuthButtons session={session} />
        </div>
      </div>
    </nav>
  );
});

Navigation.displayName = 'Navigation';
