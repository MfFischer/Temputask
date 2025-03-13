import { useState, useContext, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { AuthContext } from '../contexts/AuthContext';
import Dashboard from '../components/dashboard/Dashboard';
import FeatureCarousel from '../components/common/FeatureCarousel';
import ReportsFeatureShowcase from '../components/common/ReportsFeatureShowcase';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function Home() {
  // Add useEffect for global styling
  useEffect(() => {
    // Apply styles to html and body to eliminate white space
    document.documentElement.style.backgroundColor = 'black';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    
    document.body.style.backgroundColor = 'black';
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100%';
    
    // Clean up function to restore default styles
    return () => {
      document.documentElement.style.backgroundColor = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
      
      document.body.style.backgroundColor = '';
      document.body.style.margin = '';
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, []);

  const { user, isLoading, signIn, signUp } = useContext(AuthContext);

  // Form state
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If loading, show loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-xl text-gray-300">Loading...</div>
      </div>
    );
  }

  // If user is logged in, redirect to /dashboard
  if (user) {
    return <Dashboard />;
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (authMode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        const { error } = await signUp(email, password);
        if (error) throw error;
        alert('Account created! Please check your email to confirm your account.');
        setAuthMode('login');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Tempu Task - AI-Powered Productivity & Time Tracking</title>
        <meta name="description" content="Tempu Task helps you take control of your time with AI-powered productivity tracking, flow state detection, and personalized work insights. Try it free for 30 days!" />
        <meta name="keywords" content="time tracking, productivity app, focus timer, AI productivity, work insights, free trial" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://temputask.com/" />
        <meta property="og:title" content="Tempu Task - AI-Powered Productivity" />
        <meta property="og:description" content="Transform how you work with AI-powered time tracking and productivity insights. Try it free for 30 days!" />
        <meta property="og:image" content="https://temputask.com/images/temputask-preview.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Tempu Task - AI-Powered Productivity" />
        <meta name="twitter:description" content="Transform how you work with AI-powered time tracking and productivity insights. Try it free for 30 days!" />
        <meta name="twitter:image" content="https://temputask.com/images/temputask-preview.png" />
        <link rel="canonical" href="https://temputask.com/" />
        <style jsx global>{`
          html, body {
            background-color: black;
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden;
          }
          #__next {
            height: 100%;
            overflow: hidden;
            background-color: black;
          }
        `}</style>
      </Head>

      <div className="flex flex-col md:flex-row bg-black text-white h-screen max-h-screen overflow-hidden">
        {/* Header - visible on mobile only */}
        <header className="md:hidden p-6 flex items-center">
          <Image src="/icons/logo.svg" alt="Tempu Task Logo" width={40} height={40} className="mr-3" priority />
          <span className="text-xl font-bold tracking-wider">Tempu Task</span>
        </header>

        {/* Left side: Content - Scrollable */}
        <main className="w-full md:w-2/3 p-8 md:p-16 flex flex-col overflow-y-auto">
          <div className="hidden md:flex items-center mb-16">
            <Image src="/icons/logo.svg" alt="Tempu Task Logo" width={40} height={40} className="mr-3" priority />
            <span className="text-xl font-bold tracking-wider">Tempu Task</span>
          </div>

          <div className="my-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
              Take Control with<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600">AI-Powered Productivity,</span><br />
              Your Way
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mb-12">
              Easily track your tasks, identify distractions, and unlock powerful insights to transform how you spend your day.
            </p>

            {/* Feature Carousel */}
            <section aria-labelledby="features-heading" className="mb-12">
              <h2 id="features-heading" className="sr-only">Key Features</h2>
              <FeatureCarousel />
            </section>

            {/* Reports Feature Showcase */}
            <section aria-labelledby="reports-heading" className="mb-12">
              <h2 id="reports-heading" className="sr-only">Reporting Features</h2>
              <ReportsFeatureShowcase />
            </section>

            {/* Trial and Pricing Section */}
            <section aria-labelledby="pricing-heading" className="mb-12">
              <h2 id="pricing-heading" className="sr-only">Pricing and Trial</h2>
              <div className="bg-gray-900/40 rounded-xl border border-gray-800 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Start for Free</h3>
                <p className="text-gray-300 mb-4">
                  Try Tempu Task with a <span className="font-semibold">30-day free trial</span> and unlock all premium features. No credit card required!
                </p>
                <div className="space-y-2 mb-4">
                  <p className="text-gray-300">After your trial:</p>
                  <p className="text-gray-100 font-medium">Monthly: $5.99/month</p>
                  <p className="text-gray-100 font-medium">Annual: $65.88/year (Save 8%)</p>
                </div>
                <button
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={() => setAuthMode('signup')}
                >
                  Start Free Trial
                </button>
              </div>
            </section>

            {/* Testimonials or social proof */}
            <div className="mt-10 p-6 border border-gray-800 rounded-xl bg-gradient-to-br from-gray-900 to-black">
              <p className="text-gray-300 italic">
                "Since using Tempu Task, I've gained back 2 hours of productive time daily and finally understand my work patterns."
              </p>
              <div className="mt-4 flex items-center">
                <div className="w-10 h-10 rounded-full bg-indigo-700 flex items-center justify-center text-white font-bold">
                  AJ
                </div>
                <div className="ml-3">
                  <p className="text-white font-medium">Alex Johnson</p>
                  <p className="text-gray-400 text-sm">Product Designer</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Vertical divider line */}
        <div className="hidden md:block w-px bg-white/20 self-stretch"></div>

        {/* Right side: Authentication - Fixed position with controlled height */}
        <aside className="w-full md:w-1/3 md:fixed md:right-0 md:top-0 md:bottom-0 md:h-screen flex items-center justify-center p-8 bg-black overflow-y-auto">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white">
                {authMode === 'login' ? 'Sign in to Tempu Task' : 'Create your account'}
              </h2>
              <p className="text-gray-400 mt-2">
                Master your time, amplify productivity, understand your habits.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-900 text-white"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-900 text-white"
                  placeholder="••••••••"
                />
              </div>

              {authMode === 'signup' && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-900 text-white"
                    placeholder="••••••••"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 mt-6"
              >
                {loading ? 'Please wait...' : authMode === 'login' ? 'Sign in' : 'Create account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'signup' : 'login');
                    setError(null);
                  }}
                  className="text-indigo-400 hover:text-indigo-300 hover:underline focus:outline-none"
                >
                  {authMode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 pt-6 border-t border-gray-800">
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-1" />
                  <span className="text-xs text-gray-400">Secure</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-1" />
                  <span className="text-xs text-gray-400">Privacy-focused</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-1" />
                  <span className="text-xs text-gray-400">No credit card</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}