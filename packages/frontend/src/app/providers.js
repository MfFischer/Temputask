'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import Layout from '../components/layout/Layout';

export function Providers({ children, initialSession }) {
  const [supabaseClient] = useState(() => createClientComponentClient());

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={initialSession}
    >
      <AuthProvider>
        <NotificationProvider>
          <Layout>{children}</Layout>
        </NotificationProvider>
      </AuthProvider>
    </SessionContextProvider>
  );
}