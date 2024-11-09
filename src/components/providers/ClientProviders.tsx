'use client';

import { SessionProvider } from 'next-auth/react';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/store';
import { Toast } from '@/components/ui/toast';

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ReduxProvider store={store}>
        {children}
        <Toast />
      </ReduxProvider>
    </SessionProvider>
  );
}
