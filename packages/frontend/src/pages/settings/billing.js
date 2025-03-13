import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../../contexts/AuthContext';
import SettingsNavigation from '../../components/settings/SettingsNavigation';
import Card from '../../components/common/Card';
import { ClockIcon } from '@heroicons/react/24/outline';

// Placeholder API call (to be replaced with real backend integration)
const getTrialDaysLeft = () => {
  // Simulate trial end date (30 days from signup)
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 30);
  const daysLeft = Math.ceil((trialEnd - new Date()) / (1000 * 60 * 60 * 24));
  return daysLeft > 0 ? daysLeft : 0;
};

export default function BillingPage() {
  const { user, isLoading } = useContext(AuthContext);
  const router = useRouter();
  const [daysLeft, setDaysLeft] = useState(30); // Default to 30 days for new users

  // Fetch trial days on mount (replace with real API call later)
  useEffect(() => {
    if (user) {
      setDaysLeft(getTrialDaysLeft());
    }
  }, [user]);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-64 flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>
          <SettingsNavigation />
        </div>

        <div className="flex-1 md:ml-8">
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Billing & Subscription</h2>

          <Card className="p-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ClockIcon className="h-16 w-16 text-indigo-600 mb-4" />

              {daysLeft > 0 ? (
                <>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    30-Day Free Trial
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mb-4">
                    You're currently on a free trial with {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining. Unlock premium features like advanced insights and detailed reports!
                  </p>
                  <button
                    className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => router.push('/upgrade')} // Route to upgrade page
                  >
                    Upgrade Now
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    Subscription Plans
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mb-4">
                    Your trial has ended. Choose a plan to continue using Tempu Task's premium features.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Monthly</span>
                      <span className="font-bold text-gray-900 dark:text-white">$5.99/month</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Annual (Save 8%)</span>
                      <span className="font-bold text-gray-900 dark:text-white">$65.88/year</span>
                    </div>
                    <button
                      className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 mt-4"
                      onClick={() => router.push('/upgrade')} // Route to upgrade page
                    >
                      Subscribe Now
                    </button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}