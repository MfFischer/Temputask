import { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const supabase = useSupabaseClient();
  const supabaseUser = useUser();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  // Set user based on Supabase user hook
  useEffect(() => {
    if (supabaseUser) {
      setUser(supabaseUser);
      setIsLoading(false);
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, [supabaseUser]);

  // Listen for auth state changes and handle route protection
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
        setIsLoading(false);
        
        // Handle route protection based on auth state
        const path = router.pathname;
        
        // Define protected routes that require authentication
        const protectedRoutes = [
          '/dashboard', 
          '/focus', 
          '/projects', 
          '/reports',
          '/insights',
          '/settings'
        ];
        
        // Define auth routes (login/signup pages)
        const authRoutes = ['/auth/login', '/auth/signup'];
        
        if (session?.user) {
          // User is authenticated
          if (authRoutes.includes(path)) {
            // Redirect from auth pages to dashboard when logged in
            router.push('/dashboard');
          } else if (path === '/') {
            // Redirect from homepage to dashboard when logged in
            router.push('/dashboard');
          }
          // Stay on current route if it's already a protected or public page
        } else {
          // User is not authenticated
          if (protectedRoutes.includes(path)) {
            // Redirect to login if trying to access protected routes
            router.push('/auth/login');
          }
          // Stay on current route if it's an auth route or public page
        }
      }
    );
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [supabase.auth, router]);

  // Sign in with email/password
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { data: null, error };
    }
  };

  // Sign up with email/password
  const signUp = async (email, password, userData = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { data: null, error };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // After signout, the auth state change will handle redirect
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}