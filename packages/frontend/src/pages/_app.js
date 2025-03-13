// src/pages/_app.js
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { TimeTrackingProvider } from '../contexts/TimeTrackingContext';
import { FocusProvider } from '../contexts/FocusContext'; // Add this import
import Layout from '../components/layout/Layout';
import '../styles/globals.css';
import '../styles/dark-mode-fixes.css';

function MyApp({ Component, pageProps }) {
  const [supabaseClient, setSupabaseClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    try {
      // Check if Supabase env vars are available
      if (
        process.env.NEXT_PUBLIC_SUPABASE_URL && 
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        console.log('Supabase environment variables found');
        const client = createClientComponentClient();
        setSupabaseClient(client);
      } else {
        console.error('Supabase environment variables not found');
      }
    } catch (error) {
      console.error('Error initializing Supabase client:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }
  
  if (!supabaseClient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-xl text-red-600 mb-4">Supabase configuration error</div>
        <div className="text-gray-600 max-w-md text-center">
          Please ensure your environment variables are correctly set:
          <ul className="list-disc mt-2 ml-6 text-left">
            <li>NEXT_PUBLIC_SUPABASE_URL</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
          </ul>
        </div>
      </div>
    );
  }
  
  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <AuthProvider>
        <TimeTrackingProvider>
          <NotificationProvider>
            <FocusProvider> {/* Add the FocusProvider here */}
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </FocusProvider>
          </NotificationProvider>
        </TimeTrackingProvider>
      </AuthProvider>
    </SessionContextProvider>
  );
}

export default MyApp;