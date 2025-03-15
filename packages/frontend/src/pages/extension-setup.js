import React, { useState, useEffect } from 'react';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

export default function ExtensionSetupPage() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const user = useUser();
  
  const [step, setStep] = useState(1);
  const [extensionInstalled, setExtensionInstalled] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('pending'); // 'pending', 'connecting', 'connected', 'failed'
  const [isPageMounted, setIsPageMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Effect to ensure page stays mounted and handle initial loading
  useEffect(() => {
    setIsPageMounted(true);
    // Short delay to ensure auth is loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => {
      setIsPageMounted(false);
      clearTimeout(timer);
    };
  }, []);
  
  // Browser detection
  const getBrowser = () => {
    if (typeof window === 'undefined') return 'unknown';
    
    const userAgent = window.navigator.userAgent.toLowerCase();
    
    if (userAgent.indexOf('firefox') > -1) {
      return 'firefox';
    } else if (userAgent.indexOf('edg') > -1) {
      return 'edge';
    } else if (userAgent.indexOf('chrome') > -1) {
      return 'chrome';
    } else if (userAgent.indexOf('safari') > -1) {
      return 'safari';
    } else {
      return 'unknown';
    }
  };
  
  const browser = getBrowser();
  
  // Get extension store URL
  const getExtensionUrl = () => {
    switch (browser) {
      case 'chrome':
        return 'https://chrome.google.com/webstore/detail/tempos-ai/[extension-id]';
      case 'firefox':
        return 'https://addons.mozilla.org/en-US/firefox/addon/tempos-ai/';
      case 'edge':
        return 'https://microsoftedge.microsoft.com/addons/detail/tempos-ai/[extension-id]';
      default:
        return null;
    }
  };
  
  // Handle extension installation check
  const checkExtensionInstalled = () => {
    // In a real implementation, you'd check for the extension using a custom protocol
    // For this example, we'll simulate installation
    setExtensionInstalled(true);
    setStep(2);
  };
  
  // Generate an authentication token for the extension
  const generateAuthToken = () => {
    // This would be an actual token generation in production
    return 'ext_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };
  
  // Connect to the extension
  const connectExtension = async () => {
    if (!user) return;
    
    // Show connecting state
    setConnectionStatus('connecting');
    
    try {
      // In a real implementation, this would communicate with the extension
      // For this example, we'll simulate a successful connection
      const authToken = generateAuthToken();
      
      // Example: Store the extension token and status in user metadata
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          extension_installed: true,
          extension_token: authToken
        });
      
      if (error) {
        console.error('Error storing extension token:', error);
        setConnectionStatus('failed');
        return;
      }
      
      // Simulate a short delay for better UX
      setTimeout(() => {
        setConnectionStatus('connected');
        setStep(3);
      }, 1500);
    } catch (err) {
      console.error('Error connecting extension:', err);
      setConnectionStatus('failed');
    }
  };
  
  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };
  
  // Handle going to dashboard
  const goToDashboard = () => {
    router.push('/');
  };
  
  // If loading, show a spinner
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  // If not authenticated, show login prompt
  if (!isAuthenticated() && isPageMounted) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Browser Extension Setup</h1>
        
        <Card>
          <div className="p-6">
            <div className="text-center py-8">
              <span className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full inline-flex mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Login Required</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Please log in to your Tempu Task account before setting up the extension.
              </p>
              <div className="mt-6">
                <Button onClick={() => router.push('/auth/login')}>
                  Log In
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Browser Extension Setup</h1>
      
      <div className="mb-8">
        <div className="flex mb-8">
          <div className={`flex-1 border-t-2 pt-4 ${step >= 1 ? 'border-indigo-500 dark:border-indigo-400' : 'border-gray-200 dark:border-gray-700'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              1
            </div>
            <div className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">Install Extension</div>
          </div>
          <div className={`flex-1 border-t-2 pt-4 ${step >= 2 ? 'border-indigo-500 dark:border-indigo-400' : 'border-gray-200 dark:border-gray-700'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              2
            </div>
            <div className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">Connect Account</div>
          </div>
          <div className={`flex-1 border-t-2 pt-4 ${step >= 3 ? 'border-indigo-500 dark:border-indigo-400' : 'border-gray-200 dark:border-gray-700'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 3 ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              3
            </div>
            <div className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">Ready to Track</div>
          </div>
        </div>
      </div>
      
      {step === 1 && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-5 text-gray-900 dark:text-white flex items-center">
              <span className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </span>
              Step 1: Install the Browser Extension
            </h2>
            
            {browser === 'unknown' ? (
              <div className="bg-yellow-100 dark:bg-yellow-900/20 p-4 rounded-md mb-6">
                <p className="text-yellow-800 dark:text-yellow-200">
                  We couldn't detect your browser. Please install the extension from one of the following stores:
                </p>
              </div>
            ) : null}
            
            <div className="mb-8">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The Tempu Task extension enhances your experience by tracking site activity to provide more accurate productivity insights.
              </p>
              
              <div className="bg-gray-50 dark:bg-slate-800 p-5 rounded-md mb-6">
                <h3 className="font-medium mb-3 text-gray-900 dark:text-white">The extension will:</h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                  <li>Track which websites you visit and for how long</li>
                  <li>Categorize websites as productive or distracting</li>
                  <li>Provide detailed site usage reports</li>
                  <li>Only track when you're actively using your browser</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 dark:bg-slate-800 p-5 rounded-md">
                <h3 className="font-medium mb-3 text-gray-900 dark:text-white">Privacy commitments:</h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                  <li>We <strong>never</strong> capture the content of your browsing</li>
                  <li>All data is visible only to you</li>
                  <li>You can delete your data at any time</li>
                  <li>You can disable tracking with one click</li>
                </ul>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4">
              {getExtensionUrl() ? (
                <Button 
                  onClick={() => window.open(getExtensionUrl(), '_blank')}
                  className="flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Install for {browser.charAt(0).toUpperCase() + browser.slice(1)}
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button onClick={() => window.open('https://chrome.google.com/webstore/detail/tempos-ai/[extension-id]', '_blank')}>
                    Chrome
                  </Button>
                  <Button onClick={() => window.open('https://addons.mozilla.org/en-US/firefox/addon/tempos-ai/', '_blank')}>
                    Firefox
                  </Button>
                  <Button onClick={() => window.open('https://microsoftedge.microsoft.com/addons/detail/tempos-ai/[extension-id]', '_blank')}>
                    Edge
                  </Button>
                </div>
              )}
              
              <Button 
                variant="outline" 
                onClick={checkExtensionInstalled}
              >
                I've Installed the Extension
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {step === 2 && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-5 text-gray-900 dark:text-white flex items-center">
              <span className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              Step 2: Connect Your Account
            </h2>
            
            <div className="mb-8">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Connect your Tempu Task account to the browser extension to sync your activity data.
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-md mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      You're currently logged in as: <strong>{user?.email || 'User'}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              
              <Button 
                onClick={connectExtension}
                disabled={connectionStatus === 'connecting'}
              >
                {connectionStatus === 'connecting' ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </span>
                ) : 'Connect Account'}
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {step === 3 && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-5 text-gray-900 dark:text-white flex items-center">
              <span className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              Step 3: Ready to Track!
            </h2>
            
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Extension Connected Successfully!</h3>
              
              <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Your browser activity will now be tracked and synced with your Tempu Task account. Check your dashboard for insights.
              </p>
            </div>
            
            <div className="mt-6 bg-gray-50 dark:bg-slate-800 p-5 rounded-md">
              <h3 className="font-medium mb-3 text-gray-900 dark:text-white">Next steps:</h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li>Browse normally - the extension works in the background</li>
                <li>Your site activity data will appear in your reports within minutes</li>
                <li>You can customize tracking settings from the extension icon</li>
                <li>Visit your dashboard to see combined insights from manual tracking and site activity</li>
              </ul>
            </div>
            
            <div className="mt-8 flex justify-center">
              <Button onClick={goToDashboard}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}