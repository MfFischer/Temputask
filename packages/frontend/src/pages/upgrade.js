import { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Head from 'next/head';

export default function UpgradePage() {
  const { user, isLoading } = useContext(AuthContext);
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle plan selection
  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  // Handle subscribe button click
  const handleSubscribe = async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      // For now, just simulate a successful subscription
      // When you implement Stripe, this will be replaced with a fetch call
      setTimeout(() => {
        router.push('/success');
      }, 1500);
      
      // Later you'll use fetch instead of axios:
      /*
      const response = await fetch('/api/subscriptions/createCheckoutSession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan === 'monthly' ? 'price_1Monthly' : 'price_1Annual',
          successUrl: `${window.location.origin}/success`,
          cancelUrl: `${window.location.origin}/upgrade`
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'An error occurred');
      }
      */
      
    } catch (error) {
      console.error('Error initiating subscription:', error);
      alert('Unable to process subscription. Please try again.');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600 dark:text-gray-400">
          Please log in to upgrade your plan.
        </p>
        <button 
          className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg" 
          onClick={() => router.push('/auth/login')}
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Upgrade to Premium - Tempu Task</title>
        <meta name="description" content="Upgrade to Tempu Task premium for advanced productivity features" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">
            Upgrade to Premium
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Unlock the full potential of Tempu Task with our premium features.
          </p>

          {/* Plan Selection */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Monthly Plan */}
            <Card 
              className={`p-6 border-2 transition-all cursor-pointer ${
                selectedPlan === 'monthly' 
                  ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              onClick={() => handlePlanSelect('monthly')}
            >
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Monthly</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Flexible month-to-month billing</p>
                  </div>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-indigo-600">
                    {selectedPlan === 'monthly' && (
                      <div className="h-3 w-3 rounded-full bg-indigo-600"></div>
                    )}
                  </div>
                </div>
                
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">$5.99</span>
                  <span className="text-gray-600 dark:text-gray-400">/month</span>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-auto">
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-600 dark:text-gray-400 text-sm">All premium features</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-600 dark:text-gray-400 text-sm">Cancel anytime</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Annual Plan */}
            <Card 
              className={`p-6 border-2 transition-all cursor-pointer relative ${
                selectedPlan === 'annual' 
                  ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              onClick={() => handlePlanSelect('annual')}
            >
              <div className="absolute -top-4 -right-4 bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                SAVE 8%
              </div>
              
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Annual</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Best value yearly billing</p>
                  </div>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-indigo-600">
                    {selectedPlan === 'annual' && (
                      <div className="h-3 w-3 rounded-full bg-indigo-600"></div>
                    )}
                  </div>
                </div>
                
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">$65.88</span>
                  <span className="text-gray-600 dark:text-gray-400">/year</span>
                  <div className="text-sm text-green-600 dark:text-green-400 mt-1">Save $5.88 compared to monthly</div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-auto">
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-600 dark:text-gray-400 text-sm">All premium features</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-600 dark:text-gray-400 text-sm">Priority support</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* Subscribe Button */}
          <div className="text-center mb-10">
            <button
              onClick={handleSubscribe}
              disabled={isProcessing}
              className="bg-indigo-600 text-white py-3 px-8 rounded-lg text-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {isProcessing ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  Processing...
                </>
              ) : (
                `Subscribe ${selectedPlan === 'monthly' ? 'Monthly' : 'Annually'}`
              )}
            </button>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Secure payment processed by Stripe
            </p>
          </div>

          {/* Premium Features */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
              Premium Features
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-5">
                <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Advanced Insights</h3>
                <p className="text-gray-600 dark:text-gray-400">Gain deep insights into your productivity patterns with AI-powered analytics.</p>
              </Card>
              
              <Card className="p-5">
                <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Flow State Detection</h3>
                <p className="text-gray-600 dark:text-gray-400">Identify when you're in the zone and optimize your schedule for peak performance.</p>
              </Card>
              
              <Card className="p-5">
                <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Professional Reports</h3>
                <p className="text-gray-600 dark:text-gray-400">Generate detailed reports for clients with customized branding and export options.</p>
              </Card>
              
              <Card className="p-5">
                <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Optimal Scheduling</h3>
                <p className="text-gray-600 dark:text-gray-400">Get AI-generated daily schedules based on your productivity patterns.</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}