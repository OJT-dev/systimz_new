import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import ClientProviders from '@/components/providers/ClientProviders';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Systimz - Enterprise AI Assistant',
  description: 'Enterprise-ready AI chat platform with visual avatar representation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders>
          <Navigation />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
