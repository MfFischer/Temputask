import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Card from '../components/common/Card';

export default function SuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  
  // Countdown effect
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 5000);
    
    const interval = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [router]);

  return (
    <>
      <Head>
        <title>Subscription Success - Tempu Task</title>
        <meta name="description" content="Thank you for subscribing to Tempu Task premium" />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <svg 
                className="h-12 w-12 text-green-600 dark:text-green-400" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Subscription Successful!
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Thank you for subscribing to Tempu Task Premium. Your account has been upgraded and all premium features are now available.
          </p>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              What's Next?
            </h2>
            <ul className="space-y-3 text-left">
              <li className="flex items-start">
                <svg 
                  className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                <span className="text-gray-600 dark:text-gray-400">Explore advanced insights and productivity recommendations</span>
              </li>
              <li className="flex items-start">
                <svg 
                  className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                <span className="text-gray-600 dark:text-gray-400">Set up custom project tracking for detailed reports</span>
              </li>
              <li className="flex items-start">
                <svg 
                  className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                <span className="text-gray-600 dark:text-gray-400">Check out your optimal schedule recommendations</span>
              </li>
            </ul>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Redirecting to dashboard in {countdown} seconds...
          </p>
          
          <div className="mt-6">
            <button
              className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              onClick={() => router.push('/dashboard')}
            >
              Go to Dashboard Now
            </button>
          </div>
          
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            <p>
              Need help? <a href="/support" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">Contact our support team</a>
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}