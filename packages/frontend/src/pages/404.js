import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AppLayout from '../components/layout/AppLayout';

export default function Custom404() {
  const router = useRouter();
  
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // Get the current path
      const path = window.location.pathname;
      
      // List of valid routes in your app
      const validRoutes = ['/dashboard', '/projects', '/companies', '/settings'];
      
      // If the current path is in the valid routes, redirect to index
      // The client-side routing will handle it from there
      if (validRoutes.includes(path)) {
        router.push('/');
      }
    }
  }, [router]);

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <Link href="/" className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
          Go Back Home
        </Link>
      </div>
    </AppLayout>
  );
}