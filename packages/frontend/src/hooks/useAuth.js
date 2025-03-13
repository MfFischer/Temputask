import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

export function useAuth() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const user = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sign in with email and password
  const signIn = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      // Redirect to dashboard on success
      router.push('/');
    } catch (err) {
      console.error('Error signing in:', err);
      setError(err.message || 'An error occurred during sign in');
      return false;
    } finally {
      setIsLoading(false);
    }
    
    return true;
  };
  
  // Sign up with email and password
  const signUp = async (email, password, metadata = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...metadata,
            consented_at: new Date().toISOString(),
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      // Show success message and redirect to login
      // We don't redirect to dashboard here because email confirmation might be required
      return true;
    } catch (err) {
      console.error('Error signing up:', err);
      setError(err.message || 'An error occurred during sign up');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Sign out
  const signOut = async () => {
    setIsLoading(true);
    
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err.message || 'An error occurred during sign out');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset password
  const resetPassword = async (email) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(err.message || 'An error occurred during password reset');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update user metadata
  const updateProfile = async (data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.updateUser({
        data,
      });
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'An error occurred updating profile');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check if user is authenticated (useful for protected routes)
  const isAuthenticated = useCallback(() => {
    return !!user;
  }, [user]);

  return {
    user,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    isAuthenticated,
  };
}