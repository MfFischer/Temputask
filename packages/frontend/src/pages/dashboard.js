// src/pages/dashboard.js
import { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../contexts/AuthContext';
import Dashboard from '../components/dashboard/Dashboard';

export default function DashboardPage() {
  const { user, isLoading } = useContext(AuthContext);
  const router = useRouter();
  
  // Protect this route - redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }
  
  // Don't render anything while redirecting
  if (!user) {
    return null;
  }
  
  // User is authenticated, render the dashboard
  return <Dashboard />;
}