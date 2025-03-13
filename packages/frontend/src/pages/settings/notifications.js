import React, { useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../../contexts/AuthContext';
import SettingsNavigation from '../../components/settings/SettingsNavigation';
import Card from '../../components/common/Card';

export default function NotificationsPage() {
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
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Notification Settings</h2>
          
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                Notification Settings Coming Soon
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                We're working on notification preferences for email alerts, 
                in-app notifications, and reminders. Check back soon!
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}