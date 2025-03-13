// src/pages/settings/team.js
import React, { useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../../contexts/AuthContext';
import SettingsNavigation from '../../components/settings/SettingsNavigation';
import Card from '../../components/common/Card';

export default function TeamPage() {
  const { user, isLoading } = useContext(AuthContext);
  const router = useRouter();
  
  // Protect this route - redirect to login if not authenticated
  React.useEffect(() => {
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
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-64 flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>
          <SettingsNavigation />
        </div>
        
        <div className="flex-1 md:ml-8">
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Team Management</h2>
          
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                Team Management Coming Soon
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                We're building features to invite team members, assign roles, and manage 
                permissions. This will allow for collaborative time tracking and reporting.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}