import React, { useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../../contexts/AuthContext';
import SettingsNavigation from '../../components/settings/SettingsNavigation';
import Card from '../../components/common/Card';

export default function IntegrationsPage() {
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
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Integrations</h2>
          
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                Integrations Coming Soon
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                We're working on integrations with popular tools like calendar apps, 
                project management software, and accounting platforms. Stay tuned!
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}