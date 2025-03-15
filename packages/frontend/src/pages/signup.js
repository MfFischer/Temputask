import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { signUp, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated() && !isLoading) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (!email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!consent) {
      setError('You must agree to the Privacy Policy');
      return;
    }

    try {
      const success = await signUp(email, password, { consented: true });
      if (success) {
        setSuccess(true);
        // After a delay, redirect to login
        setTimeout(() => {
          router.push('/login');
        }, 5000);
      }
    } catch (err) {
      setError('Signup failed. Please try again.');
    }
  };

  return (
    <>
      <Head>
        <title>Signup - Tempu Task</title>
        <meta name="description" content="Create a Tempu Task account to start tracking your productivity with AI-powered tools." />
        <style jsx global>{`
          html,
          body {
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
      <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="flex justify-center">
              <img src="/icons/logo.svg" alt="Tempu Task" className="h-12 w-auto" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-300">
              Or{' '}
              <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
                sign in to your existing account
              </Link>
            </p>
          </div>

          {success ? (
            <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded relative">
              <p>Account created successfully! Please check your email for verification.</p>
              <p className="mt-2">Redirecting to login page...</p>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 bg-gray-800 border border-gray-700 placeholder-gray-400 text-white rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 bg-gray-800 border border-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Password"
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="sr-only">
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 bg-gray-800 border border-gray-700 placeholder-gray-400 text-white rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Confirm Password"
                  />
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded relative">
                  {error}
                </div>
              )}

              <div className="flex items-center">
                <input
                  id="privacy-consent"
                  name="privacy-consent"
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-700 rounded"
                />
                <label htmlFor="privacy-consent" className="ml-2 block text-sm text-gray-300">
                  I agree to the{' '}
                  <Link href="/privacy" className="font-medium text-indigo-400 hover:text-indigo-300">
                    Privacy Policy
                  </Link>{' '}
                  and consent to the collection of my time tracking data.
                </label>
              </div>

              <div>
                <Button
                  type="submit"
                  fullWidth
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isLoading ? 'Creating account...' : 'Create account'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}