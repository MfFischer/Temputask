
import React, { useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../../contexts/AuthContext';
import CompanyProfile from '../../components/settings/CompanyProfile';
import SettingsNavigation from '../../components/settings/SettingsNavigation';

export default function CompanyProfilePage() {
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
          <CompanyProfile />
        </div>
      </div>
    </div>
  );
}