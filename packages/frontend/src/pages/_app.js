// src/pages/_app.js
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { TimeTrackingProvider } from '../contexts/TimeTrackingContext';
import { FocusProvider } from '../contexts/FocusContext';
import Layout from '../components/layout/Layout';
import '../styles/globals.css';
import '../styles/dark-mode-fixes.css';

function MyApp({ Component, pageProps }) {
  const [supabaseClient, setSupabaseClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Add a timeout to prevent infinite loading
    const initTimeout = setTimeout(() => {
      if (isLoading) {
        console.log('Supabase initialization timeout reached, forcing completion');
        setIsLoading(false);
        
        // Create a fallback client if needed
        if (!supabaseClient && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          try {
            const client = createClientComponentClient();
            setSupabaseClient(client);
          } catch (error) {
            console.error('Error creating fallback Supabase client:', error);
          }
        }
      }
    }, 3000);
    
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
        
        // For static exports, try to continue without Supabase
        if (process.env.NEXT_PUBLIC_EXPORT === 'true') {
          console.log('Static export detected, continuing without Supabase');
          // Set a minimal client or null
          setSupabaseClient(null);
        }
      }
    } catch (error) {
      console.error('Error initializing Supabase client:', error);
    } finally {
      setIsLoading(false);
    }
    
    return () => clearTimeout(initTimeout);
  }, []);
  
  // Enhanced loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600 dark:text-gray-400 mb-4">Loading Tempu Task...</div>
        <div className="text-sm text-gray-500">Initializing application</div>
      </div>
    );
  }
  
  // For static exports, provide a fallback when Supabase is not available
  if (!supabaseClient && process.env.NEXT_PUBLIC_EXPORT === 'true') {
    return (
      <AuthProvider>
        <TimeTrackingProvider>
          <NotificationProvider>
            <FocusProvider>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </FocusProvider>
          </NotificationProvider>
        </TimeTrackingProvider>
      </AuthProvider>
    );
  }
  
  // Show error for missing Supabase configuration in development
  if (!supabaseClient && process.env.NEXT_PUBLIC_EXPORT !== 'true') {
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
  
  // Normal flow with Supabase available
  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <AuthProvider>
        <TimeTrackingProvider>
          <NotificationProvider>
            <FocusProvider>
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