'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import TimerWidget from './TimerWidget';
import DailyReport from './DailyReport';
import PeakHourCard from './PeakHourCard';
import AvgTimeCard from './AvgTimeCard';
import InsightCard from './InsightCard';
import FocusTimer from '../focus/FocusTimer';
import ConsentPopup from '../common/ConsentPopup';

export default function Dashboard() {
  const user = useUser();
  const router = useRouter();
  const [showConsent, setShowConsent] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  // Check authentication
  useEffect(() => {
    let isMounted = true;
    
    // Give a short delay to ensure auth state is loaded
    const timer = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
        if (!user) {
          router.push('/');
        }
      }
    }, 500);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [user, router]);

  // Fetch subscription data
  useEffect(() => {
    async function fetchSubscription() {
      if (!user) return;
      
      try {
        const response = await fetch('/api/subscriptions/getUserSubscription');
        if (response.ok) {
          const data = await response.json();
          setSubscription(data);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setSubscriptionLoading(false);
      }
    }
    
    fetchSubscription();
  }, [user]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  // If somehow still not authenticated after loading check
  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Trial Period Banner */}
      {!subscriptionLoading && subscription?.status === 'trialing' && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 border border-indigo-100 dark:border-indigo-800 rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <span className="bg-indigo-100 dark:bg-indigo-800 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Premium Trial</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {subscription.daysLeft > 0 
                    ? `${subscription.daysLeft} days remaining in your trial` 
                    : 'Your trial ends today'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => router.push('/upgrade')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm transition-colors duration-150 ease-in-out shadow-sm"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <TimerWidget />
          <DailyReport />
          {/* Only include InsightCard if it exists */}
          {typeof InsightCard !== 'undefined' && <InsightCard />}
        </div>
        
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-5 text-gray-900 dark:text-white flex items-center">
              <span className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              Focus Timer
            </h2>
            <FocusTimer />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
              <PeakHourCard />
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
              <AvgTimeCard />
            </div>
          </div>
        </div>
      </div>
      
      {showConsent && <ConsentPopup onClose={() => setShowConsent(false)} />}
    </div>
  );
}